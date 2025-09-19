'use client';

import React, { useState } from 'react';
import { Coins, Star, Check, CreditCard, Loader2, Gift, Zap } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { useAuthContext } from '@/contexts/AuthContext';

interface CreditStoreProps {
  className?: string;
  onClose?: () => void;
}

const CreditStore: React.FC<CreditStoreProps> = ({ className = '', onClose }) => {
  const { user } = useAuthContext();
  const { credits, purchasing, purchaseCredits, getAvailablePackages } = useCredits();

  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  const packages = getAvailablePackages();

  const handlePurchase = async (packageId: string) => {
    if (!user) return;

    setPaymentLoading(packageId);

    try {
      const result = await purchaseCredits(packageId);
      
      if (result.success && result.paymentUrl) {
        // Abrir MercadoPago en nueva ventana
        window.open(result.paymentUrl, '_blank', 'width=800,height=600');
        
        // Opcional: cerrar el modal después de un tiempo
        setTimeout(() => {
          setPaymentLoading(null);
          if (onClose) onClose();
        }, 2000);
      } else {
        alert(result.error || 'Error procesando el pago');
        setPaymentLoading(null);
      }
    } catch (error) {
      console.error('Error en compra:', error);
      alert('Error procesando el pago');
      setPaymentLoading(null);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const getPackageIcon = (packageId: string) => {
    switch (packageId) {
      case 'basic':
        return <Coins className="w-8 h-8" />;
      case 'popular':
        return <Star className="w-8 h-8" />;
      case 'premium':
        return <Gift className="w-8 h-8" />;
      case 'mega':
        return <Zap className="w-8 h-8" />;
      default:
        return <Coins className="w-8 h-8" />;
    }
  };

  const getPackageColor = (packageId: string) => {
    switch (packageId) {
      case 'basic':
        return 'from-blue-500 to-blue-600';
      case 'popular':
        return 'from-pink-500 to-pink-600';
      case 'premium':
        return 'from-purple-500 to-purple-600';
      case 'mega':
        return 'from-yellow-500 to-yellow-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Coins className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tienda de Créditos</h2>
              <p className="text-sm text-gray-600">
                {credits ? `Balance actual: ${credits.balance} créditos` : 'Cargando balance...'}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Información sobre créditos */}
      <div className="p-6 bg-gradient-to-r from-pink-50 to-purple-50">
        <h3 className="font-semibold text-gray-900 mb-2">¿Para qué sirven los créditos?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Enviar mensajes ilimitados</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Ver quién te dio like</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Filtros avanzados de búsqueda</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Destacar tu perfil</span>
          </div>
        </div>
      </div>

      {/* Paquetes de créditos */}
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Elige tu paquete</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative border-2 rounded-xl p-4 transition-all cursor-pointer hover:shadow-lg ${
                pkg.popular
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-pink-300'
              }`}
              onClick={() => !paymentLoading && handlePurchase(pkg.id)}
              onKeyDown={(e) => e.key === 'Enter' && !paymentLoading && handlePurchase(pkg.id)}
              role="button"
              tabIndex={0}
            >
              {/* Badge popular */}
              {pkg.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MÁS POPULAR
                  </span>
                </div>
              )}

              {/* Icono del paquete */}
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r ${getPackageColor(pkg.id)} flex items-center justify-center text-white`}>
                {getPackageIcon(pkg.id)}
              </div>

              {/* Información del paquete */}
              <div className="text-center">
                <h4 className="font-bold text-gray-900 mb-1">{pkg.name}</h4>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {pkg.credits}
                  {pkg.bonus && (
                    <span className="text-sm text-green-600 font-normal"> +{pkg.bonus}</span>
                  )}
                </div>
                <div className="text-xs text-gray-600 mb-2">créditos</div>
                
                {pkg.description && (
                  <p className="text-xs text-gray-600 mb-3">{pkg.description}</p>
                )}

                <div className="text-lg font-bold text-pink-600 mb-3">
                  {formatPrice(pkg.price, pkg.currency)}
                </div>

                {/* Botón de compra */}
                <button
                  disabled={paymentLoading === pkg.id || purchasing}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                    paymentLoading === pkg.id
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : pkg.popular
                      ? 'bg-pink-500 hover:bg-pink-600 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {paymentLoading === pkg.id ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Comprar</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Métodos de pago */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <span>Pagos seguros con:</span>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
              MP
            </div>
            <span className="font-medium">MercadoPago</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          Aceptamos tarjetas de crédito, débito y transferencias bancarias
        </p>
      </div>
    </div>
  );
};

export default CreditStore;