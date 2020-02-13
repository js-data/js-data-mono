import { JSData } from '../_setup';

describe('Mapper#update', () => {
  it('should update', async () => {
    const id = 1;
    const props = {name: 'John'};
    const propsUpdate = {name: 'Bill', foo: undefined};
    let updateCalled = false;
    let createCalled = false;
    const schema = new JSData.Schema({
      type: 'object',
      track: true,
      properties: {
        name: {type: 'string'},
        foo: {type: 'string'}
      }
    });
    const store = new JSData.DataStore();
    store.registerAdapter(
      'mock',
      {
        update(mapper, _id, _props, Opts) {
          updateCalled = true;
          return new Promise((resolve, reject) => {
            expect(mapper).toBe(User);
            expect(_id).toEqual(id);
            expect(_props).toEqual(propsUpdate);
            expect(Opts.raw).toEqual(false);
            _props.foo = 'bar';
            _props.id = id;
            resolve(_props);
          });
        },
        create(mapper, _props, Opts) {
          createCalled = true;
          return new Promise((resolve, reject) => {
            expect(mapper).toBe(User);
            expect(_props).toEqual(props);
            expect(!Opts.raw).toBeTruthy();
            _props[mapper.idAttribute] = id;
            resolve(_props);
          });
        }
      },
      {default: true}
    );
    const User = store.defineMapper('user', {schema});
    const rec = store.createRecord('user', {name: 'John'});
    const user = await rec.save();
    expect(createCalled).toBeTruthy();
    expect(user instanceof User.recordClass).toBeTruthy();
    user.name = 'Bill';
    const u2 = await user.save();
    expect(updateCalled).toBeTruthy();
    expect(user.foo).toEqual('bar');
    expect(u2 instanceof User.recordClass).toBeTruthy();
  });
});
