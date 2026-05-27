import { TestBed } from '@angular/core/testing';

import { Parts } from './parts';

describe('Parts', () => {
  let service: Parts;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Parts);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

