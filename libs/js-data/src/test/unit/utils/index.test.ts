import { JSData } from '../../_setup';

const utils = JSData.utils;

describe('utils.get', () => {
  it('returns a given property by name or path', () => {
    const john = {name: 'John', age: 20, friend: {name: 'Sara'}};
    expect(john.name).toEqual(utils.get(john, 'name'));
    expect(john.friend.name).toEqual(utils.get(john, 'friend.name'));
    expect(undefined).toEqual(utils.get(john, ''));
  });
  it('returns a given property by callback', function () {
    const john = {name: 'John', age: 20, friend: {name: 'Sara'}};
    const callback = (prop) => {
      return john[prop];
    };
    expect(john.name).toEqual(utils.get('name', callback));
  });
});

describe('utils.findIndex', () => {
  it('can find the last index based on given function', () => {
    const john = {name: 'John', age: 20, spy: true};
    const sara = {name: 'Sara', age: 25, spy: false};
    const dan = {name: 'Dan', age: 20, spy: false};
    const users = [john, sara, dan];

    expect(1).toEqual(utils.findIndex(users, user => user.age === 25));
    expect(2).toEqual(utils.findIndex(users, user => user.age > 19));
    expect(2).toEqual(utils.findIndex(users, user => !user.spy));
    expect(0).toEqual(utils.findIndex(users, user => user.name === 'John'));
    expect(-1).toEqual(utils.findIndex(users, user => user.name === 'Jimmy'));
    expect(-1).toEqual(utils.findIndex(null, user => user.name === 'Jimmy'));
  });
});

describe('utils.remove', () => {
  it('can remove the last item found from an array based on a given function', () => {
    const colors = ['red', 'green', 'yellow', 'red'];
    expect(colors.length).toBe(4);
    utils.remove(null);
    utils.remove(colors, color => color === 'red');
    expect(colors.length).toBe(3);
    expect('yellow').toEqual(colors[2]);
    utils.remove(colors, color => color === 'green');
    utils.remove(colors, color => color === 'green');
    expect(colors.length).toBe(2);
    expect('yellow').toEqual(colors[1]);
  });
});

describe('utils.noDupeAdd', () => {
  it('only adds distinct items to array based on given checker function', () => {
    const colors = ['red', 'green', 'yellow'];
    expect(colors.length).toBe(3);
    utils.noDupeAdd(null);
    utils.noDupeAdd(colors, 'red', color => color === 'red');
    expect(colors.length).toBe(3);
    utils.noDupeAdd(colors, 'blue', color => color === 'blue');
    expect('blue').toEqual(colors[3]);
    expect(colors.length).toBe(4);
  });
});
describe('utils.getDefaultLocale', function () {
  it('Default locale should be "en"', function () {
    expect('en').toEqual(utils.getDefaultLocale());
  });
});
