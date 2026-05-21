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


import { Injectable, Logger } from '@nestjs/common';
import { Saga, CommandBus, EventBus, ofType } from '@nestjs/cqrs';
import { Observable, map, tap } from 'rxjs';
import {
  WarehouseCreatedEvent,
  WarehouseUpdatedEvent,
  WarehouseDeletedEvent,
  WarehouseCapacityUpdatedEvent,
} from '../events/exporting.event';
import {
  SagaWarehouseFailedEvent
} from '../events/warehouse-failed.event';
import {
  CreateWarehouseCommand,
  UpdateWarehouseCommand,
  DeleteWarehouseCommand
} from '../commands/exporting.command';

//Logger - Codetrace
import { LogExecutionTime } from 'src/common/logger/loggers.functions';
import { LoggerClient } from 'src/common/logger/logger.client';
import { logger } from '@core/logs/logger';

@Injectable()
export class WarehouseCrudSaga {
  private readonly logger = new Logger(WarehouseCrudSaga.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus
  ) {}

  // Reacción a evento de creación
  @Saga()
  onWarehouseCreated = ($events: Observable<WarehouseCreatedEvent>) => {
    return $events.pipe(
      ofType(WarehouseCreatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para creación de Warehouse: ${event.aggregateId}`);
        void this.handleWarehouseCreated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de actualización
  @Saga()
  onWarehouseUpdated = ($events: Observable<WarehouseUpdatedEvent>) => {
    return $events.pipe(
      ofType(WarehouseUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para actualización de Warehouse: ${event.aggregateId}`);
        void this.handleWarehouseUpdated(event);
      }),
      map(() => null)
    );
  };

  // Reacción a evento de eliminación
  @Saga()
  onWarehouseDeleted = ($events: Observable<WarehouseDeletedEvent>) => {
    return $events.pipe(
      ofType(WarehouseDeletedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para eliminación de Warehouse: ${event.aggregateId}`);
        void this.handleWarehouseDeleted(event);
      }),
      map(() => null)
    );
  };

  @Saga()
  onWarehouseCapacityUpdated = ($events: Observable<WarehouseCapacityUpdatedEvent>) => {
    return $events.pipe(
      ofType(WarehouseCapacityUpdatedEvent),
      tap(event => {
        this.logger.log(`Saga iniciada para evento de dominio WarehouseCapacityUpdated: ${event.aggregateId}`);
      }),
      map(() => null)
    );
  };

  @LogExecutionTime({
    layer: 'saga',
    callback: async (logData, client) => {
      try {
        logger.info('Codetrace saga event:', [logData, client]);
        return await client.send(logData);
      } catch (error) {
        logger.info('Error enviando traza de saga:', logData);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(WarehouseCrudSaga.name)
      .get(WarehouseCrudSaga.name),
  })
  private async handleWarehouseCreated(event: WarehouseCreatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga Warehouse Created completada: ${event.aggregateId}`);
      // Lógica post-creación (ej: enviar notificación, ejecutar comandos adicionales)
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  @LogExecutionTime({
    layer: 'saga',
    callback: async (logData, client) => {
      try {
        logger.info('Codetrace saga event:', [logData, client]);
        return await client.send(logData);
      } catch (error) {
        logger.info('Error enviando traza de saga:', logData);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(WarehouseCrudSaga.name)
      .get(WarehouseCrudSaga.name),
  })
  private async handleWarehouseUpdated(event: WarehouseUpdatedEvent): Promise<void> {
    try {
      this.logger.log(`Saga Warehouse Updated completada: ${event.aggregateId}`);
      // Lógica post-actualización (ej: actualizar caché)
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  @LogExecutionTime({
    layer: 'saga',
    callback: async (logData, client) => {
      try {
        logger.info('Codetrace saga event:', [logData, client]);
        return await client.send(logData);
      } catch (error) {
        logger.info('Error enviando traza de saga:', logData);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(WarehouseCrudSaga.name)
      .get(WarehouseCrudSaga.name),
  })
  private async handleWarehouseDeleted(event: WarehouseDeletedEvent): Promise<void> {
    try {
      this.logger.log(`Saga Warehouse Deleted completada: ${event.aggregateId}`);
      // Lógica post-eliminación (ej: limpiar relaciones)
    } catch (error: any) {
      this.handleSagaError(error, event);
    }
  }

  // Método para manejo de errores en sagas
  private handleSagaError(error: Error, event: any) {
    this.logger.error(`Error en saga para evento ${event.constructor.name}: ${error.message}`);
    this.eventBus.publish(new SagaWarehouseFailedEvent( error,event));
  }
}
