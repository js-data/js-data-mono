import { adapter, Post, requests } from './_setup';

describe('sum', () => {
  it('should sum=<field> in query_params', done => {
    setTimeout(() => {
      requests[0].respond(200, {'Content-Type': 'application/json'}, '{"sum": 5}')
    }, 5);

    adapter.sum(Post, 'num_views').then(() => {
      expect(requests[0].url).toEqual('api/posts?sum=num_views');
      done()
    })
  })
});
