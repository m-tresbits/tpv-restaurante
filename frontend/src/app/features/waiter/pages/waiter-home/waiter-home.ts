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

  private syncSelectedTable(tables: RestaurantTable[]): void {
    const currentSelectedTable = this.selectedTable();

    if (!currentSelectedTable) {
      return;
    }

    const updatedSelectedTable = tables.find((table) => table.id === currentSelectedTable.id);

    this.selectedTable.set(updatedSelectedTable ?? null);
  }
}
