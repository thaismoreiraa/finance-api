const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { jiraRequest, loadConfig } = require('../lib/jiraClient');

// Workflow de Story com etapa de validação da QA:
// To Do -> In Progress -> In QA -> Done, com In QA -> In Progress quando a
// QA reprova e devolve pro dev.
//
// O workflow padrão do projeto (Software Simplified Workflow for Project FIN)
// só tem To Do / In Progress / Done com transições globais — qualquer status
// vai pra qualquer outro, e não existe "In QA". Ele também é usado por
// Task/Sub-task/Epic, então em vez de editá-lo, copiamos ele (mesma técnica
// do script 02 — o copy preserva as referências aos status existentes),
// adicionamos o status In QA e associamos o novo workflow só ao tipo Story.
//
// A coluna IN QA do board precisa receber o status novo na mão (Board
// settings > Columns): a API pública não edita o mapeamento de colunas.
const REUSED_STATUS_NAMES = ['To Do', 'In Progress', 'Done'];
const NEW_STATUS = { name: 'In QA', statusCategory: 'IN_PROGRESS' };

const WORKFLOW_NAME = 'FIN Story Workflow';
const STORY_ISSUE_TYPE_NAME = 'Story';
const DONE_RESOLUTION_ID = '10000'; // mesma resolution que o workflow padrão usa no Done

function resolutionAction(value) {
  return {
    ruleKey: 'system:update-field',
    parameters: { field: 'resolution', value, mode: '' },
  };
}

function directedTransition(id, name, fromRef, toRef, description, actions) {
  return {
    id: String(id),
    name,
    description: description || '',
    type: 'DIRECTED',
    toStatusReference: toRef,
    links: [{ fromStatusReference: fromRef, fromPort: 0, toPort: 1 }],
    properties: {},
    triggers: [],
    validators: [],
    actions: actions || [],
  };
}

async function findWorkflowByName(name) {
  const res = await jiraRequest('GET', `/rest/api/3/workflows/search?maxResults=50&workflowName=${encodeURIComponent(name)}`);
  return res.values.find((w) => w.name === name);
}

async function waitForTask(taskId) {
  for (let i = 0; i < 30; i++) {
    const task = await jiraRequest('GET', `/rest/api/3/task/${taskId}`);
    if (task.status === 'COMPLETE') return task;
    if (task.status === 'FAILED' || task.status === 'CANCELLED') {
      throw new Error(`Task ${taskId} terminou com status ${task.status}: ${JSON.stringify(task.result || {})}`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Task ${taskId} não terminou a tempo.`);
}

async function createWorkflow(config) {
  const already = await findWorkflowByName(WORKFLOW_NAME);
  if (already) {
    console.log(`Workflow "${WORKFLOW_NAME}" já existe (id ${already.id}).`);
    return;
  }

  const sourceName = `Software Simplified Workflow for Project ${config.projectKey}`;
  const source = await findWorkflowByName(sourceName);
  if (!source) throw new Error(`Workflow base "${sourceName}" não encontrado.`);
  console.log(`Copiando workflow base "${source.name}" (id ${source.id})...`);

  const copyResult = await jiraRequest('POST', '/rest/api/3/workflows/copy', {
    description: 'Base para o FIN Story Workflow.',
    workflowId: source.id,
    workflowName: WORKFLOW_NAME,
  });
  const copiedWorkflow = copyResult.workflows[0];

  const allStatuses = await jiraRequest('GET', '/rest/api/3/statuses/search?maxResults=200');
  const nameToId = new Map(allStatuses.values.map((s) => [s.name, s.id]));

  const refs = {
    toDo: nameToId.get('To Do'),
    inProgress: nameToId.get('In Progress'),
    done: nameToId.get('Done'),
    inQa: crypto.randomUUID(),
  };

  const statuses = [
    ...copiedWorkflow.statuses,
    { statusReference: refs.inQa, layout: { x: 400, y: 120 }, properties: {} },
  ];

  const transitions = [
    {
      id: '1',
      name: 'Create',
      description: '',
      type: 'INITIAL',
      toStatusReference: refs.toDo,
      properties: {},
      triggers: [],
      validators: [],
      actions: [],
      links: [],
    },
    directedTransition(2, 'Iniciar desenvolvimento', refs.toDo, refs.inProgress, 'Dev começa a story', [resolutionAction('')]),
    directedTransition(3, 'Entregar para QA', refs.inProgress, refs.inQa, 'Dev libera a build pra validação', [resolutionAction('')]),
    directedTransition(4, 'Aprovar (validação OK)', refs.inQa, refs.done, 'QA validou os critérios de aceite', [
      resolutionAction(DONE_RESOLUTION_ID),
    ]),
    directedTransition(5, 'Devolver para dev', refs.inQa, refs.inProgress, 'QA reprovou — volta pro dev', [resolutionAction('')]),
  ];

  // Status reaproveitado precisa de `id` além de `statusReference` (ver script 02).
  const reusedStatusCatalog = REUSED_STATUS_NAMES.map((name) => {
    const src = allStatuses.values.find((s) => s.name === name);
    return {
      id: src.id,
      name: src.name,
      description: src.description || '',
      statusCategory: src.statusCategory,
      statusReference: src.id,
    };
  });

  console.log(`Atualizando "${WORKFLOW_NAME}" com o status "${NEW_STATUS.name}" e ${transitions.length} transições...`);
  const updateResult = await jiraRequest('POST', '/rest/api/3/workflows/update', {
    statuses: [
      ...reusedStatusCatalog,
      { name: NEW_STATUS.name, description: '', statusCategory: NEW_STATUS.statusCategory, statusReference: refs.inQa },
    ],
    workflows: [
      {
        id: copiedWorkflow.id,
        description: 'Workflow de story da prática de QA (finance-api) — com etapa In QA.',
        startPointLayout: { x: -100, y: -150 },
        statuses,
        transitions,
        version: copiedWorkflow.version,
      },
    ],
  });
  if (updateResult.taskId) {
    console.log(`Task assíncrona ${updateResult.taskId} — aguardando conclusão...`);
    await waitForTask(updateResult.taskId);
  }
  console.log(`Workflow criado: id ${copiedWorkflow.id}`);

  const statePath = path.join(__dirname, '..', 'state', 'story-workflow.json');
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify({ workflowName: WORKFLOW_NAME, workflowId: copiedWorkflow.id }, null, 2));
  console.log(`Salvo em ${path.relative(process.cwd(), statePath)}`);
}

async function assignToStory(config) {
  const project = await jiraRequest('GET', `/rest/api/3/project/${config.projectKey}?expand=issueTypes`);
  const storyType = project.issueTypes.find((t) => t.name === STORY_ISSUE_TYPE_NAME);
  if (!storyType) throw new Error(`Issue type "${STORY_ISSUE_TYPE_NAME}" não encontrado no projeto ${config.projectKey}.`);

  const [scheme] = await jiraRequest('POST', '/rest/api/3/workflowscheme/read', { projectIds: [String(project.id)] });
  if (!scheme) throw new Error(`Não encontrei workflow scheme para o projeto ${config.projectKey}.`);

  const currentMapping = (scheme.workflowsForIssueTypes || []).find((m) => m.workflow.name === WORKFLOW_NAME);
  if (currentMapping && currentMapping.issueTypeIds.includes(storyType.id)) {
    console.log(`Issue type "${STORY_ISSUE_TYPE_NAME}" já está mapeado para "${WORKFLOW_NAME}".`);
    return;
  }

  console.log(`Scheme "${scheme.name}" (id ${scheme.id}) — mapeando "${STORY_ISSUE_TYPE_NAME}" (${storyType.id}) para "${WORKFLOW_NAME}"...`);
  await jiraRequest('PUT', `/rest/api/3/workflowscheme/${scheme.id}/issuetype/${storyType.id}`, {
    issueType: storyType.id,
    workflow: WORKFLOW_NAME,
    updateDraftIfNeeded: true,
  });

  // To Do / In Progress / Done existem nos dois workflows, então as stories
  // atuais não precisam de mapeamento de status pra publicar.
  console.log('Publicando o draft...');
  const publishRes = await jiraRequest('POST', `/rest/api/3/workflowscheme/${scheme.id}/draft/publish`, { statusMappings: [] });
  if (publishRes && publishRes.taskId) await waitForTask(publishRes.taskId);
  console.log('Publicado. O tipo Story agora usa o FIN Story Workflow.');
}

async function main() {
  const config = loadConfig();
  await createWorkflow(config);
  await assignToStory(config);
}

main().catch((err) => {
  console.error(err.message);
  if (err.body) console.error(JSON.stringify(err.body, null, 2));
  process.exit(1);
});
