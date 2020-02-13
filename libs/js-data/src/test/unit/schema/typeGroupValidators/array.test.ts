import { JSData, sinon } from '../../../_setup';

describe('Schema.typeGroupValidators.array', () => {
  it('executes correct validation keywords', () => {
    const forOwn = JSData.utils.forOwn;
    const validationKeywords = JSData.Schema.validationKeywords;
    const TARGET_KEYWORDS = ['items', 'maxItems', 'minItems', 'uniqueItems'];

    forOwn(validationKeywords, (func, key) => {
      sinon.spy(validationKeywords, key);
    });

    const array = JSData.Schema.typeGroupValidators.array;

    forOwn(validationKeywords, (func, key) => {
      expect(func.callCount).toEqual(0);
    });

    // execute all 4
    array(['foo'], {
      items: {},
      maxItems: 4,
      minItems: 1,
      uniqueItems: true
    });

    expect(validationKeywords.items.callCount).toEqual(1);
    expect(validationKeywords.maxItems.callCount).toEqual(1);
    expect(validationKeywords.minItems.callCount).toEqual(1);
    expect(validationKeywords.uniqueItems.callCount).toEqual(1);

    // execute items only
    array(['foo'], {
      items: {}
    });

    expect(validationKeywords.items.callCount).toEqual(2);
    expect(validationKeywords.maxItems.callCount).toEqual(1);
    expect(validationKeywords.minItems.callCount).toEqual(1);
    expect(validationKeywords.uniqueItems.callCount).toEqual(1);

    // execute maxItems only
    array(['foo'], {
      maxItems: 4
    });

    expect(validationKeywords.items.callCount).toEqual(2);
    expect(validationKeywords.maxItems.callCount).toEqual(2);
    expect(validationKeywords.minItems.callCount).toEqual(1);
    expect(validationKeywords.uniqueItems.callCount).toEqual(1);

    // execute minItems only
    array(['foo'], {
      minItems: 1
    });

    expect(validationKeywords.items.callCount).toEqual(2);
    expect(validationKeywords.maxItems.callCount).toEqual(2);
    expect(validationKeywords.minItems.callCount).toEqual(2);
    expect(validationKeywords.uniqueItems.callCount).toEqual(1);

    // execute maxItems and minItems
    array(['foo'], {
      maxItems: 4,
      minItems: 1
    });

    // execute uniqueItems
    array(['foo'], {
      uniqueItems: false
    });

    // execute uniqueItems
    array(['foo'], {
      uniqueItems: true
    });

    expect(validationKeywords.items.callCount).toEqual(2);
    expect(validationKeywords.maxItems.callCount).toEqual(3);
    expect(validationKeywords.minItems.callCount).toEqual(3);
    expect(validationKeywords.uniqueItems.callCount).toEqual(3);

    forOwn(validationKeywords, (func, key) => {
      if (TARGET_KEYWORDS.indexOf(key) === -1) {
        expect(func.callCount).toEqual(0);
      }
      validationKeywords[key].restore();
    });
  });
});
