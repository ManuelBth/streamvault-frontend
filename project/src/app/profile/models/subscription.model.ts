export type PlanType = 'FREE' | 'DEFAULT';

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  priceDisplay: string;
  features: string[];
  isPopular?: boolean;
}

export interface Subscription {
  id: string;
  plan: PlanType;
  startedAt: string;
  expiresAt: string;
  active: boolean;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  subscription?: Subscription;
}

export const AVAILABLE_PLANS: Plan[] = [
  {
    id: 'FREE',
    name: 'Gratis',
    price: 0,
    priceDisplay: 'Gratis',
    features: [
      'Acceso al catálogo básico',
      'Calidad estándar',
      'Un dispositivo'
    ],
    isPopular: false
  },
  {
    id: 'DEFAULT',
    name: 'Premium',
    price: 10,
    priceDisplay: '$10/mes',
    features: [
      'Acceso completo al catálogo',
      'Calidad 4K HDR',
      'Cinco dispositivos',
      'Contenido exclusivo'
    ],
    isPopular: true
  }
];
