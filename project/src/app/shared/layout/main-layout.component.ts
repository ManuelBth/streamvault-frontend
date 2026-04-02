import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="flex flex-col min-h-screen bg-sv-black">
      <app-navbar />
      <main class="flex-grow">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `
})
export class MainLayoutComponent {}
