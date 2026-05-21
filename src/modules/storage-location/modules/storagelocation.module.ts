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
import { StorageLocationCommandController } from "../controllers/storagelocationcommand.controller";
import { StorageLocationQueryController } from "../controllers/storagelocationquery.controller";
import { StorageLocationCommandService } from "../services/storagelocationcommand.service";
import { StorageLocationQueryService } from "../services/storagelocationquery.service";

import { StorageLocationCommandRepository } from "../repositories/storagelocationcommand.repository";
import { StorageLocationQueryRepository } from "../repositories/storagelocationquery.repository";
import { StorageLocationRepository } from "../repositories/storagelocation.repository";
import { StorageLocationResolver } from "../graphql/storagelocation.resolver";
import { StorageLocationAuthGuard } from "../guards/storagelocationauthguard.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StorageLocation } from "../entities/storage-location.entity";
import { BaseEntity } from "../entities/base.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "./kafka.module";
import { CreateStorageLocationHandler } from "../commands/handlers/createstoragelocation.handler";
import { UpdateStorageLocationHandler } from "../commands/handlers/updatestoragelocation.handler";
import { DeleteStorageLocationHandler } from "../commands/handlers/deletestoragelocation.handler";
import { GetStorageLocationByIdHandler } from "../queries/handlers/getstoragelocationbyid.handler";
import { GetStorageLocationByFieldHandler } from "../queries/handlers/getstoragelocationbyfield.handler";
import { GetAllStorageLocationHandler } from "../queries/handlers/getallstoragelocation.handler";
import { StorageLocationCrudSaga } from "../sagas/storagelocation-crud.saga";

import { EVENT_TOPICS } from "../events/event-registry";

//Interceptors
import { StorageLocationInterceptor } from "../interceptors/storagelocation.interceptor";
import { StorageLocationLoggingInterceptor } from "../interceptors/storagelocation.logging.interceptor";

//Event-Sourcing dependencies
import { EventStoreService } from "../shared/event-store/event-store.service";

@Module({
  imports: [
    CqrsModule,
    KafkaModule,
    TypeOrmModule.forFeature([BaseEntity, StorageLocation]), // Incluir BaseEntity para herencia
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
  controllers: [StorageLocationCommandController, StorageLocationQueryController],
  providers: [
    //Services
    EventStoreService,
    StorageLocationQueryService,
    StorageLocationCommandService,
  
    //Repositories
    StorageLocationCommandRepository,
    StorageLocationQueryRepository,
    StorageLocationRepository,      
    //Resolvers
    StorageLocationResolver,
    //Guards
    StorageLocationAuthGuard,
    //Interceptors
    StorageLocationInterceptor,
    StorageLocationLoggingInterceptor,
    //CQRS Handlers
    CreateStorageLocationHandler,
    UpdateStorageLocationHandler,
    DeleteStorageLocationHandler,
    GetStorageLocationByIdHandler,
    GetStorageLocationByFieldHandler,
    GetAllStorageLocationHandler,
    StorageLocationCrudSaga,
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
    StorageLocationQueryService,
    StorageLocationCommandService,
  
    //Repositories
    StorageLocationCommandRepository,
    StorageLocationQueryRepository,
    StorageLocationRepository,      
    //Resolvers
    StorageLocationResolver,
    //Guards
    StorageLocationAuthGuard,
    //Interceptors
    StorageLocationInterceptor,
    StorageLocationLoggingInterceptor,
  ],
})
export class StorageLocationModule {}

