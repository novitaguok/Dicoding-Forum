const CommentLikeRepository = require("../../Domains/comments/CommentLikeRepository");

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(commentId, owner) {
    const id = `like-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO comment_likes VALUES($1, $2, $3, $4)",
      values: [id, commentId, owner, date],
    };

    await this._pool.query(query);
  }

  async deleteLike(commentId, owner) {
    const query = {
      text: "DELETE FROM comment_likes WHERE comment_id = $1 AND owner = $2",
      values: [commentId, owner],
    };

    await this._pool.query(query);
  }

  async verifyLikeExists(commentId, owner) {
    const query = {
      text: "SELECT 1 FROM comment_likes WHERE comment_id = $1 AND owner = $2",
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async getLikeCountByCommentId(commentId) {
    const query = {
      text: "SELECT COUNT(*)::int as count FROM comment_likes WHERE comment_id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows[0].count;
  }

  async getLikeCountsByThreadId(threadId) {
    const query = {
      text: `SELECT cl.comment_id, COUNT(*)::int as count
             FROM comment_likes cl
             INNER JOIN comments c ON c.id = cl.comment_id
             WHERE c.thread_id = $1
             GROUP BY cl.comment_id`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    const likeCounts = {};
    result.rows.forEach((row) => {
      likeCounts[row.comment_id] = row.count;
    });

    return likeCounts;
  }
}

module.exports = CommentLikeRepositoryPostgres;
