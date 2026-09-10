# Template — Caso de teste

Copie este bloco para cada caso. Se você não conseguir preencher um campo, **esse é o
sinal de que você ainda não entendeu o requisito** — volte e pergunte ao PO.

---

**ID:** CT-XXX
**Story relacionada:** FIN-XX
**Título:** *(o comportamento esperado, não a tela. "Rejeitar despesa que deixaria conta sem saldo", não "testar transação")*
**Tipo:** funcional / regressão / negativo / limite
**Prioridade:** Alta / Média / Baixa — *justifique em uma linha*

**Pré-condições**
1. *(estado exato antes de começar. "Usuário autenticado com token válido" e "conta corrente com saldo R$ 100,00 e allow_negative = false")*

**Dados de teste**
| Campo | Valor |
| --- | --- |
| | |

**Passos**
| # | Ação | Resultado esperado |
| --- | --- | --- |
| 1 | | |
| 2 | | |

**Resultado esperado final**
*(verificável e único. Inclua status code e o campo do corpo que prova o resultado. "422 com code INSUFFICIENT_BALANCE e saldo da conta inalterado em 100.00")*

**Validação no banco** *(quando aplicável)*
```sql

```

**Resultado obtido:** *(preenchido na execução)*
**Status:** Passou / Falhou / Bloqueado
**Evidência:** *(print, resposta do Postman, linha do banco)*

---

## Checklist antes de dar por pronto

- [ ] Outra pessoa consegue executar sem te perguntar nada?
- [ ] O resultado esperado é verificável, ou é opinião?
- [ ] Os dados são concretos, ou é "um valor qualquer"?
- [ ] Se o teste falhar, dá para saber **qual regra** foi violada?
