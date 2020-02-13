import { JSData } from '../../_setup';

const utils = JSData.utils;

describe('utils.deepEqual', () => {
  it('does deep equal comparison', () => {
    const objA = {name: 'John', age: 90};
    const arrA = ['a', 'b', 'c'];
    const arrB = ['a', 'b', 'c', 'd', 'e'];

    expect(utils.deepEqual(2, 2)).toBe(true);
    expect(utils.deepEqual('test', 'test')).toBe(true);
    expect(utils.deepEqual({}, {})).toBe(true);
    expect(utils.deepEqual(objA, objA)).toBe(true);
    expect(utils.deepEqual(arrA, arrA)).toBe(true);

    expect(utils.deepEqual(1, 2)).toBe(false);
    expect(utils.deepEqual(1, '1')).toBe(false);
    expect(utils.deepEqual('foo', 'bar')).toBe(false);
    expect(utils.deepEqual(arrA, arrB)).toBe(false);
  });

  it('compares identical objects', () => {
    const objA = {
      name: 'John',
      id: 27,
      nested: {
        item: 'item 1',
        colors: ['red', 'green', 'blue']
      }
    };
    const objB = {
      name: 'John',
      id: 27,
      nested: {
        item: 'item 1',
        colors: ['red', 'green', 'blue']
      }
    };
    expect(utils.deepEqual(objA, objB)).toBe(true);
    expect(utils.deepEqual([objA, objB], [objA, objB])).toBe(true);

    objA.nested.colors[0] = 'yellow';
    expect(utils.deepEqual(objA, objB)).toBe(false);
  });
});
