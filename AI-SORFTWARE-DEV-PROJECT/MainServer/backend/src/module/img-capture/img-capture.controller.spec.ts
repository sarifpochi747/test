import { Test, TestingModule } from '@nestjs/testing';
import { ImgCaptureController } from './img-capture.controller';

describe('ImgCaptureController', () => {
  let controller: ImgCaptureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImgCaptureController],
    }).compile();

    controller = module.get<ImgCaptureController>(ImgCaptureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
