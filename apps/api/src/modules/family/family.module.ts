import { Module } from '@nestjs/common';
import { FamilyController } from './family.controller';
import { FamilyService } from './family.service';
import { WardController } from './ward.controller';
import { WardService } from './ward.service';

@Module({
  controllers: [FamilyController, WardController],
  providers: [FamilyService, WardService],
  exports: [FamilyService, WardService],
})
export class FamilyModule {}