# Specification: User Subscription Services

## Purpose

This specification defines the requirements for user account management, subscription handling, and notification services in the StreamVault frontend application. The services enable users to view and update their profile information, manage subscription plans, and interact with notifications.

## Requirements

### User Service Requirements

#### Requirement: Get Current User

The system MUST retrieve the current authenticated user's profile information from the API.

The user service MUST call `GET /api/v1/users/me` and return user data including id, email, name, role, createdAt, and updatedAt fields.

##### Scenario: Retrieve User Profile

- GIVEN the user is authenticated
- WHEN the user calls `getMe()` method
- THEN the service MUST return an Observable resolving to User object with all profile fields

##### Scenario: Unauthorized User

- GIVEN the user session has expired
- WHEN the user calls `getMe()` method
- THEN the API MUST return 401 Unauthorized and the service MUST propagate the error

---

#### Requirement: Update User Profile

The system MUST allow users to update their profile information (name and/or email).

The user service MUST call `PUT /api/v1/users/me` with optional name and email fields and return the updated User object.

##### Scenario: Update Name Successfully

- GIVEN the user is authenticated with valid session
- WHEN the user calls `updateMe({ name: 'New Name' })` method
- THEN the service MUST return an Observable resolving to updated User object with the new name

##### Scenario: Update Email Successfully

- GIVEN the user is authenticated with valid session
- WHEN the user calls `updateMe({ email: 'new@email.com' })` method
- THEN the service MUST return an Observable resolving to updated User object with the new email

##### Scenario: Validation Error

- GIVEN the user provides invalid email format
- WHEN the user calls `updateMe({ email: 'invalid' })` method
- THEN the API MUST return 400 Bad Request and the service MUST propagate the validation error

---

#### Requirement: Change Password

The system MUST allow authenticated users to change their password securely.

The user service MUST call `PUT /api/v1/users/me/password` with currentPassword and newPassword, and return 204 No Content on success.

##### Scenario: Change Password Successfully

- GIVEN the user is authenticated and knows their current password
- WHEN the user calls `changePassword({ currentPassword: 'old', newPassword: 'new' })` method
- THEN the service MUST return an Observable resolving to void (204 No Content)

##### Scenario: Incorrect Current Password

- GIVEN the user provides incorrect current password
- WHEN the user calls `changePassword({ currentPassword: 'wrong', newPassword: 'new' })` method
- THEN the API MUST return 400 Bad Request with error message indicating incorrect password

### Subscription Service Requirements

#### Requirement: Get Current Subscription

The system MUST retrieve the user's current subscription details.

The subscription service MUST call `GET /api/v1/subscriptions/me` and return subscription data including id, plan, startedAt, expiresAt, and active status.

##### Scenario: Retrieve Active Subscription

- GIVEN the user has an active subscription
- WHEN the user calls `getMySubscription()` method
- THEN the service MUST return an Observable resolving to Subscription object with active: true

##### Scenario: No Subscription

- GIVEN the user has never purchased a subscription
- WHEN the user calls `getMySubscription()` method
- THEN the service MUST return an Observable resolving to null or indicate no subscription exists

---

#### Requirement: Purchase Subscription (Emulated)

The system MUST allow users to purchase a subscription plan without external payment gateway.

The frontend MUST handle payment emulation as per API documentation. The subscription service MUST call `POST /api/v1/subscriptions/purchase` with the selected plan and return the new subscription.

##### Scenario: Purchase Subscription Successfully

- GIVEN the user selects a valid subscription plan
- WHEN the user calls `purchase(planId)` method
- THEN the service MUST return an Observable resolving to newly created Subscription object
- AND the subscription MUST be active with start date set to current date

##### Scenario: Purchase While Active

- GIVEN the user already has an active subscription
- WHEN the user calls `purchase(planId)` method
- THEN the API MUST handle the upgrade/renewal and return updated subscription

### Notification Service Requirements

#### Requirement: Get All Notifications

The system MUST retrieve all notifications for the authenticated user.

The notification service MUST call `GET /api/v1/notifications` and return an array of Notification objects.

##### Scenario: Retrieve All Notifications

- GIVEN the user has multiple notifications
- WHEN the user calls `getAll()` method
- THEN the service MUST return an Observable resolving to Notification[] array ordered by creation date

##### Scenario: No Notifications

- GIVEN the user has no notifications
- WHEN the user calls `getAll()` method
- THEN the service MUST return an Observable resolving to empty array

---

#### Requirement: Get Unread Notifications

The system MUST retrieve only unread notifications for the authenticated user.

The notification service MUST call `GET /api/v1/notifications/unread` and return an array of unread Notification objects.

##### Scenario: Retrieve Unread Notifications

- GIVEN the user has both read and unread notifications
- WHEN the user calls `getUnread()` method
- THEN the service MUST return an Observable resolving to Notification[] containing only unread notifications

---

#### Requirement: Get Unread Count

The system MUST provide the count of unread notifications for badge display.

The notification service MUST call `GET /api/v1/notifications/unread/count` and return the count.

##### Scenario: Get Unread Count

- GIVEN the user has unread notifications
- WHEN the user calls `getUnreadCount()` method
- THEN the service MUST return an Observable resolving to { count: number }

---

#### Requirement: Mark Notification as Read

The system MUST allow users to mark individual notifications as read.

The notification service MUST call `PUT /api/v1/notifications/{id}/read` and return 204 No Content on success.

##### Scenario: Mark Single Notification as Read

- GIVEN the user has an unread notification
- WHEN the user calls `markAsRead(notificationId)` method
- THEN the service MUST return an Observable resolving to void (204 No Content)
- AND the notification MUST be updated to read status in subsequent calls

##### Scenario: Mark Already Read Notification

- GIVEN the user tries to mark an already read notification
- WHEN the user calls `markAsRead(notificationId)` method
- THEN the service MUST still return success (idempotent operation)

---

#### Requirement: Mark All Notifications as Read

The system MUST allow users to mark all notifications as read at once.

The notification service MUST call `PUT /api/v1/notifications/read-all` and return 204 No Content on success.

##### Scenario: Mark All as Read

- GIVEN the user has multiple unread notifications
- WHEN the user calls `markAllAsRead()` method
- THEN the service MUST return an Observable resolving to void (204 No Content)
- AND all notifications MUST be marked as read in subsequent calls

### Shared Model Updates Requirements

#### Requirement: User Model Update

The system MUST align the User model with the API response structure.

The User interface in shared/models MUST include id, email, name, role, createdAt, and updatedAt fields.

##### Scenario: User Model Matches API

- GIVEN the API returns User object with all fields
- WHEN the frontend User model is used
- THEN the model MUST be compatible with all API response fields

---

#### Requirement: Notification Model Update

The system MUST align the Notification model with the API response structure.

The Notification interface in shared/models MUST include id, title, message, type, isRead, createdAt, and relatedId fields.

##### Scenario: Notification Model Matches API

- GIVEN the API returns Notification object with all fields
- WHEN the frontend Notification model is used
- THEN the model MUST be compatible with all API response fields

---

#### Requirement: Subscription Model Creation

The system MUST define a Subscription model matching the API response structure.

The Subscription interface MUST include id, plan, startedAt, expiresAt, and active fields.

##### Scenario: Subscription Model Created

- GIVEN the subscription API returns Subscription object
- WHEN the frontend Subscription model is used
- THEN the model MUST define all required fields from the API response

## Integration Requirements

#### Requirement: Settings Page Integration

The settings page MUST integrate UserService and SubscriptionService to display user profile and subscription information.

##### Scenario: Settings Page Loads User Data

- GIVEN the user navigates to the settings page
- WHEN the page loads
- THEN the page MUST display user name, email, and role from UserService
- AND MUST display subscription status from SubscriptionService

#### Requirement: Notification Access in Settings

The notification service MUST be accessible from the settings page.

##### Scenario: Settings Page Shows Notifications

- GIVEN the user is on the settings page
- WHEN the user accesses the notifications section
- THEN the page MUST display notifications from NotificationService
- AND MUST allow marking notifications as read