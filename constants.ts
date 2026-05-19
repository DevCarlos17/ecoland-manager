


import { Client, Product, Room, Transaction, Trainer, AccessLog, Discount } from './types';

// Using ISO string for real date formatting test
export const MOCK_RATE = {
  usdToBs: 278.51,
  lastUpdated: new Date().toISOString() 
};

export const MOCK_CLIENTS: Client[] = [
  { 
    id: '1', 
    name: 'Valeria Rodriguez', 
    email: 'vale.rod@gmail.com', 
    phone: '+58 412 555 0101', 
    status: 'ACTIVO', 
    activePlans: ['CrossFit Ilimitado', 'Acceso Piscina'],
    avatar: 'https://picsum.photos/id/64/200/200', 
    lastAccess: 'Hoy 08:30 AM',
    notes: 'Prefiere entrenar en las mañanas.'
  },
  { 
    id: '2', 
    name: 'Carlos Mendoza', 
    email: 'carlos.men@hotmail.com', 
    phone: '+58 424 555 0102', 
    status: 'VENCIDO', 
    activePlans: ['Gimnasio Mensual'],
    avatar: 'https://picsum.photos/id/91/200/200', 
    lastAccess: '25 Oct 2023' 
  },
  { 
    id: '3', 
    name: 'Ana Paola Silva', 
    email: 'ana.p@gmail.com', 
    phone: '+58 414 555 0103', 
    status: 'ACTIVO', 
    activePlans: ['Suite 104', 'Desayuno', 'Piscina Day Pass'],
    avatar: 'https://picsum.photos/id/129/200/200', 
    lastAccess: 'Hace 3 días',
    notes: 'Huésped Hotel. Alérgica al maní.'
  },
  { 
    id: '4', 
    name: 'Miguel Angel Torres', 
    email: 'migue.t@outlook.com', 
    phone: '+58 412 555 0104', 
    status: 'INACTIVO', 
    activePlans: [],
    avatar: 'https://picsum.photos/id/177/200/200', 
    lastAccess: 'Hace 1 mes' 
  },
  { 
    id: '5', 
    name: 'Luisa Fernanda', 
    email: 'luisa.f@gmail.com', 
    phone: '+58 412 555 0105', 
    status: 'PAUSA_MEDICA', 
    activePlans: ['Yoga Ilimitado', 'Suite 201'],
    avatar: 'https://picsum.photos/id/338/200/200', 
    lastAccess: 'Ayer',
    notes: 'Lesión de rodilla. Huésped recurrente.'
  },
];

export const MOCK_ACCESS_LOGS: AccessLog[] = [
  { id: 'l1', clientId: '1', clientName: 'Valeria Rodriguez', clientAvatar: 'https://picsum.photos/id/64/200/200', timestamp: 'Hace 2 min', location: 'Molino Principal', status: 'GRANTED' },
  { id: 'l2', clientId: '5', clientName: 'Luisa Fernanda', clientAvatar: 'https://picsum.photos/id/338/200/200', timestamp: 'Hace 15 min', location: 'Molino Principal', status: 'GRANTED' },
  { id: 'l3', clientId: '2', clientName: 'Carlos Mendoza', clientAvatar: 'https://picsum.photos/id/91/200/200', timestamp: 'Hace 45 min', location: 'Recepción', status: 'DENIED', message: 'Membresía Vencida' },
  { id: 'l4', clientId: '3', clientName: 'Ana Paola Silva', clientAvatar: 'https://picsum.photos/id/129/200/200', timestamp: 'Hace 1 hora', location: 'Piscina', status: 'MANUAL', message: 'Registro Manual' },
];

export const MOCK_TRAINERS: Trainer[] = [
  { id: 't1', name: 'Juan Pérez', specialty: 'CrossFit Head Coach', type: 'INTERNO', fixedFee: 15.00, monthlyRevenue: 675.00, activeClients: 45, status: 'ACTIVO', avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=000&color=fff' },
  { id: 't2', name: 'Maria S.', specialty: 'Yoga & Pilates', type: 'EXTERNO', fixedFee: 25.00, monthlyRevenue: 300.00, activeClients: 12, status: 'ACTIVO', avatar: 'https://ui-avatars.com/api/?name=Maria+S&background=1d4ed8&color=fff' },
  { id: 't3', name: 'Roberto G.', specialty: 'Musculación', type: 'INTERNO', fixedFee: 10.00, monthlyRevenue: 800.00, activeClients: 80, status: 'ACTIVO', avatar: 'https://ui-avatars.com/api/?name=Roberto+G&background=333&color=fff' },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Proteína Whey Gold', priceUsd: 45.00, category: 'SUPLEMENTOS', stock: 12, image: 'https://picsum.photos/id/312/200/200' },
  { id: 'p2', name: 'Bebida Energética', priceUsd: 3.50, category: 'BEBIDAS', stock: 120, image: 'https://picsum.photos/id/437/200/200' },
  { id: 'p3', name: 'Agua Mineral 500ml', priceUsd: 1.50, category: 'BEBIDAS', stock: 200, image: 'https://picsum.photos/id/526/200/200' },
  { id: 'p4', name: 'Barra Proteica', priceUsd: 2.50, category: 'ALIMENTOS', stock: 80, image: 'https://picsum.photos/id/835/200/200' },
  { id: 'p5', name: 'Vendas de Boxeo', priceUsd: 12.00, category: 'EQUIPO', stock: 15, image: 'https://picsum.photos/id/96/200/200' },
  { id: 'p6', name: 'Day Pass Gimnasio', priceUsd: 10.00, category: 'ACCESO', stock: 9999, image: 'https://picsum.photos/id/73/200/200' },
  { id: 'p7', name: 'Hora Gamer Zone', priceUsd: 8.00, category: 'ACCESO', stock: 9999, image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&q=80' },
  { id: 'p8', name: 'CrossFit Drop-In', priceUsd: 15.00, category: 'ACCESO', stock: 9999, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80' },
  { id: 'p9', name: 'Acceso Piscina', priceUsd: 12.00, category: 'ACCESO', stock: 9999, image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&q=80' },
];

export const MOCK_ROOMS: Room[] = [
  { id: '101', number: '101', type: 'SENCILLA', status: 'OCUPADA', priceNight: 45 },
  { id: '102', number: '102', type: 'DOBLE', status: 'DISPONIBLE', priceNight: 65 },
  { id: '103', number: '103', type: 'SUITE', status: 'LIMPIEZA', priceNight: 120 },
  { id: '104', number: '104', type: 'SENCILLA', status: 'DISPONIBLE', priceNight: 45 },
];

export const RECENT_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '27/10 10:30', clientName: 'Valeria Rodriguez', totalUsd: 15.00, totalBs: 547.65, method: 'PAGO_MOVIL', status: 'COMPLETADO' },
  { id: 't2', date: '27/10 09:15', clientName: 'Cliente Casual', totalUsd: 3.50, totalBs: 127.78, method: 'EFECTIVO_USD', status: 'COMPLETADO' },
  { id: 't3', date: '26/10 18:45', clientName: 'Carlos Mendoza', totalUsd: 65.00, totalBs: 2373.15, method: 'ZELLE', status: 'COMPLETADO' },
];

export const MOCK_DISCOUNTS: Discount[] = [
  { id: 'd1', name: 'Staff Ecoland', type: 'PERCENTAGE', value: 50, target: 'TOTAL', isActive: true, color: 'bg-purple-100 text-purple-700' },
  { id: 'd2', name: 'Promo Verano Bebidas', type: 'PERCENTAGE', value: 20, target: 'CATEGORY', targetValue: 'BEBIDAS', minPurchase: 10, isActive: true, color: 'bg-orange-100 text-orange-700' },
  { id: 'd3', name: 'Cupón Bienvenida', type: 'FIXED', value: 5, target: 'TOTAL', minPurchase: 30, isActive: true, color: 'bg-green-100 text-green-700' },
  { id: 'd4', name: 'Descuento CrossFit', type: 'FIXED', value: 2, target: 'PRODUCT', targetValue: 'p8', isActive: false, color: 'bg-zinc-100 text-zinc-700' },
];
