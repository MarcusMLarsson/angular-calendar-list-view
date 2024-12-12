import { TestBed } from '@angular/core/testing';

import { EventGroupingService } from './event-grouping.service';

describe('EventGroupingService', () => {
  let service: EventGroupingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventGroupingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
