/**
 * Calcula a próxima data de vencimento baseado na frequência.
 *
 * @param {Date|string} currentDate - Data de referência
 * @param {'daily'|'weekly'|'monthly'|'yearly'} frequency
 * @returns {Date}
 */
function calculateNextDueDate(currentDate, frequency) {
  const date = new Date(currentDate);

  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      throw new Error(`Frequência inválida: ${frequency}`);
  }

  return date;
}

/**
 * Verifica se uma data é futura em relação a hoje.
 *
 * @param {Date|string} date
 * @returns {boolean}
 */
function isFutureDate(date) {
  const target = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return target > today;
}

module.exports = { calculateNextDueDate, isFutureDate };
