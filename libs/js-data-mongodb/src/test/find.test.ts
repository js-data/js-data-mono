import { $$adapter, $$User, objectsEqual } from './_setup';

describe('MongoDBAdapter#find', () => {
  let adapter, User;

  beforeEach(() => {
    adapter = $$adapter;
    User = $$User;
  });

  it('should find a user by its bson ObjectId hex string', () => {
    let id;

    return adapter.findAll(User, {
      name: 'John'
    }).then(users => {
      expect(users.length).toEqual(0);
      return adapter.create(User, {name: 'John'});
    }).then(user => {
      id = user._id;
      return adapter.find(User, id.toString());
    }).then(user => {
      objectsEqual(user, {_id: id, name: 'John'});
    });
  });

  it('should not convert id if it is not a valid bson ObjectId hex string', () => {
    let id;

    return adapter.findAll(User, {
      name: 'John'
    }).then(users => {
      expect(users.length).toEqual(0);
      return adapter.create(User, {_id: '1', name: 'John'});
    }).then(user => {
      id = user._id;
      expect(typeof id).toEqual('string');
      return adapter.find(User, id);
    }).then(user => {
      objectsEqual(user, {_id: id, name: 'John'});
    });
  });

  it('should convert fields in records that are ObjectID bson type', () => {
    let ObjectID = require('bson').ObjectID;
    let id;

    ObjectID = new ObjectID();

    return adapter.findAll(User, {
      name: 'John'
    }).then(users => {
      expect(users.length).toEqual(0);
      return adapter.create(User, {bsonField: ObjectID});
    }).then(user => {
      id = user._id;
      expect(typeof id).toEqual('string');
      return adapter.find(User, id);
    }).then(user => {
      objectsEqual(user, {_id: id, bsonField: ObjectID.toString()});
    });
  });

  it('should use orderBy array', () => {
    let id;

    return adapter.findAll(User, {
      name: 'John'
    }).then(users => {
      expect(users.length).toEqual(0);
      return adapter.create(User, {_id: '1', name: 'John'});
    }).then(user => {
      id = user._id;
      expect(typeof id).toEqual('string');
      return adapter.findAll(User, {where: {id: id}, orderBy: ['name', 'asc']});
    }).then(userList => {
      objectsEqual(userList, [{_id: id, name: 'John'}]);
    });
  });

  it('should use orderBy string', () => {
    let id;

    return adapter.findAll(User, {
      name: 'John'
    }).then(users => {
      expect(users.length).toEqual(0);
      return adapter.create(User, {_id: '1', name: 'John'});
    }).then(user => {
      id = user._id;
      expect(typeof id).toEqual('string');
      return adapter.findAll(User, {where: {id: id}, orderBy: 'name'});
    }).then(userList => {
      objectsEqual(userList, [{_id: id, name: 'John'}]);
    });
  });

  it('should allow use of node-mongodb-native via adapter.client', () =>
    adapter.client.then((db) => {
      expect(db.collection('user')).toBeTruthy();
    }).catch((err) => {
      throw new Error(err);
    }));
});
