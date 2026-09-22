// Monta a description de uma story em ADF (Atlassian Document Format) com um
// formato visual consistente: bloco Como/quero/para em destaque, notas da PO
// e critérios de aceite em lista. Só formatação — não adiciona seções que o
// curso ainda não cobriu (Given/When/Then, Technical Considerations,
// Definition of Done são conteúdo do módulo 06 em diante).

function text(content, marks) {
  return marks ? { type: 'text', text: content, marks } : { type: 'text', text: content };
}

function paragraph(children) {
  return { type: 'paragraph', content: children };
}

function heading(level, content) {
  return { type: 'heading', attrs: { level }, content: [text(content)] };
}

function bulletList(items) {
  return {
    type: 'bulletList',
    content: items.map((item) => ({
      type: 'listItem',
      content: [paragraph([text(item)])],
    })),
  };
}

function buildStoryDescription({ asA, iWant, soThat, poNotes, acceptanceContext, acceptanceCriteria }) {
  const content = [
    {
      type: 'panel',
      attrs: { panelType: 'info' },
      content: [
        paragraph([text('Como ', [{ type: 'strong' }]), text(asA)]),
        paragraph([text('quero ', [{ type: 'strong' }]), text(iWant)]),
        paragraph([text('para ', [{ type: 'strong' }]), text(soThat)]),
      ],
    },
  ];

  if (poNotes) {
    content.push(heading(4, 'Notas da PO'));
    content.push(paragraph([text(poNotes)]));
  }

  content.push({ type: 'rule' });
  content.push(heading(4, 'Critérios de aceite'));
  if (acceptanceContext) {
    content.push(paragraph([text(acceptanceContext, [{ type: 'em' }])]));
  }

  if (acceptanceCriteria && acceptanceCriteria.length > 0) {
    content.push(bulletList(acceptanceCriteria));
  } else {
    content.push(paragraph([text('a definir no refinement', [{ type: 'em' }])]));
  }

  return { type: 'doc', version: 1, content };
}

module.exports = { buildStoryDescription };
