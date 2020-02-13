import { createRelation, createStore, JSData, sinon } from '../../_setup';

const {Mapper, belongsTo} = JSData;

describe('JSData.belongsTo', () => {
  let store;

  describe('configuration', () => {
    let mapper, anotherMapper;

    beforeEach(() => {
      mapper = new Mapper({name: 'foo'});
      anotherMapper = new Mapper({name: 'bar'});
    });

    it('should throw error if "localField" is missed', () => {
      expect(() => {
        belongsTo(anotherMapper, {foreignKey: 'fooId'})(mapper);
      }).toThrow();
    });

    it('should throw error if "foreignKey" is missed', () => {
      expect(() => {
        belongsTo(anotherMapper, {localField: 'bar'})(mapper);
      }).toThrow();
    });

    it('should throw error if related mapper is passed as string and "getRelation" option is not a function', () => {
      expect(() => {
        belongsTo('anotherMapper', {localField: 'bar', foreignKey: 'fooId'})(mapper);
      }).toThrow();
    });

    it('should throw error if related mapper is undefined', () => {
      expect(() => {
        belongsTo(undefined, {localField: 'bar', foreignKey: 'fooId'})(mapper);
      }).toThrow();
    });

    it('should not throw error if related mapper is a string and "getRelation" option is a function', () => {
      expect(() => {
        belongsTo('another', {localField: 'bar', foreignKey: 'fooId', getRelation: () => anotherMapper})(mapper);
      }).not.toThrow();
    });
  });

  describe('when 2 way relation is defined (belongsTo + hasMany)', () => {
    let foos, bars;

    beforeEach(() => {
      store = createStore();
      store.defineMapper('foo', {
        relations: {
          hasMany: createRelation('bar', {localField: 'bars', foreignKey: 'fooId'})
        }
      });
      store.defineMapper('bar', {
        relations: {
          belongsTo: createRelation('foo', {localField: 'foo', foreignKey: 'fooId'})
        }
      });
      foos = store.add('foo', [{id: 1}, {id: 2}]);
      bars = store.add('bar', [
        {id: 1, fooId: 1},
        {id: 2, fooId: 1}
      ]);
    });

    it('should add property accessors to prototype of target', () => {
      const Foo = store.getMapper('foo').recordClass;
      const Bar = store.getMapper('bar').recordClass;

      expect(Foo.prototype.hasOwnProperty('bars')).toBe(true);
      expect(Bar.prototype.hasOwnProperty('foo')).toBe(true);
    });

    it('should automatically map relations when record is added to store', () => {
      expect(foos[0].bars).toEqual(bars);
      expect(bars.every(bar => bar.foo === foos[0])).toBe(true);
    });

    it('should allow relation re-assignment', () => {
      bars[0].foo = foos[1];

      expect(foos[0].bars).toEqual([bars[1]]);
      expect(foos[1].bars).toEqual([bars[0]]);
    });

    it('should allow relation ids re-assignment', () => {
      bars[0].fooId = foos[1].id;

      expect(foos[0].bars).toEqual([bars[1]]);
      expect(foos[1].bars).toEqual([bars[0]]);
    });
  });

  describe('when one way relation is defined', () => {
    beforeEach(() => {
      store = createStore();
      store.defineMapper('foo');
      store.defineMapper('bar', {
        relations: {
          belongsTo: createRelation('foo', {localField: 'foo', foreignKey: 'fooId'})
        }
      });
    });

    it('should not create an inverse link', () => {
      const foo = store.add('foo', {id: 1});
      const bar = store.add('bar', {id: 1, fooId: 1});

      expect(bar.foo).toBe(foo);
      expect(foo.bars).not.toBeDefined();
    });
  });

  describe('when getter/setter is specified for association', () => {
    let getter, setter;

    beforeEach(() => {
      store = createStore();
      store.defineMapper('foo', {
        relations: {
          hasMany: createRelation('bar', {localField: 'bars', foreignKey: 'fooId'})
        }
      });
      getter = sinon.spy((Relation, bar, originalGet) => {
        return originalGet();
      });
      setter = sinon.spy((Relation, bar, foo, originalSet) => {
        originalSet();
      });
      store.defineMapper('bar', {
        relations: {
          belongsTo: createRelation('foo', {
            localField: 'foo',
            foreignKey: 'fooId',
            get: getter,
            set: setter
          })
        }
      });
    });

    it('should call custom getter each time relation is retrieved', () => {
      store.add('foo', {id: 1, name: 'test'});
      store.add('bar', {id: 1, fooId: 1});

      expect(getter.called).toBe(true);
    });

    it('should call custom setter each time relation is changed', () => {
      store.add('foo', {id: 1, name: 'test'});
      const bar = store.add('bar', {id: 1, fooId: 1});

      bar.foo = null;

      expect(setter.called).toBe(true);
    });
  });
});
