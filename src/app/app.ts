import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../app/services/auth.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Review } from './model/review.model';
import { ReviewService } from './services/review.service';

declare var bootstrap: any;
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  email = '';
  password = '';

  reviewText = '';
  reviews: Review[] = [];
  rating = 5; // valor predeterminado

  public isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private reviewService: ReviewService
  ) {
    this.authService.getAuthState().subscribe((user) => {
      this.isAuthenticated = !!user; // ← AQUÍ
    });
    this.reviewService.getReviews().subscribe((reviews) => {
      this.reviews = reviews;
    });
  }

  login() {
    this.authService
      .login(this.email, this.password)
      .then(() => {
        console.log('Login exitoso');
        this.toastr.success('Inicio de sesión exitoso');
        this.cerrarModalLogin(); // función que oculta el modal
      })
      .catch((err) => {
        alert('Error al iniciar sesión: ');
        if (err.code === 'auth/email-already-in-use') {
          alert('Email already in use');
        } else if (err.code === 'auth/invalid-email') {
          alert('email invalido');
        } else if (err.code === 'auth/weak-password') {
          alert('Contraseña inválido');
        } else if (err.code) {
          alert('Something went wrong');
        }
      });
  }

  register() {
    this.authService
      .register(this.email, this.password)
      .then(() => {
        this.toastr.success('Registro exitoso');
        this.cerrarModalRegistro(); // función que oculta el modal
      })

      .catch((err) => {
        alert('Error al registrar: ');
        if (err.code === 'auth/email-already-in-use') {
          alert('Email already in use');
        } else if (err.code === 'auth/invalid-email') {
          alert('email invalido');
        } else if (err.code === 'auth/weak-password') {
          alert('Contraseña inválido');
        } else if (err.code) {
          alert('Something went wrong');
        }
      });
  }

  cerrarModalLogin() {
    const modalElement = document.getElementById('login');
    const modal = bootstrap.Modal.getInstance(modalElement); 
    modal?.hide();
  }

  cerrarModalRegistro() {
    const modalElement = document.getElementById('Registro');
    const modal = bootstrap.Modal.getInstance(modalElement); 
    modal?.hide();
  }
  logout() {
    this.authService.logout().then(() => {
      console.log('Sesión cerrada');
    });
  }

  submitReview() {
    if (this.reviewText.trim() && this.email && this.rating) {
      const newReview: Review = {
        userEmail: this.email,
        content: this.reviewText,
        rating: this.rating,
        timestamp: Date.now(),
      };

      this.reviewService.addReview(newReview).then(() => {
        this.reviewText = '';
      });
    }
  }
  getStarArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  scrollHorizontal(event: WheelEvent) {
  const container = event.currentTarget as HTMLElement;
  if (event.deltaY !== 0) {
    event.preventDefault();
    container.scrollLeft += event.deltaY;
  }
}

}
