const CategoryService = require("../services/CategoryService");

/**
 * Controller de categorias.
 */
const CategoryController = {
  /** GET /categories */
  async list(req, res) {
    const categories = await CategoryService.list(req.user.id, req.query.type);
    res.json(categories);
  },

  /** POST /categories */
  async create(req, res) {
    const category = await CategoryService.create(req.user.id, req.body);
    res.status(201).json(category);
  },

  /** GET /categories/:id */
  async findById(req, res) {
    const category = await CategoryService.findById(req.params.id, req.user.id);
    res.json(category);
  },

  /** PATCH /categories/:id */
  async update(req, res) {
    const category = await CategoryService.update(
      req.params.id,
      req.user.id,
      req.body,
    );
    res.json(category);
  },

  /** DELETE /categories/:id */
  async remove(req, res) {
    await CategoryService.remove(req.params.id, req.user.id);
    res.status(204).send();
  },
};

module.exports = CategoryController;
