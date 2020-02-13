import { JSData, objectsEqual, sinon } from '../../_setup';

describe('LinkedCollection', () => {
  it('should create a linked collection', done => {
    expect(typeof JSData.LinkedCollection).toEqual('function');
    const store = new JSData.DataStore();
    const mapper = store.defineMapper('user', {
      schema: {
        properties: {
          id: {type: 'number'},
          name: {type: 'string', track: true}
        }
      }
    });
    const collection = store.getCollection('user');
    expect(collection instanceof JSData.LinkedCollection).toBeTruthy();
    expect(collection.recordId()).toEqual('id');

    const data = [{id: 2}, {id: 3}, {id: 1, name: 'John'}];
    collection.add(data);
    objectsEqual(collection.getAll(), [data[2], data[0], data[1]], 'data should be in order');

    expect(() =>
      new JSData.LinkedCollection(null, {
        mapper
      })).toThrow();

    const stub = sinon.stub();
    collection.on('all', stub);
    collection.get(1).emit('foo', 1, 2);
    expect(stub.calledOnce).toEqual(true);
    expect(stub.firstCall.args).toEqual(['foo', 1, 2]);

    collection.get(1).name = 'Johnny';

    setTimeout(() => {
      expect(stub.calledThrice).toEqual(true);
      expect(stub.secondCall.args[0]).toEqual('change:name');
      expect(stub.secondCall.args[1]).toEqual(collection.get(1));
      expect(stub.secondCall.args[2]).toEqual('Johnny');
      expect(stub.thirdCall.args[0]).toEqual('change');
      expect(stub.thirdCall.args[1]).toEqual(collection.get(1));
      expect(stub.thirdCall.args[2]).toEqual({added: {}, changed: {name: 'Johnny'}, removed: {}});
      done();
    }, 10);
  });
});
