import {HttpAdapter} from '@js-data/js-data-http';
import axios from 'axios';

export class HttpNodeAdapter extends HttpAdapter {
  useFetch = false;
  http = axios;
}
