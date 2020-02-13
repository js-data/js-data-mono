import { JSData } from '../../_setup';

describe('Record#changes', () => {
  it('should return a property', () => {
    const user = new JSData.Record({foo: 'bar'});
    expect(user.get('foo')).toEqual('bar');
  });
  it('should return undefined if the property does not exist', () => {
    const user = new JSData.Record();
    expect(!user.get('foo')).toBeTruthy();
  });
  it('should return a nested property', () => {
    const user = new JSData.Record({address: {state: 'TX'}});
    expect(user.get('address.state')).toEqual('TX');
  });
});
