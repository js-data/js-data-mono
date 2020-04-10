import * as JSData from 'js-data'

describe('MongoDBAdapter#find', function () {
  var adapter;

  beforeEach(function () {
    adapter = this.$$adapter
    // User = this.$$user
  });

  it('should not support updateMany', function () {
    return expect(adapter.updateMany).toThrow();
  });

  it('should ignore undefined when resource has schema', function () {
    var id;

    const schema = new JSData.Schema({
      'type': 'object',
      'properties': {
        'name': {
          'type': 'string'
        },
        'b': {
          'type': 'string'
        }
      }
    });
    const User = this.$$store.defineMapper('user', {schema: schema});

    return adapter.findAll(User, {
      name: 'John'
    }).then(function (users) {
      expect(users.length).toEqual(0);
      return adapter.create(User, {name: 'John'})
    }).then(function (user) {
      id = user._id;
      return adapter.find(User, id.toString())
    }).then(function (user) {
      assert.objectsEqual(user, {_id: id, name: 'John'})
    });
  })
});
