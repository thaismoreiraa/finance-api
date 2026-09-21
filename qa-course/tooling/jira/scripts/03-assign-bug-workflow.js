const fs = require('node:fs');
const path = require('node:path');
const { jiraRequest, loadConfig } = require('../lib/jiraClient');

const BUG_ISSUE_TYPE_NAME = 'Bug';

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

async function main() {
  const config = loadConfig();
  const statePath = path.join(__dirname, '..', 'state', 'bug-workflow.json');
  if (!fs.existsSync(statePath)) {
    throw new Error('state/bug-workflow.json não existe — rode scripts/02-create-bug-workflow.js primeiro.');
  }
  const { workflowName } = JSON.parse(fs.readFileSync(statePath, 'utf8'));

  const project = await jiraRequest('GET', `/rest/api/3/project/${config.projectKey}?expand=issueTypes`);
  const bugType = project.issueTypes.find((t) => t.name === BUG_ISSUE_TYPE_NAME);
  if (!bugType) throw new Error(`Issue type "${BUG_ISSUE_TYPE_NAME}" não encontrado no projeto ${config.projectKey}.`);

  const [scheme] = await jiraRequest('POST', '/rest/api/3/workflowscheme/read', { projectIds: [String(project.id)] });
  if (!scheme) throw new Error(`Não encontrei workflow scheme para o projeto ${config.projectKey}.`);

  const currentMapping = (scheme.workflowsForIssueTypes || []).find((m) => m.workflow.name === workflowName);
  if (currentMapping && currentMapping.issueTypeIds.includes(bugType.id)) {
    console.log(`Issue type "${BUG_ISSUE_TYPE_NAME}" já está mapeado para "${workflowName}". Nada a fazer.`);
    return;
  }

  console.log(`Scheme "${scheme.name}" (id ${scheme.id}) — mapeando issue type "${BUG_ISSUE_TYPE_NAME}" (${bugType.id}) para o workflow "${workflowName}"...`);

  const result = await jiraRequest(
    'PUT',
    `/rest/api/3/workflowscheme/${scheme.id}/issuetype/${bugType.id}`,
    { issueType: bugType.id, workflow: workflowName, updateDraftIfNeeded: true }
  );
  console.log(`Draft do scheme atualizado (draft: ${result.draft}).`);

  console.log('Publicando o draft...');
  const publishRes = await publishDraft(scheme.id, bugType.id, []);
  if (publishRes && publishRes.taskId) {
    await waitForTask(publishRes.taskId);
  }
  console.log('Publicado. O tipo Bug agora usa o workflow customizado.');
}

async function publishDraft(schemeId, issueTypeId, statusMappings) {
  try {
    return await jiraRequest('POST', `/rest/api/3/workflowscheme/${schemeId}/draft/publish`, { statusMappings });
  } catch (err) {
    // Projeto novo, sem issues de Bug — mas o Jira ainda exige um mapeamento
    // formal dos status antigos (do workflow anterior) para os novos antes
    // de publicar. Mapeia por categoria (TODO->New, DONE->Closed, etc.).
    const missing = err.body?.errorMessages?.[0]?.match(/statuses with IDs ([\d,]+)/);
    if (err.status !== 400 || !missing) throw err;

    const oldIds = missing[1].split(',');
    const allStatuses = await jiraRequest('GET', '/rest/api/3/statuses/search?maxResults=200');
    const byId = new Map(allStatuses.values.map((s) => [s.id, s]));
    const byCategory = { TODO: 'New', IN_PROGRESS: 'In Progress', DONE: 'Closed' };
    const nameToId = new Map(allStatuses.values.map((s) => [s.name, s.id]));

    const extraMappings = oldIds.map((oldId) => {
      const category = byId.get(oldId)?.statusCategory || 'TODO';
      const newName = byCategory[category] || 'New';
      return { issueTypeId, statusId: oldId, newStatusId: nameToId.get(newName) };
    });
    console.log(`Mapeando status antigos automaticamente: ${JSON.stringify(extraMappings)}`);
    return jiraRequest('POST', `/rest/api/3/workflowscheme/${schemeId}/draft/publish`, {
      statusMappings: [...statusMappings, ...extraMappings],
    });
  }
}

main().catch((err) => {
  console.error(err.message);
  if (err.body) console.error(JSON.stringify(err.body, null, 2));
  process.exit(1);
});
