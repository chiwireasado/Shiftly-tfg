import { Component } from '@angular/core';

@Component({
  selector: 'app-registro',
  imports: [],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {

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

}
