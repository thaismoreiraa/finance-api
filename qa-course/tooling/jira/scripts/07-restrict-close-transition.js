const fs = require('node:fs');
const path = require('node:path');
const { jiraRequest } = require('../lib/jiraClient');

// Regra do módulo 03: "quem abre o bug é quem fecha" — só o Reporter pode
// mover para Closed. A transição já existia (id "8", "Validar (reteste OK)")
// mas só tinha a regra escrita na description, sem restrição de permissão de
// verdade. Isso adiciona a condição real via system:restrict-issue-transition
// (accountIds: "allow-reporter" — confirmado funcionando em projeto
// company-managed pelo workflow clássico que copiamos no script 02, mesmo a
// doc dizendo "only supported in team-managed projects").
const CLOSE_TRANSITION_NAME = 'Validar (reteste OK)';

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
  const statePath = path.join(__dirname, '..', 'state', 'bug-workflow.json');
  const { workflowId } = JSON.parse(fs.readFileSync(statePath, 'utf8'));

  const res = await jiraRequest('POST', '/rest/api/3/workflows', { workflowIds: [workflowId] });
  const workflow = res.workflows[0];
  const transition = workflow.transitions.find((t) => t.name === CLOSE_TRANSITION_NAME);
  if (!transition) throw new Error(`Transição "${CLOSE_TRANSITION_NAME}" não encontrada.`);

  const alreadyRestricted = transition.conditions?.conditions?.some(
    (c) => c.ruleKey === 'system:restrict-issue-transition'
  );
  if (alreadyRestricted) {
    console.log(`Transição "${CLOSE_TRANSITION_NAME}" já está restrita. Nada a fazer.`);
    return;
  }

  transition.conditions = {
    operation: 'ALL',
    conditionGroups: [],
    conditions: [
      {
        ruleKey: 'system:restrict-issue-transition',
        parameters: {
          accountIds: 'allow-reporter',
          roleIds: '',
          groupIds: '',
          permissionKeys: '',
          groupCustomFields: '',
          allowUserCustomFields: '',
          denyUserCustomFields: '',
        },
      },
    ],
  };

  // O catálogo `statuses` não pode vir vazio — precisa redeclarar todos os
  // status já usados neste workflow, cada um com `id` (reuso, não criação).
  const statusCatalog = res.statuses.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description || '',
    statusCategory: s.statusCategory,
    statusReference: s.id,
  }));

  console.log(`Restringindo "${CLOSE_TRANSITION_NAME}" a quem reportou o bug (allow-reporter)...`);
  const updateResult = await jiraRequest('POST', '/rest/api/3/workflows/update', {
    statuses: statusCatalog,
    workflows: [
      {
        id: workflow.id,
        description: workflow.description,
        startPointLayout: workflow.startPointLayout,
        statuses: workflow.statuses,
        transitions: workflow.transitions,
        version: workflow.version,
      },
    ],
  });

  if (updateResult.taskId) {
    console.log(`Task assíncrona ${updateResult.taskId} — aguardando...`);
    await waitForTask(updateResult.taskId);
  }

  const verify = await jiraRequest('POST', '/rest/api/3/workflows', { workflowIds: [workflowId] });
  const updatedTransition = verify.workflows[0].transitions.find((t) => t.name === CLOSE_TRANSITION_NAME);
  const ok = updatedTransition.conditions?.conditions?.some((c) => c.ruleKey === 'system:restrict-issue-transition');
  console.log(ok ? 'Confirmado: só o reporter consegue mover para Closed agora.' : 'Aviso: não consegui confirmar a condição aplicada.');
}

main().catch((err) => {
  console.error(err.message);
  if (err.body) console.error(JSON.stringify(err.body, null, 2));
  process.exit(1);
});
