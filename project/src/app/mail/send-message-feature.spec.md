# Send Message Feature - Specification

## 1. Feature Overview

Add a "Send Message" button in the navbar that opens a modal for composing and sending emails via the existing MailService. This is a NEW domain called "mail" (separate from "contact" which handles footer contact forms).

## 2. User Flows

### 2.1 Primary Flow: Send Email
1. User clicks the mail icon in the navbar (next to notifications icon)
2. Modal opens with empty form fields: To (email), Subject, Body
3. User fills in the required fields
4. User clicks "Send" button
5. Loading state shows while sending
6. On success: Modal closes, success notification appears
7. On error: Error message displays in modal

### 2.2 Keyboard Interactions
- `Escape` key closes the modal
- Clicking outside the modal closes it
- Tab navigation through form fields
- `Enter` in body field does not submit (multiline)

### 2.3 Cancel Flow
- User clicks "Cancel" button
- Or presses `Escape`
- Or clicks outside modal
- Form resets on close

## 3. UI/UX Specification

### 3.1 Navbar Button
- Position: Next to notifications icon (right side of toolbar)
- Icon: Envelope/mail icon (SVG)
- States:
  - Default: `text-sv-muted`
  - Hover: `text-sv-text`
- Tooltip on hover: "Send Message"

### 3.2 Modal Structure
- Overlay: Semi-transparent black background (`bg-black/60`)
- Modal container:
  - Background: `bg-sv-dark`
  - Border: `border border-sv-border`
  - Border radius: `rounded-lg`
  - Max width: `max-w-lg` (mobile: `max-w-[90vw]`)
  - Padding: `p-6`
  - Shadow: `shadow-xl`

### 3.3 Modal Header
- Title: "Send Message" (text-white, font-semibold, text-lg)
- Close button (X icon): Top-right corner
  - `text-sv-muted hover:text-white`

### 3.4 Form Fields

#### To Field
- Label: "To" (text-sv-muted, text-sm)
- Input type: email
- Placeholder: "recipient@example.com"
- Required indicator: red asterisk
- Validation: Email format required

#### Subject Field
- Label: "Subject" (text-sv-muted, text-sm)
- Input type: text
- Placeholder: "Enter subject"
- Required indicator: red asterisk
- Validation: Required, min 1 character

#### Body Field
- Label: "Message" (text-sv-muted, text-sm)
- Textarea: 5 rows minimum
- Placeholder: "Write your message..."
- Required indicator: red asterisk
- Validation: Required, min 1 character

### 3.5 Action Buttons

#### Send Button
- Text: "Send" (or "Sending..." when loading)
- Background: `bg-sv-red hover:bg-red-700`
- Text: `text-white font-medium`
- Padding: `px-6 py-2`
- Border radius: `rounded-md`
- Disabled state when: loading or form invalid
- Full width on mobile, auto width on desktop

#### Cancel Button
- Text: "Cancel"
- Background: `bg-sv-card hover:bg-sv-border`
- Text: `text-sv-muted`
- Border radius: `rounded-md`
- Margin-right: `mr-3` (if in same row)

### 3.6 States

#### Loading State
- Send button: Disabled, shows spinner/loading text
- Form fields: Disabled
- Cancel button: Still enabled

#### Success State
- Modal closes automatically
- Success notification shown via NotificationService
- Form resets

#### Error State
- Error message displayed below form or in alert box
- Form fields remain enabled
- Send button re-enabled

### 3.7 Responsive Breakpoints
- Mobile (< 640px):
  - Modal: `max-w-[90vw]`, `p-4`
  - Buttons: Full width, stacked
- Desktop (>= 640px):
  - Modal: `max-w-lg`, `p-6`
  - Buttons: Inline (Send left, Cancel right)

## 4. Functionality Specification

### 4.1 Components to Create

```
src/app/mail/
├── components/
│   └── send-message-modal/
│       ├── send-message-modal.component.ts
│       └── send-message-modal.component.html
```

### 4.2 Service
- Reuse existing `MailService` from `contact/services/mail.service.ts`
- Move to shared or new mail domain (user specifies: "Use existing MailService from contact/services/mail.service.ts")
- Keep in contact for backward compatibility or move to mail domain

### 4.3 Form Validation Rules
| Field | Rules |
|-------|-------|
| to | Required, valid email format (pattern validation) |
| subject | Required, min 1 character |
| body | Required, min 1 character |

### 4.4 API Integration
- Endpoint: `POST /api/v1/mail/send`
- Headers: `Authorization: Bearer {token}`, `Content-Type: application/json`
- Request Body:
  ```json
  {
    "to": "string",
    "subject": "string",
    "body": "string"
  }
  ```
- Response: `200 OK` (empty), or `400`/`401`/`500` on error

### 4.5 State Management
- Use Angular 21 signals for form state
- `isOpen`: Signal<boolean> - modal visibility
- `formData`: Signal object with to, subject, body
- `isLoading`: Computed from MailService
- `error`: Computed from MailService

### 4.6 Integration Points
1. **Navbar**: Add mail button next to notifications icon
2. **MailService**: Import and use existing service
3. **Auth**: User must be authenticated (show button only when `isAuthenticated()`)

## 5. Technical Implementation

### 5.1 Dependencies
- Angular 21 standalone components
- Angular Signals
- Reactive Forms or Template-driven forms
- TailwindCSS (existing)
- CommonModule, FormsModule imports

### 5.2 File Structure
```
src/app/mail/
├── components/
│   └── send-message-modal/
│       ├── send-message-modal.component.ts
│       └── send-message-modal.component.html
```

### 5.3 Navbar Integration
- Import `SendMessageModalComponent` in `NavbarComponent`
- Add button with mail icon
- Pass `isOpen` signal or use service to control modal

### 5.4 Accessibility
- ARIA attributes: `aria-modal="true"`, `aria-labelledby`, `aria-describedby`
- Focus trap in modal
- Keyboard navigation
- Screen reader labels

## 6. Acceptance Criteria

### 6.1 Functional Criteria
- [ ] Mail button appears in navbar only when user is authenticated
- [ ] Clicking mail button opens modal
- [ ] Modal has three form fields: To, Subject, Body
- [ ] Form validation shows errors for empty fields
- [ ] Form validation shows error for invalid email format
- [ ] Send button is disabled when form is invalid
- [ ] Send button shows loading state during API call
- [ ] Success: Modal closes, notification shows
- [ ] Error: Error message displays, form remains open
- [ ] Escape key closes modal
- [ ] Click outside modal closes it
- [ ] Cancel button closes modal and resets form

### 6.2 Visual Criteria
- [ ] Modal follows dark theme (bg-sv-dark)
- [ ] TailwindCSS styling matches project conventions
- [ ] Responsive on mobile and desktop
- [ ] Hover states on buttons
- [ ] Loading spinner or text change

### 6.3 Technical Criteria
- [ ] Uses Angular 21 standalone components
- [ ] Uses Angular signals
- [ ] Reuses existing MailService
- [ ] Proper TypeScript types
- [ ] Clean component separation
- [ ] No console errors
