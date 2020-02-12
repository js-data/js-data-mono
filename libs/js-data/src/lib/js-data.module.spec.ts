import { async, TestBed } from '@angular/core/testing';
import { JsDataModule } from './js-data.module';

describe('JsDataModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [JsDataModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(JsDataModule).toBeDefined();
  });
});
