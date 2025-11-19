const AddReplyUseCase = require("../AddReplyUseCase");
const RegisterReply = require("../../../Domains/replies/entities/RegisterReply");
const RegisteredReply = require("../../../Domains/replies/entities/RegisteredReply");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");

describe("AddReplyUseCase", () => {
  it("should orchestrating the add reply action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "sebuah balasan",
    };
    const threadId = "thread-123";
    const commentId = "comment-123";
    const owner = "user-123";

    const mockRegisteredReply = new RegisteredReply({
      id: "reply-123",
      content: useCasePayload.content,
      owner: owner,
    });

    const expectedAddedReply = new RegisteredReply({
      id: "reply-123",
      content: useCasePayload.content,
      owner: owner,
    });

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockRegisteredReply));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(
      useCasePayload,
      threadId,
      commentId,
      owner
    );

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(commentId);
    expect(mockReplyRepository.addReply).toBeCalledWith(
      new RegisterReply({
        content: useCasePayload.content,
      }),
      threadId,
      commentId,
      owner
    );
  });
});
