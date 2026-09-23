# Módulo 01 — Fundamentos de QA

## 1. Leitura dos testes do dev — `TransactionService.test.js`

### 1. Toda transação deve ter: `account_id`, `type`, `amount`, `date`
 
| Cenário | Coberto | Não vi teste para isso |
|---------|---------|------------------------|
| Deve validar que o campo `account_id` foi informado | | X |
| Deve validar que o campo `type` foi informado | | X |
| Deve validar que o campo `amount` foi informado | | X |
| Deve validar que o campo `date` foi informado | | X |
| Deve rejeitar um valor inválido no campo `account_id` | | X |
| Deve rejeitar um valor inválido no campo `type` | | X |
| Deve rejeitar um valor inválido no campo `amount` | | X |
| Deve rejeitar um valor inválido no campo `date` | | X |
 
### 2. O campo `amount` deve ser sempre positivo — `type` define entrada (`income`) ou saída (`expense`)
 
| Cenário | Coberto | Não vi teste para isso |
|---|---|---|
| Deve aceitar uma transação com `type` igual a `income` e `amount` positivo | | X |
| Deve aceitar uma transação com `type` igual a `expense` e `amount` positivo | | X |
| Deve rejeitar um valor inválido no campo `type` | | X |
| Deve rejeitar uma transação do tipo `income` com `amount` negativo | | X |
| Deve rejeitar uma transação do tipo `expense` com `amount` negativo | | X |
 
### 3. Transações do tipo `transfer` exigem `destination_account_id` e geram duas transações espelhadas, ligadas por `transfer_pair_id`
 
| Cenário | Coberto | Não vi teste para isso |
|---|---|---|
| Deve rejeitar uma transferência cuja conta de destino é igual à conta de origem | | X |
| Deve rejeitar uma transferência para uma conta de destino inválida ou inativa | | X |
| Deve rejeitar um valor inválido no campo `type` em uma transferência | | X |
| Deve gerar duas transações espelhadas (uma entrada e uma saída) ligadas pelo mesmo `transfer_pair_id` | | X |

### 4. Transações com data futura devem ter `status = scheduled` automaticamente
 
| Cenário | Coberto | Não vi teste para isso |
|---|---|---|
| deve marcar transação como scheduled quando data é futura | | X |
| Não deve marcar a transação como scheduled quando a date é o dia atual | | X |
 
### 5. Transações confirmadas (`status = confirmed`) atualizam o `balance` da conta imediatamente
 
| Cenário | Coberto | Não vi teste para isso |
|---|---|---|
| Deve criar transação de income e atualizar saldo | | X |
| Deve criar transação de expense e atualizar saldo | | X | 
 
### 6. Ao editar uma transação, o saldo da conta deve ser recalculado
 
| Cenário | Coberto | Não vi teste para isso |
|---|---|---|
| Deve recalcular o saldo da conta ao editar uma transação | | X |
 
### 7. Ao excluir uma transação, o saldo da conta deve ser revertido
 
| Cenário | Coberto | Não vi teste para isso |
|---|---|---|
| Deve reverter o saldo da conta ao excluir uma transação | | X |
 
 
### 8. A exclusão é lógica (soft delete via `deleted_at`) — nunca apaga registros do banco
 
| Cenário | Coberto | Não vi teste para isso |
|---|---|---|
| Deve preencher o campo `deleted_at` ao excluir uma transação | | X |
| O registro da transação deve continuar existindo no banco após a exclusão | | X |
 
### 9. Toda edição ou exclusão de transação deve gerar um registro em `audit_logs`
 
| Cenário | Coberto | Não vi teste para isso |
|---|---|---|
| Deve gerar um registro em `audit_logs` após a edição de uma transação | | X |
| Deve gerar um registro em `audit_logs` após a exclusão de uma transação | | X |

### Perguntas sobre as regras de negócio

- #### 4. Transações com data futura devem ter `status = scheduled` automaticamente
  - **1.** Quais são os critérios para considerar que uma transação tem data futura?
- #### 6. Ao editar uma transação, o saldo da conta deve ser recalculado
  - **1.** Em quais status uma transação pode ser editada?
  - **2.** Quais campos de uma transação podem ser editados?
  - **3.** O que deve acontecer ao editar uma transferência já concluída, já que ela tem duas transações espelhadas (entrada e saída)?
- #### 7. Ao excluir uma transação, o saldo da conta deve ser revertido
  - **1.** Em quais status uma transação pode ser excluída?
  - **2.** O que deve acontecer ao excluir uma transferência já concluída, já que ela tem duas transações espelhadas (entrada e saída)?

## 2. O que é QA e qual a diferença para testing

QA na minha visão, significa garantir que o processo tenha qualidade, desde o começo, durante e ao fim, além de questionamentos com perguntas para tentar garantir que construímos um produto consistente, também define e revisa processos e boas práticas de desenvolvimento e garante uma cultura de qualidade com o time todo. Por exemplo, no refinement de uma story de categorias, eu pergunto pra PO "o que deve acontecer se o usuário tentar excluir uma categoria que já tem transações vinculadas a ela?" antes mesmo de existir uma linha de código.

Testing é garantir e verificar que está tudo ocorrendo certo seguindo a user story e regra do negócio. Nesse mesmo exemplo, depois que a funcionalidade existe, eu mando um `DELETE /categories/{id}` com esses dados e confiro se a resposta bate com o que a regra de negócio diz que devia acontecer.

## 3. Erro, defeito ou falha

- a. O saldo da conta ficou R$ 200 menor do que a soma das transações — failure
- b. A dev esqueceu que transferência tem duas pernas — error
- c. A função de exclusão não trata `transfer_pair_id` — defect

## 4. Sanity × regressão

**Sanity** indica que "é possível seguir em frente" com o que foi corrigido. 
**Regressão** indica que "nada mais foi quebrado" no restante do sistema. 

### Exemplos

**Sanity**

- **Problema:** ao **editar** uma transação, o saldo da conta não era recalculado.
- **Validação pós-correção:** confirmado que, após a edição, o saldo da conta passa a ser recalculado corretamente.

**Regressão**

- Ao consultar um orçamento, a API deve retornar os campos calculados atualizados:
  - `spent` — total gasto no período
  - `remaining` — resultado de `amount - spent`
  - `usage_percent` — percentual de uso atualizado

  Esses valores devem refletir corretamente a edição da transação já validada na etapa de Sanity.
