import { JSData, store, TYPES_EXCEPT_OBJECT_OR_ARRAY } from '../../_setup';

describe('Mapper#createRecord', () => {
  it('should be an instance method', () => {
    const Mapper = JSData.Mapper;
    const mapper = new Mapper({name: 'foo'});
    expect(typeof mapper.createRecord).toEqual('function');
    expect(mapper.createRecord).toBe(Mapper.prototype.createRecord);
  });
  it('should require an object or array', () => {
    const Mapper = JSData.Mapper;
    const mapper = new Mapper({name: 'foo'});
    expect(() => {
      mapper.createRecord();
      mapper.createRecord({});
      mapper.createRecord([{}]);
    }).not.toThrow();
    TYPES_EXCEPT_OBJECT_OR_ARRAY.forEach(value => {
      if (!value) {
        return;
      }
      expect(() => {
        mapper.createRecord(value);
      }).toThrow();
    });
  });
  it('should create an instance', () => {
    const store = new JSData.DataStore();

    class Person extends JSData.Record {
      constructor(props, opts?) {
        super(props, opts);
        if (!this._get) {
          JSData.Record.call(this, props, opts);
        }
      }

      say() {
        return 'hi';
      }

      get fullName() {
        return `${this.first} ${this.last}`;
      }
    }

    const PersonMapper = store.defineMapper('person', {
      recordClass: Person
    });

    // tslint:disable-next-line:max-classes-per-file
    class Dog extends JSData.Record {
      constructor(props, opts?) {
        super(props, opts);
        if (!this._get) {
          JSData.Record.call(this, props, opts);
        }
      }

      say() {
        return 'woof';
      }
    }

    const DogMapper = store.defineMapper('dog', {
      recordClass: Dog,
      name: 'Dog'
    });

    // tslint:disable-next-line:max-classes-per-file
    class Cat extends JSData.Record {
      constructor(props?, opts?) {
        super(props, opts);
        if (!this._get) {
          JSData.Record.call(this, props, opts);
        }
      }

      say() {
        return 'meow';
      }
    }

    const CatMapper = store.defineMapper('cat', {
      name: 'Cat',
      recordClass: Cat
    });

    const personAttrs = {
      first: 'John',
      last: 'Anderson'
    };

    const dogAttrs = {
      name: 'Spot'
    };

    const person = PersonMapper.createRecord(personAttrs);
    const person2 = new Person(personAttrs);
    const person3 = PersonMapper.createRecord(personAttrs);
    const dog = DogMapper.createRecord(dogAttrs);
    const dog2 = new Dog(dogAttrs);
    const cat = CatMapper.createRecord();
    const cat2 = new Cat();

    expect(person.say()).toEqual('hi');
    expect(person2.say()).toEqual('hi');
    expect(person3.say()).toEqual('hi');
    expect(dog.say()).toEqual('woof');
    expect(dog2.say()).toEqual('woof');
    expect(cat.say()).toEqual('meow');
    expect(cat2.say()).toEqual('meow');

    expect(person).toEqual({
      first: 'John',
      last: 'Anderson'
    });
    expect(dog).toEqual(dogAttrs);
    expect(cat).toEqual({});

    expect(person instanceof Person).toBeTruthy();
    expect(person2 instanceof Person).toBeTruthy();
    expect(person3 instanceof Person).toBeTruthy();
    expect(dog instanceof Dog).toBeTruthy();
    expect(dog2 instanceof Dog).toBeTruthy();
    expect(cat instanceof Cat).toBeTruthy();
    expect(cat2 instanceof Cat).toBeTruthy();
  });
  it('should create records on nested data', function () {
    const userProps = {
      name: 'John',
      organization: {
        name: 'Company Inc'
      },
      comments: [
        {
          content: 'foo'
        }
      ],
      profile: {
        email: 'john@email.com'
      }
    };
    const user = store.createRecord('user', userProps);
    expect(store.is('user', user)).toBeTruthy();
    expect(store.is('comment', user.comments[0])).toBeTruthy();
    expect(store.is('profile', user.profile)).toBeTruthy();
    expect(store.is('organization', user.organization)).toBeTruthy();
  });
});
