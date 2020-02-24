import { adapter, p1, Post, requests } from './_setup';

describe('updateAll', () => {
  it('should updateAll', () => {
    setTimeout(() => {
      requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify([p1]))
    }, 30);

    return adapter.updateAll(Post, {author: 'John', age: 30})
      .then((data) => {
        expect(1).toEqual(requests.length);
        expect(requests[0].url).toEqual('api/posts');
        expect(requests[0].method).toEqual('PUT');
        expect(data).toEqual([p1]);

        setTimeout(() => {
          requests[1].respond(200, {'Content-Type': 'application/json'}, JSON.stringify([p1]))
        }, 30);

        return adapter.updateAll(Post, {author: 'John', age: 30}, {
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
        expect(requests[1].method).toEqual('PUT');
        expect(data).toEqual([p1])
      });
  })
});
