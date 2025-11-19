const ThreadDetail = require("../../Domains/threads/entities/ThreadDetail");
const CommentDetail = require("../../Domains/comments/entities/CommentDetail");

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;

    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(
      threadId
    );

    const mappedComments = await Promise.all(
      comments.map(async (comment) => {
        const replies = await this._replyRepository.getRepliesByCommentId(
          comment.id
        );

        const mappedReplies = replies.map((reply) => ({
          id: reply.id,
          content: reply.is_delete
            ? "**balasan telah dihapus**"
            : reply.content,
          date: reply.date,
          username: reply.username,
        }));

        return new CommentDetail({
          id: comment.id,
          username: comment.username,
          date: comment.date,
          content: comment.content,
          isDeleted: comment.is_deleted,
          replies: mappedReplies,
        });
      })
    );

    return new ThreadDetail({
      ...thread,
      comments: mappedComments,
    });
  }
}

module.exports = GetThreadDetailUseCase;
