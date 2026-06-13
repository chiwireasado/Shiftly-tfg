import { Component } from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-registro',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})

export class Registro {
  showPassword1: boolean = false;
  showPassword2: boolean = false;

  nuevoUsuario = {
    email: '',
    username: '',
    password1: '',
    password2: '',
    nombre: '',
    apellidos: '',
    nombre_empresa: '',
    numero_empleados: 1
  };

  mensajeErrorBackend: string = '';

  constructor(
      private authService: AuthService,
      private router: Router
  ) {}

  cambiarforma(variable: string) {
    let primerForm = document.querySelector('.register-form');
    let secondForm = document.querySelector('.register-form-second');

    if (variable === 'segundo' ) {
      primerForm?.classList.remove('active');
      secondForm?.classList.add('active');
    } else {
      secondForm?.classList.remove('active');
      primerForm?.classList.add('active');
    }
  }

  onRegister() {
    this.mensajeErrorBackend = '';

    if (this.nuevoUsuario.password1 !== this.nuevoUsuario.password2) {
      this.mensajeErrorBackend = 'Las contraseñas no coinciden.';
      this.cambiarforma('primero');
      return;
    }

    this.authService.register(this.nuevoUsuario).subscribe({
      next: (respuesta: any) => {
        console.log('¡Registro exitoso!', respuesta);
        alert('Cuenta creada con éxito. Ya puedes iniciar sesión.');
        this.router.navigate(['/panel-control']);
      },
      error: (err: any) => {
        console.error('Error de Django:', err);


        if (err.error && typeof err.error === 'object') {
          const primerError = Object.values(err.error)[0] as string[];
          this.mensajeErrorBackend = primerError[0];
          this.cambiarforma('primero');
        } else {
          this.mensajeErrorBackend = 'Hubo un error al registrar la empresa. Revisa los datos.';
        }
      }
    });
  }
}
