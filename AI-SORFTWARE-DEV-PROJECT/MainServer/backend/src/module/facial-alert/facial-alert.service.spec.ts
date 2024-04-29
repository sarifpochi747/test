import { Test, TestingModule } from '@nestjs/testing';
import { FacialAlertService } from './facial-alert.service';

describe('FacialAlertService', () => {
  let service: FacialAlertService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacialAlertService],
    }).compile();

    service = module.get<FacialAlertService>(FacialAlertService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
