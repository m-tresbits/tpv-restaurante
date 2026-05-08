import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

type AuthRole = 'CAMARERO' | 'ADMIN' | 'COCINA';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  protected readonly roles: readonly AuthRole[] = ['CAMARERO', 'ADMIN', 'COCINA'];
  protected readonly selectedRole = signal<AuthRole>('CAMARERO');
  protected readonly loginForm = new FormGroup({
    pin: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{4}$/)],
    }),
  });

  protected selectRole(role: AuthRole): void {
    this.selectedRole.set(role);
  }

  protected formatPin(event: Event): void {
    const input = event.target as HTMLInputElement;
    const pin = input.value.replace(/\D/g, '').slice(0, 4);

    input.value = pin;
    this.loginForm.controls.pin.setValue(pin, { emitEvent: false });
  }

  protected submit(): void {
    this.loginForm.markAllAsTouched();
  }
}
