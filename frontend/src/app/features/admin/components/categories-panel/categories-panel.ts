import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CategoriesApiService } from '../../../../core/api/services/categories-api.service';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../../../shared/models/category.model';

@Component({
  selector: 'app-categories-panel',
  imports: [ReactiveFormsModule],
  templateUrl: './categories-panel.html',
  styleUrl: './categories-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesPanel {
  readonly categories = input.required<Category[]>();
  readonly categoriesChanged = output<void>();

  private readonly categoriesApiService = inject(CategoriesApiService);

  protected readonly isSaving = signal(false);
  protected readonly editingCategoryId = signal<number | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly createForm = new FormGroup({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
  });

  protected readonly editForm = new FormGroup({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
  });

  protected createCategory(): void {
    if (this.createForm.invalid || this.isSaving()) {
      this.createForm.markAllAsTouched();
      return;
    }

    const request: CreateCategoryRequest = {
      nombre: this.createForm.controls.nombre.value.trim(),
    };

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.categoriesApiService.create(request).subscribe({
      next: () => {
        this.createForm.reset();
        this.isSaving.set(false);
        this.categoriesChanged.emit();
      },
      error: () => {
        this.errorMessage.set('No se ha podido crear la categoría.');
        this.isSaving.set(false);
      },
    });
  }

  protected startEdit(category: Category): void {
    this.editingCategoryId.set(category.id);
    this.editForm.setValue({
      nombre: category.nombre,
    });
    this.errorMessage.set(null);
  }

  protected cancelEdit(): void {
    this.editingCategoryId.set(null);
    this.editForm.reset();
    this.errorMessage.set(null);
  }

  protected updateCategory(categoryId: number): void {
    if (this.editForm.invalid || this.isSaving()) {
      this.editForm.markAllAsTouched();
      return;
    }

    const request: UpdateCategoryRequest = {
      nombre: this.editForm.controls.nombre.value.trim(),
    };

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.categoriesApiService.update(categoryId, request).subscribe({
      next: () => {
        this.editingCategoryId.set(null);
        this.editForm.reset();
        this.isSaving.set(false);
        this.categoriesChanged.emit();
      },
      error: () => {
        this.errorMessage.set('No se ha podido actualizar la categoría.');
        this.isSaving.set(false);
      },
    });
  }

  protected deactivateCategory(categoryId: number): void {
    if (this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.categoriesApiService.deactivate(categoryId).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.categoriesChanged.emit();
      },
      error: () => {
        this.errorMessage.set('No se ha podido desactivar la categoría.');
        this.isSaving.set(false);
      },
    });
  }

  protected activateCategory(categoryId: number): void {
    if (this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.categoriesApiService.activate(categoryId).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.categoriesChanged.emit();
      },
      error: () => {
        this.errorMessage.set('No se ha podido activar la categoría.');
        this.isSaving.set(false);
      },
    });
  }
}
