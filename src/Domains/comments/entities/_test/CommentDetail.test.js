const CommentDetail = require("../CommentDetail");

describe("a CommentDetail entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "dicoding",
      date: "2021-08-08T07:22:33.555Z",
    };

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrowError(
      "COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      id: 123,
      username: "dicoding",
      date: "2021-08-08T07:22:33.555Z",
      content: "sebuah comment",
    };

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrowError(
      "COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create commentDetail object correctly", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "dicoding",
      date: "2021-08-08T07:22:33.555Z",
      content: "sebuah comment",
      isDeleted: false,
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.content).toEqual(payload.content);
  });

  it("should create commentDetail object correctly when comment is deleted", () => {
    // Arrange
    const payload = {
      id: "comment-123",
      username: "dicoding",
      date: "2021-08-08T07:22:33.555Z",
      content: "sebuah comment",
      isDeleted: true,
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.content).toEqual("**komentar telah dihapus**");
  });
});
