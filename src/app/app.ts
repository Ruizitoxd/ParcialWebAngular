import {
  Component,
  HostListener,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { AuthService } from '../app/services/auth.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Review } from './model/review.model';
import { ReviewService } from './services/review.service';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import emailjs from 'emailjs-com';

declare var bootstrap: any;
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements AfterViewInit {
  protected title = 'PaginaWebAngular';
  isShrunk = false;

  @ViewChild('headerRef') headerElement!: ElementRef<HTMLElement>;

  private initialHeight = 0;

  ngOnInit() {
    this.onWindowScroll();
  }

  ngAfterViewInit(): void {
    // Guardamos la altura original del header
    this.initialHeight = this.headerElement.nativeElement.offsetHeight;
    this.setHeaderHeight(this.initialHeight);
    this.onWindowScroll(); // Para ajustar si se recarga con scroll

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

    setTimeout(() => {
      flatpickr('#datepicker', {
        dateFormat: 'Y-m-d',
        defaultDate: new Date(),
        onChange: (selectedDates, dateStr) => {
          console.log('Fecha seleccionada:', dateStr);
        },
      });
    }, 0);
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

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    this.isShrunk = scrollY > 50;
    const newHeight = this.isShrunk
      ? this.initialHeight / 2
      : this.initialHeight;
    this.setHeaderHeight(newHeight);
  }

  private setHeaderHeight(height: number) {
    this.headerElement.nativeElement.style.height = `${height}px`;
  }

  //Activar botones deslizables
  tipoSeleccionado = 'almuerzo';

  seleccionarTipo(tipo: string) {
    this.tipoSeleccionado = tipo;
    const slider = document.getElementById('sliderToggle');
    const btnAlmuerzo = document.getElementById('btn-almuerzo');
    const btnCena = document.getElementById('btn-cena');

    if (slider) {
      slider.classList.remove('left', 'right');
      slider.classList.add(tipo === 'almuerzo' ? 'left' : 'right');
    }

    btnAlmuerzo?.classList.remove('active');
    btnCena?.classList.remove('active');

    if (tipo === 'almuerzo') {
      btnAlmuerzo?.classList.add('active');
    } else {
      btnCena?.classList.add('active');
    }
  }

  //Activar dropdwons
  dropdownVisible = {
    personas: false,
    hora: false,
  };

  toggleDropdown(tipo: 'personas' | 'hora') {
    this.dropdownVisible[tipo] = !this.dropdownVisible[tipo];
    const content = document.querySelector(`.${tipo}-dropdown-content`);
    if (content) {
      content.classList.toggle(`${tipo}-show-menu`, this.dropdownVisible[tipo]);
    }
  }

  cantidadPersonas: string = '';
  horaSeleccionada: string = '';

  // Selección desde el menú
  seleccionarPersona(valor: number) {
    if (valor <= 3) {
      this.cantidadPersonas = valor.toString();
    } else {
      this.cantidadPersonas = 'Más de 3';
    }

    this.dropdownVisible.personas = false;
  }

  seleccionarHora(hora: string) {
    this.horaSeleccionada = hora;
    this.dropdownVisible.hora = false;
  }

  validarCantidadPersonas() {
    const num = parseInt(this.cantidadPersonas);
    if (isNaN(num) || num < 1) {
      this.cantidadPersonas = '1';
    } else if (num > 3) {
      this.cantidadPersonas = 'Más de 3';
    } else {
      this.cantidadPersonas = num.toString();
    }
  }

  // Puedes ajustar los rangos que quieras aquí
  validarHoraSeleccionada() {
    const hora = this.horaSeleccionada.trim();
    const horasValidas = [
      '16:00',
      '17:00',
      '18:00',
      '19:00',
      '20:00',
      '21:00',
      '22:00',
      '23:00',
    ]; // Puedes expandirla

    if (!horasValidas.includes(hora)) {
      this.horaSeleccionada = horasValidas[0]; // Valor por defecto
    }
  }

  @HostListener('document:click', ['$event'])
  cerrarDropdowns(event: Event) {
    const target = event.target as HTMLElement;
    if (
      !target.closest('.personas-dropdown') &&
      !target.closest('.personas-dropdown-content')
    ) {
      this.dropdownVisible.personas = false;
    }
    if (
      !target.closest('.hora-dropdown') &&
      !target.closest('.hora-dropdown-content')
    ) {
      this.dropdownVisible.hora = false;
    }
  }

  enviarResumenReserva(): void {
    const nombre = (document.getElementById('nombre') as HTMLInputElement)
      .value;
    const correo = (document.getElementById('email') as HTMLInputElement).value;
    const telefono = (document.getElementById('telefono') as HTMLInputElement)
      .value;
    const fecha = (document.getElementById('datepicker') as HTMLInputElement)
      .value;

    if (
      !nombre ||
      !correo ||
      !telefono ||
      !this.tipoSeleccionado ||
      !this.cantidadPersonas ||
      !this.horaSeleccionada ||
      !fecha
    ) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    const templateParams = {
      nombre: nombre,
      correo: correo,
      telefono: telefono,
      tipo: this.tipoSeleccionado,
      fecha: fecha,
      hora: this.horaSeleccionada,
      personas: this.cantidadPersonas,
    };

    emailjs
      .send(
        'service_27ef3v8',
        'template_tvz6kbr',
        templateParams,
        '5ZTm-Uw46BykPjmdj'
      )
      .then((response) => {
        console.log('Correo enviado', response.status, response.text);
        alert('¡Reserva enviada exitosamente! Revisa tu correo.');
      })
      .catch((error) => {
        console.error('Error al enviar el correo', error);
        alert('Hubo un problema al enviar la reserva.');
      });
  }
}
