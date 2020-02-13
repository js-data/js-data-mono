import { utils } from '@js-data/js-data';

describe('utils.set', () => {
  it('can set a value of an object at the provided key or path', () => {
    const john: any = {name: 'John', age: 25, parent: {name: 'Mom', age: 50}};
    utils.set(john, 'spy', true);
    utils.set(john, 'parent.age', 55);
    expect(true).toEqual(john.spy);
    expect(55).toEqual(john.parent.age);
  });

  it('can set a values of an object with a path/value map', () => {
    const john: any = {name: 'John', age: 25, parent: {name: 'Mom', age: 50}};
    utils.set(john, {
      spy: true,
      parent: {age: 55},
      'parent.name': 'Grandma'
    });
    expect(true).toEqual(john.spy);
    expect(55).toEqual(john.parent.age);
    expect('Grandma').toEqual(john.parent.name);
  });
});

describe('utils.unset', () => {
  it('can unSet a value of an object at the provided key or path', () => {
    const john = {name: 'John', age: 25, spy: true, parent: {name: 'Mom', age: 50}};
    utils.unset(john, 'spy');
    utils.unset(john, 'parent.age');
    utils.unset(john, 'parent.notExist');
    expect(john.spy).toBeFalsy();
    expect(john.parent.age).toBeFalsy();
  });
});
