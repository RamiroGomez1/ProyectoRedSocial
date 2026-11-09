import { Component, computed, inject, signal } from '@angular/core';
import { PostCard } from '../../components/post-card/post-card';
import { ModalService } from '../../services/modal.service';
import { PUBLICACIONES_MOCK } from '../../models/datos-mock';
import { Publicacion } from '../../models/publicacion';

type Orden = 'fecha' | 'meGusta';

@Component({
  selector: 'app-publicaciones',
  imports: [PostCard],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones {
  private modal = inject(ModalService);

  protected readonly porPagina = 3;
  protected publicaciones = signal<Publicacion[]>(PUBLICACIONES_MOCK);
  protected orden = signal<Orden>('fecha');
  protected pagina = signal(1);

  protected totalPaginas = computed(() =>
    Math.ceil(this.publicaciones().length / this.porPagina),
  );

  protected visibles = computed(() => {
    const ordenadas = [...this.publicaciones()].sort((a, b) =>
      this.orden() === 'fecha'
        ? new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        : b.meGusta - a.meGusta,
    );
    const desde = (this.pagina() - 1) * this.porPagina;
    return ordenadas.slice(desde, desde + this.porPagina);
  });

  cambiarOrden(evento: Event) {
    this.orden.set((evento.target as HTMLSelectElement).value as Orden);
    this.pagina.set(1);
  }

  alternarMeGusta(post: Publicacion) {
    this.publicaciones.update((lista) =>
      lista.map((p) =>
        p.id === post.id
          ? { ...p, leDiMeGusta: !p.leDiMeGusta, meGusta: p.meGusta + (p.leDiMeGusta ? -1 : 1) }
          : p,
      ),
    );
  }

  publicar(evento: Event) {
    evento.preventDefault();
    this.modal.info(
      'Próximamente',
      'La creación de publicaciones se habilita en el próximo sprint.',
    );
  }
}
