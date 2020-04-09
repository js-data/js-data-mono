import { DataStore, Mapper, version } from '@js-data/js-data';
import fetchMock from 'jest-fetch-mock';
import { FetchAdapter } from '../../src';

(global as any).fetch = fetchMock;
import MockContext = jest.MockContext;

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

export let store, adapter: FetchAdapter, User, Post, p1, p2, p3, p4, p5,
  requests: [string | Request, RequestInit][];

beforeAll(() => {

  store = new DataStore();
  adapter = new FetchAdapter();
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

  fetchMock.resetMocks();
  requests = fetchMock.mock.calls;
});
