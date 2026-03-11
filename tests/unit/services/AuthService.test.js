const AuthService = require("../../../src/services/AuthService");
const UserRepository = require("../../../src/repositories/UserRepository");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../../../src/repositories/UserRepository");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("AuthService", () => {
  afterEach(() => jest.clearAllMocks());

  describe("register", () => {
    it("deve lançar erro 409 quando e-mail já existe", async () => {
      // TODO: implemente o teste
    });

    it("deve criar usuário e retornar tokens", async () => {
      // TODO: implemente o teste
    });
  });

  describe("login", () => {
    it("deve lançar erro 401 quando usuário não existe", async () => {
      // TODO: implemente o teste
    });

    it("deve lançar erro 401 quando senha é inválida", async () => {
      // TODO: implemente o teste
    });

    it("deve retornar tokens quando credenciais estão corretas", async () => {
      // TODO: implemente o teste
    });
  });
});
