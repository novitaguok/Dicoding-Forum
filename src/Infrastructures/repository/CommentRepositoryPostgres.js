const CommentRepository = require("../../Domains/comments/CommentRepository");
const RegisteredComment = require("../../Domains/comments/entities/RegisteredComment");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(registerComment, threadId, owner) {
    const { content } = registerComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner",
      values: [id, content, date, threadId, owner, false],
    };

    const result = await this._pool.query(query);

    return new RegisteredComment({ ...result.rows[0] });
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, users.username, comments.date, comments.content, comments.is_deleted
             FROM comments
             LEFT JOIN users ON comments.owner = users.id
             WHERE comments.thread_id = $1
             ORDER BY comments.date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deleteComment(commentId) {
    const query = {
      text: "UPDATE comments SET is_deleted = true WHERE id = $1",
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async verifyCommentExists(commentId) {
    const query = {
      text: "SELECT 1 FROM comments WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("komentar tidak ditemukan");
    }
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: `SELECT c.id
             FROM comments c
             INNER JOIN users u ON u.id = c.owner
             WHERE c.id = $1 AND c.owner = $2`,
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }
}

module.exports = CommentRepositoryPostgres;
