const TransactionRepository = require('../repositories/TransactionRepository');
const AccountRepository = require('../repositories/AccountRepository');
const AppError = require('../utils/AppError');

/**
 * Serviço de relatórios.
 */
const ReportService = {
  /**
   * Resumo financeiro do período.
   * @param {string} userId
   * @param {object} params - { date_from, date_to, account_id }
   * @returns {Promise<object>}
   */
  async summary(userId, params) {
    const { date_from, date_to, account_id } = params;

    const qb = TransactionRepository.createQueryBuilder('t')
      .where('t.user_id = :userId', { userId })
      .andWhere('t.status = :status', { status: 'confirmed' })
      .andWhere('t.deleted_at IS NULL');

    if (date_from) qb.andWhere('t.date >= :dateFrom', { dateFrom: date_from });
    if (date_to) qb.andWhere('t.date <= :dateTo', { dateTo: date_to });
    if (account_id) qb.andWhere('t.account_id = :accountId', { accountId: account_id });

    const transactions = await qb.leftJoinAndSelect('t.category', 'category').getMany();

    let total_income = 0;
    let total_expense = 0;
    const byCategory = {};

    for (const tx of transactions) {
      const amount = Number(tx.amount);
      if (tx.type === 'income') {
        total_income += amount;
      } else if (tx.type === 'expense') {
        total_expense += amount;
      }

      if (tx.category_id && tx.type !== 'transfer') {
        if (!byCategory[tx.category_id]) {
          byCategory[tx.category_id] = {
            category_id: tx.category_id,
            category_name: tx.category ? tx.category.name : null,
            type: tx.type,
            total: 0,
          };
        }
        byCategory[tx.category_id].total += amount;
      }
    }

    const net = total_income - total_expense;
    const totalByType = { income: total_income, expense: total_expense };
    const by_category = Object.values(byCategory).map((cat) => ({
      ...cat,
      percent:
        totalByType[cat.type] > 0
          ? Math.round((cat.total / totalByType[cat.type]) * 10000) / 100
          : 0,
    }));

    // Saldo de abertura: soma dos saldos das contas ou calcular a partir das transações anteriores
    let opening_balance = 0;
    if (date_from) {
      const priorResult = await TransactionRepository.createQueryBuilder('t')
        .select("SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END)", 'balance')
        .where('t.user_id = :userId', { userId })
        .andWhere('t.status = :status', { status: 'confirmed' })
        .andWhere('t.deleted_at IS NULL')
        .andWhere('t.date < :dateFrom', { dateFrom: date_from })
        .andWhere("t.type != 'transfer'")
        .getRawOne();
      opening_balance = Number(priorResult?.balance || 0);
    }

    return {
      period: { start: date_from || null, end: date_to || null },
      opening_balance,
      total_income,
      total_expense,
      net,
      closing_balance: opening_balance + net,
      transactions_count: transactions.length,
      by_category,
    };
  },

  /**
   * Fluxo de caixa agrupado por período.
   * @param {string} userId
   * @param {number} year
   * @param {string} groupBy - 'day' | 'week' | 'month'
   * @returns {Promise<object[]>}
   */
  async cashFlow(userId, year, groupBy = 'month') {
    let dateFormat;
    switch (groupBy) {
      case 'day':
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        dateFormat = 'IYYY-"W"IW';
        break;
      case 'month':
      default:
        dateFormat = 'YYYY-MM';
        break;
    }

    const result = await TransactionRepository.createQueryBuilder('t')
      .select(`TO_CHAR(t.date, '${dateFormat}')`, 'period')
      .addSelect("SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END)", 'income')
      .addSelect("SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END)", 'expense')
      .where('t.user_id = :userId', { userId })
      .andWhere('t.status = :status', { status: 'confirmed' })
      .andWhere('t.deleted_at IS NULL')
      .andWhere("t.type != 'transfer'")
      .andWhere('EXTRACT(YEAR FROM t.date) = :year', { year })
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();

    return result.map((row) => ({
      period: row.period,
      income: Number(row.income),
      expense: Number(row.expense),
      net: Number(row.income) - Number(row.expense),
    }));
  },

  /**
   * Exporta transações em CSV ou PDF.
   * @param {string} userId
   * @param {object} params - { date_from, date_to, format, account_id }
   * @returns {Promise<{ contentType: string, data: Buffer|string }>}
   */
  async export(userId, params) {
    const { date_from, date_to, format, account_id } = params;

    const qb = TransactionRepository.createQueryBuilder('t')
      .leftJoinAndSelect('t.account', 'account')
      .leftJoinAndSelect('t.category', 'category')
      .where('t.user_id = :userId', { userId })
      .andWhere('t.status = :status', { status: 'confirmed' })
      .andWhere('t.deleted_at IS NULL');

    if (date_from) qb.andWhere('t.date >= :dateFrom', { dateFrom: date_from });
    if (date_to) qb.andWhere('t.date <= :dateTo', { dateTo: date_to });
    if (account_id) qb.andWhere('t.account_id = :accountId', { accountId: account_id });

    const transactions = await qb.orderBy('t.date', 'DESC').getMany();

    if (format === 'csv') {
      return this._exportCSV(transactions);
    } else if (format === 'pdf') {
      return this._exportPDF(transactions);
    }

    throw new AppError('Formato inválido. Use csv ou pdf.', 400, 'VALIDATION_ERROR');
  },

  /**
   * Gera CSV das transações.
   * @param {Array} transactions
   * @returns {{ contentType: string, data: string }}
   */
  _exportCSV(transactions) {
    const header = 'date,type,amount,description,account,category,status\n';
    const rows = transactions.map((tx) =>
      [
        tx.date,
        tx.type,
        tx.amount,
        `"${(tx.description || '').replace(/"/g, '""')}"`,
        `"${(tx.account?.name || '').replace(/"/g, '""')}"`,
        `"${(tx.category?.name || '').replace(/"/g, '""')}"`,
        tx.status,
      ].join(',')
    );
    return {
      contentType: 'text/csv',
      data: header + rows.join('\n'),
    };
  },

  /**
   * Gera PDF das transações.
   * @param {Array} transactions
   * @returns {Promise<{ contentType: string, data: Buffer }>}
   */
  async _exportPDF(transactions) {
    const PDFDocument = require('pdfkit');

    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        resolve({
          contentType: 'application/pdf',
          data: Buffer.concat(chunks),
        });
      });

      doc.fontSize(16).text('Relatório de Transações', { align: 'center' });
      doc.moveDown();

      doc.fontSize(8);
      const tableTop = doc.y;
      const colWidths = [70, 55, 65, 140, 80, 80, 55];
      const headers = ['Data', 'Tipo', 'Valor', 'Descrição', 'Conta', 'Categoria', 'Status'];

      headers.forEach((h, i) => {
        const x = 30 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.font('Helvetica-Bold').text(h, x, tableTop, { width: colWidths[i] });
      });

      doc.moveDown();
      let y = doc.y;

      for (const tx of transactions) {
        if (y > 750) {
          doc.addPage();
          y = 30;
        }
        const row = [
          tx.date,
          tx.type,
          String(tx.amount),
          (tx.description || '').slice(0, 30),
          (tx.account?.name || '').slice(0, 15),
          (tx.category?.name || '').slice(0, 15),
          tx.status,
        ];
        row.forEach((cell, i) => {
          const x = 30 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
          doc.font('Helvetica').text(cell, x, y, { width: colWidths[i] });
        });
        y += 15;
      }

      doc.end();
    });
  },
};

module.exports = ReportService;
