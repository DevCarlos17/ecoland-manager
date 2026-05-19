
import React from 'react';
import { LayoutDashboard, ShoppingBag, Users, BedDouble, Box, ChartBar, Briefcase, X, History, CalendarDays, Tag, LogOut } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, onClose }) => {
  const menuItems = [
    { id: ViewState.RESUMEN, label: 'Operaciones', subLabel: 'Dashboard en Vivo', icon: LayoutDashboard },
    { id: ViewState.POS, label: 'Punto de Venta', subLabel: 'Facturación y Cajas', icon: ShoppingBag },
    { id: ViewState.ACCESO_LOGS, label: 'Historial', subLabel: 'Logs de Acceso', icon: History },
    { id: ViewState.AGENDA, label: 'Agenda', subLabel: 'Clases y Eventos', icon: CalendarDays },
    { id: ViewState.MEMBRESIA, label: 'Clientes', subLabel: 'Directorio y Accesos', icon: Users },
    { id: ViewState.HOTEL, label: 'Hotel', subLabel: 'Habitaciones y Reservas', icon: BedDouble },
    { id: ViewState.INVENTARIO, label: 'Inventario', subLabel: 'Productos y Stock', icon: Box },
    { id: ViewState.DESCUENTOS, label: 'Promociones', subLabel: 'Reglas de Descuento', icon: Tag },
    { id: ViewState.EQUIPO, label: 'Equipo', subLabel: 'Staff', icon: Briefcase },
    { id: ViewState.FINANZAS, label: 'Finanzas', subLabel: 'Reportes y Tasas', icon: ChartBar },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 h-full w-72 bg-[#18181b] text-white flex flex-col border-r border-zinc-800 z-50 transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:static`}>
        
        {/* Brand - Logo Image */}
        <div className="h-24 flex items-center justify-center px-6 border-b border-zinc-800 relative">
           <img src={"https://image2url.com/images/1766106047095-280e4121-f53f-4685-8150-afbf8c0a34b4.png"} className="w-auto h-32 object-contain opacity-100"/>
           
           <button onClick={onClose} className="lg:hidden absolute right-4 p-2 text-zinc-400 hover:text-white">
             <X className="w-6 h-6" />
           </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id);
                  onClose();
                }}
                className={`w-full flex items-center px-5 py-4 transition-all duration-200 group rounded-xl text-left
                  ${isActive 
                    ? 'bg-zinc-800 text-white' 
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                  }`}
              >
                <item.icon strokeWidth={1.5} className={`w-5 h-5 min-w-[1.25rem] transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-brand' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                <div className="ml-4">
                    <span className={`block text-sm tracking-wide ${isActive ? 'font-semibold text-white' : 'font-normal'}`}>
                        {item.label}
                    </span>
                    <span className={`block text-[10px] uppercase tracking-wider mt-0.5 ${isActive ? 'text-zinc-400' : 'text-zinc-600 group-hover:text-zinc-500'}`}>
                        {item.subLabel}
                    </span>
                </div>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand"></div>}
              </button>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-zinc-800 bg-[#18181b]">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-brand/20">
                    JD
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">John Doe</p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider truncate">Administrador</p>
                </div>
                <LogOut className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
