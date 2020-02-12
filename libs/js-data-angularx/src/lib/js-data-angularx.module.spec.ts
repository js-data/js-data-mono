import { async, TestBed } from '@angular/core/testing';
import { JsDataAngularxModule } from './js-data-angularx.module';

describe('JsDataAngularxModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [JsDataAngularxModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(JsDataAngularxModule).toBeDefined();
  });
});
