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

import { InputType, Field, Float, Int, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
  IsUUID,
  ValidateNested,
} from 'class-validator';




@InputType()
export class BaseWarehouseDto {
  @ApiProperty({
    type: () => String,
    description: 'Nombre de instancia CreateWarehouse',
    example: 'Nombre de instancia CreateWarehouse',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  name: string = '';

  // Propiedades predeterminadas de la clase CreateWarehouseDto según especificación del sistema

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de creación de la instancia (CreateWarehouse).',
    example: 'Fecha de creación de la instancia (CreateWarehouse).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  creationDate: Date = new Date(); // Fecha de creación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de actualización de la instancia (CreateWarehouse).',
    example: 'Fecha de actualización de la instancia (CreateWarehouse).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  modificationDate: Date = new Date(); // Fecha de modificación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => String,
    description:
      'Usuario que realiza la creación de la instancia (CreateWarehouse).',
    example:
      'Usuario que realiza la creación de la instancia (CreateWarehouse).',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  createdBy?: string; // Usuario que crea el objeto

  @ApiProperty({
    type: () => Boolean,
    description: 'Estado de activación de la instancia (CreateWarehouse).',
    example: 'Estado de activación de la instancia (CreateWarehouse).',
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { nullable: false })
  isActive: boolean = false; // Por defecto, el objeto no está activo

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código único del almacén',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código único del almacén', nullable: false })
  warehouseCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Organización responsable del almacén',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Organización responsable del almacén', nullable: false })
  organizationId!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado operativo del almacén',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado operativo del almacén', nullable: false })
  status!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Zona horaria del almacén',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Zona horaria del almacén', nullable: false })
  timezone!: string;

  @ApiProperty({
    type: () => Number,
    nullable: false,
    description: 'Capacidad operativa total en unidades base',
  })
  @IsInt()
  @IsNotEmpty()
  @Field(() => Int, { description: 'Capacidad operativa total en unidades base', nullable: false })
  capacityUnits!: number;

  @ApiProperty({
    type: () => Number,
    nullable: false,
    description: 'Número de muelles operativos',
  })
  @IsInt()
  @IsNotEmpty()
  @Field(() => Int, { description: 'Número de muelles operativos', nullable: false })
  dockCount!: number;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Estrategia de slotting',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Estrategia de slotting', nullable: true })
  slottingStrategy?: string = '';

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos operativos del almacén',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos operativos del almacén', nullable: true })
  metadata?: Record<string, any> = {};

  // Constructor
  constructor(partial: Partial<BaseWarehouseDto>) {
    Object.assign(this, partial);
  }
}




@InputType()
export class WarehouseDto extends BaseWarehouseDto {
  // Propiedades específicas de la clase WarehouseDto en cuestión

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Identificador único de la instancia',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<WarehouseDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<WarehouseDto>): WarehouseDto {
    const instance = new WarehouseDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 




@InputType()
export class WarehouseValueInput {
  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Campo de filtro',
  })
  @Field({ nullable: false })
  fieldName: string = 'id';

  @ApiProperty({
    type: () => WarehouseDto,
    nullable: false,
    description: 'Valor del filtro',
  })
  @Field(() => WarehouseDto, { nullable: false })
  fieldValue: any; // Permite cualquier tipo
} 




@ObjectType()
export class WarehouseOutPutDto extends BaseWarehouseDto {
  // Propiedades específicas de la clase WarehouseOutPutDto en cuestión

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Identificador único de la instancia',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<WarehouseOutPutDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<WarehouseOutPutDto>): WarehouseOutPutDto {
    const instance = new WarehouseOutPutDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateWarehouseDto extends BaseWarehouseDto {
  // Propiedades específicas de la clase CreateWarehouseDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a crear',
    example:
      'Se proporciona un identificador de CreateWarehouse a crear \(opcional\) ',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<CreateWarehouseDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CreateWarehouseDto>): CreateWarehouseDto {
    const instance = new CreateWarehouseDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateOrUpdateWarehouseDto {
  @ApiProperty({
    type: () => String,
    description: 'Identificador',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  @ApiProperty({
    type: () => CreateWarehouseDto,
    description: 'Instancia CreateWarehouse o UpdateWarehouse',
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Field(() => CreateWarehouseDto, { nullable: true })
  input?: CreateWarehouseDto | UpdateWarehouseDto; // Asegúrate de que esto esté correcto
}



@InputType()
export class DeleteWarehouseDto {
  // Propiedades específicas de la clase DeleteWarehouseDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a eliminar',
    example: 'Se proporciona un identificador de DeleteWarehouse a eliminar',
    default: '',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id: string = '';

  @ApiProperty({
    type: () => String,
    description: 'Lista de identificadores de instancias a eliminar',
    example:
      'Se proporciona una lista de identificadores de DeleteWarehouse a eliminar',
    default: [],
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  ids?: string[];
}



@InputType()
export class UpdateWarehouseDto extends BaseWarehouseDto {
  // Propiedades específicas de la clase UpdateWarehouseDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a actualizar',
    example: 'Se proporciona un identificador de UpdateWarehouse a actualizar',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id!: string;

  // Constructor
  constructor(partial: Partial<UpdateWarehouseDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<UpdateWarehouseDto>): UpdateWarehouseDto {
    const instance = new UpdateWarehouseDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 



