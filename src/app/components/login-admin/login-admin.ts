import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, NgForm } from "@angular/forms";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './login-admin.html',
  styleUrl: './login-admin.scss',
})
export class LoginAdmin {
  vistaActual: string = '';


  nuevoEmpleado = {
    email: '',
    username: '',
    password: '',
    nombre: '',
    apellidos: ''
  };
  mensajeExito: string = '';
  mensajeError: string = '';


  nuevoProducto = {
    nombre: '',
    descripcion: '',
    precio: null,
    stock: 0,
    categoria: 'BEBIDAS'
  };


  inventario: any[] = [];
  listaInformes: any[] = [];
  turnoSeleccionadoId: number | null = null;

  subVistaVenta: 'HISTORIAL' | 'DEVOLUCIONES' = 'HISTORIAL';
  historialVentas: any[] = [];
  listaDevoluciones: any[] = [];

  constructor(
      private authService: AuthService,
      private cdr: ChangeDetectorRef
  ) {}


  cambiarVista(nuevaVista: string) {
    this.vistaActual = nuevaVista;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.turnoSeleccionadoId = null;
    this.subVistaVenta = 'HISTORIAL';

    if (nuevaVista === 'inventario' || nuevaVista === 'modificar') {
      this.cargarInventario();
    } else if (nuevaVista === 'informe') {
      this.cargarHistorialInformes();
    } else if (nuevaVista === 'devolucion') {
      this.cargarHistorialVentas();
    }
  }


  cargarInventario() {
    this.authService.obtenerInventario().subscribe({
      next: (datos: any) => {
        this.inventario = datos;
        console.log('Inventario cargado con éxito:', this.inventario);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al traer el inventario de Django:', err);
      }
    });
  }


  cargarHistorialInformes() {
    this.authService.obtenerHistorialAdmin().subscribe({
      next: (datos: any) => {
        this.listaInformes = datos;
        console.log('Historial de arqueos cargado:', this.listaInformes);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al traer los informes de la empresa:', err);
      }
    });
  }


  toggleDetalleTurno(turnoId: number) {
    if (this.turnoSeleccionadoId === turnoId) {
      this.turnoSeleccionadoId = null;
    } else {
      this.turnoSeleccionadoId = turnoId;
    }
    this.cdr.detectChanges();
  }


  alterarStockLocal(producto: any, cantidad: number) {
    if (producto.stock + cantidad < 0) return; // Evita que baje de cero por error
    producto.stock += cantidad;
    this.cdr.detectChanges();
  }


  onGuardarFilaProducto(producto: any) {
    this.mensajeExito = '';
    this.mensajeError = '';

    const datosEnviar = {
      precio: producto.precio,
      stock: producto.stock
    };

    this.authService.modificarProducto(producto.id, datosEnviar).subscribe({
      next: (res) => {
        this.mensajeExito = `¡${producto.nombre} actualizado correctamente!`;
        this.cargarInventario();
        this.cdr.detectChanges();


        setTimeout(() => {
          this.mensajeExito = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        console.error('Error al modificar producto:', err);
        this.mensajeError = `No se pudo actualizar ${producto.nombre}.`;
        this.cdr.detectChanges();
      }
    });
  }


  onCrearEmpleado(form: NgForm) {
    this.mensajeExito = '';
    this.mensajeError = '';

    this.nuevoEmpleado.email = this.nuevoEmpleado.email.toLowerCase();

    this.authService.crearEmpleado(this.nuevoEmpleado).subscribe({
      next: (respuesta) => {
        console.log(respuesta);

        this.mensajeExito = '¡Empleado creado correctamente!';
        if (form) {
          form.resetForm();
        }
        this.nuevoEmpleado.email = '';
        this.nuevoEmpleado.username = '';
        this.nuevoEmpleado.password = '';
        this.nuevoEmpleado.nombre = '';
        this.nuevoEmpleado.apellidos = '';

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al crear empleado', err);
        this.mensajeError = 'Hubo un error al crear el empleado. Revisa los datos.';
      }
    });
  }


  onCrearProducto() {
    this.mensajeExito = '';
    this.mensajeError = '';

    this.authService.crearProducto(this.nuevoProducto).subscribe({
      next: (respuesta) => {
        console.log('Producto creado:', respuesta);

        this.mensajeExito = '¡Producto añadido al catálogo correctamente!';
        this.nuevoProducto.nombre = '';
        this.nuevoProducto.descripcion = '';
        this.nuevoProducto.precio = null;
        this.nuevoProducto.stock = 0;
        this.nuevoProducto.categoria = 'BEBIDAS';

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al crear producto:', err);
        this.mensajeError = 'Error al añadir el producto. Revisa los datos en la consola.';
      }
    });
  }


  cargarHistorialVentas() {
    this.subVistaVenta = 'HISTORIAL';
    this.authService.obtenerHistorialVentas().subscribe({
      next: (datos: any) => {
        this.historialVentas = datos;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al traer historial de ventas:', err)
    });
  }


  cargarListaDevoluciones() {
    this.subVistaVenta = 'DEVOLUCIONES';
    this.authService.obtenerListaDevoluciones().subscribe({
      next: (datos: any) => {
        this.listaDevoluciones = datos;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al traer devoluciones:', err)
    });
  }


  ejecutarDevolucion(idVenta: number) {
    this.mensajeExito = '';
    this.mensajeError = '';

    this.authService.procesarDevolucionRestock(idVenta).subscribe({
      next: (res) => {
        this.mensajeExito = '¡Devolución completada y unidades restauradas en el inventario!';
        this.cargarHistorialVentas(); // Recargamos el listado para que desaparezca la fila devuelta
        this.cdr.detectChanges();
        setTimeout(() => { this.mensajeExito = ''; this.cdr.detectChanges(); }, 4000);
      },
      error: (err) => {
        this.mensajeError = 'Error al tramitar la devolución.';
        this.cdr.detectChanges();
      }
    });
  }
}