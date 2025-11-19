// ================================================================
// API ROUTE: /api/secure-checkout
// ================================================================
// Processa compras de forma segura com validação server-side
// - Valida preço contra documento do Firestore
// - Cria registos de sale + purchase atomicamente
// - Usa Firebase Admin SDK para bypass das security rules
// - Previne manipulação de preços no frontend
// ================================================================

import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// ================================================================
// FIREBASE ADMIN INITIALIZATION
// ================================================================

if (!getApps().length) {
  // Usa variáveis de ambiente para credenciais (NUNCA commit no código!)
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

const adminDb = getFirestore();
const adminAuth = getAuth();

// ================================================================
// TIPOS
// ================================================================

interface CheckoutRequest {
  productId: string;
  quantity: number;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: 'mbway' | 'card' | 'paypal';
}

interface CheckoutResponse {
  success: boolean;
  saleId?: string;
  purchaseId?: string;
  error?: string;
}

// ================================================================
// VALIDAÇÃO DE AUTENTICAÇÃO
// ================================================================

async function validateAuth(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error) {
    console.error('❌ Erro na validação de token:', error);
    return null;
  }
}

// ================================================================
// HANDLER POST - Processar Checkout
// ================================================================

export async function POST(request: NextRequest) {
  try {
    // 1️⃣ VALIDAR AUTENTICAÇÃO
    const userId = await validateAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // 2️⃣ PARSEAR REQUEST BODY
    const body: CheckoutRequest = await request.json();
    const { productId, quantity, shippingAddress, paymentMethod } = body;

    // Validação básica dos campos
    if (!productId || !quantity || !shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios em falta' },
        { status: 400 }
      );
    }

    // 3️⃣ BUSCAR PRODUTO DO FIRESTORE (Admin SDK = bypass das rules)
    const productRef = adminDb.collection('products').doc(productId);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    const productData = productSnap.data()!;

    // 4️⃣ VALIDAÇÕES DE NEGÓCIO (Server-Side Security!)
    // ✅ Verificar se produto está disponível
    if (productData.status !== 'disponível') {
      return NextResponse.json(
        { success: false, error: 'Produto já foi vendido' },
        { status: 400 }
      );
    }

    // ✅ Verificar quantidade disponível
    if (productData.quantity < quantity) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Apenas ${productData.quantity} unidade(s) disponível(is)` 
        },
        { status: 400 }
      );
    }

    // ✅ Impedir auto-compra
    if (productData.userId === userId) {
      return NextResponse.json(
        { success: false, error: 'Não pode comprar o seu próprio produto' },
        { status: 400 }
      );
    }

    // 5️⃣ CALCULAR PREÇO TOTAL (usando preço do Firestore, não do frontend!)
    const unitPrice = productData.price;
    const totalPrice = unitPrice * quantity;
    const platformFee = totalPrice * 0.05; // 5% taxa da plataforma
    const sellerAmount = totalPrice - platformFee;

    // 6️⃣ TRANSAÇÃO ATÔMICA (Sale + Purchase + Product Update)
    const batch = adminDb.batch();

    // Criar registo de SALE (vendedor)
    const saleRef = adminDb.collection('sales').doc();
    batch.set(saleRef, {
      productId,
      sellerId: productData.userId,
      buyerId: userId,
      price: unitPrice,
      quantity,
      totalPrice,
      platformFee,
      sellerAmount,
      shippingAddress,
      paymentMethod,
      status: 'pendente',
      createdAt: FieldValue.serverTimestamp(),
    });

    // Criar registo de PURCHASE (comprador)
    const purchaseRef = adminDb.collection('purchases').doc();
    batch.set(purchaseRef, {
      productId,
      sellerId: productData.userId,
      buyerId: userId,
      price: unitPrice,
      quantity,
      totalPrice,
      shippingAddress,
      paymentMethod,
      status: 'pendente',
      createdAt: FieldValue.serverTimestamp(),
    });

    // Atualizar produto (reduzir quantidade ou marcar como vendido)
    const newQuantity = productData.quantity - quantity;
    if (newQuantity === 0) {
      batch.update(productRef, {
        status: 'vendido',
        quantity: 0,
        soldAt: FieldValue.serverTimestamp(),
      });
    } else {
      batch.update(productRef, {
        quantity: newQuantity,
      });
    }

    // 🔥 EXECUTAR TRANSAÇÃO
    await batch.commit();

    console.log('✅ Checkout processado:', {
      saleId: saleRef.id,
      purchaseId: purchaseRef.id,
      productId,
      buyerId: userId,
      totalPrice,
    });

    // 7️⃣ RESPOSTA DE SUCESSO
    return NextResponse.json({
      success: true,
      saleId: saleRef.id,
      purchaseId: purchaseRef.id,
      totalPrice,
      platformFee,
      sellerAmount,
    });

  } catch (error: any) {
    console.error('❌ Erro no checkout:', error);

    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'Erro interno no servidor' 
      },
      { status: 500 }
    );
  }
}

// ================================================================
// HANDLER GET - Verificar Status de um Checkout
// ================================================================

export async function GET(request: NextRequest) {
  try {
    const userId = await validateAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const saleId = searchParams.get('saleId');
    const purchaseId = searchParams.get('purchaseId');

    if (!saleId && !purchaseId) {
      return NextResponse.json(
        { success: false, error: 'Forneça saleId ou purchaseId' },
        { status: 400 }
      );
    }

    // Buscar sale ou purchase
    let docRef;
    let collection;
    if (saleId) {
      docRef = adminDb.collection('sales').doc(saleId);
      collection = 'sales';
    } else {
      docRef = adminDb.collection('purchases').doc(purchaseId!);
      collection = 'purchases';
    }

    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return NextResponse.json(
        { success: false, error: 'Transação não encontrada' },
        { status: 404 }
      );
    }

    const data = docSnap.data()!;

    // Verificar se utilizador tem permissão para ver esta transação
    const isAuthorized = (collection === 'sales' && data.sellerId === userId) ||
                         (collection === 'purchases' && data.buyerId === userId);

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para aceder a esta transação' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: docSnap.id,
        ...data,
      },
    });

  } catch (error: any) {
    console.error('❌ Erro ao buscar checkout:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro interno' },
      { status: 500 }
    );
  }
}
