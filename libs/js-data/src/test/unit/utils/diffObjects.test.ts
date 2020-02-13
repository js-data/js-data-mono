import { JSData } from '../../_setup';

const utils = JSData.utils;

describe('utils.diffObjects', () => {
  it('returns diff between two different objects', () => {
    const newObject = {name: 'John', age: 30, friends: 7};
    const oldObject = {name: 'John', age: 90, id: 20};
    const expected = {
      added: {friends: 7},
      changed: {age: 30},
      removed: {id: undefined}
    };
    const result = utils.diffObjects(newObject, oldObject);
    expect(result).toEqual(expected);
  });

  it('returns diff between two equal objects', () => {
    const oldObject = {name: 'John', age: 90, friends: 7};
    const newObject = {name: 'John', age: 90, friends: 7};
    const expected = {
      added: {},
      changed: {},
      removed: {}
    };
    const result = utils.diffObjects(newObject, oldObject);
    expect(result).toEqual(expected);
  });
});
