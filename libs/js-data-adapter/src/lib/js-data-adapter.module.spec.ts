import { async, TestBed } from '@angular/core/testing';
import { JsDataAdapterModule } from './js-data-adapter.module';

describe('JsDataAdapterModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [JsDataAdapterModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(JsDataAdapterModule).toBeDefined();
  });
});
