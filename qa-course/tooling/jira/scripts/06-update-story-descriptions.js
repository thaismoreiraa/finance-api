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
    acceptanceContext: 'definidos no refinement de 2026-10-05, com a Renata e o Marcelo',
    acceptanceCriteria: [
      'Login só por e-mail e senha, os dois obrigatórios. Não existe login por CPF.',
      'O e-mail passa pela mesma normalização do cadastro: sem espaços nas pontas e sem diferenciar maiúscula de minúscula.',
      'E-mail com formato inválido ou campo faltando é erro de validação, igual ao cadastro.',
      'No login a senha só não pode vir vazia; a regra dos 8 caracteres vale para criar senha.',
      'Senha errada e e-mail inexistente têm resposta idêntica (status, código e mensagem), sem revelar se o e-mail existe.',
      'Conta excluída que tenta entrar recebe a mesma resposta de credenciais inválidas.',
      'Não existe conta "desativada": só ativa ou excluída.',
      'Senha nunca aparece em log.',
      'Fora de escopo (backlog): bloqueio por tentativas, opção "manter conectado", registro de acessos (data, IP, dispositivo).',
    ],
  },
  'FIN-3': {
    asA: 'usuário',
    iWant: 'continuar usando o app sem precisar digitar a senha toda hora',
    soThat: 'não me irritar com o sistema.',
    poNotes: 'o Marcelo falou em "refresh token". Não sei bem como funciona, mas o importante é que a pessoa não seja deslogada do nada no meio do uso.',
    acceptanceContext: 'definidos no refinement de 2026-10-05, com a Renata e o Marcelo',
    acceptanceCriteria: [
      'Quem fica 7 dias sem usar o app precisa entrar de novo. Com uso contínuo, a pessoa não é deslogada: não existe tempo máximo de sessão.',
      'O refresh token pode ser reutilizado até vencer (7 dias). A rotação a cada uso vai para o backlog.',
      'O access token já emitido continua valendo até vencer.',
      'Token de acesso expirado ou inválido: erro de não autenticado, com a mesma resposta para os dois casos (não há código específico para "expirou"). Refresh token expirado ou inválido: também erro de não autenticado, e a pessoa volta para o login.',
      'Pedem a senha de novo, mesmo com sessão ativa: trocar a senha e excluir a conta. Nada mais (nome, moeda e transferências não pedem). Só senha; não existe 2FA. A confirmação vale só para aquela ação.',
      'Várias sessões ao mesmo tempo, em quantos dispositivos a pessoa quiser, sem limite.',
      'Trocar a senha não encerra as outras sessões nesta versão (risco aceito). A regra desejada é encerrar todas as outras; vira story de backlog com prioridade alta.',
      'Não existe conta bloqueada ou desativada.',
    ],
  },
  'FIN-4': {
    asA: 'usuário logado',
    iWant: 'ver e alterar meus dados',
    soThat: 'manter minhas informações corretas.',
    poNotes: 'dá para mudar nome e moeda. Trocar senha também, mas aí precisa confirmar a senha atual.',
    acceptanceContext: 'definidos no refinement de 2026-10-05, com a Renata e o Marcelo',
    acceptanceCriteria: [
      'O perfil mostra id, nome, e-mail, moeda e as datas de criação e de última alteração. Nunca mostra senha nem hash.',
      'Só nome (até 100 caracteres) e moeda são editáveis. Id, e-mail e datas são somente leitura; o e-mail não pode ser alterado nesta versão.',
      'Moedas disponíveis: BRL, USD e EUR (ISO 4217); padrão BRL. Qualquer outra moeda é erro de validação.',
      'Trocar a moeda só muda a moeda de exibição, sem converter nenhum valor (conversão vai para o backlog).',
      'A atualização é parcial: manda só o que quer mudar. Nome e moeda não pedem senha.',
      'Troca de senha pede a senha atual e a nova segue as regras do cadastro (mínimo de 8 caracteres, sem complexidade). A nova pode ser igual à atual. Senha atual errada retorna não autenticado, com a mensagem "Senha atual incorreta.".',
      'Depois de trocar a senha, a sessão atual continua válida e, nesta versão, as outras também (risco aceito, ver a story de backlog na FIN-03). Não há e-mail de aviso.',
      'Sem registro de auditoria de perfil e senha nesta versão.',
    ],
  },
  'FIN-5': {
    asA: 'usuário',
    iWant: 'apagar minha conta',
    soThat: 'sair do serviço quando quiser.',
    poNotes: 'por questão legal a gente não pode apagar de verdade na hora, tem que guardar por um tempo. O Marcelo disse que faz um "soft delete".',
    acceptanceContext: 'definidos no refinement de 2026-10-05, com a Renata e o Marcelo',
    acceptanceCriteria: [
      'Excluir a conta exige a senha. Sem senha (erro de validação) ou com senha errada (não autenticado), a conta não é excluída.',
      'Exclusão com sucesso responde sem corpo e não envia e-mail de confirmação.',
      'Quem tenta entrar numa conta excluída recebe a mesma resposta de credenciais inválidas da FIN-02, sem nenhuma mensagem que diga "conta excluída".',
      'Não existe reativação nem prazo para desistir. Quem quiser voltar cria uma conta nova, que nasce vazia.',
      'Os dados antigos ficam guardados por exigência legal; a pessoa não recupera nada.',
      'O e-mail de uma conta excluída pode ser usado em um novo cadastro: a regra de e-mail duplicado da FIN-01 só considera contas ativas.',
    ],
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
