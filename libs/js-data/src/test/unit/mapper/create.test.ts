import { JSData, objectsEqual, store } from '../../_setup';

describe('Mapper#create', () => {
  it('should be an instance method', () => {
    const Mapper = JSData.Mapper;
    const mapper = new Mapper({name: 'foo'});
    expect(typeof mapper.create).toEqual('function');
    expect(mapper.create).toBe(Mapper.prototype.create);
  });
  it('should create', async () => {
    const props = {name: 'John'};
    let createCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      create(mapper, _props, Opts) {
        createCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_props).toEqual(props);
          expect(!Opts.raw).toBeTruthy();
          _props[mapper.idAttribute] = new Date().getTime();
          resolve(_props);
        });
      }
    });
    const user = await User.create(props);
    expect(createCalled).toBeTruthy();
    expect(user[User.idAttribute]).toBeTruthy();
    expect(user instanceof User.recordClass).toBeTruthy();
  });
  it('should create with defaults', async () => {
    const props = {name: 'John'};
    let createCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock',
      schema: {
        properties: {
          name: {type: 'string'},
          role: {type: 'string', default: 'viewer'}
        }
      }
    });
    User.registerAdapter('mock', {
      create(mapper, _props, Opts) {
        createCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_props).toEqual(props);
          expect(!Opts.raw).toBeTruthy();
          _props[mapper.idAttribute] = new Date().getTime();
          resolve(_props);
        });
      }
    });
    const user = await User.create(props);
    expect(createCalled).toBeTruthy();
    expect(user[User.idAttribute]).toBeTruthy();
    expect(user instanceof User.recordClass).toBeTruthy();
    expect(user.role).toEqual('viewer');
  });
  it('should create without wrapping', async () => {
    const props = {name: 'John'};
    let createCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock',
      wrap: false
    });
    User.registerAdapter('mock', {
      create(mapper, _props, Opts) {
        createCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_props).toEqual(props);
          expect(!Opts.raw).toBeTruthy();
          _props[mapper.idAttribute] = new Date().getTime();
          resolve(_props);
        });
      }
    });
    const user = await User.create(props);
    expect(createCalled).toBeTruthy();
    expect(user[User.idAttribute]).toBeTruthy();
    expect(!(user instanceof User.recordClass)).toBeTruthy();
  });
  it('should return raw', async () => {
    const props = {name: 'John'};
    let createCalled = false;
    const User = new JSData.Mapper({
      name: 'user',
      raw: true,
      defaultAdapter: 'mock'
    });
    User.registerAdapter('mock', {
      create(mapper, _props, Opts) {
        createCalled = true;
        return new Promise((resolve, reject) => {
          expect(mapper).toBe(User);
          expect(_props).toEqual(props);
          expect(Opts.raw).toBeTruthy();
          _props[mapper.idAttribute] = new Date().getTime();
          resolve({
            data: _props,
            created: 1
          });
        });
      }
    });
    const data = await User.create(props);
    expect(createCalled).toBeTruthy();
    expect(data.data[User.idAttribute]).toBeTruthy();
    expect(data.data instanceof User.recordClass).toBeTruthy();
    expect(data.adapter).toEqual('mock');
    expect(data.created).toEqual(1);
  });
  it('should nested create everything in opts.with', async function () {
    const createCalledCount: any = {};

    const incCreate = name => {
      if (!createCalledCount.hasOwnProperty(name)) {
        createCalledCount[name] = 0;
      }
      createCalledCount[name]++;
    };
    const clear = () => {
      for (const key in store._mappers) {
        store.removeAll(key);
      }
    };
    store.registerAdapter(
      'mock',
      {
        create(mapper, _props, Opts) {
          incCreate(mapper.name);
          _props[mapper.idAttribute] = new Date().getTime();
          return Promise.resolve(_props);
        },
        createMany(mapper, _props, Opts) {
          incCreate(mapper.name);
          _props.forEach(__props => {
            __props[mapper.idAttribute] = new Date().getTime();
          });
          return Promise.resolve(_props);
        }
      },
      {default: true}
    );

    const userProps = {
      name: 'John',
      organization: {
        name: 'Company Inc'
      },
      comments: [
        {
          content: 'foo'
        }
      ],
      profile: {
        email: 'john@email.com'
      }
    };

    const group = await store.create(
      'group',
      store.createRecord('group', {
        users: [{name: 'John'}]
      }),
      {with: ['users']}
    );
    expect(group.users[0].id).toBeTruthy();
    expect(group.users[0].name).toEqual('John');

    let user;
    // when props are a Record
    user = await store.createRecord('user', JSData.utils.plainCopy(userProps)).save({with: []});
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    objectsEqual(user.comments, [
      {
        content: 'foo',
        userId: user.id
      }
    ]);
    objectsEqual(store.getAll('comment'), [
      {
        content: 'foo',
        userId: user.id
      }
    ]);
    expect(user.profile).toEqual(userProps.profile);
    expect(store.getAll('profile')).toEqual([userProps.profile]);
    expect(user.organization).toEqual(userProps.organization);
    expect(!user.organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps.organization]);
    clear();

    user = await store.createRecord('user', JSData.utils.plainCopy(userProps)).save({with: ['comments']});
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    expect(store.is('comment', user.comments[0])).toBeTruthy();
    expect(store.getAll('comment')).toEqual(user.comments);
    expect(user.profile).toEqual({
      email: 'john@email.com'
    });
    expect(store.getAll('profile')).toEqual([userProps.profile]);
    expect(user.organization).toEqual(userProps.organization);
    expect(!user.organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps.organization]);
    clear();

    user = await store.create('user', store.createRecord('user', JSData.utils.plainCopy(userProps)), {
      with: ['comments', 'profile']
    });
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    expect(store.is('comment', user.comments[0])).toBeTruthy();
    expect(store.getAll('comment')).toEqual(user.comments);
    expect(store.is('profile', user.profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([user.profile]);
    expect(user.organization).toEqual(userProps.organization);
    expect(!user.organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps.organization]);
    clear();

    user = await store.create('user', store.createRecord('user', JSData.utils.plainCopy(userProps)), {
      with: ['comments', 'profile', 'organization']
    });
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    expect(store.is('comment', user.comments[0])).toBeTruthy();
    expect(store.getAll('comment')).toEqual(user.comments);
    expect(store.is('profile', user.profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([user.profile]);
    expect(store.is('organization', user.organization)).toBeTruthy();
    expect(store.getAll('organization')[0].id).toEqual(user.organizationId);
    expect(store.getAll('organization')).toEqual([user.organization]);
    clear();

    // when props are NOT a record
    user = await store.create('user', JSData.utils.plainCopy(userProps), {with: []});
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    objectsEqual(user.comments, [
      {
        content: 'foo',
        userId: user.id
      }
    ]);
    objectsEqual(store.getAll('comment'), [
      {
        content: 'foo',
        userId: user.id
      }
    ]);
    objectsEqual(user.profile, {
      email: userProps.profile.email,
      userId: user.id
    });
    objectsEqual(store.getAll('profile'), [
      {
        email: userProps.profile.email,
        userId: user.id
      }
    ]);
    expect(store.is('organization', user.organization)).toBeTruthy();
    expect(store.getAll('organization')[0].id).toEqual(user.organizationId);
    expect(store.getAll('organization')).toEqual([user.organization]);
    clear();

    user = await store.create('user', JSData.utils.plainCopy(userProps), {with: ['comments']});
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    expect(store.is('comment', user.comments[0])).toBeTruthy();
    expect(store.getAll('comment')).toEqual(user.comments);
    objectsEqual(user.profile, {
      email: userProps.profile.email,
      userId: user.id
    });
    objectsEqual(store.getAll('profile'), [
      {
        email: userProps.profile.email,
        userId: user.id
      }
    ]);
    expect(store.is('organization', user.organization)).toBeTruthy();
    expect(store.getAll('organization')[0].id).toEqual(user.organizationId);
    expect(store.getAll('organization')).toEqual([user.organization]);
    clear();

    user = await store.create('user', JSData.utils.plainCopy(userProps), {with: ['comments', 'profile']});
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    expect(store.is('comment', user.comments[0])).toBeTruthy();
    expect(store.getAll('comment')).toEqual(user.comments);
    expect(store.is('profile', user.profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([user.profile]);
    expect(store.is('organization', user.organization)).toBeTruthy();
    expect(store.getAll('organization')[0].id).toEqual(user.organizationId);
    expect(store.getAll('organization')).toEqual([user.organization]);
    clear();

    user = await store.create('user', JSData.utils.plainCopy(userProps), {
      with: ['comments', 'profile', 'organization']
    });
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    expect(store.is('comment', user.comments[0])).toBeTruthy();
    expect(store.getAll('comment')).toEqual(user.comments);
    expect(store.is('profile', user.profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([user.profile]);
    expect(store.is('organization', user.organization)).toBeTruthy();
    expect(store.getAll('organization')[0].id).toEqual(user.organizationId);
    expect(store.getAll('organization')).toEqual([user.organization]);
    clear();

    expect(createCalledCount.user).toEqual(9);
    expect(createCalledCount.comment).toEqual(6);
    expect(createCalledCount.profile).toEqual(4);
    expect(createCalledCount.organization).toEqual(2);
  });
  it('should pass everything opts.pass', async function () {
    const createCalledCount: any = {};
    const utils = JSData.utils;

    const incCreate = name => {
      if (!createCalledCount.hasOwnProperty(name)) {
        createCalledCount[name] = 0;
      }
      createCalledCount[name]++;
    };
    const clear = () => {
      for (const key in store._mappers) {
        store.removeAll(key);
      }
    };
    store.registerAdapter(
      'mock',
      {
        create(mapper, _props, Opts) {
          incCreate(mapper.name);
          _props[mapper.idAttribute] = new Date().getTime();
          mapper.relationFields.forEach(field => {
            if (_props[field]) {
              if (utils.isArray(_props[field])) {
                _props[field].forEach(item => {
                  item.id = new Date().getTime();
                });
              } else if (utils.isObject(_props[field])) {
                _props[field].id = new Date().getTime();
              }
            }
          });
          return Promise.resolve(_props);
        },
        createMany(mapper, _props, Opts) {
          incCreate(mapper.name);
          _props.forEach(__props => {
            __props[mapper.idAttribute] = new Date().getTime();
          });
          return Promise.resolve(_props);
        }
      },
      {default: true}
    );

    const userProps = {
      name: 'John',
      organization: {
        name: 'Company Inc'
      },
      comments: [
        {
          content: 'foo'
        }
      ],
      profile: {
        email: 'john@email.com'
      }
    };

    clear();

    let user;

    // when props are a Record
    user = await store.create('user', store.createRecord('user', JSData.utils.plainCopy(userProps)), {pass: []});
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    objectsEqual(user.comments, [
      {
        content: 'foo',
        userId: user.id
      }
    ]);
    objectsEqual(store.getAll('comment'), [
      {
        content: 'foo',
        userId: user.id
      }
    ]);
    expect(user.profile).toEqual(userProps.profile);
    expect(store.getAll('profile')).toEqual([userProps.profile]);
    expect(user.organization).toEqual(userProps.organization);
    expect(!user.organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps.organization]);
    clear();

    user = await store.create('user', store.createRecord('user', JSData.utils.plainCopy(userProps)), {
      pass: ['comments']
    });
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    expect(store.is('comment', user.comments[0])).toBeTruthy();
    expect(store.getAll('comment')).toEqual(user.comments);
    expect(user.profile).toEqual(userProps.profile);
    expect(store.getAll('profile')).toEqual([userProps.profile]);
    expect(user.organization).toEqual(userProps.organization);
    expect(!user.organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps.organization]);
    clear();

    user = await store.create('user', store.createRecord('user', JSData.utils.plainCopy(userProps)), {
      pass: ['comments', 'profile']
    });
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    expect(store.is('comment', user.comments[0])).toBeTruthy();
    expect(store.getAll('comment')).toEqual(user.comments);
    expect(store.is('profile', user.profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([user.profile]);
    expect(user.organization).toEqual(userProps.organization);
    expect(!user.organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps.organization]);
    clear();

    user = await store.create('user', store.createRecord('user', JSData.utils.plainCopy(userProps)), {
      pass: ['comments', 'profile', 'organization']
    });
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    expect(store.is('comment', user.comments[0])).toBeTruthy();
    expect(store.getAll('comment')).toEqual(user.comments);
    expect(store.is('profile', user.profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([user.profile]);
    expect(store.is('organization', user.organization)).toBeTruthy();
    expect(store.getAll('organization')[0].id).toEqual(user.organizationId);
    expect(store.getAll('organization')).toEqual([user.organization]);
    clear();

    // when props are NOT a record
    user = await store.create('user', JSData.utils.plainCopy(userProps), {pass: []});
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    objectsEqual(user.comments, [
      {
        content: 'foo',
        userId: user.id
      }
    ]);
    objectsEqual(store.getAll('comment'), [
      {
        content: 'foo',
        userId: user.id
      }
    ]);
    objectsEqual(user.profile, {
      email: userProps.profile.email,
      userId: user.id
    });
    objectsEqual(store.getAll('profile'), [
      {
        email: userProps.profile.email,
        userId: user.id
      }
    ]);
    expect(user.organization).toEqual(userProps.organization);
    expect(!user.organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps.organization]);
    clear();

    user = await store.create('user', JSData.utils.plainCopy(userProps), {pass: ['comments']});
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    expect(store.is('comment', user.comments[0])).toBeTruthy();
    expect(store.getAll('comment')).toEqual(user.comments);
    objectsEqual(user.profile, {
      email: userProps.profile.email,
      userId: user.id
    });
    objectsEqual(store.getAll('profile'), [
      {
        email: userProps.profile.email,
        userId: user.id
      }
    ]);
    expect(user.organization).toEqual(userProps.organization);
    expect(!user.organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps.organization]);
    clear();

    user = await store.create('user', JSData.utils.plainCopy(userProps), {pass: ['comments', 'profile']});
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    expect(store.is('comment', user.comments[0])).toBeTruthy();
    expect(store.getAll('comment')).toEqual(user.comments);
    expect(store.is('profile', user.profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([user.profile]);
    expect(user.organization).toEqual(userProps.organization);
    expect(!user.organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps.organization]);
    clear();

    user = await store.create('user', JSData.utils.plainCopy(userProps), {
      pass: ['comments', 'profile', 'organization']
    });
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    expect(store.is('comment', user.comments[0])).toBeTruthy();
    expect(store.getAll('comment')).toEqual(user.comments);
    expect(store.is('profile', user.profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([user.profile]);
    expect(store.is('organization', user.organization)).toBeTruthy();
    expect(store.getAll('organization')[0].id).toEqual(user.organizationId);
    expect(store.getAll('organization')).toEqual([user.organization]);
    clear();

    expect(createCalledCount.user).toEqual(8);
    expect(!createCalledCount.comment).toBeTruthy();
    expect(!createCalledCount.profile).toBeTruthy();
    expect(!createCalledCount.organization).toBeTruthy();
  });
  it('should combine opts.with and opts.pass', async function () {
    const createCalledCount: any = {};
    const utils = JSData.utils;

    const incCreate = name => {
      if (!createCalledCount.hasOwnProperty(name)) {
        createCalledCount[name] = 0;
      }
      createCalledCount[name]++;
    };
    const clear = () => {
      for (const key in store._mappers) {
        store.removeAll(key);
      }
    };
    store.registerAdapter(
      'mock',
      {
        create(mapper, _props, Opts) {
          incCreate(mapper.name);
          _props[mapper.idAttribute] = new Date().getTime();
          mapper.relationFields.forEach(field => {
            if (_props[field]) {
              if (utils.isArray(_props[field])) {
                _props[field].forEach(item => {
                  item.id = new Date().getTime();
                });
              } else if (utils.isObject(_props[field])) {
                _props[field].id = new Date().getTime();
              }
            }
          });
          return Promise.resolve(_props);
        },
        createMany(mapper, _props, Opts) {
          incCreate(mapper.name);
          _props.forEach(__props => {
            __props[mapper.idAttribute] = new Date().getTime();
          });
          return Promise.resolve(_props);
        }
      },
      {default: true}
    );

    const userProps = {
      name: 'John',
      organization: {
        name: 'Company Inc'
      },
      comments: [
        {
          content: 'foo'
        }
      ],
      profile: {
        email: 'john@email.com'
      }
    };

    // when props are a Record
    let user = await store.create('user', store.createRecord('user', JSData.utils.plainCopy(userProps)), {pass: []});
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    objectsEqual(user.comments, [
      {
        content: 'foo',
        userId: user.id
      }
    ]);
    objectsEqual(store.getAll('comment'), [
      {
        content: 'foo',
        userId: user.id
      }
    ]);
    expect(user.profile).toEqual(userProps.profile);
    expect(store.getAll('profile')).toEqual([userProps.profile]);
    expect(user.organization).toEqual(userProps.organization);
    expect(!user.organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps.organization]);
    clear();

    user = await store.create('user', store.createRecord('user', JSData.utils.plainCopy(userProps)), {
      pass: ['comments']
    });
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    expect(store.is('comment', user.comments[0])).toBeTruthy();
    expect(store.getAll('comment')).toEqual(user.comments);
    expect(user.profile).toEqual(userProps.profile);
    expect(store.getAll('profile')).toEqual([userProps.profile]);
    expect(user.organization).toEqual(userProps.organization);
    expect(!user.organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps.organization]);
    clear();

    user = await store.create('user', store.createRecord('user', JSData.utils.plainCopy(userProps)), {
      with: ['comments'],
      pass: ['profile']
    });
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    expect(store.is('comment', user.comments[0])).toBeTruthy();
    expect(store.getAll('comment')).toEqual(user.comments);
    expect(store.is('profile', user.profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([user.profile]);
    expect(user.organization).toEqual(userProps.organization);
    expect(!user.organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps.organization]);
    clear();

    user = await store.create('user', store.createRecord('user', JSData.utils.plainCopy(userProps)), {
      with: ['comments', 'profile'],
      pass: ['organization']
    });
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    expect(store.is('comment', user.comments[0])).toBeTruthy();
    expect(store.getAll('comment')).toEqual(user.comments);
    expect(store.is('profile', user.profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([user.profile]);
    expect(store.is('organization', user.organization)).toBeTruthy();
    expect(store.getAll('organization')[0].id).toEqual(user.organizationId);
    expect(store.getAll('organization')).toEqual([user.organization]);
    clear();

    // when props are NOT a record
    user = await store.create('user', JSData.utils.plainCopy(userProps), {pass: []});
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    objectsEqual(user.comments, [
      {
        content: 'foo',
        userId: user.id
      }
    ]);
    objectsEqual(store.getAll('comment'), [
      {
        content: 'foo',
        userId: user.id
      }
    ]);
    objectsEqual(user.profile, {
      email: userProps.profile.email,
      userId: user.id
    });
    objectsEqual(store.getAll('profile'), [
      {
        email: userProps.profile.email,
        userId: user.id
      }
    ]);
    expect(user.organization).toEqual(userProps.organization);
    expect(!user.organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps.organization]);
    clear();

    user = await store.create('user', JSData.utils.plainCopy(userProps), {pass: ['comments']});
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    expect(store.is('comment', user.comments[0])).toBeTruthy();
    expect(store.getAll('comment')).toEqual(user.comments);
    objectsEqual(user.profile, {
      email: userProps.profile.email,
      userId: user.id
    });
    objectsEqual(store.getAll('profile'), [
      {
        email: userProps.profile.email,
        userId: user.id
      }
    ]);
    expect(user.organization).toEqual(userProps.organization);
    expect(!user.organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps.organization]);
    clear();

    user = await store.create('user', JSData.utils.plainCopy(userProps), {with: ['comments'], pass: ['profile']});
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    expect(store.is('comment', user.comments[0])).toBeTruthy();
    expect(store.getAll('comment')).toEqual(user.comments);
    expect(store.is('profile', user.profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([user.profile]);
    expect(user.organization).toEqual(userProps.organization);
    expect(!user.organizationId).toBeTruthy();
    expect(store.getAll('organization')).toEqual([userProps.organization]);
    clear();

    user = await store.create('user', JSData.utils.plainCopy(userProps), {
      with: ['comments', 'profile'],
      pass: ['organization']
    });
    expect(store.is('user', user)).toBeTruthy();
    expect(store.get('user', user.id)).toBe(user);
    expect(store.is('comment', user.comments[0])).toBeTruthy();
    expect(store.getAll('comment')).toEqual(user.comments);
    expect(store.is('profile', user.profile)).toBeTruthy();
    expect(store.getAll('profile')).toEqual([user.profile]);
    expect(store.is('organization', user.organization)).toBeTruthy();
    expect(store.getAll('organization')[0].id).toEqual(user.organizationId);
    expect(store.getAll('organization')).toEqual([user.organization]);
    clear();

    expect(createCalledCount.user).toEqual(8);
    expect(createCalledCount.comment).toEqual(4);
    expect(createCalledCount.profile).toEqual(2);
    expect(!createCalledCount.organization).toBeTruthy();
  });
  it('should validate', async () => {
    const props = {name: 1234, age: false};
    let createCalled = false;
    let user;
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
      create() {
        createCalled = true;
      }
    });
    try {
      user = await User.create(props);
      throw new Error('validation error should have been thrown!');
    } catch (err) {
      expect(err.message).toEqual('validation failed');
      expect(err.errors).toEqual([
        {
          actual: 'number',
          expected: 'one of (string)',
          path: 'name'
        },
        {
          actual: 'boolean',
          expected: 'one of (number)',
          path: 'age'
        }
      ]);
    }
    expect(createCalled).toEqual(false);
    expect(user).toEqual(undefined);
    expect(props[User.idAttribute]).toEqual(undefined);
  });
  it('should validate required', async () => {
    const props = {};
    let createCalled = false;
    let user;
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
      create() {
        createCalled = true;
      }
    });
    try {
      user = await User.create(props);
      throw new Error('validation error should have been thrown!');
    } catch (err) {
      expect(err.message).toEqual('validation failed');
      expect(err.errors).toEqual([
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
      ]);
    }
    expect(createCalled).toEqual(false);
    expect(user).toEqual(undefined);
    expect(props[User.idAttribute]).toEqual(undefined);
  });
  it('should disallow extra props', async () => {
    const props = {
      name: 'John',
      age: 30,
      foo: 'bar',
      beep: 'boop',
      address: {
        baz: 'biz',
        state: 'TX'
      }
    };
    let createCalled = false;
    let user;
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock',
      schema: {
        type: 'object',
        properties: {
          name: {type: 'string', required: true},
          age: {type: 'number', required: true},
          address: {
            type: 'object',
            required: ['state'],
            properties: {
              state: {
                type: 'string',
                required: true
              }
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      }
    });
    User.registerAdapter('mock', {
      create() {
        createCalled = true;
      }
    });
    try {
      user = await User.create(props);
      throw new Error('validation error should have been thrown!');
    } catch (err) {
      expect(err.message).toEqual('validation failed');
      expect(err.errors).toEqual([
        {
          actual: 'extra fields: baz',
          expected: 'no extra fields',
          path: 'address'
        },
        {
          actual: 'extra fields: foo, beep',
          expected: 'no extra fields',
          path: ''
        }
      ]);
    }
    expect(createCalled).toEqual(false);
    expect(user).toEqual(undefined);
    expect(props[User.idAttribute]).toEqual(undefined);
  });
});
