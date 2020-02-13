import { JSData, sinon } from '../../_setup';

const utils = JSData.utils;

describe('utils.logify', () => {
  it('adds hidden dbg and log methods to target', () => {
    const user: any = {name: 'John'};
    expect(user.dbg).not.toBeDefined();
    expect(user.log).not.toBeDefined();
    utils.logify(user);
    expect(user.dbg).toBeDefined();
    expect(user.log).toBeDefined();
  });

  it('logs message to the console with the specified log level', () => {
    const user: any = {name: 'John'};
    const infoStub = sinon.stub(console, 'info');
    const logStub = sinon.stub(console, 'log');
    utils.logify(user);
    user.log('info', 'test log info');
    expect(infoStub.calledOnce).toBeTruthy();
    user.log('notvalid', 'test log info');
    expect(logStub.calledOnce).toBeTruthy();
    infoStub.restore();
    logStub.restore();
  });

  it('logs debug messages only when `this.debug` is true', () => {
    const user: any = {name: 'John'};
    const prev = console.debug;
    console.debug = sinon.stub();
    utils.logify(user);
    user.dbg('test dbg');
    user.log('debug');
    user.log('debug', 'test log debug');
    expect((console.debug as any).notCalled).toBeTruthy();
    user.debug = true;
    user.dbg('test dbg');
    user.log('debug', 'test log debug');
    expect((console.debug as any).calledTwice).toBeTruthy();
    console.debug = prev;
  });
});
