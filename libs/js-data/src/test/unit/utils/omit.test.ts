import { JSData } from '../../_setup';

const utils = JSData.utils;

describe('utils.omit', () => {
  it('Clones an object and omits specific properties', () => {
    const src = {name: 'John', $hashKey: 1214910};
    const actual = utils.omit(src, ['$hashKey']);
    const expected = {name: 'John'};
    expect(expected).toEqual(actual);
  });
});

describe('utils.isBlacklisted', () => {
  it('matches a value against an array of strings or regular expressions', () => {
    const valuesTocheck = ['$hashKey', 'id', '_hidden'];
    const blackList = [/^\$hashKey/g, /^_/g, 'id'];
    valuesTocheck.forEach(v => {
      expect(utils.isBlacklisted(v, blackList)).toBeTruthy();
    });

    valuesTocheck.forEach(v => {
      expect(utils.isBlacklisted(v, ['hashKey', 'my_id'])).toBe(false);
    });
  });
});

describe('utils.pick', () => {
  it('Shallow copies an object, but only include the properties specified', () => {
    const src = {name: 'John', $hashKey: 1214910};
    const actual = utils.pick(src, ['$hashKey']);
    const expected = {$hashKey: 1214910};
    expect(expected).toEqual(actual);
  });
});
