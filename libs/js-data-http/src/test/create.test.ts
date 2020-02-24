import { adapter, p1, Post, requests } from './_setup';

describe('create', () => {
  it('should create', () => {
    const post = {
      author: 'John',
      age: 30
    };

    setTimeout(() => {
      requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify(p1))
    }, 30);

    return adapter.create(Post, post)
      .then(data => {
        expect(requests[0].url).toEqual('api/posts');
        expect(requests[0].method).toEqual('POST');
        expect(requests[0].requestBody).toEqual(JSON.stringify(post));
        expect(data).toEqual(p1);

        setTimeout(() => {
          requests[1].respond(200, {'Content-Type': 'application/json'}, JSON.stringify(p1))
        }, 30);

        return adapter.create(Post, post, {
          basePath: 'api2'
        })
      })
      .then(data => {
        expect(requests[1].url).toEqual('api2/posts');
        expect(requests[1].requestBody).toEqual(JSON.stringify(post));
        expect(data).toEqual(p1)
      });
  })
});
