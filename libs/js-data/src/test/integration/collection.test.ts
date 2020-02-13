import { JSData, sinon } from '../_setup';

describe('Collection integration tests', () => {
  it('should emit add events', done => {
    const mapper = new JSData.Mapper({name: 'user'});
    const data = [mapper.createRecord({id: 2, age: 19}), mapper.createRecord({id: 1, age: 27})];
    const collection = new JSData.Collection([], {
      mapper
    });
    const listener = sinon.stub();
    const listener2 = sinon.stub();
    collection.on('add', listener);
    collection.on('all', listener2);
    const records = collection.add(data);
    setTimeout(() => {
      expect(listener.calledOnce).toBeTruthy();
      expect(listener.firstCall.args).toEqual([records]);
      expect(listener2.calledOnce).toBeTruthy();
      expect(listener2.firstCall.args).toEqual(['add', records]);
      done();
    }, 30);
  });

  it('should not emit add events', done => {
    const mapper = new JSData.Mapper({name: 'user'});
    const data = [mapper.createRecord({id: 2, age: 19}), mapper.createRecord({id: 1, age: 27})];
    const collection = new JSData.Collection(data, {
      mapper
    });
    const listener = sinon.stub();
    const listener2 = sinon.stub();
    collection.on('add', listener);
    collection.on('all', listener2);
    collection.add(data, {
      silent: true
    });
    setTimeout(() => {
      expect(listener.called).toEqual(false);
      expect(listener2.called).toEqual(false);
      done();
    }, 30);
  });

  it('should emit remove events', done => {
    const mapper = new JSData.Mapper({name: 'user'});
    const data = mapper.createRecord({id: 2, age: 19});
    const collection = new JSData.Collection([], {
      mapper
    });
    const listener = sinon.stub();
    const listener2 = sinon.stub();
    collection.add(data);
    collection.on('remove', listener);
    collection.on('all', listener2);
    const records = collection.remove(data);
    setTimeout(() => {
      expect(listener.calledOnce).toBeTruthy();
      expect(listener.firstCall.args).toEqual([records]);
      expect(listener2.calledOnce).toBeTruthy();
      expect(listener2.firstCall.args).toEqual(['remove', records]);
      done();
    }, 30);
  });

  it('should bubble up record events', done => {
    const mapper = new JSData.Mapper({name: 'user'});
    const data = [mapper.createRecord({id: 2, age: 19}), mapper.createRecord({id: 1, age: 27})];
    const collection = new JSData.Collection(data, {
      mapper
    });
    const listener = sinon.stub();
    const listener2 = sinon.stub();
    collection.on('foo', listener);
    collection.on('all', listener2);
    data[0].emit('foo', 'bar', 'biz', 'baz');
    setTimeout(() => {
      expect(listener.calledOnce).toBeTruthy();
      expect(listener.firstCall.args).toEqual(['bar', 'biz', 'baz']);
      expect(listener2.calledOnce).toBeTruthy();
      expect(listener2.firstCall.args).toEqual(['foo', 'bar', 'biz', 'baz']);
      done();
    }, 30);
  });

  it('should not bubble up record events', done => {
    const mapper = new JSData.Mapper({name: 'user'});
    const data = [mapper.createRecord({id: 2, age: 19}), mapper.createRecord({id: 1, age: 27})];
    const collection = new JSData.Collection(data, {
      emitRecordEvents: false,
      mapper
    });
    const listener = sinon.stub();
    const listener2 = sinon.stub();
    collection.on('foo', listener);
    collection.on('all', listener2);
    data[0].emit('foo', 'bar', 'biz', 'baz');
    setTimeout(() => {
      expect(listener.called).toEqual(false);
      expect(listener2.called).toEqual(false);
      done();
    }, 30);
  });

  it('should bubble up change events (assignment operator)', done => {
    let changed = false;
    const store = new JSData.DataStore();
    store.defineMapper('foo', {
      schema: {
        properties: {
          bar: {type: 'string', track: true}
        }
      }
    });
    const foo = store.add('foo', {id: 1});

    setTimeout(() => {
      if (!changed) {
        done('failed to fire change event');
      }
    }, 1000);

    store.getCollection('foo').on('change', (fooCollection, foo) => {
      changed = true;
      done();
    });

    foo.bar = 'baz';
  });

  it('should bubble up change events (setter method)', done => {
    let changed = false;
    const store = new JSData.DataStore();
    store.defineMapper('foo', {
      schema: {
        properties: {
          bar: {type: 'string', track: true}
        }
      }
    });
    const foo = store.add('foo', {id: 1});

    setTimeout(() => {
      if (!changed) {
        done('failed to fire change event');
      }
    }, 1000);

    store.getCollection('foo').on('change', (fooCollection, foo) => {
      changed = true;
      done();
    });

    foo.set('bar', 'baz');
  });
});
