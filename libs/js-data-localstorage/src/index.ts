/* global: localStorage */

import { Query, utils } from '@js-data/js-data';
import { Adapter } from '@js-data/js-data-adapter';
import * as guid from 'mout/random/guid';

export interface LocalStorageOpts {
  /**
   * Add a namespace to keys as they are stored.
   *
   * @name LocalStorageAdapter#basePath
   * @type {string}
   */
  basePath?: string;

  /**
   * Storage provider for this adapter. The default implementation is simply
   * `getItem`, `setItem`, and `removeItem`. Each method accepts the same
   * arguments as `localStorage#getItem`, `localStorage#setItem`, and
   * `localStorage#removeItem`, but instead of being synchronous, these methods
   * are asynchronous and return promises. This means you can swap out
   * `localStorage` for `localForage`.
   *
   * @example <caption>Use localForage instead of localStorage</caption>
   * const adapter = new LocalStorageAdapter({
   *   storage: localForage
   * })
   *
   * @name LocalStorageAdapter#storage
   * @type {Object}
   * @default localStorage
   */
  storage?: {
    getItem: (key) => Promise<any>,
    setItem: (key, value) => Promise<any>,
    removeItem: (key) => Promise<any>
  }
}

function isValidString(value) {
  return (value != null && value !== '');
}

function join(items, separator) {
  separator = separator || '';
  return items.filter(isValidString).join(separator);
}

function makePath(...args) {
  const result = join(args, '/');
  return result.replace(/([^:\/]|^)\/{2,}/g, '$1/');
}

const queue = [];
let taskInProcess = false;

function enqueue(task) {
  queue.push(task);
}

function dequeue() {
  if (queue.length && !taskInProcess) {
    taskInProcess = true;
    queue[0]();
  }
}

function queueTask(task) {
  if (!queue.length) {
    enqueue(task);
    dequeue();
  } else {
    enqueue(task);
  }
}

function createTask(fn) {
  return new Promise(fn).then(result => {
    taskInProcess = false;
    queue.shift();
    setTimeout(dequeue, 0);
    return result;
  }, err => {
    taskInProcess = false;
    queue.shift();
    setTimeout(dequeue, 0);
    return utils.reject(err);
  });
}

/**
 * LocalStorageAdapter class.
 *
 * @example
 * import {DataStore} from 'js-data'
 * import {LocalStorageAdapter} from 'js-data-localstorage'
 * const store = new DataStore()
 * const adapter = new LocalStorageAdapter()
 * store.registerAdapter('ls', adapter, { 'default': true })
 *
 * @class LocalStorageAdapter
 * @alias LocalStorageAdapter
 * @extends Adapter
 * @param {Object} [opts] Configuration options.
 * @param {string} [opts.basePath=''] See {@link LocalStorageAdapter#basePath}.
 * @param {boolean} [opts.debug=false] See {@link Adapter#debug}.
 * @param {boolean} [opts.raw=false] See {@link Adapter#raw}.
 * @param {Object} [opts.storeage=localStorage] See {@link LocalStorageAdapter#storage}.
 */
export class LocalStorageAdapter extends Adapter {

  /**
   * Add a namespace to keys as they are stored.
   *
   * @name LocalStorageAdapter#basePath
   * @type {string}
   */
  basePath = '';

  /**
   * Storage provider for this adapter. The default implementation is simply
   * `getItem`, `setItem`, and `removeItem`. Each method accepts the same
   * arguments as `localStorage#getItem`, `localStorage#setItem`, and
   * `localStorage#removeItem`, but instead of being synchronous, these methods
   * are asynchronous and return promises. This means you can swap out
   * `localStorage` for `localForage`.
   *
   * @example <caption>Use localForage instead of localStorage</caption>
   * const adapter = new LocalStorageAdapter({
   *   storage: localForage
   * })
   *
   * @name LocalStorageAdapter#storage
   * @type {Object}
   * @default localStorage
   */
  storage = {
    getItem(key) {
      return Promise.resolve(localStorage.getItem(key));
    },
    setItem(key, value) {
      return Promise.resolve(localStorage.setItem(key, value));
    },
    removeItem(key) {
      return Promise.resolve(localStorage.removeItem(key));
    }
  };

  /**
   * Alternative to ES6 class syntax for extending `LocalStorageAdapter`.
   *
   * @example <caption>Using the ES2015 class syntax.</caption>
   * class MyLocalStorageAdapter extends LocalStorageAdapter {...}
   * const adapter = new MyLocalStorageAdapter()
   *
   * @example <caption>Using {@link LocalStorageAdapter.extend}.</caption>
   * var instanceProps = {...}
   * var classProps = {...}
   *
   * var MyLocalStorageAdapter = LocalStorageAdapter.extend(instanceProps, classProps)
   * var adapter = new MyLocalStorageAdapter()
   */
  constructor(opts: LocalStorageOpts = {}) {
    super(opts);
  }

  /**
   * Retrieve the number of records that match the selection query. Internal
   * method used by Adapter#count.
   *
   * @method LocalStorageAdapter#_count
   * @private
   * @param {Object} mapper The mapper.
   * @param {Object} query Selection query.
   * @param {Object} [opts] Configuration options.
   * @return {Promise}
   */
  _count(mapper, query, opts: any = {}) {
    return this._findAll(mapper, query, opts).then((result) => {
      result[0] = result[0].length;
      return result;
    });
  }

  _createHelper(mapper, props, opts: any = {}) {
    props = utils.plainCopy(props);
    const idAttribute = mapper.idAttribute;
    const ids = props.map((_props) => {
      let id = utils.get(_props, idAttribute);
      if (utils.isUndefined(id)) {
        id = guid();
        utils.set(_props, idAttribute, id);
      }
      return id;
    });
    const keys = ids.map((id) => this.getIdPath(mapper, opts, id));
    const tasks = props.map((_props, i) => this.storage.setItem(keys[i], utils.toJson(_props)));
    return Promise.all(tasks)
      .then(() => this.ensureId(ids, mapper, opts))
      .then(() => Promise.all(keys.map((key) => this.storage.getItem(key))))
      .then((records) => records.map((record) => utils.fromJson(record)));
  }

  /**
   * Create a new record. Internal method used by Adapter#create.
   *
   * @method LocalStorageAdapter#_create
   * @private
   * @param {Object} mapper The mapper.
   * @param {Object} props The record to be created.
   * @param {Object} [opts] Configuration options.
   * @return {Promise}
   */
  _create(mapper, props, opts: any = {}) {
    return this._createHelper(mapper, [props], opts)
      .then((records) => [records[0], {}]);
  }

  /**
   * Create multiple records in a single batch. Internal method used by
   * Adapter#createMany.
   *
   * @method LocalStorageAdapter#_createMany
   * @private
   * @param {Object} mapper The mapper.
   * @param {Object} props The records to be created.
   * @param {Object} [opts] Configuration options.
   * @return {Promise}
   */
  _createMany(mapper, props, opts: any = {}) {
    return this._createHelper(mapper, props, opts)
      .then((records) => [records, {}]);
  }

  /**
   * Destroy the record with the given primary key. Internal method used by
   * Adapter#destroy.
   *
   * @method LocalStorageAdapter#_destroy
   * @private
   * @param {Object} mapper The mapper.
   * @param {(string|number)} id Primary key of the record to destroy.
   * @param {Object} [opts] Configuration options.
   * @return {Promise}
   */
  _destroy(mapper, id, opts: any = {}) {
    // Remove record from storage
    return this.storage.removeItem(this.getIdPath(mapper, opts, id))
      // Remove record's key from storage
      .then(() => this.removeId(id, mapper, opts))
      .then(() => [undefined, {}]);
  }

  /**
   * Destroy the records that match the selection query. Internal method used by
   * Adapter#destroyAll.
   *
   * @method LocalStorageAdapter#_destroyAll
   * @private
   * @param {Object} mapper the mapper.
   * @param {Object} [query] Selection query.
   * @param {Object} [opts] Configuration options.
   * @return {Promise}
   */
  _destroyAll(mapper, query, opts: any = {}) {
    return this._findAll(mapper, query, opts)
      .then((results) => {
        const [records] = results;
        const idAttribute = mapper.idAttribute;
        // Gather IDs of records to be destroyed
        const ids = records.map((record) => utils.get(record, idAttribute));
        // Remove records from storage
        const tasks = ids.map((id) => this.storage.removeItem(this.getIdPath(mapper, opts, id)));
        // Remove records' keys from storage
        return Promise.all(tasks).then(() => this.removeId(ids, mapper, opts));
      })
      .then(() => [undefined, {}]);
  }

  /**
   * Retrieve the record with the given primary key. Internal method used by
   * Adapter#find.
   *
   * @method LocalStorageAdapter#_find
   * @private
   * @param {Object} mapper The mapper.
   * @param {(string|number)} id Primary key of the record to retrieve.
   * @param {Object} [opts] Configuration options.
   * @return {Promise}
   */
  _find(mapper, id: string | number, opts: any = {}) {
    const key = this.getIdPath(mapper, opts, id);
    return this.storage.getItem(key).then((record) => [record ? utils.fromJson(record) : undefined, {}]);
  }

  /**
   * Retrieve the records that match the selection query. Internal method used
   * by Adapter#findAll.
   *
   * @method LocalStorageAdapter#_findAll
   * @private
   * @param {Object} mapper The mapper.
   * @param {Object} query Selection query.
   * @param {Object} [opts] Configuration options.
   * @return {Promise}
   */
  _findAll(mapper, query: any = {}, opts: any = {}) {
    // Load all records into memory...
    return this.getIds(mapper, opts)
      .then((ids) => {
        const tasks = Object.keys(ids).map((id) => this.storage.getItem(this.getIdPath(mapper, opts, id)));
        return Promise.all(tasks);
      })
      .then((records) => records.map((record) => record ? utils.fromJson(record) : undefined).filter((record) => record))
      .then((records) => {
        const _query = new Query({
          index: {
            getAll() {
              return records;
            }
          }
        });
        return [_query.filter(query).run(), {}];
      });
  }

  /**
   * Retrieve the number of records that match the selection query. Internal
   * method used by Adapter#sum.
   *
   * @method LocalStorageAdapter#_sum
   * @private
   * @param {Object} mapper The mapper.
   * @param {string} field The field to sum.
   * @param {Object} query Selection query.
   * @param {Object} [opts] Configuration options.
   * @return {Promise}
   */
  _sum(mapper, field, query, opts: any = {}) {
    return this._findAll(mapper, query, opts)
      .then((result) => {
        result[0] = result[0].reduce((sum, record) => sum + (utils.get(record, field) || 0), 0);
        return result;
      });
  }

  /**
   * Apply the given update to the record with the specified primary key.
   * Internal method used by Adapter#update.
   *
   * @method LocalStorageAdapter#_update
   * @private
   * @param {Object} mapper The mapper.
   * @param {(string|number)} id The primary key of the record to be updated.
   * @param {Object} props The update to apply to the record.
   * @param {Object} [opts] Configuration options.
   * @return {Promise}
   */
  _update(mapper, id, props, opts: any = {}) {
    return this._find(mapper, id, opts)
      .then((result) => {
        const [record] = result;
        if (!record) {
          throw new Error('Not Found');
        }
        const key = this.getIdPath(mapper, opts, id);
        utils.deepMixIn(record, props);
        return this.storage.setItem(key, utils.toJson(record));
      })
      .then(() => this._find(mapper, id, opts));
  }

  /**
   * Apply the given update to all records that match the selection query.
   * Internal method used by Adapter#updateAll.
   *
   * @method LocalStorageAdapter#_updateAll
   * @private
   * @param {Object} mapper The mapper.
   * @param {Object} props The update to apply to the selected records.
   * @param {Object} [query] Selection query.
   * @param {Object} [opts] Configuration options.
   * @return {Promise}
   */
  _updateAll(mapper, props, query, opts) {
    return this._findAll(mapper, query, opts)
      .then((results) => {
        const [records] = results;
        const idAttribute = mapper.idAttribute;
        const tasks = records.map((record) => {
          record = record || {};
          const id = utils.get(record, idAttribute);
          const key = this.getIdPath(mapper, opts, id);
          utils.deepMixIn(record, props);
          return this.storage.setItem(key, utils.toJson(record))
            .then(() => this._find(mapper, id, opts))
            .then((result) => result[0]);
        });
        return Promise.all(tasks);
      })
      .then((records) => [records, {}]);
  }

  /**
   * Update the given records in a single batch. Internal method used by
   * Adapter#updateMany.
   *
   * @method LocalStorageAdapter#updateMany
   * @private
   * @param {Object} mapper The mapper.
   * @param {Object[]} records The records to update.
   * @param {Object} [opts] Configuration options.
   * @return {Promise}
   */
  _updateMany(mapper, records: any = [], opts) {
    const idAttribute = mapper.idAttribute;
    const tasks = records.filter((record) => record).map((record) => {
      const id = utils.get(record, idAttribute);
      if (utils.isUndefined(id)) {
        return;
      }
      const key = this.getIdPath(mapper, opts, id);
      return this.storage.getItem(key)
        .then((json) => {
          if (!json) {
            return;
          }
          const existingRecord = utils.fromJson(json);
          utils.deepMixIn(existingRecord, record);
          return this.storage.setItem(key, utils.toJson(existingRecord));
        })
        .then(() => this._find(mapper, id, opts))
        .then((result) => result[0]);
    }).filter((promise) => promise);
    return Promise.all(tasks).then((records) => [records, {}]);
  }

  create(mapper, props, opts?): Promise<any> {
    return createTask((success, failure) => {
      queueTask(() => {
        super.create(mapper, props, opts).then(success, failure);
      });
    });
  }

  createMany(mapper, props, opts) {
    return createTask((success, failure) => {
      queueTask(() => {
        super.createMany(mapper, props, opts).then(success, failure);
      });
    });
  }

  destroy(mapper, id, opts) {
    return createTask((success, failure) => {
      queueTask(() => {
        super.destroy(mapper, id, opts).then(success, failure);
      });
    });
  }

  destroyAll(mapper, query, opts) {
    return createTask((success, failure) => {
      queueTask(() => {
        super.destroyAll(mapper, query, opts).then(success, failure);
      });
    });
  }

  /**
   * Store a given primary key
   *
   * @method LocalStorageAdapter#ensureId
   * @param {(string|number)} id Primary key of the record.
   * @param {Object} mapper The mapper.
   * @param {Object} [opts] Configuration options.
   */
  ensureId(id, mapper, opts) {
    return this.getIds(mapper, opts).then((ids) => {
      if (utils.isArray(id)) {
        if (!id.length) {
          return;
        }
        id.forEach((_id) => {
          ids[_id] = 1;
        });
      } else {
        ids[id] = 1;
      }
      return this.saveKeys(ids, mapper, opts);
    });
  }

  /**
   * Get a path name
   *
   * @method LocalStorageAdapter#getPath
   * @param {Object} mapper The mapper.
   * @param {Object} [opts] Configuration options.
   * @return {string} The path name
   */
  getPath(mapper, opts: any = {}) {
    return makePath(opts.basePath === undefined ? (mapper.basePath === undefined ? this.basePath : mapper.basePath) : opts.basePath, mapper.name);
  }

  /**
   * Get a path for a given primary key
   *
   * @method LocalStorageAdapter#getIdPath
   * @param {Object} mapper The mapper.
   * @param {Object} [opts] Configuration options.
   * @param {(string|number)} id Primary key of the record.
   * @return {string} The path name
   */
  getIdPath(mapper, opts, id) {
    opts = opts || {};
    return makePath(opts.basePath || this.basePath || mapper.basePath, mapper.endpoint, id);
  }

  /**
   * Retrieve all primary keys
   *
   * @method LocalStorageAdapter#getIds
   * @param {Object} mapper The mapper.
   * @param {Object} [opts] Configuration options.
   * @return {Object} Stored ids
   */
  getIds(mapper, opts) {
    let ids;
    const idsPath = this.getPath(mapper, opts);
    return this.storage.getItem(idsPath).then((idsJson) => {
      if (idsJson) {
        ids = utils.fromJson(idsJson);
      } else {
        ids = {};
      }
      return ids;
    });
  }

  /**
   * Remove a given primary key
   *
   * @method LocalStorageAdapter#removeId
   * @param {(string|number)} id Primary key of the record.
   * @param {Object} mapper The mapper.
   * @param {Object} [opts] Configuration options.
   */
  removeId(id, mapper, opts) {
    return this.getIds(mapper, opts).then((ids) => {
      if (utils.isArray(id)) {
        if (!id.length) {
          return;
        }
        id.forEach(function (_id) {
          delete ids[_id];
        });
      } else {
        delete ids[id];
      }
      return this.saveKeys(ids, mapper, opts);
    });
  }

  /**
   * Store primary keys
   *
   * @method LocalStorageAdapter#saveKeys
   * @param {(string|number)} ids Primary key of the record.
   * @param {Object} mapper The mapper.
   * @param {Object} [opts] Configuration options.
   */
  saveKeys(ids = {}, mapper, opts: any = {}) {
    const idsPath = this.getPath(mapper, opts);
    if (Object.keys(ids).length) {
      return this.storage.setItem(idsPath, utils.toJson(ids));
    } else {
      return this.storage.removeItem(idsPath);
    }
  }

  update(mapper, id, props, opts) {
    return createTask((success, failure) => {
      queueTask(() => {
        super.update(mapper, id, props, opts).then(success, failure);
      });
    });
  }

  updateAll(mapper, props, query, opts) {
    return createTask((success, failure) => {
      queueTask(() => {
        super.updateAll(mapper, props, query, opts).then(success, failure);
      });
    });
  }

  updateMany(mapper, records, opts) {
    return createTask((success, failure) => {
      queueTask(() => {
        super.updateMany(mapper, records, opts).then(success, failure);
      });
    });
  }
}

/**
 * Details of the current version of the `js-data-localstorage` module.
 *
 * @type {Object}
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
 * Registered as `js-data-localstorage` in NPM and Bower.
 *
 * @example <caption>Script tag</caption>
 * var LocalStorageAdapter = window.JSDataLocalStorage.LocalStorageAdapter
 * var adapter = new LocalStorageAdapter()
 *
 * @example <caption>CommonJS</caption>
 * var LocalStorageAdapter = require('js-data-localstorage').LocalStorageAdapter
 * var adapter = new LocalStorageAdapter()
 *
 * @example <caption>ES2015 Modules</caption>
 * import {LocalStorageAdapter} from 'js-data-localstorage'
 * const adapter = new LocalStorageAdapter()
 *
 * @example <caption>AMD</caption>
 * define('myApp', ['js-data-localstorage'], function (JSDataLocalStorage) {
 *   var LocalStorageAdapter = JSDataLocalStorage.LocalStorageAdapter
 *   var adapter = new LocalStorageAdapter()
 *
 *   // ...
 * })
 *
 * @module js-data-localstorage
 */

export default LocalStorageAdapter;
