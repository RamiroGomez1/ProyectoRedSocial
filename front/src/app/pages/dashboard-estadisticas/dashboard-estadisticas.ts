import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { GraficoBarras } from '../../components/graficos/grafico-barras';
import { GraficoLineas } from '../../components/graficos/grafico-lineas';
import { GraficoTorta } from '../../components/graficos/grafico-torta';
import { DatoGrafico } from '../../components/graficos/paleta';
import { PluralizarPipe } from '../../pipes/pluralizar.pipe';
import { mensajeDeError } from '../../services/auth.service';
import { EstadisticasService } from '../../services/estadisticas.service';

const DIAS_POR_DEFECTO = 30;
const TOPE_BARRAS = 8;

function etiquetaDia(fecha: string): string {
  return `${Number(fecha.slice(8))}/${Number(fecha.slice(5, 7))}`;
}

function aTexto(fecha: Date): string {
  const mes = `${fecha.getMonth() + 1}`.padStart(2, '0');
  const dia = `${fecha.getDate()}`.padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

@Component({
  selector: 'app-dashboard-estadisticas',
  imports: [
    ReactiveFormsModule,
    GraficoBarras,
    GraficoLineas,
    GraficoTorta,
    PluralizarPipe,
  ],
  templateUrl: './dashboard-estadisticas.html',
  styleUrl: './dashboard-estadisticas.css',
})
export class DashboardEstadisticas implements OnInit {
  private fb = inject(FormBuilder);
  private estadisticasService = inject(EstadisticasService);

  protected cargando = signal(true);
  protected errorCarga = signal<string | null>(null);

  protected publicacionesPorUsuario = signal<DatoGrafico[]>([]);
  protected comentariosPorDia = signal<DatoGrafico[]>([]);
  protected comentariosPorPublicacion = signal<DatoGrafico[]>([]);
  protected ingresosPorUsuario = signal<DatoGrafico[]>([]);
  protected visitasAMiPerfil = signal<DatoGrafico[]>([]);
  protected meGustaPorDia = signal<DatoGrafico[]>([]);

  protected totalPublicaciones = signal(0);
  protected totalComentarios = signal(0);
  protected totalIngresos = signal(0);
  protected totalVisitas = signal(0);
  protected totalMeGusta = signal(0);

  protected form = this.fb.nonNullable.group({
    desde: [aTexto(new Date(Date.now() - DIAS_POR_DEFECTO * 24 * 60 * 60 * 1000))],
    hasta: [aTexto(new Date())],
  });

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.errorCarga.set(null);

    const rango = this.form.getRawValue();

    forkJoin({
      publicaciones: this.estadisticasService.publicacionesPorUsuario(rango),
      comentariosDia: this.estadisticasService.comentariosPorDia(rango),
      comentariosPost: this.estadisticasService.comentariosPorPublicacion(rango),
      ingresos: this.estadisticasService.ingresosPorUsuario(rango),
      visitas: this.estadisticasService.visitasAMiPerfil(rango),
      meGusta: this.estadisticasService.meGustaPorDia(rango),
    }).subscribe({
      next: ({
        publicaciones,
        comentariosDia,
        comentariosPost,
        ingresos,
        visitas,
        meGusta,
      }) => {
        this.publicacionesPorUsuario.set(
          publicaciones.datos.slice(0, TOPE_BARRAS).map((d) => ({
            etiqueta: `@${d.nombreUsuario}`,
            valor: d.cantidad,
          })),
        );
        this.totalPublicaciones.set(
          publicaciones.datos.reduce((suma, d) => suma + d.cantidad, 0),
        );

        this.comentariosPorDia.set(
          comentariosDia.datos.map((d) => ({
            etiqueta: etiquetaDia(d.fecha),
            valor: d.cantidad,
          })),
        );
        this.totalComentarios.set(
          comentariosDia.datos.reduce((suma, d) => suma + d.cantidad, 0),
        );

        this.comentariosPorPublicacion.set(
          comentariosPost.datos.map((d) => ({
            etiqueta: d.titulo,
            valor: d.cantidad,
          })),
        );

        this.ingresosPorUsuario.set(
          ingresos.datos.slice(0, TOPE_BARRAS).map((d) => ({
            etiqueta: `@${d.nombreUsuario}`,
            valor: d.cantidad,
          })),
        );
        this.totalIngresos.set(
          ingresos.datos.reduce((suma, d) => suma + d.cantidad, 0),
        );

        this.visitasAMiPerfil.set(
          visitas.datos.slice(0, TOPE_BARRAS).map((d) => ({
            etiqueta: `@${d.nombreUsuario}`,
            valor: d.cantidad,
          })),
        );
        this.totalVisitas.set(
          visitas.datos.reduce((suma, d) => suma + d.cantidad, 0),
        );

        this.meGustaPorDia.set(
          meGusta.datos.map((d) => ({
            etiqueta: etiquetaDia(d.fecha),
            valor: d.cantidad,
          })),
        );
        this.totalMeGusta.set(
          meGusta.datos.reduce((suma, d) => suma + d.cantidad, 0),
        );

        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.errorCarga.set(mensajeDeError(err));
      },
    });
  }

  aplicar() {
    this.cargar();
  }

  ultimos(dias: number) {
    this.form.setValue({
      desde: aTexto(new Date(Date.now() - dias * 24 * 60 * 60 * 1000)),
      hasta: aTexto(new Date()),
    });
    this.cargar();
  }
}
