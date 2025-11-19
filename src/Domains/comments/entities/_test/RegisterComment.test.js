const RegisterComment = require("../RegisterComment");

describe("a RegisterComment entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new RegisterComment(payload)).toThrowError(
      "REGISTER_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      content: 123,
    };

    // Action and Assert
    expect(() => new RegisterComment(payload)).toThrowError(
      "REGISTER_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create registerComment object correctly", () => {
    // Arrange
    const payload = {
      content: "sebuah comment",
    };

    // Action
    const { content } = new RegisterComment(payload);

    // Assert
    expect(content).toEqual(payload.content);
  });
});
