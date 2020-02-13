import { JSData, sinon } from '../../_setup';

it('should work', () => {
  expect(typeof JSData.Component).toEqual('function');
  const component = new JSData.Component();
  expect(component instanceof JSData.Component).toBeTruthy();
  expect(component._listeners).toEqual({});
  const stub = sinon.stub();
  component.on('foo', stub);
  component.emit('foo', 1, 2);
  expect(stub.calledOnce).toBeTruthy();
  expect(stub.firstCall.args).toEqual([1, 2]);
});
