import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { StockApiService } from '../../../../core/api/services/stock-api.service';
import { Product } from '../../../../shared/models/product.model';
import { DailyStock, UpsertDailyStockRequest } from '../../../../shared/models/stock.model';

@Component({
  selector: 'app-stock-panel',
  imports: [ReactiveFormsModule],
  templateUrl: './stock-panel.html',
  styleUrl: './stock-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockPanel {
  readonly stock = input.required<DailyStock[]>();
  readonly products = input.required<Product[]>();
  readonly stockChanged = output<void>();

  private readonly stockApiService = inject(StockApiService);

  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly stockForm = new FormGroup({
    productoId: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
    fecha: new FormControl(this.getTodayDate(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    cantidadInicial: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
  });

  protected upsertStock(): void {
    if (this.stockForm.invalid || this.isSaving()) {
      this.stockForm.markAllAsTouched();
      return;
    }

    const request: UpsertDailyStockRequest = {
      productoId: Number(this.stockForm.controls.productoId.value),
      fecha: this.stockForm.controls.fecha.value,
      cantidadInicial: this.stockForm.controls.cantidadInicial.value,
    };

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.stockApiService.upsertDailyStock(request).subscribe({
      next: () => {
        this.stockForm.reset({
          productoId: null,
          fecha: this.getTodayDate(),
          cantidadInicial: 0,
        });
        this.isSaving.set(false);
        this.stockChanged.emit();
      },
      error: () => {
        this.errorMessage.set('No se ha podido guardar el stock diario.');
        this.isSaving.set(false);
      },
    });
  }

  protected activeProducts(): Product[] {
    return this.products().filter((product) => product.activo);
  }

  protected stockStatus(stock: DailyStock): string {
    if (stock.cantidadDisponible <= 0) {
      return 'Sin stock';
    }

    if (stock.cantidadDisponible < stock.cantidadInicial) {
      return 'Parcial';
    }

    return 'Disponible';
  }

  private getTodayDate(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
