import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProductsApiService } from '../../../../core/api/services/products-api.service';
import { Category } from '../../../../shared/models/category.model';
import {
  CreateProductRequest,
  Product,
  UpdateProductRequest,
} from '../../../../shared/models/product.model';

@Component({
  selector: 'app-products-panel',
  imports: [ReactiveFormsModule],
  templateUrl: './products-panel.html',
  styleUrl: './products-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPanel {
  readonly products = input.required<Product[]>();
  readonly categories = input.required<Category[]>();
  readonly productsChanged = output<void>();

  private readonly productsApiService = inject(ProductsApiService);

  protected readonly isSaving = signal(false);
  protected readonly editingProductId = signal<number | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly createForm = new FormGroup({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    descripcion: new FormControl('', {
      nonNullable: true,
    }),
    precio: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0.01)],
    }),
    categoriaId: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
  });

  protected readonly editForm = new FormGroup({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    descripcion: new FormControl('', {
      nonNullable: true,
    }),
    precio: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0.01)],
    }),
    categoriaId: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
  });

  protected createProduct(): void {
    if (this.createForm.invalid || this.isSaving()) {
      this.createForm.markAllAsTouched();
      return;
    }

    const request: CreateProductRequest = {
      nombre: this.createForm.controls.nombre.value.trim(),
      descripcion: this.normalizeOptionalText(this.createForm.controls.descripcion.value),
      precio: this.createForm.controls.precio.value,
      categoriaId: Number(this.createForm.controls.categoriaId.value),
    };

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.productsApiService.create(request).subscribe({
      next: () => {
        this.createForm.reset({
          nombre: '',
          descripcion: '',
          precio: 0,
          categoriaId: null,
        });
        this.isSaving.set(false);
        this.productsChanged.emit();
      },
      error: () => {
        this.errorMessage.set('No se ha podido crear el producto.');
        this.isSaving.set(false);
      },
    });
  }

  protected startEdit(product: Product): void {
    this.editingProductId.set(product.id);
    this.editForm.setValue({
      nombre: product.nombre,
      descripcion: product.descripcion ?? '',
      precio: Number(product.precio),
      categoriaId: product.category.id,
    });
    this.errorMessage.set(null);
  }

  protected cancelEdit(): void {
    this.editingProductId.set(null);
    this.editForm.reset({
      nombre: '',
      descripcion: '',
      precio: 0,
      categoriaId: null,
    });
    this.errorMessage.set(null);
  }

  protected updateProduct(productId: number): void {
    if (this.editForm.invalid || this.isSaving()) {
      this.editForm.markAllAsTouched();
      return;
    }

    const request: UpdateProductRequest = {
      nombre: this.editForm.controls.nombre.value.trim(),
      descripcion: this.normalizeOptionalText(this.editForm.controls.descripcion.value),
      precio: this.editForm.controls.precio.value,
      categoriaId: Number(this.editForm.controls.categoriaId.value),
    };

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.productsApiService.update(productId, request).subscribe({
      next: () => {
        this.editingProductId.set(null);
        this.editForm.reset({
          nombre: '',
          descripcion: '',
          precio: 0,
          categoriaId: null,
        });
        this.isSaving.set(false);
        this.productsChanged.emit();
      },
      error: () => {
        this.errorMessage.set('No se ha podido actualizar el producto.');
        this.isSaving.set(false);
      },
    });
  }

  protected deactivateProduct(productId: number): void {
    if (this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.productsApiService.deactivate(productId).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.productsChanged.emit();
      },
      error: () => {
        this.errorMessage.set('No se ha podido desactivar el producto.');
        this.isSaving.set(false);
      },
    });
  }

  protected activateProduct(productId: number): void {
    if (this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.productsApiService.activate(productId).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.productsChanged.emit();
      },
      error: () => {
        this.errorMessage.set('No se ha podido activar el producto.');
        this.isSaving.set(false);
      },
    });
  }

  private normalizeOptionalText(value: string): string | undefined {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      return undefined;
    }

    return normalizedValue;
  }
}
