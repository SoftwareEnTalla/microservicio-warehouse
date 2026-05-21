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

import { Column, Entity, OneToOne, JoinColumn, ChildEntity, ManyToOne, OneToMany, ManyToMany, JoinTable, Index, Check, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { CreateWarehouseDto, UpdateWarehouseDto, DeleteWarehouseDto } from '../dtos/all-dto';
import { IsArray, IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from 'graphql-type-json';
import { plainToInstance } from 'class-transformer';
import { StorageLocation } from '../../storage-location/entities/storage-location.entity';

@Index('idx_warehouse_code', ['warehouseCode'], { unique: true })
@Check('chk_warehouse_capacity_positive', '"capacityUnits" > 0')
@ChildEntity('warehouse')
@ObjectType()
export class Warehouse extends BaseEntity {
  @ApiProperty({
    type: String,
    nullable: false,
    description: "Nombre de la instancia de Warehouse",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Nombre de la instancia de Warehouse", nullable: false })
  @Column({ type: 'varchar', length: 100, nullable: false, comment: 'Este es un campo para nombrar la instancia Warehouse' })
  private name!: string;

  @ApiProperty({
    type: String,
    description: "Descripción de la instancia de Warehouse",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Descripción de la instancia de Warehouse", nullable: false })
  @Column({ type: 'varchar', length: 255, nullable: false, default: "Sin descripción", comment: 'Este es un campo para describir la instancia Warehouse' })
  private description!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código único del almacén',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código único del almacén', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 80, unique: true, comment: 'Código único del almacén' })
  warehouseCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Organización responsable del almacén',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Organización responsable del almacén', nullable: false })
  @Column({ type: 'uuid', nullable: false, comment: 'Organización responsable del almacén' })
  organizationId!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado operativo del almacén',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado operativo del almacén', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 40, comment: 'Estado operativo del almacén' })
  status!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Zona horaria del almacén',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Zona horaria del almacén', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 80, comment: 'Zona horaria del almacén' })
  timezone!: string;

  @ApiProperty({
    type: () => Number,
    nullable: false,
    description: 'Capacidad operativa total en unidades base',
  })
  @IsInt()
  @IsNotEmpty()
  @Field(() => Int, { description: 'Capacidad operativa total en unidades base', nullable: false })
  @Column({ type: 'int', nullable: false, comment: 'Capacidad operativa total en unidades base' })
  capacityUnits!: number;

  @ApiProperty({
    type: () => Number,
    nullable: false,
    description: 'Número de muelles operativos',
  })
  @IsInt()
  @IsNotEmpty()
  @Field(() => Int, { description: 'Número de muelles operativos', nullable: false })
  @Column({ type: 'int', nullable: false, comment: 'Número de muelles operativos' })
  dockCount!: number;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Estrategia de slotting',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Estrategia de slotting', nullable: true })
  @Column({ type: 'varchar', nullable: true, length: 80, comment: 'Estrategia de slotting' })
  slottingStrategy?: string = '';

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos operativos del almacén',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos operativos del almacén', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Metadatos operativos del almacén' })
  metadata?: Record<string, any> = {};

  @ApiProperty({
    type: () => [StorageLocation],
    nullable: true,
    description: 'Ubicaciones físicas del almacén',
  })
  @Field(() => [StorageLocation], { nullable: true })
  @OneToMany(() => StorageLocation, (storageLocation) => storageLocation.warehouse)
  storageLocations?: StorageLocation[];

  protected executeDslLifecycle(): void {
    // No se definieron business-rules en el DSL.
  }

  // Relación con BaseEntity (opcional, si aplica)
  // @OneToOne(() => BaseEntity, { cascade: true })
  // @JoinColumn()
  // base!: BaseEntity;

  constructor() {
    super();
    this.type = 'warehouse';
  }

  // Getters y Setters
  get getName(): string {
    return this.name;
  }
  set setName(value: string) {
    this.name = value;
  }
  get getDescription(): string {
    return this.description;
  }

  // Métodos abstractos implementados
  async create(data: any): Promise<BaseEntity> {
    Object.assign(this, data);
    this.executeDslLifecycle();
    this.modificationDate = new Date();
    return this;
  }
  async update(data: any): Promise<BaseEntity> {
    Object.assign(this, data);
    this.executeDslLifecycle();
    this.modificationDate = new Date();
    return this;
  }
  async delete(id: string): Promise<BaseEntity> {
    this.id = id;
    return this;
  }

  // Método estático para convertir DTOs a entidad con sobrecarga
  static fromDto(dto: CreateWarehouseDto): Warehouse;
  static fromDto(dto: UpdateWarehouseDto): Warehouse;
  static fromDto(dto: DeleteWarehouseDto): Warehouse;
  static fromDto(dto: any): Warehouse {
    // plainToInstance soporta todos los DTOs
    return plainToInstance(Warehouse, dto);
  }
}
