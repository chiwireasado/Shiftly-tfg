import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: 'app-login-user',
  imports: [CommonModule, FormsModule],
  templateUrl: './login-user.html',
  styleUrl: './login-user.scss',
})
export class LoginUser implements OnInit {

  vistaActual: string = 'ventas';

  nombreEmpleado: string = 'Cargando...';

  todosLosProductos: any[] = [];
  productosFiltrados: any[] = [];
  modoVista: 'CATEGORIAS' | 'PRODUCTOS' = 'CATEGORIAS';
  categoriaSeleccionada: string = '';


  ticket: any[] = [];
  totalTicket: number = 0;


  mensajeAccion: string = '';
  turnoActivo: boolean = true;
  datosInforme: any = null;

  constructor(
      private authService: AuthService,
      private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarInventarioCompleto();
    this.obtenerNombreUsuarioLogueado();
  }

  obtenerNombreUsuarioLogueado() {
    const usuarioString = localStorage.getItem('usuario');
    const token = localStorage.getItem('access_token');

    if (usuarioString) {
      try {
        const usuarioObj = JSON.parse(usuarioString);
        this.nombreEmpleado = usuarioObj.nombre || usuarioObj.username || 'Empleado';
        this.cdr.detectChanges();
        return;
      } catch (e) {
        console.error('error al parsear objeto usuario: ', e);
      }
    }
    if (token) {
      try {
        // Un token JWT tiene 3 partes separadas por puntos; la del medio (índice 1) contiene los datos del usuario
        const payloadBase64 = token.split('.')[1];
        const payloadDecodificado = atob(payloadBase64); // Decodifica el Base64 estándar
        const datosToken = JSON.parse(payloadDecodificado);

        console.log('Datos extraídos del Token JWT:', datosToken);

        // Revisa en la consola de tu navegador cómo se llama el campo en tu token de Django.
        // Los estándar de Simple JWT suelen ser 'username', 'user_id', o puedes haberle añadido 'nombre'.
        this.nombreEmpleado = datosToken.nombre || datosToken.username || datosToken.user_id || 'Cajero';
      } catch (error) {
        console.error('Error al decodificar el token JWT:', error);
        this.nombreEmpleado = 'Cajero Activo';
      }
    } else {
      this.nombreEmpleado = 'Sin Sesión';
    }

    this.cdr.detectChanges();
  }


  cargarInventarioCompleto() {
    this.authService.obtenerInventario().subscribe({
      next: (datos: any) => {
        this.todosLosProductos = datos;
        console.log('Catálogo cargado con éxito:', this.todosLosProductos);
      },
      error: (err) => console.error('Error al traer productos de Django:', err)
    });
  }

  seleccionarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;

    this.productosFiltrados = this.todosLosProductos.filter(
        p => p.categoria.toUpperCase() === categoria.toUpperCase()
    );

    this.modoVista = 'PRODUCTOS';
    this.cdr.detectChanges();
  }


  volverACategorias() {
    this.modoVista = 'CATEGORIAS';
    this.categoriaSeleccionada = '';
    this.productosFiltrados = [];
    this.cdr.detectChanges();
  }


  agregarAlTicket(producto: any) {
    const productoExistente = this.ticket.find(item => item.id === producto.id);

    if (productoExistente) {
      productoExistente.cantidad += 1;
    } else {
      this.ticket.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: parseFloat(producto.precio),
        cantidad: 1
      });
    }

    this.calcularTotal();
  }


  calcularTotal() {
    this.totalTicket = this.ticket.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    this.cdr.detectChanges();
  }


  cancelarOVaciarTicket() {
    this.ticket = [];
    this.totalTicket = 0;
    this.cdr.detectChanges();
  }


  ejecutarAccionCaja(accion: string) {
    this.mensajeAccion = '';
    this.cdr.detectChanges();

    if (accion === 'informe') {
      this.mensajeAccion = 'Se ha creado el informe de caja correctamente';
    } else if (accion === 'cajon') {
      this.mensajeAccion = 'Se ha abierto la caja';
    } else if (accion === 'buzon') {
      this.mensajeAccion = 'Buzón vaciado.';
    }

    setTimeout(() => {
      this.mensajeAccion = '';
      this.cdr.detectChanges();
    }, 4000);
  }


  procesarPago(metodo: 'EFECTIVO' | 'TARJETA') {
    if (this.ticket.length === 0) {
      this.mensajeAccion = 'No se puede procesar un pago con el ticket vacío';
      return;
    }

    const datosParaEnviar = {
      metodo_pago: metodo,
      productos: this.ticket.map(item => ({
        id: item.id,
        cantidad: item.cantidad
      }))
    };

    this.mensajeAccion = 'Procesando pago...';

    this.authService.registrarPago(datosParaEnviar).subscribe({
      next: (res) => {
        this.mensajeAccion = `¡Pago con ${metodo.toLowerCase()} exitoso!`;
        this.cancelarOVaciarTicket();
        this.cargarInventarioCompleto();
      },
      error: (err) => {
        console.error('Error al procesar el pago:', err);
        if (err.error && err.error.error) {
          this.mensajeAccion = `Error: ${err.error.error}`;
        } else {
          this.mensajeAccion = 'Hubo un problema al conectar con la caja';
        }
        this.cdr.detectChanges();
      }
    });
  }


  cerrarTurnoEmpleado() {
    this.authService.cerrarTurno().subscribe({
      next: (res) => {
        this.mensajeAccion = 'Turno cerrado con éxito. Ya puedes solicitar el informe de caja.';
        this.turnoActivo = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mensajeAccion = `${err.error.error || 'Error al cerrar el turno.'}`;
        this.cdr.detectChanges();
      }
    });
  }


  abrirTurnoEmpleado() {
    this.authService.abrirTurnoNuevo().subscribe({
      next: (res) => {
        this.mensajeAccion = 'Nuevo turno abierto';

        this.turnoActivo = true;

        this.datosInforme = null;

        this.cambiarVista('ventas');

        this.cancelarOVaciarTicket();

        this.volverACategorias();

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al abrir turno:', err);
        this.mensajeAccion = `${err.error?.error || 'Error al abrir el turno.'}`;
        this.cdr.detectChanges();
      }
    });
  }


  cargarInformeFinal() {
    this.authService.verInforme().subscribe({
      next: (datos) => {
        this.datosInforme = datos;
        this.cambiarVista('informe');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mensajeAccion = `${err.error.error || 'No se pudo cargar el informe.'}`;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarVista(nuevaVista: string){
    this.vistaActual = nuevaVista;
  }
}