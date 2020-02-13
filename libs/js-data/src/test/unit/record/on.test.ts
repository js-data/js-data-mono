import { JSData, sinon } from '../../_setup';

const {Record} = JSData;

describe('Record#on("change")', () => {
  it('Tracking changes to a single property', done => {
    const Store = new JSData.DataStore();
    const Foo = Store.defineMapper('foo', {
      schema: {
        properties: {
          id: {type: 'number'},
          name: {type: 'string', track: true}
        }
      }
    });
    const foo = Foo.createRecord();
    const listener = sinon.stub();
    foo.on('change', listener);
    foo.name = 'new foo';
    const secondSpec = () => {
      foo.name = 'updated foo';
      setTimeout(() => {
        const [record, changes] = listener.args[1];
        expect(foo).toEqual(record);
        expect(listener.calledTwice).toBe(true);
        expect(Object.keys(changes.added).length).toEqual(0);
        expect(Object.keys(changes.removed).length).toEqual(0);
        expect(changes.changed.name).toEqual('updated foo');
        done();
      }, 5);
    };
    setTimeout(() => {
      const [record, changes] = listener.args[0];
      expect(foo).toEqual(record);
      expect(listener.calledOnce).toBe(true);
      expect(Object.keys(changes.changed).length).toEqual(0);
      expect(Object.keys(changes.removed).length).toEqual(0);
      expect(changes.added.name).toEqual('new foo');
      secondSpec();
    }, 5);
  });

  it('keepChangeHistory: false', done => {
    const Store = new JSData.DataStore();

    class FooRecord extends Record {
      constructor(props, opts) {
        super(props, opts);
        this._set('keepChangeHistory', false);
        this._set('noValidate', true);
      }
    }

    const Foo = Store.defineMapper('foo', {
      recordClass: FooRecord,
      schema: {
        properties: {
          id: {type: 'number'},
          name: {type: 'string', track: true}
        }
      }
    });

    const Bar = Store.defineMapper('bar', {
      schema: {
        properties: {
          id: {type: 'number'},
          name: {type: 'string', track: true}
        }
      }
    });

    const foo = Foo.createRecord();
    const bar = Bar.createRecord();
    const listener = sinon.stub();
    foo.on('change', listener);
    bar.on('change', listener);
    foo.name = 'new foo';
    bar.name = 'new bar';
    setTimeout(() => {
      expect(listener.calledTwice).toBe(true);
      expect(foo.changeHistory()).toEqual([]);
      expect(bar.changeHistory().length).toEqual(1);
      done();
    }, 5);
  });
});
