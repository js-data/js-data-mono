import { JSData } from '../../_setup';

const utils = JSData.utils;

describe('utils.areDifferent', () => {
  it('returns false for two different objects', () => {
    const objA = {name: 'John', age: 30};
    const objB = {name: 'John', age: 90};
    const result = utils.areDifferent(objA, objB);
    expect(result).toBe(true);
  });

  it('returns true for two equal objects', () => {
    const objA = {name: 'John', age: 90};
    const objB = {name: 'John', age: 90};
    const result = utils.areDifferent(objA, objB);
    expect(result).toBe(false);
  });
});
