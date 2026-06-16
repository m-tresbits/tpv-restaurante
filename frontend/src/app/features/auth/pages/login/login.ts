import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthSessionService } from '../../../../core/auth/auth-session.service';
import { AuthRole } from '../../../../shared/models/auth.model';
import { AuthApiService } from '../../services/auth-api.service';

const ROLE_ROUTES: Record<AuthRole, string> = {
  CAMARERO: '/waiter',
  ADMIN: '/admin',
  COCINA: '/kitchen',
};

const ROLE_NAMES: Record<AuthRole, string> = {
  CAMARERO: 'Camarero',
  ADMIN: 'Administrador',
  COCINA: 'Cocina',
};

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly router = inject(Router);
  private readonly authApiService = inject(AuthApiService);
  private readonly authSessionService = inject(AuthSessionService);

  protected readonly roles: AuthRole[] = ['CAMARERO', 'ADMIN', 'COCINA'];
  protected readonly selectedRole = signal<AuthRole>('CAMARERO');
  protected readonly loginError = signal<string | null>(null);
  protected readonly isSubmitting = signal(false);

  protected readonly loginForm = new FormGroup({
    pin: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{4}$/)],
    }),
  });

  protected selectRole(role: AuthRole): void {
    this.selectedRole.set(role);
    this.loginError.set(null);
  }

  protected formatPin(event: Event): void {
    const input = event.target as HTMLInputElement;
    const pin = input.value.replace(/\D/g, '').slice(0, 4);

    input.value = pin;
    this.loginError.set(null);
    this.loginForm.controls.pin.setValue(pin, { emitEvent: false });
  }

  protected submit(): void {
    this.loginForm.markAllAsTouched();
    this.loginError.set(null);

    if (this.loginForm.invalid || this.isSubmitting()) {
      return;
    }

    const role = this.selectedRole();

    this.isSubmitting.set(true);

    this.authApiService
      .login({
        nombre: ROLE_NAMES[role],
        pin: this.loginForm.controls.pin.value,
      })
      .subscribe({
        next: (response) => {
          this.authSessionService.saveSession(response);

          void this.router.navigateByUrl(ROLE_ROUTES[response.usuario.rol]);
        },
        error: () => {
          this.loginError.set('PIN incorrecto para el rol seleccionado');
          this.isSubmitting.set(false);
          this.loginForm.controls.pin.reset();
        },
      });
  }
}
