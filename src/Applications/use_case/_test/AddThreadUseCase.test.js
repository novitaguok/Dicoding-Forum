const AddThreadUseCase = require("../AddThreadUseCase");
const RegisterThread = require("../../../Domains/threads/entities/RegisterThread");
const RegisteredThread = require("../../../Domains/threads/entities/RegisteredThread");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");

describe("AddThreadUseCase", () => {
  it("should orchestrating the add thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      title: "sebuah thread",
      body: "sebuah body thread",
    };
    const owner = "user-123";

    const mockRegisteredThread = new RegisteredThread({
      id: "thread-123",
      title: useCasePayload.title,
      owner,
    });

    const expectedRegisteredThread = new RegisteredThread({
      id: "thread-123",
      title: "sebuah thread",
      owner: "user-123",
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockRegisteredThread));

    /** creating use case instance */
    const getAddThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const registeredThread = await getAddThreadUseCase.execute(
      useCasePayload,
      owner
    );

    // Assert
    expect(registeredThread).toStrictEqual(expectedRegisteredThread);

    expect(mockThreadRepository.addThread).toBeCalledWith(
      new RegisterThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
      }),
      owner
    );
  });
});
