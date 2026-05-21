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
import { Warehouse } from "../entities/warehouse.entity";

//Definición de comandos
import {
  CreateWarehouseCommand,
  UpdateWarehouseCommand,
  DeleteWarehouseCommand,
} from "../commands/exporting.command";

import { CommandBus } from "@nestjs/cqrs";
import { WarehouseQueryService } from "../services/warehousequery.service";


import { WarehouseResponse, WarehousesResponse } from "../types/warehouse.types";
import { FindManyOptions } from "typeorm";
import { PaginationArgs } from "src/common/dto/args/pagination.args";
import { fromObject } from "src/utils/functions";

//Logger
import { LogExecutionTime } from "src/common/logger/loggers.functions";
import { LoggerClient } from "src/common/logger/logger.client";
import { logger } from '@core/logs/logger';

import { v4 as uuidv4 } from "uuid";

//Definición de tdos
import { UpdateWarehouseDto, 
CreateOrUpdateWarehouseDto, 
WarehouseValueInput, 
WarehouseDto, 
CreateWarehouseDto } from "../dtos/all-dto";
 

//@UseGuards(JwtGraphQlAuthGuard)
@Resolver(() => Warehouse)
export class WarehouseResolver {

   //Constructor del resolver de Warehouse
  constructor(
    private readonly service: WarehouseQueryService,
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
      .registerClient(WarehouseResolver.name)

      .get(WarehouseResolver.name),
    })
  // Mutaciones
  @Mutation(() => WarehouseResponse<Warehouse>)
  async createWarehouse(
    @Args("input", { type: () => CreateWarehouseDto }) input: CreateWarehouseDto
  ): Promise<WarehouseResponse<Warehouse>> {
    return this.commandBus.execute(new CreateWarehouseCommand(input));
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
      .registerClient(WarehouseResolver.name)

      .get(WarehouseResolver.name),
    })
  @Mutation(() => WarehouseResponse<Warehouse>)
  async updateWarehouse(
    @Args("id", { type: () => String }) id: string,
    @Args("input") input: UpdateWarehouseDto
  ): Promise<WarehouseResponse<Warehouse>> {
    const payLoad = input;
    return this.commandBus.execute(
      new UpdateWarehouseCommand(payLoad, {
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
      .registerClient(WarehouseResolver.name)

      .get(WarehouseResolver.name),
    })
  @Mutation(() => WarehouseResponse<Warehouse>)
  async createOrUpdateWarehouse(
    @Args("data", { type: () => CreateOrUpdateWarehouseDto })
    data: CreateOrUpdateWarehouseDto
  ): Promise<WarehouseResponse<Warehouse>> {
    if (data.id) {
      const existingWarehouse = await this.service.findById(data.id);
      if (existingWarehouse) {
        return this.commandBus.execute(
          new UpdateWarehouseCommand(data, {
            instance: data,
            metadata: {
              initiatedBy:
                (data.input as CreateWarehouseDto | UpdateWarehouseDto).createdBy ||
                'system',
              correlationId: data.id,
            },
          })
        );
      }
    }
    return this.commandBus.execute(
      new CreateWarehouseCommand(data, {
        instance: data,
        metadata: {
          initiatedBy:
            (data.input as CreateWarehouseDto | UpdateWarehouseDto).createdBy ||
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
      .registerClient(WarehouseResolver.name)

      .get(WarehouseResolver.name),
    })
  @Mutation(() => Boolean)
  async deleteWarehouse(
    @Args("id", { type: () => String }) id: string
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteWarehouseCommand(id));
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
      .registerClient(WarehouseResolver.name)

      .get(WarehouseResolver.name),
    })
  // Queries
  @Query(() => WarehousesResponse<Warehouse>)
  async warehouses(
    options?: FindManyOptions<Warehouse>,
    paginationArgs?: PaginationArgs
  ): Promise<WarehousesResponse<Warehouse>> {
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
      .registerClient(WarehouseResolver.name)

      .get(WarehouseResolver.name),
    })
  @Query(() => WarehousesResponse<Warehouse>)
  async warehouse(
    @Args("id", { type: () => String }) id: string
  ): Promise<WarehouseResponse<Warehouse>> {
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
      .registerClient(WarehouseResolver.name)

      .get(WarehouseResolver.name),
    })
  @Query(() => WarehousesResponse<Warehouse>)
  async warehousesByField(
    @Args("field", { type: () => String }) field: string,
    @Args("value", { type: () => WarehouseValueInput }) value: WarehouseValueInput,
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<WarehousesResponse<Warehouse>> {
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
      .registerClient(WarehouseResolver.name)

      .get(WarehouseResolver.name),
    })
  @Query(() => WarehousesResponse<Warehouse>)
  async warehousesWithPagination(
    @Args("page", { type: () => Number, defaultValue: 1 }) page: number,
    @Args("limit", { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<WarehousesResponse<Warehouse>> {
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
      .registerClient(WarehouseResolver.name)

      .get(WarehouseResolver.name),
    })
  @Query(() => Number)
  async totalWarehouses(): Promise<number> {
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
      .registerClient(WarehouseResolver.name)

      .get(WarehouseResolver.name),
    })
  @Query(() => WarehousesResponse<Warehouse>)
  async searchWarehouses(
    @Args("where", { type: () => WarehouseDto, nullable: false })
    where: Record<string, any>
  ): Promise<WarehousesResponse<Warehouse>> {
    const warehouses = await this.service.findAndCount(where);
    return warehouses;
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
      .registerClient(WarehouseResolver.name)

      .get(WarehouseResolver.name),
    })
  @Query(() => WarehouseResponse<Warehouse>, { nullable: true })
  async findOneWarehouse(
    @Args("where", { type: () => WarehouseDto, nullable: false })
    where: Record<string, any>
  ): Promise<WarehouseResponse<Warehouse>> {
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
      .registerClient(WarehouseResolver.name)

      .get(WarehouseResolver.name),
    })
  @Query(() => WarehouseResponse<Warehouse>)
  async findOneWarehouseOrFail(
    @Args("where", { type: () => WarehouseDto, nullable: false })
    where: Record<string, any>
  ): Promise<WarehouseResponse<Warehouse> | Error> {
    return this.service.findOneOrFail(where);
  }
}

