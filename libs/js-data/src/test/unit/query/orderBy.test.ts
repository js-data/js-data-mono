import { data, PostCollection, store } from '../../_setup';

describe('Query#orderBy', () => {
  it('should work', function () {
    const collection = PostCollection;
    const p1 = data.p1;
    const p2 = data.p2;
    const p3 = data.p3;
    const p4 = data.p4;
    store.add('post', [p1, p2, p3, p4]);

    const params: any = {orderBy: 'age'};

    expect(collection.query().filter(params).run()).toEqual([p1, p2, p3, p4]);

    params.orderBy = 'author';

    expect(collection.query().filter(params).run()).toEqual([p4, p1, p3, p2]);

    params.orderBy = [['age', 'DESC']];

    expect(collection.query().filter(params).run()).toEqual([p4, p3, p2, p1]);

    params.orderBy = [['author', 'DESC']];

    expect(collection.query().filter(params).run()).toEqual([p2, p3, p1, p4]);

    params.orderBy = ['age'];

    expect(collection.query().filter(params).run()).toEqual([p1, p2, p3, p4]);

    params.orderBy = ['author'];

    expect(collection.query().filter(params).run()).toEqual([p4, p1, p3, p2]);
  });
  it('should work with multiple orderBy', () => {
    store.defineMapper('item');
    const items = [
      {id: 1, test: 1, test2: 1},
      {id: 2, test: 2, test2: 2},
      {id: 3, test: 3, test2: 3},
      {id: 4, test: 1, test2: 4},
      {id: 5, test: 2, test2: 5},
      {id: 6, test: 3, test2: 6},
      {id: 7, test: 1, test2: 1},
      {id: 8, test: 2, test2: 2},
      {id: 9, test: 3, test2: 3},
      {id: 10, test: 1, test2: 4},
      {id: 11, test: 2, test2: 5},
      {id: 12, test: 3, test2: 6}
    ];
    store.add('item', items);
    const params: any = {};

    params.orderBy = [
      ['test', 'DESC'],
      ['test2', 'ASC'],
      ['id', 'ASC']
    ];

    expect(
      store
        .query('item')
        .filter(params)
        .run()).toEqual(
      [
        items[2],
        items[8],
        items[5],
        items[11],
        items[1],
        items[7],
        items[4],
        items[10],
        items[0],
        items[6],
        items[3],
        items[9]
      ]
    );

    params.orderBy = [
      ['test', 'DESC'],
      ['test2', 'ASC'],
      ['id', 'DESC']
    ];

    expect(
      store
        .query('item')
        .filter(params)
        .run()).toEqual(
      [
        items[8],
        items[2],
        items[11],
        items[5],
        items[7],
        items[1],
        items[10],
        items[4],
        items[6],
        items[0],
        items[9],
        items[3]
      ]
    );
  });
  it('should work with sorting de locality', function () {
    store.defineMapper('item');
    const items = [
      {test: 'a'},
      {test: 'z'},
      {test: 'ä'}
    ];
    store.add('item', items);
    const params: any = {};
    params.orderBy = [
      ['test', 'ASC']
    ];
    // should work without locale param with best fit criteria
    expect(store.query('item').filter(params).run()).toEqual([
      items[0],
      items[2],
      items[1]
    ]);
    // should work with locale param
    params.locale = 'de';
    expect(store.query('item').filter(params).run()).toEqual([
      items[0],
      items[2],
      items[1]
    ]);
  });
  // it('should work with sorting sv locality', function () {
  //   const store = new JSData.DataStore()
  //   store.defineMapper('item')
  //   const items = [
  //     { test: 'a' },
  //     { test: 'z' },
  //     { test: 'ä' }
  //   ]
  //   store.add('item', items)
  //   const params: any = {}
  //   params.orderBy = [
  //     ['test', 'ASC']
  //   ]
  //   params.locale = 'sv'
  //  expect(store.query('item').filter(params).run()).toEqual([
  //     items[0],
  //     items[1],
  //     items[2]
  //   ])
  // })
  it('should work with sorting thai locality', function () {
    store.defineMapper('item');
    const items = [
      {test: 'คลอน'},
      {test: 'กลอน'},
      {test: 'สาระ'},
      {test: 'ศาลา'},
      {test: 'จักรพรรณ'},
      {test: 'จักรพรรดิ'},
      {test: 'เก๋ง'},
      {test: 'เก้ง'},
      {test: 'เก็ง'},
      {test: 'เก่ง'}
    ];
    store.add('item', items);
    const params: any = {};
    params.orderBy = [
      ['test', 'ASC']
    ];
    // should work without locale param with best fit criteria
    expect(store.query('item').filter(params).run()).toEqual([
      items[1],
      items[8],
      items[9],
      items[7],
      items[6],
      items[0],
      items[4],
      items[5],
      items[3],
      items[2]
    ]);
    // should work with locale param
    params.locale = 'th';
    expect(store.query('item').filter(params).run()).toEqual([
      items[1],
      items[8],
      items[9],
      items[7],
      items[6],
      items[0],
      items[4],
      items[5],
      items[3],
      items[2]
    ]);
  });
  it('should order by nested keys', () => {
    store.defineMapper('thing');
    const things = [
      {
        id: 1,
        foo: {
          bar: 'f'
        }
      },
      {
        id: 2,
        foo: {
          bar: 'a'
        }
      },
      {
        id: 3,
        foo: {
          bar: 'c'
        }
      },
      {
        id: 4,
        foo: {
          bar: 'b'
        }
      }
    ];

    store.add('thing', things);

    let params = {
      orderBy: [['foo.bar', 'ASC']]
    };

    expect(store.query('thing').filter(params).run()).toEqual([things[1], things[3], things[2], things[0]]);

    params = {
      orderBy: [['foo.bar', 'DESC']]
    };
    expect(store.query('thing').filter(params).run()).toEqual([things[0], things[2], things[3], things[1]]);
  });
  it('puts null and undefined values at the end of result', () => {
    store.defineMapper('nilOrderBy');

    const items = [
      {
        id: 0,
        count: 1
      },
      {
        id: 1,
        count: null
      },
      {
        id: 2,
        count: 0
      },
      {
        id: 3,
        count: undefined
      },
      {
        id: 4,
        count: 2
      },
      {
        id: 5,
        count: undefined
      },
      {
        id: 6,
        count: null
      },
      {
        id: 7,
        count: 10
      }
    ];

    store.add('nilOrderBy', items);

    const paramsAsc = {
      orderBy: [['count', 'ASC']]
    };

    expect(store.query('nilOrderBy').filter(paramsAsc).run())
      .toEqual([items[2], items[0], items[4], items[7], items[1], items[6], items[3], items[5]]);

    const paramsDesc = {
      orderBy: [['count', 'DESC']]
    };

    expect(store.query('nilOrderBy').filter(paramsDesc).run())
      .toEqual([items[3], items[5], items[1], items[6], items[7], items[4], items[0], items[2]]);
  });
});
