
import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, ArrowRight, ShoppingBag, ChevronDown, X, Ticket, Percent, DollarSign, Tag, AlertCircle, Banknote, Landmark, Smartphone, Hash, Radio, Loader2, CheckCircle, ArrowLeft, Send, Copy, CreditCard, ShieldAlert, Check } from 'lucide-react';
import { Product, CartItem, ExchangeRate, Discount } from '../types';
import { MOCK_PRODUCTS, MOCK_DISCOUNTS } from '../constants';

interface POSProps {
  rate: ExchangeRate;
}

const POS: React.FC<POSProps> = ({ rate }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  
  // Payment Logic States
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'PAGO_MOVIL'>('CASH');
  const [checkoutStage, setCheckoutStage] = useState<'CART' | 'VERIFY_PM' | 'SUCCESS'>('CART');
  
  // Pago Movil Verification States
  const [pmMode, setPmMode] = useState<'REF' | 'C2P' | 'MANUAL'>('REF');
  const [pmReference, setPmReference] = useState('');
  const [manualNote, setManualNote] = useState('');
  
  // C2P Data
  const [c2pPrefix, setC2pPrefix] = useState<'V' | 'E' | 'J' | 'G'>('V');
  const [c2pData, setC2pData] = useState({ phone: '', id: '' });
  const [isPrefixOpen, setIsPrefixOpen] = useState(false); // State for custom dropdown
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [showManualWarning, setShowManualWarning] = useState(false);

  // Service Configuration Modal State
  const [selectedService, setSelectedService] = useState<Product | null>(null);
  const [serviceQuantity, setServiceQuantity] = useState(1);

  // Discount State
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [activeDiscount, setActiveDiscount] = useState<{ type: 'MANUAL' | 'PRESET', data: any } | null>(null);
  const [manualDiscountType, setManualDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [manualDiscountValue, setManualDiscountValue] = useState<string>(''); 
  const [discountTab, setDiscountTab] = useState<'PRESET' | 'MANUAL'>('PRESET');

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.priceUsd * item.quantity), 0);
  
  const discountAmount = useMemo(() => {
    if (!activeDiscount) return 0;

    // 1. Manual Calculation
    if (activeDiscount.type === 'MANUAL') {
        const val = parseFloat(activeDiscount.data.value) || 0;
        if (val === 0) return 0;
        if (activeDiscount.data.subType === 'FIXED') return Math.min(val, subtotal);
        if (activeDiscount.data.subType === 'PERCENTAGE') return subtotal * (Math.min(val, 100) / 100);
        return 0;
    }

    // 2. Preset Logic
    if (activeDiscount.type === 'PRESET') {
        const d = activeDiscount.data as Discount;
        if (d.minPurchase && subtotal < d.minPurchase) return 0;

        let eligibleAmount = 0;
        if (d.target === 'TOTAL') {
            eligibleAmount = subtotal;
        } else if (d.target === 'CATEGORY') {
            eligibleAmount = cart.filter(item => item.category === d.targetValue)
                                 .reduce((sum, item) => sum + (item.priceUsd * item.quantity), 0);
        } else if (d.target === 'PRODUCT') {
            eligibleAmount = cart.filter(item => item.id === d.targetValue)
                                 .reduce((sum, item) => sum + (item.priceUsd * item.quantity), 0);
        }

        if (eligibleAmount === 0) return 0;

        let calculated = 0;
        if (d.type === 'FIXED') {
            calculated = d.value;
            calculated = Math.min(calculated, eligibleAmount);
        } else {
            calculated = eligibleAmount * (d.value / 100);
            if (d.maxDiscount) calculated = Math.min(calculated, d.maxDiscount);
        }

        return calculated;
    }

    return 0;
  }, [activeDiscount, subtotal, cart]);

  const totalUsd = Math.max(0, subtotal - discountAmount);
  const totalBs = totalUsd * rate.usdToBs;

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => {
      const matchesCategory = categoryFilter === 'TODOS' || 
                              (categoryFilter === 'SERVICIOS' ? p.category === 'ACCESO' : p.category === categoryFilter);
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, searchQuery]);

  // --- Handlers ---

  const handleProductClick = (product: Product) => {
      if (product.category === 'ACCESO') {
          setSelectedService(product);
          setServiceQuantity(1); 
      } else {
          addToCart(product, 1);
      }
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity: quantity }];
    });
  };

  const confirmServiceAdd = () => {
      if (selectedService) {
          addToCart(selectedService, serviceQuantity);
          setSelectedService(null);
      }
  }

  const applyManualDiscount = () => {
      setActiveDiscount({
          type: 'MANUAL',
          data: { subType: manualDiscountType, value: manualDiscountValue }
      });
      setShowDiscountModal(false);
  }

  const applyPresetDiscount = (discount: Discount) => {
      setActiveDiscount({
          type: 'PRESET',
          data: discount
      });
      setShowDiscountModal(false);
  }

  const removeDiscount = () => {
      setActiveDiscount(null);
      setManualDiscountValue('');
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    if (cart.length <= 1) setIsMobileCartOpen(false); 
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  // --- CHECKOUT LOGIC ---

  const handleInitialCheckout = () => {
      // Both PAGO_MOVIL and TRANSFER require electronic verification
      if (paymentMethod === 'PAGO_MOVIL' || paymentMethod === 'TRANSFER') {
          setPmMode('REF'); // Default to Reference for transfers
          setCheckoutStage('VERIFY_PM');
      } else {
          // Cash flow
          completeTransaction();
      }
  };

  const verifyPayment = () => {
      if (pmMode === 'MANUAL') {
          setShowManualWarning(true);
          return;
      }

      if (pmMode === 'REF' && pmReference.length < 6) return; 
      if (pmMode === 'C2P' && (!c2pData.id || !c2pData.phone)) return;

      setIsVerifying(true);
      
      // Simulate Bank API Latency
      setTimeout(() => {
          setIsVerifying(false);
          completeTransaction();
      }, 2000);
  };

  const confirmManualPayment = () => {
      setShowManualWarning(false);
      completeTransaction();
  };

  const completeTransaction = () => {
      setCheckoutStage('SUCCESS');
      // Reset after delay
      setTimeout(() => {
          setCart([]);
          setCheckoutStage('CART');
          setPmReference('');
          setManualNote('');
          setC2pData({ phone: '', id: '' });
          setActiveDiscount(null);
          setIsMobileCartOpen(false);
      }, 3000);
  };

  const isDiscountApplicable = (d: Discount) => {
      if (!d.isActive) return false;
      if (d.minPurchase && subtotal < d.minPurchase) return false;
      if (d.target === 'TOTAL') return true;
      if (d.target === 'CATEGORY') return cart.some(i => i.category === d.targetValue);
      if (d.target === 'PRODUCT') return cart.some(i => i.id === d.targetValue);
      return false;
  };

  const categories = ['TODOS', 'SERVICIOS', 'SUPLEMENTOS', 'BEBIDAS', 'ALIMENTOS', 'EQUIPO'];

  return (
    <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-10rem)] pb-0 lg:pb-4 animate-fade-in relative flex flex-col">
        
        {/* Main Unified Container */}
        <div className="flex-1 flex flex-col lg:flex-row bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm relative z-0">
            
            {/* LEFT: Product Catalog */}
            <div className="flex-1 flex flex-col min-w-0 h-full">
                {/* ... (Catalog Content same as before) ... */}
                <div className="p-4 border-b border-zinc-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-white z-10 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input 
                            type="text"
                            placeholder="Buscar producto..."
                            className="w-full pl-9 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:border-zinc-400 focus:outline-none transition-all placeholder:text-zinc-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
                        {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`whitespace-nowrap px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold transition-all rounded-lg border
                            ${categoryFilter === cat 
                                ? 'bg-zinc-900 text-white border-zinc-900' 
                                : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}`}
                        >
                            {cat}
                        </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-zinc-50/50 pb-24 lg:pb-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                        {filteredProducts.map(product => (
                        <button
                            key={product.id}
                            onClick={() => handleProductClick(product)}
                            className="bg-white border border-zinc-200 hover:border-brand/50 rounded-xl overflow-hidden transition-all duration-200 text-left group flex flex-col shadow-sm hover:shadow-md h-full active:scale-95"
                        >
                            <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                                {product.category === 'ACCESO' && (
                                    <div className="absolute top-2 right-2 bg-zinc-900/80 backdrop-blur-sm text-white p-1.5 rounded-lg">
                                        <Ticket className="w-3 h-3" />
                                    </div>
                                )}
                            </div>
                            <div className="p-3 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold truncate pr-2 max-w-[70%]">{product.category}</span>
                                    <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded">${product.priceUsd}</span>
                                </div>
                                <h4 className="font-medium text-sm text-zinc-800 leading-snug line-clamp-2 mb-2">{product.name}</h4>
                            </div>
                        </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: Dynamic Cart & Checkout Panel */}
            <div className={`
                fixed inset-x-0 bottom-0 z-50 bg-white shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] transform transition-transform duration-300 ease-out flex flex-col h-[85vh]
                lg:static lg:transform-none lg:w-96 lg:h-full lg:shadow-none lg:border-l lg:border-zinc-200 lg:z-auto
                ${isMobileCartOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
            `}>
                
                {/* ----------------- STAGE: SUCCESS ----------------- */}
                {checkoutStage === 'SUCCESS' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-zoom-in text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 animate-pulse">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-900 mb-2">¡Pago Exitoso!</h2>
                        <p className="text-sm text-zinc-500 mb-6">La transacción ha sido registrada.</p>
                        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 w-full mb-6">
                             <div className="flex justify-between text-sm mb-1">
                                 <span className="text-zinc-500">Total Pagado</span>
                                 <span className="font-bold text-zinc-900">${totalUsd.toFixed(2)}</span>
                             </div>
                             <div className="flex justify-between text-xs text-zinc-400">
                                 <span>Método</span>
                                 <span>{pmMode === 'MANUAL' && paymentMethod === 'PAGO_MOVIL' ? 'MANUAL' : paymentMethod.replace('_', ' ')}</span>
                             </div>
                        </div>
                    </div>
                )}


                {/* ----------------- STAGE: VERIFICATION (ELECTRONIC PAYMENTS) ----------------- */}
                {checkoutStage === 'VERIFY_PM' && (
                    <div className="flex flex-col h-full animate-fade-in relative">
                        {/* Header */}
                        <div className="p-5 border-b border-zinc-100 flex items-center gap-3">
                            <button onClick={() => setCheckoutStage('CART')} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="font-bold text-zinc-900 text-sm">
                                    {paymentMethod === 'TRANSFER' ? 'Verificar Transferencia' : 'Verificar Pago Móvil'}
                                </h2>
                                <p className="text-xs text-zinc-400">Total a cobrar: <span className="text-zinc-900 font-bold">Bs {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span></p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                            
                            {/* Toggle Switch */}
                            <div className="bg-zinc-100 p-1 rounded-xl flex">
                                <button 
                                    onClick={() => setPmMode('REF')}
                                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${pmMode === 'REF' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                                >
                                    Referencia
                                </button>
                                {/* Only show C2P for Pago Movil, not Transfers */}
                                {paymentMethod === 'PAGO_MOVIL' && (
                                    <button 
                                        onClick={() => setPmMode('C2P')}
                                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${pmMode === 'C2P' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                                    >
                                        C2P
                                    </button>
                                )}
                                <button 
                                    onClick={() => setPmMode('MANUAL')}
                                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${pmMode === 'MANUAL' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                                >
                                    Manual
                                </button>
                            </div>

                            {/* MODE: REFERENCE */}
                            {pmMode === 'REF' && (
                                <div className="space-y-6 animate-fade-in">
                                    {/* Bank Details Card (Updated for both PM and Transfer) */}
                                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 relative overflow-hidden">
                                        <div className="flex items-start gap-4 relative z-10">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 shadow-sm">
                                                {paymentMethod === 'TRANSFER' ? <Landmark className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-zinc-900 mb-2">Ecoland Business</h4>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-zinc-500">Banco</span>
                                                        <span className="font-bold text-zinc-900">0105 - Mercantil</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-zinc-500">Cuenta</span>
                                                        <span className="font-bold text-zinc-900 truncate ml-2">0105-0000-00-1234567890</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-zinc-500">Teléfono</span>
                                                        <span className="font-bold text-zinc-900">0414-123-4567</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-zinc-500">RIF / Doc</span>
                                                        <span className="font-bold text-zinc-900">J-12345678-0</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-zinc-400 mb-2 tracking-wider">Número de Referencia</label>
                                        <div className="relative">
                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                            <input 
                                                type="text" 
                                                autoFocus
                                                placeholder="Ej. 0012345678"
                                                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none transition-all font-medium text-zinc-900"
                                                value={pmReference}
                                                onChange={(e) => setPmReference(e.target.value.replace(/\D/g, ''))}
                                            />
                                        </div>
                                        <p className="text-[10px] text-zinc-400 mt-2 ml-1">Ingrese el número de referencia completo del comprobante.</p>
                                    </div>
                                </div>
                            )}

                            {/* MODE: C2P (Only for Pago Movil) */}
                            {pmMode === 'C2P' && paymentMethod === 'PAGO_MOVIL' && (
                                <div className="space-y-5 animate-fade-in">
                                    {/* Clean Zinc Style Alert */}
                                    <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 shadow-sm flex-shrink-0">
                                            <Smartphone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-900 font-bold mb-1">Cobro Automático</p>
                                            <p className="text-[10px] text-zinc-500 leading-relaxed">El sistema enviará una solicitud de cobro directo al banco del cliente.</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-zinc-400 mb-2 tracking-wider">Documento de Identidad</label>
                                        <div className="flex gap-2">
                                            {/* CUSTOM DROPDOWN COMPONENT */}
                                            <div className="relative w-24">
                                                <button 
                                                    onClick={() => setIsPrefixOpen(!isPrefixOpen)}
                                                    className={`w-full px-3 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none font-bold text-center text-zinc-900 flex items-center justify-between transition-all ${isPrefixOpen ? 'border-zinc-400 ring-2 ring-zinc-100' : ''}`}
                                                >
                                                    <span className="ml-2">{c2pPrefix}</span>
                                                    <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${isPrefixOpen ? 'rotate-180' : ''}`} />
                                                </button>

                                                {isPrefixOpen && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={() => setIsPrefixOpen(false)} />
                                                        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-zinc-100 rounded-xl shadow-xl z-20 overflow-hidden flex flex-col p-1 animate-zoom-in">
                                                            {['V', 'E', 'J', 'G'].map(opt => (
                                                                <button 
                                                                    key={opt}
                                                                    onClick={() => { setC2pPrefix(opt as any); setIsPrefixOpen(false); }}
                                                                    className={`w-full py-2 text-xs font-bold rounded-lg transition-colors ${c2pPrefix === opt ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}
                                                                >
                                                                    {opt}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <input 
                                                type="text" 
                                                placeholder="12345678"
                                                className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none transition-all font-medium"
                                                value={c2pData.id}
                                                onChange={(e) => setC2pData({...c2pData, id: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-zinc-400 mb-2 tracking-wider">Teléfono afiliado</label>
                                        <input 
                                            type="tel" 
                                            placeholder="0414-000-0000"
                                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none transition-all"
                                            value={c2pData.phone}
                                            onChange={(e) => setC2pData({...c2pData, phone: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* MODE: MANUAL */}
                            {pmMode === 'MANUAL' && (
                                <div className="space-y-5 animate-fade-in">
                                    {/* Clean Zinc Style Alert with Accent Icon */}
                                    <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-orange-500 shadow-sm flex-shrink-0">
                                            <ShieldAlert className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-900 font-bold mb-1">Verificación Externa</p>
                                            <p className="text-[10px] text-zinc-500 leading-relaxed">
                                                Seleccione esta opción solo si ya confirmó la recepción del dinero en su cuenta bancaria.
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-zinc-400 mb-2 tracking-wider">Nota de Referencia (Opcional)</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Ej. Pago confirmado por WhatsApp..."
                                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-brand outline-none transition-all resize-none text-sm"
                                            value={manualNote}
                                            onChange={(e) => setManualNote(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-zinc-200 bg-white">
                             <button 
                                onClick={verifyPayment}
                                disabled={isVerifying || (pmMode === 'REF' && pmReference.length < 6) || (pmMode === 'C2P' && (!c2pData.id || !c2pData.phone))}
                                className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/10"
                            >
                                {isVerifying ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                                ) : pmMode === 'REF' ? (
                                    <>Validar Transacción <CheckCircle className="w-4 h-4" /></>
                                ) : pmMode === 'C2P' ? (
                                    <>Enviar Cobro C2P <Send className="w-4 h-4" /></>
                                ) : (
                                    <>Procesar Manualmente <CheckCircle className="w-4 h-4" /></>
                                )}
                            </button>
                        </div>

                        {/* MANUAL WARNING MODAL */}
                        {showManualWarning && (
                            <div className="absolute inset-0 bg-white z-20 flex flex-col animate-fade-in">
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6 text-orange-600 animate-pulse">
                                        <AlertCircle className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-900 mb-2">¿Confirmar Pago Manual?</h3>
                                    <p className="text-sm text-zinc-500 mb-8 max-w-xs leading-relaxed">
                                        Estás a punto de aprobar un pago sin verificación automática. Asegúrate de haber confirmado la recepción del dinero en la cuenta bancaria.
                                    </p>
                                    
                                    <div className="w-full space-y-3">
                                        <button 
                                            onClick={confirmManualPayment}
                                            className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand transition-all shadow-lg shadow-zinc-900/10"
                                        >
                                            Confirmar de todos modos
                                        </button>
                                        <button 
                                            onClick={() => setShowManualWarning(false)}
                                            className="w-full py-4 bg-white border border-zinc-200 text-zinc-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-50 transition-all"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}


                {/* ----------------- STAGE: CART (DEFAULT) ----------------- */}
                {checkoutStage === 'CART' && (
                    <>
                    {/* Mobile Header */}
                    <div className="lg:hidden w-full flex justify-between items-center p-5 border-b border-zinc-100 bg-white">
                        <h2 className="font-bold text-zinc-900 text-sm uppercase tracking-wide flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-brand" />
                            Resumen de Cuenta
                        </h2>
                        <button onClick={() => setIsMobileCartOpen(false)} className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors">
                            <ChevronDown className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-300 space-y-3 opacity-60">
                                <ShoppingBag className="w-10 h-10" strokeWidth={1} />
                                <p className="text-xs font-medium">Cuenta Vacía</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="flex gap-3 group animate-fade-in">
                                    <div className="flex flex-col items-center justify-center gap-1 bg-zinc-50 border border-zinc-100 rounded-lg w-8 py-1">
                                        <button onClick={() => updateQuantity(item.id, 1)} className="text-zinc-400 hover:text-zinc-900 active:text-brand"><Plus className="w-3 h-3" /></button>
                                        <span className="text-xs font-bold text-zinc-900">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, -1)} className="text-zinc-400 hover:text-zinc-900 active:text-red-500"><Minus className="w-3 h-3" /></button>
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-medium text-zinc-900 line-clamp-2 leading-tight">{item.name}</h4>
                                            <p className="text-sm font-bold text-zinc-900 ml-2">${(item.priceUsd * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-[10px] text-zinc-400">@ ${item.priceUsd.toFixed(2)} / un</p>
                                            <button onClick={() => removeFromCart(item.id)} className="text-zinc-300 hover:text-red-500 transition-colors lg:opacity-0 lg:group-hover:opacity-100">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer / Totals */}
                    <div className="bg-zinc-50 border-t border-zinc-200 p-6 space-y-4 pb-8 lg:pb-6">
                        
                        {/* Payment Method Selector */}
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Método de Pago</span>
                            <div className="grid grid-cols-3 gap-2">
                                <button 
                                    onClick={() => setPaymentMethod('CASH')}
                                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all gap-1 ${paymentMethod === 'CASH' ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm' : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300 hover:text-zinc-600'}`}
                                >
                                    <Banknote className="w-4 h-4" />
                                    <span className="text-[9px] font-bold uppercase tracking-wide">Dólares</span>
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('TRANSFER')}
                                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all gap-1 ${paymentMethod === 'TRANSFER' ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm' : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300 hover:text-zinc-600'}`}
                                >
                                    <Landmark className="w-4 h-4" />
                                    <span className="text-[9px] font-bold uppercase tracking-wide">Transf.</span>
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('PAGO_MOVIL')}
                                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all gap-1 ${paymentMethod === 'PAGO_MOVIL' ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm' : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300 hover:text-zinc-600'}`}
                                >
                                    <Smartphone className="w-4 h-4" />
                                    <span className="text-[9px] font-bold uppercase tracking-wide">P. Móvil</span>
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-zinc-200 my-1"></div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-zinc-500 text-xs">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            
                            {/* Discount Row */}
                            <div className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-500">Descuento</span>
                                    {activeDiscount && (
                                        <span className="bg-zinc-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                            {activeDiscount.type === 'PRESET' ? activeDiscount.data.name : 'MANUAL'}
                                        </span>
                                    )}
                                </div>
                                
                                {!activeDiscount ? (
                                    <button 
                                        onClick={() => setShowDiscountModal(true)}
                                        className="text-brand font-bold uppercase text-[10px] hover:underline flex items-center gap-1 disabled:opacity-50 disabled:no-underline disabled:text-zinc-400"
                                        disabled={cart.length === 0}
                                        title={cart.length === 0 ? "Agregue productos para aplicar descuento" : "Agregar Descuento"}
                                    >
                                        <Tag className="w-3 h-3" /> Agregar
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-500 font-medium">
                                        <span>- ${discountAmount.toFixed(2)}</span>
                                        <button onClick={removeDiscount} className="text-zinc-400 hover:text-zinc-900">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-zinc-200 my-1"></div>

                            {/* SWAPPED TOTALS DISPLAY: BS IS PRIMARY */}
                            <div className="flex justify-between text-zinc-900 font-bold text-xl items-end">
                                <span className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-1">Total a Pagar</span>
                                <span>Bs {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-xs text-zinc-400 font-mono pt-1">
                                <span>Ref. en Dólares</span>
                                <span>${totalUsd.toFixed(2)}</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleInitialCheckout}
                            disabled={cart.length === 0} 
                            className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/10 active:scale-[0.98]"
                        >
                            <span>Cobrar</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    </>
                )}
            </div>
        </div>

        {/* Service Config Modal */}
        {selectedService && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in">
                <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setSelectedService(null)}></div>
                <div className="relative bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-zoom-in overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-zinc-900 leading-tight pr-4">{selectedService.name}</h3>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Configurar Servicio</p>
                        </div>
                        <button onClick={() => setSelectedService(null)} className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors"><X className="w-6 h-6" /></button>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-zinc-50 p-6 rounded-2xl flex flex-col items-center justify-center border border-zinc-100">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Cantidad / Personas</span>
                            <div className="flex items-center gap-6">
                                <button onClick={() => setServiceQuantity(Math.max(1, serviceQuantity - 1))} className="w-12 h-12 rounded-full border-2 border-zinc-200 flex items-center justify-center text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 transition-all"><Minus className="w-5 h-5" /></button>
                                <span className="text-4xl font-light text-zinc-900 w-16 text-center tabular-nums">{serviceQuantity}</span>
                                <button onClick={() => setServiceQuantity(serviceQuantity + 1)} className="w-12 h-12 rounded-full border-2 border-zinc-200 flex items-center justify-center text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 transition-all"><Plus className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <div className="flex justify-between items-end border-t border-zinc-100 pt-4">
                            <div><p className="text-xs text-zinc-500 font-medium">Precio Unitario</p><p className="text-lg font-bold text-zinc-900">${selectedService.priceUsd.toFixed(2)}</p></div>
                            <div className="text-right"><p className="text-xs text-zinc-500 font-medium">Total</p><p className="text-2xl font-bold text-brand">${(selectedService.priceUsd * serviceQuantity).toFixed(2)}</p></div>
                        </div>
                        <button onClick={confirmServiceAdd} className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-brand transition-colors shadow-lg shadow-zinc-900/20 active:scale-[0.98]">Agregar al Ticket</button>
                    </div>
                </div>
            </div>
        )}

        {/* ADVANCED Discount Configuration Modal */}
        {showDiscountModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in">
                <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setShowDiscountModal(false)}></div>
                <div className="relative bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-zoom-in overflow-hidden flex flex-col max-h-[90vh]">
                    
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900 leading-tight">Aplicar Descuento</h3>
                            <p className="text-xs text-zinc-500 mt-1">Seleccione una promoción o ingrese manual</p>
                        </div>
                        <button onClick={() => setShowDiscountModal(false)} className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Top Tabs */}
                    <div className="flex border-b border-zinc-100 mb-4">
                        <button 
                            onClick={() => setDiscountTab('PRESET')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${discountTab === 'PRESET' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
                        >
                            Disponibles
                        </button>
                        <button 
                            onClick={() => setDiscountTab('MANUAL')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${discountTab === 'MANUAL' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
                        >
                            Manual
                        </button>
                    </div>

                    {/* TAB CONTENT: PRESETS */}
                    {discountTab === 'PRESET' && (
                        <div className="flex-1 overflow-y-auto min-h-[300px] space-y-3">
                            {MOCK_DISCOUNTS.filter(d => d.isActive).length === 0 && (
                                <div className="text-center py-10 text-zinc-400 text-xs">No hay promociones activas.</div>
                            )}
                            {MOCK_DISCOUNTS.filter(d => d.isActive).map(discount => {
                                const applicable = isDiscountApplicable(discount);
                                return (
                                    <button 
                                        key={discount.id}
                                        onClick={() => applicable && applyPresetDiscount(discount)}
                                        disabled={!applicable}
                                        className={`w-full text-left p-4 rounded-xl border flex justify-between items-center transition-all
                                            ${applicable 
                                                ? `bg-white border-zinc-200 hover:border-brand hover:shadow-md active:scale-[0.98]` 
                                                : 'bg-zinc-50 border-zinc-100 opacity-60 cursor-not-allowed'}`}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${discount.color}`}>
                                                    {discount.type === 'PERCENTAGE' ? `${discount.value}%` : `$${discount.value}`}
                                                </span>
                                                {discount.target === 'TOTAL' && <span className="text-[9px] text-zinc-400 uppercase">Total</span>}
                                                {discount.target !== 'TOTAL' && <span className="text-[9px] text-zinc-400 uppercase">Específico</span>}
                                            </div>
                                            <h4 className="font-bold text-sm text-zinc-900">{discount.name}</h4>
                                            {!applicable && (
                                                <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1">
                                                    <AlertCircle className="w-3 h-3" /> No cumple condiciones
                                                </span>
                                            )}
                                        </div>
                                        {applicable && <ArrowRight className="w-4 h-4 text-zinc-300" />}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* TAB CONTENT: MANUAL */}
                    {discountTab === 'MANUAL' && (
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                {/* Type Toggle */}
                                <div className="flex bg-zinc-100 p-1 rounded-xl mb-6">
                                    <button 
                                        onClick={() => setManualDiscountType('PERCENTAGE')} 
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${manualDiscountType === 'PERCENTAGE' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
                                    >
                                        <Percent className="w-3 h-3" /> Porcentaje
                                    </button>
                                    <button 
                                        onClick={() => setManualDiscountType('FIXED')}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${manualDiscountType === 'FIXED' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
                                    >
                                        <DollarSign className="w-3 h-3" /> Fijo ($)
                                    </button>
                                </div>

                                {/* Input Value */}
                                <div className="mb-6">
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            autoFocus
                                            placeholder="0"
                                            value={manualDiscountValue}
                                            onChange={(e) => setManualDiscountValue(e.target.value)}
                                            className="w-full py-4 text-center bg-zinc-50 border border-zinc-200 rounded-2xl text-3xl font-light text-zinc-900 focus:border-brand outline-none"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                                            {manualDiscountType === 'PERCENTAGE' ? '%' : '$'}
                                        </span>
                                    </div>
                                </div>

                                {/* Quick Presets (Only for Percentage) */}
                                {manualDiscountType === 'PERCENTAGE' && (
                                    <div className="grid grid-cols-3 gap-2 mb-6">
                                        {[10, 20, 50].map(val => (
                                            <button 
                                                key={val} 
                                                onClick={() => setManualDiscountValue(val.toString())}
                                                className="py-2 bg-white border border-zinc-200 rounded-lg text-xs font-bold hover:bg-zinc-50 hover:border-zinc-300"
                                            >
                                                {val}%
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={applyManualDiscount}
                                disabled={!manualDiscountValue}
                                className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Tag className="w-3 h-3" /> Aplicar Manual
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default POS;
