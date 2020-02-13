import { JSData, sinon } from '../../_setup';

describe('Collection', () => {
  it('should be a constructor function', () => {
    expect(typeof JSData.Collection).toEqual('function');
    const collection = new JSData.Collection();
    expect(collection instanceof JSData.Collection).toBeTruthy();
    expect(collection.recordId()).toEqual('id');
  });

  it('should accept just opts', () => {
    expect(() => new JSData.Collection({idAttribute: 'id'})).not.toThrow();
  });

  it('should accept opts as string', () => {
    expect(() => {
      const collection = new JSData.Collection('_id');
      expect(collection.idAttribute).toEqual('_id');
    }).not.toThrow();
  });

  it('should accept initialization data', () => {
    const data = [{id: 2}, {id: 3}, {id: 1}];
    const collection = new JSData.Collection(data);
    expect(collection.getAll()).toEqual([data[2], data[0], data[1]]);
  });

  it('should bubble up record events', () => {
    const data = [{id: 2}, {id: 3}, {id: 1}];
    const stub = sinon.stub();
    const stub2 = sinon.stub();
    const UserMapper = new JSData.Mapper({name: 'user'});
    const collection = new JSData.Collection(data, {mapper: UserMapper});
    collection.on('foo', stub);
    collection.on('all', stub2);
    collection.get(1).emit('foo', 1, 2);
    collection.get(2).emit('foo', 2, 3);
    expect(stub.calledTwice).toEqual(true);
    expect(stub2.calledTwice).toEqual(true);
    expect(stub.firstCall.args).toEqual([1, 2]);
    expect(stub2.firstCall.args).toEqual(['foo', 1, 2]);
    expect(stub.secondCall.args).toEqual([2, 3]);
    expect(stub2.secondCall.args).toEqual(['foo', 2, 3]);
  });

  it('can make a subclass', () => {
    class FooCollection extends JSData.Collection {
      foo() {
        return 'foo';
      }
    }

    // tslint:disable-next-line:max-classes-per-file
    class BarCollection extends JSData.Collection {
      bar() {
        return 'bar';
      }
    }

    const fooC = new FooCollection(null, {test: 'test'});
    const barC = new BarCollection(null, {test: 'test'});
    expect(fooC.foo()).toEqual('foo');
    expect(fooC.test).toEqual('test');
    expect(barC.bar()).toEqual('bar');
    expect(barC.test).toEqual('test');
  });
});
