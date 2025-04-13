import { TestBed } from '@angular/core/testing';

import { CalendarListStateService } from './calendar-list-state.service';

describe('StateServiceService', () => {
  let service: CalendarListStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalendarListStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
