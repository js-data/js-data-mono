import fetchMock from 'jest-fetch-mock';
import { adapter, objectsEqual, p1, Post, requests } from './_setup';
import { DataStore, Mapper } from '@js-data/js-data';
import { FetchAdapter } from '@js-data/js-data-fetch';

describe('find', () => {
  it('should find', () => {
    fetchMock.mockResponse(JSON.stringify(p1), {status: 200, headers: {'Content-Type': 'application/json'}});

    return adapter.find(Post, 1)
      .then((data) => {
        expect(requests.length).toBe(1);
        expect(requests[0][0]).toEqual('api/posts/1');
        expect(requests[0][1].method).toEqual('GET');
        expect(data).toEqual(p1);

        // fetchMock.mockResponseOnce(JSON.stringify(p1), {status: 200, headers: {'Content-Type': 'application/json'}});

        return adapter.find(Post, 1, {basePath: 'api2'});
      })
      .then((data) => {
        expect(2).toEqual(requests.length);
        expect(requests[1][0]).toEqual('api2/posts/1');
        expect(requests[1][1].method).toEqual('GET');
        expect(data).toEqual(p1);
      });
  });

  it('should use default configs', function () {
    adapter.httpConfig.params = {test: 'test'};
    adapter.httpConfig.headers = {Authorization: 'test'};

    fetchMock.mockResponse(JSON.stringify(p1), {status: 200, headers: {'Content-Type': 'application/json'}});

    return adapter.find(Post, 1)
      .then((data) => {
        expect(1).toEqual(requests.length);
        expect(requests[0][0]).toEqual('api/posts/1?test=test');
        expect(requests[0][1].method).toEqual('GET');
        expect((requests[0][1].headers as Headers).get('Authorization')).toEqual('test');
        expect(data).toEqual(p1);

        delete adapter.httpConfig.params.test;
        delete adapter.httpConfig.headers.Authorization;
      })
      .catch((err) => {
        delete adapter.httpConfig.params.test;
        delete adapter.httpConfig.headers.Authorization;
        return Promise.reject(err);
      });
  });

  it('should log errors', () => {
    let loggedError;

    adapter.error = err => {
      loggedError = err;
    };

    fetchMock.mockResponse('Not Found', {status: 404, headers: {'Content-Type': 'application/json'}});

    return adapter.find(Post, 1)
      .then(() => {
        throw new Error('Should not have succeeded!');
      }, () => {
        expect(1).toEqual(requests.length);
        expect(requests[0][0]).toEqual('api/posts/1');
        expect(requests[0][1].method).toEqual('GET');
        expect(typeof loggedError).toBe('string');
        expect(loggedError.indexOf('api/posts/1') !== -1).toBe(true);
      });
  });

  it('should use suffixes', () => {
    const Thing = new Mapper({
      name: 'thing',
      endpoint: 'things',
      suffix: '.xml'
    });

    const otherAdapter = new FetchAdapter({
      suffix: '.json'
    });
    otherAdapter.http = adapter.http;

    fetchMock.mockResponse(JSON.stringify({id: 1}), {status: 200, headers: {'Content-Type': 'application/json'}});

    return adapter.find(Thing, 1)
      .then(() => {
        expect(1).toEqual(requests.length);
        expect(requests[0][0]).toEqual('things/1.xml');
        expect(requests[0][1].method).toEqual('GET');

        return otherAdapter.find(Post, 1);
      }).then(() => {
        expect(2).toEqual(requests.length);
        expect(requests[1][0]).toEqual('api/posts/1.json');
        expect(requests[1][1].method).toEqual('GET');
      });
  });

  it('should work with multiple parents', () => {
    const store = new DataStore({
      mapperDefaults: {
        basePath: 'api'
      }
    });
    store.registerAdapter('http', adapter, {default: true});
    store.defineMapper('user', {
      relations: {
        hasMany: {
          post: {
            foreignKey: 'userId',
            localField: 'posts'
          },
          comment: {
            foreignKey: 'userId',
            localField: 'comments'
          }
        }
      }
    });
    store.defineMapper('post', {
      endpoint: 'posts',
      relations: {
        belongsTo: {
          user: {
            parent: true,
            foreignKey: 'userId',
            localField: 'user'
          }
        },
        hasMany: {
          comment: {
            localField: 'comments',
            foreignKey: 'postId'
          }
        }
      }
    });
    store.defineMapper('comment', {
      relations: {
        belongsTo: {
          post: {
            parent: true,
            foreignKey: 'postId',
            localField: 'post'
          },
          user: {
            parent: true,
            foreignKey: 'userId',
            localField: 'user'
          }
        }
      }
    });

    const post = {
      id: 1,
      userId: 10
    };

    const comment = {
      id: 3,
      postId: 1,
      userId: 13
    };

    const comment2 = {
      id: 4,
      userId: 7
    };

    fetchMock.mockResponse(JSON.stringify(post), {status: 200, headers: {'Content-Type': 'application/json'}});

    return store.find('post', 1, {params: {userId: 10}})
      .then((data) => {
        expect(1).toEqual(requests.length);
        expect(requests[0][0]).toEqual('api/user/10/posts/1');
        expect(requests[0][1].method).toEqual('GET');
        objectsEqual(data, post, 'post should have been found');

        fetchMock.mockResponse(JSON.stringify(comment), {status: 200, headers: {'Content-Type': 'application/json'}});

        return store.find('comment', 3, {params: {postId: 1, userId: 13}});
      })
      .then((data) => {
        expect(2).toEqual(requests.length);
        expect(requests[1][0]).toEqual('api/user/13/posts/1/comment/3');
        expect(requests[1][1].method).toEqual('GET');
        objectsEqual(data, comment, 'comment should have been found');

        fetchMock.mockResponse(JSON.stringify(comment2), {status: 200, headers: {'Content-Type': 'application/json'}});

        return store.find('comment', 4, {params: {userId: 7}});
      })
      .then((data) => {
        expect(3).toEqual(requests.length);
        expect(requests[2][0]).toEqual('api/user/7/comment/4');
        expect(requests[2][1].method).toEqual('GET');
        objectsEqual(data, comment2, 'comment should have been found');
      });
  });
});
