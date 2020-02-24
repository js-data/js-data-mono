import { adapter, Post, requests } from './_setup';

describe('destroyAll', () => {
  it('should destroyAll', () => {
    setTimeout(() => {
      requests[0].respond(204)
    }, 30);

    return adapter.destroyAll(Post, {})
      .then((data) => {
        expect(1).toEqual(requests.length);
        expect(requests[0].url).toEqual('api/posts');
        expect(requests[0].method).toEqual('DELETE');
        expect('').toEqual(data);

        setTimeout(() => {
          requests[1].respond(204)
        }, 30);

        return adapter.destroyAll(Post, {
          where: {
            author: {
              '==': 'John'
            }
          }
        }, {basePath: 'api2'})
      })
      .then(data => {
        expect(2).toEqual(requests.length);
        expect(requests[1].url.indexOf('api2/posts?where=')).toEqual(0);
        expect(requests[1].method).toEqual('DELETE');
        expect('').toEqual(data)
      });
  })
});
