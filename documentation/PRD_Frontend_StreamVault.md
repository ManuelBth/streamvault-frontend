# PRD — Frontend Service

## StreamVault by Betha

### Angular 21 · TypeScript · TailwindCSS · Docker · NGINX

---

> **Versión:** 1.2.0  
> **VM:** VM-1 — `192.168.1.10:8080`
> **Equipos:** Betha  
> **Fecha:** 2026
> **Estado:** Compatible con API Reference v1.0

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Identidad Visual y Design System](#2-identidad-visual-y-design-system)
3. [Principios de Arquitectura](#3-principios-de-arquitectura)
4. [Roles y Permisos](#4-roles-y-permisos)
5. [Estructura de Paquetes — Screaming Architecture](#5-estructura-de-paquetes--screaming-architecture)
6. [Principio Componente-Presentacional por Dominio](#6-principio-componente-presentacional-por-dominio)
7. [Páginas y Vistas](#7-páginas-y-vistas)
8. [Servicios por Dominio](#8-servicios-por-dominio)
9. [Guards e Interceptores](#9-guards-e-interceptores)
10. [Estado Global con Signals](#10-estado-global-con-signals)
11. [Routing con Lazy Loading](#11-routing-con-lazy-loading)
12. [Responsive Design con TailwindCSS](#12-responsive-design-con-tailwindcss)
13. [Comunicación con el Backend](#13-comunicación-con-el-backend)
14. [Dependencias — package.json](#14-dependencias--packagejson)
15. [Configuración NGINX y Docker](#15-configuración-nginx-y-docker)
16. [Variables de Entorno](#16-variables-de-entorno)
17. [Extensiones Recomendadas](#17-extensiones-recomendadas)

---

## 1. Visión General

**StreamVault** es el frontend de la plataforma de streaming desarrollada por el equipo **Betha**. Es una SPA (Single Page Application) construida en Angular 21 con estética dark mode inspirada en Netflix.

Se comunica con el backend Spring Boot en VM-2 (`192.168.1.20:8080`) via HTTPS REST y WebSocket STOMP. Soporta dos roles: `ROLE_USER` y `ROLE_ADMIN`, cada uno con acceso diferenciado a las funcionalidades de la plataforma.

> **⚠️ Restricción importante:** El backend solo acepta registros con emails del dominio `@streamvault.com`. Cualquier otro dominio será rechazado con error 400.

### Decisiones arquitectónicas clave

| Decisión                 | Elección                               | Razón                                                         |
| ------------------------ | -------------------------------------- | ------------------------------------------------------------- |
| Arquitectura de carpetas | Screaming Architecture                 | El proyecto grita los dominios del negocio, no el framework   |
| Patrón de componentes    | Componente-Presentacional (Smart/Dumb) | Separación de responsabilidades, reutilización y testabilidad |
| Estilos                  | TailwindCSS                            | Utilidades CSS sin salir del HTML, dark mode nativo           |
| Carga de módulos         | Lazy Components (standalone)           | Performance — solo carga lo que necesita el usuario           |
| Estado global            | Angular Signals                        | Reactivo, simple, sin NgRx para este tamaño de proyecto       |
| Responsive               | Mobile-first con Tailwind breakpoints  | Usable en cualquier dispositivo dentro de la red              |

---

## 2. Identidad Visual y Design System

### 2.1 Paleta de colores

| Token                    | Valor HEX | Uso                                |
| ------------------------ | --------- | ---------------------------------- |
| `--color-bg-primary`     | `#141414` | Fondo principal (negro Netflix)    |
| `--color-bg-secondary`   | `#1F1F1F` | Tarjetas, paneles, modales         |
| `--color-bg-tertiary`    | `#2C2C2C` | Hover states, inputs               |
| `--color-accent`         | `#E50914` | Botones primarios, acento de marca |
| `--color-accent-hover`   | `#B20710` | Hover del acento                   |
| `--color-text-primary`   | `#FFFFFF` | Títulos y texto principal          |
| `--color-text-secondary` | `#B3B3B3` | Texto de apoyo, subtítulos         |
| `--color-text-muted`     | `#757575` | Placeholders, texto deshabilitado  |
| `--color-border`         | `#333333` | Bordes de inputs y tarjetas        |
| `--color-success`        | `#2ECC71` | Estados de éxito, confirmaciones   |
| `--color-error`          | `#E74C3C` | Errores de validación              |
| `--color-warning`        | `#F39C12` | Alertas y advertencias             |

### 2.2 Configuración de TailwindCSS

Archivo: `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "sv-black": "#141414",
        "sv-dark": "#1F1F1F",
        "sv-card": "#2C2C2C",
        "sv-red": "#E50914",
        "sv-red-hover": "#B20710",
        "sv-text": "#FFFFFF",
        "sv-muted": "#B3B3B3",
        "sv-border": "#333333",
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
      aspectRatio: {
        video: "16 / 9",
        poster: "2 / 3",
        backdrop: "16 / 6",
      },
      screens: {
        xs: "375px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [],
};
```

### 2.3 Tipografía

| Uso               | Clase Tailwind                       | Tamaño      |
| ----------------- | ------------------------------------ | ----------- |
| Título hero       | `text-4xl md:text-6xl font-bold`     | 36px / 60px |
| Título de sección | `text-2xl md:text-3xl font-semibold` | 24px / 30px |
| Título de tarjeta | `text-base md:text-lg font-medium`   | 16px / 18px |
| Cuerpo de texto   | `text-sm md:text-base`               | 14px / 16px |
| Texto muted       | `text-xs text-sv-muted`              | 12px        |

---

## 3. Principios de Arquitectura

### 3.1 Screaming Architecture

La estructura de carpetas **grita los dominios del negocio** de StreamVault. Al abrir `src/app/` lo primero que se lee son los dominios: `auth`, `catalog`, `player`, `profile`, `admin` — no carpetas técnicas como `components`, `services` o `pipes`.

```
❌ Arquitectura técnica (NO usar)        ✅ Screaming Architecture (usar)
──────────────────────────────────       ──────────────────────────────
src/app/                                 src/app/
├── components/                          ├── auth/
├── services/                            ├── catalog/
├── models/                              ├── player/
└── pipes/                               ├── profile/
                                         ├── contact/
                                         └── admin/
```

### 3.2 Principio Componente-Presentacional (Smart / Dumb)

Cada dominio separa sus componentes en dos tipos:

#### Componente Inteligente (Smart / Container)

- **Sabe** de la existencia del backend y los servicios
- **Inyecta** servicios, hace llamadas HTTP, maneja estado
- **Orquesta** los componentes presentacionales
- **Archivos:** `*.page.ts` o `*.container.ts`
- **No tiene** lógica de presentación visual

#### Componente Presentacional (Dumb / UI)

- **No sabe** nada del backend ni de servicios
- **Recibe** datos via `@Input()` y emite eventos via `@Output()`
- **Solo** renderiza lo que recibe
- **Archivos:** `*.component.ts`
- **Altamente** reutilizable y testeable de forma aislada

```
Dominio catalog/
│
├── pages/
│   └── catalog-page.component.ts     ← SMART: llama CatalogService,
│                                        maneja estado, orquesta UI
└── components/
    ├── content-card.component.ts     ← DUMB: @Input() content, @Output() onPlay
    ├── carousel.component.ts         ← DUMB: @Input() items, @Output() onSelect
    └── content-grid.component.ts     ← DUMB: @Input() contents[]
```

### 3.3 Standalone Components con Lazy Loading

Todos los componentes son **standalone** (Angular 21). Las páginas se cargan de forma **lazy** — el bundle de cada dominio solo se descarga cuando el usuario navega a él.

```typescript
// Cada página es standalone y se carga lazy desde el router
{
  path: 'catalog',
  loadComponent: () =>
    import('./catalog/pages/catalog-page.component')
      .then(m => m.CatalogPageComponent)
}
```

---

## 4. Roles y Permisos

| Sección / Funcionalidad                        | USER | ADMIN |
| ---------------------------------------------- | ---- | ----- |
| Landing / Login / Registro                     | ✅   | ✅    |
| Home — Catálogo de videos                      | ✅   | ✅    |
| Detalle de contenido                           | ✅   | ✅    |
| Reproductor de video (Player HLS)              | ✅   | ✅    |
| Búsqueda de contenido                          | ✅   | ✅    |
| Mi Perfil                                      | ✅   | ✅    |
| Historial de reproducción                      | ✅   | ✅    |
| Configuración de cuenta                        | ✅   | ✅    |
| Formulario de contacto / Email                 | ✅   | ✅    |
| Notificaciones WebSocket                       | ✅   | ✅    |
| Panel Admin — Gestión de contenido             | ❌   | ✅    |
| Panel Admin — Subir / editar / eliminar videos | ❌   | ✅    |
| Panel Admin — Ver usuarios registrados         | ❌   | ✅    |

---

## 5. Estructura de Paquetes — Screaming Architecture

```
src/
│
├── app/
│   │
│   ├── StreamVaultApplication   (bootstrap)
│   │
│   │   ══════════════════════════════════════
│   │   DOMINIO: AUTENTICACIÓN
│   │   ══════════════════════════════════════
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── login-page.component.ts         ← SMART
│   │   │   ├── register-page.component.ts      ← SMART
│   │   │   └── confirm-email-page.component.ts ← SMART
│   │   ├── components/
│   │   │   ├── login-form.component.ts         ← DUMB
│   │   │   └── register-form.component.ts      ← DUMB
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── token.service.ts
│   │   ├── models/
│   │   │   ├── login-request.model.ts
│   │   │   ├── register-request.model.ts
│   │   │   └── token-response.model.ts
│   │   └── auth.routes.ts
│   │
│   │   ══════════════════════════════════════
│   │   DOMINIO: CATÁLOGO
│   │   ══════════════════════════════════════
│   ├── catalog/
│   │   ├── pages/
│   │   │   ├── home-page.component.ts          ← SMART
│   │   │   └── content-detail-page.component.ts← SMART
│   │   ├── components/
│   │   │   ├── hero.component.ts               ← DUMB
│   │   │   ├── content-card.component.ts       ← DUMB
│   │   │   ├── content-grid.component.ts       ← DUMB
│   │   │   ├── carousel.component.ts           ← DUMB
│   │   │   ├── genre-badge.component.ts        ← DUMB
│   │   │   └── content-rating.component.ts     ← DUMB
│   │   ├── services/
│   │   │   └── catalog.service.ts
│   │   ├── models/
│   │   │   ├── content.model.ts
│   │   │   ├── season.model.ts
│   │   │   ├── episode.model.ts
│   │   │   └── genre.model.ts
│   │   └── catalog.routes.ts
│   │
│   │   ══════════════════════════════════════
│   │   DOMINIO: REPRODUCTOR
│   │   ══════════════════════════════════════
│   ├── player/
│   │   ├── pages/
│   │   │   └── player-page.component.ts        ← SMART
│   │   ├── components/
│   │   │   ├── video-player.component.ts       ← DUMB
│   │   │   ├── player-controls.component.ts    ← DUMB
│   │   │   ├── progress-bar.component.ts       ← DUMB
│   │   │   └── volume-control.component.ts     ← DUMB
│   │   ├── services/
│   │   │   ├── stream.service.ts
│   │   │   └── hls.service.ts
│   │   ├── models/
│   │   │   └── stream-url.model.ts
│   │   └── player.routes.ts
│   │
│   │   ══════════════════════════════════════
│   │   DOMINIO: PERFIL
│   │   ══════════════════════════════════════
│   ├── profile/
│   │   ├── pages/
│   │   │   ├── profile-page.component.ts       ← SMART
│   │   │   └── settings-page.component.ts      ← SMART
│   │   ├── components/
│   │   │   ├── profile-card.component.ts       ← DUMB
│   │   │   ├── profile-selector.component.ts   ← DUMB
│   │   │   ├── profile-form.component.ts       ← DUMB
│   │   │   ├── avatar-picker.component.ts      ← DUMB
│   │   │   ├── watch-history-list.component.ts ← DUMB
│   │   │   └── subscription-badge.component.ts ← DUMB
│   │   ├── services/
│   │   │   ├── user.service.ts
│   │   │   ├── subscription.service.ts
│   │   │   ├── profile.service.ts
│   │   │   └── history.service.ts
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── profile.model.ts
│   │   │   ├── subscription.model.ts
│   │   │   └── watch-history.model.ts
│   │   └── profile.routes.ts
│   │
│   │   ══════════════════════════════════════
│   │   DOMINIO: CONTACTO
│   │   ══════════════════════════════════════
│   ├── contact/
│   │   ├── pages/
│   │   │   └── contact-page.component.ts       ← SMART
│   │   ├── components/
│   │   │   └── contact-form.component.ts       ← DUMB
│   │   ├── services/
│   │   │   └── mail.service.ts
│   │   ├── models/
│   │   │   └── mail-request.model.ts
│   │   └── contact.routes.ts
│   │
│   │   ══════════════════════════════════════
│   │   DOMINIO: ADMINISTRACIÓN
│   │   ══════════════════════════════════════
│   ├── admin/
│   │   ├── pages/
│   │   │   ├── dashboard-page.component.ts     ← SMART
│   │   │   ├── content-list-page.component.ts  ← SMART
│   │   │   ├── content-form-page.component.ts  ← SMART
│   │   │   └── user-list-page.component.ts     ← SMART
│   │   ├── components/
│   │   │   ├── admin-sidebar.component.ts      ← DUMB
│   │   │   ├── admin-table.component.ts        ← DUMB
│   │   │   ├── content-form.component.ts       ← DUMB
│   │   │   ├── upload-dropzone.component.ts    ← DUMB
│   │   │   ├── upload-progress.component.ts    ← DUMB
│   │   │   ├── user-table.component.ts         ← DUMB
│   │   │   └── dashboard-stats.component.ts    ← DUMB
│   │   ├── services/
│   │   │   ├── admin-content.service.ts
│   │   │   └── admin-user.service.ts
│   │   ├── models/
│   │   │   ├── admin-user.model.ts
│   │   │   └── upload-response.model.ts
│   │   └── admin.routes.ts
│   │
│   │   ══════════════════════════════════════
│   │   INFRAESTRUCTURA TRANSVERSAL
│   │   ══════════════════════════════════════
│   └── shared/
│       ├── layout/
│       │   ├── navbar.component.ts             ← DUMB
│       │   ├── footer.component.ts             ← DUMB
│       │   ├── main-layout.component.ts        ← SMART (orquesta layout)
│       │   ├── auth-layout.component.ts        ← SMART
│       │   └── admin-layout.component.ts       ← SMART
│       ├── components/
│       │   ├── search-bar.component.ts         ← DUMB
│       │   ├── notification-toast.component.ts ← DUMB
│       │   ├── loading-spinner.component.ts    ← DUMB
│       │   ├── modal.component.ts              ← DUMB
│       │   ├── error-page.component.ts         ← DUMB
│       │   ├── badge-role.component.ts         ← DUMB
│       │   └── confirm-dialog.component.ts     ← DUMB
│       ├── guards/
│       │   ├── auth.guard.ts
│       │   ├── admin.guard.ts
│       │   └── guest.guard.ts
│       ├── interceptors/
│       │   ├── auth.interceptor.ts
│       │   ├── refresh.interceptor.ts
│       │   ├── error.interceptor.ts
│       │   └── loading.interceptor.ts
│       ├── services/
│       │   ├── websocket.service.ts
│       │   └── notification.service.ts
│       ├── store/
│       │   └── app.store.ts                    (Signals globales)
│       ├── models/
│       │   └── api-response.model.ts
│       └── pipes/
│           ├── duration.pipe.ts
│           └── truncate.pipe.ts
│
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
│
└── assets/
    ├── images/
    │   ├── logo.svg
    │   └── placeholder-poster.jpg
    └── styles/
        └── global.css                          (Tailwind base + custom)
```

---

## 6. Principio Componente-Presentacional por Dominio

### 6.1 Reglas generales

| Regla              | Smart (Page) | Dumb (Component) |
| ------------------ | ------------ | ---------------- |
| Inyecta servicios  | ✅ Sí        | ❌ No            |
| Hace llamadas HTTP | ✅ Sí        | ❌ No            |
| Tiene `@Input()`   | Rara vez     | ✅ Siempre       |
| Tiene `@Output()`  | Rara vez     | ✅ Para eventos  |
| Conoce el Router   | ✅ Sí        | ❌ No            |
| Maneja estado      | ✅ Sí        | ❌ No            |
| Lógica de negocio  | ✅ Sí        | ❌ No            |
| Reutilizable       | ❌ No        | ✅ Sí            |
| Testeable aislado  | Difícil      | ✅ Fácil         |

### 6.2 Ejemplo aplicado — Dominio `catalog`

#### Smart: `home-page.component.ts`

```typescript
@Component({
  selector: "app-home-page",
  standalone: true,
  imports: [CarouselComponent, HeroComponent, SearchBarComponent],
  template: `
    <app-hero [content]="featured()" />
    <app-search-bar (onSearch)="handleSearch($event)" />
    @for (group of catalogGroups(); track group.genre) {
      <app-carousel
        [title]="group.genre"
        [items]="group.contents"
        (onSelect)="navigateToDetail($event)"
        (onPlay)="navigateToPlayer($event)"
      />
    }
  `,
})
export class HomePageComponent {
  private catalogService = inject(CatalogService);
  private router = inject(Router);

  // Estado local con Signals
  catalogGroups = signal<CatalogGroup[]>([]);
  featured = signal<Content | null>(null);

  constructor() {
    this.loadCatalog();
  }

  private loadCatalog(): void {
    this.catalogService.getCatalog().subscribe((data) => {
      this.catalogGroups.set(data.groups);
      this.featured.set(data.featured);
    });
  }

  handleSearch(query: string): void {
    this.router.navigate(["/catalog"], { queryParams: { q: query } });
  }

  navigateToDetail(content: Content): void {
    this.router.navigate(["/catalog", content.id]);
  }

  navigateToPlayer(content: Content): void {
    this.router.navigate(["/player", content.id]);
  }
}
```

#### Dumb: `content-card.component.ts`

```typescript
@Component({
  selector: "app-content-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="relative group cursor-pointer rounded-md overflow-hidden
             bg-sv-card transition-transform duration-300
             hover:scale-105 hover:z-10 hover:shadow-2xl"
      (click)="onSelect.emit(content)"
    >
      <!-- Miniatura -->
      <img
        [src]="content.thumbnailUrl"
        [alt]="content.title"
        class="w-full aspect-video object-cover"
      />

      <!-- Overlay en hover -->
      <div
        class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100
                  transition-opacity duration-300 flex flex-col justify-end p-3"
      >
        <h3 class="text-sv-text text-sm font-semibold truncate">
          {{ content.title }}
        </h3>
        <p class="text-sv-muted text-xs mt-1">
          {{ content.releaseYear }} · {{ content.rating }}
        </p>
        <div class="flex gap-2 mt-2">
          <button
            class="flex-1 bg-sv-text text-sv-black text-xs font-bold
                   py-1 rounded hover:bg-sv-muted transition-colors"
            (click)="$event.stopPropagation(); onPlay.emit(content)"
          >
            ▶ Play
          </button>
          <button
            class="flex-1 border border-sv-muted text-sv-text text-xs
                   py-1 rounded hover:border-sv-text transition-colors"
            (click)="$event.stopPropagation(); onSelect.emit(content)"
          >
            + Info
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ContentCardComponent {
  @Input({ required: true }) content!: Content;
  @Output() onSelect = new EventEmitter<Content>();
  @Output() onPlay = new EventEmitter<Content>();
}
```

### 6.3 Ejemplo aplicado — Dominio `admin`

#### Smart: `content-list-page.component.ts`

```typescript
@Component({
  selector: "app-content-list-page",
  standalone: true,
  imports: [AdminTableComponent, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-sv-text text-2xl font-bold">Gestión de Contenido</h1>
        <a
          routerLink="/admin/content/new"
          class="bg-sv-red hover:bg-sv-red-hover text-white px-4 py-2
                  rounded text-sm font-semibold transition-colors"
        >
          + Agregar Contenido
        </a>
      </div>
      <app-admin-table
        [rows]="contents()"
        [columns]="tableColumns"
        [loading]="loading()"
        (onEdit)="handleEdit($event)"
        (onDelete)="handleDelete($event)"
      />
    </div>
  `,
})
export class ContentListPageComponent {
  private adminContentService = inject(AdminContentService);
  private router = inject(Router);

  contents = signal<Content[]>([]);
  loading = signal<boolean>(false);

  tableColumns = ["Título", "Tipo", "Año", "Género", "Acciones"];

  constructor() {
    this.loadContents();
  }

  private loadContents(): void {
    this.loading.set(true);
    this.adminContentService.getAll().subscribe({
      next: (data) => {
        this.contents.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  handleEdit(content: Content): void {
    this.router.navigate(["/admin/content", content.id, "edit"]);
  }

  handleDelete(content: Content): void {
    this.adminContentService.delete(content.id).subscribe(() => {
      this.contents.update((list) => list.filter((c) => c.id !== content.id));
    });
  }
}
```

#### Dumb: `admin-table.component.ts`

```typescript
@Component({
  selector: "app-admin-table",
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    @if (loading) {
      <app-loading-spinner />
    } @else {
      <div class="overflow-x-auto rounded-lg border border-sv-border">
        <table class="w-full text-sm text-sv-text">
          <thead class="bg-sv-dark text-sv-muted uppercase text-xs">
            <tr>
              @for (col of columns; track col) {
                <th class="px-4 py-3 text-left">{{ col }}</th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-sv-border">
            @for (row of rows; track row.id) {
              <tr class="hover:bg-sv-card transition-colors">
                <td class="px-4 py-3">{{ row.title }}</td>
                <td class="px-4 py-3">{{ row.type }}</td>
                <td class="px-4 py-3">{{ row.releaseYear }}</td>
                <td class="px-4 py-3">{{ row.genres?.join(", ") }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button
                      class="text-blue-400 hover:text-blue-300 text-xs"
                      (click)="onEdit.emit(row)"
                    >
                      Editar
                    </button>
                    <button
                      class="text-sv-red hover:text-sv-red-hover text-xs"
                      (click)="onDelete.emit(row)"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class AdminTableComponent {
  @Input() rows: any[] = [];
  @Input() columns: string[] = [];
  @Input() loading: boolean = false;
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
}
```

---

## 7. Páginas y Vistas

### 7.1 Páginas Públicas

| Ruta            | Page Component              | Descripción                                                         |
| --------------- | --------------------------- | ------------------------------------------------------------------- |
| `/`             | `LoginPageComponent`        | Hero oscuro con formulario de login centrado, enlace a registro     |
| `/register`     | `RegisterPageComponent`     | Formulario de creación de cuenta — **solo acepta emails `@streamvault.com`** |
| `/auth/confirm` | `ConfirmEmailPageComponent` | Procesa el token de confirmación de email (el backend no requiere verificación por email — usuarios creados con `isVerified=false` pero funcionales)                           |

### 7.2 Páginas USER

| Ruta           | Page Component               | Descripción                                           |
| -------------- | ---------------------------- | ----------------------------------------------------- |
| `/home`        | `HomePageComponent`          | Hero + carruseles por género + búsqueda               |
| `/catalog/:id` | `ContentDetailPageComponent` | Banner, metadatos, temporadas, botón Play             |
| `/player/:id`  | `PlayerPageComponent`        | Player HLS a pantalla completa                        |
| `/profile`     | `ProfilePageComponent`       | Avatar, perfiles de cuenta, historial de reproducción |
| `/settings`    | `SettingsPageComponent`      | Preferencias de cuenta, suscripción                   |
| `/contact`     | `ContactPageComponent`       | Formulario de contacto vía SMTP                       |

### 7.3 Páginas ADMIN

| Ruta                      | Page Component             | Descripción                                                   |
| ------------------------- | -------------------------- | ------------------------------------------------------------- |
| `/admin`                  | `DashboardPageComponent`   | Métricas: total usuarios, contenido, reproducciones recientes |
| `/admin/content`          | `ContentListPageComponent` | Tabla paginada del catálogo completo                          |
| `/admin/content/new`      | `ContentFormPageComponent` | Formulario de creación con subida de video                    |
| `/admin/content/:id/edit` | `ContentFormPageComponent` | Mismo formulario en modo edición                              |
| `/admin/users`            | `UserListPageComponent`    | Tabla de usuarios registrados                                 |

---

## 8. Servicios por Dominio

### 8.1 `auth/services/`

| Servicio       | Método               | Endpoint              | Descripción                              |
| -------------- | -------------------- | --------------------- | ---------------------------------------- |
| `AuthService`  | `login(req)`         | `POST /auth/login`    | Login → guarda JWT                       |
| `AuthService`  | `register(req)`      | `POST /auth/register` | Registro de usuario (solo @streamvault.com) |
| `AuthService`  | `logout()`           | `POST /auth/logout`   | Cierre de sesión                         |
| `AuthService`  | `refreshToken(token)`| `POST /auth/refresh`  | Refresca JWT automáticamente (vía interceptor) |
| `AuthService`  | `getRoleFromToken()` | —                     | Extrae rol del JWT con `jwt-decode`      |
| `TokenService` | `getToken()`         | —                     | Retorna JWT desde memoria/sessionStorage |
| `TokenService` | `setToken(token)`    | —                     | Guarda el JWT                            |
| `TokenService` | `clearToken()`       | —                     | Elimina el JWT                           |
| `TokenService` | `isExpired()`        | —                     | Comprueba si el JWT está expirado        |

> **Nota importante:** El registro solo acepta emails con dominio `@streamvault.com`. El backend rechazará cualquier otro dominio.

### 8.2 `catalog/services/`

| Servicio         | Método                   | Endpoint                            | Descripción                           |
| ---------------- | ------------------------ | ----------------------------------- | ------------------------------------- |
| `CatalogService` | `getCatalog(page, size)` | `GET /catalog`                      | Catálogo paginado agrupado por género |
| `CatalogService` | `getById(id)`            | `GET /catalog/:id`                  | Detalle de contenido                  |
| `CatalogService` | `search(query)`          | `GET /catalog/search?q=`            | Búsqueda con debounce 400ms           |
| `CatalogService` | `getSeasons(id)`         | `GET /catalog/:id/seasons`          | Temporadas de una serie               |
| `CatalogService` | `getEpisodes(seasonId)`  | `GET /catalog/seasons/:id/episodes` | Episodios de temporada                |
| `CatalogService` | `getGenres()`            | `GET /catalog/genres`               | Lista de todos los géneros disponibles |

### 8.3 `player/services/`

| Servicio        | Método                    | Endpoint          | Descripción                                      |
| --------------- | ------------------------- | ----------------- | ------------------------------------------------ |
| `StreamService` | `getStreamUrl(contentId)` | `GET /stream/:id` | URL pre-firmada MinIO HLS                        |
| `HlsService`    | `initPlayer(video, url)`  | —                 | Inicializa hls.js en el elemento `<video>`       |
| `HlsService`    | `destroy()`               | —                 | Destruye la instancia hls.js al salir del player |

### 8.4 `profile/services/`

| Servicio            | Método                     | Endpoint                      | Descripción                      |
| ------------------- | -------------------------- | ----------------------------- | -------------------------------- |
| `UserService`       | `getMe()`                  | `GET /users/me`               | Datos del usuario autenticado    |
| `UserService`       | `updateMe(req)`            | `PUT /users/me`               | Actualizar datos                |
| `UserService`       | `changePassword(req)`      | `PUT /users/me/password`      | Cambiar contraseña              |
| `SubscriptionService`| `getMySubscription()`    | `GET /subscriptions/me`       | Obtener suscripción activa      |
| `SubscriptionService`| `purchase()`              | `POST /subscriptions/purchase`| Comprar nueva suscripción       |
| `ProfileService`    | `getProfiles()`            | `GET /profiles`              | Listar perfiles de la cuenta     |
| `ProfileService`    | `create(req)`              | `POST /profiles`             | Crear perfil                    |
| `ProfileService`    | `update(id, req)`          | `PUT /profiles/:id`          | Actualizar perfil               |
| `ProfileService`    | `delete(id)`               | `DELETE /profiles/:id`       | Eliminar perfil                 |
| `HistoryService`    | `getHistory()`             | `GET /history`               | Historial del perfil activo      |
| `HistoryService`    | `getById(id)`              | `GET /history/:id`           | Ver registro específico         |
| `HistoryService`    | `saveProgress(id, sec)`   | `PUT /history/:id/progress`  | Guardar segundo cada 10 s       |
| `HistoryService`    | `markAsCompleted(id)`     | `PUT /history/:id/completed` | Marcar como completado           |
| `HistoryService`    | `startWatching(episodeId)`| `POST /history`               | Iniciar seguimiento de episodio |

> **Nota:** El endpoint de streaming (`GET /stream/:id`) requiere suscripción activa. El frontend debe verificar `SubscriptionService.getMySubscription()` antes de permitir reproducción, mostrando pantalla de "Suscríbete para ver" si no hay suscripción.

### 8.5 `contact/services/`

| Servicio      | Método      | Endpoint          | Descripción                    |
| ------------- | ----------- | ----------------- | ------------------------------ |
| `MailService` | `send(req)` | `POST /mail/send` | Enviar email vía SMTP backend  |

> **Nota:** El endpoint `GET /mail/sent` **NO existe** en el API. No implementar este método.

### 8.6 `admin/services/`

| Servicio              | Método                      | Endpoint                       | Descripción              |
| --------------------- | --------------------------- | ------------------------------ | ------------------------ |
| `AdminContentService` | `getAll()`                  | `GET /catalog` (ADMIN)         | Listar todo el catálogo  |
| `AdminContentService` | `create(req)`               | `POST /catalog`                | Crear contenido          |
| `AdminContentService` | `update(id, req)`           | `PUT /catalog/:id`             | Editar metadatos         |
| `AdminContentService` | `delete(id)`                | `DELETE /catalog/:id`          | Eliminar contenido       |
| `AdminContentService` | `uploadThumbnail(file)`    | `POST /admin/upload/thumbnail` | Subir miniatura          |
| `AdminUserService`    | `getUsers(filters)`         | `GET /admin/users`             | Listar usuarios paginado |
| `AdminUserService`    | `getById(id)`               | `GET /admin/users/:id`         | Detalle de usuario       |
| `AdminNotificationService`| `sendToUser(req)`        | `POST /admin/notifications`   | Enviar notificación a usuario |
| `AdminNotificationService`| `broadcast(req)`        | `POST /admin/notifications/broadcast` | Broadcast a todos los usuarios |

> **Nota:** El endpoint `POST /admin/upload/video` no existe en el API. Los videos se gestionan directamente en MinIO o a través del endpoint de creación de contenido en el catálogo.

### 8.7 `shared/services/`

| Servicio              | Responsabilidad                                                                                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WebSocketService`    | Conecta a `wss://api.streamvault.local/ws`. Gestiona suscripción STOMP a `/topic/notifications` y `/user/queue/alerts`. Reconexión automática con backoff exponencial |
| `NotificationService` | **Versión REST + WebSocket** — Recibe eventos de `WebSocketService` y también hace llamadas REST:                                                 |
|                      | • `getAll()` → `GET /notifications` — Lista todas las notificaciones                                                           |
|                      | • `getUnread()` → `GET /notifications/unread` — Solo no leídas                                                                  |
|                      | • `getUnreadCount()` → `GET /notifications/unread/count` — Contador de no leídas                                             |
|                      | • `markAsRead(id)` → `PUT /notifications/:id/read` — Marcar una como leída                                                    |
|                      | • `markAllAsRead()` → `PUT /notifications/read-all` — Marcar todas como leídas                                               |
|                      | • `onNotification$` → Signal que emite cuando llega notificación por WebSocket                                                |

---

## 9. Guards e Interceptores

### 9.1 Route Guards

| Guard        | Archivo                        | Lógica                                                                          |
| ------------ | ------------------------------ | ------------------------------------------------------------------------------- |
| `AuthGuard`  | `shared/guards/auth.guard.ts`  | Verifica JWT válido y no expirado. Si no, redirige a `/`                        |
| `AdminGuard` | `shared/guards/admin.guard.ts` | Verifica `ROLE_ADMIN` en el JWT. Si no, redirige a `/home` con toast 403        |
| `GuestGuard` | `shared/guards/guest.guard.ts` | Evita que un usuario autenticado acceda a `/` o `/register`. Redirige a `/home` |

### 9.2 HTTP Interceptores

| Interceptor          | Archivo                                      | Lógica                                                                                                                           |
| -------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `AuthInterceptor`    | `shared/interceptors/auth.interceptor.ts`    | Adjunta `Authorization: Bearer <JWT>` a cada request HTTP saliente                                                               |
| `RefreshInterceptor` | `shared/interceptors/refresh.interceptor.ts` | Detecta respuesta `401`. Llama silenciosamente a `POST /auth/refresh` con cookie. Reintenta el request original con el nuevo JWT |
| `ErrorInterceptor`   | `shared/interceptors/error.interceptor.ts`   | Maneja globalmente: `401` → redirect login, `403` → toast acceso denegado, `500` → toast error servidor                          |
| `LoadingInterceptor` | `shared/interceptors/loading.interceptor.ts` | Activa y desactiva el `LoadingSpinnerComponent` global al inicio y fin de cada request                                           |

---

## 10. Estado Global con Signals

Archivo: `shared/store/app.store.ts`

```typescript
// Signals globales de la aplicación
export const currentUser = signal<User | null>(null);
export const activeProfile = signal<Profile | null>(null);
export const isLoading = signal<boolean>(false);
export const notifications = signal<Notification[]>([]);
export const searchQuery = signal<string>("");

// Signals derivados (computed)
export const isAuthenticated = computed(() => currentUser() !== null);
export const isAdmin = computed(() => currentUser()?.role === "ROLE_ADMIN");
export const unreadCount = computed(
  () => notifications().filter((n) => !n.read).length,
);
```

| Signal            | Tipo                      | Actualizado por                        |
| ----------------- | ------------------------- | -------------------------------------- |
| `currentUser`     | `signal<User \| null>`    | `AuthService` al login/logout          |
| `activeProfile`   | `signal<Profile \| null>` | `ProfileService` al seleccionar perfil |
| `isLoading`       | `signal<boolean>`         | `LoadingInterceptor`                   |
| `notifications`   | `signal<Notification[]>`  | `NotificationService` via WebSocket    |
| `searchQuery`     | `signal<string>`          | `SearchBarComponent` con debounce      |
| `isAuthenticated` | `computed`                | Derivado de `currentUser`              |
| `isAdmin`         | `computed`                | Derivado de `currentUser.role`         |
| `unreadCount`     | `computed`                | Derivado de `notifications`            |

---

## 11. Routing con Lazy Loading

Archivo: `app.routes.ts`

```typescript
export const routes: Routes = [
  // ── Públicas ──────────────────────────────────────────────
  {
    path: "",
    loadComponent: () =>
      import("./auth/pages/login-page.component").then(
        (m) => m.LoginPageComponent,
      ),
    canActivate: [GuestGuard],
  },
  {
    path: "register",
    loadComponent: () =>
      import("./auth/pages/register-page.component").then(
        (m) => m.RegisterPageComponent,
      ),
    canActivate: [GuestGuard],
  },
  {
    path: "auth/confirm",
    loadComponent: () =>
      import("./auth/pages/confirm-email-page.component").then(
        (m) => m.ConfirmEmailPageComponent,
      ),
  },

  // ── Usuario autenticado ───────────────────────────────────
  {
    path: "",
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "home",
        loadComponent: () =>
          import("./catalog/pages/home-page.component").then(
            (m) => m.HomePageComponent,
          ),
      },
      {
        path: "catalog/:id",
        loadComponent: () =>
          import("./catalog/pages/content-detail-page.component").then(
            (m) => m.ContentDetailPageComponent,
          ),
      },
      {
        path: "player/:id",
        loadComponent: () =>
          import("./player/pages/player-page.component").then(
            (m) => m.PlayerPageComponent,
          ),
      },
      {
        path: "profile",
        loadComponent: () =>
          import("./profile/pages/profile-page.component").then(
            (m) => m.ProfilePageComponent,
          ),
      },
      {
        path: "settings",
        loadComponent: () =>
          import("./profile/pages/settings-page.component").then(
            (m) => m.SettingsPageComponent,
          ),
      },
      {
        path: "contact",
        loadComponent: () =>
          import("./contact/pages/contact-page.component").then(
            (m) => m.ContactPageComponent,
          ),
      },
    ],
  },

  // ── Admin — carga el módulo completo lazy ─────────────────
  {
    path: "admin",
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, AdminGuard],
    loadChildren: () =>
      import("./admin/admin.routes").then((m) => m.ADMIN_ROUTES),
  },

  // ── Fallback ───────────────────────────────────────────────
  {
    path: "**",
    loadComponent: () =>
      import("./shared/components/error-page.component").then(
        (m) => m.ErrorPageComponent,
      ),
  },
];
```

Archivo: `admin/admin.routes.ts`

```typescript
export const ADMIN_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/dashboard-page.component").then(
        (m) => m.DashboardPageComponent,
      ),
  },
  {
    path: "content",
    loadComponent: () =>
      import("./pages/content-list-page.component").then(
        (m) => m.ContentListPageComponent,
      ),
  },
  {
    path: "content/new",
    loadComponent: () =>
      import("./pages/content-form-page.component").then(
        (m) => m.ContentFormPageComponent,
      ),
  },
  {
    path: "content/:id/edit",
    loadComponent: () =>
      import("./pages/content-form-page.component").then(
        (m) => m.ContentFormPageComponent,
      ),
  },
  {
    path: "users",
    loadComponent: () =>
      import("./pages/user-list-page.component").then(
        (m) => m.UserListPageComponent,
      ),
  },
];
```

---

## 12. Responsive Design con TailwindCSS

### 12.1 Breakpoints usados

| Breakpoint  | Prefijo Tailwind | Ancho mínimo | Dispositivo objetivo |
| ----------- | ---------------- | ------------ | -------------------- |
| Extra small | `xs:`            | 375px        | Móvil pequeño        |
| Small       | `sm:`            | 640px        | Móvil grande         |
| Medium      | `md:`            | 768px        | Tablet               |
| Large       | `lg:`            | 1024px       | Laptop               |
| Extra large | `xl:`            | 1280px       | Desktop              |
| 2X large    | `2xl:`           | 1536px       | Monitor grande       |

### 12.2 Estrategia Mobile-First

Todos los estilos se escriben primero para móvil y se sobreescriben con breakpoints hacia arriba:

```html
<!-- Grid del catálogo — mobile first -->
<div
  class="
  grid
  grid-cols-2          <!-- xs: 2 columnas -->
  sm:grid-cols-3       <!-- sm: 3 columnas -->
  md:grid-cols-4       <!-- md: 4 columnas -->
  lg:grid-cols-5       <!-- lg: 5 columnas -->
  xl:grid-cols-6       <!-- xl: 6 columnas -->
  gap-2 md:gap-4
"
></div>
```

### 12.3 Comportamiento responsive por componente

| Componente              | Móvil (< md)                                 | Tablet (md)                  | Desktop (lg+)                            |
| ----------------------- | -------------------------------------------- | ---------------------------- | ---------------------------------------- |
| `NavbarComponent`       | Logo + menú hamburguesa                      | Logo + links colapsados      | Logo + links completos + avatar          |
| `HeroComponent`         | Imagen de fondo, texto abajo                 | Texto sobre imagen izquierda | Texto sobre imagen izquierda, más grande |
| `CarouselComponent`     | Scroll horizontal táctil, 2 cards visibles   | 3 cards visibles             | 5-6 cards visibles con flechas           |
| `ContentCardComponent`  | Sin overlay hover (tap directo)              | Hover overlay activado       | Hover overlay con escala                 |
| `VideoPlayerComponent`  | Controles grandes, pantalla completa forzada | Controles normales           | Controles completos con timeline         |
| `AdminSidebarComponent` | Oculto — drawer lateral                      | Iconos solo                  | Iconos + texto completo                  |
| `AdminTableComponent`   | Scroll horizontal                            | Columnas reducidas           | Tabla completa                           |
| `ContactFormComponent`  | Campos apilados full-width                   | 2 columnas en campos cortos  | 2 columnas con preview                   |

### 12.4 Ejemplo de Navbar responsive

```html
<!-- navbar.component.html -->
<nav
  class="fixed top-0 w-full z-50 bg-gradient-to-b
            from-sv-black/90 to-transparent px-4 md:px-8 py-3"
>
  <div class="flex items-center justify-between">
    <!-- Logo -->
    <a
      routerLink="/home"
      class="text-sv-red font-bold text-xl md:text-2xl tracking-wider"
    >
      StreamVault
    </a>

    <!-- Links — ocultos en móvil -->
    <div class="hidden md:flex items-center gap-6 text-sm text-sv-muted">
      <a routerLink="/home" class="hover:text-sv-text transition-colors"
        >Inicio</a
      >
      <a routerLink="/contact" class="hover:text-sv-text transition-colors"
        >Contacto</a
      >
      @if (isAdmin()) {
      <a routerLink="/admin" class="text-sv-red hover:text-sv-red-hover"
        >Admin</a
      >
      }
    </div>

    <!-- Avatar + menú hamburguesa -->
    <div class="flex items-center gap-3">
      <!-- Avatar visible siempre -->
      <button
        class="w-8 h-8 rounded bg-sv-card overflow-hidden
                     border border-sv-border hover:border-sv-muted"
      >
        <img [src]="activeProfile()?.avatarUrl" alt="perfil" />
      </button>

      <!-- Hamburguesa solo en móvil -->
      <button class="md:hidden text-sv-text p-1" (click)="toggleMenu()">
        <span class="block w-5 h-0.5 bg-current mb-1"></span>
        <span class="block w-5 h-0.5 bg-current mb-1"></span>
        <span class="block w-5 h-0.5 bg-current"></span>
      </button>
    </div>
  </div>

  <!-- Menú móvil desplegable -->
  @if (menuOpen()) {
  <div
    class="md:hidden mt-3 pb-3 border-t border-sv-border
                flex flex-col gap-3 text-sm text-sv-muted pt-3"
  >
    <a routerLink="/home" (click)="closeMenu()">Inicio</a>
    <a routerLink="/contact" (click)="closeMenu()">Contacto</a>
    @if (isAdmin()) {
    <a routerLink="/admin" (click)="closeMenu()" class="text-sv-red">Admin</a>
    }
  </div>
  }
</nav>
```

---

## 13. Comunicación con el Backend

### 13.1 Configuración base HTTP

Archivo: `environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: "https://api.streamvault.local/api/v1",
  wsUrl: "wss://api.streamvault.local/ws",
};
```

### 13.2 WebSocket STOMP

| Parámetro       | Valor                                                |
| --------------- | ---------------------------------------------------- |
| URL de conexión | `wss://api.streamvault.local/ws`                     |
| Protocolo       | STOMP sobre WebSocket Secure                         |
| Fallback        | SockJS                                               |
| Librería        | `@stomp/stompjs` + `sockjs-client`                   |
| Suscripción 1   | `/topic/notifications` — nuevo contenido (broadcast) |
| Suscripción 2   | `/user/queue/alerts` — alertas personales            |
| Reconexión      | Automática con backoff exponencial                   |

---

## 14. Dependencias — package.json

### 14.1 Producción

| Paquete                     | Versión | Propósito                                 |
| --------------------------- | ------- | ----------------------------------------- |
| `@angular/core`             | `21.x`  | Framework principal                       |
| `@angular/common`           | `21.x`  | HttpClient, directivas, pipes             |
| `@angular/router`           | `21.x`  | Routing con Lazy Loading                  |
| `@angular/forms`            | `21.x`  | Reactive Forms                            |
| `@angular/platform-browser` | `21.x`  | Renderizado en navegador                  |
| `@angular/animations`       | `21.x`  | Animaciones de transición                 |
| `rxjs`                      | `7.x`   | Streams reactivos, operadores             |
| `hls.js`                    | `1.x`   | Reproductor HLS en el navegador           |
| `@stomp/stompjs`            | `7.x`   | Cliente STOMP para WebSocket              |
| `sockjs-client`             | `1.x`   | Fallback WebSocket                        |
| `jwt-decode`                | `4.x`   | Decodificar JWT para extraer rol y claims |

### 14.2 Desarrollo

| Paquete                      | Versión | Propósito                        |
| ---------------------------- | ------- | -------------------------------- |
| `@angular/cli`               | `21.x`  | CLI: build, serve, generate      |
| `typescript`                 | `5.x`   | Compilador TypeScript            |
| `tailwindcss`                | `3.x`   | Utilidades CSS dark mode         |
| `postcss`                    | `8.x`   | Procesamiento CSS para Tailwind  |
| `autoprefixer`               | `10.x`  | Prefijos CSS automáticos         |
| `karma` + `jasmine`          | —       | Testing unitario                 |
| `@angular/testing`           | `21.x`  | TestBed, HttpClientTestingModule |
| `eslint` + `@angular-eslint` | —       | Linting TypeScript y plantillas  |

---

## 15. Configuración NGINX y Docker

### 15.1 `nginx.conf`

```nginx
server {
    listen 443 ssl;
    server_name streamvault.local;

    ssl_certificate     /etc/ssl/certs/streamvault.crt;
    ssl_certificate_key /etc/ssl/private/streamvault.key;
    ssl_protocols       TLSv1.3;

    root  /usr/share/nginx/html;
    index index.html;

    # SPA — redirige todo a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy REST → Backend
    location /api/ {
        proxy_pass         http://192.168.1.20:8080;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
    }

    # Proxy WebSocket → Backend
    location /ws {
        proxy_pass          http://192.168.1.20:8080;
        proxy_http_version  1.1;
        proxy_set_header    Upgrade $http_upgrade;
        proxy_set_header    Connection "upgrade";
        proxy_set_header    Host $host;
        proxy_read_timeout  3600s;
    }

    # Cache de assets estáticos
    location ~* \.(js|css|png|jpg|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name streamvault.local;
    return 301 https://$host$request_uri;
}
```

### 15.2 `Dockerfile` (multi-stage)

```dockerfile
# ── Stage 1: Build Angular ─────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# ── Stage 2: Serve con NGINX ───────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist/streamvault/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
```

### 15.3 `docker-compose.yml` (VM-1)

```yaml
services:
  frontend:
    build: .
    container_name: streamvault-frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/ssl:ro
    dns:
      - 192.168.1.30
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## 16. Variables de Entorno

Archivo: `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: "https://api.streamvault.local/api/v1",
  wsUrl: "wss://api.streamvault.local/ws",
};
```

Archivo: `src/environments/environment.ts` (desarrollo local)

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:8080/api/v1",
  wsUrl: "ws://localhost:8080/ws",
};
```

| Variable     | Producción                             | Desarrollo                     |
| ------------ | -------------------------------------- | ------------------------------ |
| `apiUrl`     | `https://api.streamvault.local/api/v1` | `http://localhost:8080/api/v1` |
| `wsUrl`      | `wss://api.streamvault.local/ws`       | `ws://localhost:8080/ws`       |
| `production` | `true`                                 | `false`                        |

---

## 17. Extensiones Recomendadas

### 17.1 VS Code

| Extensión                 | Publisher        | Propósito                                        |
| ------------------------- | ---------------- | ------------------------------------------------ |
| Angular Language Service  | Angular          | Autocompletado y diagnóstico en plantillas HTML  |
| Angular Snippets (v21)    | johnpapa         | Snippets para componentes, servicios, guards     |
| Tailwind CSS IntelliSense | Tailwind Labs    | Autocompletado de clases Tailwind en HTML y TS   |
| ESLint                    | Microsoft        | Linting TypeScript en tiempo real                |
| Prettier                  | Prettier         | Formateo consistente de TS y HTML                |
| Docker                    | Microsoft        | Gestión de contenedores desde VS Code            |
| Thunder Client            | Ranga Vadhineni  | Cliente REST liviano para pruebas de API         |
| GitLens                   | GitKraken        | Historial git y autoría de código                |
| Material Icon Theme       | Philipp Kief     | Iconos por tipo de archivo para mejor navegación |
| Path IntelliSense         | Christian Kohler | Autocompletado de rutas de importación           |

### 17.2 Herramientas CLI

| Herramienta               | Propósito                                       |
| ------------------------- | ----------------------------------------------- |
| Angular CLI (`ng`)        | `ng generate component`, `ng build`, `ng serve` |
| Node.js 20 LTS            | Runtime para Angular CLI y dependencias         |
| Chrome DevTools — Network | Inspección de requests, WebSocket frames, JWT   |

---

## 18. Compatibilidad con API Reference

> **Esta versión del PRD es compatible con API Reference v1.0**

### 18.1 Endpoints disponibles en el API

| Dominio | Endpoint | Estado en PRD |
|---------|----------|---------------|
| Auth | `POST /auth/register` | ✅ Implementar (solo @streamvault.com) |
| Auth | `POST /auth/login` | ✅ Implementado |
| Auth | `POST /auth/refresh` | ✅ Implementado (vía interceptor) |
| Auth | `POST /auth/logout` | ✅ Implementado |
| Usuario | `GET /users/me` | ✅ Implementado |
| Usuario | `PUT /users/me` | ✅ Implementado |
| Usuario | `PUT /users/me/password` | ✅ **AGREGADO** |
| Usuario | `GET /users/{id}` | ⚠️ No requerido aún |
| Perfiles | `GET /profiles` | ✅ Implementado |
| Perfiles | `POST /profiles` | ✅ Implementado |
| Perfiles | `PUT /profiles/{id}` | ✅ Implementado |
| Perfiles | `DELETE /profiles/{id}` | ✅ Implementado |
| Suscripciones | `GET /subscriptions/me` | ✅ **AGREGADO** |
| Suscripciones | `POST /subscriptions/purchase` | ✅ **AGREGADO** |
| Catálogo | `GET /catalog` | ✅ Implementado |
| Catálogo | `GET /catalog/{id}` | ✅ Implementado |
| Catálogo | `GET /catalog/search` | ✅ Implementado |
| Catálogo | `GET /catalog/{id}/seasons` | ✅ Implementado |
| Catálogo | `GET /catalog/seasons/{id}/episodes` | ✅ Implementado |
| Catálogo | `GET /catalog/genres` | ✅ **AGREGADO** |
| Streaming | `GET /stream/{contentId}` | ✅ Implementado (ver nota) |
| Streaming | `GET /stream/{contentId}/episode/{episodeId}` | ✅ Implementado |
| Historial | `GET /history` | ✅ Implementado |
| Historial | `POST /history` | ✅ **AGREGADO** |
| Historial | `PUT /history/{id}/progress` | ✅ Implementado |
| Historial | `PUT /history/{id}/completed` | ✅ **AGREGADO** |
| Notificaciones | `GET /notifications` | ✅ **AGREGADO** |
| Notificaciones | `GET /notifications/unread` | ✅ **AGREGADO** |
| Notificaciones | `GET /notifications/unread/count` | ✅ **AGREGADO** |
| Notificaciones | `PUT /notifications/{id}/read` | ✅ **AGREGADO** |
| Notificaciones | `PUT /notifications/read-all` | ✅ **AGREGADO** |
| Notificaciones | WebSocket `/ws` | ✅ Implementado |
| Admin | `GET /admin/users` | ✅ Implementado |
| Admin | `GET /admin/users/{id}` | ✅ Implementado |
| Admin | `POST /admin/upload/thumbnail` | ✅ Implementado |
| Admin | `POST /admin/notifications` | ✅ **AGREGADO** |
| Admin | `POST /admin/notifications/broadcast` | ✅ **AGREGADO** |
| Mail | `POST /mail/send` | ✅ Implementado |

### 18.2 Endpoints NO disponibles (no implementar)

| Endpoint | Razón |
|----------|-------|
| `GET /mail/sent` | No existe en el API |
| `POST /admin/upload/video` | No existe en el API |
| `GET /history/{id}` | No existe en el API |

### 18.3 Reglas importantes

1. **Registro:** Solo emails `@streamvault.com` — el backend rechazará otros dominios
2. **Streaming:** Requiere suscripción activa — verificar antes de reproducir
3. **Notificaciones:** El backend envía por WebSocket pero también persiste en REST
4. **Suscripciones:** Solo existe un plan DEFAULT ($10/mes, 30 días)
5. **Al publicar contenido:** El backend envía notificación automática a todos los usuarios

---

_PRD v1.2 — Frontend StreamVault — Equipo Betha — 2026_
