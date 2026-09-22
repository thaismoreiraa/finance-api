const { jiraRequest } = require('../lib/jiraClient');
const { buildStoryDescription } = require('../lib/storyDescription');

// Conteúdo espelha qa-course/sprints/sprint-1/stories.md — não reescreve nada,
// só formata visualmente pro Jira (painel de destaque + lista de critérios).
const STORIES = {
  'FIN-1': {
    asA: 'uma pessoa que quer controlar suas finanças',
    iWant: 'criar uma conta no sistema',
    soThat: 'ter meus dados salvos e privados.',
    poNotes: 'precisa de nome, e-mail e senha. A senha tem que ser segura.',
    acceptanceContext: 'definidos no refinement de 2026-09-21, com a Renata e o Marcelo',
    acceptanceCriteria: [
      'Nome, e-mail e senha são obrigatórios. Nome até 100 caracteres, aceita acento, apóstrofo e hífen.',
      'Senha: mínimo de 8 caracteres. Sem exigência de maiúscula, número ou símbolo. Sem bloqueio de lista de senhas comuns nesta versão.',
      'E-mail não diferencia maiúscula de minúscula (Ana@x.com = ana@x.com) e espaços nas pontas são removidos antes de salvar.',
      'E-mail duplicado não cadastra de novo; retorna erro claro de "e-mail já cadastrado".',
      'Cadastros simultâneos com o mesmo e-mail: só um vence, o outro recebe o mesmo erro de e-mail duplicado.',
      'Erro de validação retorna de uma vez todos os campos inválidos, cada um com sua própria mensagem.',
      'Resposta de sucesso traz os dados do usuário (id, nome, e-mail) e os tokens — a pessoa já sai autenticada, sem precisar logar de novo em seguida.',
      'Conta nasce ativa, sem confirmação por e-mail.',
      'Senha nunca aparece em resposta de API nem em log.',
      'Rate limit no cadastro fica fora de escopo desta sprint (backlog).',
    ],
  },
  'FIN-2': {
    asA: 'usuário cadastrado',
    iWant: 'entrar no sistema',
    soThat: 'acessar minhas informações financeiras.',
    poNotes: 'depois de entrar, a pessoa fica logada por um tempo e depois precisa entrar de novo.',
    acceptanceCriteria: [],
  },
  'FIN-3': {
    asA: 'usuário',
    iWant: 'continuar usando o app sem precisar digitar a senha toda hora',
    soThat: 'não me irritar com o sistema.',
    poNotes: 'o Marcelo falou em "refresh token". Não sei bem como funciona, mas o importante é que a pessoa não seja deslogada do nada no meio do uso.',
    acceptanceCriteria: [],
  },
  'FIN-4': {
    asA: 'usuário logado',
    iWant: 'ver e alterar meus dados',
    soThat: 'manter minhas informações corretas.',
    poNotes: 'dá para mudar nome e moeda. Trocar senha também, mas aí precisa confirmar a senha atual.',
    acceptanceCriteria: [],
  },
  'FIN-5': {
    asA: 'usuário',
    iWant: 'apagar minha conta',
    soThat: 'sair do serviço quando quiser.',
    poNotes: 'por questão legal a gente não pode apagar de verdade na hora, tem que guardar por um tempo. O Marcelo disse que faz um "soft delete".',
    acceptanceCriteria: [],
  },
};

async function main() {
  const keys = process.argv.slice(2);
  const targets = keys.length > 0 ? keys : Object.keys(STORIES);

  for (const key of targets) {
    const story = STORIES[key];
    if (!story) {
      console.log(`Sem conteúdo mapeado para ${key}, pulando.`);
      continue;
    }
    const description = buildStoryDescription(story);
    await jiraRequest('PUT', `/rest/api/3/issue/${key}`, { fields: { description } });
    console.log(`${key}: description atualizada.`);
  }
}

main().catch((err) => {
  console.error(err.message);
  if (err.body) console.error(JSON.stringify(err.body, null, 2));
  process.exit(1);
});
