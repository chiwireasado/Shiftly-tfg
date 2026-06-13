import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {


    private baseUrl = `${environment.apiUrl}/api/users/`;

    constructor(private http: HttpClient) {
    }


    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('access_token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    login(datos: any) {
        return this.http.post(`${this.baseUrl}login/`, datos);
    }

    register(datos: any) {
        return this.http.post(`${this.baseUrl}register/`, datos);
    }

    crearEmpleado(datosEmpleado: any) {
        const headers = this.getHeaders();
        return this.http.post(`${this.baseUrl}crear-empleado/`, datosEmpleado, { headers });
    }

    crearProducto(datosProducto: any) {
        const headers = this.getHeaders();
        return this.http.post(`${this.baseUrl}crear-producto/`, datosProducto, { headers });
    }

    obtenerInventario(): Observable<any> {
        const headers = this.getHeaders();
        return this.http.get(`${this.baseUrl}inventario/`, { headers });
    }

    registrarPago(datosPago: { metodo_pago: string, productos: any[] }): Observable<any> {
        const headers = this.getHeaders();
        return this.http.post(`${this.baseUrl}registrar-pago/`, datosPago, { headers });
    }

    cerrarTurno(): Observable<any> {
        const headers = this.getHeaders();
        return this.http.post(`${this.baseUrl}cerrar-turno/`, {}, { headers });
    }

    verInforme(): Observable<any> {
        const headers = this.getHeaders();
        return this.http.get(`${this.baseUrl}ver-informe/`, { headers });
    }

    abrirTurnoNuevo(): Observable<any> {
        const headers = this.getHeaders();
        return this.http.post(`${this.baseUrl}abrir-turno/`, {}, { headers });
    }

    obtenerHistorialAdmin(): Observable<any> {
        const headers = this.getHeaders();
        return this.http.get(`${this.baseUrl}admin/historial-informes/`, { headers });
    }

    modificarProducto(id: number, datos: { precio: number, stock: number }): Observable<any> {
        const headers = this.getHeaders();
        return this.http.put(`${this.baseUrl}modificar-producto/${id}/`, datos, { headers });
    }

    obtenerHistorialVentas(): Observable<any> {
        const headers = this.getHeaders();
        return this.http.get(`${this.baseUrl}admin/devoluciones/`, { headers });
    }

    procesarDevolucionRestock(idVenta: number): Observable<any> {
        const headers = this.getHeaders();
        return this.http.post(`${this.baseUrl}admin/devolver-item/${idVenta}/`, {}, { headers });
    }

    obtenerListaDevoluciones(): Observable<any> {
        const headers = this.getHeaders();
        return this.http.get(`${this.baseUrl}admin/lista-devoluciones/`, { headers });
    }
}