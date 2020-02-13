import { JSData } from '../../_setup';

describe('Query', () => {
  it('should be a constructor function', () => {
    expect(typeof JSData.Query).toEqual('function');
    const query = new JSData.Query();
    expect(query instanceof JSData.Query).toBeTruthy();
  });

  it('can make a subclass', () => {
    class FooQuery extends JSData.Query {
      foo() {
        return 'foo';
      }
    }

    // tslint:disable-next-line:max-classes-per-file
    class BarQuery extends JSData.Query {
      _bar: string;

      constructor(collection) {
        super(collection);
        this._bar = 'bar';
      }

      bar() {
        return this._bar;
      }
    }

    const fooQ = new FooQuery('test');
    const barQ = new BarQuery('test');
    expect(fooQ.foo()).toEqual('foo');
    expect(fooQ.collection).toEqual('test');
    expect(barQ.bar()).toEqual('bar');
    expect(barQ.collection).toEqual('test');
  });
});
