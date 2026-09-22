const { jiraRequest } = require('../lib/jiraClient');

// Move um card pra um status específico, resolvendo a transição disponível
// automaticamente. Usado pra simular as movimentações que, num time real,
// seriam feitas pelo Marcelo (dev) — To Do -> In Progress -> In QA nas
// stories, e New -> Open -> In Progress -> Ready for Retest nos bugs. As
// movimentações que são da QA (In QA -> Done, Ready for Retest -> Closed/
// Reopened) o usuário faz na mão, pela UI.
//
// Uso: node scripts/08-move-card.js <ISSUE-KEY> "<Status alvo>" ["comentário"]
// Ex.:  node scripts/08-move-card.js FIN-2 "In Progress" "Marcelo começou o login."

function commentBody(text) {
  return {
    type: 'doc',
    version: 1,
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  };
}

async function main() {
  const [issueKey, targetStatus, comment] = process.argv.slice(2);
  if (!issueKey || !targetStatus) {
    console.error('Uso: node scripts/08-move-card.js <ISSUE-KEY> "<Status alvo>" ["comentário opcional"]');
    process.exit(1);
  }

  const issue = await jiraRequest('GET', `/rest/api/3/issue/${issueKey}?fields=summary,status`);
  const currentStatus = issue.fields.status.name;
  if (currentStatus === targetStatus) {
    console.log(`${issueKey} já está em "${targetStatus}". Nada a fazer.`);
    return;
  }

  const { transitions } = await jiraRequest('GET', `/rest/api/3/issue/${issueKey}/transitions`);
  const transition = transitions.find((t) => t.to.name === targetStatus);
  if (!transition) {
    console.error(
      `Não existe transição direta de "${currentStatus}" para "${targetStatus}" em ${issueKey}.\n` +
        `Disponíveis agora: ${transitions.map((t) => t.to.name).join(', ')}`
    );
    process.exit(1);
  }

  const body = { transition: { id: transition.id } };
  if (comment) {
    body.update = { comment: [{ add: { body: commentBody(comment) } }] };
  }

  await jiraRequest('POST', `/rest/api/3/issue/${issueKey}/transitions`, body);
  console.log(`${issueKey} ("${issue.fields.summary}"): ${currentStatus} -> ${targetStatus}${comment ? ` — "${comment}"` : ''}`);
}

main().catch((err) => {
  console.error(err.message);
  if (err.body) console.error(JSON.stringify(err.body, null, 2));
  process.exit(1);
});
