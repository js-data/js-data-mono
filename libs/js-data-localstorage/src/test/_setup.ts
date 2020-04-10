import { Container, DataStore, Mapper, utils } from '@js-data/js-data';
import { Adapter } from '@js-data/js-data-adapter';
import LocalStorageAdapter from '@js-data/js-data-localstorage';

export function equalObjects(a, b, m?) {
  expect(JSON.parse(JSON.stringify(a))).toEqual(JSON.parse(JSON.stringify(b)));
}

export function objectsEqual(a, b, m?) {
  expect(JSON.parse(JSON.stringify(a))).toEqual(JSON.parse(JSON.stringify(b)));
}

const _debug = false;

const options: any = {};

export function debug(...args) {
  if (_debug) {
    args.forEach((arg, i) => {
      args[i] = JSON.stringify(arg, null, 2);
    });
    console.log('DEBUG (TEST):', ...args);
  }
}

options.hasMethod = method => {
  options.methods = options.methods || 'all';
  options.xmethods = options.xmethods || [];
  return (
    (options.methods === 'all' || options.methods.indexOf(method) !== -1) &&
    options.xmethods.indexOf(method) === -1
  );
};

options.xfeatures = ['findAllLikeOp', 'filterOnRelations', 'findAllOpNotFound'];

options.hasFeature = feature => {
  options.features = options.features || 'all';
  options.xfeatures = options.xfeatures || [];
  return (
    (options.features === 'all' || options.features.indexOf(feature) !== -1) &&
    options.xfeatures.indexOf(feature) === -1
  );
};

export { options };
export let $$adapter: LocalStorageAdapter | any,
  $$container: Container,
  $$store: DataStore,
  $$User: Mapper,
  $$Organization: Mapper,
  $$Profile: Mapper,
  $$Post: Mapper,
  $$Address: Mapper,
  $$Comment: Mapper,
  $$Tag: Mapper,
  toClear: string[];

beforeEach(() => {
  $$adapter = new LocalStorageAdapter();
  $$container = new Container(
    options.containerConfig || {
      mapperDefaults: {
        debug: false
      }
    }
  );
  $$store = new DataStore(
    options.storeConfig || {
      mapperDefaults: {
        debug: false
      }
    }
  );
  $$container.registerAdapter('adapter', $$adapter, {default: true});
  $$store.registerAdapter('adapter', $$adapter, {default: true});
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
  const organizationOptions = {
    name: 'organization',
    relations: {
      hasMany: {
        user: {
          localField: 'users',
          foreignKey: 'organizationId'
        }
      }
    }
  };
  const postOptions = {
    name: 'post',
    relations: {
      belongsTo: {
        user: {
          localField: 'user',
          foreignKey: 'userId'
        }
      },
      hasMany: {
        comment: {
          localField: 'comments',
          foreignKey: 'postId'
        },
        tag: {
          localField: 'tags',
          localKeys: 'tagIds'
        }
      }
    }
  };
  const commentOptions = {
    name: 'comment',
    relations: {
      belongsTo: {
        post: {
          localField: 'post',
          foreignKey: 'postId'
        },
        user: {
          localField: 'user',
          foreignKey: 'userId'
        }
      }
    }
  };
  const tagOptions = {
    name: 'tag',
    relations: {
      hasMany: {
        post: {
          localField: 'posts',
          foreignKeys: 'tagIds'
        }
      }
    }
  };
  $$User = $$container.defineMapper('user', utils.copy(userOptions));
  $$store.defineMapper('user', utils.copy(userOptions));
  $$Organization = $$container.defineMapper(
    'organization',
    utils.copy(organizationOptions)
  );
  $$store.defineMapper('organization', utils.copy(organizationOptions));
  $$Profile = $$container.defineMapper('profile');
  $$store.defineMapper('profile');
  $$Address = $$container.defineMapper('address');
  $$store.defineMapper('address');
  $$Post = $$container.defineMapper('post', utils.copy(postOptions));
  $$store.defineMapper('post', utils.copy(postOptions));
  $$Comment = $$container.defineMapper('comment', utils.copy(commentOptions));
  $$store.defineMapper('comment', utils.copy(commentOptions));
  $$Tag = $$container.defineMapper('tag', utils.copy(tagOptions));
  $$store.defineMapper('tag', utils.copy(tagOptions));
  toClear = ['User'];
});

afterEach(async () => {
  const _toClear = [];
  if (toClear.includes('Tag')) {
    _toClear.push($$Tag);
  }
  if (toClear.includes('Comment')) {
    _toClear.push($$Comment);
  }
  if (toClear.includes('Post')) {
    _toClear.push($$Post);
  }
  if (toClear.includes('Profile')) {
    _toClear.push($$Profile);
  }
  if (toClear.includes('User')) {
    _toClear.push($$User);
  }
  if (toClear.includes('Address')) {
    _toClear.push($$Address);
  }
  await Promise.all(_toClear.map(mapper => $$adapter.destroyAll(mapper)));
});
