const RegisteredThread = require("../RegisteredThread");

describe("a RegisteredThread entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      id: "thread-123",
      title: "sebuah thread",
    };

    // Action and Assert
    expect(() => new RegisteredThread(payload)).toThrowError(
      "REGISTERED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      id: 123,
      title: "sebuah thread",
      owner: "user-123",
    };

    // Action and Assert
    expect(() => new RegisteredThread(payload)).toThrowError(
      "REGISTERED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create registeredThread object correctly", () => {
    // Arrange
    const payload = {
      id: "thread-123",
      title: "sebuah thread",
      owner: "user-123",
    };

    // Action
    const registeredThread = new RegisteredThread(payload);

    // Assert
    expect(registeredThread.id).toEqual(payload.id);
    expect(registeredThread.title).toEqual(payload.title);
    expect(registeredThread.owner).toEqual(payload.owner);
  });
});
