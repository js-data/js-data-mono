import { JSData } from '../../_setup';

const utils = JSData.utils;

describe('utils.equal', () => {
  it('returns true for equal values', () => {
    const objA = {name: 'John', age: 90};
    expect(utils.equal(1, '1')).toBe(true);
    expect(utils.equal(2, 2)).toBe(true);
    expect(utils.equal('test', 'test')).toBe(true);
    expect(utils.equal(objA, objA)).toBe(true);
  });

  it('returns false for two different values', () => {
    expect(utils.equal(1, 2)).toBe(false);
    expect(utils.equal({}, {})).toBe(false);
  });
});
