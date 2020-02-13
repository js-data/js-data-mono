import { JSData, User } from '../../_setup';

const utils = JSData.utils;

describe('utils.forEachRelation', () => {
  it('executes given fn for all relations defined in the specified mapper', function () {
    const userMapper = User;
    const expectedRelations = userMapper.relationList;
    const actualRelations = [];
    utils.forEachRelation(userMapper, {withAll: true}, (def, item) => {
      actualRelations.push(def);
    });
    expect(expectedRelations).toEqual(actualRelations);
  });

  it('executes given fn for specific distinct relations defined in the given mapper', function () {
    const userMapper = User;
    const expectedRelations = userMapper.relationList.filter(x => x.relation === 'comment');
    const actualRelations = [];

    utils.forEachRelation(userMapper, {with: ['comment', 'comment.user', 'notexist']}, (def, item) => {
      actualRelations.push(def);
    });

    expect(expectedRelations).toEqual(actualRelations);
  });
});
