const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { jiraRequest } = require('../lib/jiraClient');

// Estados do workflow de bug do módulo 03: fluxo principal
// New -> Open -> In Progress -> Ready for Retest -> Closed,
// com Reopened, Won't Fix, Duplicate e Cannot Reproduce como desvios.
//
// Open, In Progress, Closed e Reopened já existem como status globais do
// Jira (sistema) e não podem ser recriados (nome duplicado). A API de bulk
// create também não aceita referenciar status existentes diretamente — só
// aceita status que ela mesma cria na mesma chamada. A saída: copiar um
// workflow já existente que use esses 4 status (POST /workflows/copy, que
// preserva as referências antigas do jeito que já é válido) e então usar
// bulk update para adicionar os status novos e substituir as transições.
const REUSED_STATUS_NAMES = ['Open', 'In Progress', 'Closed', 'Reopened'];

const NEW_STATUSES = [
  { key: 'new', name: 'New', statusCategory: 'TODO' },
  { key: 'readyForRetest', name: 'Ready for Retest', statusCategory: 'IN_PROGRESS' },
  { key: 'wontFix', name: "Won't Fix", statusCategory: 'DONE' },
  { key: 'duplicate', name: 'Duplicate', statusCategory: 'DONE' },
  { key: 'cannotReproduce', name: 'Cannot Reproduce', statusCategory: 'DONE' },
];

const WORKFLOW_NAME = 'FIN Bug Workflow';

function directedTransition(id, name, fromRef, toRef, description) {
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
    actions: [],
  };
}

async function findExistingByName(name) {
  const res = await jiraRequest('GET', `/rest/api/3/workflows/search?maxResults=50&workflowName=${encodeURIComponent(name)}`);
  return res.values.find((w) => w.name === name);
}

async function findCopySource() {
  const res = await jiraRequest('GET', '/rest/api/3/workflows/search?maxResults=100');
  const allStatuses = await jiraRequest('GET', '/rest/api/3/statuses/search?maxResults=200');
  const idToName = new Map(allStatuses.values.map((s) => [s.id, s.name]));

  const candidates = res.values
    .filter((w) => /^[0-9a-f-]{36}$/i.test(w.id)) // precisa ser workflow "moderno" (id UUID) para dar copy/update
    .map((w) => ({
      workflow: w,
      names: new Set(w.statuses.map((s) => idToName.get(s.statusReference)).filter(Boolean)),
    }))
    .filter((c) => REUSED_STATUS_NAMES.every((n) => c.names.has(n)))
    .sort((a, b) => a.names.size - b.names.size); // prefere o mais enxuto

  return candidates[0]?.workflow;
}

async function main() {
  const already = await findExistingByName(WORKFLOW_NAME);
  if (already) {
    console.log(`Workflow "${WORKFLOW_NAME}" já existe (id ${already.id}). Nada a fazer.`);
    return;
  }

  const source = await findCopySource();
  if (!source) {
    throw new Error(
      `Não encontrei nenhum workflow no site que já contenha os status ${REUSED_STATUS_NAMES.join(', ')} para copiar. ` +
        'Configure isso manualmente ou ajuste o script.'
    );
  }
  console.log(`Copiando workflow base "${source.name}" (id ${source.id})...`);

  const copyResult = await jiraRequest('POST', '/rest/api/3/workflows/copy', {
    description: 'Base para o FIN Bug Workflow (módulo 03).',
    workflowId: source.id,
    workflowName: WORKFLOW_NAME,
  });

  const copiedWorkflow = copyResult.workflows[0];
  const allStatuses = await jiraRequest('GET', '/rest/api/3/statuses/search?maxResults=200');
  const idToName = new Map(allStatuses.values.map((s) => [s.id, s.name]));
  const nameToId = new Map(allStatuses.values.map((s) => [s.name, s.id]));

  const reusedRefs = {
    open: nameToId.get('Open'),
    inProgress: nameToId.get('In Progress'),
    closed: nameToId.get('Closed'),
    reopened: nameToId.get('Reopened'),
  };

  const newRefs = {};
  for (const s of NEW_STATUSES) newRefs[s.key] = crypto.randomUUID();
  const refs = { ...reusedRefs, ...newRefs };

  const statusesToKeep = copiedWorkflow.statuses.filter((s) => REUSED_STATUS_NAMES.includes(idToName.get(s.statusReference)));

  const allWorkflowStatuses = [
    ...statusesToKeep,
    ...NEW_STATUSES.map((s, i) => ({
      statusReference: refs[s.key],
      layout: { x: 200 + 120 * i, y: 120 },
      properties: {},
    })),
  ];

  const transitions = [
    {
      id: '1',
      name: 'Create',
      description: '',
      type: 'INITIAL',
      toStatusReference: refs.new,
      properties: {},
      triggers: [],
      validators: [],
      actions: [],
      links: [],
    },
    directedTransition(2, 'Triar', refs.new, refs.open, 'Dev/PO aceita como defeito'),
    directedTransition(3, 'Iniciar correção', refs.open, refs.inProgress),
    directedTransition(4, "Recusar (won't fix)", refs.open, refs.wontFix, 'Decisão de negócio: não vamos corrigir'),
    directedTransition(5, 'Marcar como duplicado', refs.open, refs.duplicate),
    directedTransition(6, 'Não reproduzido', refs.open, refs.cannotReproduce),
    directedTransition(7, 'Enviar para reteste', refs.inProgress, refs.readyForRetest),
    directedTransition(8, 'Validar (reteste OK)', refs.readyForRetest, refs.closed, 'Só QA fecha bug'),
    directedTransition(9, 'Reprovar reteste', refs.readyForRetest, refs.reopened),
    directedTransition(10, 'Reiniciar ciclo', refs.reopened, refs.new),
  ];

  // Para reaproveitar um status existente, o campo `id` precisa ser
  // informado além de `statusReference` (achado no schema WorkflowStatusUpdate
  // da OpenAPI spec — não fica claro na doc renderizada).
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

  const updatePayload = {
    statuses: [
      ...reusedStatusCatalog,
      ...NEW_STATUSES.map((s) => ({
        name: s.name,
        description: '',
        statusCategory: s.statusCategory,
        statusReference: refs[s.key],
      })),
    ],
    workflows: [
      {
        id: copiedWorkflow.id,
        description: 'Workflow de bug da prática de QA (finance-api) — módulo 03.',
        startPointLayout: { x: -100, y: -150 },
        statuses: allWorkflowStatuses,
        transitions,
        version: copiedWorkflow.version,
      },
    ],
  };

  console.log(`Atualizando "${WORKFLOW_NAME}" com ${NEW_STATUSES.length} status novos e ${transitions.length} transições...`);
  const updateResult = await jiraRequest('POST', '/rest/api/3/workflows/update', updatePayload);

  if (updateResult.taskId) {
    console.log(`Task assíncrona ${updateResult.taskId} — aguardando conclusão...`);
    await waitForTask(updateResult.taskId);
  }

  const updated = updateResult.workflows[0];
  console.log(`Workflow atualizado: id ${updated.id}, nome "${updated.name}"`);

  const statePath = path.join(__dirname, '..', 'state', 'bug-workflow.json');
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(
    statePath,
    JSON.stringify(
      {
        workflowName: WORKFLOW_NAME,
        workflowId: copiedWorkflow.id,
        statuses: [
          ...REUSED_STATUS_NAMES.map((n) => ({ name: n, id: nameToId.get(n) })),
          ...NEW_STATUSES.map((s) => ({ name: s.name, id: refs[s.key] })),
        ],
      },
      null,
      2
    )
  );
  console.log(`Salvo em ${path.relative(process.cwd(), statePath)}`);
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

main().catch((err) => {
  console.error(err.message);
  if (err.body) console.error(JSON.stringify(err.body, null, 2));
  process.exit(1);
});
