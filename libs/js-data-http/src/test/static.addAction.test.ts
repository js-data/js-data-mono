import { adapter, requests, store } from './_setup';
import { addAction } from '@js-data/js-data-http';
import { DataStore } from '@js-data/js-data';

describe('static addAction', () => {
  it('should addAction', done => {
    const SchoolMapper = store.defineMapper('school', {});

    // GET async/reports/schools/:school_id/teachers
    addAction('getTeacherReportsAsync', {
      basePath: 'async/',
      endpoint: 'reports/schools',
      pathname: 'teachers',
      method: 'GET'
    })(SchoolMapper);

    setTimeout(() => {
      requests[0].respond(200, {'Content-Type': 'text/plain'}, '')
    }, 5);

    SchoolMapper.getTeacherReportsAsync(1234).then(() => {
      expect(1).toEqual(requests.length);
      expect(requests[0].url).toEqual('async/reports/schools/1234/teachers');
      expect(requests[0].method).toEqual('GET');
      done()
    })
  });

  it('addAction action is callable with params instead of id', done => {
    const store = new DataStore();
    store.registerAdapter('http', adapter, {default: true});
    const SchoolMapper = store.defineMapper('school', {});

    // GET async/reports/schools/teachers
    addAction('getAllTeacherReportsAsync', {
      basePath: 'async/',
      endpoint: 'reports/schools',
      pathname: 'teachers',
      method: 'GET'
    })(SchoolMapper);

    setTimeout(() => {
      requests[0].respond(200, {'Content-Type': 'text/plain'}, '')
    }, 5);

    // GET async/reports/schools/teachers?<key>=<value>
    SchoolMapper.getAllTeacherReportsAsync({
      params: {
        subject: 'esperanto'
      }
    }).then(() => {
      expect(1).toEqual(requests.length);
      expect(requests[0].url).toEqual('async/reports/schools/teachers?subject=esperanto');
      expect(requests[0].method).toEqual('GET');
      done()
    })
  })
});
