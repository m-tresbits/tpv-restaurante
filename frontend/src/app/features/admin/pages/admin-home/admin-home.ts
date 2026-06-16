import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { CategoriesApiService } from '../../../../core/api/services/categories-api.service';
import { ProductsApiService } from '../../../../core/api/services/products-api.service';
import { StockApiService } from '../../../../core/api/services/stock-api.service';
import { TablesApiService } from '../../../../core/api/services/tables-api.service';
import { Category } from '../../../../shared/models/category.model';
import { Product } from '../../../../shared/models/product.model';
import { DailyStock } from '../../../../shared/models/stock.model';
import { RestaurantTable } from '../../../../shared/models/table.model';
import { CategoriesPanel } from '../../components/categories-panel/categories-panel';
import { ProductsPanel } from '../../components/products-panel/products-panel';
import { TablesPanel } from '../../components/tables-panel/tables-panel';

type AdminSection = 'dashboard' | 'categories' | 'products' | 'tables' | 'stock';

@Component({
  selector: 'app-admin-home',
  imports: [CategoriesPanel, ProductsPanel, TablesPanel],
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHome implements OnInit {
  private readonly categoriesApiService = inject(CategoriesApiService);
  private readonly productsApiService = inject(ProductsApiService);
  private readonly tablesApiService = inject(TablesApiService);
  private readonly stockApiService = inject(StockApiService);

  protected readonly activeSection = signal<AdminSection>('dashboard');

  protected readonly categories = signal<Category[]>([]);
  protected readonly products = signal<Product[]>([]);
  protected readonly tables = signal<RestaurantTable[]>([]);
  protected readonly stock = signal<DailyStock[]>([]);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDashboard();
  }

  protected selectSection(section: AdminSection): void {
    this.activeSection.set(section);
  }

  protected reload(): void {
    this.loadDashboard();
  }

  protected activeCategoriesCount(): number {
    return this.categories().filter((category) => category.activo).length;
  }

  protected activeProductsCount(): number {
    return this.products().filter((product) => product.activo).length;
  }

  protected freeTablesCount(): number {
    return this.tables().filter((table) => table.estado === 'LIBRE').length;
  }

  private loadDashboard(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      categories: this.categoriesApiService.findAll(),
      products: this.productsApiService.findAll(),
      tables: this.tablesApiService.findAll(),
      stock: this.stockApiService.findAll(),
    }).subscribe({
      next: ({ categories, products, tables, stock }) => {
        this.categories.set(categories);
        this.products.set(products);
        this.tables.set(tables);
        this.stock.set(stock);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se han podido cargar los datos de administración.');
        this.isLoading.set(false);
      },
    });
  }
}
