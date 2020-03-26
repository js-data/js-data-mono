import { adapter, httpTestingController, p1, Post } from './_setup';

describe('find', () => {
  it('should find', () => {
    setTimeout(() => {
      httpTestingController.expectOne({method: 'GET', url: 'api/posts/1'})
        .flush(p1);
    }, 30);

    return adapter.find(Post, 1)
      .then(data => {
        // expect(1).toEqual(requests.length);
        // expect(requests[0].url).toEqual('api/posts/1');
        // expect(requests[0].method).toEqual('GET');
        expect(data).toEqual(p1);

      //   setTimeout(() => {
      //     requests[1].respond(200, {'Content-Type': 'application/json'}, JSON.stringify(p1));
      //   }, 30);
      //
      //   return adapter.find(Post, 1, {basePath: 'api2'});
      // })
      // .then((data) => {
      //   expect(2).toEqual(requests.length);
      //   expect(requests[1].url).toEqual('api2/posts/1');
      //   expect(requests[1].method).toEqual('GET');
      //   expect(data).toEqual(p1);
      });
  });
});
