const ToggleCommentLikeUseCase = require("../ToggleCommentLikeUseCase");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const CommentLikeRepository = require("../../../Domains/comments/CommentLikeRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");

describe("ToggleCommentLikeUseCase", () => {
  it("should orchestrate the add like action correctly when user has not liked", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
      userId: "user-123",
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.verifyLikeExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(false));
    mockCommentLikeRepository.addLike = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const toggleCommentLikeUseCase = new ToggleCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    await toggleCommentLikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith("thread-123");
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
      "comment-123"
    );
    expect(mockCommentLikeRepository.verifyLikeExists).toBeCalledWith(
      "comment-123",
      "user-123"
    );
    expect(mockCommentLikeRepository.addLike).toBeCalledWith(
      "comment-123",
      "user-123"
    );
  });

  it("should orchestrate the remove like action correctly when user has liked", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
      userId: "user-123",
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.verifyLikeExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentLikeRepository.deleteLike = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const toggleCommentLikeUseCase = new ToggleCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    await toggleCommentLikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith("thread-123");
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
      "comment-123"
    );
    expect(mockCommentLikeRepository.verifyLikeExists).toBeCalledWith(
      "comment-123",
      "user-123"
    );
    expect(mockCommentLikeRepository.deleteLike).toBeCalledWith(
      "comment-123",
      "user-123"
    );
  });
});
