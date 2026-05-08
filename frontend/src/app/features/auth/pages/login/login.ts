import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type UserRole =
  | 'camarero'
  | 'cocina'
  | 'admin';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {

  selectedRole: UserRole = 'camarero';

  selectRole(role: UserRole): void {
    this.selectedRole = role;
  }

}