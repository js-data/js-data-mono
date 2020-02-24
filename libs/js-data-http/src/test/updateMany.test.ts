import { Post, requests } from './_setup';

describe('createMany', () => {
  it('should createMany', done => {
    const many = [{author_id: 2, text: 'bar', id: 1}, {author_id: 2, text: 'foo', id: 2}];

    setTimeout(() => {
      requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify(many))
    }, 5);

    Post.updateMany(many).then((result) => {
      expect(requests[0].url).toEqual('api/posts');
      expect(requests[0].method).toEqual('PUT');
      expect(requests[0].requestBody).toEqual(JSON.stringify(many));
      done()
    })
  })
});
