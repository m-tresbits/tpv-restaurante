import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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

  protected logout(): void {
    this.authSessionService.clearSession();
    void this.router.navigateByUrl('/auth/login');
  }
}
