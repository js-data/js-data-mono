import { data, JSData, PostCollection, store, UserCollection } from '../../_setup';

describe('Collection#remove', () => {
  it('should remove an item from the collection', function () {
    UserCollection.createIndex('age');
    const user = UserCollection.add({id: 1, age: 30});
    const user2 = UserCollection.add({id: 2, age: 31});
    const user3 = UserCollection.add({id: 3, age: 32});
    const users = [user, user2, user3];
    expect(UserCollection.get(1) === user).toBeTruthy();
    expect(UserCollection.get(2) === user2).toBeTruthy();
    expect(UserCollection.get(3) === user3).toBeTruthy();
    expect(UserCollection.between([30], [32], {
      rightInclusive: true,
      index: 'age'
    })).toEqual(users);
    UserCollection.remove(1);
    expect(!UserCollection.get(1)).toBeTruthy();
    users.shift();
    expect(UserCollection.between([30], [32], {
      rightInclusive: true,
      index: 'age'
    })).toEqual(users);
  });

  it('should remove plain records', () => {
    const data = [
      {
        id: 1,
        getId() {
          return this.id;
        }
      },
      {
        id: 2,
        getId() {
          return this.id;
        }
      }
    ];
    const collection = new JSData.Collection(data);
    const item = collection.get(1);
    const removed = collection.remove(1);
    expect(item === removed).toEqual(true);
  });

  it('should remove unsaved records', function () {
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

    let removedAlice = PostCollection.remove(alice);
    expect(removedAlice).toEqual(undefined);
    expect(PostCollection.filter({
      author: 'Alice'
    }).length).toEqual(1);
    expect(PostCollection.filter().length).toEqual(6);
    removedAlice = PostCollection.remove(
      PostCollection.filter({
        author: 'Alice'
      })[0]
    );
    expect(removedAlice).toEqual({author: 'Alice'});
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

    PostCollection.add({author: 'Bob'});
    expect(PostCollection.filter({
      id: undefined
    }).length).toEqual(2);
    expect(PostCollection.filter({
      author: 'Bob'
    }).length).toEqual(2);
    expect(PostCollection.filter().length).toEqual(6);

    const removedBob = PostCollection.remove(bob);
    expect(removedBob).toBe(bob);

    expect(PostCollection.filter({
      id: undefined
    }).length).toEqual(1);
    expect(PostCollection.filter({
      author: 'Bob'
    }).length).toEqual(1);
    expect(PostCollection.filter().length).toEqual(5);
  });
});
