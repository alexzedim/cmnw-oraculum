import { Test, TestingModule } from '@nestjs/testing';
import { RainyController } from './rainy.controller';
import { RainyService } from './rainy.service';

describe('RainyController', () => {
  let rainyController: RainyController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RainyController],
      providers: [RainyService],
    }).compile();

    rainyController = app.get<RainyController>(RainyController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(rainyController.getHello()).toBe('Hello World!');
    });
  });
});
