import { requests, store } from './_setup';
import { addActions } from '@js-data/js-data-http';

describe('static addActions', () => {
  it('should addActions', done => {
    const SchoolMapper = store.defineMapper('school', {});

    // GET async/reports/schools/:school_id/teachers
    addActions({
      getTeacherReports: {
        endpoint: 'reports/schools',
        pathname: 'teachers',
        method: 'GET'
      },
      getStudentReports: {
        endpoint: 'reports/schools',
        pathname: 'students',
        method: 'GET'
      }
    })(SchoolMapper);

    const asyncTestOne = nextTest => {
      setTimeout(() => {
        requests[0].respond(200, {'Content-Type': 'text/plain'}, '')
      }, 5);

      SchoolMapper.getTeacherReports(1234).then(() => {
        expect(1).toEqual(requests.length);
        expect(requests[0].url).toEqual('reports/schools/1234/teachers');
        expect(requests[0].method).toEqual('GET');
        nextTest()
      })
    };

    const asyncTestTwo = () => {
      setTimeout(() => {
        requests[1].respond(200, {'Content-Type': 'text/plain'}, '')
      }, 5);

      SchoolMapper.getStudentReports(1234).then(() => {
        expect(2).toEqual(requests.length);
        expect(requests[1].url).toEqual('reports/schools/1234/students');
        expect(requests[1].method).toEqual('GET');
        done()
      })
    };

    asyncTestOne(asyncTestTwo)
  })
});
