import { adapter, requests } from './_setup';

describe('fetch', () => {
  it.skip('should fetch from a URL', () => {
    if (!adapter.hasFetch) {
      return
    }
    setTimeout(() => {
      requests[0].respond(200, {'Content-Type': 'application/json'}, '{}')
    }, 300);

    return adapter.fetch({
      method: 'get',
      params: {active: true},
      url: '/api/foos'
    }).then(() => {
      const request = requests[0];
      expect(request.method).toEqual('GET');
      expect(request.url).toEqual('/api/foos?active=true')
    });
  })
});
