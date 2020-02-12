import { data, JSData, store } from '../../_setup';

const utils = JSData.utils;

describe('utils.toJson', () => {
  it('can serialize an object', function () {
    const user = store.add('user', data.user10);
    store.add('organization', data.organization15);
    store.add('comment', data.comment19);
    store.add('profile', data.profile21);
    // todo, add option to serialize entire graph
    const expected = JSON.stringify(user);
    const actual = utils.toJson(user);
    expect(expected).toEqual(actual);
  });
});

describe('utils.fromJson', () => {
  it('can deserialize an object', function () {
    const user = data.user10;
    const expected = user;
    const actual = utils.fromJson(utils.toJson(user));
    expect(expected).toEqual(actual);
  });
});
