const GoalRepository = require("../repositories/GoalRepository");
const AppError = require("../utils/AppError");

/**
 * Serviço de metas.
 */
const GoalService = {
  /**
   * Lista metas do usuário, com filtro opcional por status.
   * @param {string} userId
   * @param {string} [status]
   * @returns {Promise<object[]>}
   */
  async list(userId, status) {
    const goals = await GoalRepository.findByUser(userId, status);
    return goals.map((g) => this._enrichGoal(g));
  },

  /**
   * Cria uma nova meta.
   * @param {string} userId
   * @param {object} data
   * @returns {Promise<object>}
   */
  async create(userId, data) {
    const goal = GoalRepository.create({ ...data, user_id: userId });
    const saved = await GoalRepository.save(goal);
    return this._enrichGoal(saved);
  },

  /**
   * Busca meta por ID.
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<object>}
   */
  async findById(id, userId) {
    const goal = await GoalRepository.findByIdAndUser(id, userId);
    if (!goal) throw new AppError("Meta não encontrada.", 404, "NOT_FOUND");
    return this._enrichGoal(goal);
  },

  /**
   * Atualiza uma meta.
   * @param {string} id
   * @param {string} userId
   * @param {object} data
   * @returns {Promise<object>}
   */
  async update(id, userId, data) {
    const goal = await GoalRepository.findByIdAndUser(id, userId);
    if (!goal) throw new AppError("Meta não encontrada.", 404, "NOT_FOUND");
    Object.assign(goal, data);
    const saved = await GoalRepository.save(goal);
    return this._enrichGoal(saved);
  },

  /**
   * Exclui uma meta.
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async remove(id, userId) {
    const goal = await GoalRepository.findByIdAndUser(id, userId);
    if (!goal) throw new AppError("Meta não encontrada.", 404, "NOT_FOUND");
    await GoalRepository.remove(goal);
  },

  /**
   * Adiciona um depósito à meta. Auto-completa se atingir o target.
   * @param {string} id
   * @param {string} userId
   * @param {number} amount
   * @returns {Promise<object>}
   */
  async deposit(id, userId, amount) {
    const goal = await GoalRepository.findByIdAndUser(id, userId);
    if (!goal) throw new AppError("Meta não encontrada.", 404, "NOT_FOUND");

    if (goal.status !== "active") {
      throw new AppError(
        "Só é possível depositar em metas ativas.",
        400,
        "VALIDATION_ERROR",
      );
    }

    goal.current_amount = Number(goal.current_amount) + amount;

    if (goal.current_amount >= Number(goal.target_amount)) {
      goal.status = "completed";
    }

    const saved = await GoalRepository.save(goal);
    return this._enrichGoal(saved);
  },

  /**
   * Enriquece uma meta com campos calculados (progress_percent, days_remaining).
   * @param {object} goal
   * @returns {object}
   */
  _enrichGoal(goal) {
    const target = Number(goal.target_amount);
    const current = Number(goal.current_amount);
    const progress_percent =
      target > 0 ? Math.round((current / target) * 10000) / 100 : 0;

    let days_remaining = null;
    if (goal.deadline) {
      const deadline = new Date(goal.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deadline.setHours(0, 0, 0, 0);
      days_remaining = Math.max(
        0,
        Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)),
      );
    }

    return {
      ...goal,
      progress_percent,
      days_remaining,
    };
  },
};

module.exports = GoalService;
