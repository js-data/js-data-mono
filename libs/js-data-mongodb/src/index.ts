import { Db, MongoClient } from 'mongodb';
import { ObjectID } from 'bson';
import { Mapper, utils } from '@js-data/js-data';
import { Adapter, reserved } from '@js-data/js-data-adapter';
import {snakeCase} from 'lodash';

export interface MongoDBAdapterOpts {
  /**
   * Convert ObjectIDs to strings when pulling records out of the database.
   * @default true
   */
  translateId?: boolean;
  /**
   * Convert fields of record from database that are ObjectIDs to strings
   * @default false
   */
  translateObjectIDs?: boolean;

  /**
   * MongoDB URI.
   * @default mongodb://localhost:27017
   */
  uri?: string;

  /**
   * MongoDB Driver options
   * @default { ignoreUndefined: true }
   */
  mongoDriverOpts?: {
    ignoreUndefined?: boolean;
    useNewUrlParser?: boolean; // https://thanhphu.net/2018/05/23/about-mongos-usenewurlparser-warning/
  }
}

const DEFAULTS: MongoDBAdapterOpts = {
  translateId: true,
  translateObjectIDs: false,
  uri: 'mongodb://localhost:27017',
  mongoDriverOpts: {
    ignoreUndefined: true,
    useNewUrlParser: true // https://thanhphu.net/2018/05/23/about-mongos-usenewurlparser-warning/
  }
};

const COUNT_OPTS_DEFAULTS = {};
const FIND_ONE_OPTS_DEFAULTS = {};
const INSERT_OPTS_DEFAULTS = {};
const INSERT_MANY_OPTS_DEFAULTS = {};
const UPDATE_OPTS_DEFAULTS = {};
const REMOVE_OPTS_DEFAULTS = {};

/**
 * MongoDBAdapter class.
 *
 * @example
 * // Use Container instead of DataStore on the server
 * import { Container } from 'js-data';
 * import MongoDBAdapter from 'js-data-mongodb';
 *
 * // Create a store to hold your Mappers
 * const store = new Container({
 *   mapperDefaults: {
 *     // MongoDB uses "_id" as the primary key
 *     idAttribute: '_id'
 *   }
 * });
 *
 * // Create an instance of MongoDBAdapter with default settings
 * const adapter = new MongoDBAdapter();
 *
 * // Mappers in "store" will use the MongoDB adapter by default
 * store.registerAdapter('mongodb', adapter, { default: true });
 *
 * // Create a Mapper that maps to a "user" collection
 * store.defineMapper('user');
 *
 * @class MongoDBAdapter
 * @extends Adapter
 * @param {object} [opts] Configuration options.
 * @param {boolean} [opts.debug=false] See {@link Adapter#debug}.
 * @param {object} [opts.countOpts] See {@link MongoDBAdapter#countOpts}.
 * @param {object} [opts.findOpts] See {@link MongoDBAdapter#findOpts}.
 * @param {object} [opts.findOneOpts] See {@link MongoDBAdapter#findOneOpts}.
 * @param {object} [opts.insertOpts] See {@link MongoDBAdapter#insertOpts}.
 * @param {object} [opts.insertManyOpts] See {@link MongoDBAdapter#insertManyOpts}.
 * @param {boolean} [opts.raw=false] See {@link Adapter#raw}.
 * @param {object} [opts.removeOpts] See {@link MongoDBAdapter#removeOpts}.
 * @param {boolean} [opts.translateId=true] See {@link MongoDBAdapter#translateId}.
 * @param {boolean} [opts.translateObjectIDs=false] See {@link MongoDBAdapter#translateObjectIDs}.
 * @param {object} [opts.updateOpts] See {@link MongoDBAdapter#updateOpts}.
 * @param {string} [opts.uri="mongodb://localhost:27017"] See {@link MongoDBAdapter#uri}.
 */
export class MongoDBAdapter extends Adapter {
  /**
   * Default options to pass to collection#count.
   *
   * @name MongoDBAdapter#countOpts
   * @type {object}
   * @default {}
   */
  private countOpts;
  /**
   * Default options to pass to collection#findOne.
   *
   * @name MongoDBAdapter#findOneOpts
   * @type {object}
   * @default {}
   */
  private findOneOpts;
  /**
   * Default options to pass to collection#insert.
   *
   * @name MongoDBAdapter#insertOpts
   * @type {object}
   * @default {}
   */
  private insertOpts;
  /**
   * Default options to pass to collection#insertMany.
   *
   * @name MongoDBAdapter#insertManyOpts
   * @type {object}
   * @default {}
   */
  private insertManyOpts;
  /**
   * Default options to pass to collection#update.
   *
   * @name MongoDBAdapter#updateOpts
   * @type {object}
   * @default {}
   */
  private updateOpts;
  /**
   * Default options to pass to collection#destroy.
   *
   * @name MongoDBAdapter#removeOpts
   * @type {object}
   * @default {}
   */
  private removeOpts;
  /**
   * A Promise that resolves to a reference to the MongoDB client being used by
   * this adapter.
   *
   * @name MongoDBAdapter#client
   * @type {Promise}
   */
  private client;
  private _db: Db;

  /**
   * Create a subclass of this MongoDBAdapter:
   * @example <caption>MongoDBAdapter.extend</caption>
   * import { MongoDBAdapter } from 'js-data-mongodb';
   * console.log('Using JSDataMongoDB v' + JSDataMongoDB.version.full);
   *
   * // Extend the class using ES2015 class syntax.
   * class CustomMongoDBAdapterClass extends MongoDBAdapter {
   *   foo () { return 'bar'; }
   *   static beep () { return 'boop'; }
   * }
   * const customMongoDBAdapter = new CustomMongoDBAdapterClass();
   * console.log(customMongoDBAdapter.foo());
   * console.log(CustomMongoDBAdapterClass.beep());
   *
   * @method MongoDBAdapter.extend
   * @param {object} [opts={}] Properties to add to the prototype of the
   * subclass.
   * @since 3.0.0
   */
  constructor(opts: MongoDBAdapterOpts | string | any = {}) {
    if (utils.isString(opts)) {
      opts = {uri: opts as string};
    }
    utils.fillIn(opts, DEFAULTS);

    super(opts);

    // Setup non-enumerable properties
    Object.defineProperties(this, {
      client: {
        writable: true,
        value: undefined
      },

      _db: {
        writable: true,
        value: undefined
      }
    });

    this.countOpts = this.countOpts || {};
    utils.fillIn(this.countOpts, COUNT_OPTS_DEFAULTS);

    this.findOneOpts = this.findOneOpts || {};
    utils.fillIn(this.findOneOpts, FIND_ONE_OPTS_DEFAULTS);

    this.insertOpts = this.insertOpts || {};
    utils.fillIn(this.insertOpts, INSERT_OPTS_DEFAULTS);

    this.insertManyOpts = this.insertManyOpts || {};
    utils.fillIn(this.insertManyOpts, INSERT_MANY_OPTS_DEFAULTS);

    this.updateOpts = this.updateOpts || {};
    utils.fillIn(this.updateOpts, UPDATE_OPTS_DEFAULTS);

    this.removeOpts = this.removeOpts || {};
    utils.fillIn(this.removeOpts, REMOVE_OPTS_DEFAULTS);

    this.client = new Promise((resolve, reject) => {
      MongoClient.connect(opts.uri, opts.mongoDriverOpts, (err, client) => {
        if (err) {
          return reject(err);
        }
        this._db = client.db();
        resolve(this._db);
      });
    });
  }

  _translateObjectIDs(r, opts: any = {}) {
    if (this.getOpt('translateObjectIDs', opts)) {
      this._translateFieldObjectIDs(r);
    } else if (this.getOpt('translateId', opts)) {
      this._translateId(r);
    }
    return r;
  }

  /**
   * Translate ObjectIDs to strings.
   *
   * @method MongoDBAdapter#_translateId
   * @return {*}
   */
  _translateId(r) {
    if (utils.isArray(r)) {
      r.forEach((_r) => {
        const __id = _r._id ? _r._id.toString() : _r._id;
        _r._id = typeof __id === 'string' ? __id : _r._id;
      });
    } else if (utils.isObject(r)) {
      const __id = r._id ? r._id.toString() : r._id;
      r._id = typeof __id === 'string' ? __id : r._id;
    }
    return r;
  }

  _translateFieldObjectIDs(r) {
    const _checkFields = (r) => {
      for (const field in r) {
        if (r[field]._bsontype === 'ObjectID') {
          r[field] = typeof r[field].toString() === 'string' ? r[field].toString() : r[field];
        }
      }
    };
    if (utils.isArray(r)) {
      r.forEach((_r) => {
        _checkFields(_r);
      });
    } else if (utils.isObject(r)) {
      _checkFields(r);
    }
    return r;
  }

  /**
   * Retrieve the records that match the selection query. Internal method used
   * by Adapter#count.
   *
   * @method MongoDBAdapter#_count
   * @private
   * @param {object} mapper The mapper.
   * @param {object} query Selection query.
   * @param {object} [opts] Configuration options.
   * @return {Promise}
   */
  _count(mapper, query, opts: any = {}) {
    return this._run((client, success, failure) => {
      const collectionId = this._getCollectionId(mapper, opts);
      const countOpts = this.getOpt('countOpts', opts);
      utils.fillIn(countOpts, this.getQueryOptions(mapper, query));

      const mongoQuery = this.getQuery(mapper, query);

      client
        .collection(collectionId)
        .countDocuments(mongoQuery, countOpts, (err, count) => err ? failure(err) : success([count, {}]));
    });
  }

  /**
   * Create a new record. Internal method used by Adapter#create.
   *
   * @method MongoDBAdapter#_create
   * @private
   * @param {object} mapper The mapper.
   * @param {object} props The record to be created.
   * @param {object} [opts] Configuration options.
   * @return {Promise}
   */
  _create(mapper, props: any = {}, opts: any = {}) {
    return this._run((client, success, failure) => {
      const collectionId = this._getCollectionId(mapper, opts);
      const insertOpts = this.getOpt('insertOpts', opts);

      const collection = client.collection(collectionId);
      const handler = (err, cursor) => err ? failure(err) : success(cursor);

      props = utils.plainCopy(props);

      if (collection.insertOne) {
        collection
          .insertOne(props, insertOpts, handler);
      } else {
        collection
          .insert(props, insertOpts, handler);
      }
    }).then((cursor) => {
      let record;
      const r = cursor.ops ? cursor.ops : cursor;
      this._translateObjectIDs(r, opts);
      record = utils.isArray(r) ? r[0] : r;
      cursor.connection = undefined;
      return [record, cursor];
    });
  }

  /**
   * Create multiple records in a single batch. Internal method used by
   * Adapter#createMany.
   *
   * @method MongoDBAdapter#_createMany
   * @private
   * @param {object} mapper The mapper.
   * @param {object} props The records to be created.
   * @param {object} [opts] Configuration options.
   * @return {Promise}
   */
  _createMany(mapper, props: any = {}, opts: any = {}) {
    return this._run((client, success, failure) => {
      const collectionId = this._getCollectionId(mapper, opts);
      const insertManyOpts = this.getOpt('insertManyOpts', opts);
      props = utils.plainCopy(props);

      client.collection(collectionId)
        .insertMany(props, insertManyOpts, (err, cursor) => err ? failure(err) : success(cursor));
    }).then((cursor) => {
      let records = [];
      const r = cursor.ops ? cursor.ops : cursor;
      this._translateObjectIDs(r, opts);
      records = r;
      cursor.connection = undefined;
      return [records, cursor];
    });
  }

  /**
   * Destroy the record with the given primary key. Internal method used by
   * Adapter#destroy.
   *
   * @method MongoDBAdapter#_destroy
   * @private
   * @param {object} mapper The mapper.
   * @param {(string|number)} id Primary key of the record to destroy.
   * @param {object} [opts] Configuration options.
   * @return {Promise}
   */
  _destroy(mapper, id, opts: any = {}) {
    return this._run((client, success, failure) => {
      const collectionId = this._getCollectionId(mapper, opts);
      const removeOpts = this.getOpt('removeOpts', opts);

      const mongoQuery = {
        [mapper.idAttribute]: this.toObjectID(mapper, id)
      };
      const collection = client.collection(collectionId);
      const handler = (err, cursor) => err ? failure(err) : success(cursor);

      if (collection.deleteOne) {
        collection
          .deleteOne(mongoQuery, removeOpts, handler);
      } else {
        collection
          .remove(mongoQuery, removeOpts, handler);
      }
    }).then((cursor) => [undefined, cursor]);
  }

  /**
   * Destroy the records that match the selection query. Internal method used by
   * Adapter#destroyAll.
   *
   * @method MongoDBAdapter#_destroyAll
   * @private
   * @param {object} mapper the mapper.
   * @param {object} [query] Selection query.
   * @param {object} [opts] Configuration options.
   * @return {Promise}
   */
  _destroyAll(mapper, query: any = {}, opts: any = {}) {
    return this._run((client, success, failure) => {
      const collectionId = this._getCollectionId(mapper, opts);
      const removeOpts = this.getOpt('removeOpts', opts);
      utils.fillIn(removeOpts, this.getQueryOptions(mapper, query));

      const mongoQuery = this.getQuery(mapper, query);
      const collection = client.collection(collectionId);
      const handler = (err, cursor) => err ? failure(err) : success(cursor);

      if (collection.deleteMany) {
        collection
          .deleteMany(mongoQuery, removeOpts, handler);
      } else {
        collection
          .remove(mongoQuery, removeOpts, handler);
      }
    }).then((cursor) => {
      cursor.connection = undefined;
      return [undefined, cursor];
    });
  }

  /**
   * Retrieve the record with the given primary key. Internal method used by
   * Adapter#find.
   *
   * @method MongoDBAdapter#_find
   * @private
   * @param {object} mapper The mapper.
   * @param {(string|number)} id Primary key of the record to retrieve.
   * @param {object} [opts] Configuration options.
   * @param {string|string[]|object} [opts.fields] Select a subset of fields to be returned.
   * @return {Promise}
   */
  _find(mapper, id, opts: any = {}) {
    opts.with = opts.with || [];

    return this._run((client, success, failure) => {
      const collectionId = this._getCollectionId(mapper, opts);

      const mongoQuery = {
        [mapper.idAttribute]: this.toObjectID(mapper, id)
      };

      client.collection(collectionId)
        .findOne(mongoQuery, (err, record) => err ? failure(err) : success(record));
    }).then((record) => {
      if (record) {
        this._translateObjectIDs(record, opts);
      } else {
        record = undefined;
      }
      return [record, {}];
    });
  }

  /**
   * Retrieve the records that match the selection query. Internal method used
   * by Adapter#findAll.
   *
   * @method MongoDBAdapter#_findAll
   * @private
   * @param {object} mapper The mapper.
   * @param {object} query Selection query.
   * @param {object} [opts] Configuration options.
   * @param {string|string[]|object} [opts.fields] Select a subset of fields to be returned.
   * @return {Promise}
   */
  _findAll(mapper, query, opts: any = {}) {
    return this._run((client, success, failure) => {
      const collectionId = this._getCollectionId(mapper, opts);

      const mongoQuery = this.getQuery(mapper, query);

      client.collection(collectionId)
        .find(mongoQuery)
        .toArray((err, records) => err ? failure(err) : success(records));
    }).then((records) => {
      this._translateObjectIDs(records, opts);
      return [records, {}];
    });
  }

  _getCollectionId(mapper, opts: any = {}) {
    return opts.table || opts.collection || mapper.table || mapper.collection || snakeCase(mapper.name);
  }

  _getFields(mapper, opts: any = {}) {
    if (utils.isString(opts.fields)) {
      opts.fields = {[opts.fields]: 1};
    } else if (utils.isArray(opts.fields)) {
      const fields = {};
      opts.fields.forEach((field) => {
        fields[field] = 1;
      });
      return fields;
    }
    return opts.fields;
  }

  _run(cb) {
    if (this._db) {
      // Use the cached db object
      return new Promise((resolve, reject) => {
        cb(this._db, resolve, reject);
      });
    }
    return this.getClient().then((client) => {
      return new Promise((resolve, reject) => {
        cb(client, resolve, reject);
      });
    });
  }

  /**
   * Apply the given update to the record with the specified primary key.
   * Internal method used by Adapter#update.
   *
   * @method MongoDBAdapter#_update
   * @private
   * @param {object} mapper The mapper.
   * @param {(string|number)} id The primary key of the record to be updated.
   * @param {object} props The update to apply to the record.
   * @param {object} [opts] Configuration options.
   * @return {Promise}
   */
  _update(mapper, id, props, opts: any = {}) {
    return this._find(mapper, id, {raw: false})
      .then((result) => {
        if (!result[0]) {
          throw new Error('Not Found');
        }
        return this._run((client, success, failure) => {
          const collectionId = this._getCollectionId(mapper, opts);
          const updateOpts = this.getOpt('updateOpts', opts);

          const mongoQuery = {
            [mapper.idAttribute]: this.toObjectID(mapper, id)
          };
          const collection = client.collection(collectionId);
          const handler = (err, cursor) => err ? failure(err) : success(cursor);

          if (collection.updateOne) {
            collection
              .updateOne(mongoQuery, {$set: props}, updateOpts, handler);
          } else {
            collection
              .update(mongoQuery, {$set: props}, updateOpts, handler);
          }
        });
      })
      .then((cursor) => {
        return this._find(mapper, id, {raw: false})
          .then((result) => {
            cursor.connection = undefined;
            return [result[0], cursor];
          });
      });
  }

  /**
   * Apply the given update to all records that match the selection query.
   * Internal method used by Adapter#updateAll.
   *
   * @method MongoDBAdapter#_updateAll
   * @private
   * @param {Object} mapper The mapper.
   * @param {Object} props The update to apply to the selected records.
   * @param {Object} [query] Selection query.
   * @param {Object} [opts] Configuration options.
   * @return {Promise}
   */
  _updateAll(mapper, props: any = {}, query: any = {}, opts: any = {}) {
    let ids;

    return this._run((client, success, failure) => {
      return this._findAll(mapper, query, {raw: false}).then((result) => {
        const collectionId = this._getCollectionId(mapper, opts);
        const updateOpts = this.getOpt('updateOpts', opts);
        updateOpts.multi = true;

        const queryOptions = this.getQueryOptions(mapper, query);
        queryOptions.$set = props;
        ids = result[0].map((record) => this.toObjectID(mapper, record[mapper.idAttribute]));

        const mongoQuery = this.getQuery(mapper, query);
        const collection = client.collection(collectionId);
        const handler = (err, cursor) => err ? failure(err) : success(cursor);

        if (collection.updateMany) {
          collection
            .updateMany(mongoQuery, queryOptions, updateOpts, handler);
        } else {
          collection
            .update(mongoQuery, queryOptions, updateOpts, handler);
        }
      });
    }).then((cursor) => {
      const query = {
        [mapper.idAttribute]: {
          'in': ids
        }
      };
      return this._findAll(mapper, query, {raw: false}).then((result) => {
        cursor.connection = undefined;
        return [result[0], cursor];
      });
    });
  }

  /**
   * Return a Promise that resolves to a reference to the MongoDB client being
   * used by this adapter.
   *
   * Useful when you need to do anything custom with the MongoDB client library.
   *
   * @method MongoDBAdapter#getClient
   * @return {object} MongoDB client.
   */
  getClient() {
    return this.client;
  }

  /**
   * Map filtering params in a selection query to MongoDB a filtering object.
   *
   * Handles the following:
   *
   * - where
   *   - and bunch of filtering operators
   *
   * @method MongoDBAdapter#getQuery
   * @return {object}
   */
  getQuery(mapper, query) {
    query = utils.plainCopy(query || {});
    query.where = query.where || {};

    utils.forOwn(query, function (config, keyword) {
      if (reserved.indexOf(keyword) === -1) {
        if (utils.isObject(config)) {
          query.where[keyword] = config;
        } else {
          query.where[keyword] = {
            '==': config
          };
        }
        delete query[keyword];
      }
    });

    const mongoQuery: any = {};

    if (Object.keys(query.where).length !== 0) {
      utils.forOwn(query.where, function (criteria, field) {
        if (!utils.isObject(criteria)) {
          query.where[field] = {
            '==': criteria
          };
        }
        utils.forOwn(criteria, function (v, op) {
          if (op === '==' || op === '===' || op === 'contains') {
            mongoQuery[field] = v;
          } else if (op === '!=' || op === '!==' || op === 'notContains') {
            mongoQuery[field] = mongoQuery[field] || {};
            mongoQuery[field].$ne = v;
          } else if (op === '>') {
            mongoQuery[field] = mongoQuery[field] || {};
            mongoQuery[field].$gt = v;
          } else if (op === '>=') {
            mongoQuery[field] = mongoQuery[field] || {};
            mongoQuery[field].$gte = v;
          } else if (op === '<') {
            mongoQuery[field] = mongoQuery[field] || {};
            mongoQuery[field].$lt = v;
          } else if (op === '<=') {
            mongoQuery[field] = mongoQuery[field] || {};
            mongoQuery[field].$lte = v;
          } else if (op === 'in') {
            mongoQuery[field] = mongoQuery[field] || {};
            mongoQuery[field].$in = v;
          } else if (op === 'notIn') {
            mongoQuery[field] = mongoQuery[field] || {};
            mongoQuery[field].$nin = v;
          } else if (op === '|==' || op === '|===' || op === '|contains') {
            mongoQuery.$or = mongoQuery.$or || [];
            const orEqQuery = {};
            orEqQuery[field] = v;
            mongoQuery.$or.push(orEqQuery);
          } else if (op === '|!=' || op === '|!==' || op === '|notContains') {
            mongoQuery.$or = mongoQuery.$or || [];
            const orNeQuery = {};
            orNeQuery[field] = {
              '$ne': v
            };
            mongoQuery.$or.push(orNeQuery);
          } else if (op === '|>') {
            mongoQuery.$or = mongoQuery.$or || [];
            const orGtQuery = {};
            orGtQuery[field] = {
              '$gt': v
            };
            mongoQuery.$or.push(orGtQuery);
          } else if (op === '|>=') {
            mongoQuery.$or = mongoQuery.$or || [];
            const orGteQuery = {};
            orGteQuery[field] = {
              '$gte': v
            };
            mongoQuery.$or.push(orGteQuery);
          } else if (op === '|<') {
            mongoQuery.$or = mongoQuery.$or || [];
            const orLtQuery = {};
            orLtQuery[field] = {
              '$lt': v
            };
            mongoQuery.$or.push(orLtQuery);
          } else if (op === '|<=') {
            mongoQuery.$or = mongoQuery.$or || [];
            const orLteQuery = {};
            orLteQuery[field] = {
              '$lte': v
            };
            mongoQuery.$or.push(orLteQuery);
          } else if (op === '|in') {
            mongoQuery.$or = mongoQuery.$or || [];
            const orInQuery = {};
            orInQuery[field] = {
              '$in': v
            };
            mongoQuery.$or.push(orInQuery);
          } else if (op === '|notIn') {
            mongoQuery.$or = mongoQuery.$or || [];
            const orNinQuery = {};
            orNinQuery[field] = {
              '$nin': v
            };
            mongoQuery.$or.push(orNinQuery);
          }
        });
      });
    }

    return mongoQuery;
  }

  /**
   * Map non-filtering params in a selection query to MongoDB query options.
   *
   * Handles the following:
   *
   * - limit
   * - skip/offset
   * - orderBy/sort
   *
   * @method MongoDBAdapter#getQueryOptions
   * @return {object}
   */
  getQueryOptions(mapper, query) {
    query = utils.plainCopy(query || {});
    query.orderBy = query.orderBy || query.sort;
    query.skip = query.skip || query.offset;

    const queryOptions: any = {};

    if (query.orderBy) {
      if (utils.isString(query.orderBy)) {
        query.orderBy = [
          [query.orderBy, 'asc']
        ];
      }
      for (let i = 0; i < query.orderBy.length; i++) {
        if (utils.isString(query.orderBy[i])) {
          query.orderBy[i] = [query.orderBy[i], 'asc'];
        }
      }
      queryOptions.sort = query.orderBy;
    }

    if (query.skip) {
      queryOptions.skip = +query.skip;
    }

    if (query.limit) {
      queryOptions.limit = +query.limit;
    }

    return queryOptions;
  }

  /**
   * Turn an _id into an ObjectID if it isn't already an ObjectID.
   *
   * @method MongoDBAdapter#toObjectID
   * @return {*}
   */
  toObjectID(mapper, id: ObjectID | string | any) {
    // @ts-ignore
    if (id !== undefined && mapper.idAttribute === '_id' && typeof id === 'string' && ObjectID.isValid(id) && !(id instanceof ObjectID)) {
      return new ObjectID(id);
    }
    return id;
  }

  /**
   * Return the foreignKey from the given record for the provided relationship.
   *
   * @method MongoDBAdapter#makeBelongsToForeignKey
   * @return {*}
   */
  makeBelongsToForeignKey(mapper, def, record) {
    return this.toObjectID(def.getRelation(), Adapter.prototype.makeBelongsToForeignKey.call(this, mapper, def, record));
  }

  /**
   * Return the localKeys from the given record for the provided relationship.
   *
   * Override with care.
   *
   * @method MongoDBAdapter#makeHasManyLocalKeys
   * @return {*}
   */
  makeHasManyLocalKeys(mapper, def, record) {
    const relatedMapper = def.getRelation();
    const localKeys = Adapter.prototype.makeHasManyLocalKeys.call(this, mapper, def, record);
    return localKeys.map((key) => this.toObjectID(relatedMapper, key));
  }

  /**
   * Not supported.
   *
   * @method MongoDBAdapter#updateMany
   */
  async updateMany(mapper: Mapper, records?: any[], opts?: any) {
    throw new Error('not supported!');
  }
}

/**
 * Details of the current version of the `js-data-mongodb` module.
 *
 * @example
 * import { version } from 'js-data-mongodb';
 * console.log(version.full);
 *
 * @type {object}
 * @property {string} version.full The full semver value.
 * @property {number} version.major The major version number.
 * @property {number} version.minor The minor version number.
 * @property {number} version.patch The patch version number.
 * @property {(string|boolean)} version.alpha The alpha version value,
 * otherwise `false` if the current version is not alpha.
 * @property {(string|boolean)} version.beta The beta version value,
 * otherwise `false` if the current version is not beta.
 */
export const version = '<%= version %>';

/**
 * Registered as `js-data-mongodb` in NPM.
 *
 * @example <caption>Install from NPM</caption>
 * npm i --save js-data-mongodb js-data mongodb bson
 *
 * @example <caption>Load via CommonJS</caption>
 * const MongoDBAdapter = require('js-data-mongodb').MongoDBAdapter;
 * const adapter = new MongoDBAdapter();
 *
 * @example <caption>Load via ES2015 Modules</caption>
 * import { MongoDBAdapter } from 'js-data-mongodb';
 * const adapter = new MongoDBAdapter();
 *
 * @module js-data-mongodb
 */
