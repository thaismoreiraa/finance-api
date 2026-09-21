const { jiraRequest, loadConfig } = require('../lib/jiraClient');

async function main() {
  const config = loadConfig();
  const me = await jiraRequest('GET', '/rest/api/3/myself');
  console.log(`Conectado como ${me.displayName} (${me.emailAddress}) em ${config.siteUrl}`);

  try {
    const project = await jiraRequest('GET', `/rest/api/3/project/${config.projectKey}`);
    console.log(`Projeto ${config.projectKey} já existe: "${project.name}" (id ${project.id}, tipo ${project.projectTypeKey}, style ${project.style || 'n/a'})`);
  } catch (err) {
    if (err.status === 404) {
      console.log(`Projeto ${config.projectKey} ainda não existe.`);
    } else {
      throw err;
    }
  }
}

main().catch((err) => {
  console.error(err.message);
  if (err.body) console.error(JSON.stringify(err.body, null, 2));
  process.exit(1);
});
