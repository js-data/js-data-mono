import { adapter, p1, Post, requests } from './_setup';
import { Container } from '@js-data/js-data';

describe('update', () => {
  it('should update', () => {
    setTimeout(() => {
      requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify(p1))
    }, 30);

    return adapter.update(Post, 1, {author: 'John', age: 30})
      .then((data) => {
        expect(1).toEqual(requests.length);
        expect(requests[0].url).toEqual('api/posts/1');
        expect(requests[0].method).toEqual('PUT');
        expect(requests[0].requestBody).toEqual(JSON.stringify({author: 'John', age: 30}));
        expect(data).toEqual(p1);

        setTimeout(() => {
          requests[1].respond(200, {'Content-Type': 'application/json'}, JSON.stringify(p1))
        }, 30);

        return adapter.update(Post, 1, {author: 'John', age: 30}, {basePath: 'api2'})
      })
      .then((data) => {
        expect(2).toEqual(requests.length);
        expect(requests[1].url).toEqual('api2/posts/1');
        expect(requests[1].method).toEqual('PUT');
        expect(requests[1].requestBody).toEqual(JSON.stringify({author: 'John', age: 30}));
        expect(data).toEqual(p1)
      });
  });
  it('should send nested relations', () => {
    const store = new Container();
    store.registerAdapter('http', adapter, {default: true});
    store.defineMapper('user', {
      relations: {
        hasMany: {
          post: {
            localField: 'posts',
            foreignKey: 'userId'
          },
          address: {
            localField: 'addresses',
            foreignKey: 'userId'
          }
        }
      }
    });
    store.defineMapper('post', {
      relations: {
        belongsTo: {
          user: {
            localField: 'user',
            foreignKey: 'userId'
          }
        }
      }
    });
    store.defineMapper('address', {
      relations: {
        belongsTo: {
          user: {
            localField: 'user',
            foreignKey: 'userId'
          }
        }
      }
    });

    setTimeout(() => {
      requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({
        id: 1,
        posts: [
          {
            id: 2,
            userId: 1
          }
        ]
      }))
    }, 30);

    return store.update('user', 1, {
      id: 1,
      posts: [
        {
          id: 2,
          userId: 1
        }
      ],
      addresses: [
        {
          id: 3,
          userId: 1
        }
      ]
    }, {with: ['posts']})
      .then((data) => {
        expect(1).toEqual(requests.length);
        expect(requests[0].url).toEqual('user/1');
        expect(requests[0].method).toEqual('PUT');
        expect(requests[0].requestBody).toEqual(JSON.stringify({
          id: 1,
          posts: [
            {
              id: 2,
              userId: 1
            }
          ]
        }));
        for (const key in data) {
          console.log('key: ', key)
        }
        expect(data).toEqual({
          id: 1,
          posts: [
            {
              id: 2,
              userId: 1
            }
          ]
        })
      });
  })
});
