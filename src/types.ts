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
  status: 'searching' | 'assigned' | 'on-the-way' | 'arrived' | 'in-progress' | 'completed' | 'transferred';
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
    subtitle: 'Towing / Recovery',
    description: 'Quick recovery for engine or mechanical failure.',
    icon: Car,
    type: 'emergency',
    color: 'bg-rose-500',
    price: 2000,
    eta: '12-18 min'
  },
  {
    id: 'tire',
    title: 'Tire Change',
    subtitle: 'Spare or Repair',
    description: 'Flat tire? We\'ll swap it for your spare or repair it.',
    icon: Wrench,
    type: 'emergency',
    color: 'bg-slate-yellow',
    price: 80,
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
    price: 508.6,
    eta: '15-22 min'
  },
  {
    id: 'wash',
    title: 'Car Wash',
    subtitle: 'Mobile Detailing',
    description: 'Professional cleaning at your location.',
    icon: Droplet,
    type: 'emergency',
    color: 'bg-sky-600',
    price: 150,
    eta: '20-30 min'
  },
  {
    id: 'addon-drinks',
    title: 'Cold Drinks',
    subtitle: 'Soda / Water / Energy',
    description: 'Ice-cold refreshments brought along by the dispatch team.',
    icon: Utensils,
    type: 'extended',
    color: 'bg-amber-600',
    price: 20,
    isAddOn: true
  },
  {
    id: 'addon-snacks',
    title: 'Snack Pack',
    subtitle: 'Chips / Nuts / Cookies',
    description: 'A selection of snacks for your comfort while waiting.',
    icon: Utensils,
    type: 'extended',
    color: 'bg-rose-600',
    price: 50,
    isAddOn: true
  }
];
