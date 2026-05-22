import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

/**
 * Roles disponibles en la pantalla de acceso.
 * Se limitan a estos valores para evitar errores al seleccionar o redirigir por rol.
 */
type AuthRole = 'CAMARERO' | 'ADMIN' | 'COCINA';

/**
 * Relación entre cada rol y la ruta principal a la que debe acceder.
 * De momento se usa como navegación temporal sin autenticación real.
 */
const ROLE_ROUTES: Record<AuthRole, string> = {
  CAMARERO: '/waiter',
  ADMIN: '/admin',
  COCINA: '/kitchen',
};

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  /**
   * Router de Angular utilizado para navegar a la pantalla correspondiente
   * cuando el formulario de acceso es válido.
   */
  private router = inject(Router);

  /**
   * Lista de roles que se muestran como botones en la interfaz.
   */
  protected roles: AuthRole[] = ['CAMARERO', 'ADMIN', 'COCINA'];

  /**
   * Rol seleccionado actualmente por el usuario.
   * Se usa una signal porque es un estado local simple del componente.
   */
  protected selectedRole = signal<AuthRole>('CAMARERO');

  /**
   * Formulario reactivo del login.
   * Actualmente solo contiene el PIN, que debe ser obligatorio
   * y estar formado por exactamente 4 dígitos numéricos.
   */
  protected loginForm = new FormGroup({
    pin: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{4}$/)],
    }),
  });

  /**
   * Actualiza el rol seleccionado cuando el usuario pulsa uno de los botones.
   */
  protected selectRole(role: AuthRole): void {
    this.selectedRole.set(role);
  }

  /**
   * Normaliza el valor introducido en el campo PIN.
   * Elimina cualquier carácter que no sea numérico y limita la longitud a 4 dígitos.
   */
  protected formatPin(event: Event): void {
    const input = event.target as HTMLInputElement;
    const pin = input.value.replace(/\D/g, '').slice(0, 4);

    input.value = pin;
    this.loginForm.controls.pin.setValue(pin, { emitEvent: false });
  }

  /**
   * Gestiona el envío del formulario.
   * Si el PIN no es válido, se detiene el proceso.
   * Si es válido, se redirige al panel correspondiente según el rol seleccionado.
   */
  protected submit(): void {
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    void this.router.navigateByUrl(ROLE_ROUTES[this.selectedRole()]);
  }
}
