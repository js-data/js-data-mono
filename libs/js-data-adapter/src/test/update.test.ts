import * as sinon from 'sinon';
import { $$adapter, $$container, $$User, debug } from './index';

describe('Adapter#update', () => {
  it('should update a user', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);

    expect(user.name).toEqual(props.name);
    expect(user[User.idAttribute]).toBeDefined();

    debug('find', User.name, user[User.idAttribute]);
    let foundUser = await adapter.find(User, user[User.idAttribute]);
    debug('found', User.name, foundUser);

    expect(foundUser.name).toEqual(props.name);
    expect(foundUser[User.idAttribute]).toBeDefined();
    expect(foundUser[User.idAttribute]).toEqual(user[User.idAttribute]);

    debug('update', User.name, user[User.idAttribute], {name: 'Johnny'});
    const updatedUser = await adapter.update(User, user[User.idAttribute], {
      name: 'Johnny'
    });
    debug('updated', User.name, updatedUser);
    expect(updatedUser.name).toEqual('Johnny');
    expect(updatedUser[User.idAttribute]).toEqual(user[User.idAttribute]);

    debug('find', User.name, user[User.idAttribute]);
    foundUser = await adapter.find(User, user[User.idAttribute]);
    debug('found', User.name, foundUser);
    expect(foundUser.name).toEqual('Johnny');
    expect(foundUser[User.idAttribute]).toEqual(user[User.idAttribute]);
  });
  it('should update a user and return raw', async () => {
    const adapter = $$adapter;
    const User = $$User;
    const props = {name: 'John'};

    debug('create', User.name, props);
    const user = await adapter.create(User, props);
    debug('created', User.name, user);

    expect(user.name).toEqual(props.name);
    expect(user[User.idAttribute]).toBeDefined();

    debug('update', User.name, user[User.idAttribute], {name: 'Johnny'});
    const result = await adapter.update(
      User,
      user[User.idAttribute],
      {name: 'Johnny'},
      {raw: true}
    );
    debug('updated', User.name, result);
    expect(result.data).toBeDefined();
    expect(result.updated).toBeDefined();
    expect(result.data.name).toEqual('Johnny');
    expect(result.data[User.idAttribute]).toEqual(user[User.idAttribute]);
    expect(result.updated).toEqual(1);
  });
  it('should throw when updating non-existent row', async () => {
    const adapter = $$adapter;
    const User = $$User;

    debug('update', 'non-existent-id', {name: 'Johnny'});
    try {
      await adapter.update(User, 'non-existent-id', {name: 'Johnny'});
      throw new Error('update should have failed!');
    } catch (err) {
      debug('correctly threw error', err.message);
      expect(err.message).toBeDefined();
      expect(err.message).toEqual('Not Found');
    }
  });
  it('should keep relations specified by "with"', async () => {
    const adapter = $$adapter;
    const store = $$container;

    sinon.stub(adapter, '_update').callsFake((mapper, id, props, opts) => {
      expect(props.posts).toEqual([
        {
          id: 1234,
          userId: 1
        }
      ]);
      expect(props.profile).toEqual({
        id: 238,
        userId: 1
      });
      expect(props.address).toEqual(undefined);
      expect(props.organization).toEqual(undefined);
      return [props, {}];
    });

    debug('update', 1, {id: 1});
    const result = await store.update(
      'user',
      1,
      {
        id: 1,
        posts: [
          {
            id: 1234,
            userId: 1
          }
        ],
        address: {
          id: 412,
          userId: 1
        },
        profile: {
          id: 238,
          userId: 1
        },
        organizationId: 333,
        organization: {
          id: 333
        }
      },
      {with: ['posts', 'profile']}
    );
    debug('updated', 1, result);
    adapter._update.restore();
  });
});
