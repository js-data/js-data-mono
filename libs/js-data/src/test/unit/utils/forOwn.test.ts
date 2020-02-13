import { JSData } from '../../_setup';

const utils = JSData.utils;

describe('utils.forOwn', () => {
  it('executes a given callback for each enumerable property of an object', () => {
    const user = {name: 'John', age: 20, log: () => {}};
    const expectedProps = ['name', 'age', 'log'];
    const actualProps = [];
    utils.addHiddenPropsToTarget(user, {spy: true});
    utils.forOwn(user, (value, key) => {
      actualProps.push(key);
    });
    expect(expectedProps).toEqual(actualProps);
  });
});
