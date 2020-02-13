import { data, JSData, PostCollection, TYPES_EXCEPT_OBJECT_OR_ARRAY, UserCollection } from '../../_setup';

describe('Collection#add', () => {
  it('should inject new items into the collection', () => {
    const collection = new JSData.Collection();
    const user = collection.add({id: 1});
    const users = collection.add([{id: 2}, {id: 3}]);
    expect(collection.get(1) === user).toBeTruthy();
    expect(collection.between([2], [3], {
      rightInclusive: true
    })).toEqual(users);
  });
  it('should inject multiple items into the collection', function () {
    expect(
      PostCollection.add([data.p1, data.p2, data.p3, data.p4])
    ).toEqual([
      data.p1,
      data.p2,
      data.p3,
      data.p4
    ]);

    expect(PostCollection.get(5)).toEqual(data.p1);
    expect(PostCollection.get(6)).toEqual(data.p2);
    expect(PostCollection.get(7)).toEqual(data.p3);
    expect(PostCollection.get(8)).toEqual(data.p4);
  });
  it('should allow unsaved records into the collection', function () {
    expect(PostCollection.add([
      data.p1,
      data.p2,
      {author: 'Alice'},
      data.p3,
      {author: 'Bob'},
      data.p4
    ])).toEqual(
      [data.p1, data.p2, {author: 'Alice'}, data.p3, {author: 'Bob'}, data.p4]
    );

    expect(PostCollection.get(5)).toEqual(data.p1);
    expect(PostCollection.get(6)).toEqual(data.p2);
    expect(PostCollection.get(7)).toEqual(data.p3);
    expect(PostCollection.get(8)).toEqual(data.p4);
    expect(PostCollection.filter({
      id: undefined
    }).length).toEqual(2);
    expect(PostCollection.filter({
      id: undefined
    })[0]).toEqual({author: 'Bob'});
    expect(PostCollection.filter({
      id: undefined
    })[1]).toEqual({author: 'Alice'});
    expect(PostCollection.filter({
      id: undefined
    })[0]).toEqual({author: 'Bob'});
    expect(PostCollection.filter().length).toEqual(6);

    PostCollection.add({author: 'Bob'});
    expect(PostCollection.filter({
      id: undefined
    }).length).toEqual(3);
    expect(PostCollection.filter({
      author: 'Bob'
    }).length).toEqual(2);
    expect(PostCollection.filter().length).toEqual(7);

    PostCollection.add({author: 'Bob'});
    expect(PostCollection.filter({
      id: undefined
    }).length).toEqual(4);
    expect(PostCollection.filter({
      author: 'Bob'
    }).length).toEqual(3);
    expect(PostCollection.filter().length).toEqual(8);
  });
  it('should inject existing items into the collection and call Record#commit', () => {
    const collection = new JSData.Collection({mapper: new JSData.Mapper({name: 'user'})});

    const user = collection.add({id: 1});
    expect(user.hasChanges()).toEqual(false);
    user.foo = 'bar';
    expect(user.hasChanges()).toEqual(true);
    const users = collection.add([{id: 2}, {id: 3}]);
    const userAgain = collection.add({id: 1});
    expect(user.hasChanges()).toEqual(false);
    const usersAgain = collection.add([{id: 2}, {id: 3}]);
    expect(collection.get(1) === user).toBeTruthy();
    expect(collection.get(1) === userAgain).toBeTruthy();
    expect(user === userAgain).toBeTruthy();
    expect(collection.between([2], [3], {
      rightInclusive: true
    })).toEqual(users);
    expect(collection.between([2], [3], {
      rightInclusive: true
    })).toEqual(usersAgain);
    expect(users).toEqual(usersAgain);
  });
  it('should insert a record into all indexes', () => {
    const data = [
      {id: 2, age: 19},
      {id: 1, age: 27}
    ];
    const collection = new JSData.Collection(data);
    collection.createIndex('age');
    collection.add({id: 3, age: 20});
    expect(collection.get(1) === data[1]).toBeTruthy();
    expect(collection.getAll(20, {index: 'age'}).length).toEqual(1);
  });
  it('should not require an id', () => {
    const collection = new JSData.Collection();
    expect(() => {
      collection.add({});
    }).not.toThrow();
  });
  it('should test opts.onConflict', () => {
    const collection = new JSData.Collection();
    collection.add({id: 1});
    expect(() => {
      collection.add({id: 1}, {onConflict: 'invalid_choice'});
    }).toThrow();
  });
  it('should respect opts.noValidate', () => {
    const mapper = new JSData.Mapper({
      name: 'user',
      noValidate: false,
      schema: {
        type: 'object',
        properties: {
          id: {type: 'string'},
          name: {type: 'string'}
        }
      }
    });
    const collection = new JSData.Collection({mapper});
    const userData = {id: Math.random().toString(), name: Math.random().toString()};
    const user = collection.add(userData);
    expect(() => {
      collection.add(Object.assign({}, userData, {name: null}), {noValidate: true});
    }).not.toThrow();
    // original noValidate prop value should be restored
    expect(user._get('noValidate')).toEqual(false);
  });
  it('should required an argument', () => {
    const collection = new JSData.Collection();
    TYPES_EXCEPT_OBJECT_OR_ARRAY.forEach(value => {
      expect(() => {
        collection.add(value);
      }).toThrow();
    });
  });
  it('should replace existing items', () => {
    const collection = new JSData.Collection({mapper: new JSData.Mapper({name: 'user'})});
    const user = collection.add({id: 1, foo: 'bar', beep: 'boop'});
    expect(user.id).toEqual(1);
    expect(user.foo).toEqual('bar');
    expect(user.beep).toEqual('boop');
    expect(!user.biz).toBeTruthy();
    let existing = collection.add({id: 1, biz: 'baz', foo: 'BAR'}, {onConflict: 'replace'});
    expect(user === existing).toBeTruthy();
    expect(user.id).toEqual(1);
    expect(user.biz).toEqual('baz');
    expect(user.foo).toEqual('BAR');
    expect(!user.beep).toBeTruthy();
    existing = collection.add(existing);
    expect(user === existing).toBeTruthy();
    expect(existing.id).toEqual(1);
    expect(existing.biz).toEqual('baz');
    expect(existing.foo).toEqual('BAR');
    expect(!existing.beep).toBeTruthy();

    const store = new JSData.DataStore();
    store.defineMapper('test', {
      schema: {
        properties: {
          id: {type: 'string'},
          count: {type: 'number'}
        }
      }
    });

    const test = store.createRecord('test', {id: 'abcd', count: 1});
    store.add('test', test);
    const test2 = store.createRecord('test', {id: 'abcd', count: 2});
    store.add('test', test2);
    expect(store.get('test', 'abcd').count).toEqual(2);
  });
  it('should replace existing items (2)', function () {
    let post = PostCollection.add(data.p1);
    post.foo = 'bar';
    post.beep = 'boop';
    expect(post).toEqual({
      author: 'John',
      age: 30,
      id: 5,
      foo: 'bar',
      beep: 'boop'
    });
    post = PostCollection.add(data.p1, {onConflict: 'replace'});
    expect(post).toEqual({
      author: 'John',
      age: 30,
      id: 5
    });
  });
  it('should keep existing items', () => {
    const collection = new JSData.Collection({mapper: new JSData.Mapper({name: 'user'})});
    const user = collection.add({id: 1, foo: 'bar', beep: 'boop'});
    expect(user.id).toEqual(1);
    expect(user.foo).toEqual('bar');
    expect(user.beep).toEqual('boop');
    const existing = collection.add({id: 1, biz: 'baz', foo: 'BAR'}, {onConflict: 'skip'});
    expect(user === existing).toBeTruthy();
    expect(user.id).toEqual(1);
    expect(user.foo).toEqual('bar');
    expect(user.beep).toEqual('boop');
    expect(!user.biz).toBeTruthy();

    const store = new JSData.DataStore();
    store.defineMapper('test', {
      onConflict: 'skip',
      schema: {
        properties: {
          id: {type: 'string'},
          count: {type: 'number'}
        }
      }
    });

    const test = store.createRecord('test', {id: 'abcd', count: 1});
    store.add('test', test);
    const test2 = store.createRecord('test', {id: 'abcd', count: 2});
    store.add('test', test2);
    expect(store.get('test', 'abcd').count).toEqual(1);
  });
  it('should inject 1,000 items', function () {
    const users = [];
    for (let i = 0; i < 1000; i++) {
      users.push({
        id: i,
        name: 'john smith #' + i,
        age: Math.floor(Math.random() * 100),
        created: new Date().getTime(),
        updated: new Date().getTime()
      });
    }
    // const start = new Date().getTime()
    UserCollection.add(users);
    // console.log('\tinject 1,000 users time taken: ', new Date().getTime() - start, 'ms')
  });
  it.skip('should inject 10,000 items', function () {
    const users = [];
    for (let i = 0; i < 10000; i++) {
      users.push({
        id: i,
        name: 'john smith #' + i,
        age: Math.floor(Math.random() * 100),
        created: new Date().getTime(),
        updated: new Date().getTime()
      });
    }
    const start = new Date().getTime();
    UserCollection.add(users);
    console.log('\tinject 10,000 users time taken: ', new Date().getTime() - start, 'ms');
  });
  it('should inject 1,000 items where there is an index on "age"', () => {
    const collection = new JSData.Collection({mapper: new JSData.Mapper({name: 'user'})});
    collection.createIndex('age');
    collection.createIndex('created');
    collection.createIndex('updated');
    const users = [];
    for (let i = 0; i < 1000; i++) {
      users.push({
        id: i,
        name: 'john smith #' + i,
        age: Math.floor(Math.random() * 100),
        created: new Date().getTime(),
        updated: new Date().getTime()
      });
    }
    // const start = new Date().getTime()
    collection.add(users);
    // console.log('\tinject 1,000 users time taken: ', new Date().getTime() - start, 'ms')
  });
  // tslint:disable-next-line:only-arrow-functions
  it.skip('should inject 10,000 items where there is an index on "age"', function () {
    const store = new JSData.DataStore();
    store.defineMapper('user');
    store.createIndex('user', 'age');
    store.createIndex('user', 'created');
    store.createIndex('user', 'updated');
    const users = [];
    for (let i = 0; i < 10000; i++) {
      users.push({
        id: i,
        name: 'john smith #' + i,
        age: Math.floor(Math.random() * 100),
        created: new Date().getTime(),
        updated: new Date().getTime()
      });
    }
    // const start = new Date().getTime()
    store.add('user', users);
    // console.log('\tinject 10,000 users time taken: ', new Date().getTime() - start, 'ms')
    // console.log('\tusers age 40-44', User.between(40, 45, { index: 'age' }).length)
  });
  it('should update a records relation when the inverse relation does not exist', () => {
    const store = new JSData.DataStore();
    store.defineMapper('user');
    store.defineMapper('post', {
      relations: {
        belongsTo: {
          user: {
            localKey: 'user_id',
            localField: 'user'
          }
        }
      }
    });
    const [user1, user2] = store.add('user', [
      {
        id: 1,
        name: 'John'
      },
      {
        id: 2,
        name: 'Jane'
      }
    ]);
    const post = store.add('post', {id: 2, title: 'foo', user_id: 1});
    expect(post.user).toBe(user1);
    store.add('post', {id: 2, title: 'foo', user_id: 2});
    expect(post.user).toBe(user2);
  });
});
