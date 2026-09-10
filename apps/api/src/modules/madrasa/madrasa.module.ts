import { Module } from '@nestjs/common';
import { MadrasaService } from './madrasa.service';
import { MadrasaController } from './madrasa.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MadrasaController],
  providers: [MadrasaService],
  exports: [MadrasaService],
})
export class MadrasaModule {}
