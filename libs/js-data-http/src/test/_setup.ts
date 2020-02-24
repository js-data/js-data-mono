import * as querystring from 'querystring';

import { DataStore, Mapper, utils, version } from '@js-data/js-data';

import { HttpAdapter } from '../../src';

export function objectsEqual(a, b, m) {
  expect(JSON.parse(JSON.stringify(a))).toEqual(JSON.parse(JSON.stringify(b)));
}

export function fail(msg) {
  if (msg instanceof Error) {
    console.log(msg.stack);
  } else {
    expect('should not reach this!: ' + msg).toEqual('failure');
  }
}

export let store, adapter: HttpAdapter, User, Post, p1, p2, p3, p4, p5, requests;

beforeAll(() => {

  store = new DataStore();
  adapter = new HttpAdapter();
  store.registerAdapter('http', adapter, {default: true});

  User = new Mapper({
    name: 'user'
  });
  Post = new Mapper({
    name: 'post',
    endpoint: 'posts',
    basePath: 'api'
  });

  User.registerAdapter('http', adapter, {default: true});
  Post.registerAdapter('http', adapter, {default: true});
  console.log('Testing against js-data ' + version);
});

beforeEach(() => {
  p1 = {author: 'John', age: 30, id: 5};
  p2 = {author: 'Sally', age: 31, id: 6};
  p3 = {author: 'Mike', age: 32, id: 7};
  p4 = {author: 'Adam', age: 33, id: 8};
  p5 = {author: 'Adam', age: 33, id: 9};

  requests = [];

  adapter.isNode = true;
  adapter.http = config => {
    config.headers = config.headers || {};
    config.headers.Accept = 'application/json, text/plain, */*';
    let params = 0;
    for (const key in config.params) {
      config.params[key] = utils.isObject(config.params[key]) ? JSON.stringify(config.params[key]) : config.params[key];
      params++;
    }
    return new Promise(resolve => {
      let url = config.url;
      if (params) {
        url += '?';
        url += querystring.stringify(config.params);
      }
      const request = {
        url: url,
        method: config.method,
        requestBody: JSON.stringify(config.data),
        requestHeaders: config.headers,
        respond: (statusCode, headers, body) => {
          resolve({
            url: config.url,
            method: config.method,
            status: statusCode,
            headers: headers,
            data: body && statusCode >= 200 && statusCode < 300 ? JSON.parse(body) : ''
          });
        }
      };
      requests.push(request);
    });
  };
});
