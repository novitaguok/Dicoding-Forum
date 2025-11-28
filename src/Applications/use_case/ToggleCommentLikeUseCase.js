class ToggleCommentLikeUseCase {
  constructor({ commentRepository, commentLikeRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._commentLikeRepository = commentLikeRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, userId } = useCasePayload;

    // Verify thread exists
    await this._threadRepository.verifyThreadExists(threadId);

    // Verify comment exists
    await this._commentRepository.verifyCommentExists(commentId);

    // Check if user already liked the comment
    const isLiked = await this._commentLikeRepository.verifyLikeExists(
      commentId,
      userId
    );

    if (isLiked) {
      // Unlike - remove the like
      await this._commentLikeRepository.deleteLike(commentId, userId);
    } else {
      // Like - add the like
      await this._commentLikeRepository.addLike(commentId, userId);
    }
  }
}

module.exports = ToggleCommentLikeUseCase;
