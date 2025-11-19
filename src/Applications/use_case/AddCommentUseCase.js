const RegisterComment = require("../../Domains/comments/entities/RegisterComment");

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, threadId, owner) {
    const registerComment = new RegisterComment(useCasePayload);
    await this._threadRepository.verifyThreadExists(threadId);
    return this._commentRepository.addComment(registerComment, threadId, owner);
  }
}

module.exports = AddCommentUseCase;
