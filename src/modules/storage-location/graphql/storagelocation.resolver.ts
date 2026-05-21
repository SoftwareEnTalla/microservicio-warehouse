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


import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";

//Definición de entidades
import { StorageLocation } from "../entities/storage-location.entity";

//Definición de comandos
import {
  CreateStorageLocationCommand,
  UpdateStorageLocationCommand,
  DeleteStorageLocationCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { StorageLocationQueryService } from "../services/storagelocationquery.service";


import { StorageLocationResponse, StorageLocationsResponse } from "../types/storagelocation.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateStorageLocationDto, 
CreateOrUpdateStorageLocationDto, 
StorageLocationValueInput, 
StorageLocationDto, 
CreateStorageLocationDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => StorageLocation)
export class StorageLocationResolver {

   //Constructor del resolver de StorageLocation
  constructor(
    private readonly service: StorageLocationQueryService,
    private readonly commandBus: CommandBus
  ) {}

  @LogExecutionTime({
    layer: 'resolver',
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(StorageLocationResolver.name)

      .get(StorageLocationResolver.name),
    })
  // Mutaciones
  @Mutation(() => StorageLocationResponse<StorageLocation>)
  async createStorageLocation(
    @Args("input", { type: () => CreateStorageLocationDto }) input: CreateStorageLocationDto
  ): Promise<StorageLocationResponse<StorageLocation>> {
    return this.commandBus.execute(new CreateStorageLocationCommand(input));
  }


@LogExecutionTime({
    layer: 'resolver',
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(StorageLocationResolver.name)

      .get(StorageLocationResolver.name),
    })
  @Mutation(() => StorageLocationResponse<StorageLocation>)
  async updateStorageLocation(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateStorageLocationDto
  ): Promise<StorageLocationResponse<StorageLocation>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateStorageLocationCommand(payLoad, {
        instance: payLoad,
        metadata: {
          initiatedBy: payLoad.createdBy || 'system',
          correlationId: payLoad.id,
        },
      })
    );
  }


@LogExecutionTime({
    layer: 'resolver',
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(StorageLocationResolver.name)

      .get(StorageLocationResolver.name),
    })
  @Mutation(() => StorageLocationResponse<StorageLocation>)
  async createOrUpdateStorageLocation(
    @Args("data", { type: () => CreateOrUpdateStorageLocationDto })
    data: CreateOrUpdateStorageLocationDto
  ): Promise<StorageLocationResponse<StorageLocation>> {
    if (data.id) {
      const existingStorageLocation = await this.service.findById(data.id);
      if (existingStorageLocation) {
        return this.commandBus.execute(
          new UpdateStorageLocationCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateStorageLocationDto | UpdateStorageLocationDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateStorageLocationCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateStorageLocationDto | UpdateStorageLocationDto).createdBy ||
            'system',
          correlationId: data.id || uuidv4(),
        },
      })
    );
  }


@LogExecutionTime({
    layer: 'resolver',
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(StorageLocationResolver.name)

      .get(StorageLocationResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteStorageLocation(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteStorageLocationCommand(id));
  }


@LogExecutionTime({
    layer: 'resolver',
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(StorageLocationResolver.name)

      .get(StorageLocationResolver.name),
    })
  // Queries
  @Query(() => StorageLocationsResponse<StorageLocation>)
  async storagelocations(
    options?: FindManyOptions<StorageLocation>,
    paginationArgs?: PaginationArgs
  ): Promise<StorageLocationsResponse<StorageLocation>> {
    return this.service.findAll(options, paginationArgs);
  }


@LogExecutionTime({
    layer: 'resolver',
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(StorageLocationResolver.name)

      .get(StorageLocationResolver.name),
    })
  @Query(() => StorageLocationsResponse<StorageLocation>)
  async storagelocation(
    @Args("id", { type: () => String }) id: string
  ): Promise<StorageLocationResponse<StorageLocation>> {
    return this.service.findById(id);
  }


@LogExecutionTime({
    layer: 'resolver',
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(StorageLocationResolver.name)

      .get(StorageLocationResolver.name),
    })
  @Query(() => StorageLocationsResponse<StorageLocation>)
  async storagelocationsByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => StorageLocationValueInput }) value: StorageLocationValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<StorageLocationsResponse<StorageLocation>> {
    return this.service.findByField(
      field,
      value,
      fromObject.call(PaginationArgs, { page: page, limit: limit })
    );
  }


@LogExecutionTime({
    layer: 'resolver',
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(StorageLocationResolver.name)

      .get(StorageLocationResolver.name),
    })
  @Query(() => StorageLocationsResponse<StorageLocation>)
  async storagelocationsWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<StorageLocationsResponse<StorageLocation>> {
    const paginationArgs = fromObject.call(PaginationArgs, {
      page: page,
      limit: limit,
    });
    return this.service.findWithPagination({}, paginationArgs);
  }


@LogExecutionTime({
    layer: 'resolver',
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(StorageLocationResolver.name)

      .get(StorageLocationResolver.name),
    })
  @Query(() => Number)
  async totalStorageLocations(): Promise<number> {
    return this.service.count();
  }


@LogExecutionTime({
    layer: 'resolver',
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(StorageLocationResolver.name)

      .get(StorageLocationResolver.name),
    })
  @Query(() => StorageLocationsResponse<StorageLocation>)
  async searchStorageLocations(
    @Args("where", { type: () => StorageLocationDto, nullable: false })
    where: Record<string, any>
  ): Promise<StorageLocationsResponse<StorageLocation>> {
    const storagelocations = await this.service.findAndCount(where);
    return storagelocations;
  }


@LogExecutionTime({
    layer: 'resolver',
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(StorageLocationResolver.name)

      .get(StorageLocationResolver.name),
    })
  @Query(() => StorageLocationResponse<StorageLocation>, { nullable: true })
  async findOneStorageLocation(
    @Args("where", { type: () => StorageLocationDto, nullable: false })
    where: Record<string, any>
  ): Promise<StorageLocationResponse<StorageLocation>> {
    return this.service.findOne(where);
  }


@LogExecutionTime({
    layer: 'resolver',
    callback: async (logData, client) => {
      // Puedes usar el cliente proporcionado o ignorarlo y usar otro
      try{
        logger.info('Información del cliente y datos a enviar:',[logData,client]);
        return await client.send(logData);
      }
      catch(error){
        logger.info('Ha ocurrido un error al enviar la traza de log: ', logData);
        logger.info('ERROR-LOG: ', error);
        throw error;
      }
    },
    client: LoggerClient.getInstance()
      .registerClient(StorageLocationResolver.name)

      .get(StorageLocationResolver.name),
    })
  @Query(() => StorageLocationResponse<StorageLocation>)
  async findOneStorageLocationOrFail(
    @Args("where", { type: () => StorageLocationDto, nullable: false })
    where: Record<string, any>
  ): Promise<StorageLocationResponse<StorageLocation> | Error> {
    return this.service.findOneOrFail(where);
  }
}

