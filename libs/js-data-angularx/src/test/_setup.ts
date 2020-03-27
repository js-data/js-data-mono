import { DataStore, Mapper } from '@js-data/js-data';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AngularAdapterService } from '../lib/angular-adapter.service';

export let store, adapter: AngularAdapterService, User, Post, p1, p2, p3, p4, p5, requests,
  httpTestingController: HttpTestingController;

export function objectsEqual(a, b, m) {
  expect(JSON.parse(JSON.stringify(a))).toEqual(JSON.parse(JSON.stringify(b)));
}

beforeAll(() => {
  User = new Mapper({
    name: 'user'
  });
  Post = new Mapper({
    name: 'post',
    endpoint: 'posts',
    basePath: 'api'
  });
});

beforeEach(() => {
  p1 = {author: 'John', age: 30, id: 5};
  p2 = {author: 'Sally', age: 31, id: 6};
  p3 = {author: 'Mike', age: 32, id: 7};
  p4 = {author: 'Adam', age: 33, id: 8};
  p5 = {author: 'Adam', age: 33, id: 9};

  TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [DataStore]
  });
  adapter = TestBed.inject(AngularAdapterService);

  User.registerAdapter('http', adapter, {default: true});
  Post.registerAdapter('http', adapter, {default: true});

  httpTestingController = TestBed.inject(HttpTestingController);
});

afterEach(() => {
  httpTestingController.verify();
});
