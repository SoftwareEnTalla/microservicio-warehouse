import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { WarehouseLifecycleService } from './warehouse-lifecycle.service';

@ApiTags('warehouse-lifecycle')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Autenticación requerida.' })
@Controller('warehouse-lifecycle')
export class WarehouseLifecycleController {
  constructor(private readonly service: WarehouseLifecycleService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Resumen agregado del lifecycle operativo de warehouse' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Resumen operativo de warehouse.' })
  async getSummary(
    @Query('limit') limit?: string,
    @Headers('authorization') authorization?: string,
  ): Promise<Record<string, unknown>> {
    return this.service.getSummary(Number(limit || 8), authorization);
  }

  @Post('warehouses/:warehouseId/capacity')
  @ApiOperation({ summary: 'Actualiza capacidad táctica y trazabilidad de un warehouse' })
  @ApiParam({ name: 'warehouseId', type: String })
  async updateCapacity(
    @Param('warehouseId') warehouseId: string,
    @Body() body: { capacityUnits?: number; dockCount?: number; slottingStrategy?: string; reason?: string },
    @Headers('authorization') authorization?: string,
  ): Promise<Record<string, unknown>> {
    return this.service.updateCapacityPlan(warehouseId, body, authorization);
  }

  @Post('warehouses/:warehouseId/calendar')
  @ApiOperation({ summary: 'Configura calendario operativo y restricciones del warehouse' })
  @ApiParam({ name: 'warehouseId', type: String })
  async configureCalendar(
    @Param('warehouseId') warehouseId: string,
    @Body() body: { operatingHours?: unknown; dockWindows?: unknown; blackoutDates?: string[]; restrictions?: string[]; reason?: string },
  ): Promise<Record<string, unknown>> {
    return this.service.configureOperationalCalendar(warehouseId, body);
  }

  @Post('warehouses/:warehouseId/topology/rebuild')
  @ApiOperation({ summary: 'Reconstruye resumen físico y de ocupación del warehouse' })
  @ApiParam({ name: 'warehouseId', type: String })
  async rebuildTopology(@Param('warehouseId') warehouseId: string): Promise<Record<string, unknown>> {
    return this.service.rebuildTopology(warehouseId);
  }

  @Post('warehouses/:warehouseId/closure-preview')
  @ApiOperation({ summary: 'Valida bloqueos remanentes antes de cerrar un warehouse' })
  @ApiParam({ name: 'warehouseId', type: String })
  async previewClosure(
    @Param('warehouseId') warehouseId: string,
    @Headers('authorization') authorization?: string,
  ): Promise<Record<string, unknown>> {
    return this.service.previewClosure(warehouseId, authorization);
  }
}