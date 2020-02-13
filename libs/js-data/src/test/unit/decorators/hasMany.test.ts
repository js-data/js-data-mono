import { createRelation as relation, JSData } from '../../_setup';

const {Mapper, hasMany, DataStore} = JSData;

describe('JSData.hasMany', () => {
  describe('configuration', () => {
    let mapper, anotherMapper;

    beforeEach(() => {
      mapper = new Mapper({name: 'foo'});
      anotherMapper = new Mapper({name: 'bar'});
    });

    it('should throw error if passed "foreignKey" and "localField" is omitted', () => {
      expect(() => {
        hasMany(anotherMapper, {foreignKey: 'foo_id'})(mapper);
      }).toThrow();
    });

    it('should throw error if passed "localField" and "foreignKey" is omitted', () => {
      expect(() => {
        hasMany(anotherMapper, {localField: 'foo'})(mapper);
      }).toThrow();
    });

    it('should throw error if passed relation name and "getRelation" is omitted', () => {
      expect(() => {
        hasMany('anotherMapper', {localField: 'foo', foreignKey: 'foo_id'})(mapper);
      }).toThrow();
    });

    it('should not throw error if passed relation together with "getRelation" option', () => {
      expect(() => {
        hasMany('anotherMapper', {localField: 'foo', foreignKey: 'foo_id', getRelation: () => anotherMapper})(mapper);
      }).not.toThrow();
    });
  });

  describe('when relation is set up using "foreignKey"', () => {
    let store;

    beforeEach(() => {
      store = new DataStore();
      store.defineMapper('foo', {
        relations: {
          hasMany: relation('bar', {localField: 'bars', foreignKey: 'fooId'})
        }
      });
      store.defineMapper('bar', {
        relations: {
          belongsTo: relation('foo', {localField: 'foo', foreignKey: 'fooId'})
        }
      });
    });

    it('should add property accessors to prototype of target', () => {
      const Foo = store.getMapper('foo').recordClass;
      const Bar = store.getMapper('bar').recordClass;

      expect(Foo.prototype.hasOwnProperty('bars')).toBe(true);
      expect(Bar.prototype.hasOwnProperty('foo')).toBe(true);
    });

    it('should return empty array for association if there is no linked records', () => {
      const foo = store.add('foo', {});

      expect(foo.bars).toEqual([]);
    });

    it('should create association when related record is added to the store', () => {
      const foo = store.add('foo', {id: 1});
      const bars = store.add('bar', [
        {fooId: 1, id: 1},
        {fooId: 1, id: 2}
      ]);

      expect(foo.bars).toEqual(bars);
    });

    it('should allow relation re-assignment', () => {
      const foo = store.add('foo', {id: 1});
      store.add('bar', [
        {fooId: 1, id: 1},
        {fooId: 1, id: 2}
      ]);
      const otherBars = store.add('bar', [{id: 10}]);

      foo.bars = otherBars;

      expect(foo.bars).toEqual(otherBars);
      expect(otherBars.map(bar => bar.fooId)).toEqual([foo.id]);
    });
  });

  describe('when relation is set up using "localKeys"', () => {
    let store;

    beforeEach(() => {
      store = new DataStore();
      store.defineMapper('foo', {
        relations: {
          hasMany: relation('bar', {localField: 'bars', localKeys: 'barIds'})
        }
      });
      store.defineMapper('bar', {
        relations: {
          hasMany: relation('foo', {localField: 'foos', foreignKeys: 'barIds'})
        }
      });
    });

    it('should add property accessors to prototype of target', () => {
      const Foo = store.getMapper('foo').recordClass;
      const Bar = store.getMapper('bar').recordClass;

      expect(Foo.prototype.hasOwnProperty('bars')).toBe(true);
      expect(Bar.prototype.hasOwnProperty('foos')).toBe(true);
    });

    it('should return empty array for association if there is no linked records', () => {
      const foo = store.add('foo', {});

      expect(foo.bars).toEqual([]);
    });

    it('should create association when related record is added to the store', () => {
      const foo = store.add('foo', {id: 1, barIds: [1]});
      const bars = store.add('bar', [{id: 1}, {id: 2}]);

      expect(foo.bars).toEqual(bars.slice(0, 1));
    });

    it('should allow relation re-assignment', () => {
      const foo = store.add('foo', {id: 1, barIds: [1]});
      const anotherFoo = store.add('foo', {id: 2, barIds: [2, 3]});
      const bars = store.add('bar', [{id: 1}, {id: 2}, {id: 3}]);
      const otherBars = bars.slice(1);

      foo.bars = otherBars;

      expect(foo.bars).toEqual(otherBars);
      expect(otherBars[0].foos).toEqual(otherBars[1].foos);
      expect(otherBars[0].foos).toEqual([anotherFoo, foo]);
    });
  });

  describe('when relation is set up using "foreignKeys" (reverse "localKeys")', () => {
    let store;

    beforeEach(() => {
      store = new DataStore();
      store.defineMapper('foo', {
        relations: {
          hasMany: relation('bar', {localField: 'bars', foreignKeys: 'fooIds'})
        }
      });
      store.defineMapper('bar', {
        relations: {
          hasMany: relation('foo', {localField: 'foos', localKeys: 'fooIds'})
        }
      });
    });

    it('should add property accessors to prototype of target', () => {
      const Foo = store.getMapper('foo').recordClass;
      const Bar = store.getMapper('bar').recordClass;

      expect(Foo.prototype.hasOwnProperty('bars')).toBe(true);
      expect(Bar.prototype.hasOwnProperty('foos')).toBe(true);
    });

    it('should return empty array for association if there is no linked records', () => {
      const foo = store.add('foo', {});

      expect(foo.bars).toEqual([]);
    });

    it('should create association when related record is added to the store', () => {
      const foo = store.add('foo', {id: 1});
      const bars = store.add('bar', [{id: 1, fooIds: [1]}, {id: 2}]);

      expect(foo.bars).toEqual(bars.slice(0, 1));
    });

    it('should allow relation re-assignment', () => {
      const foo = store.add('foo', {id: 1});
      const anotherFoo = store.add('foo', {id: 2});
      const bars = store.add('bar', [
        {id: 1, fooIds: [1]},
        {id: 2, fooIds: [2]},
        {id: 3, fooIds: [2]}
      ]);
      const otherBars = bars.slice(1);

      foo.bars = otherBars;

      expect(foo.bars).toEqual(otherBars);
      expect(otherBars[0].foos).toEqual(otherBars[1].foos);
      expect(otherBars[0].foos).toEqual([anotherFoo, foo]);
    });
  });

  describe('when getter/setter is specified for association', () => {
    let store, foo;

    beforeEach(() => {
      store = new DataStore();
      store.defineMapper('foo', {
        relations: {
          hasMany: relation('bar', {
            localField: 'bars',
            foreignKey: 'fooId',
            get(Relation, foo) {
              foo._bars = foo._bars || [];
              return foo._bars;
            },
            set(Relation, foo, bars) {
              foo._bars = bars;
            }
          })
        }
      });
      store.defineMapper('bar', {
        relations: {
          belongsTo: relation('foo', {localField: 'foo', foreignKey: 'fooId'})
        }
      });
      foo = store.add('foo', {id: 1});
      store.add('bar', [{id: 1, fooId: 1}]);
    });

    it('sets related records according to implemented setter', () => {
      foo.bars = store.add('bar', [{id: 2}, {id: 3}]);

      expect(foo.bars).toEqual(foo._bars);
    });

    it('gets related records according to implemented getter', () => {
      expect(foo.bars).toEqual(foo._bars);
    });
  });
});
