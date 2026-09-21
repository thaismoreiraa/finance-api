const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const REQUIRED = ['JIRA_SITE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN', 'JIRA_PROJECT_KEY'];

function loadConfig() {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Faltam variáveis no qa-course/tooling/jira/.env: ${missing.join(', ')}\n` +
        'Copie .env.example para .env e preencha os valores.'
    );
  }

  return {
    siteUrl: process.env.JIRA_SITE_URL.replace(/\/+$/, ''),
    email: process.env.JIRA_EMAIL,
    apiToken: process.env.JIRA_API_TOKEN,
    projectKey: process.env.JIRA_PROJECT_KEY,
  };
}

async function jiraRequest(method, apiPath, body) {
  const config = loadConfig();
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

  const res = await fetch(`${config.siteUrl}${apiPath}`, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = new Error(`Jira API ${method} ${apiPath} -> ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}

module.exports = { loadConfig, jiraRequest };
