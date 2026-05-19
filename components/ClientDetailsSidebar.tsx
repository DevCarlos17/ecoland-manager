
import React from 'react';
import { X, User, Clock, Calendar, CheckCircle, AlertTriangle, PlayCircle, BedDouble, Gamepad2, Dumbbell, Waves, CreditCard, MoreHorizontal, Phone, Mail, Activity, Timer, ChevronRight } from 'lucide-react';
import { Client } from '../types';

interface ClientDetailsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

const ClientDetailsSidebar: React.FC<ClientDetailsSidebarProps> = ({ isOpen, onClose, client }) => {
  if (!client) return null;

  // Helper to determine service details
  const getServiceDetails = (planName: string) => {
    const name = planName.toLowerCase();
    
    // 1. HOTEL SERVICES
    if (name.includes('habitacion') || name.includes('suite') || name.includes('10')) {
        return {
            type: 'HOTEL',
            icon: BedDouble,
            title: planName,
            statusLabel: 'Huésped',
            statusColor: 'bg-zinc-900 text-white', // Black badge
            detail: 'Salida: Mañana 12:00 PM',
            accent: 'text-indigo-600',
        };
    }

    // 2. HOURLY SERVICES (Gamer, Billar, Ping Pong)
    if (name.includes('gamer') || name.includes('billar') || name.includes('ping pong') || name.includes('mesa')) {
        return {
            type: 'HOURLY',
            icon: name.includes('gamer') ? Gamepad2 : Activity,
            title: planName,
            statusLabel: 'En uso',
            statusColor: 'bg-brand text-white', // Brand Blue badge
            detail: 'Pagado: 2 Horas',
            subDetail: 'Restante: 45 min',
            accent: 'text-purple-600',
        };
    }

    // 3. DAILY PASS (Pool)
    if (name.includes('piscina') || name.includes('day pass') || name.includes('wet')) {
        return {
            type: 'DAILY',
            icon: Waves,
            title: planName,
            statusLabel: 'Day Pass',
            statusColor: 'bg-blue-500 text-white',
            detail: 'Vence: Hoy 8:00 PM',
            accent: 'text-blue-600',
        };
    }

    // 4. MEMBERSHIPS (Default)
    const daysLeft = Math.floor(Math.random() * 30); 
    const isLow = daysLeft < 5;
    
    return {
        type: 'MEMBERSHIP',
        icon: Dumbbell,
        title: planName,
        statusLabel: isLow ? 'Por Vencer' : 'Activo',
        statusColor: isLow ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700',
        detail: `${daysLeft} días restantes`,
        accent: 'text-zinc-900',
        isUrgent: isLow
    };
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header with Quick Actions */}
        <div className="p-6 border-b border-zinc-100 bg-white flex justify-between items-start">
            <div className="flex gap-4">
                <div className="relative">
                    <img src={client.avatar} className="w-16 h-16 rounded-full object-cover border border-zinc-100 shadow-sm" />
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${client.status === 'ACTIVO' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 leading-tight">{client.name}</h2>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">ID: {client.id.toUpperCase()}</p>
                    <div className="flex gap-2 mt-2">
                        <button className="p-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 transition-all">
                            <Phone className="w-3 h-3" />
                        </button>
                        <button className="p-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 transition-all">
                            <Mail className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#fafafa]">
            
            {/* 1. Status & Debt Overview */}
            <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border bg-white flex flex-col justify-between h-24 ${client.status === 'ACTIVO' ? 'border-zinc-200' : 'border-red-200'}`}>
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Estado</span>
                        {client.status === 'ACTIVO' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </div>
                    <span className={`text-lg font-bold ${client.status === 'ACTIVO' ? 'text-zinc-900' : 'text-red-600'}`}>
                        {client.status}
                    </span>
                </div>
                
                <div className="p-4 rounded-2xl border border-zinc-200 bg-white flex flex-col justify-between h-24 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start z-10">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Saldo Pendiente</span>
                        <CreditCard className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                    </div>
                    <span className="text-2xl font-light text-zinc-900 z-10">$0.00</span>
                </div>
            </div>

            {/* 2. Active Services (Redesigned) */}
            <div>
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                        <Activity className="w-3 h-3" /> Servicios Activos
                    </h3>
                    <span className="text-[10px] font-bold bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded">
                        {client.activePlans.length}
                    </span>
                </div>
                
                {client.activePlans.length > 0 ? (
                    <div className="space-y-3">
                        {client.activePlans.map((plan, idx) => {
                            const details = getServiceDetails(plan);
                            const Icon = details.icon;
                            
                            return (
                                <div key={idx} className="group bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all">
                                    {/* Card Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            {/* Minimalist Icon Box */}
                                            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900 group-hover:bg-zinc-100 transition-colors">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-zinc-900 leading-tight">{details.title}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                     <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wide ${details.statusColor}`}>
                                                        {details.statusLabel}
                                                     </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Action Icon */}
                                        <button className="text-zinc-300 hover:text-zinc-900 transition-colors">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Card Details / Footer */}
                                    <div className="mt-4 pt-3 border-t border-zinc-100">
                                        
                                        {/* HOURLY LOGIC */}
                                        {details.type === 'HOURLY' && (
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <Timer className="w-4 h-4 text-zinc-400" />
                                                    <span className="text-sm font-bold font-mono text-zinc-900">
                                                        {details.subDetail?.split(': ')[1]}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-400 uppercase font-medium">Restante</span>
                                                </div>
                                                <div className="text-[10px] text-zinc-500 font-medium bg-zinc-50 px-2 py-1 rounded">
                                                    {details.detail}
                                                </div>
                                            </div>
                                        )}

                                        {/* HOTEL LOGIC */}
                                        {details.type === 'HOTEL' && (
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2 text-xs text-zinc-600">
                                                    <CheckCircle className="w-3.5 h-3.5 text-zinc-900" />
                                                    <span>Habitación Ocupada</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                                                    Salida: 12:00 PM
                                                </span>
                                            </div>
                                        )}

                                        {/* MEMBERSHIP LOGIC */}
                                        {details.type === 'MEMBERSHIP' && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-zinc-500">Días Restantes</span>
                                                    <span className={`font-bold ${details.isUrgent ? 'text-red-500' : 'text-zinc-900'}`}>
                                                        {details.detail.split(' ')[0]} días
                                                    </span>
                                                </div>
                                                {/* Minimal Progress Bar */}
                                                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${details.isUrgent ? 'bg-red-500' : 'bg-zinc-900'}`} 
                                                        style={{ width: `${Math.random() * 80 + 20}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* DAILY LOGIC */}
                                        {details.type === 'DAILY' && (
                                            <div className="flex justify-between items-center text-xs">
                                                 <span className="text-zinc-400 font-medium">Vence hoy</span>
                                                 <span className="font-mono font-bold text-zinc-900">08:00 PM</span>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="p-8 border border-zinc-200 bg-white rounded-2xl text-center shadow-sm">
                        <span className="block text-sm text-zinc-900 font-bold mb-1">Sin servicios activos</span>
                        <span className="block text-xs text-zinc-400">El cliente no tiene suscripciones vigentes.</span>
                    </div>
                )}
            </div>

            {/* 3. Client Notes */}
            {client.notes && (
                <div className="bg-yellow-50/40 p-5 rounded-2xl border border-yellow-100/60">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-yellow-600/80 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" /> Notas del Perfil
                    </h4>
                    <p className="text-sm text-zinc-600 italic leading-relaxed">"{client.notes}"</p>
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-zinc-100 bg-white">
            <div className="grid grid-cols-2 gap-3">
                <button className="py-3.5 rounded-xl border border-zinc-200 text-zinc-600 font-bold text-xs uppercase tracking-widest hover:bg-zinc-50 hover:border-zinc-300 transition-all flex items-center justify-center gap-2">
                    <MoreHorizontal className="w-4 h-4" /> Historial
                </button>
                <button className="py-3.5 rounded-xl bg-zinc-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-brand transition-all shadow-lg shadow-zinc-900/10 flex items-center justify-center gap-2">
                    <PlayCircle className="w-4 h-4" /> Venta Rápida
                </button>
            </div>
        </div>

      </div>
    </>
  );
};

export default ClientDetailsSidebar;
