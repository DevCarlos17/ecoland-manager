
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './views/Dashboard';
import POS from './views/POS';
import Clients from './views/Clients';
import Agenda from './views/Agenda';
import Hotel from './views/Hotel';
import AccessControl from './views/AccessControl';
import Team from './views/Team';
import Inventory from './views/Inventory';
import Discounts from './views/Discounts'; 
import Finance from './views/Finance';
import { ViewState, ExchangeRate } from './types';
import { MOCK_RATE } from './constants';
import { RefreshCw, X, CloudDownload, ArrowRight, ArrowLeftRight } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.RESUMEN);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [rate, setRate] = useState<ExchangeRate>(MOCK_RATE);
  
  // Modals State
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  
  // Rate Modal Logic
  const [newRate, setNewRate] = useState(MOCK_RATE.usdToBs.toString());
  const [isSyncing, setIsSyncing] = useState(false);

  // Calculator Logic
  const [calcUsd, setCalcUsd] = useState('');
  const [calcBs, setCalcBs] = useState('');

  // Simulate Rate Updates for realism
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate automatic fetch logic here if needed
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Update calculator when modal opens
  useEffect(() => {
      if(isCalculatorOpen) {
          setCalcUsd('1');
          setCalcBs(rate.usdToBs.toFixed(2));
      }
  }, [isCalculatorOpen, rate]);

  const handleUpdateRate = () => {
      setRate({
          usdToBs: parseFloat(newRate),
          lastUpdated: new Date().toISOString()
      });
      setIsRateModalOpen(false);
  };

  const handleAutoSync = () => {
      setIsSyncing(true);
      // Simulate API call to BCV
      setTimeout(() => {
          // Generate a slightly different realistic rate
          const simulatedRate = (Math.random() * (280 - 275) + 275).toFixed(2);
          setNewRate(simulatedRate);
          setIsSyncing(false);
      }, 1500);
  };

  // Calculator Conversion Logic
  const handleCalcChange = (type: 'USD' | 'BS', value: string) => {
      if (value === '') {
          setCalcUsd('');
          setCalcBs('');
          return;
      }

      const num = parseFloat(value);
      if (isNaN(num)) return;

      if (type === 'USD') {
          setCalcUsd(value);
          setCalcBs((num * rate.usdToBs).toFixed(2));
      } else {
          setCalcBs(value);
          setCalcUsd((num / rate.usdToBs).toFixed(2));
      }
  };

  const renderView = () => {
    switch (currentView) {
      case ViewState.RESUMEN: return <Dashboard onChangeView={setCurrentView} />;
      case ViewState.POS: return <POS rate={rate} />;
      case ViewState.ACCESO_LOGS: return <AccessControl />;
      case ViewState.MEMBRESIA: return <Clients />;
      case ViewState.AGENDA: return <Agenda />;
      case ViewState.HOTEL: return <Hotel />;
      case ViewState.EQUIPO: return <Team />;
      case ViewState.INVENTARIO: return <Inventory />;
      case ViewState.DESCUENTOS: return <Discounts />; 
      case ViewState.FINANZAS: return <Finance />;
      default: return <Dashboard onChangeView={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans text-zinc-900 overflow-hidden selection:bg-brand selection:text-white">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative transition-all duration-300">
        <Header 
            rate={rate} 
            onMenuClick={() => setIsMobileMenuOpen(true)}
            onRateClick={() => setIsRateModalOpen(true)}
            onCalculatorClick={() => setIsCalculatorOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto bg-[#fafafa]">
          <div className="max-w-[1600px] mx-auto p-4 lg:p-14 animate-fade-in h-full">
            {renderView()}
          </div>
        </main>

        {/* Rate Update Modal (Restored to Simple Version) */}
        {isRateModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setIsRateModalOpen(false)}></div>
                <div className="relative bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-zoom-in overflow-hidden">
                    
                    {/* Header with Close */}
                    <div className="flex justify-between items-center mb-6">
                         <div>
                            <h3 className="font-light text-xl text-zinc-900">Tasa de Cambio</h3>
                            <p className="text-xs text-zinc-500">Configuración del valor BCV.</p>
                          </div>
                        <button onClick={() => setIsRateModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X className="w-5 h-5 text-zinc-400" /></button>
                    </div>

                    <div className="animate-fade-in">
                        {/* Auto Sync Section */}
                        <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <CloudDownload className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-blue-900">Sincronización Automática</h4>
                                    <p className="text-[10px] text-blue-700/70 leading-relaxed mt-1">
                                        Obtener tasa oficial del BCV en tiempo real.
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={handleAutoSync}
                                disabled={isSyncing}
                                className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isSyncing ? (
                                    <>
                                    <RefreshCw className="w-3 h-3 animate-spin" /> Consultando...
                                    </>
                                ) : (
                                    <>Consultar Ahora</>
                                )}
                            </button>
                        </div>

                        <div className="relative flex items-center justify-center mb-6">
                            <div className="h-px bg-zinc-100 w-full"></div>
                            <span className="absolute bg-white px-2 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">O Manual</span>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold uppercase text-zinc-400 mb-2 tracking-wider">Valor Personalizado (Bs/USD)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={newRate}
                                    onChange={(e) => setNewRate(e.target.value)}
                                    className="w-full pl-4 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-lg font-bold text-zinc-900 focus:border-zinc-900 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={handleUpdateRate}
                            className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand transition-colors flex items-center justify-center gap-2"
                        >
                            Guardar Cambios <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Dedicated Calculator Modal */}
        {isCalculatorOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setIsCalculatorOpen(false)}></div>
                <div className="relative bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-zoom-in overflow-hidden">
                    
                    <div className="flex justify-between items-center mb-6">
                         <div>
                            <h3 className="font-light text-xl text-zinc-900">Calculadora</h3>
                            <p className="text-xs text-zinc-500">Conversión rápida de divisas.</p>
                          </div>
                        <button onClick={() => setIsCalculatorOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X className="w-5 h-5 text-zinc-400" /></button>
                    </div>

                    <div className="animate-fade-in space-y-4">
                        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 flex justify-between items-center mb-2">
                            <span className="text-xs font-medium text-zinc-500">Tasa Actual</span>
                            <span className="text-lg font-bold text-zinc-900">{rate.usdToBs.toFixed(2)} Bs/$</span>
                        </div>

                        {/* USD Input */}
                        <div className="relative">
                            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1 ml-1">Dólares (USD)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={calcUsd}
                                    onChange={(e) => handleCalcChange('USD', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-4 pr-12 py-4 bg-white border border-zinc-200 rounded-2xl text-2xl font-bold text-zinc-900 focus:border-brand outline-none transition-all"
                                    autoFocus
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">$</span>
                            </div>
                        </div>

                        <div className="flex justify-center -my-2 relative z-10">
                            <div className="bg-zinc-100 p-2 rounded-full border border-white shadow-sm">
                                <ArrowLeftRight className="w-4 h-4 text-zinc-400 transform rotate-90" />
                            </div>
                        </div>

                        {/* BS Input */}
                        <div className="relative">
                            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1 ml-1">Bolívares (VES)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={calcBs}
                                    onChange={(e) => handleCalcChange('BS', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-4 pr-12 py-4 bg-white border border-zinc-200 rounded-2xl text-2xl font-bold text-zinc-900 focus:border-brand outline-none transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">Bs</span>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                onClick={() => { setCalcUsd(''); setCalcBs(''); }}
                                className="w-full py-3 bg-zinc-100 text-zinc-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;
