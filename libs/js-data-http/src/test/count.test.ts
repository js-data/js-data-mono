import { adapter, Post, requests } from "./_setup";

describe('count', () => {
  it('should include count=true in query_params', done => {
    setTimeout(() => {
      requests[0].respond(200, {'Content-Type': 'application/json'}, '{"count": 5}');
    }, 5);

    adapter.count(Post).then(() => {
      expect(requests[0].url).toEqual('api/posts?count=true');
      done();
    });
  });
});
