import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: 'app-panel-control',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './panel-control.html',
  styleUrl: './panel-control.scss',
})
export class PanelControl {
  showPassword: boolean = false;

  credenciales = {
    email: '',
    password: ''
  };

  mensajeError: string = '';

  constructor(
      private authService: AuthService,
      private router: Router,
      private cdr: ChangeDetectorRef,
  ) {}

  onLogin() {
    this.mensajeError = '';

    if (!this.credenciales.email || !this.credenciales.password) {
      this.mensajeError = 'Por favor, rellena todos los campos.';
      return;
    }
    if (this.credenciales.password.length < 6) {
      this.mensajeError = 'La contraseña debe tener un mínimo de 6 caracteres.';
      return;
    }

    this.credenciales.email = this.credenciales.email.toLowerCase();

    this.authService.login(this.credenciales).subscribe({
      next: (respuesta: any) => {
        console.log('¡Login Exitoso!', respuesta);


        localStorage.setItem('access_token', respuesta.access);
        localStorage.setItem('refresh_token', respuesta.refresh);
        localStorage.setItem('user_role', respuesta.rol);
        localStorage.setItem('user_email', respuesta.email);


        const nombreEmpleado = respuesta.nombre || respuesta.username || 'Empleado';
        localStorage.setItem('nombre', nombreEmpleado);

        if (respuesta.rol === 'ADMIN') {
          console.log('Redirigiendo a Administración');
          this.router.navigate(['/auth/loginAdmin']);
        } else {
          console.log('Redirigiendo a Empleados');
          this.router.navigate(['/auth/loginUser']);
        }
      },
      error: (err: any) => {
        console.error('Error de Django:', err);
        this.mensajeError = 'Correo o contraseña incorrectos. ¡Inténtalo de nuevo!';
        this.cdr.detectChanges();
      }
    });
  }
}