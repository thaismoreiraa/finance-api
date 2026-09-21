const { jiraRequest, loadConfig } = require('../lib/jiraClient');

// Scrum, company-managed (clássico) — precisa ser esse tipo para permitir workflow
// e board customizados via API depois.
const PROJECT_TEMPLATE_KEY = 'com.pyxis.greenhopper.jira:gh-scrum-template';
const PROJECT_TYPE_KEY = 'software';

async function main() {
  const config = loadConfig();

  try {
    const existing = await jiraRequest('GET', `/rest/api/3/project/${config.projectKey}`);
    console.log(`Projeto ${config.projectKey} já existe (id ${existing.id}, style ${existing.style || 'n/a'}). Nada a fazer.`);
    return;
  } catch (err) {
    if (err.status !== 404) throw err;
  }

  const me = await jiraRequest('GET', '/rest/api/3/myself');

  const payload = {
    key: config.projectKey,
    name: 'Finance API',
    projectTypeKey: PROJECT_TYPE_KEY,
    projectTemplateKey: PROJECT_TEMPLATE_KEY,
    leadAccountId: me.accountId,
    description: 'Rastreamento de stories e bugs da prática de QA sobre a finance-api.',
    assigneeType: 'UNASSIGNED',
  };

  console.log(`Criando projeto ${config.projectKey} (company-managed Scrum)...`);
  const project = await jiraRequest('POST', '/rest/api/3/project', payload);
  console.log(`Criado: ${JSON.stringify(project, null, 2)}`);
}

main().catch((err) => {
  console.error(err.message);
  if (err.body) console.error(JSON.stringify(err.body, null, 2));
  console.error(
    '\nSe a criação via API falhar (permissão/licença/template), crie manualmente:\n' +
      '  Jira → Create project → Scrum → "Company-managed" → key FIN → nome "Finance API"\n' +
      'e rode este script de novo (ele detecta que já existe e pula a criação).'
  );
  process.exit(1);
});
