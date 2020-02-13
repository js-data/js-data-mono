import { JSData, sinon } from '../../_setup';

const utils = JSData.utils;

describe('utils.eventify', () => {
  it('adds on, off, emit events to the specified target', () => {
    const user: any = {name: 'John'};
    expect(user.on).not.toBeDefined();
    expect(user.emit).not.toBeDefined();
    expect(user.off).not.toBeDefined();
    utils.eventify(user);
    expect(user.on).toBeDefined();
    expect(user.emit).toBeDefined();
    expect(user.off).toBeDefined();

    const stub = sinon.stub();
    user.on('foo', stub);
    user.emit('foo', 1, 2);
    user.off('foo', 1, 2);
    expect(stub.calledOnce).toBeTruthy();
    expect(stub.firstCall.args).toEqual([1, 2]);
  });
});
