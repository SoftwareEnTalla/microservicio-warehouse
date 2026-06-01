import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageLocationModule } from '../storage-location/modules/storagelocation.module';
import { WarehouseModule } from '../warehouse/modules/warehouse.module';
import { WarehouseLifecycleController } from './warehouse-lifecycle.controller';
import { WarehouseLifecycleService } from './warehouse-lifecycle.service';

@Module({
  imports: [ConfigModule, WarehouseModule, StorageLocationModule],
  controllers: [WarehouseLifecycleController],
  providers: [WarehouseLifecycleService],
  exports: [WarehouseLifecycleService],
})
export class WarehouseLifecycleModule {}