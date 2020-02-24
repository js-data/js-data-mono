import { adapter, Post, requests } from './_setup';

describe('destroy', () => {
  it('should destroy', () => {
    setTimeout(() => {
      requests[0].respond(200, {'Content-Type': 'text/plain'}, '1')
    }, 30);

    return adapter.destroy(Post, 1)
      .then((data) => {
        expect(1).toEqual(requests.length);
        expect(requests[0].url).toEqual('api/posts/1');
        expect(requests[0].method).toEqual('DELETE');
        expect(data).toEqual(1);

        setTimeout(() => {
          requests[1].respond(200, {'Content-Type': 'text/plain'}, '1')
        }, 30);

        return adapter.destroy(Post, 1, {basePath: 'api2'})
      })
      .then(data => {
        expect(2).toEqual(requests.length);
        expect(requests[1].url).toEqual('api2/posts/1');
        expect(requests[1].method).toEqual('DELETE');
        expect(data).toEqual(1)
      });
  })
});
