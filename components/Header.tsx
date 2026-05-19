
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, Command, CheckCircle, XCircle, AlertTriangle, User, X, ShoppingBag, Calculator } from 'lucide-react';
import { ExchangeRate, Client } from '../types';
import { MOCK_CLIENTS } from '../constants';
import ClientDetailsSidebar from './ClientDetailsSidebar';

interface HeaderProps {
  rate: ExchangeRate;
  onMenuClick: () => void;
  onRateClick: () => void;
  onCalculatorClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ rate, onMenuClick, onRateClick, onCalculatorClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // State for the new Sidebar Logic
  const [isClientSidebarOpen, setIsClientSidebarOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Mock Notifications
  const notifications = [
    { id: 1, title: 'Pago Recibido', desc: 'Valeria R. ha pagado $45.00', time: 'Hace 5 min', icon: ShoppingBag, color: 'text-green-500 bg-green-50' },
    { id: 2, title: 'Stock Bajo', desc: 'Proteína Whey (2 unidades restantes)', time: 'Hace 1 hora', icon: AlertTriangle, color: 'text-orange-500 bg-orange-50' },
    { id: 3, title: 'Reserva Confirmada', desc: 'Habitación 104 reservada', time: 'Hace 2 horas', icon: CheckCircle, color: 'text-brand bg-blue-50' },
  ];

  // Keyboard shortcut listener for Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Format Date for Rate
  const formattedTime = new Intl.DateTimeFormat('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(new Date(rate.lastUpdated));

  const formattedDate = new Intl.DateTimeFormat('es-VE', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(rate.lastUpdated));

  // --- SEARCH LOGIC (Updated) ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          handleSearchSubmit();
      }
  };

  const handleSearchSubmit = () => {
      if (!searchQuery.trim()) return;

      const foundClient = MOCK_CLIENTS.find(c => c.id.toLowerCase() === searchQuery.toLowerCase());
      
      if (foundClient) {
          setSelectedClient(foundClient);
          setIsClientSidebarOpen(true);
          setSearchQuery(''); // Optional: clear search on success
          inputRef.current?.blur();
      } else {
          // Visual feedback for not found could be added here (e.g., toast or shake)
          alert("Cliente no encontrado con ese ID");
      }
  };

  const closeSidebar = () => {
      setIsClientSidebarOpen(false);
      setSelectedClient(null);
  }

  return (
    <>
    <header className="h-20 lg:h-24 bg-white/80 backdrop-blur-xl border-b border-zinc-100 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-30">
      
      {/* LEFT: Menu Only */}
      <div className="flex items-center h-full">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
      </div>

      {/* CENTER: Search Bar - ID Only (On Enter) */}
      <div className="hidden md:flex flex-1 max-w-md mx-6 relative h-full items-center justify-center">
         <div className="w-full relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
            <input 
              ref={inputRef}
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escanear ID y presionar Enter..." 
              className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 border border-transparent hover:bg-white hover:border-zinc-200 focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 rounded-xl text-sm outline-none transition-all text-zinc-900 placeholder:text-zinc-400 font-mono"
            />
            {!searchQuery && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                <div className="bg-zinc-100 rounded px-1.5 py-0.5 flex items-center border border-zinc-200">
                    <Command className="w-3 h-3 text-zinc-400" />
                    <span className="text-[10px] font-bold text-zinc-400 ml-0.5">K</span>
                </div>
                </div>
            )}
            {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900">
                    <X className="w-3 h-3" />
                </button>
            )}
         </div>
      </div>

      {/* RIGHT: Notifications, Calculator & Exchange Rate */}
      <div className="flex items-center gap-4 md:gap-6">
        
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors ${showNotifications ? 'bg-zinc-100 text-black' : 'text-zinc-400 hover:text-black hover:bg-zinc-50'}`}
            >
                <Bell strokeWidth={2} className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            {showNotifications && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden z-40 animate-zoom-in">
                    <div className="p-4 border-b border-zinc-50 flex justify-between items-center">
                        <h4 className="font-semibold text-sm">Notificaciones</h4>
                        <span className="text-[10px] font-bold text-brand uppercase cursor-pointer hover:underline">Marcar leídas</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.map(n => (
                            <div key={n.id} className="p-4 border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors flex gap-3">
                                <div className={`w-8 h-8 rounded-full ${n.color} flex items-center justify-center flex-shrink-0`}>
                                    <n.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-medium text-zinc-900">{n.title}</h5>
                                    <p className="text-xs text-zinc-500 leading-snug">{n.desc}</p>
                                    <span className="text-[10px] text-zinc-400 mt-1 block">{n.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Calculator Button */}
        <button 
            onClick={onCalculatorClick}
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-50 transition-colors"
            title="Calculadora"
        >
            <Calculator strokeWidth={2} className="w-5 h-5" />
        </button>

        {/* SEPARATOR */}
        <div className="h-8 w-px bg-zinc-200 hidden md:block"></div>

        {/* Exchange Rate Compact Widget */}
        <div 
            onClick={onRateClick}
            className="flex flex-col justify-center bg-white border border-zinc-200 py-1.5 px-3 rounded-lg shadow-sm cursor-pointer group hover:border-zinc-300 transition-all min-w-[130px]"
        >
            <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold leading-none">Tasa BCV</span>
                <div className="flex items-center gap-0.5 leading-none">
                    <span className="text-sm font-bold text-zinc-900">{rate.usdToBs.toFixed(2)}</span>
                    <span className="text-[9px] text-zinc-500 font-medium">Bs</span>
                </div>
            </div>
            {/* Internal Divider */}
            <div className="w-full h-px bg-zinc-100 mb-1"></div>
            <div className="flex items-center justify-end gap-1">
                <span className="text-[9px] text-zinc-400 font-mono">
                    {formattedDate} • {formattedTime}
                </span>
            </div>
        </div>

      </div>
    </header>

    {/* Integrated Client Sidebar */}
    <ClientDetailsSidebar 
        isOpen={isClientSidebarOpen}
        onClose={closeSidebar}
        client={selectedClient}
    />
    </>
  );
};

export default Header;
