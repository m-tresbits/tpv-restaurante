import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { StockApiService } from '../../../../core/api/services/stock-api.service';
import { Product } from '../../../../shared/models/product.model';
import { ProductStock, UpdateStockRequest } from '../../../../shared/models/stock.model';

@Component({
  selector: 'app-stock-panel',
  imports: [ReactiveFormsModule],
  templateUrl: './stock-panel.html',
  styleUrl: './stock-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockPanel {
  readonly stock = input.required<ProductStock[]>();
  readonly products = input.required<Product[]>();
  readonly stockChanged = output<void>();

  private readonly stockApiService = inject(StockApiService);

  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly selectedProductId = signal<number | null>(null);

  protected readonly stockForm = new FormGroup({
    productoId: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
    cantidad: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
  });

  protected selectProduct(product: Product): void {
    const currentStock = this.productStock(product);

    this.selectedProductId.set(product.id);
    this.stockForm.setValue({
      productoId: product.id,
      cantidad: currentStock,
    });
    this.stockForm.markAsUntouched();
    this.errorMessage.set(null);
  }

  protected upsertStock(): void {
    if (this.stockForm.invalid || this.isSaving()) {
      this.stockForm.markAllAsTouched();
      return;
    }

    const productId = Number(this.selectedProductId() ?? this.stockForm.controls.productoId.value);
    const request: UpdateStockRequest = {
      cantidad: this.stockForm.controls.cantidad.value,
    };

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.stockApiService.update(productId, request).subscribe({
      next: (updatedStock) => {
        this.selectedProductId.set(updatedStock.product.id);
        this.stockForm.setValue({
          productoId: updatedStock.product.id,
          cantidad: updatedStock.cantidad,
        });
        this.stockForm.markAsUntouched();
        this.isSaving.set(false);
        this.stockChanged.emit();
      },
      error: () => {
        this.errorMessage.set('No se ha podido guardar el stock actual.');
        this.isSaving.set(false);
      },
    });
  }

  protected activeProducts(): Product[] {
    return this.products().filter((product) => product.activo);
  }

  protected productStock(product: Product): number {
    return Number(
      this.stock().find((stock) => Number(stock.product.id) === Number(product.id))?.cantidad ?? 0,
    );
  }

  protected isSelected(product: Product): boolean {
    return Number(this.selectedProductId()) === Number(product.id);
  }

  protected stockStatus(product: Product): string {
    const stock = this.productStock(product);

    if (stock <= 0) {
      return 'Sin stock';
    }

    if (stock <= 5) {
      return 'Stock bajo';
    }

    return 'Disponible';
  }

  protected stockLevel(product: Product): 'empty' | 'low' | 'available' {
    const stock = this.productStock(product);

    if (stock <= 0) {
      return 'empty';
    }

    if (stock <= 5) {
      return 'low';
    }

    return 'available';
  }
}
