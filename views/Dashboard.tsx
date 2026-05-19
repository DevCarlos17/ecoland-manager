
import React from 'react';
import { Users, ShoppingBag, UserPlus, CalendarCheck, Wallet, ShieldCheck, XCircle, Activity, TrendingUp, Zap, ArrowRight, Clock, Dumbbell, Waves, Timer, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { MOCK_ACCESS_LOGS } from '../constants';
import { ViewState } from '../types';

interface DashboardProps {
    onChangeView?: (view: ViewState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  
  const getLogStatusStyle = (status: string) => {
      switch(status) {
          case 'GRANTED': return { icon: ShieldCheck, color: 'text-green-600' };
          case 'DENIED': return { icon: XCircle, color: 'text-red-600' };
          case 'MANUAL': return { icon: Zap, color: 'text-yellow-600' };
          default: return { icon: Activity, color: 'text-zinc-500' };
      }
  };

  // Mock Data for Dashboard-specific Upcoming Events
  const UPCOMING_EVENTS = [
      { id: 'e1', title: 'CrossFit WOD', time: 'En curso', endTime: '10:00 AM', location: 'Box Principal', trainer: 'Juan P.', type: 'CLASS', status: 'LIVE' },
      { id: 'e2', title: 'Yoga Flow', time: '10:30 AM', location: 'Salón B', trainer: 'Ana S.', type: 'CLASS', status: 'UPCOMING' },
      { id: 'e3', title: 'Mantenimiento A/C', time: '02:00 PM', location: 'Recepción', type: 'MAINTENANCE', status: 'UPCOMING' },
  ];

  // Daily Visits Data (Cumulative count for today)
  const zones = [
      { name: 'Gimnasio', count: 58, icon: Dumbbell },
      { name: 'CrossFit', count: 24, icon: Timer },
      { name: 'Piscina', count: 8, icon: Waves },
  ];

  return (
    <div className="animate-fade-in pb-24 lg:pb-0 h-full flex flex-col max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl lg:text-3xl font-medium text-zinc-900 tracking-tight">Resumen Operativo</h1>
            <p className="text-zinc-500 text-sm mt-1">Visión general del gimnasio.</p>
          </div>
          <span className="text-xs font-mono text-zinc-400 bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            En Vivo
          </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        
        {/* LEFT COLUMN (Primary Hierarchy): Operations & Metrics (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
            
            {/* 1. Caja del Día (No Shadow) */}
            <div className="bg-zinc-900 text-white p-6 rounded-2xl flex flex-col justify-between h-48 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Wallet className="w-32 h-32 transform rotate-12" />
                </div>
                
                <div className="relative z-10 flex justify-between items-start">
                    <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                            <Wallet className="w-4 h-4" />
                         </div>
                         <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Caja del Día</span>
                    </div>
                    <span className="text-[10px] font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-lg flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +12%
                    </span>
                </div>

                <div className="relative z-10 mt-auto">
                    <span className="text-5xl font-light tracking-tighter block mb-2">$1,240.50</span>
                    <div className="flex items-center gap-4 text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span> Efec: $450</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span> Dig: $790</span>
                    </div>
                </div>
            </div>

            {/* 2. Venta Express (Matched Color, No Shadow) */}
            <button 
              onClick={() => onChangeView && onChangeView(ViewState.POS)}
              className="bg-zinc-900 text-white p-5 rounded-2xl hover:bg-zinc-800 transition-colors duration-200 text-left flex items-center justify-between group"
            >
                <div>
                    <span className="block text-xl font-medium tracking-tight">Venta Express</span>
                    <span className="block text-xs text-white/60 mt-0.5">Abrir Punto de Venta</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-6 h-6" />
                </div>
            </button>

            {/* 3. Visitas por Zona (Redesigned: Serious List View) */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm flex flex-col justify-center">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-500">Visitas por Zona</h4>
                    <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-1 rounded font-medium">Hoy</span>
                </div>
                
                <div className="space-y-6">
                    {zones.map((zone) => (
                        <div key={zone.name} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 group-hover:bg-zinc-100 transition-colors">
                                    <zone.icon className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium text-zinc-700">{zone.name}</span>
                            </div>
                            <span className="text-lg font-bold text-zinc-900 tracking-tight">{zone.count}</span>
                        </div>
                    ))}
                </div>
            </div>

             {/* 4. Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => onChangeView && onChangeView(ViewState.MEMBRESIA)}
                    className="bg-white border border-zinc-200/60 p-5 rounded-xl hover:border-zinc-300 transition-all text-left group hover:shadow-sm"
                >
                    <UserPlus className="w-6 h-6 text-zinc-300 group-hover:text-brand mb-4 transition-colors" />
                    <span className="text-sm font-bold text-zinc-700 block leading-tight">Nuevo<br/>Miembro</span>
                </button>
                <button 
                    onClick={() => onChangeView && onChangeView(ViewState.AGENDA)}
                    className="bg-white border border-zinc-200/60 p-5 rounded-xl hover:border-zinc-300 transition-all text-left group hover:shadow-sm"
                >
                    <CalendarCheck className="w-6 h-6 text-zinc-300 group-hover:text-brand mb-4 transition-colors" />
                    <span className="text-sm font-bold text-zinc-700 block leading-tight">Reservar<br/>Clase</span>
                </button>
            </div>
        </div>

        {/* RIGHT COLUMN (Lower Hierarchy): Split Widgets (col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-6 h-full min-h-0">
             
             {/* 1. UPCOMING EVENTS WIDGET (Separated & Redesigned) */}
             <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex-shrink-0">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-zinc-400" /> Agenda de Hoy
                    </h3>
                    <button 
                        onClick={() => onChangeView && onChangeView(ViewState.AGENDA)}
                        className="text-[10px] uppercase font-bold text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1"
                    >
                        Calendario <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
                
                <div className="space-y-3">
                    {UPCOMING_EVENTS.map(event => (
                        <div 
                            key={event.id} 
                            className={`flex items-center gap-4 p-4 rounded-2xl transition-all border
                                ${event.status === 'LIVE' 
                                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' // Dark premium look for Live
                                    : 'bg-white text-zinc-900 border-zinc-100 hover:border-zinc-200'}`} // Clean look for others
                        >
                            
                            {/* Time Column */}
                            <div className="flex flex-col items-center justify-center w-14 flex-shrink-0 border-r border-white/10 pr-4">
                                {event.status === 'LIVE' ? (
                                    <>
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mb-1"></div>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-green-400">En Curso</span>
                                    </>
                                ) : (
                                    <span className="text-xs font-bold font-mono text-zinc-500">{event.time.split(' ')[0]}</span>
                                )}
                            </div>

                            {/* Info Column */}
                            <div className="flex-1 min-w-0 pl-1">
                                <h4 className={`text-sm font-bold leading-tight ${event.status === 'LIVE' ? 'text-white' : 'text-zinc-900'}`}>
                                    {event.title}
                                </h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`text-[10px] uppercase tracking-wide flex items-center gap-1 ${event.status === 'LIVE' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                        <MapPin className="w-3 h-3" /> {event.location}
                                    </span>
                                    {event.trainer && (
                                        <span className={`text-[10px] uppercase tracking-wide flex items-center gap-1 ${event.status === 'LIVE' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                            <UserPlus className="w-3 h-3" /> {event.trainer}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

             {/* 2. ACCESS LOGS WIDGET (Separated) */}
             <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-zinc-400" /> Historial de Acceso
                    </h3>
                    <button 
                        onClick={() => onChangeView && onChangeView(ViewState.ACCESO_LOGS)}
                        className="text-[10px] uppercase font-bold text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1"
                    >
                        Ver Todo <ArrowRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-3">
                        {MOCK_ACCESS_LOGS.map((log) => {
                            const style = getLogStatusStyle(log.status);
                            const Icon = style.icon;
                            return (
                                <div key={log.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 transition-colors group border border-transparent hover:border-zinc-100">
                                    {/* Minimal Icon */}
                                    <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <Icon className={`w-3.5 h-3.5 ${style.color}`} />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <span className="font-bold text-sm text-zinc-700">{log.clientName}</span>
                                            <span className="text-[10px] text-zinc-400 font-mono">
                                                {log.timestamp}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-zinc-500">{log.location}</p>
                                            {log.message && (
                                                <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded ml-2">{log.message}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        {/* Repeated items for visual fill */}
                        {MOCK_ACCESS_LOGS.map((log) => (
                            <div key={log.id + 'dup'} className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 transition-colors group opacity-40">
                                <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center flex-shrink-0">
                                    <Activity className="w-3.5 h-3.5 text-zinc-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <span className="font-medium text-sm text-zinc-500">{log.clientName}</span>
                                        <span className="text-[10px] text-zinc-300 font-mono">{log.timestamp}</span>
                                    </div>
                                    <p className="text-xs text-zinc-400">{log.location}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
