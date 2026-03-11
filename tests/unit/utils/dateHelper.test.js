const {
  calculateNextDueDate,
  isFutureDate,
} = require("../../../src/utils/dateHelper");

describe("dateHelper", () => {
  describe("calculateNextDueDate", () => {
    it("deve avançar 1 dia para frequência diária", () => {
      // TODO: implemente o teste
    });

    it("deve avançar 7 dias para frequência semanal", () => {
      // TODO: implemente o teste
    });

    it("deve avançar 1 mês para frequência mensal", () => {
      // TODO: implemente o teste
    });

    it("deve avançar 1 ano para frequência anual", () => {
      // TODO: implemente o teste
    });

    it("deve lidar com fim de mês na frequência mensal", () => {
      // TODO: implemente o teste
    });
  });

  describe("isFutureDate", () => {
    it("deve retornar true para data no futuro", () => {
      // TODO: implemente o teste
    });

    it("deve retornar false para data no passado", () => {
      // TODO: implemente o teste
    });
  });
});
