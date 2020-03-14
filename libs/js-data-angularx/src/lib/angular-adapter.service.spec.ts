import { TestBed } from '@angular/core/testing';

import { AngularAdapterService } from './angular-adapter.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DataStore } from '@js-data/js-data';

describe('AngularAdapterService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [DataStore]
  }));

  it('should be created', () => {
    const service: AngularAdapterService = TestBed.inject(AngularAdapterService);
    expect(service).toBeTruthy();
  });
});
