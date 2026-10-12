# Perguntas de Refinement — Histórias FIN (Back-end)

## 2. Perguntas de refinement da FIN-02 (Login)

### 1. Identificador
**Qual campo identifica o usuário no login?**
- E-mail, CPF ou ambos?
- Aplicamos a mesma normalização do cadastro (`trim`, letras minúsculas)?

### 2. Validação de entrada
- Quais campos são obrigatórios na requisição?

### 3. Credenciais inválidas
**Qual status code e mensagem retornar?**
- Usamos `401`?
- A mensagem é genérica, sem revelar se o e-mail existe?

### 4. Bloqueio por tentativas
**Qual é a regra exata?**
- Após quantas tentativas incorretas a conta é bloqueada?
- Por quanto tempo fica bloqueada?
- O desbloqueio é automático ou manual?
- Qual status code e mensagem retornar (`403`, `423` ou `429`)?

### 5. Manter conectado
- A opção vai existir?
- Ela muda a validade do *refresh token*?

### 6. Contas em situação especial
**Qual status code e mensagem retornar para cada caso?**
- Conta inativa ou desativada?
- Conta excluída (FIN-05)?

### 7. Logs de acesso
- O que registramos (data, IP, dispositivo, sucesso ou falha)?
- Por quanto tempo os logs ficam guardados?
- A senha nunca aparece nos logs?

---

## 3. Perguntas de refinement da FIN-03 (Manter a sessão ativa)

### 1. Tempo de inatividade
**Depois de quanto tempo sem uso o usuário precisa entrar de novo?**

### 2. Tempo máximo de sessão
- Existe um tempo máximo, mesmo com uso contínuo?

### 3. Respostas de expiração
**Qual status code e mensagem retornar?**
- Quando o *access token* expira (`401` com código de erro específico?)
- Quando o *refresh token* expira ou é inválido?

### 4. Ações sensíveis
- Quais ações exigem confirmação de identidade mesmo com sessão ativa (transferências, alteração de dados, alteração de senha, exclusão de conta)?
- Qual o método (senha, 2FA)?
- Por quanto tempo essa confirmação vale?

### 5. Sessões simultâneas
- O usuário pode ter sessões em vários dispositivos ao mesmo tempo?
- Há limite de sessões?
- Ao ultrapassar o limite, encerramos a sessão mais antiga ou recusamos o novo login?

### 6. Invalidação de sessões
- Ao trocar a senha, as outras sessões são encerradas?
- Se a conta for bloqueada ou desativada, os tokens são invalidados na hora, antes de expirarem?

---

## 4. Perguntas de refinement da FIN-04 (Ver e editar meu perfil)

### 1. Dados do perfil
**O que o endpoint de consulta do perfil devolve?**
- Quais campos são somente leitura?
- Só nome e moeda são editáveis?
- O e-mail pode ser alterado?

### 2. Moeda
- Quais moedas estarão disponíveis?
- Qual a moeda padrão de um usuário novo?
- Usamos o código ISO 4217 (`BRL`, `USD`)?
- **Ao trocar a moeda, os valores existentes são convertidos ou só muda a moeda de exibição?**

### 3. Atualização
- A atualização é parcial (`PATCH`) ou completa (`PUT`)?
- Alterar nome ou moeda exige senha?

### 4. Alteração de senha
**Qual é a regra exata?**
- Seguimos as mesmas regras de senha segura da FIN-01?
- A nova senha pode ser igual à atual?
- Qual status code e mensagem retornar quando a senha atual estiver errada?

### 5. Depois da troca de senha
- As outras sessões são encerradas?
- A sessão atual continua válida?
- O usuário recebe e-mail avisando da alteração?

### 9. Auditoria
- As alterações de perfil e senha ficam registradas em log?
- Quais informações registramos (campo alterado, valor antigo, data, IP)?

---

## 5. Perguntas de refinement da FIN-05 (Excluir minha conta)

### 1. Confirmação de identidade
- O usuário precisa informar a senha ou 2FA para excluir?

### 2. Resposta de sucesso
- Qual status code (`200` ou `204`)?
- O usuário recebe e-mail confirmando a exclusão?

### 3. Login após a exclusão
**Qual status code e mensagem retornar ao tentar logar numa conta excluída?**

### 4. Reativação
- Existe um período para desistir da exclusão?
- Como a conta é reativada?
- Os dados voltam?

### 5. Reuso de e-mail e CPF
**Após a exclusão, é possível criar uma conta nova com o mesmo e-mail ou CPF?**
- A regra de e-mail duplicado (FIN-01, tópico 2) considera contas excluídas?