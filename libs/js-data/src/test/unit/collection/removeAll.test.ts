import { data, PostCollection, store, User, UserCollection } from '../../_setup';

describe('Collection#removeAll', () => {
  it('should eject items that meet the criteria from the store', () => {
    User.debug = true;
    UserCollection.add([data.p1, data.p2, data.p3, data.p4, data.p5]);
    expect(UserCollection.get(5)).toBeTruthy();
    expect(UserCollection.get(6)).toBeTruthy();
    expect(UserCollection.get(7)).toBeTruthy();
    expect(UserCollection.get(8)).toBeTruthy();
    expect(UserCollection.get(9)).toBeTruthy();
    expect(() => {
      UserCollection.removeAll({where: {author: 'Adam'}});
    }).not.toThrow();
    expect(UserCollection.get(5)).toBeTruthy();
    expect(UserCollection.get(6)).toBeTruthy();
    expect(UserCollection.get(7)).toBeTruthy();
    expect(!UserCollection.get(8)).toBeTruthy();
    expect(!UserCollection.get(9)).toBeTruthy();
  });
  it('should eject all items from the store', () => {
    PostCollection.add([data.p1, data.p2, data.p3, data.p4]);

    expect(PostCollection.get(5)).toEqual(data.p1);
    expect(PostCollection.get(6)).toEqual(data.p2);
    expect(PostCollection.get(7)).toEqual(data.p3);
    expect(PostCollection.get(8)).toEqual(data.p4);

    expect(() => {
      PostCollection.removeAll();
    }).not.toThrow();

    expect(!PostCollection.get(5)).toBeTruthy();
    expect(!PostCollection.get(6)).toBeTruthy();
    expect(!PostCollection.get(7)).toBeTruthy();
    expect(!PostCollection.get(8)).toBeTruthy();
  });

  it('should remove unsaved records', () => {
    const alice = {author: 'Alice'};
    const bob = store.createRecord('post', {author: 'Bob'});
    expect(
      PostCollection.add([data.p1, data.p2, alice, data.p3, bob, data.p4])
    ).toEqual([
      data.p1,
      data.p2,
      alice,
      data.p3,
      bob,
      data.p4
    ]);

    expect(bob).toBe(PostCollection.filter({
      author: 'Bob'
    })[0]);
    expect(alice).not.toBe(PostCollection.filter({
      author: 'Alice'
    })[0]);

    expect(PostCollection.get(5)).toEqual(data.p1);
    expect(PostCollection.get(6)).toEqual(data.p2);
    expect(PostCollection.get(7)).toEqual(data.p3);
    expect(PostCollection.get(8)).toEqual(data.p4);
    expect(PostCollection.filter({
      id: undefined
    }).length).toEqual(2);
    expect(PostCollection.filter({
      author: 'Bob'
    }).length).toEqual(1);
    expect(PostCollection.filter().length).toEqual(6);

    let removedAlices = PostCollection.removeAll([alice]);
    expect(removedAlices.length).toEqual(0);
    expect(PostCollection.filter({
      author: 'Alice'
    }).length).toEqual(1);
    expect(PostCollection.filter().length).toEqual(6);
    removedAlices = PostCollection.removeAll(
      PostCollection.filter({
        author: 'Alice'
      })
    );
    expect(removedAlices).toEqual([{author: 'Alice'}]);
    expect(PostCollection.filter({
      author: 'Alice'
    }).length).toEqual(0);
    expect(PostCollection.filter().length).toEqual(5);
    expect(PostCollection.filter({
      id: undefined
    }).length).toEqual(1);
    expect(PostCollection.filter({
      author: 'Bob'
    }).length).toEqual(1);

    const bob2 = PostCollection.add({author: 'Bob'});
    expect(PostCollection.filter({
      id: undefined
    }).length).toEqual(2);
    expect(PostCollection.filter({
      author: 'Bob'
    }).length).toEqual(2);
    expect(PostCollection.filter().length).toEqual(6);

    const removedBobs = PostCollection.removeAll([bob2, bob]);
    expect(removedBobs[0]).toBe(bob2);
    expect(removedBobs[1]).toBe(bob);

    expect(PostCollection.filter({
      id: undefined
    }).length).toEqual(0);
    expect(PostCollection.filter({
      author: 'Bob'
    }).length).toEqual(0);
    expect(PostCollection.filter().length).toEqual(4);
  });

  it('should remove unsaved records with convenience method', () => {
    const alice = {author: 'Alice'};
    const bob = store.createRecord('post', {author: 'Bob'});
    expect(
      PostCollection.add([data.p1, data.p2, alice, data.p3, bob, data.p4])
    ).toEqual([
      data.p1,
      data.p2,
      alice,
      data.p3,
      bob,
      data.p4
    ]);
    const storeAlice = PostCollection.filter({
      author: 'Alice'
    })[0];

    const bob2 = PostCollection.add({author: 'Bob', num: 2});

    expect(PostCollection.getAll().length).toEqual(7);

    const records = PostCollection.unsaved();

    expect(records).toEqual([bob2, bob, storeAlice]);

    const removedRecords = PostCollection.prune();

    expect(removedRecords.length).toEqual(3);
    expect(PostCollection.getAll().length).toEqual(4);
    expect(removedRecords).toEqual([bob2, bob, alice]);
  });
});
