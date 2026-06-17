import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AuthSessionService } from '../../core/auth/auth-session.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {
  private readonly router = inject(Router);
  private readonly authSessionService = inject(AuthSessionService);

  protected readonly currentUser = this.authSessionService.currentUser;

  protected readonly layoutRoleClass = computed(() => {
    const role = this.currentUser()?.rol;

    if (role === 'ADMIN') {
      return 'main-layout--admin';
    }

    if (role === 'CAMARERO') {
      return 'main-layout--waiter';
    }

    if (role === 'COCINA') {
      return 'main-layout--kitchen';
    }

    return '';
  });

  protected logout(): void {
    this.authSessionService.clearSession();
    void this.router.navigateByUrl('/auth/login');
  }
}
