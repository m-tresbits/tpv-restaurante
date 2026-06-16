import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { TablesApiService } from '../../../../core/api/services/tables-api.service';
import { RestaurantTable, TableStatus } from '../../../../shared/models/table.model';

@Component({
  selector: 'app-waiter-home',
  templateUrl: './waiter-home.html',
  styleUrl: './waiter-home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaiterHome implements OnInit {
  private readonly tablesApiService = inject(TablesApiService);

  protected readonly tables = signal<RestaurantTable[]>([]);
  protected readonly selectedTable = signal<RestaurantTable | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadTables();
  }

  protected reload(): void {
    this.loadTables();
  }

  protected selectTable(table: RestaurantTable): void {
    this.selectedTable.set(table);
  }

  protected tableStatusLabel(status: TableStatus): string {
    const labels: Record<TableStatus, string> = {
      LIBRE: 'Libre',
      OCUPADA: 'Ocupada',
      RESERVADA: 'Reservada',
      INACTIVA: 'Inactiva',
    };

    return labels[status];
  }

  protected tableStatusClass(status: TableStatus): string {
    return `waiter-home__table--${status.toLowerCase()}`;
  }

  protected canOpenOrder(table: RestaurantTable): boolean {
    return table.estado === 'LIBRE' || table.estado === 'OCUPADA';
  }

  protected occupyTable(table: RestaurantTable): void {
    this.updateTableStatus(table.id, 'OCUPADA');
  }

  protected reserveTable(table: RestaurantTable): void {
    this.updateTableStatus(table.id, 'RESERVADA');
  }

  protected releaseTable(table: RestaurantTable): void {
    this.updateTableStatus(table.id, 'LIBRE');
  }

  protected cancelReservation(table: RestaurantTable): void {
    this.updateTableStatus(table.id, 'LIBRE');
  }

  private loadTables(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.tablesApiService.findActive().subscribe({
      next: (tables) => {
        this.tables.set(tables);
        this.syncSelectedTable(tables);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se han podido cargar las mesas.');
        this.isLoading.set(false);
      },
    });
  }

  private updateTableStatus(tableId: number, estado: TableStatus): void {
    if (this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.tablesApiService.updateStatus(tableId, { estado }).subscribe({
      next: (updatedTable) => {
        this.replaceTable(updatedTable);
        this.selectedTable.set(updatedTable);
        this.isSaving.set(false);
      },
      error: () => {
        this.errorMessage.set('No se ha podido actualizar el estado de la mesa.');
        this.isSaving.set(false);
      },
    });
  }

  private replaceTable(updatedTable: RestaurantTable): void {
    this.tables.update((tables) =>
      tables.map((table) => (table.id === updatedTable.id ? updatedTable : table)),
    );
  }

  private syncSelectedTable(tables: RestaurantTable[]): void {
    const currentSelectedTable = this.selectedTable();

    if (!currentSelectedTable) {
      return;
    }

    const updatedSelectedTable = tables.find((table) => table.id === currentSelectedTable.id);

    this.selectedTable.set(updatedSelectedTable ?? null);
  }
}
