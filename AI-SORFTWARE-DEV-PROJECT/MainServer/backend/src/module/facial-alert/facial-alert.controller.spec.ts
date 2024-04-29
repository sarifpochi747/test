import { Test, TestingModule } from '@nestjs/testing';
import { FacialAlertController } from './facial-alert.controller';

describe('FacialAlertController', () => {
  let controller: FacialAlertController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacialAlertController],
    }).compile();

    controller = module.get<FacialAlertController>(FacialAlertController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
