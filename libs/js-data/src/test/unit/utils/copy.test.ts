import { JSData } from '../../_setup';

const utils = JSData.utils;

describe('utils.copy', () => {
  it('can do a plain copy', () => {
    const plain = {name: 'John'};
    const result = utils.plainCopy(plain);
    expect(result).not.toBe(plain);
  });

  it('can do a plain copy excluding blacklisted properties', () => {
    const from = {name: 'John', spy: true, parent: {name: 'Mom', $hashKey: 13561}};
    const to = {};
    const result = utils.copy(from, to, undefined, undefined, ['spy', /^\$/], true);
    expect(result).not.toBe(from);
    expect(result.spy).not.toBeDefined();
    expect('Mom').toEqual(result.parent.name);
    expect(result.parent.$hashKey).not.toBeDefined();
  });

  it('throws error if from and to are equal', () => {
    const from = {name: 'John'};
    const to = from;
    expect(() => utils.copy(from, to)).toThrow();
  });

  it('copy array like object to array', () => {
    const from = {0: 'John', 1: 'Sara'};
    const to = ['Sam'];
    const result = utils.copy(from, to);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect('John').toEqual(result[0]);
    expect('Sara').toEqual(result[1]);
  });

  it('copy object to non empty object, the to object properties should be removed', () => {
    const from = {name: 'John'};
    const to = {id: 10};
    const result = utils.copy(from, to);
    expect(result.to).not.toBeDefined();
    expect('John').toEqual(result.name);
  });

  const circ: any = {name: 'John'};
  circ.circular = circ;

  const srcObj = {
    primitives: {
      number: 1,
      string: '2',
      bool: true
    },
    objects: {
      Number: Number(), // eslint-disable-line
      String: String(), // eslint-disable-line
      Boolean: Boolean(), // eslint-disable-line
      Date: new Date(),
      Regex: new RegExp('$.*', 'ig')
    },
    structs: {
      arrayOfPrimitives: [7, 8, 9, 10],
      arrayOfObjects: [{name: 'John'}, {name: 'Sam'}, {name: 'Sara'}],
      instance: new Error("i'm an error")
    },
    circular: circ
  };

  let objCopy;
  it('copies an object', () => {
    objCopy = utils.copy(srcObj);
    expect(objCopy).toEqual(srcObj);
    return expect(objCopy).not.toBe(srcObj);
  });

  it('copies nested objects recursively', () =>
    utils.forOwn(objCopy, (nested, key) => {
      expect(nested).toEqual(srcObj[key]);
      return expect(nested).not.toBe(srcObj[key]);
    }));

  it('copies circular references', () => {
    expect(objCopy.circular).toEqual(srcObj.circular);
    expect(objCopy.circular).not.toBe(srcObj.circular);
  });

  it("doesn't copy primitives, since you can't", () =>
    utils.forOwn(objCopy.primitives, (value, key) =>
      expect(value).toBe(srcObj.primitives[key])));

  it('copies arrays recursively', () => {
    expect(objCopy.structs.arrayOfPrimitives).toEqual(srcObj.structs.arrayOfPrimitives);
    expect(objCopy.structs.arrayOfPrimitives).not.toBe(srcObj.structs.arrayOfPrimitives);

    expect(objCopy.structs.arrayOfObjects).toEqual(srcObj.structs.arrayOfObjects);
    expect(objCopy.structs.arrayOfObjects).not.toBe(srcObj.structs.arrayOfObjects);
  });

  it("doesn't copy class intances", () =>
    expect(objCopy.structs.instance).toBe(srcObj.structs.instance));
});
