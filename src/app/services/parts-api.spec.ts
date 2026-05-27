import { TestBed } from '@angular/core/testing';

import { PartsApi } from './parts-api';

describe('PartsApi', () => {
  let service: PartsApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PartsApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

