import * as JSData from '../index';
import { Collection, DataStore, Mapper } from '../index';
import * as sinon from 'sinon';

export function objectsEqual(a, b, msg?) {
  expect(JSON.parse(JSON.stringify(a)))
    .toEqual(JSON.parse(JSON.stringify(b)));
}

// Setup global data once
export { JSData, sinon };
export const TYPES_EXCEPT_STRING = [123, 123.123, null, undefined, {}, [], true, false, () => {}];
export const TYPES_EXCEPT_STRING_OR_ARRAY = [123, 123.123, null, undefined, {}, true, false, () => {}];
export const TYPES_EXCEPT_STRING_OR_NUMBER = [null, undefined, {}, [], true, false, () => {}];
export const TYPES_EXCEPT_STRING_OR_OBJECT = [123, 123.123, null, undefined, [], true, false, () => {}];
export const TYPES_EXCEPT_STRING_OR_NUMBER_OBJECT = [null, undefined, [], true, false, () => {}];
export const TYPES_EXCEPT_ARRAY = ['string', 123, 123.123, null, undefined, {}, true, false, () => {}];
export const TYPES_EXCEPT_STRING_OR_ARRAY_OR_NUMBER = [null, undefined, {}, true, false, () => {}];
export const TYPES_EXCEPT_NUMBER = ['string', null, undefined, {}, [], true, false, () => {}];
export const TYPES_EXCEPT_OBJECT = ['string', 123, 123.123, null, undefined, true, false, () => {}];
export const TYPES_EXCEPT_OBJECT_OR_ARRAY = ['string', 123, 123.123, null, undefined, true, false, () => {}];
export const TYPES_EXCEPT_BOOLEAN = ['string', 123, 123.123, null, undefined, {}, [], () => {}];
export const TYPES_EXCEPT_FUNCTION = ['string', 123, 123.123, null, undefined, {}, [], true, false];

export function createRelation(name, defs) {
  return {[name]: defs};
}

export function createStore(options?) {
  const store = new JSData.DataStore(options);
  registerInMemoryAdapterFor(store);

  return store;
}

export function createMapper(options) {
  const mapper = new JSData.Mapper(options);
  registerInMemoryAdapterFor(mapper);

  return mapper;
}

let idCounter = 1;

function generateId() {
  return Date.now() + idCounter++;
}

function createInMemoryAdapter() {
  const adapter = {
    create(mapper, props, options) {
      props[mapper.idAttribute] = generateId();
      return adapter.resolve(props, options);
    },

    createMany(mapper, records, options) {
      records.forEach(props => {
        props[mapper.idAttribute] = generateId();
      });

      return adapter.resolve(records, options);
    },

    resolve(data, options) {
      if (options.raw) {
        return JSData.utils.resolve({
          data,
          processedAt: new Date()
        });
      }

      return JSData.utils.resolve(data);
    }
  };

  return adapter;
}

function registerInMemoryAdapterFor(storeOrMapper, options = {default: true}) {
  storeOrMapper.registerAdapter('inMemory', createInMemoryAdapter(), options);

  const adapter = storeOrMapper.getAdapter('inMemory');
  Object.keys(adapter).forEach(name => sinon.spy(adapter, name));

  return adapter;
}

export let data;
export let store: DataStore;
export let User: Mapper;
export let Post: Mapper;
export let Group: Mapper;
export let Profile: Mapper;
export let Organization: Mapper;
export let Comment: Mapper;
export let PostCollection: Collection;
export let UserCollection: Collection;
export let GroupCollection: Collection;
export let OrganizationCollection: Collection;
export let ProfileCollection: Collection;
export let CommentCollection: Collection;

// Clean setup for each test
beforeEach(() => {
  data = {};
  data.p1 = {author: 'John', age: 30, id: 5};
  data.p2 = {author: 'Sally', age: 31, id: 6};
  data.p3 = {author: 'Mike', age: 32, id: 7};
  data.p4 = {author: 'Adam', age: 33, id: 8};
  data.p5 = {author: 'Adam', age: 33, id: 9};
  store = new JSData.DataStore({
    linkRelations: true
  });
  Post = store.defineMapper('post', {
    endpoint: '/posts'
  });
  PostCollection = store.getCollection('post');
  User = store.defineMapper('user', {
    relations: {
      belongsTo: {
        organization: {
          localField: 'organization',
          foreignKey: 'organizationId'
        }
      },
      hasMany: {
        comment: [
          {
            localField: 'comments',
            foreignKey: 'userId'
          },
          {
            localField: 'approvedComments',
            foreignKey: 'approvedBy'
          }
        ],
        group: {
          localField: 'groups',
          foreignKeys: 'userIds'
        }
      },
      hasOne: {
        profile: {
          localField: 'profile',
          foreignKey: 'userId'
        }
      }
    }
  });
  UserCollection = store.getCollection('user');
  Group = store.defineMapper('group', {
    relations: {
      hasMany: {
        user: {
          localField: 'users',
          localKeys: 'userIds'
        }
      }
    }
  });
  GroupCollection = store.getCollection('group');
  Organization = store.defineMapper('organization', {
    relations: {
      hasMany: {
        user: {
          localField: 'users',
          foreignKey: 'organizationId'
        }
      }
    }
  });
  OrganizationCollection = store.getCollection('organization');
  Profile = store.defineMapper('profile', {
    relations: {
      belongsTo: {
        user: {
          localField: 'user',
          foreignKey: 'userId'
        }
      }
    }
  });
  ProfileCollection = store.getCollection('profile');
  Comment = store.defineMapper('comment', {
    relations: {
      belongsTo: {
        user: [
          {
            localField: 'user',
            foreignKey: 'userId'
          },
          {
            localField: 'approvedByUser',
            foreignKey: 'approvedBy'
          }
        ]
      }
    }
  });
  CommentCollection = store.getCollection('comment');
  data.user1 = {
    name: 'John Anderson',
    id: 1,
    organizationId: 2
  };
  data.organization2 = {
    name: 'Test Corp 2',
    id: 2
  };
  data.comment3 = {
    content: 'test comment 3',
    id: 3,
    userId: 1
  };
  data.profile4 = {
    content: 'test profile 4',
    id: 4,
    userId: 1
  };

  data.comment11 = {
    id: 11,
    userId: 10,
    content: 'test comment 11'
  };
  data.comment12 = {
    id: 12,
    userId: 10,
    content: 'test comment 12'
  };
  data.comment13 = {
    id: 13,
    userId: 10,
    content: 'test comment 13'
  };
  data.organization14 = {
    id: 14,
    name: 'Test Corp'
  };
  data.profile15 = {
    id: 15,
    userId: 10,
    email: 'john.anderson@this.com'
  };
  data.user10 = {
    name: 'John Anderson',
    id: 10,
    organizationId: 14,
    comments: [data.comment11, data.comment12, data.comment13],
    organization: data.organization14,
    profile: data.profile15
  };
  data.user16 = {
    id: 16,
    organizationId: 15,
    name: 'test user 16'
  };
  data.user17 = {
    id: 17,
    organizationId: 15,
    name: 'test user 17'
  };
  data.user18 = {
    id: 18,
    organizationId: 15,
    name: 'test user 18'
  };
  data.group1 = {
    name: 'group 1',
    id: 1,
    userIds: [10]
  };
  data.group2 = {
    name: 'group 2',
    id: 2,
    userIds: [10]
  };
  data.group3 = {
    name: 'group 3',
    id: 3,
    userIds: [1]
  };
  data.organization15 = {
    name: 'Another Test Corp',
    id: 15,
    users: [data.user16, data.user17, data.user18]
  };
  data.user19 = {
    id: 19,
    name: 'test user 19'
  };
  data.user20 = {
    id: 20,
    name: 'test user 20'
  };
  data.comment19 = {
    content: 'test comment 19',
    id: 19,
    approvedBy: 19,
    approvedByUser: data.user19,
    userId: 20,
    user: data.user20
  };
  data.user22 = {
    id: 22,
    name: 'test user 22'
  };
  data.profile21 = {
    content: 'test profile 21',
    id: 21,
    userId: 22,
    user: data.user22
  };
});
