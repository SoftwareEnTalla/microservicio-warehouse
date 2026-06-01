import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StorageLocationQueryRepository } from '../storage-location/repositories/storagelocationquery.repository';
import { WarehouseCommandService } from '../warehouse/services/warehousecommand.service';
import { WarehouseQueryRepository } from '../warehouse/repositories/warehousequery.repository';
import { StorageLocation } from '../storage-location/entities/storage-location.entity';
import { Warehouse } from '../warehouse/entities/warehouse.entity';

@Injectable()
export class WarehouseLifecycleService {
  constructor(
    private readonly warehouseQueryRepository: WarehouseQueryRepository,
    private readonly warehouseCommandService: WarehouseCommandService,
    private readonly storageLocationQueryRepository: StorageLocationQueryRepository,
  ) {}

  async getSummary(limit: number = 8, authorization?: string): Promise<Record<string, unknown>> {
    const warehouses = await this.warehouseQueryRepository.findAll({ take: Math.max(limit, 50) });
    const storageLocations = await this.storageLocationQueryRepository.findAll({ take: 500 });
    const remoteSignals = await this.collectRemoteSignals(warehouses as Warehouse[], authorization);

    const activeWarehouses = (warehouses as Warehouse[]).filter((warehouse) => warehouse?.isActive !== false);
    const activeStorageLocations = (storageLocations as StorageLocation[]).filter((location) => location?.isActive !== false);
    const uniqueZones = new Set(activeStorageLocations.map((location) => String(location.zoneCode || '').trim()).filter(Boolean));
    const dockLocations = activeStorageLocations.filter((location) => this.normalizeLocationType(location).includes('DOCK'));
    const binLocations = activeStorageLocations.filter((location) => this.isBinLike(location));
    const usableCapacityUnits = activeStorageLocations.reduce((sum, location) => sum + this.toNumber(location.maxUnits), 0);
    const occupiedCapacityUnits = activeStorageLocations.reduce((sum, location) => sum + this.resolveLocationOccupancy(location), 0);
    const warehousesWithCalendar = activeWarehouses.filter((warehouse) => Array.isArray((warehouse.metadata ?? {})['blackoutDates']) || Boolean((warehouse.metadata ?? {})['operatingHours']));
    const warehousesWithTopology = activeWarehouses.filter((warehouse) => Boolean((warehouse.metadata ?? {})['topologySummary']));

    const latest = [...activeWarehouses]
      .sort((left, right) => new Date(String(right.modificationDate || right.creationDate || 0)).getTime() - new Date(String(left.modificationDate || left.creationDate || 0)).getTime())
      .slice(0, Math.max(1, Math.min(limit, 20)))
      .map((warehouse) => this.buildWarehouseSnapshot(warehouse, activeStorageLocations));

    const totalCapacityUnits = activeWarehouses.reduce((sum, warehouse) => sum + this.toNumber(warehouse.capacityUnits), 0);
    const saturationPercent = usableCapacityUnits > 0 ? Math.round((occupiedCapacityUnits / usableCapacityUnits) * 100) : 0;

    return {
      ok: true,
      message: 'Resumen operativo de warehouse obtenido con éxito.',
      data: {
        totals: {
          totalWarehouses: activeWarehouses.length,
          totalStorageLocations: activeStorageLocations.length,
          zoneCount: uniqueZones.size,
          dockLocationCount: dockLocations.length,
          binLocationCount: binLocations.length,
          totalCapacityUnits,
          usableCapacityUnits,
          occupiedCapacityUnits,
          availableCapacityUnits: Math.max(usableCapacityUnits - occupiedCapacityUnits, 0),
          saturationPercent,
          warehousesWithCalendar: warehousesWithCalendar.length,
          warehousesWithTopology: warehousesWithTopology.length,
          inventorySignals: remoteSignals.inventorySignals,
          openDistributionSignals: remoteSignals.openDistributionSignals,
          openFulfillmentSignals: remoteSignals.openFulfillmentSignals,
          integrationCoveragePercent: activeWarehouses.length > 0
            ? Math.round(((warehousesWithCalendar.length + warehousesWithTopology.length) / (activeWarehouses.length * 2)) * 100)
            : 0,
          verificationIssues: remoteSignals.verificationIssues.length,
        },
        latest,
      },
      count: latest.length,
    };
  }

  async updateCapacityPlan(
    warehouseId: string,
    payload: { capacityUnits?: number; dockCount?: number; slottingStrategy?: string; reason?: string },
    authorization?: string,
  ): Promise<Record<string, unknown>> {
    const warehouse = await this.getWarehouseOrFail(warehouseId);
    const nextCapacityUnits = this.resolvePositiveInteger(payload.capacityUnits, warehouse.capacityUnits, 'capacityUnits');
    const nextDockCount = this.resolveNonNegativeInteger(payload.dockCount, warehouse.dockCount, 'dockCount');
    const nextSlottingStrategy = String(payload.slottingStrategy ?? warehouse.slottingStrategy ?? '').trim() || null;
    const remoteSignals = await this.collectRemoteSignals([warehouse], authorization);

    await this.warehouseCommandService.update(warehouseId, {
      capacityUnits: nextCapacityUnits,
      dockCount: nextDockCount,
      slottingStrategy: nextSlottingStrategy ?? undefined,
      metadata: {
        ...(warehouse.metadata ?? {}),
        lastCapacityPlanAt: new Date().toISOString(),
        lastCapacityPlanReason: String(payload.reason || '').trim() || 'WAREHOUSE_CAPACITY_REVIEW',
        lastCapacityPlanSummary: {
          inventorySignals: remoteSignals.inventorySignals,
          openDistributionSignals: remoteSignals.openDistributionSignals,
          openFulfillmentSignals: remoteSignals.openFulfillmentSignals,
        },
        lastInventoryCapacitySyncStatus: remoteSignals.verificationIssues.length === 0 ? 'SYNCED' : 'PENDING_REVIEW',
        lastDistributionCapacitySyncStatus: remoteSignals.verificationIssues.length === 0 ? 'SYNCED' : 'PENDING_REVIEW',
        lastFulfillmentCapacitySyncStatus: remoteSignals.verificationIssues.length === 0 ? 'SYNCED' : 'PENDING_REVIEW',
      },
    } as any);

    return this.buildWarehouseOperationResponse('Capacidad táctica actualizada con éxito.', warehouseId, authorization);
  }

  async configureOperationalCalendar(
    warehouseId: string,
    payload: { operatingHours?: unknown; dockWindows?: unknown; blackoutDates?: string[]; restrictions?: string[]; reason?: string },
  ): Promise<Record<string, unknown>> {
    const warehouse = await this.getWarehouseOrFail(warehouseId);

    await this.warehouseCommandService.update(warehouseId, {
      metadata: {
        ...(warehouse.metadata ?? {}),
        operatingHours: payload.operatingHours ?? (warehouse.metadata ?? {})['operatingHours'] ?? null,
        dockWindows: payload.dockWindows ?? (warehouse.metadata ?? {})['dockWindows'] ?? null,
        blackoutDates: Array.isArray(payload.blackoutDates) ? payload.blackoutDates : (warehouse.metadata ?? {})['blackoutDates'] ?? [],
        restrictions: Array.isArray(payload.restrictions) ? payload.restrictions : (warehouse.metadata ?? {})['restrictions'] ?? [],
        lastCalendarUpdateAt: new Date().toISOString(),
        lastCalendarUpdateReason: String(payload.reason || '').trim() || 'WAREHOUSE_CALENDAR_UPDATE',
      },
    } as any);

    return this.buildWarehouseOperationResponse('Calendario operativo actualizado con éxito.', warehouseId);
  }

  async rebuildTopology(warehouseId: string): Promise<Record<string, unknown>> {
    const warehouse = await this.getWarehouseOrFail(warehouseId);
    const storageLocations = await this.storageLocationQueryRepository.findAll({ where: { warehouseId }, take: 500 });
    const activeStorageLocations = (storageLocations as StorageLocation[]).filter((location) => location?.isActive !== false);
    const uniqueZones = [...new Set(activeStorageLocations.map((location) => String(location.zoneCode || '').trim()).filter(Boolean))];
    const dockLocations = activeStorageLocations.filter((location) => this.normalizeLocationType(location).includes('DOCK'));
    const binLocations = activeStorageLocations.filter((location) => this.isBinLike(location));
    const usableCapacityUnits = activeStorageLocations.reduce((sum, location) => sum + this.toNumber(location.maxUnits), 0);
    const occupiedCapacityUnits = activeStorageLocations.reduce((sum, location) => sum + this.resolveLocationOccupancy(location), 0);

    const topologySummary = {
      activeLocationCount: activeStorageLocations.length,
      zoneCount: uniqueZones.length,
      zones: uniqueZones,
      dockLocationCount: dockLocations.length,
      binLocationCount: binLocations.length,
      usableCapacityUnits,
      occupiedCapacityUnits,
      availableCapacityUnits: Math.max(usableCapacityUnits - occupiedCapacityUnits, 0),
      saturationPercent: usableCapacityUnits > 0 ? Math.round((occupiedCapacityUnits / usableCapacityUnits) * 100) : 0,
      rebuiltAt: new Date().toISOString(),
    };

    await this.warehouseCommandService.update(warehouseId, {
      metadata: {
        ...(warehouse.metadata ?? {}),
        topologySummary,
        lastTopologyRebuildAt: topologySummary.rebuiltAt,
      },
    } as any);

    return this.buildWarehouseOperationResponse('Topología física reconstruida con éxito.', warehouseId);
  }

  async previewClosure(warehouseId: string, authorization?: string): Promise<Record<string, unknown>> {
    const warehouse = await this.getWarehouseOrFail(warehouseId);
    const storageLocations = await this.storageLocationQueryRepository.findAll({ where: { warehouseId }, take: 500 });
    const activeStorageLocations = (storageLocations as StorageLocation[]).filter((location) => location?.isActive !== false);
    const remoteSignals = await this.collectRemoteSignals([warehouse], authorization);

    const blockers = [
      ...(activeStorageLocations.length > 0 ? [`storage-locations activas: ${activeStorageLocations.length}`] : []),
      ...(remoteSignals.inventorySignals > 0 ? [`inventory activo o con saldo: ${remoteSignals.inventorySignals}`] : []),
      ...(remoteSignals.openDistributionSignals > 0 ? [`transferencias abiertas: ${remoteSignals.openDistributionSignals}`] : []),
      ...(remoteSignals.openFulfillmentSignals > 0 ? [`tareas de fulfillment abiertas: ${remoteSignals.openFulfillmentSignals}`] : []),
      ...remoteSignals.verificationIssues,
    ];

    return {
      ok: true,
      message: blockers.length
        ? 'El warehouse todavía tiene bloqueos operativos pendientes.'
        : 'El warehouse no presenta bloqueos operativos remanentes.',
      data: {
        warehouseId,
        canClose: blockers.length === 0,
        blockers,
      },
    };
  }

  private async collectRemoteSignals(warehouses: Warehouse[], authorization?: string): Promise<{
    inventorySignals: number;
    openDistributionSignals: number;
    openFulfillmentSignals: number;
    verificationIssues: string[];
  }> {
    let inventorySignals = 0;
    let openDistributionSignals = 0;
    let openFulfillmentSignals = 0;
    const verificationIssues = new Set<string>();

    for (const warehouse of warehouses) {
      const inventoryRecords = await this.readRemoteCollection(
        (process.env.INVENTORY_API_BASE_URL || 'http://host.docker.internal:3012/api').replace(/\/$/, ''),
        `/inventorys/query/field/warehouseId?value=${encodeURIComponent(warehouse.id)}`,
        authorization,
        verificationIssues,
        'inventory-service',
      );
      inventorySignals += inventoryRecords.filter((record) => this.isActiveRecord(record) && this.hasInventoryLoad(record)).length;

      const outgoingDistributions = await this.readRemoteCollection(
        (process.env.DISTRIBUTION_API_BASE_URL || 'http://host.docker.internal:3021/api').replace(/\/$/, ''),
        `/distributions/query/field/sourceWarehouseId?value=${encodeURIComponent(warehouse.id)}`,
        authorization,
        verificationIssues,
        'distribution-service(source)',
      );
      const incomingDistributions = await this.readRemoteCollection(
        (process.env.DISTRIBUTION_API_BASE_URL || 'http://host.docker.internal:3021/api').replace(/\/$/, ''),
        `/distributions/query/field/targetWarehouseId?value=${encodeURIComponent(warehouse.id)}`,
        authorization,
        verificationIssues,
        'distribution-service(target)',
      );
      openDistributionSignals += [...outgoingDistributions, ...incomingDistributions].filter((record) => this.isOpenDistribution(record)).length;

      const fulfillmentRecords = await this.readRemoteCollection(
        (process.env.FULFILLMENT_API_BASE_URL || 'http://host.docker.internal:3014/api').replace(/\/$/, ''),
        `/fulfillments/query/field/warehouseId?value=${encodeURIComponent(warehouse.id)}`,
        authorization,
        verificationIssues,
        'fulfillment-service',
      );
      openFulfillmentSignals += fulfillmentRecords.filter((record) => this.isOpenFulfillment(record)).length;
    }

    return {
      inventorySignals,
      openDistributionSignals,
      openFulfillmentSignals,
      verificationIssues: [...verificationIssues],
    };
  }

  private async readRemoteCollection(
    baseUrl: string,
    path: string,
    authorization: string | undefined,
    verificationIssues: Set<string>,
    serviceLabel: string,
  ): Promise<Record<string, any>[]> {
    try {
      const authorizationHeader = this.resolveAuthorizationHeader(authorization);
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(authorizationHeader ? { Authorization: authorizationHeader } : {}),
        },
      });
      const payload = await this.safeReadJson(response);
      if (!response.ok) {
        verificationIssues.add(`No se pudo verificar ${serviceLabel}: HTTP ${response.status}`);
        return [];
      }
      if (Array.isArray(payload)) {
        return payload;
      }
      if (Array.isArray(payload?.data)) {
        return payload.data as Record<string, any>[];
      }
      return [];
    } catch {
      verificationIssues.add(`No se pudo verificar ${serviceLabel}: servicio no disponible`);
      return [];
    }
  }

  private async buildWarehouseOperationResponse(message: string, warehouseId: string, authorization?: string): Promise<Record<string, unknown>> {
    const warehouse = await this.getWarehouseOrFail(warehouseId);
    const storageLocations = await this.storageLocationQueryRepository.findAll({ where: { warehouseId }, take: 500 });
    const remoteSignals = await this.collectRemoteSignals([warehouse], authorization);

    return {
      ok: true,
      message,
      data: {
        warehouseId,
        capacityUnits: this.toNumber(warehouse.capacityUnits),
        dockCount: this.toNumber(warehouse.dockCount),
        activeStorageLocations: (storageLocations as StorageLocation[]).filter((location) => location?.isActive !== false).length,
        metadata: warehouse.metadata ?? {},
        remoteSignals,
      },
    };
  }

  private buildWarehouseSnapshot(warehouse: Warehouse, storageLocations: StorageLocation[]): Record<string, unknown> {
    const locations = storageLocations.filter((location) => location.warehouseId === warehouse.id && location?.isActive !== false);
    const zoneCount = new Set(locations.map((location) => String(location.zoneCode || '').trim()).filter(Boolean)).size;
    const usableCapacityUnits = locations.reduce((sum, location) => sum + this.toNumber(location.maxUnits), 0);
    const occupiedCapacityUnits = locations.reduce((sum, location) => sum + this.resolveLocationOccupancy(location), 0);

    return {
      id: warehouse.id,
      name: warehouse.getName ?? (warehouse as any)['name'] ?? warehouse.warehouseCode,
      warehouseCode: warehouse.warehouseCode,
      status: warehouse.status,
      organizationId: warehouse.organizationId,
      timezone: warehouse.timezone,
      capacityUnits: this.toNumber(warehouse.capacityUnits),
      dockCount: this.toNumber(warehouse.dockCount),
      activeStorageLocations: locations.length,
      zoneCount,
      usableCapacityUnits,
      occupiedCapacityUnits,
      modificationDate: warehouse.modificationDate ?? warehouse.creationDate ?? null,
      metadata: warehouse.metadata ?? {},
    };
  }

  private async getWarehouseOrFail(warehouseId: string): Promise<Warehouse> {
    const warehouse = await this.warehouseQueryRepository.findById(warehouseId);
    if (!warehouse) {
      throw new NotFoundException(`No existe warehouse ${warehouseId}`);
    }
    return warehouse as Warehouse;
  }

  private resolveLocationOccupancy(location: StorageLocation): number {
    const metadata = location.metadata ?? {};
    return Math.max(this.toNumber(metadata['currentUnits'] ?? metadata['occupiedUnits'] ?? 0), 0);
  }

  private normalizeLocationType(location: StorageLocation): string {
    return String(location.locationType || '').trim().toUpperCase();
  }

  private isBinLike(location: StorageLocation): boolean {
    const locationType = this.normalizeLocationType(location);
    return ['BIN', 'PICK', 'BULK', 'STAGING', 'SHELF'].some((candidate) => locationType.includes(candidate));
  }

  private hasInventoryLoad(record: Record<string, any>): boolean {
    return this.toNumber(record['availableQty']) > 0
      || this.toNumber(record['reservedQty']) > 0
      || this.toNumber(record['blockedQty']) > 0
      || this.toNumber(record['inTransitQty']) > 0;
  }

  private isOpenDistribution(record: Record<string, any>): boolean {
    const status = String(record['status'] || '').trim().toUpperCase();
    return this.isActiveRecord(record) && !['RECEIVED', 'CANCELLED', 'CLOSED', 'COMPLETED'].includes(status);
  }

  private isOpenFulfillment(record: Record<string, any>): boolean {
    const status = String(record['status'] || '').trim().toUpperCase();
    return this.isActiveRecord(record) && !['COMPLETED', 'CANCELLED', 'CLOSED', 'DISPATCHED'].includes(status);
  }

  private isActiveRecord(record: Record<string, any>): boolean {
    return record['isActive'] !== false;
  }

  private resolvePositiveInteger(value: unknown, fallback: number, field: string): number {
    const numericValue = value == null ? fallback : Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      throw new BadRequestException(`${field} requiere un entero positivo.`);
    }
    return Math.round(numericValue);
  }

  private resolveNonNegativeInteger(value: unknown, fallback: number, field: string): number {
    const numericValue = value == null ? fallback : Number(value);
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      throw new BadRequestException(`${field} requiere un entero no negativo.`);
    }
    return Math.round(numericValue);
  }

  private toNumber(value: unknown): number {
    const numericValue = Number(value ?? 0);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  private resolveAuthorizationHeader(requestAuthorization?: string): string | undefined {
    if (requestAuthorization) {
      return requestAuthorization;
    }

    const configuredToken = String(process.env.INTERNAL_SERVICE_AUTH_TOKEN || '').trim();
    if (!configuredToken) {
      return undefined;
    }

    return configuredToken.toLowerCase().startsWith('bearer ') ? configuredToken : `Bearer ${configuredToken}`;
  }

  private async safeReadJson(response: Response): Promise<Record<string, any> | null> {
    const text = await response.text();
    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text) as Record<string, any>;
    } catch {
      return { raw: text };
    }
  }
}