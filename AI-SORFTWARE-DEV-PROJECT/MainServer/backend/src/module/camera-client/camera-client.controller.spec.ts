import { Test, TestingModule } from '@nestjs/testing';
import { CameraClientController } from './camera-client.controller';

describe('CameraClientController', () => {
  let controller: CameraClientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CameraClientController],
    }).compile();

    controller = module.get<CameraClientController>(CameraClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
