const fs = require('node:fs');
const path = require('node:path');
const { jiraRequest, loadConfig } = require('../lib/jiraClient');

const BUG_ISSUE_TYPE_NAME = 'Bug';

async function main() {
  const config = loadConfig();
  const statePath = path.join(__dirname, '..', 'state', 'bug-fields.json');
  if (!fs.existsSync(statePath)) {
    throw new Error('state/bug-fields.json não existe — rode scripts/04-create-bug-fields.js primeiro.');
  }
  const fieldIds = JSON.parse(fs.readFileSync(statePath, 'utf8'));

  const project = await jiraRequest('GET', `/rest/api/3/project/${config.projectKey}?expand=issueTypes`);
  const bugType = project.issueTypes.find((t) => t.name === BUG_ISSUE_TYPE_NAME);
  if (!bugType) throw new Error(`Issue type "${BUG_ISSUE_TYPE_NAME}" não encontrado.`);

  const mappings = await jiraRequest(
    'GET',
    `/rest/api/3/issuetypescreenscheme/project?projectId=${project.id}`
  );
  const issueTypeScreenSchemeId = mappings.values[0].issueTypeScreenScheme.id;

  const screenMappings = await jiraRequest(
    'GET',
    `/rest/api/3/issuetypescreenscheme/mapping?issueTypeScreenSchemeId=${issueTypeScreenSchemeId}`
  );
  const bugMapping =
    screenMappings.values.find((m) => m.issueTypeId === bugType.id) ||
    screenMappings.values.find((m) => m.issueTypeId === 'default');
  const screenSchemeId = bugMapping.screenSchemeId;

  const screenSchemes = await jiraRequest('GET', `/rest/api/3/screenscheme?id=${screenSchemeId}`);
  const screenId = screenSchemes.values[0].screens.default;

  const tabs = await jiraRequest('GET', `/rest/api/3/screens/${screenId}/tabs`);
  const tabId = tabs[0].id;

  const currentFields = await jiraRequest('GET', `/rest/api/3/screens/${screenId}/tabs/${tabId}/fields`);
  const currentIds = new Set(currentFields.map((f) => f.id));

  const envField = currentFields.find((f) => f.name === 'Environment');
  console.log(envField ? 'Campo "Environment" já está na tela (campo de sistema).' : 'Aviso: "Environment" não encontrado na tela — adicione manualmente se necessário.');

  for (const [name, fieldId] of Object.entries(fieldIds)) {
    if (currentIds.has(fieldId)) {
      console.log(`Campo ${name} (${fieldId}) já está na tela do Bug.`);
      continue;
    }
    const res = await jiraRequest('POST', `/rest/api/3/screens/${screenId}/tabs/${tabId}/fields`, { fieldId });
    console.log(`Campo "${res.name}" adicionado à tela do Bug (screen ${screenId}, tab ${tabId}).`);
  }
}

main().catch((err) => {
  console.error(err.message);
  if (err.body) console.error(JSON.stringify(err.body, null, 2));
  process.exit(1);
});
