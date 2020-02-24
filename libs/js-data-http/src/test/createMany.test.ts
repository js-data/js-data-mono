import { Post, requests } from './_setup';

describe('createMany', () => {
  it('should createMany', () => {
    const many = [{author_id: 2, text: 'bar'}, {author_id: 2, text: 'foo'}];

    setTimeout(() => {
      requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify(many))
    }, 5);

    return Post.createMany(many).then(() => {
      expect(requests[0].url).toEqual('api/posts');
      expect(requests[0].method).toEqual('POST');
      expect(requests[0].requestBody).toEqual(JSON.stringify(many))
    });
  })
});
