/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 * Contacto: softwarentalla@gmail.com
 * CEOs: 
 *       Persy Morell Guerra      Email: pmorellpersi@gmail.com  Phone : +53-5336-4654 Linkedin: https://www.linkedin.com/in/persy-morell-guerra-288943357/
 *       Dailyn García Domínguez  Email: dailyngd@gmail.com      Phone : +53-5432-0312 Linkedin: https://www.linkedin.com/in/dailyn-dominguez-3150799b/
 *
 * CTO: Persy Morell Guerra
 * COO: Dailyn García Domínguez and Persy Morell Guerra
 * CFO: Dailyn García Domínguez and Persy Morell Guerra
 *
 * Repositories: 
 *               https://github.com/SoftwareEnTalla 
 *
 *               https://github.com/apokaliptolesamale?tab=repositories
 *
 *
 * Social Networks:
 *
 *              https://x.com/SoftwarEnTalla
 *
 *              https://www.facebook.com/profile.php?id=61572625716568
 *
 *              https://www.instagram.com/softwarentalla/
 *              
 *
 *
 */


import { Module } from "@nestjs/common";
import { WarehouseCommandController } from "../controllers/warehousecommand.controller";
import { WarehouseQueryController } from "../controllers/warehousequery.controller";
import { WarehouseCommandService } from "../services/warehousecommand.service";
import { WarehouseQueryService } from "../services/warehousequery.service";

import { WarehouseCommandRepository } from "../repositories/warehousecommand.repository";
import { WarehouseQueryRepository } from "../repositories/warehousequery.repository";
import { WarehouseRepository } from "../repositories/warehouse.repository";
import { WarehouseResolver } from "../graphql/warehouse.resolver";
import { WarehouseAuthGuard } from "../guards/warehouseauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Warehouse } from "../entities/warehouse.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateWarehouseHandler } from "../commands/handlers/createwarehouse.handler";
import { UpdateWarehouseHandler } from "../commands/handlers/updatewarehouse.handler";
import { DeleteWarehouseHandler } from "../commands/handlers/deletewarehouse.handler";
import { GetWarehouseByIdHandler } from "../queries/handlers/getwarehousebyid.handler";
import { GetWarehouseByFieldHandler } from "../queries/handlers/getwarehousebyfield.handler";
import { GetAllWarehouseHandler } from "../queries/handlers/getallwarehouse.handler";
import { WarehouseCrudSaga } from "../sagas/warehouse-crud.saga";

import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { WarehouseInterceptor } from "../interceptors/warehouse.interceptor";
import { WarehouseLoggingInterceptor } from "../interceptors/warehouse.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";
import { StorageLocationModule } from "../../storage-location/modules/storagelocation.module";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    StorageLocationModule,
    TypeOrmModule.forFeature([BaseEntity, Warehouse]), // Incluir BaseEntity para herencia
    CacheModule.registerAsync({
      useFactory: async () => {
        try {
          const store = await redisStore({
            socket: { host: process.env.REDIS_HOST || "data-center-redis", port: parseInt(process.env.REDIS_PORT || "6379", 10) },
            ttl: parseInt(process.env.REDIS_TTL || "60", 10),
          });
          return { store: store as any, isGlobal: true };
        } catch {
          return { isGlobal: true }; // fallback in-memory
        }
      },
    }),
  ],
  controllers: [WarehouseCommandController, WarehouseQueryController],
  providers: [
    //Services
    EventStoreService,
    WarehouseQueryService,
    WarehouseCommandService,
  
    //Repositories
    WarehouseCommandRepository,
    WarehouseQueryRepository,
    WarehouseRepository,      
    //Resolvers
    WarehouseResolver,
    //Guards
    WarehouseAuthGuard,
    //Interceptors
    WarehouseInterceptor,
    WarehouseLoggingInterceptor,
    //CQRS Handlers
    CreateWarehouseHandler,
    UpdateWarehouseHandler,
    DeleteWarehouseHandler,
    GetWarehouseByIdHandler,
    GetWarehouseByFieldHandler,
    GetAllWarehouseHandler,
    WarehouseCrudSaga,
    //Configurations
    {
      provide: 'EVENT_SOURCING_CONFIG',
      useFactory: () => ({
        enabled: process.env.EVENT_SOURCING_ENABLED !== 'false',
        kafkaEnabled: process.env.KAFKA_ENABLED !== 'false',
        eventStoreEnabled: process.env.EVENT_STORE_ENABLED === 'true',
        publishEvents: true,
        useProjections: true,
        topics: EVENT_TOPICS
      })
    },
  ],
  exports: [
    CqrsModule,
    KafkaModule,
    //Services
    EventStoreService,
    WarehouseQueryService,
    WarehouseCommandService,
  
    //Repositories
    WarehouseCommandRepository,
    WarehouseQueryRepository,
    WarehouseRepository,      
    //Resolvers
    WarehouseResolver,
    //Guards
    WarehouseAuthGuard,
    //Interceptors
    WarehouseInterceptor,
    WarehouseLoggingInterceptor,
  ],
})
export class WarehouseModule {}

