import { async, TestBed } from '@angular/core/testing';
import { JsDataHttpModule } from './js-data-http.module';

describe('JsDataHttpModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [JsDataHttpModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(JsDataHttpModule).toBeDefined();
  });
});
