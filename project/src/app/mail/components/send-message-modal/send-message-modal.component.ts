import { Component, inject, signal, computed, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MailService, MailRequest } from '../../services/mail.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-send-message-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './send-message-modal.component.html'
})
export class SendMessageModalComponent {
  private mailService = inject(MailService);
  private notificationService = inject(NotificationService);

  isOpen = signal(false);

  to = signal('');
  subject = signal('');
  body = signal('');

  toTouched = signal(false);
  subjectTouched = signal(false);
  bodyTouched = signal(false);

  readonly isLoading = this.mailService.isLoading;
  readonly errorMessage = this.mailService.errorMessage;

  readonly isValidEmail = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.to());
  });

  readonly isFormValid = computed(() => 
    this.isValidEmail() && 
    this.subject().trim().length > 0 && 
    this.body().trim().length > 0
  );

  readonly showToError = computed(() => this.toTouched() && !this.isValidEmail());
  readonly showSubjectError = computed(() => this.subjectTouched() && this.subject().trim().length === 0);
  readonly showBodyError = computed(() => this.bodyTouched() && this.body().trim().length === 0);

  constructor() {
    effect(() => {
      if (this.mailService.isSuccess()) {
        this.notificationService.show('Message sent successfully!', 'success');
        this.close();
      }
    });

    effect(() => {
      const error = this.errorMessage();
      if (error) {
        this.notificationService.show(error, 'error');
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  open(): void {
    this.isOpen.set(true);
    this.resetForm();
  }

  close(): void {
    this.isOpen.set(false);
    this.resetForm();
    this.mailService.reset();
  }

  private resetForm(): void {
    this.to.set('');
    this.subject.set('');
    this.body.set('');
    this.toTouched.set(false);
    this.subjectTouched.set(false);
    this.bodyTouched.set(false);
  }

  onToBlur(): void {
    this.toTouched.set(true);
  }

  onSubjectBlur(): void {
    this.subjectTouched.set(true);
  }

  onBodyBlur(): void {
    this.bodyTouched.set(true);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }

  send(): void {
    this.toTouched.set(true);
    this.subjectTouched.set(true);
    this.bodyTouched.set(true);

    if (!this.isFormValid()) {
      return;
    }

    const request: MailRequest = {
      to: this.to(),
      subject: this.subject(),
      body: this.body()
    };

    this.mailService.sendEmail(request);
  }
}