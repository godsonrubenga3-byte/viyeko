import { LucideIcon, Car, Wrench, Fuel, Droplet, Truck, Utensils, ShieldAlert } from 'lucide-react';

export type ServiceType = 'emergency' | 'extended';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  plate: string;
  color: string;
}

export interface Service {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  type: ServiceType;
  color: string;
  price: number; // This acts as a "Suggested/Min" price now
  eta?: string;
  isAddOn?: boolean;
}

export interface Bid {
  id: string;
  providerId: string;
  providerName: string;
  price: number;
  eta: number; // minutes
  timestamp: number;
  rating: number;
}

export interface Request {
  id: string;
  serviceId: string;
  addOnIds?: string[];
  status: 'searching' | 'bidding' | 'assigned' | 'on-the-way' | 'arrived' | 'in-progress' | 'completed' | 'canceled';
  location: {
    lat?: number;
    lng?: number;
    address: string;
  };
  timestamp: number;
  vehicleInfo: string;
  notes?: string;
  estimatedArrival?: number;
  totalCost?: number;
  userId?: string;
  providerId?: string;
  bids?: Bid[]; // Live collection of quotes from garages
  acceptedBidId?: string;
  lastUpdatedBy?: 'driver' | 'provider';
}

export const SERVICES: Service[] = [
  {
    id: 'breakdown',
    title: 'Breakdown',
    subtitle: 'Engine / Battery',
    description: 'Quick recovery for engine or mechanical failure.',
    icon: Car,
    type: 'emergency',
    color: 'bg-rose-500',
    price: 35000,
    eta: 'Calculating bids...'
  },
  {
    id: 'tire',
    title: 'Tire Change',
    subtitle: 'Flat / Puncture',
    description: 'Flat tire? We\'ll swap it for your spare or repair it.',
    icon: Wrench,
    type: 'emergency',
    color: 'bg-slate-yellow',
    price: 20000,
    eta: 'Calculating bids...'
  },
  {
    id: 'fuel',
    title: 'Fuel Delivery',
    subtitle: 'Petrol / Diesel',
    description: 'Stranded without fuel? We\'ll bring it to you.',
    icon: Fuel,
    type: 'emergency',
    color: 'bg-emerald-600',
    price: 15000,
    eta: 'Calculating bids...'
  },
  {
    id: 'wash',
    title: 'Car Wash',
    subtitle: 'Mobile Wash',
    description: 'Professional cleaning at your location.',
    icon: Droplet,
    type: 'emergency',
    color: 'bg-sky-600',
    price: 10000,
    eta: 'Calculating bids...'
  }
];
