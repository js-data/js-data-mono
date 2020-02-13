import { JSData } from '../../_setup';

describe('Collection#mapCall', () => {
  it('should map and call', () => {
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
    expect(collection.mapCall('getId')).toEqual([1, 2]);
  });
});
