import { Injectable } from '@angular/core';
import { DataStore } from '@js-data/js-data';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpAdapter, HttpConfig } from '@js-data/js-data-http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AngularAdapterService extends HttpAdapter {
  httpConfig: HttpConfig = {};

  constructor(http: HttpClient, dataStore: DataStore) {
    super();
    this.http = (config) => {
      return http.request(config.method, config.url, {
        params: config.params,
        headers: config.headers,
        observe: 'response'
      })
        .toPromise();
    };
    dataStore.registerAdapter('http', this, {default: true})
  }


  deserialize(mapper, response, opts: any = {}): any {
    response = super.deserialize(mapper, response, opts);

    if (response?.hasOwnProperty('body')) {
      return response.body;
    }

    return response;
  }
}
