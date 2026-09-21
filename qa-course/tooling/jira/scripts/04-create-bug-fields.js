const fs = require('node:fs');
const path = require('node:path');
const { jiraRequest } = require('../lib/jiraClient');

// Campos do módulo 03, passo 4. Environment já existe como campo de
// sistema do Jira (não precisa criar). Severity não tem prioridade nativa
// como substituto — prioridade e severidade são conceitos diferentes.
const SEVERITY_OPTIONS = ['Crítica', 'Alta', 'Média', 'Baixa'];
const TEXT_FIELDS = ['Steps to Reproduce', 'Expected Result', 'Actual Result'];

async function findFieldByName(name) {
  const fields = await jiraRequest('GET', '/rest/api/3/field');
  return fields.find((f) => f.name === name);
}

async function ensureSeverityField() {
  const existing = await findFieldByName('Severity');
  if (existing) {
    console.log(`Campo "Severity" já existe (${existing.id}).`);
    return existing.id;
  }

  const created = await jiraRequest('POST', '/rest/api/3/field', {
    name: 'Severity',
    description: 'Severidade do bug (impacto técnico) — diferente de prioridade.',
    type: 'com.atlassian.jira.plugin.system.customfieldtypes:select',
  });
  console.log(`Campo "Severity" criado (${created.id}).`);

  const contexts = await jiraRequest('GET', `/rest/api/3/field/${created.id}/context`);
  const contextId = contexts.values[0].id;
  await jiraRequest('POST', `/rest/api/3/field/${created.id}/context/${contextId}/option`, {
    options: SEVERITY_OPTIONS.map((value) => ({ value })),
  });
  console.log(`Opções adicionadas: ${SEVERITY_OPTIONS.join(', ')}`);
  return created.id;
}

async function ensureTextField(name) {
  const existing = await findFieldByName(name);
  if (existing) {
    console.log(`Campo "${name}" já existe (${existing.id}).`);
    return existing.id;
  }
  const created = await jiraRequest('POST', '/rest/api/3/field', {
    name,
    description: `${name} (campo do bug reportado pelo QA).`,
    type: 'com.atlassian.jira.plugin.system.customfieldtypes:textarea',
  });
  console.log(`Campo "${name}" criado (${created.id}).`);
  return created.id;
}

async function main() {
  const severityId = await ensureSeverityField();
  const textFieldIds = {};
  for (const name of TEXT_FIELDS) {
    textFieldIds[name] = await ensureTextField(name);
  }

  const statePath = path.join(__dirname, '..', 'state', 'bug-fields.json');
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(
    statePath,
    JSON.stringify({ severity: severityId, ...textFieldIds }, null, 2)
  );
  console.log(`Salvo em ${path.relative(process.cwd(), statePath)}`);
}

main().catch((err) => {
  console.error(err.message);
  if (err.body) console.error(JSON.stringify(err.body, null, 2));
  process.exit(1);
});
