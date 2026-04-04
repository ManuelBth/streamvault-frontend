import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MailService, MailRequest } from '../../services/mail.service';
import { currentUser } from '../../../shared/store/app.store';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html'
})
export class ContactComponent {
  private mailService = inject(MailService);
  private router = inject(Router);

  currentUser = currentUser;

  to = signal('mbth@streamvault.com');
  subject = signal('');
  body = signal('');

  isLoading = this.mailService.isLoading;
  isSuccess = this.mailService.isSuccess;
  errorMessage = this.mailService.errorMessage;

  sending = signal(false);

  constructor() {
    // Track success/error to reset sending state
    effect(() => {
      const state = this.mailService.sending();
      if (state.state === 'success' || state.state === 'error') {
        this.sending.set(false);
      }
    });
  }

  sendEmail(): void {
    const toVal = this.to().trim();
    const subjectVal = this.subject().trim();
    const bodyVal = this.body().trim();

    if (!toVal || !subjectVal || !bodyVal) {
      return;
    }

    this.sending.set(true);

    const request: MailRequest = {
      to: toVal,
      subject: subjectVal,
      body: bodyVal
    };

    this.mailService.sendEmail(request);
  }

  reset(): void {
    this.subject.set('');
    this.body.set('');
    this.mailService.reset();
  }
}