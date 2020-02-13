import { data, JSData, sinon, store } from '../../_setup';

describe('DataStore collection methods', () => {
  it('add should work', function () {
    const user = store.add('user', {id: 1, name: 'John'});
    expect(user).toEqual({id: 1, name: 'John'});
  });
  it('remove should remove relations', function () {
    const user = store.add('user', data.user10);
    store.add('organization', data.organization15);
    store.add('comment', data.comment19);
    store.add('profile', data.profile21);

    expect(store.filter('comment', {userId: user.id}).length).toEqual(3);
    expect(store.get('organization', user.organizationId)).toBeTruthy();
    expect(store.filter('profile', {userId: user.id}).length).toEqual(1);

    const removedUser = store.remove('user', user.id, {with: ['organization']});

    expect(user === removedUser).toBeTruthy();
    expect(store.filter('comment', {userId: user.id}).length).toEqual(3);
    expect(!store.get('organization', user.organizationId)).toBeTruthy();
    expect(removedUser.organization).toBeTruthy();
    expect(store.getAll('profile').length).toEqual(2);
  });
  it('remove should remove multiple relations', function () {
    const user = store.add('user', data.user10);
    store.add('organization', data.organization15);
    store.add('comment', data.comment19);
    store.add('profile', data.profile21);

    expect(store.filter('comment', {userId: user.id}).length).toEqual(3);
    expect(store.get('organization', user.organizationId)).toBeTruthy();
    expect(store.filter('profile', {userId: user.id}).length).toEqual(1);

    const removedUser = store.remove('user', user.id, {with: ['organization', 'comment', 'profile']});

    expect(user === removedUser).toBeTruthy();
    expect(store.filter('comment', {userId: user.id}).length).toEqual(0);
    expect(removedUser.comments.length).toEqual(3);
    expect(!store.get('organization', user.organizationId)).toBeTruthy();
    expect(removedUser.organization).toBeTruthy();
    expect(store.filter('profile', {userId: user.id}).length).toEqual(0);
    expect(!removedUser.profile).toBeTruthy();
  });
  it('removeAll should remove relations', function () {
    const user = store.add('user', data.user10);
    store.add('organization', data.organization15);
    store.add('comment', data.comment19);
    store.add('profile', data.profile21);

    expect(store.filter('comment', {userId: user.id}).length).toEqual(3);
    expect(store.get('organization', user.organizationId)).toBeTruthy();
    expect(store.filter('profile', {userId: user.id}).length).toEqual(1);

    const removedUsers = store.removeAll('user', {}, {with: ['organization']});

    expect(user === removedUsers[0]).toBeTruthy();
    expect(store.filter('comment', {userId: user.id}).length).toEqual(3);
    expect(!store.get('organization', user.organizationId)).toBeTruthy();
    expect(removedUsers[0].organization).toBeTruthy();
    expect(store.getAll('profile').length).toEqual(2);
  });
  it('removeAll should remove multiple relations', function () {
    const user = store.add('user', data.user10);
    store.add('organization', data.organization15);
    store.add('comment', data.comment19);
    store.add('profile', data.profile21);

    expect(store.filter('comment', {userId: user.id}).length).toEqual(3);
    expect(store.get('organization', user.organizationId)).toBeTruthy();
    expect(store.filter('profile', {userId: user.id}).length).toEqual(1);

    const removedUsers = store.removeAll('user', {}, {with: ['organization', 'comment', 'profile']});

    expect(user === removedUsers[0]).toBeTruthy();
    expect(store.filter('comment', {userId: user.id}).length).toEqual(0);
    expect(removedUsers[0].comments.length).toEqual(3);
    expect(!store.get('organization', user.organizationId)).toBeTruthy();
    expect(removedUsers[0].organization).toBeTruthy();
    expect(store.filter('profile', {userId: user.id}).length).toEqual(0);
    expect(!removedUsers[0].profile).toBeTruthy();
  });
  it('should delete cached findAll query on removeAll', function () {
    const query = {name: 'John'};
    let callCount = 0;
    store.registerAdapter(
      'mock',
      {
        findAll() {
          callCount++;
          return Promise.resolve([{id: 1, name: 'John'}]);
        }
      },
      {default: true}
    );
    return store
      .findAll('user', query)
      .then(users => {
        expect(callCount).toEqual(1);
        return store.findAll('user', query);
      })
      .then(users => {
        // Query was only made once
        expect(callCount).toEqual(1);
        store.removeAll('user', query);
        return store.findAll('user', query);
      })
      .then(users => {
        expect(callCount).toEqual(2);
      });
  });
  it('should remove all queries', function () {
    const queryOne = {name: 'Bob'};
    const queryTwo = {name: 'Alice'};
    let callCount = 0;
    store.registerAdapter(
      'mock',
      {
        findAll() {
          callCount++;
          return Promise.resolve([]);
        }
      },
      {default: true}
    );
    return store
      .findAll('user', queryOne)
      .then(users => {
        expect(callCount).toEqual(1);
        return store.findAll('user', queryOne);
      })
      .then(users => {
        expect(callCount).toEqual(1);
        return store.findAll('user', queryTwo);
      })
      .then(users => {
        expect(callCount).toEqual(2);
        return store.findAll('user', queryTwo);
      })
      .then(users => {
        // Query was only made twice
        expect(callCount).toEqual(2);
        store.removeAll('user');
        return store.findAll('user', queryOne);
      })
      .then(users => {
        expect(callCount).toEqual(3);
        return store.findAll('user', queryTwo);
      })
      .then(users => {
        expect(callCount).toEqual(4);
      });
  });

  it('should proxy Collection Methods', () => {
    const store = new JSData.SimpleStore();
    store.defineMapper('user');
    const collection = store.getCollection('user');

    sinon.replace(collection, 'createIndex', sinon.fake());
    store.createIndex('user', 'statusAndRole', ['status', 'role']);
    expect(
      (collection.createIndex as any).calledWithMatch('statusAndRole', ['status', 'role'])
    ).toBeTruthy();

    sinon.replace(collection, 'between', sinon.fake());
    store.between('user', [18], [30], {index: 'age'});
    expect((collection.between as any).calledWithMatch([18], [30], {index: 'age'})).toBeTruthy();

    sinon.replace(collection, 'toJSON', sinon.fake());
    store.toJSON('user', {id: 1});
    expect((collection.toJSON as any).calledWithMatch({id: 1})).toBeTruthy();
  });
});
