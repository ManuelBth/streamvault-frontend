import { Component, input, output, signal, Subject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent {
  placeholder = input<string>('Buscar...');
  debounce = input<number>(400);

  onSearch = output<string>();

  searchValue = signal('');
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(this.debounce()),
      distinctUntilChanged()
    ).subscribe((value) => {
      this.onSearch.emit(value);
    });
  }

  onInputChange(value: string): void {
    this.searchValue.set(value);
    this.searchSubject.next(value);
  }

  onClear(): void {
    this.searchValue.set('');
    this.onSearch.emit('');
  }
}
