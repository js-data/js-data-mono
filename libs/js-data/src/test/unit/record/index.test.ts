import { JSData } from '../../_setup';

describe('Record', () => {
  it('should be a constructor function', () => {
    expect(typeof JSData.Record).toEqual('function');
    let instance = new JSData.Record();
    expect(instance instanceof JSData.Record).toBeTruthy();
    instance = new JSData.Record({foo: 'bar'});
    expect(instance).toEqual({foo: 'bar'});
  });

  it('should allow instance events (assignment operator)', done => {
    let changed = false;
    const FooMapper = new JSData.Mapper({
      name: 'foo',
      schema: {
        properties: {
          bar: {type: 'string', track: true}
        }
      }
    });
    const foo = FooMapper.createRecord({id: 1});

    setTimeout(() => {
      if (!changed) {
        done('failed to fire change event');
      }
    }, 1000);

    foo.on('change', () => {
      changed = true;
      done();
    });

    foo.bar = 'baz';
  });

  it('should allow instance events (setter method)', done => {
    let changed = false;
    const FooMapper = new JSData.Mapper({
      name: 'foo',
      schema: {
        properties: {
          bar: {type: 'string', track: true}
        }
      }
    });
    const foo = FooMapper.createRecord({id: 1});

    setTimeout(() => {
      if (!changed) {
        done('failed to fire change event');
      }
    }, 1000);

    foo.on('change', () => {
      changed = true;
      done();
    });

    foo.set('bar', 'baz');
  });

  it('should throw if a Record class does not have a Mapper', () => {
    const record = new JSData.Record();
    expect(() => record._mapper()).toThrow();
  });

  it('should throw a validation error on instantiation', () => {
    const store = new JSData.DataStore();
    store.defineMapper('user', {
      schema: {
        properties: {
          name: {type: 'string'},
          age: {type: 'number'}
        }
      }
    });
    try {
      store.createRecord('user', {name: 1234, age: 30});
    } catch (err) {
      expect(err.message).toEqual('validation failed');
      expect(err.errors).toEqual([
        {
          expected: 'one of (string)',
          actual: 'number',
          path: 'name'
        }
      ]);
    }
  });

  it('should skip validation on instantiation', () => {
    const store = new JSData.DataStore();
    store.defineMapper('user', {
      schema: {
        properties: {
          name: {type: 'string'},
          age: {type: 'number'}
        }
      }
    });
    expect(() => {
      store.createRecord('user', {name: 1234, age: 30}, {noValidate: true});
    }).not.toThrow();
  });

  it('should throw a validation error on property assignment', () => {
    const store = new JSData.DataStore();
    store.defineMapper('user', {
      schema: {
        properties: {
          name: {type: 'string'},
          age: {type: 'number'}
        }
      }
    });
    const user = store.createRecord('user', {name: 'John', age: 30});
    try {
      user.name = 1234;
    } catch (err) {
      expect(err.message).toEqual('validation failed');
      expect(err.errors).toEqual([
        {
          expected: 'one of (string)',
          actual: 'number',
          path: 'name'
        }
      ]);
    }
  });

  it('should allow validtion on set to be disabled', () => {
    const store = new JSData.DataStore();
    store.defineMapper('user', {
      schema: {
        properties: {
          name: {type: 'string'},
          age: {type: 'number'}
        }
      },
      validateOnSet: false
    });
    const user = store.createRecord('user', {name: 'John', age: 30});
    expect(() => user.name = 1234).not.toThrow();
  });

  it('should be saved or unsaved', () => {
    const store = new JSData.DataStore();
    store.defineMapper('user');
    const user = store.createRecord('user', {id: 1});
    const user2 = store.createRecord('user');
    expect(user.isNew()).toEqual(false);
    expect(user2.isNew()).toEqual(true);
  });
});
