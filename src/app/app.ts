import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  protected title = 'PaginaWebAngular';

  ngAfterViewInit(): void {
    // Aquí va todo tu código migrado de TypeScript (lo que ya tienes)
    const carrusel = document.getElementById('carrusel') as HTMLElement;
    const prevBtn = document.getElementById('prevBtn') as HTMLButtonElement;
    const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement;
    const dotsContainer = document.getElementById('dots') as HTMLElement;
    let items: HTMLElement[] = Array.from(document.querySelectorAll('.item'));

    let currentIndex = items.length;
    let isTransitioning = false;

    function duplicarItems(): void {
      const fragmentoInicio = document.createDocumentFragment();
      const fragmentoFin = document.createDocumentFragment();

      items.forEach((item) => fragmentoFin.appendChild(item.cloneNode(true)));
      items.forEach((item) =>
        fragmentoInicio.appendChild(item.cloneNode(true))
      );

      carrusel.appendChild(fragmentoFin);
      carrusel.insertBefore(fragmentoInicio, items[0]);
      items = Array.from(document.querySelectorAll('.item'));
    }

    function crearDots(): void {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < items.length / 3; i++) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dot.addEventListener('click', () => moverA(i + items.length / 3));
        dotsContainer.appendChild(dot);
      }
    }

    function actualizarCarrusel(immediate = false): void {
      if (isTransitioning) return;
      isTransitioning = true;

      const carruselWidth = carrusel.offsetWidth;
      const itemWidth = items[0].offsetWidth;
      const offset =
        itemWidth * currentIndex - carruselWidth / 2 + itemWidth / 2;

      carrusel.style.transition = immediate ? 'none' : 'transform 0.8s ease';
      carrusel.style.transform = `translateX(${-offset}px)`;

      items.forEach((item, index) => {
        item.style.transform =
          index === currentIndex ? 'scale(1.08)' : 'scale(1)';
      });

      const dotIndex = currentIndex % (items.length / 3);
      document.querySelectorAll('.dot').forEach((dot, index) => {
        (dot as HTMLElement).classList.toggle('active', index === dotIndex);
      });

      setTimeout(() => {
        if (currentIndex >= items.length - items.length / 3) {
          carrusel.style.transition = 'none';
          currentIndex = items.length / 3;
          actualizarCarrusel(true);
        } else if (currentIndex < items.length / 3) {
          carrusel.style.transition = 'none';
          currentIndex = items.length - items.length / 3 - 1;
          actualizarCarrusel(true);
        }
        isTransitioning = false;
      }, 800);
    }

    function siguiente(): void {
      if (!isTransitioning) {
        currentIndex++;
        actualizarCarrusel();
      }
    }

    function anterior(): void {
      if (!isTransitioning) {
        currentIndex--;
        actualizarCarrusel();
      }
    }

    function moverA(index: number): void {
      if (!isTransitioning) {
        currentIndex = index;
        actualizarCarrusel();
      }
    }

    duplicarItems();
    crearDots();
    actualizarCarrusel(true);

    nextBtn.addEventListener('click', siguiente);
    prevBtn.addEventListener('click', anterior);
  }
}
