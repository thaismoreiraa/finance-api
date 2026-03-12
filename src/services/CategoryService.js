const CategoryRepository = require('../repositories/CategoryRepository');
const AppError = require('../utils/AppError');

/**
 * Serviço de categorias.
 */
const CategoryService = {
  /**
   * Lista categorias do usuário, com filtro opcional por tipo.
   * @param {string} userId
   * @param {string} [type]
   * @returns {Promise<Category[]>}
   */
  async list(userId, type) {
    return CategoryRepository.findByUser(userId, type);
  },

  /**
   * Cria uma nova categoria.
   * @param {string} userId
   * @param {object} data
   * @returns {Promise<Category>}
   */
  async create(userId, data) {
    if (data.parent_id) {
      const parent = await CategoryRepository.findByIdAndUser(data.parent_id, userId);
      if (!parent) throw new AppError('Categoria pai não encontrada.', 404, 'NOT_FOUND');
      if (parent.type !== data.type) {
        throw new AppError(
          'Subcategoria deve ter o mesmo tipo da categoria pai.',
          400,
          'VALIDATION_ERROR'
        );
      }
    }

    const category = CategoryRepository.create({ ...data, user_id: userId });
    return CategoryRepository.save(category);
  },

  /**
   * Busca categoria por ID.
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Category>}
   */
  async findById(id, userId) {
    const category = await CategoryRepository.findByIdAndUser(id, userId);
    if (!category) throw new AppError('Categoria não encontrada.', 404, 'NOT_FOUND');
    return category;
  },

  /**
   * Atualiza uma categoria.
   * @param {string} id
   * @param {string} userId
   * @param {object} data
   * @returns {Promise<Category>}
   */
  async update(id, userId, data) {
    const category = await this.findById(id, userId);

    if (data.parent_id) {
      const parent = await CategoryRepository.findByIdAndUser(data.parent_id, userId);
      if (!parent) throw new AppError('Categoria pai não encontrada.', 404, 'NOT_FOUND');
      const targetType = data.type || category.type;
      if (parent.type !== targetType) {
        throw new AppError(
          'Subcategoria deve ter o mesmo tipo da categoria pai.',
          400,
          'VALIDATION_ERROR'
        );
      }
    }

    Object.assign(category, data);
    return CategoryRepository.save(category);
  },

  /**
   * Remove (soft delete) uma categoria.
   * Lança 409 se houver transações vinculadas.
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async remove(id, userId) {
    const category = await this.findById(id, userId);

    const hasTx = await CategoryRepository.hasTransactions(id);
    if (hasTx) {
      throw new AppError(
        'Categoria possui transações vinculadas. Reclassifique-as antes de excluir.',
        409,
        'CONFLICT'
      );
    }

    category.deleted_at = new Date();
    await CategoryRepository.save(category);
  },
};

module.exports = CategoryService;
