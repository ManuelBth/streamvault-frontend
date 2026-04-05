import { inject, Injectable, signal, effect } from '@angular/core';
import { Subject } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Notification } from '../models/notification.model';
import { NotificationService } from './notification.service';
import { TokenService } from '../../auth/services/token.service';
import { currentUser, isAuthenticated } from '../../shared/store/app.store';
import { WebSocketMessage } from '../models/websocket.model';

@Injectable({ providedIn: 'root' })
export class WebSocketNotificationService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  
  private _connected = signal<boolean>(false);
  private _messages = new Subject<Notification>();
  
  readonly connected = this._connected.asReadonly();
  readonly onMessage = this._messages.asObservable();

  private notificationService = inject(NotificationService);
  private tokenService = inject(TokenService);
  private currentUserId: string | null = null;

  constructor() {
    effect(() => {
      const user = currentUser();
      const authenticated = isAuthenticated();
      
      if (authenticated && user?.id) {
        this.connect(user.id);
      } else if (!authenticated) {
        this.disconnect();
      }
    });
  }

  connect(userId: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    if (this.socket?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.currentUserId = userId;
    
    let wsUrl = environment.wsUrl;
    if (!wsUrl.startsWith('ws')) {
      wsUrl = wsUrl.replace('http', 'ws');
    }
    wsUrl = wsUrl + '/notifications';
    
    const token = this.tokenService.getToken();
    if (token) {
      wsUrl += `?token=${token}`;
    }
    
    try {
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        this._connected.set(true);
        this.reconnectAttempts = 0;
        this.subscribeToUser(userId);
      };
      
      this.socket.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data) as Notification;
          this.notificationService.addNotificationFromWebSocket(notification);
          this._messages.next(notification);
        } catch (e) {
          // Silent fail
        }
      };
      
      this.socket.onclose = (event) => {
        this._connected.set(false);
        
        if (this.reconnectAttempts < this.maxReconnectAttempts && this.currentUserId) {
          this.reconnectAttempts++;
          setTimeout(() => {
            if (this.currentUserId) {
              this.connect(this.currentUserId);
            }
          }, this.reconnectDelay);
        }
      };
      
      this.socket.onerror = () => {
        // Silent fail
      };
      
    } catch (error) {
      // Silent fail
    }
  }

  subscribeToUser(userId: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ userId });
      this.socket.send(message);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this._connected.set(false);
      this.currentUserId = null;
    }
  }

  isConnected(): boolean {
    return this._connected();
  }
}
