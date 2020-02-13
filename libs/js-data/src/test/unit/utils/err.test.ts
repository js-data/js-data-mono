import { JSData } from '../../_setup';

const utils = JSData.utils;

describe('utils.err', () => {
  it('returns a wrapped function that will generate an Error for a given domain and target', () => {
    const errorGenerator = utils.err('domain', 'target');
    const error400 = errorGenerator(400, 'expected type', 'actual type');
    expect(error400 instanceof Error).toBeTruthy();

    const error404 = utils.err(JSData)(404, 'not found');
    expect(error404 instanceof Error).toBeTruthy();
  });
});
