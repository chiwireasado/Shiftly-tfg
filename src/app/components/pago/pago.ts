import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-pago',
  imports: [CommonModule],
  templateUrl: './pago.html',
  styleUrls: ['./pago.scss']
})
export class Pago implements OnInit {
  productosAProcesar: any[] = [];
  montoVisual: number = 0;


  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  card: StripeCardElement | null = null;
  clientSecret: string = '';

  cargando: boolean = false;
  mensajeError: string | null = null;


  @ViewChild('cardElement') cardElement!: ElementRef;


  constructor(private router: Router, private http: HttpClient) {
    const navegacion = this.router.getCurrentNavigation();


    if (navegacion && navegacion.extras.state && navegacion.extras.state['productos']) {
      this.productosAProcesar = navegacion.extras.state['productos'];
      console.log('Productos recibidos con éxito en la pantalla de pago:', this.productosAProcesar);
    } else {
      console.warn('No se encontraron productos. Redirigiendo...');
      this.router.navigate(['/login-user']);
    }
  }

  async ngOnInit() {
    this.stripe = await loadStripe('pk_test_51Tir7sIqEUZCnoJNN7fZXpqChBieKCIqqvGtElO4j0KxaelODr35nZgvRCCxX1O81zXIvIaJIBu7xGMJeslTmdLz00ihp8e03d');

    this.obtenerIntencionDePago();
  }

  obtenerIntencionDePago() {
    const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });


    this.http.post<{ clientSecret: string, totalCalculado: number }>(
        'https://shiftly-back.onrender.com/create-payment-intent/',
        { productos: this.productosAProcesar },
        { headers: headers }
    ).subscribe({
      next: (respuesta) => {
        this.clientSecret = respuesta.clientSecret;
        this.montoVisual = respuesta.totalCalculado;


        if (this.stripe) {
          this.elements = this.stripe.elements();
          this.card = this.elements.create('card');
          this.card.mount(this.cardElement.nativeElement);
        }
      },
      error: (err) => {
        this.mensajeError = err.error?.error || 'No se pudo iniciar la pasarela de pago.';
        console.error('Error al conectar con el servidor:', err);
      }
    });
  }


  async procesarPagoReal() {
    if (!this.stripe || !this.card || !this.clientSecret) return;

    this.cargando = true;
    this.mensajeError = null;


    const resultado = await this.stripe.confirmCardPayment(this.clientSecret, {
      payment_method: {
        card: this.card,
        billing_details: {
          name: 'Cliente General',
        },
      },
    });

    this.cargando = false;

    if (resultado.error) {
      this.mensajeError = resultado.error.message || 'Pago rechazado.';
    } else {
      if (resultado.paymentIntent?.status === 'succeeded') {
        alert('¡Cobro realizado con éxito por Stripe!');


        this.router.navigate(['/login-user']);
      }
    }
  }
}