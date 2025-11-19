const DeleteCommentUseCase = require("../DeleteCommentUseCase");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");

describe("DeleteCommentUseCase", () => {
  it("should orchestrating the delete comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
    };
    const owner = "user-123";

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCasePayload, owner);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
      useCasePayload.commentId
    );
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(
      useCasePayload.commentId,
      owner
    );
    expect(mockCommentRepository.deleteComment).toBeCalledWith(
      useCasePayload.commentId
    );
  });
});
