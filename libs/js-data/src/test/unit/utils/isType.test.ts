import { JSData } from '../../_setup';

const utils = JSData.utils;

describe('utils.isArray', () => {
  it('isArray returns true for arrays', () => {
    const arrays = [
      [1, 2],
      [{}, {}],
      []
    ];
    arrays.forEach(arr => {
      expect(Array.isArray(arr)).toBe(true);
      expect(utils.isArray(arr)).toBe(true);
    });
  });

  it('isArray returns false for non arrays', () => {
    const nonArrays = [1, 'string', {0: 0, 1: 1}];
    nonArrays.forEach(obj => {
      expect(Array.isArray(obj)).not.toBe(true);
      expect(utils.isArray(obj)).not.toBe(true);
    });
  });
});

describe('utils.isBoolean', () => {
  it('isBoolean returns true for boolean values', () => {
    const trueVals = [true, false];
    trueVals.forEach(val => {
      expect(typeof val).toBe('boolean');
      expect(utils.isBoolean(val)).toBe(true);
    });
  });

  it('isBoolean returns false for non boolean values', () => {
    const falseVals = ['123', 'true', 'false', 0, {}];
    falseVals.forEach(val => {
      expect(typeof val).not.toBe('boolean');
      expect(utils.isBoolean(val)).not.toBe(true);
    });
  });
});

describe('utils.isFunction', () => {
  it('isFunction returns true for function values', () => {
    const trueVals = [() => {}, () => {}, console.log];
    trueVals.forEach(val => {
      expect(typeof val).toBe('function');
      expect(utils.isFunction(val)).toBe(true);
    });
  });

  it('isFunction returns false for non function values', () => {
    const falseVals = ['123', 'true', 'false', 0, {}];
    falseVals.forEach(val => {
      expect(typeof val).not.toBe('function');
      expect(utils.isFunction(val)).not.toBe(true);
    });
  });
});

describe('utils.isInteger', () => {
  it('isInteger returns true for function values', () => {
    const trueVals = [1, 2, 5 / 1, -5, 0];
    trueVals.forEach(val => {
      expect(utils.isInteger(val)).toBe(true);
    });
  });

  it('isInteger returns false for non function values', () => {
    const falseVals = ['1', 1.25, -1.3, 2 / 3, Infinity];
    falseVals.forEach(val => {
      expect(utils.isInteger(val)).not.toBe(true);
    });
  });
});

describe('utils.isNull', () => {
  it('isNull returns true for null values', () => {
    const trueVals = [
      null,
      (() => {
        return null;
      })()
    ];
    trueVals.forEach(val => {
      expect(val).toBeNull();
      expect(utils.isNull(val)).toBe(true);
    });
  });

  it('isNull returns false for non null values', () => {
    const falseVals = [0, 1, undefined, 'null', void (() => {})];
    falseVals.forEach(val => {
      expect(val).not.toBeNull();
      expect(utils.isNull(val)).not.toBe(true);
    });
  });
});

describe('utils.isNumber', () => {
  it('isNumber returns true for number values', () => {
    const trueVals = [1, 1.45, -1.56, Infinity, Number(100)]; // eslint-disable-line
    trueVals.forEach(val => {
      expect(typeof val).toBe('number');
      expect(utils.isNumber(val)).toBe(true);
    });
  });

  it('isNumber returns false for non function values', () => {
    const falseVals = ['1', 'string', undefined, null, false];
    falseVals.forEach(val => {
      expect(typeof val).not.toBe('number');
      expect(utils.isNumber(val)).not.toBe(true);
    });
  });
});

describe('utils.isObject', () => {
  it('isObject returns true for object values', () => {
    const trueVals = [{}, {}]; // eslint-disable-line
    trueVals.forEach(val => {
      expect(typeof val).toBe('object');
      expect(utils.isObject(val)).toBe(true);
    });
  });

  it('isObject returns false for non object values', () => {
    const falseVals = [() => {}, 'string', 1, String()]; // eslint-disable-line
    falseVals.forEach(val => {
      expect(typeof val).not.toBe('object');
      expect(utils.isObject(val)).not.toBe(true);
    });
  });
});

describe('utils.isRegExp', () => {
  it('isRegExp returns true for regex values', () => {
    const trueVals = [/^\$.+$/gi, new RegExp('^\\$.+$', 'ig')];
    trueVals.forEach(val => {
      expect(utils.isRegExp(val)).toBe(true);
    });
  });

  it('isRegExp returns false for non regex values', () => {
    const falseVals = ['', 'not-a-regex', 12, {}, () => {}];
    falseVals.forEach(val => {
      expect(utils.isRegExp(val)).not.toBe(true);
    });
  });
});

describe('utils.isSorN', () => {
  it('isSorN returns true for string or number values', () => {
    const trueVals = ['', 1.65, -1, 0, 'string', Infinity];
    trueVals.forEach(val => {
      expect(utils.isString(val) || utils.isNumber(val)).toBeTruthy();
      expect(utils.isSorN(val)).toBe(true);
    });
  });

  it('isSorN returns false for non string nor number values', () => {
    const falseVals = [{}, () => {}, []];
    falseVals.forEach(val => {
      expect(!utils.isString(val) && !utils.isNumber(val)).toBeTruthy();
      expect(utils.isSorN(val)).not.toBe(true);
    });
  });
});

describe('utils.isString', () => {
  it('isString returns true for object values', () => {
    const trueVals = ['string', String(''), '']; // eslint-disable-line
    trueVals.forEach(val => {
      expect(utils.isString(val)).toBe(true);
    });
  });

  it('isString returns false for non string values', () => {
    const falseVals = [() => {}, 1, 1.2, /regex/, []]; // eslint-disable-line
    falseVals.forEach(val => {
      expect(utils.isString(val)).not.toBe(true);
    });
  });
});

describe('utils.isUndefined', () => {
  it('isUndefined returns true for undefined values', () => {
    const trueVals = [undefined, void (() => {})];
    trueVals.forEach(val => {
      expect(val).not.toBeDefined();
      expect(utils.isUndefined(val)).toBe(true);
    });
  });

  it('isUndefined returns false for non undefined values', () => {
    const falseVals = ['', {}, () => {}, null];
    falseVals.forEach(val => {
      expect(val).toBeDefined();
      expect(utils.isUndefined(val)).not.toBe(true);
    });
  });
});
