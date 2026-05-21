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
import { CreateStorageLocationDto, UpdateStorageLocationDto, DeleteStorageLocationDto } from '../dtos/all-dto';
import { IsArray, IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from 'graphql-type-json';
import { plainToInstance } from 'class-transformer';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';

@Check('chk_storage_location_max_units_positive', '"maxUnits" > 0')
@ChildEntity('storagelocation')
@ObjectType()
export class StorageLocation extends BaseEntity {
  @ApiProperty({
    type: String,
    nullable: false,
    description: "Nombre de la instancia de StorageLocation",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Nombre de la instancia de StorageLocation", nullable: false })
  @Column({ type: 'varchar', length: 100, nullable: false, comment: 'Este es un campo para nombrar la instancia StorageLocation' })
  private name!: string;

  @ApiProperty({
    type: String,
    description: "Descripción de la instancia de StorageLocation",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Descripción de la instancia de StorageLocation", nullable: false })
  @Column({ type: 'varchar', length: 255, nullable: false, default: "Sin descripción", comment: 'Este es un campo para describir la instancia StorageLocation' })
  private description!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código de ubicación',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código de ubicación', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 80, unique: true, comment: 'Código de ubicación' })
  locationCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Almacén dueño de la ubicación',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Almacén dueño de la ubicación', nullable: false })
  @Column({ type: 'uuid', nullable: false, comment: 'Almacén dueño de la ubicación' })
  warehouseId!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Zona interna del almacén',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Zona interna del almacén', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 60, comment: 'Zona interna del almacén' })
  zoneCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Tipo de ubicación',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Tipo de ubicación', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 40, comment: 'Tipo de ubicación' })
  locationType!: string;

  @ApiProperty({
    type: () => Number,
    nullable: false,
    description: 'Capacidad máxima en unidades',
  })
  @IsInt()
  @IsNotEmpty()
  @Field(() => Int, { description: 'Capacidad máxima en unidades', nullable: false })
  @Column({ type: 'int', nullable: false, comment: 'Capacidad máxima en unidades' })
  maxUnits!: number;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos de ubicación',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos de ubicación', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Metadatos de ubicación' })
  metadata?: Record<string, any> = {};

  @ApiProperty({
    type: () => Warehouse,
    nullable: false,
    description: 'Relación con Warehouse',
  })
  @Field(() => Warehouse, { nullable: false })
  @ManyToOne(() => Warehouse, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouseId' })
  warehouse!: Warehouse;

  protected executeDslLifecycle(): void {
    // No se definieron business-rules en el DSL.
  }

  // Relación con BaseEntity (opcional, si aplica)
  // @OneToOne(() => BaseEntity, { cascade: true })
  // @JoinColumn()
  // base!: BaseEntity;

  constructor() {
    super();
    this.type = 'storagelocation';
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
  static fromDto(dto: CreateStorageLocationDto): StorageLocation;
  static fromDto(dto: UpdateStorageLocationDto): StorageLocation;
  static fromDto(dto: DeleteStorageLocationDto): StorageLocation;
  static fromDto(dto: any): StorageLocation {
    // plainToInstance soporta todos los DTOs
    return plainToInstance(StorageLocation, dto);
  }
}
