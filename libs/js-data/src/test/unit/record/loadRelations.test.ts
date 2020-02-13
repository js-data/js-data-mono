import { data, objectsEqual, store } from '../../_setup';

describe('Record#changes', () => {
  const makeAdapter = () => ({
    find(mapper, id, opts) {
      if (mapper.name === 'organization') {
        return Promise.resolve(data.organization2);
      } else {
        return Promise.resolve();
      }
    },
    findAll(mapper, query, opts) {
      if (mapper.name === 'profile') {
        return Promise.resolve([data.profile4]);
      } else if (mapper.name === 'group') {
        return Promise.resolve([data.group3]);
      } else if (mapper.name === 'comment') {
        return Promise.resolve([data.comment3]);
      } else if (mapper.name === 'user') {
        return Promise.resolve([data.user1]);
      }
      return Promise.resolve([]);
    }
  });

  it('should load relations', async () => {
    const mockAdapter = makeAdapter();
    const user = store.createRecord('user', data.user1);
    store.registerAdapter('mock', mockAdapter, {default: true});

    await user.loadRelations(['organization', 'profile', 'comments', 'group']);

    objectsEqual(user.organization, data.organization2);
    objectsEqual(user.profile, data.profile4);
    objectsEqual(user.comments, [data.comment3]);
    objectsEqual([user.groups[0].toJSON()], [data.group3]);
  });

  it('should load relations', async () => {
    const user = store.createRecord('user', data.user1);
    store.registerAdapter(
      'mock',
      {
        findAll() {
          return Promise.resolve([]);
        }
      },
      {default: true}
    );

    await user.loadRelations(['profile']);

    expect(user.profile).toEqual(undefined);
  });

  it('should load localKeys relations', async () => {
    const mockAdapter = makeAdapter();
    const group = store.createRecord('group', data.group3);
    store.registerAdapter('mock', mockAdapter, {default: true});

    await group.loadRelations(['user']);

    objectsEqual(group.users, [data.user1]);
  });

  it('should load belongsTo relations using a DataStore', async () => {
    const mockAdapter = makeAdapter();
    const user = store.add('user', data.user1);
    store.registerAdapter('mock', mockAdapter, {default: true});

    await user.loadRelations('organization');

    objectsEqual(user.organization, data.organization2);
    expect(user.organization).toBe(store.get('organization', user.organizationId));
  });

  it('should load relations with custom load method', async () => {
    store.defineMapper('foo', {
      relations: {
        hasMany: {
          bar: {
            localField: 'bars',
            foreignKey: 'fooId'
          }
        }
      }
    });
    store.defineMapper('bar', {
      relations: {
        belongsTo: {
          foo: {
            localField: 'foo',
            foreignKey: 'fooId',
            load(BarMapper, Relation, bar, opts) {
              return Promise.resolve({id: 2});
            }
          }
        }
      }
    });
    const bar = store.add('bar', {id: 1, fooId: 2});
    await bar.loadRelations('foo');
    expect(bar.foo.id).toEqual(2);
  });
});
