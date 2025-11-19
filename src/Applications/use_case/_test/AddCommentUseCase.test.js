const AddCommentUseCase = require("../AddCommentUseCase");
const RegisterComment = require("../../../Domains/comments/entities/RegisterComment");
const RegisteredComment = require("../../../Domains/comments/entities/RegisteredComment");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");

describe("AddCommentUseCase", () => {
  it("should orchestrating the add comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "sebuah comment",
    };
    const threadId = "thread-123";
    const owner = "user-123";

    const mockRegisteredComment = new RegisteredComment({
      id: "comment-123",
      content: useCasePayload.content,
      owner,
    });

    const expectedRegisteredComment = new RegisteredComment({
      id: "comment-123",
      content: "sebuah comment",
      owner: "user-123",
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockRegisteredComment));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const registeredComment = await addCommentUseCase.execute(
      useCasePayload,
      threadId,
      owner
    );

    // Assert
    expect(registeredComment).toStrictEqual(expectedRegisteredComment);

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockCommentRepository.addComment).toBeCalledWith(
      new RegisterComment({
        content: useCasePayload.content,
      }),
      threadId,
      owner
    );
  });
});
