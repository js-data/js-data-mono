import { adapter, httpTestingController, objectsEqual, p1, Post } from './_setup';
import { DataStore, Mapper } from '@js-data/js-data';
import { HttpAdapter } from '@js-data/js-data-http';

describe('find', () => {
  it('should find', () => {
    setTimeout(() => httpTestingController.expectOne({method: 'GET', url: 'api/posts/1'}).flush(p1), 30);

    return adapter.find(Post, 1)
      .then(data => {
        expect(data).toEqual(p1);

        setTimeout(() => httpTestingController.expectOne({method: 'GET', url: 'api2/posts/1'}).flush(p1), 30);

        return adapter.find(Post, 1, {basePath: 'api2'});
      })
      .then(data => {
        expect(data).toEqual(p1);
      });
  });

  it('should use default configs', function () {
    adapter.httpConfig.params = {test: 'test'};
    adapter.httpConfig.headers = {Authorization: 'test'};

    setTimeout(() => httpTestingController.expectOne(req => {
      return req.method === 'GET'
        && req.params.get('test') === 'test'
        && req.headers.get('Authorization') === 'test'
        && req.url === 'api/posts/1';
    }).flush(p1), 30);


    return adapter.find(Post, 1)
      .then(data => {
        const testHeaders = {
          Authorization: 'test',
          Accept: 'application/json, text/plain, */*'
        };
        // expect(testHeaders).toEqual(requests[0].requestHeaders);
        expect(data).toEqual(p1);

        delete adapter.httpConfig.params.test;
        delete adapter.httpConfig.headers.Authorization;
      })
      .catch(err => {
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

    setTimeout(() => httpTestingController
        .expectOne({url: 'api/posts/1', method: 'GET'})
        .flush({}, {status: 404, statusText: 'Not Found'}),
      30);

    return adapter.find(Post, 1)
      .then(() => {
        throw new Error('Should not have succeeded!');
      }, () => {
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

    const otherAdapter = new HttpAdapter({
      suffix: '.json'
    });
    otherAdapter.http = adapter.http;

    setTimeout(() => {
      httpTestingController.expectOne({url: 'things/1.xml', method: 'GET'}).flush({id: 1});
    }, 30);

    return adapter.find(Thing, 1)
      .then(() => {
        setTimeout(() => {
          httpTestingController.expectOne({url: 'api/posts/1.json', method: 'GET'}).flush({id: 1});
        }, 30);

        return otherAdapter.find(Post, 1);
      }).then(() => {
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

    setTimeout(() => {
      httpTestingController.expectOne({url: 'api/user/10/posts/1', method: 'GET'}).flush(post);
    }, 30);

    return store.find('post', 1, {params: {userId: 10}})
      .then((data) => {
        objectsEqual(data, post, 'post should have been found');

        setTimeout(() => {
          httpTestingController.expectOne({url: 'api/user/13/posts/1/comment/3', method: 'GET'}).flush(comment);
        }, 30);

        return store.find('comment', 3, {params: {postId: 1, userId: 13}});
      })
      .then((data) => {
        objectsEqual(data, comment, 'comment should have been found');

        setTimeout(() => {
          httpTestingController.expectOne({url: 'api/user/7/comment/4', method: 'GET'}).flush(comment2);
        }, 30);

        return store.find('comment', 4, {params: {userId: 7}});
      })
      .then((data) => {
        objectsEqual(data, comment2, 'comment should have been found');
      });
  });
});
