import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, writeBatch, doc, serverTimestamp, getDoc, updateDoc, increment } from 'firebase/firestore';
import { validateAuth, checkRateLimit } from '@/lib/api-middleware';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip, 5, 60000)) { // 5 requisições por minuto
      return NextResponse.json({ 
        error: 'Muitas requisições. Por favor, aguarde um momento.' 
      }, { status: 429 });
    }

    const body = await req.json();
    const { userId, checkoutData, cartItems, isVerificationEnabled, subtotal, total, useWallet } = body;
    
    if (!userId || !cartItems || !checkoutData) {
      return NextResponse.json({ error: 'Dados insuficientes.' }, { status: 400 });
    }

    // Validação de autenticação
    const authResult = await validateAuth(req, userId);
    if (!authResult.valid) {
      return authResult.error!;
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
    // Determinar total e aplicação de carteira (simulação)
    let orderTotal: number = Number(total) || 0;
    let walletApplied = 0;

    if (useWallet) {
      const buyerRef = doc(db, 'users', userId);
      const buyerSnap = await getDoc(buyerRef);
      if (buyerSnap.exists()) {
        const buyer = buyerSnap.data() as any;
        const available = (buyer.wallet?.available ?? buyer.walletBalance ?? 0) as number;
        walletApplied = Math.min(available, orderTotal);
        orderTotal = Math.max(0, orderTotal - walletApplied);
      }
    }

    // Simular criação de PaymentIntent Stripe para o restante (se existir)
    const paymentSuccess = true; // Simulação
    if (!paymentSuccess) {
      return NextResponse.json({ error: 'Falha no pagamento.' }, { status: 402 });
    }

    // Executar batch Firestore
    const batch = writeBatch(db);
    const timestamp = serverTimestamp();

    // 0) Se usou carteira, registar transação do comprador e debitar saldo disponível
    if (walletApplied > 0) {
      const buyerRef = doc(db, 'users', userId);
      // Debitar carteira disponível (campo novo wallet.available; cair para walletBalance se não existir)
      // Ambos os campos são mantidos para retrocompatibilidade
      batch.set(doc(collection(db, 'wallet_transactions')), {
        userId,
        type: 'compra',
        amount: -walletApplied,
        description: 'Compra usando saldo da carteira',
        createdAt: timestamp,
        status: 'confirmado',
      });
      // Atualização em profundidade
      // Nota: Firestore aceita paths com ponto para nested fields
      batch.update(buyerRef, {
        'wallet.available': increment(-walletApplied),
      });
      // Se a app antiga usar walletBalance, manter em sincronia
      batch.update(buyerRef, { walletBalance: increment(-walletApplied) });
    }
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

      // 5. Carteira do vendedor: creditar PENDENTE pelo valor do item (simulação sem taxas)
      const sellerRef = doc(db, 'users', item.product.userId);
      const lineTotal = Number(item.product.price) * Number(item.quantity);
      batch.update(sellerRef, { 'wallet.pending': increment(lineTotal) });
      batch.set(doc(collection(db, 'wallet_transactions')), {
        userId: item.product.userId,
        type: 'venda',
        amount: lineTotal,
        description: `Venda pendente: ${item.product.name}`,
        createdAt: timestamp,
        status: 'pendente',
        relatedProductId: item.product.id,
      });
    }
    await batch.commit();
    return NextResponse.json({ success: true, walletApplied, charged: orderTotal });
  } catch (error) {
    return NextResponse.json({ error: 'Erro no checkout.' }, { status: 500 });
  }
}
