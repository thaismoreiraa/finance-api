# Refinement FIN-01

## As 8 perguntas principais

### 1. Senha segura
**Qual é a regra exata?**
- Mínimo e máximo de caracteres?
- Exige maiúscula, número e símbolo?
- Bloqueia senhas comuns, como `123456`?

### 2. E-mail duplicado
**Qual status code e mensagem retornar?**

### 3. Normalização de e-mail
**`Ana@x.com` e `ana@x.com` são o mesmo e-mail?**
- Fazemos `trim` de espaços?

### 4. Nome
- É um campo único de nome completo?
- Todos os campos são obrigatórios (nome, e-mail e senha)?
- Qual o limite de caracteres?
- Quais caracteres são aceitos (acentos, apóstrofo, hífen)?

### 5. Erros de validação
- Qual status code usar: `400` ou `422`?
- Qual o formato do JSON de erro?
- Retorna todos os campos inválidos de uma vez?

### 6. Resposta de sucesso
- O que a API devolve (`id`, nome, e-mail)?
- A conta já nasce ativa?
- O usuário já sai autenticado ou faz login em seguida?

### 7. Proteção
- A senha é salva com hash (`bcrypt` ou `argon2`)?
- A senha nunca aparece em respostas ou logs?
- Haverá *rate limit* no endpoint para evitar abuso?

### 8. Concorrência
**Se dois cadastros com o mesmo e-mail chegam ao mesmo tempo, quem vence?**

---
---

# Daily

Ontem terminei de analisar a FIN-01 e escrevi as perguntas de refinement. Hoje participo da reunião com a Renata e, depois, começo a escrever os casos de teste da FIN-01. Estou bloqueada na FIN-04 — o Marcelo ainda não identificou a causa raiz do bug que está impedindo o usuário de alterar a moeda.

---
---

# INVEST FIN-01

| Letra | Critério | Atende? | Justificativa |
|:-----:|----------|:-------:|---------------|
| **I** | Independente | ✅ Sim | O cadastro de usuário não depende de nenhuma outra ação anterior. |
| **N** | Negociável | ✅ Sim | As definições devem ser negociadas com o time no refinement. |
| **V** | Valiosa | ✅ Sim | O usuário tem seus dados salvos e privados. |
| **E** | Estimável | ❌ Não | Faltam informações sobre a história; as perguntas levantadas no refinement ainda estão em aberto. |
| **S** | Pequena (*Small*) | ✅ Sim | Cabe em uma sprint. |
| **T** | Testável | ❌ Não | Não há critérios de aceite definidos. |
