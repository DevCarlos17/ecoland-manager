


export enum ViewState {
  RESUMEN = 'RESUMEN',          // Dashboard Operativo / Bitácora
  POS = 'POS',                  // Sistema de Pagos
  ACCESO_LOGS = 'ACCESO_LOGS',  // Historial detallado (Antes Acceso)
  MEMBRESIA = 'MEMBRESIA',      // Gestión de Usuarios
  AGENDA = 'AGENDA',            // Calendario
  HOTEL = 'HOTEL',              // Gestión Hotelera
  EQUIPO = 'EQUIPO',            // Staff
  INVENTARIO = 'INVENTARIO',    // Stock
  FINANZAS = 'FINANZAS',        // Reportes
  DESCUENTOS = 'DESCUENTOS',    // New View
}

export interface ExchangeRate {
  usdToBs: number;
  lastUpdated: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'ACTIVO' | 'INACTIVO' | 'VENCIDO' | 'PAUSA_MEDICA';
  activePlans: string[]; // List of active subscriptions/access (e.g. ['Suite 101', 'CrossFit'])
  avatar: string;
  lastAccess?: string;
  notes?: string;
}

export interface AccessLog {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  timestamp: string;
  location: string;
  status: 'GRANTED' | 'DENIED' | 'MANUAL';
  message?: string;
}

export interface Trainer {
  id: string;
  name: string;
  specialty: string;
  type: 'INTERNO' | 'EXTERNO';
  fixedFee: number; // The fixed amount they pay PER client to the gym
  monthlyRevenue: number; // Total generated for the gym
  activeClients: number;
  avatar: string;
  status: 'ACTIVO' | 'INACTIVO';
}

export interface Product {
  id: string;
  name: string;
  priceUsd: number;
  category: 'SUPLEMENTOS' | 'BEBIDAS' | 'EQUIPO' | 'ALIMENTOS' | 'ACCESO';
  stock: number;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Discount {
  id: string;
  name: string;
  code?: string; // Optional coupon code
  type: 'PERCENTAGE' | 'FIXED';
  value: number; // The amount (e.g., 10 for 10% or 10$)
  target: 'TOTAL' | 'CATEGORY' | 'PRODUCT';
  targetValue?: string; // e.g., 'BEBIDAS' or product ID
  minPurchase?: number; // Minimum subtotal to apply
  maxDiscount?: number; // Cap for percentage discounts
  isActive: boolean;
  color?: string; // For UI identification
}

export interface Transaction {
  id: string;
  date: string;
  clientName: string;
  totalUsd: number;
  totalBs: number;
  method: 'EFECTIVO_USD' | 'EFECTIVO_BS' | 'ZELLE' | 'PAGO_MOVIL' | 'PUNTO_VENTA';
  status: 'COMPLETADO' | 'PENDIENTE';
}

export interface Room {
  id: string;
  number: string;
  type: 'SENCILLA' | 'DOBLE' | 'SUITE';
  status: 'DISPONIBLE' | 'OCUPADA' | 'LIMPIEZA' | 'MANTENIMIENTO' | 'RESERVADA';
  priceNight: number;
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; 
  end: string;
  day: number; 
  trainer: string;
  type: 'CLASS' | 'MAINTENANCE' | 'PRIVATE';
  capacity?: string;
}
