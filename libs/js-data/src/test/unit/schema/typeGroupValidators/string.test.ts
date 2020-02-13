import { JSData, sinon } from '../../../_setup';

describe('Schema.typeGroupValidators.string', () => {
  it('executes correct validation keywords', () => {
    const forOwn = JSData.utils.forOwn;
    const validationKeywords = JSData.Schema.validationKeywords;
    const TARGET_KEYWORDS = ['maxLength', 'minLength', 'pattern'];

    forOwn(validationKeywords, (func, key) => {
      sinon.spy(validationKeywords, key);
    });

    const string = JSData.Schema.typeGroupValidators.string;

    forOwn(validationKeywords, (func, key) => {
      expect(func.callCount).toEqual(0);
    });

    // execute all 3
    string('foo', {
      pattern: /.*/,
      maxLength: 4,
      minLength: 1
    });

    expect(validationKeywords.pattern.callCount).toEqual(1);
    expect(validationKeywords.maxLength.callCount).toEqual(1);
    expect(validationKeywords.minLength.callCount).toEqual(1);

    // execute pattern only
    string('foo', {
      pattern: /.*/
    });

    expect(validationKeywords.pattern.callCount).toEqual(2);
    expect(validationKeywords.maxLength.callCount).toEqual(1);
    expect(validationKeywords.minLength.callCount).toEqual(1);

    // execute maxLength only
    string('foo', {
      maxLength: 4
    });

    expect(validationKeywords.pattern.callCount).toEqual(2);
    expect(validationKeywords.maxLength.callCount).toEqual(2);
    expect(validationKeywords.minLength.callCount).toEqual(1);

    // execute minLength only
    string('foo', {
      minLength: 1
    });

    expect(validationKeywords.pattern.callCount).toEqual(2);
    expect(validationKeywords.maxLength.callCount).toEqual(2);
    expect(validationKeywords.minLength.callCount).toEqual(2);

    // execute maxLength and minLength
    string('foo', {
      maxLength: 4,
      minLength: 1
    });

    expect(validationKeywords.pattern.callCount).toEqual(2);
    expect(validationKeywords.maxLength.callCount).toEqual(3);
    expect(validationKeywords.minLength.callCount).toEqual(3);

    forOwn(validationKeywords, (func, key) => {
      if (TARGET_KEYWORDS.indexOf(key) === -1) {
        expect(func.callCount).toEqual(0);
      }
      validationKeywords[key].restore();
    });
  });
});
