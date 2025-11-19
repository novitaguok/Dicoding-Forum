const RegisteredReply = require("../RegisteredReply");

describe("a RegisteredReply entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      content: "sebuah balasan",
      owner: "user-123",
    };

    // Action and Assert
    expect(() => new RegisteredReply(payload)).toThrowError(
      "REGISTERED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      id: 123,
      content: "sebuah balasan",
      owner: "user-123",
    };

    // Action and Assert
    expect(() => new RegisteredReply(payload)).toThrowError(
      "REGISTERED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create registeredReply object correctly", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      content: "sebuah balasan",
      owner: "user-123",
    };

    // Action
    const registeredReply = new RegisteredReply(payload);

    // Assert
    expect(registeredReply.id).toEqual(payload.id);
    expect(registeredReply.content).toEqual(payload.content);
    expect(registeredReply.owner).toEqual(payload.owner);
  });
});
