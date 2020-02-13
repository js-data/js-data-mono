import { JSData } from '../../_setup';

const utils = JSData.utils;

describe('utils.intersection', () => {
  it('intersects two arrays', () => {
    const arrA = ['green', 'red', 'blue', 'red'];
    const arrB = ['green', 'yellow', 'red'];
    const result = utils.intersection(arrA, arrB);
    expect(result.length).toBe(2);
    expect(result).toEqual(expect.arrayContaining(['green', 'red']));
  });

  it('intersect returns empty array when argument is undefined', () => {
    const arrA = ['green', 'red', 'blue'];
    const arrB = undefined;
    const result = utils.intersection(arrA, arrB);
    const result2 = utils.intersection(arrB, arrA);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
    expect(Array.isArray(result2)).toBe(true);
    expect(result2.length).toBe(0);
  });
});
