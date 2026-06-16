import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { TablesApiService } from '../../../../core/api/services/tables-api.service';
import {
  CreateTableRequest,
  RestaurantTable,
  TableStatus,
  UpdateTableRequest,
  UpdateTableStatusRequest,
} from '../../../../shared/models/table.model';

@Component({
  selector: 'app-tables-panel',
  imports: [ReactiveFormsModule],
  templateUrl: './tables-panel.html',
  styleUrl: './tables-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablesPanel {
  readonly tables = input.required<RestaurantTable[]>();
  readonly tablesChanged = output<void>();
  readonly tableUpdated = output<RestaurantTable>();

  private readonly tablesApiService = inject(TablesApiService);

  protected readonly statuses: TableStatus[] = ['LIBRE', 'OCUPADA', 'RESERVADA', 'INACTIVA'];
  protected readonly isSaving = signal(false);
  protected readonly editingTableId = signal<number | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly createForm = new FormGroup({
    numero: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    capacidad: new FormControl(2, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  protected readonly editForm = new FormGroup({
    numero: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    capacidad: new FormControl(2, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  protected createTable(): void {
    if (this.createForm.invalid || this.isSaving()) {
      this.createForm.markAllAsTouched();
      return;
    }

    const request: CreateTableRequest = {
      numero: this.createForm.controls.numero.value,
      capacidad: this.createForm.controls.capacidad.value,
    };

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.tablesApiService.create(request).subscribe({
      next: () => {
        this.createForm.reset({
          numero: 1,
          capacidad: 2,
        });
        this.isSaving.set(false);
        this.tablesChanged.emit();
      },
      error: () => {
        this.errorMessage.set('No se ha podido crear la mesa.');
        this.isSaving.set(false);
      },
    });
  }

  protected startEdit(table: RestaurantTable): void {
    this.editingTableId.set(table.id);
    this.editForm.setValue({
      numero: table.numero,
      capacidad: table.capacidad,
    });
    this.errorMessage.set(null);
  }

  protected cancelEdit(): void {
    this.editingTableId.set(null);
    this.editForm.reset({
      numero: 1,
      capacidad: 2,
    });
    this.errorMessage.set(null);
  }

  protected updateTable(tableId: number): void {
    if (this.editForm.invalid || this.isSaving()) {
      this.editForm.markAllAsTouched();
      return;
    }

    const request: UpdateTableRequest = {
      numero: this.editForm.controls.numero.value,
      capacidad: this.editForm.controls.capacidad.value,
    };

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.tablesApiService.update(tableId, request).subscribe({
      next: (updatedTable) => {
        this.editingTableId.set(null);
        this.editForm.reset({
          numero: 1,
          capacidad: 2,
        });
        this.isSaving.set(false);
        this.tableUpdated.emit(updatedTable);
      },
      error: () => {
        this.errorMessage.set('No se ha podido actualizar la mesa.');
        this.isSaving.set(false);
      },
    });
  }

  protected updateStatusFromEvent(tableId: number, event: Event): void {
    const estado = (event.target as HTMLSelectElement).value as TableStatus;
    this.updateStatus(tableId, estado);
  }

  private updateStatus(tableId: number, estado: TableStatus): void {
    if (this.isSaving()) {
      return;
    }

    const request: UpdateTableStatusRequest = {
      estado,
    };

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.tablesApiService.updateStatus(tableId, request).subscribe({
      next: (updatedTable) => {
        this.isSaving.set(false);
        this.tableUpdated.emit(updatedTable);
      },
      error: () => {
        this.errorMessage.set('No se ha podido actualizar el estado de la mesa.');
        this.isSaving.set(false);
      },
    });
  }
}
