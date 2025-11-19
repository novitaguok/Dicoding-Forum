const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const ReplyRepository = require("../../Domains/replies/ReplyRepository");
const RegisteredReply = require("../../Domains/replies/entities/RegisteredReply");

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(registerReply, threadId, commentId, owner) {
    const { content } = registerReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, content, owner",
      values: [id, content, owner, commentId, threadId, false, date],
    };

    const result = await this._pool.query(query);

    return new RegisteredReply({ ...result.rows[0] });
  }

  async verifyReplyExists(replyId) {
    const query = {
      text: "SELECT id FROM replies WHERE id = $1",
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("balasan tidak ditemukan");
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: `SELECT r.id
             FROM replies r
             INNER JOIN users u ON u.id = r.owner
             WHERE r.id = $1 AND r.owner = $2`,
      values: [replyId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: "UPDATE replies SET is_delete = true WHERE id = $1",
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `SELECT r.id, u.username, r.date, r.content, r.is_delete
             FROM replies r
             LEFT JOIN users u ON u.id = r.owner
             WHERE r.comment_id = $1
             ORDER BY r.date ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = ReplyRepositoryPostgres;
