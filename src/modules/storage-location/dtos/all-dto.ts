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
export class BaseStorageLocationDto {
  @ApiProperty({
    type: () => String,
    description: 'Nombre de instancia CreateStorageLocation',
    example: 'Nombre de instancia CreateStorageLocation',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  name: string = '';

  // Propiedades predeterminadas de la clase CreateStorageLocationDto según especificación del sistema

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de creación de la instancia (CreateStorageLocation).',
    example: 'Fecha de creación de la instancia (CreateStorageLocation).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  creationDate: Date = new Date(); // Fecha de creación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de actualización de la instancia (CreateStorageLocation).',
    example: 'Fecha de actualización de la instancia (CreateStorageLocation).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  modificationDate: Date = new Date(); // Fecha de modificación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => String,
    description:
      'Usuario que realiza la creación de la instancia (CreateStorageLocation).',
    example:
      'Usuario que realiza la creación de la instancia (CreateStorageLocation).',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  createdBy?: string; // Usuario que crea el objeto

  @ApiProperty({
    type: () => Boolean,
    description: 'Estado de activación de la instancia (CreateStorageLocation).',
    example: 'Estado de activación de la instancia (CreateStorageLocation).',
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { nullable: false })
  isActive: boolean = false; // Por defecto, el objeto no está activo

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código de ubicación',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código de ubicación', nullable: false })
  locationCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Almacén dueño de la ubicación',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Almacén dueño de la ubicación', nullable: false })
  warehouseId!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Zona interna del almacén',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Zona interna del almacén', nullable: false })
  zoneCode!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Tipo de ubicación',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Tipo de ubicación', nullable: false })
  locationType!: string;

  @ApiProperty({
    type: () => Number,
    nullable: false,
    description: 'Capacidad máxima en unidades',
  })
  @IsInt()
  @IsNotEmpty()
  @Field(() => Int, { description: 'Capacidad máxima en unidades', nullable: false })
  maxUnits!: number;

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos de ubicación',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos de ubicación', nullable: true })
  metadata?: Record<string, any> = {};

  // Constructor
  constructor(partial: Partial<BaseStorageLocationDto>) {
    Object.assign(this, partial);
  }
}




@InputType()
export class StorageLocationDto extends BaseStorageLocationDto {
  // Propiedades específicas de la clase StorageLocationDto en cuestión

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
  constructor(partial: Partial<StorageLocationDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<StorageLocationDto>): StorageLocationDto {
    const instance = new StorageLocationDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 




@InputType()
export class StorageLocationValueInput {
  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Campo de filtro',
  })
  @Field({ nullable: false })
  fieldName: string = 'id';

  @ApiProperty({
    type: () => StorageLocationDto,
    nullable: false,
    description: 'Valor del filtro',
  })
  @Field(() => StorageLocationDto, { nullable: false })
  fieldValue: any; // Permite cualquier tipo
} 




@ObjectType()
export class StorageLocationOutPutDto extends BaseStorageLocationDto {
  // Propiedades específicas de la clase StorageLocationOutPutDto en cuestión

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
  constructor(partial: Partial<StorageLocationOutPutDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<StorageLocationOutPutDto>): StorageLocationOutPutDto {
    const instance = new StorageLocationOutPutDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateStorageLocationDto extends BaseStorageLocationDto {
  // Propiedades específicas de la clase CreateStorageLocationDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a crear',
    example:
      'Se proporciona un identificador de CreateStorageLocation a crear \(opcional\) ',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<CreateStorageLocationDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CreateStorageLocationDto>): CreateStorageLocationDto {
    const instance = new CreateStorageLocationDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateOrUpdateStorageLocationDto {
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
    type: () => CreateStorageLocationDto,
    description: 'Instancia CreateStorageLocation o UpdateStorageLocation',
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Field(() => CreateStorageLocationDto, { nullable: true })
  input?: CreateStorageLocationDto | UpdateStorageLocationDto; // Asegúrate de que esto esté correcto
}



@InputType()
export class DeleteStorageLocationDto {
  // Propiedades específicas de la clase DeleteStorageLocationDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a eliminar',
    example: 'Se proporciona un identificador de DeleteStorageLocation a eliminar',
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
      'Se proporciona una lista de identificadores de DeleteStorageLocation a eliminar',
    default: [],
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  ids?: string[];
}



@InputType()
export class UpdateStorageLocationDto extends BaseStorageLocationDto {
  // Propiedades específicas de la clase UpdateStorageLocationDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a actualizar',
    example: 'Se proporciona un identificador de UpdateStorageLocation a actualizar',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id!: string;

  // Constructor
  constructor(partial: Partial<UpdateStorageLocationDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<UpdateStorageLocationDto>): UpdateStorageLocationDto {
    const instance = new UpdateStorageLocationDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 



