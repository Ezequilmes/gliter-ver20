'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { doc, onSnapshot, addDoc, collection, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  popular?: boolean;
  bonus?: number;
  description?: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'spend' | 'bonus' | 'refund';
  amount: number;
  description: string;
  timestamp: Date;
  paymentId?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface UserCredits {
  balance: number;
  totalPurchased: number;
  totalSpent: number;
  lastUpdated: Date;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  paymentUrl?: string;
  error?: string;
}

// Tipos para integraciones de pagos
type CreatePaymentParams = { packageId: string; userId: string; userEmail: string | null };
interface CreatePaymentResponse {
  success: boolean;
  paymentId?: string;
  paymentUrl?: string;
  error?: string;
}

interface CheckPaymentResponse {
  success: boolean;
  status?: 'approved' | 'pending' | 'rejected' | string;
  error?: string;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'basic',
    name: 'Básico',
    credits: 10,
    price: 99,
    currency: 'ARS',
    description: 'Perfecto para empezar'
  },
  {
    id: 'popular',
    name: 'Popular',
    credits: 25,
    price: 199,
    currency: 'ARS',
    popular: true,
    bonus: 5,
    description: 'El más elegido + 5 créditos bonus'
  },
  {
    id: 'premium',
    name: 'Premium',
    credits: 50,
    price: 349,
    currency: 'ARS',
    bonus: 15,
    description: 'Máximo valor + 15 créditos bonus'
  },
  {
    id: 'mega',
    name: 'Mega Pack',
    credits: 100,
    price: 599,
    currency: 'ARS',
    bonus: 35,
    description: 'Para usuarios VIP + 35 créditos bonus'
  }
];

export const useCredits = () => {
  const { user } = useAuthContext();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  // Escuchar cambios en los créditos del usuario
  useEffect(() => {
    if (!user) {
      setCredits(null);
      setTransactions([]);
      setLoading(false);
      return;
    }

    const unsubscribeCredits = onSnapshot(
      doc(db, 'credits', user.uid),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setCredits({
            balance: data.balance || 0,
            totalPurchased: data.totalPurchased || 0,
            totalSpent: data.totalSpent || 0,
            lastUpdated: data.lastUpdated?.toDate() || new Date()
          });
        } else {
          // Crear documento de créditos si no existe
          setCredits({
            balance: 0,
            totalPurchased: 0,
            totalSpent: 0,
            lastUpdated: new Date()
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error escuchando créditos:', error);
        setLoading(false);
      }
    );

    // Escuchar transacciones del usuario
    const unsubscribeTransactions = onSnapshot(
      collection(db, 'creditTransactions'),
      (snapshot) => {
        const userTransactions = snapshot.docs
          .filter(doc => doc.data().userId === user.uid)
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
          } as CreditTransaction))
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        setTransactions(userTransactions);
      },
      (error) => {
        console.error('Error escuchando transacciones:', error);
      }
    );

    return () => {
      unsubscribeCredits();
      unsubscribeTransactions();
    };
  }, [user]);

  // Comprar créditos
  const purchaseCredits = async (packageId: string): Promise<PaymentResult> => {
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const creditPackage = CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
    if (!creditPackage) {
      return { success: false, error: 'Paquete no encontrado' };
    }

    setPurchasing(true);

    try {
      // Crear preferencia de pago en MercadoPago
      const createPayment = httpsCallable<CreatePaymentParams, CreatePaymentResponse>(
        functions,
        'createMercadoPagoPayment'
      );
      const result = await createPayment({
        packageId,
        userId: user.uid,
        userEmail: user.email
      });

      const data = result.data;
      
      if (data.success) {
        // Registrar transacción pendiente
        await addDoc(collection(db, 'creditTransactions'), {
          userId: user.uid,
          type: 'purchase',
          amount: creditPackage.credits + (creditPackage.bonus || 0),
          description: `Compra de ${creditPackage.name}`,
          timestamp: serverTimestamp(),
          paymentId: data.paymentId,
          status: 'pending',
          packageId,
          price: creditPackage.price,
          currency: creditPackage.currency
        });

        return {
          success: true,
          paymentId: data.paymentId,
          paymentUrl: data.paymentUrl
        };
      } else {
        return { success: false, error: data.error || 'Error creando pago' };
      }
    } catch (error) {
      console.error('Error comprando créditos:', error);
      return { success: false, error: 'Error procesando pago' };
    } finally {
      setPurchasing(false);
    }
  };

  // Gastar créditos
  const spendCredits = async (amount: number, description: string): Promise<boolean> => {
    if (!user || !credits) {
      return false;
    }

    if (credits.balance < amount) {
      return false;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const creditsRef = doc(db, 'credits', user.uid);
        const creditsDoc = await transaction.get(creditsRef);
        
        if (!creditsDoc.exists()) {
          throw new Error('Documento de créditos no existe');
        }

        const currentBalance = creditsDoc.data().balance || 0;
        
        if (currentBalance < amount) {
          throw new Error('Saldo insuficiente');
        }

        // Actualizar balance
        transaction.update(creditsRef, {
          balance: currentBalance - amount,
          totalSpent: (creditsDoc.data().totalSpent || 0) + amount,
          lastUpdated: serverTimestamp()
        });

        // Registrar transacción
        const transactionRef = doc(collection(db, 'creditTransactions'));
        transaction.set(transactionRef, {
          userId: user.uid,
          type: 'spend',
          amount: -amount,
          description,
          timestamp: serverTimestamp(),
          status: 'completed'
        });
      });

      return true;
    } catch (error) {
      console.error('Error gastando créditos:', error);
      return false;
    }
  };

  // Verificar si el usuario tiene suficientes créditos
  const hasEnoughCredits = (amount: number): boolean => {
    return credits ? credits.balance >= amount : false;
  };

  // Obtener historial de transacciones
  const getTransactionHistory = (limit?: number): CreditTransaction[] => {
    return limit ? transactions.slice(0, limit) : transactions;
  };

  // Obtener paquetes disponibles
  const getAvailablePackages = (): CreditPackage[] => {
    return CREDIT_PACKAGES;
  };

  // Verificar estado de pago
  const checkPaymentStatus = async (paymentId: string): Promise<boolean> => {
    try {
      const checkPayment = httpsCallable<{ paymentId: string }, CheckPaymentResponse>(
        functions,
        'checkMercadoPagoPayment'
      );
      const result = await checkPayment({ paymentId });
      const data = result.data;
      
      return data.success && data.status === 'approved';
    } catch (error) {
      console.error('Error verificando pago:', error);
      return false;
    }
  };

  return {
    credits,
    transactions,
    loading,
    purchasing,
    purchaseCredits,
    spendCredits,
    hasEnoughCredits,
    getTransactionHistory,
    getAvailablePackages,
    checkPaymentStatus
  };
};

export default useCredits;