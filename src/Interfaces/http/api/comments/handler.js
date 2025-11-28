const AddCommentUseCase = require("../../../../Applications/use_case/AddCommentUseCase");
const DeleteCommentUseCase = require("../../../../Applications/use_case/DeleteCommentUseCase");
const ToggleCommentLikeUseCase = require("../../../../Applications/use_case/ToggleCommentLikeUseCase");

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.putCommentLikeHandler = this.putCommentLikeHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(
      AddCommentUseCase.name
    );
    const { id: credentialId } = request.auth.credentials;
    const { threadId } = request.params;
    const addedComment = await addCommentUseCase.execute(
      request.payload,
      threadId,
      credentialId
    );

    const response = h.response({
      status: "success",
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const deleteCommentUseCase = this._container.getInstance(
      DeleteCommentUseCase.name
    );
    const { id: credentialId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    await deleteCommentUseCase.execute({ threadId, commentId }, credentialId);

    const response = h.response({
      status: "success",
    });
    response.code(200);
    return response;
  }

  async putCommentLikeHandler(request, h) {
    const toggleCommentLikeUseCase = this._container.getInstance(
      ToggleCommentLikeUseCase.name
    );
    const { id: credentialId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    await toggleCommentLikeUseCase.execute({
      threadId,
      commentId,
      userId: credentialId,
    });

    const response = h.response({
      status: "success",
    });
    response.code(200);
    return response;
  }
}

module.exports = CommentsHandler;
