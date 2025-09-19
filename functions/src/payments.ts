import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { logger } from 'firebase-functions';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

// Configuración de MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

const payment = new Payment(client);
const preference = new Preference(client);

const db = getFirestore();
const auth = getAuth();

// Paquetes de créditos disponibles
const CREDIT_PACKAGES = {
  basic: { credits: 10, price: 99, currency: 'ARS', name: 'Básico' },
  popular: { credits: 25, price: 199, currency: 'ARS', name: 'Popular', bonus: 5 },
  premium: { credits: 50, price: 349, currency: 'ARS', name: 'Premium', bonus: 15 },
  mega: { credits: 100, price: 599, currency: 'ARS', name: 'Mega Pack', bonus: 35 }
};

// Crear preferencia de pago en MercadoPago
export const createMercadoPagoPayment = onCall(
  { cors: true },
  async (request) => {
    try {
      // Verificar autenticación
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Usuario no autenticado');
      }

      const { packageId, userId, userEmail } = request.data;

      // Validar datos
      if (!packageId || !userId || !userEmail) {
        throw new HttpsError('invalid-argument', 'Datos faltantes');
      }

      // Verificar que el usuario autenticado coincida
      if (request.auth.uid !== userId) {
        throw new HttpsError('permission-denied', 'No autorizado');
      }

      // Obtener paquete
      const creditPackage = CREDIT_PACKAGES[packageId as keyof typeof CREDIT_PACKAGES];
      if (!creditPackage) {
        throw new HttpsError('invalid-argument', 'Paquete no válido');
      }

      // Obtener datos del usuario
      const userRecord = await auth.getUser(userId);
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();

      // Crear preferencia de pago
      const preferenceData = {
        items: [
          {
            id: packageId,
            title: `${creditPackage.name} - ${creditPackage.credits}${creditPackage.bonus ? ` +${creditPackage.bonus}` : ''} créditos`,
            description: `Paquete de créditos para la app`,
            quantity: 1,
            unit_price: creditPackage.price,
            currency_id: creditPackage.currency
          }
        ],
        payer: {
          email: userEmail,
          name: userData?.displayName || userRecord.displayName || 'Usuario',
          identification: {
            type: 'DNI',
            number: '12345678' // En producción, obtener del perfil del usuario
          }
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/payment/success`,
          failure: `${process.env.FRONTEND_URL}/payment/failure`,
          pending: `${process.env.FRONTEND_URL}/payment/pending`
        },
        auto_return: 'approved',
        notification_url: `${process.env.FUNCTIONS_URL}/mercadoPagoWebhook`,
        external_reference: `${userId}_${packageId}_${Date.now()}`,
        statement_descriptor: 'DATING_APP_CREDITS',
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      };

      const result = await preference.create({ body: preferenceData });

      if (result.id) {
        // Guardar referencia del pago
        await db.collection('payments').doc(result.id).set({
          userId,
          packageId,
          preferenceId: result.id,
          amount: creditPackage.price,
          currency: creditPackage.currency,
          credits: creditPackage.credits + (creditPackage.bonus || 0),
          status: 'pending',
          createdAt: FieldValue.serverTimestamp(),
          externalReference: preferenceData.external_reference
        });

        return {
          success: true,
          paymentId: result.id,
          paymentUrl: result.init_point
        };
      } else {
        throw new HttpsError('internal', 'Error creando preferencia de pago');
      }
    } catch (error) {
      logger.error('Error creando pago MercadoPago:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Error interno del servidor');
    }
  }
);

// Webhook de MercadoPago
export const mercadoPagoWebhook = onCall(
  { cors: true },
  async (request) => {
    try {
      const { type, data } = request.data;

      logger.info('Webhook MercadoPago recibido:', { type, data });

      if (type === 'payment') {
        const paymentId = data.id;
        
        // Obtener información del pago
        const paymentInfo = await payment.get({ id: paymentId });
        
        if (paymentInfo) {
          const externalReference = paymentInfo.external_reference;
          const status = paymentInfo.status;
          
          // Buscar el pago en nuestra base de datos
          const paymentsQuery = await db.collection('payments')
            .where('externalReference', '==', externalReference)
            .limit(1)
            .get();
          
          if (!paymentsQuery.empty) {
            const paymentDoc = paymentsQuery.docs[0];
            const paymentData = paymentDoc.data();
            
            // Actualizar estado del pago
            await paymentDoc.ref.update({
              status: status,
              mercadoPagoPaymentId: paymentId,
              updatedAt: FieldValue.serverTimestamp(),
              paymentDetails: paymentInfo
            });
            
            // Si el pago fue aprobado, agregar créditos
            if (status === 'approved') {
              await processApprovedPayment(paymentData.userId, paymentData.credits, paymentDoc.id);
            }
          }
        }
      }
      
      return { success: true };
    } catch (error) {
      logger.error('Error procesando webhook:', error);
      throw new HttpsError('internal', 'Error procesando webhook');
    }
  }
);

// Verificar estado de pago
export const checkMercadoPagoPayment = onCall(
  { cors: true },
  async (request) => {
    try {
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Usuario no autenticado');
      }

      const { paymentId } = request.data;
      
      if (!paymentId) {
        throw new HttpsError('invalid-argument', 'ID de pago requerido');
      }

      // Buscar el pago en nuestra base de datos
      const paymentDoc = await db.collection('payments').doc(paymentId).get();
      
      if (!paymentDoc.exists) {
        throw new HttpsError('not-found', 'Pago no encontrado');
      }
      
      const paymentData = paymentDoc.data()!;
      
      // Verificar que el usuario sea el propietario del pago
      if (paymentData.userId !== request.auth.uid) {
        throw new HttpsError('permission-denied', 'No autorizado');
      }
      
      return {
        success: true,
        status: paymentData.status,
        credits: paymentData.credits
      };
    } catch (error) {
      logger.error('Error verificando pago:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Error interno del servidor');
    }
  }
);

// Procesar pago aprobado
async function processApprovedPayment(userId: string, credits: number, paymentId: string) {
  try {
    const batch = db.batch();
    
    // Actualizar créditos del usuario
    const creditsRef = db.collection('credits').doc(userId);
    const creditsDoc = await creditsRef.get();
    
    if (creditsDoc.exists) {
      const currentData = creditsDoc.data()!;
      batch.update(creditsRef, {
        balance: (currentData.balance || 0) + credits,
        totalPurchased: (currentData.totalPurchased || 0) + credits,
        lastUpdated: FieldValue.serverTimestamp()
      });
    } else {
      batch.set(creditsRef, {
        balance: credits,
        totalPurchased: credits,
        totalSpent: 0,
        lastUpdated: FieldValue.serverTimestamp()
      });
    }
    
    // Crear transacción de créditos
    const transactionRef = db.collection('creditTransactions').doc();
    batch.set(transactionRef, {
      userId,
      type: 'purchase',
      amount: credits,
      description: `Compra de ${credits} créditos`,
      timestamp: FieldValue.serverTimestamp(),
      paymentId,
      status: 'completed'
    });
    
    await batch.commit();
    
    logger.info(`Créditos agregados exitosamente: ${credits} para usuario ${userId}`);
  } catch (error) {
    logger.error('Error procesando pago aprobado:', error);
    throw error;
  }
}

// Trigger cuando se crea una nueva transacción de créditos
export const onCreditTransactionCreated = onDocumentCreated(
  'creditTransactions/{transactionId}',
  async (event) => {
    const transaction = event.data?.data();
    
    if (!transaction) return;
    
    // Enviar notificación al usuario sobre la transacción
    if (transaction.type === 'purchase' && transaction.status === 'completed') {
      // Aquí puedes agregar lógica para enviar notificaciones push
      logger.info(`Transacción completada para usuario ${transaction.userId}: ${transaction.amount} créditos`);
    }
  }
);