import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, writeBatch, doc, serverTimestamp, getDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, checkoutData, cartItems, isVerificationEnabled, subtotal, total } = body;
    if (!userId || !cartItems || !checkoutData) {
      return NextResponse.json({ error: 'Dados insuficientes.' }, { status: 400 });
    }

    // Simular validação de stock e pagamento
    for (const item of cartItems) {
      const productRef = doc(db, 'products', item.product.id);
      const productSnap = await getDoc(productRef);
      if (!productSnap.exists()) {
        return NextResponse.json({ error: `Produto não encontrado: ${item.product.name}` }, { status: 404 });
      }
      const productData = productSnap.data();
      if (productData.quantity < item.quantity) {
        return NextResponse.json({ error: `Stock insuficiente para: ${item.product.name}` }, { status: 400 });
      }
    }
    // Simular criação de PaymentIntent Stripe
    const paymentSuccess = true; // Simulação
    if (!paymentSuccess) {
      return NextResponse.json({ error: 'Falha no pagamento.' }, { status: 402 });
    }

    // Executar batch Firestore
    const batch = writeBatch(db);
    const timestamp = serverTimestamp();
    for (const item of cartItems) {
      const productRef = doc(db, 'products', item.product.id);
      // 1. Compra
      const purchaseRef = doc(collection(db, 'purchases'));
      batch.set(purchaseRef, {
        buyerId: userId,
        buyerName: checkoutData.firstName + ' ' + checkoutData.lastName,
        sellerId: item.product.userId,
        sellerName: item.product.userName,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        isVerified: isVerificationEnabled,
        date: timestamp,
      });
      // 2. Venda
      const saleRef = doc(collection(db, 'sales'));
      batch.set(saleRef, {
        buyerId: userId,
        buyerName: checkoutData.firstName + ' ' + checkoutData.lastName,
        sellerId: item.product.userId,
        sellerName: item.product.userName,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        isVerified: isVerificationEnabled,
        date: timestamp,
      });
      // 3. Atualizar produto
      if (item.product.quantity === item.quantity) {
        batch.update(productRef, { status: 'vendido', quantity: 0 });
      } else {
        batch.update(productRef, { quantity: item.product.quantity - item.quantity });
      }
      // 4. Notificação se verificação ativa
      if (isVerificationEnabled) {
        const notificationRef = doc(collection(db, 'notifications'));
        batch.set(notificationRef, {
          userId: item.product.userId,
          message: `O artigo "${item.product.name}" foi vendido com verificação ativada. Verifique os detalhes.`,
          link: `/dashboard`,
          read: false,
          createdAt: timestamp,
        });
      }
    }
    await batch.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro no checkout.' }, { status: 500 });
  }
}
