import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { Role, RolesApiService } from '../../services/roles-api.service';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHome implements OnInit {
  private readonly rolesApiService = inject(RolesApiService);

  protected readonly roles = signal<Role[]>([]);
  protected readonly isLoadingRoles = signal(false);
  protected readonly rolesError = signal<string | null>(null);

  ngOnInit(): void {
    this.loadRoles();
  }

  private loadRoles(): void {
    this.isLoadingRoles.set(true);
    this.rolesError.set(null);

    this.rolesApiService.findAll().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.isLoadingRoles.set(false);
      },
      error: () => {
        this.rolesError.set('No se han podido cargar los roles.');
        this.isLoadingRoles.set(false);
      },
    });
  }
}
