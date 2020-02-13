import { JSData } from '../../_setup';

describe('Index', () => {
  it('should be a constructor function', () => {
    expect(typeof JSData.Index).toEqual('function');
    const index = new JSData.Index();
    expect(index instanceof JSData.Index).toBeTruthy();
  });
});
