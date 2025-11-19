const RegisterReply = require("../../Domains/replies/entities/RegisterReply");

class AddReplyUseCase {
  constructor({ replyRepository, threadRepository, commentRepository }) {
    this._replyRepository = replyRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload, threadId, commentId, owner) {
    // Verify thread exists
    await this._threadRepository.verifyThreadExists(threadId);

    // Verify comment exists
    await this._commentRepository.verifyCommentExists(commentId);

    const registerReply = new RegisterReply(useCasePayload);
    return this._replyRepository.addReply(
      registerReply,
      threadId,
      commentId,
      owner
    );
  }
}

module.exports = AddReplyUseCase;
