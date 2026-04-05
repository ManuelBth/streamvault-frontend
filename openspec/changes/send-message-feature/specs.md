# Send Message Feature - Specification

## Overview
Add a "Send Message" button in the navbar that opens a modal for composing and sending emails. This feature integrates with the existing MailService from the contact domain.

## Context
- **Domain**: contact (existing domain, NOT a new features folder)
- **Folder Structure**: `src/app/contact/components/send-message-modal/`
- **Existing Dependencies**: MailService at `src/app/contact/services/mail.service.ts`

---

## UI/UX Specification

### Layout Structure

#### Navbar Button
- **Position**: Next to notifications icon (between search and notifications, or after notifications)
- **Icon**: Envelope icon (SVG)
- **States**:
  - Default: `text-sv-muted hover:text-sv-text`
  - Hover: `text-white`

#### Modal
- **Type**: Centered overlay modal with backdrop
- **Dimensions**: 
  - Mobile: `w-full max-w-md` (full width with padding)
  - Desktop: `w-full max-w-lg` (centered, max 32rem)
- **Animation**: Fade in + scale up (Tailwind transitions)
- **Position**: Centered vertically and horizontally

### Visual Design

#### Color Palette (TailwindCSS with custom classes)
- **Background**: `bg-sv-dark` (modal), `bg-sv-card` (inputs)
- **Border**: `border-sv-border`
- **Text Primary**: `text-white`
- **Text Secondary**: `text-sv-muted`
- **Accent/Primary**: `bg-sv-red` (send button)
- **Error**: `text-red-400`
- **Success**: `text-green-400`

#### Typography
- **Title**: `text-lg font-semibold text-white`
- **Labels**: `text-sm text-sv-muted`
- **Inputs**: `text-white`
- **Buttons**: `text-sm font-medium`

#### Spacing
- **Modal Padding**: `p-6`
- **Field Spacing**: `space-y-4` (gap between form fields)
- **Button Spacing**: `mt-6` (from last field)

### Components

#### 1. SendMessageButton (Navbar)
- Icon-only button with envelope SVG
- Click opens modal

#### 2. SendMessageModal
- **Header**: Title + close button (X icon)
- **Body**: Form with 3 fields
- **Footer**: Send button + cancel button

#### Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| To | email input | Yes | Valid email format |
| Subject | text input | Yes | Non-empty |
| Body | textarea | Yes | Non-empty, min 1 char |

#### States
- **Idle**: Form ready for input
- **Loading**: Send button shows spinner, form disabled
- **Success**: Show success message, auto-close after 2s
- **Error**: Show error message below form

---

## Functionality Specification

### Core Features

1. **Open Modal**
   - Click navbar button → modal opens
   - Click backdrop → modal closes
   - Press Escape → modal closes
   - Click X button → modal closes

2. **Form Submission**
   - Validate all required fields
   - Validate email format
   - Call MailService.sendEmail()
   - Handle loading/success/error states

3. **Keyboard Accessibility**
   - Tab navigation through form fields
   - Enter on last field submits form
   - Escape closes modal
   - Focus trapped inside modal when open

### User Interactions
1. User clicks envelope icon in navbar
2. Modal opens with empty form
3. User fills: to (email), subject, body
4. User clicks "Send" or presses Enter
5. Loading state shown
6. On success: toast/message "Email sent" → modal closes after 2s
7. On error: error message displayed

### Data Handling
- **Request**: `{ to: string, subject: string, body: string }`
- **Service**: Uses existing `MailService.sendEmail(request)`
- **State Management**: Angular signals (via MailService)

### Edge Cases
- Empty form submission → show validation errors
- Invalid email format → show "Invalid email" error
- Network error → show error message, keep modal open
- Double-click prevention → disable button while loading

---

## Technical Specification

### File Structure
```
src/app/contact/
├── components/
│   └── send-message-modal/
│       ├── send-message-modal.component.ts
│       └── send-message-modal.component.html
├── services/
│   └── mail.service.ts (existing)
```

### Dependencies
- **Angular**: 21+ with signals, standalone components
- **Services**: MailService (existing)
- **UI**: TailwindCSS, CommonModule, ReactiveFormsModule

### Component Implementation
- Use `ReactiveFormsModule` for form validation
- Use Angular signals for local UI state
- Use MailService for email sending
- Follow existing component patterns from project

---

## Acceptance Criteria

### Visual Checkpoints
- [ ] Envelope icon appears in navbar (next to notifications)
- [ ] Clicking icon opens centered modal
- [ ] Modal has dark theme matching app
- [ ] Form has 3 fields with labels
- [ ] Send button is red (primary action)
- [ ] Loading spinner shows during send
- [ ] Success message appears after send

### Functional Checkpoints
- [ ] Cannot submit empty form (validation)
- [ ] Email field validates format
- [ ] Escape key closes modal
- [ ] Click outside closes modal
- [ ] Successful send shows success state
- [ ] Failed send shows error message
- [ ] Modal clears after close

### Accessibility
- [ ] All fields keyboard accessible
- [ ] Focus trapped in modal
- [ ] Escape closes modal
- [ ] Proper ARIA labels
