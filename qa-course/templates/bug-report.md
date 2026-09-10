# Template — Bug report

O objetivo de um bug report não é provar que você achou um bug. É fazer o dev conseguir
reproduzir em **dois minutos, sem te chamar**.

---

**Título:** *(o quê + onde + quando, numa linha. "Saldo da conta não é revertido ao excluir transação de despesa", não "erro no saldo")*

**Ambiente**
- Branch/build: `build/sprint-N`, commit `abc1234`
- URL: `http://localhost:3000/v1`
- Banco: `finance_db` local
- Data/hora do teste:

**Pré-condições**
1. *(estado exato. Inclua os dados que você criou.)*

**Passos para reproduzir**
1.
2.
3.

**Resultado esperado**
*(cite a regra: "Conforme o README, seção Transações — 'Ao excluir uma transação, o saldo da conta deve ser revertido'. O saldo deveria voltar para R$ 500,00." Ou cite o critério de aceite da story.)*

**Resultado atual**
*(o que realmente aconteceu, com a resposta real)*
```json

```

**Evidência**
*(print do Postman com request e response, ou o resultado da query)*

**Severidade:** Crítica / Alta / Média / Baixa
*Justificativa — impacto técnico:*

**Prioridade sugerida:** Crítica / Alta / Média / Baixa
*Justificativa — urgência de negócio:*

**Frequência:** sempre / intermitente / só em condição específica
**Story relacionada:** FIN-XX
**Caso de teste que pegou:** CT-XXX

---

## Severidade × Prioridade — não são a mesma coisa

| | O que mede | Quem decide |
| --- | --- | --- |
| **Severidade** | O tamanho do estrago técnico | QA |
| **Prioridade** | A urgência de consertar | PO |

Existe bug de severidade alta e prioridade baixa: perda de dados numa tela que dois
usuários acessam por ano. E o contrário: o nome da empresa escrito errado na home é
severidade baixa e prioridade máxima.

## Antes de reportar

- [ ] Reproduzi **duas vezes**, do zero?
- [ ] É bug mesmo, ou eu entendi o requisito errado? *(reler o critério de aceite)*
- [ ] Já não existe um ticket aberto para isso?
- [ ] Um dev que nunca viu esse fluxo consegue reproduzir só com o que escrevi?
