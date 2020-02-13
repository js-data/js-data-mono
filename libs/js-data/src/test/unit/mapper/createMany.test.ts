import { JSData, objectsEqual, store } from '../../_setup';

describe('Mapper#createMany', () => {
  it('should be an instance method', () => {
    const Mapper = JSData.Mapper;
    const mapper = new Mapper({name: 'foo'});
    expect(typeof mapper.createMany).toEqual('function');
    expect(mapper.createMany).toBe(Mapper.prototype.createMany);
  });
  it('should createMany', async () => {
    const props = [{name: 'John'}];
    let createCalled = false;
    const UserMapper = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock'
    });
    UserMapper.registerAdapter('mock', {
      createMany(mapper, _props, Opts) {
        createCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(UserMapper);
          expect(_props).toEqual(props);
          _props[0][mapper.idAttribute] = new Date().getTime();
          resolve(_props);
        });
      }
    });
    const users = await UserMapper.createMany(props);
    expect(createCalled).toBeTruthy();
    expect(users[0][UserMapper.idAttribute]).toBeTruthy();
    expect(users[0] instanceof UserMapper.recordClass).toBeTruthy();
  });
  it('should return raw', async () => {
    const props = [{name: 'John'}];
    let createCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      raw: true,
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      createMany(mapper, _props, Opts) {
        createCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_props).toEqual(props);
          expect(Opts.raw).toEqual(true);
          _props[0][mapper.idAttribute] = new Date().getTime();
          resolve({
            data: _props,
            created: 1
          });
        });
      }
    });
    const data = await User.createMany(props);
    expect(createCalled).toBeTruthy();
    expect(data.data[0][User.idAttribute]).toBeTruthy();
    expect(data.data[0] instanceof User.recordClass).toBeTruthy();
    expect(data.adapter).toEqual('mock');
    expect(data.created).toEqual(1);
  });
  it('should nested create everything in opts.with', async function () {
    const createCalledCount: any = {};
    let id = 1;

    const incCreate = name => {
      if (!createCalledCount.hasOwnProperty(name)) {
        createCalledCount[name] = 0;
      }
      createCalledCount[name]++;
    };
    const clear = () => {
      // tslint:disable-next-line:forin
      for (const key in store._mappers) {
        store.removeAll(key);
      }
    };
    store.registerAdapter(
      'mock',
      {
        createMany(mapper, _props, Opts) {
          incCreate(mapper.name);
          // tslint:disable-next-line:variable-name
          _props.forEach(__props => {
            __props[mapper.idAttribute] = id;
            id++;
          });
          return Promise.resolve(_props);
        }
      },
      {default: true}
    );

    const userProps = [
      {
        name: 'John',
        organization: {
          name: 'Company Inc'
        },
        profile: {
          email: 'john@email.com'
        }
      },
      {
        name: 'Sally',
        organization: {
          name: 'Company LLC'
        },
        profile: {
          email: 'sally@email.com'
        }
      }
    ];

    const getProps = () => {
      return JSData.utils.plainCopy(userProps).map(props => {
        return store.createRecord('user', props);
      });
    };

    // when props are a Record
    let users = await store.createMany('user', getProps(), {with: []});
    expect(store.is('user', users[0])).toBeTruthy();
    expect(store.is('user', users[1])).toBeTruthy();
    expect(store.get('user', users[0].id) === users[0]).toBeTruthy();
    expect(store.get('user', users[1].id) === users[1]).toBeTruthy();
    expect(users[0].profile).toEqual(userProps[0].profile);
    expect(users[1].profile).toEqual(userProps[1].profile);
    expect(store.getAll('profile')).toEqual([userProps[1].profile, userProps[0].profile]);
    expect(users[0].organization).toEqual(userProps[0].organization);
    expect(users[1].organization).toEqual(userProps[1].organization);
    expect(!users[0].organizationId).toBeTruthy();
    expect(!users[1].organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps[1].organization, userProps[0].organization]);
    clear();

    users = await store.createMany('user', getProps(), {with: ['profile']});
    expect(store.is('user', users[0])).toBeTruthy();
    expect(store.is('user', users[1])).toBeTruthy();
    expect(store.get('user', users[0].id) === users[0]).toBeTruthy();
    expect(store.get('user', users[1].id) === users[1]).toBeTruthy();
    expect(store.is('profile', users[0].profile)).toBeTruthy();
    expect(store.is('profile', users[1].profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([users[0].profile, users[1].profile]);
    expect(users[0].organization).toEqual(userProps[0].organization);
    expect(users[1].organization).toEqual(userProps[1].organization);
    expect(!users[0].organizationId).toBeTruthy();
    expect(!users[1].organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps[1].organization, userProps[0].organization]);
    clear();

    users = await store.createMany('user', getProps(), {with: ['profile', 'organization']});
    expect(store.is('user', users[0])).toBeTruthy();
    expect(store.is('user', users[1])).toBeTruthy();
    expect(store.get('user', users[0].id) === users[0]).toBeTruthy();
    expect(store.get('user', users[1].id) === users[1]).toBeTruthy();
    expect(store.is('profile', users[0].profile)).toBeTruthy();
    expect(store.is('profile', users[1].profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([users[0].profile, users[1].profile]);
    expect(store.is('organization', users[0].organization)).toBeTruthy();
    expect(store.is('organization', users[1].organization)).toBeTruthy();
    expect(store.getAll('organization')[0].id).toEqual(users[0].organizationId);
    expect(store.getAll('organization')[1].id).toEqual(users[1].organizationId);
    expect(store.getAll('organization')).toEqual([users[0].organization, users[1].organization]);
    clear();

    // when props are NOT a record
    users = await store.createMany('user', JSData.utils.copy(userProps), {with: []});
    expect(store.is('user', users[0])).toBeTruthy();
    expect(store.is('user', users[1])).toBeTruthy();
    expect(store.get('user', users[0].id) === users[0]).toBeTruthy();
    expect(store.get('user', users[1].id) === users[1]).toBeTruthy();
    objectsEqual(users[0].profile, {
      email: userProps[0].profile.email,
      userId: users[0].id
    });
    objectsEqual(users[1].profile, {
      email: userProps[1].profile.email,
      userId: users[1].id
    });
    objectsEqual(store.getAll('profile'), [
      {
        email: userProps[1].profile.email,
        userId: users[1].id
      },
      {
        email: userProps[0].profile.email,
        userId: users[0].id
      }
    ]);
    objectsEqual(users[0].organization, {
      name: 'Company Inc'
    });
    objectsEqual(users[1].organization, {
      name: 'Company LLC'
    });
    expect(!users[0].organizationId).toBeTruthy();
    expect(!users[1].organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps[1].organization, userProps[0].organization]);
    clear();

    users = await store.createMany('user', JSData.utils.copy(userProps), {with: ['profile']});
    expect(store.is('user', users[0])).toBeTruthy();
    expect(store.is('user', users[1])).toBeTruthy();
    expect(store.get('user', users[0].id) === users[0]).toBeTruthy();
    expect(store.get('user', users[1].id) === users[1]).toBeTruthy();
    expect(store.is('profile', users[0].profile)).toBeTruthy();
    expect(store.is('profile', users[1].profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([users[0].profile, users[1].profile]);
    expect(users[0].organization).toEqual({
      name: 'Company Inc'
    });
    expect(users[1].organization).toEqual({
      name: 'Company LLC'
    });
    expect(!users[0].organizationId).toBeTruthy();
    expect(!users[1].organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps[1].organization, userProps[0].organization]);
    clear();

    users = await store.createMany('user', JSData.utils.copy(userProps), {with: ['profile', 'organization']});
    expect(store.is('user', users[0])).toBeTruthy();
    expect(store.is('user', users[1])).toBeTruthy();
    expect(store.get('user', users[0].id) === users[0]).toBeTruthy();
    expect(store.get('user', users[1].id) === users[1]).toBeTruthy();
    expect(store.is('profile', users[0].profile)).toBeTruthy();
    expect(store.is('profile', users[1].profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([users[0].profile, users[1].profile]);
    expect(store.is('organization', users[0].organization)).toBeTruthy();
    expect(store.is('organization', users[1].organization)).toBeTruthy();
    expect(store.getAll('organization')[0].id).toEqual(users[0].organizationId);
    expect(store.getAll('organization')[1].id).toEqual(users[1].organizationId);
    expect(store.getAll('organization')).toEqual([users[0].organization, users[1].organization]);
    clear();

    expect(createCalledCount.user).toEqual(6);
    expect(!createCalledCount.comment).toBeTruthy();
    expect(createCalledCount.profile).toEqual(4);
    expect(createCalledCount.organization).toEqual(2);
  });
  it('should pass everything opts.pass', async function () {
    const createCalledCount: any = {};
    let id = 1;
    const utils = JSData.utils;

    const incCreate = name => {
      if (!createCalledCount.hasOwnProperty(name)) {
        createCalledCount[name] = 0;
      }
      createCalledCount[name]++;
    };
    const clear = () => {
      // tslint:disable-next-line:forin
      for (const key in store._mappers) {
        store.removeAll(key);
      }
    };
    store.registerAdapter(
      'mock',
      {
        createMany(mapper, _props, Opts) {
          incCreate(mapper.name);
          // tslint:disable-next-line:variable-name
          _props.forEach(__props => {
            __props[mapper.idAttribute] = id;
            id++;
          });
          mapper.relationFields.forEach(field => {
            // tslint:disable-next-line:variable-name
            _props.forEach(__props => {
              if (__props[field]) {
                if (utils.isArray(__props[field])) {
                  __props[field].forEach(item => {
                    item.id = id;
                    id++;
                  });
                } else if (utils.isObject(__props[field])) {
                  __props[field].id = id;
                  id++;
                }
              }
            });
          });
          return Promise.resolve(_props);
        }
      },
      {default: true}
    );

    const userProps = [
      {
        name: 'John',
        organization: {
          name: 'Company Inc'
        },
        profile: {
          email: 'john@email.com'
        }
      },
      {
        name: 'Sally',
        organization: {
          name: 'Company LLC'
        },
        profile: {
          email: 'sally@email.com'
        }
      }
    ];

    const getProps = () => {
      return JSData.utils.copy(userProps).map(props => {
        return store.createRecord('user', props);
      });
    };

    // when props are a Record
    let users = await store.createMany('user', getProps(), {pass: []});
    expect(store.is('user', users[0])).toBeTruthy();
    expect(store.is('user', users[1])).toBeTruthy();
    expect(store.get('user', users[0].id) === users[0]).toBeTruthy();
    expect(store.get('user', users[1].id) === users[1]).toBeTruthy();
    expect(users[0].profile).toEqual(userProps[0].profile);
    expect(users[1].profile).toEqual(userProps[1].profile);
    expect(store.getAll('profile')).toEqual([userProps[1].profile, userProps[0].profile]);
    expect(users[0].organization).toEqual(userProps[0].organization);
    expect(users[1].organization).toEqual(userProps[1].organization);
    expect(!users[0].organizationId).toBeTruthy();
    expect(!users[1].organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps[1].organization, userProps[0].organization]);
    clear();

    users = await store.createMany('user', getProps(), {pass: ['profile']});
    expect(store.is('user', users[0])).toBeTruthy();
    expect(store.is('user', users[1])).toBeTruthy();
    expect(store.get('user', users[0].id) === users[0]).toBeTruthy();
    expect(store.get('user', users[1].id) === users[1]).toBeTruthy();
    expect(store.is('profile', users[0].profile)).toBeTruthy();
    expect(store.is('profile', users[1].profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([users[0].profile, users[1].profile]);
    expect(users[0].organization).toEqual(userProps[0].organization);
    expect(users[1].organization).toEqual(userProps[1].organization);
    expect(!users[0].organizationId).toBeTruthy();
    expect(!users[1].organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps[1].organization, userProps[0].organization]);
    clear();

    users = await store.createMany('user', getProps(), {pass: ['profile', 'organization']});
    expect(store.is('user', users[0])).toBeTruthy();
    expect(store.is('user', users[1])).toBeTruthy();
    expect(store.get('user', users[0].id) === users[0]).toBeTruthy();
    expect(store.get('user', users[1].id) === users[1]).toBeTruthy();
    expect(store.is('profile', users[0].profile)).toBeTruthy();
    expect(store.is('profile', users[1].profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([users[0].profile, users[1].profile]);
    expect(store.is('organization', users[0].organization)).toBeTruthy();
    expect(store.is('organization', users[1].organization)).toBeTruthy();
    expect(store.getAll('organization')[0].id).toEqual(users[0].organizationId);
    expect(store.getAll('organization')[1].id).toEqual(users[1].organizationId);
    expect(store.getAll('organization')).toEqual([users[0].organization, users[1].organization]);
    clear();

    // when props are NOT a record
    users = await store.createMany('user', JSData.utils.copy(userProps), {pass: []});
    expect(store.is('user', users[0])).toBeTruthy();
    expect(store.is('user', users[1])).toBeTruthy();
    expect(store.get('user', users[0].id) === users[0]).toBeTruthy();
    expect(store.get('user', users[1].id) === users[1]).toBeTruthy();
    objectsEqual(users[0].profile, {
      email: userProps[0].profile.email,
      userId: users[0].id
    });
    objectsEqual(users[1].profile, {
      email: userProps[1].profile.email,
      userId: users[1].id
    });
    objectsEqual(store.getAll('profile'), [
      {
        email: userProps[1].profile.email,
        userId: users[1].id
      },
      {
        email: userProps[0].profile.email,
        userId: users[0].id
      }
    ]);
    objectsEqual(users[0].organization, {
      name: 'Company Inc'
    });
    objectsEqual(users[1].organization, {
      name: 'Company LLC'
    });
    expect(!users[0].organizationId).toBeTruthy();
    expect(!users[1].organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps[1].organization, userProps[0].organization]);
    clear();

    users = await store.createMany('user', JSData.utils.copy(userProps), {pass: ['profile']});
    expect(store.is('user', users[0])).toBeTruthy();
    expect(store.is('user', users[1])).toBeTruthy();
    expect(store.get('user', users[0].id) === users[0]).toBeTruthy();
    expect(store.get('user', users[1].id) === users[1]).toBeTruthy();
    expect(store.is('profile', users[0].profile)).toBeTruthy();
    expect(store.is('profile', users[1].profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([users[0].profile, users[1].profile]);
    expect(users[0].organization).toEqual({
      name: 'Company Inc'
    });
    expect(users[1].organization).toEqual({
      name: 'Company LLC'
    });
    expect(!users[0].organizationId).toBeTruthy();
    expect(!users[1].organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps[1].organization, userProps[0].organization]);
    clear();

    users = await store.createMany('user', JSData.utils.copy(userProps), {pass: ['profile', 'organization']});
    expect(store.is('user', users[0])).toBeTruthy();
    expect(store.is('user', users[1])).toBeTruthy();
    expect(store.get('user', users[0].id) === users[0]).toBeTruthy();
    expect(store.get('user', users[1].id) === users[1]).toBeTruthy();
    expect(store.is('profile', users[0].profile)).toBeTruthy();
    expect(store.is('profile', users[1].profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([users[0].profile, users[1].profile]);
    expect(store.is('organization', users[0].organization)).toBeTruthy();
    expect(store.is('organization', users[1].organization)).toBeTruthy();
    expect(store.getAll('organization')[0].id).toEqual(users[0].organizationId);
    expect(store.getAll('organization')[1].id).toEqual(users[1].organizationId);
    expect(store.getAll('organization')).toEqual([users[0].organization, users[1].organization]);
    clear();

    expect(createCalledCount.user).toEqual(6);
    expect(!createCalledCount.comment).toBeTruthy();
    expect(!createCalledCount.profile).toBeTruthy();
    expect(!createCalledCount.organization).toBeTruthy();
  });
  it('should combine opts.with and opts.pass', async function () {
    const createCalledCount: any = {};
    let id = 1;
    const utils = JSData.utils;

    const incCreate = name => {
      if (!createCalledCount.hasOwnProperty(name)) {
        createCalledCount[name] = 0;
      }
      createCalledCount[name]++;
    };
    const clear = () => {
      // tslint:disable-next-line:forin
      for (const key in store._mappers) {
        store.removeAll(key);
      }
    };
    store.registerAdapter(
      'mock',
      {
        createMany(mapper, _props, Opts) {
          incCreate(mapper.name);
          // tslint:disable-next-line:variable-name
          _props.forEach(__props => {
            __props[mapper.idAttribute] = id;
            id++;
          });
          mapper.relationFields.forEach(field => {
            // tslint:disable-next-line:variable-name
            _props.forEach(__props => {
              if (__props[field]) {
                if (utils.isArray(__props[field])) {
                  __props[field].forEach(item => {
                    item.id = id;
                    id++;
                  });
                } else if (utils.isObject(__props[field])) {
                  __props[field].id = id;
                  id++;
                }
              }
            });
          });
          return Promise.resolve(_props);
        }
      },
      {default: true}
    );

    const userProps = [
      {
        name: 'John',
        organization: {
          name: 'Company Inc'
        },
        profile: {
          email: 'john@email.com'
        }
      },
      {
        name: 'Sally',
        organization: {
          name: 'Company LLC'
        },
        profile: {
          email: 'sally@email.com'
        }
      }
    ];

    const getProps = () => {
      return JSData.utils.copy(userProps).map(props => {
        return store.createRecord('user', props);
      });
    };

    // when props are a Record
    let users = await store.createMany('user', getProps(), {pass: []});
    expect(store.is('user', users[0])).toBeTruthy();
    expect(store.is('user', users[1])).toBeTruthy();
    expect(store.get('user', users[0].id) === users[0]).toBeTruthy();
    expect(store.get('user', users[1].id) === users[1]).toBeTruthy();
    expect(users[0].profile).toEqual(userProps[0].profile);
    expect(users[1].profile).toEqual(userProps[1].profile);
    expect(store.getAll('profile')).toEqual([userProps[1].profile, userProps[0].profile]);
    expect(users[0].organization).toEqual(userProps[0].organization);
    expect(users[1].organization).toEqual(userProps[1].organization);
    expect(!users[0].organizationId).toBeTruthy();
    expect(!users[1].organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps[1].organization, userProps[0].organization]);
    clear();

    users = await store.createMany('user', getProps(), {with: ['profile'], pass: ['organization']});
    expect(store.is('user', users[0])).toBeTruthy();
    expect(store.is('user', users[1])).toBeTruthy();
    expect(store.get('user', users[0].id) === users[0]).toBeTruthy();
    expect(store.get('user', users[1].id) === users[1]).toBeTruthy();
    expect(store.is('profile', users[0].profile)).toBeTruthy();
    expect(store.is('profile', users[1].profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([users[0].profile, users[1].profile]);
    expect(store.is('organization', users[0].organization)).toBeTruthy();
    expect(store.is('organization', users[1].organization)).toBeTruthy();
    expect(store.getAll('organization')[0].id).toEqual(users[0].organizationId);
    expect(store.getAll('organization')[1].id).toEqual(users[1].organizationId);
    expect(store.getAll('organization')).toEqual([users[0].organization, users[1].organization]);
    clear();

    // when props are NOT a record
    users = await store.createMany('user', JSData.utils.copy(userProps), {pass: []});
    expect(store.is('user', users[0])).toBeTruthy();
    expect(store.is('user', users[1])).toBeTruthy();
    expect(store.get('user', users[0].id) === users[0]).toBeTruthy();
    expect(store.get('user', users[1].id) === users[1]).toBeTruthy();
    objectsEqual(users[0].profile, {
      email: userProps[0].profile.email,
      userId: users[0].id
    });
    objectsEqual(users[1].profile, {
      email: userProps[1].profile.email,
      userId: users[1].id
    });
    objectsEqual(store.getAll('profile'), [
      {
        email: userProps[1].profile.email,
        userId: users[1].id
      },
      {
        email: userProps[0].profile.email,
        userId: users[0].id
      }
    ]);
    objectsEqual(users[0].organization, {
      name: 'Company Inc'
    });
    objectsEqual(users[1].organization, {
      name: 'Company LLC'
    });
    expect(!users[0].organizationId).toBeTruthy();
    expect(!users[1].organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps[1].organization, userProps[0].organization]);
    clear();

    users = await store.createMany('user', JSData.utils.copy(userProps), {with: ['profile'], pass: ['organization']});
    expect(store.is('user', users[0])).toBeTruthy();
    expect(store.is('user', users[1])).toBeTruthy();
    expect(store.get('user', users[0].id) === users[0]).toBeTruthy();
    expect(store.get('user', users[1].id) === users[1]).toBeTruthy();
    expect(store.is('profile', users[0].profile)).toBeTruthy();
    expect(store.is('profile', users[1].profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([users[0].profile, users[1].profile]);
    expect(store.is('organization', users[0].organization)).toBeTruthy();
    expect(store.is('organization', users[1].organization)).toBeTruthy();
    expect(store.getAll('organization')[0].id).toEqual(users[0].organizationId);
    expect(store.getAll('organization')[1].id).toEqual(users[1].organizationId);
    expect(store.getAll('organization')).toEqual([users[0].organization, users[1].organization]);
    clear();

    expect(createCalledCount.user).toEqual(4);
    expect(!createCalledCount.comment).toBeTruthy();
    expect(createCalledCount.profile).toEqual(2);
    expect(!createCalledCount.organization).toBeTruthy();
  });
  it('should validate', async () => {
    const props = [{name: true}, {}, {name: 1234, age: 25}];
    let createCalled = false;
    let users;
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock',
      schema: {
        properties: {
          name: {type: 'string'},
          age: {type: 'number'}
        }
      }
    });
    User.registerAdapter('mock', {
      createMany() {
        createCalled = true;
      }
    });
    try {
      users = await User.createMany(props);
      throw new Error('validation error should have been thrown!');
    } catch (err) {
      expect(err.message).toEqual('validation failed');
      expect(err.errors).toEqual([
        [
          {
            actual: 'boolean',
            expected: 'one of (string)',
            path: 'name'
          }
        ],
        undefined,
        [
          {
            actual: 'number',
            expected: 'one of (string)',
            path: 'name'
          }
        ]
      ]);
    }
    expect(createCalled).toEqual(false);
    expect(users).toEqual(undefined);
    expect(props[0][User.idAttribute]).toEqual(undefined);
  });
  it('should validate required', async () => {
    const props = [{name: 'John'}, {}, {name: 'Sally', age: 25}];
    let createCalled = false;
    let users;
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock',
      schema: {
        properties: {
          name: {type: 'string', required: true},
          age: {type: 'number', required: true}
        }
      }
    });
    User.registerAdapter('mock', {
      createMany() {
        createCalled = true;
      }
    });
    try {
      users = await User.createMany(props);
      throw new Error('validation error should have been thrown!');
    } catch (err) {
      expect(err.message).toEqual('validation failed');
      expect(err.errors).toEqual([
        [
          {
            actual: 'undefined',
            expected: 'a value',
            path: 'age'
          }
        ],
        [
          {
            actual: 'undefined',
            expected: 'a value',
            path: 'name'
          },
          {
            actual: 'undefined',
            expected: 'a value',
            path: 'age'
          }
        ],
        undefined
      ]);
    }
    expect(createCalled).toEqual(false);
    expect(users).toEqual(undefined);
    expect(props[0][User.idAttribute]).toEqual(undefined);
  });
});
