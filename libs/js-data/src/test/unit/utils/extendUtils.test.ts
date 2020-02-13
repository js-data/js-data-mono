import { JSData } from '../../_setup';

const utils = JSData.utils;

describe('utils.fillIn', () => {
  it('Copy properties from `source` that are missing from `dest`', () => {
    const dest = {name: 'John', age: 90, friend: {name: 'Sara'} as any};
    const src = {name: 'John', age: 0, spy: true, friend: {name: 'Sara', age: 20}};
    const expected = {name: 'John', age: 90, spy: true, friend: {name: 'Sara'} as any};
    utils.fillIn(dest, src);

    expect(expected.age).toEqual(dest.age);
    expect(expected.friend.age).not.toBeDefined();
    expect(expected).toEqual(dest);
  });
});

describe('utils.deepFillIn', () => {
  it('Recursivly copies properties from `source` that are missing on `dest`', () => {
    const dest = {name: 'John', age: 90, friend: {name: 'Sara'}};
    const src = {name: 'John', age: 0, spy: true, friend: {name: 'Sara', age: 20}};
    const expected = {name: 'John', age: 90, spy: true, friend: {name: 'Sara', age: 20}};
    const actual = utils.deepFillIn(dest, src);

    expect(dest).toEqual(actual);
    expect(expected.age).toEqual(actual.age);
    expect(expected.friend.age).toEqual(actual.friend.age);
    expect(expected).toEqual(actual);
    expect(dest).toEqual(utils.deepFillIn(dest));
  });
});

describe('utils.deepMixIn', () => {
  it('Recursively shallow copies properties from `source` to `dest`', () => {
    const dest = {name: 'John', age: 90, friend: {name: 'Sara'}};
    const src = {name: 'John', age: 0, spy: true, friend: {name: 'Sara', age: 20}};
    const expected = {name: 'John', age: 0, spy: true, friend: {name: 'Sara', age: 20}};
    const actual = utils.deepMixIn(dest, src);

    expect(dest).toEqual(actual);
    expect(expected.age).toEqual(actual.age);
    expect(expected.friend.age).toEqual(actual.friend.age);
    expect(expected).toEqual(actual);
    expect(dest).toEqual(utils.deepMixIn(dest));
  });
});

describe('utils.getSuper', () => {
  it('getSuper returns base class with ES2015 classes', () => {
    class Foo {}

    class Bar extends Foo {}

    const barInstance = new Bar();

    if (Object.getPrototypeOf(Bar) === Foo) {
      expect(Foo).toBe(utils.getSuper(barInstance, false));
    } else {
      // Assert nothing in IE9, because this doesn't work in IE9.
      // You have to use utils.extend if you want it to work in IE9.
    }
  });

  it('getSuper returns base class with utils.extend', () => {
    class Foo {}

    class Bar extends Foo {}

    const barInstance = new Bar();
    expect(Foo).toBe(utils.getSuper(barInstance, false));
  });
});

describe('utils.addHiddenPropsToTarget', () => {
  it('adds hidden properties to target', () => {
    const target = {name: 'John'};
    utils.addHiddenPropsToTarget(target, {age: 103});
    expect(target.propertyIsEnumerable('age')).toBe(false);
  });
});
