import { TestBed } from '@angular/core/testing';

import { AchivementsService } from './achivements.service';

describe('AchivementsService', () => {
  let service: AchivementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AchivementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
