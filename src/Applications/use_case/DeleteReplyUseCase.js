class DeleteReplyUseCase {
  constructor({ replyRepository, threadRepository, commentRepository }) {
    this._replyRepository = replyRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, replyId, owner } = useCasePayload;

    // Verify thread exists
    await this._threadRepository.verifyThreadExists(threadId);

    // Verify comment exists
    await this._commentRepository.verifyCommentExists(commentId);

    // Verify reply exists
    await this._replyRepository.verifyReplyExists(replyId);

    // Verify reply owner
    await this._replyRepository.verifyReplyOwner(replyId, owner);

    return this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;
