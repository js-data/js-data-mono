import { MongoDBAdapter } from '@js-data/js-data-mongodb';
import { Container, Mapper } from '@js-data/js-data';

export function objectsEqual(a, b, msg?) {
  expect(JSON.parse(JSON.stringify(a)))
    .toEqual(JSON.parse(JSON.stringify(b)));
}

export let $$adapter: MongoDBAdapter;

export let $$User: Mapper;

beforeEach(() => {
  $$adapter = new MongoDBAdapter();
  const $$container = new Container({
    mapperDefaults: {
      debug: false
    }
  });
  $$container.registerAdapter('adapter', $$adapter, {default: true});
  const userOptions = {
    name: 'user',
    relations: {
      hasMany: {
        post: {
          localField: 'posts',
          foreignKey: 'userId'
        }
      },
      hasOne: {
        profile: {
          localField: 'profile',
          foreignKey: 'userId'
        },
        address: {
          localField: 'address',
          foreignKey: 'userId'
        }
      },
      belongsTo: {
        organization: {
          localField: 'organization',
          foreignKey: 'organizationId'
        }
      }
    }
  };
  $$User = $$container.defineMapper('user', userOptions);
});
