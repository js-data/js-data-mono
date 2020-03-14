import { Injectable } from '@angular/core';
import { Adapter } from '@js-data/js-data-adapter';
import { DataStore, Mapper, utils } from '@js-data/js-data';
import { HttpClient } from '@angular/common/http';

function isValidString(value) {
  return (value != null && value !== '');
}

function join(items, separator) {
  separator = separator || '';
  return items.filter(isValidString).join(separator);
}

function makePath(...args) {
  const result = join(args, '/');
  return result.replace(/([^:/]|^)\/{2,}/g, '$1/');
}

@Injectable({
  providedIn: 'root'
})
export class AngularAdapterService extends Adapter {
  constructor(private http: HttpClient, dataStore: DataStore) {
    super();
  }


    /**
     * @param {Mapper} mapper The Mapper.
     * @param {*} id The primary key, if any.
     * @param {boolean} opts Configuration options.
     * @return {string} Full path.
     */
    getEndpoint(mapper: Mapper, id: string | number, opts: any = {}) {
      opts.params = utils.isUndefined(opts.params) ? {} : opts.params;
      const relationList = mapper.relationList || [];
      let endpoint = utils.isUndefined(opts.endpoint) ? (utils.isUndefined(mapper.endpoint) ? mapper.name : mapper.endpoint) : opts.endpoint;

      relationList.forEach((def) => {
        if (def.type !== 'belongsTo' || !def.parent) {
          return;
        }
        let item;
        const parentKey = def.foreignKey;
        const parentDef = def.getRelation();
        let parentId = opts.params[parentKey];

        if (parentId === false || !parentKey || !parentDef) {
          if (parentId === false) {
            delete opts.params[parentKey];
          }
          return false;
        } else {
          delete opts.params[parentKey];

          if (utils.isObject(id)) {
            item = id;
          }

          if (item) {
            parentId = parentId || def.getForeignKey(item) || (def.getLocalField(item) ? utils.get(def.getLocalField(item), parentDef.idAttribute) : null);
          }

          if (parentId) {
            delete opts.endpoint;
            const _opts = {};
            utils.forOwn(opts, (value, key) => {
              _opts[key] = value;
            });
            utils._(_opts, parentDef);
            endpoint = makePath(this.getEndpoint(parentDef, parentId, _opts), parentId, endpoint);
            return false;
          }
        }
      });

      return endpoint;
    }

    /**
     * @param {string} method The method being executed.
     * @param {object} mapper The Mapper.
     * @param {(string|number)?} id The primary key, if any.
     * @param {object} opts Configuration options.
     */
    getPath(method: string, mapper: Mapper, id: string | number, opts: any = {}) {
      const args = [
        opts.basePath === undefined ? (mapper.basePath === undefined ? this.basePath : mapper.basePath) : opts.basePath,
        this.getEndpoint(mapper, (utils.isString(id) || utils.isNumber(id) || method === 'create') ? id : null, opts)
      ];
      if (method === 'find' || method === 'update' || method === 'destroy') {
        args.push(id);
      }
      return makePath.apply(utils, args);
    }

    _count(mapper: Mapper, query: any, opts: any): any {
    }

    _create(mapper: Mapper, props: any, opts: any): any {
    }

    _createMany(mapper: Mapper, props: any, opts: any): any {
    }

    _destroy(mapper: Mapper, id: any, opts: any): any {
    }

    _destroyAll(mapper: Mapper, query: any, opts: any): any {
    }

    _find(mapper: Mapper, id: any, opts: any): Promise<any> {
      return this.http.get(
        this.getPath('find', mapper, id, opts),
        opts
      ).toPromise().then(response => this._end(mapper, opts, response));
    }

    _findAll(mapper: Mapper, query: any, opts: any): any {
    }
}
