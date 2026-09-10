# Sprint 1 — Stories

> Escritas pela **Renata (PO)**. Cole no Jira como estão, sem "melhorar".
>
> Elas estão incompletas de propósito — é assim que story chega na vida real. Sua função
> no refinement é fazer as perguntas que faltam. O que você não perguntar, ninguém
> especifica; e o que ninguém especifica costuma virar bug.

---

## FIN-01 — Cadastro de usuário

**Como** uma pessoa que quer controlar suas finanças
**quero** criar uma conta no sistema
**para** ter meus dados salvos e privados.

**Notas da PO:** precisa de nome, e-mail e senha. A senha tem que ser segura.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-02 — Login

**Como** usuário cadastrado
**quero** entrar no sistema
**para** acessar minhas informações financeiras.

**Notas da PO:** depois de entrar, a pessoa fica logada por um tempo e depois precisa
entrar de novo.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-03 — Manter a sessão ativa

**Como** usuário
**quero** continuar usando o app sem precisar digitar a senha toda hora
**para** não me irritar com o sistema.

**Notas da PO:** o Marcelo falou em "refresh token". Não sei bem como funciona, mas o
importante é que a pessoa não seja deslogada do nada no meio do uso.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-04 — Ver e editar meu perfil

**Como** usuário logado
**quero** ver e alterar meus dados
**para** manter minhas informações corretas.

**Notas da PO:** dá para mudar nome e moeda. Trocar senha também, mas aí precisa
confirmar a senha atual.

**Critérios de aceite:** *a definir no refinement*

---

## FIN-05 — Excluir minha conta

**Como** usuário
**quero** apagar minha conta
**para** sair do serviço quando quiser.

**Notas da PO:** por questão legal a gente não pode apagar de verdade na hora, tem que
guardar por um tempo. O Marcelo disse que faz um "soft delete".

**Critérios de aceite:** *a definir no refinement*

---

## Dicas de refinement

Antes de rodar `/qa-curso sprint 1`, escreva as suas perguntas. Algumas coisas que
nenhuma dessas stories responde:

- O que é "senha segura", exatamente? Qual o mínimo? Precisa de número, maiúscula?
- E-mail duplicado: que erro o usuário vê?
- E-mail é validado como formato? É case-sensitive? `JOAO@x.com` e `joao@x.com` são a
  mesma pessoa?
- "Fica logada por um tempo" — quanto tempo? O que acontece exatamente quando expira?
- Depois de excluir a conta, o token que já estava na mão continua funcionando?
- Depois de excluir, dá para cadastrar de novo com o mesmo e-mail?

Essas seis são de graça, para você pegar o jeito. Faltam pelo menos mais dez, e essas
são com você.
