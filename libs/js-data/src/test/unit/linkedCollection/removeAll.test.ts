import { data, PostCollection, User, UserCollection } from '../../_setup';

describe('LinkedCollection#removeAll', () => {
  it('should eject items that meet the criteria from the store', function () {
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
  it('should eject all items from the store', function () {
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
});
