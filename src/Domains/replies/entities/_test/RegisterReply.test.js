const RegisterReply = require("../RegisterReply");

describe("a RegisterReply entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new RegisterReply(payload)).toThrowError(
      "REGISTER_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      content: 123,
    };

    // Action and Assert
    expect(() => new RegisterReply(payload)).toThrowError(
      "REGISTER_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create registerReply object correctly", () => {
    // Arrange
    const payload = {
      content: "sebuah balasan",
    };

    // Action
    const { content } = new RegisterReply(payload);

    // Assert
    expect(content).toEqual(payload.content);
  });
});
