import { LucideIcon, Car, Wrench, Fuel, Droplet, Truck, Utensils, ShieldAlert } from 'lucide-react';

export type ServiceType = 'emergency' | 'extended';

export interface User {
  name: string;
  phone: string;
  email: string;
  avatar?: string;
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
  price: number;
  eta?: string;
  isAddOn?: boolean;
}

export interface Request {
  id: string;
  serviceId: string;
  addOnIds?: string[];
  status: 'searching' | 'assigned' | 'on-the-way' | 'arrived' | 'in-progress' | 'completed';
  location: {
    lat?: number;
    lng?: number;
    address: string;
  };
  timestamp: number;
  vehicleInfo: string;
  notes?: string;
  estimatedArrival?: number; // in minutes
  totalCost: number;
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
    price: 499,
    eta: '12-18 min'
  },
  {
    id: 'tire',
    title: 'Tire Change',
    subtitle: 'Flat / Puncture',
    description: 'Flat tire? We\'ll swap it for your spare or repair it.',
    icon: Wrench,
    type: 'emergency',
    color: 'bg-slate-yellow',
    price: 399,
    eta: '8-14 min'
  },
  {
    id: 'fuel',
    title: 'Fuel Delivery',
    subtitle: 'Petrol / Diesel',
    description: 'Stranded without fuel? We\'ll bring it to you.',
    icon: Fuel,
    type: 'emergency',
    color: 'bg-emerald-600',
    price: 299,
    eta: '15-22 min'
  },
  {
    id: 'wash',
    title: 'Car Wash',
    subtitle: 'Car / Bike',
    description: 'Professional cleaning at your location.',
    icon: Droplet,
    type: 'emergency',
    color: 'bg-sky-600',
    price: 599,
    eta: '20-30 min'
  },
  {
    id: 'servicing',
    title: 'Servicing',
    subtitle: 'Maintenance',
    description: 'Routine maintenance and oil change.',
    icon: Truck,
    type: 'extended',
    color: 'bg-slate-yellow',
    price: 799,
    isAddOn: true
  },
  {
    id: 'recovery',
    title: 'Accident Recovery',
    subtitle: 'Towing',
    description: 'Safe towing and revival for damaged vehicles.',
    icon: ShieldAlert,
    type: 'extended',
    color: 'bg-slate-600',
    price: 1299,
    isAddOn: true
  },
  {
    id: 'fuel-addon',
    title: 'Fuel',
    subtitle: 'Top-up',
    description: 'Extra fuel for your journey.',
    icon: Fuel,
    type: 'extended',
    color: 'bg-emerald-600',
    price: 299,
    isAddOn: true
  }
];
