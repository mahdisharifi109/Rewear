/**
 * Seed de produtos fictícios para evitar catálogo vazio.
 * Executar com: npm run seed
 *
 * Requer credenciais Admin:
 *  - Defina a variável de ambiente GOOGLE_APPLICATION_CREDENTIALS apontando para o JSON do serviço
 *    ou
 *  - Defina FIREBASE_SERVICE_ACCOUNT com o conteúdo JSON inline
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

function initAdmin() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(sa) });
    return;
  }
  // Se GOOGLE_APPLICATION_CREDENTIALS estiver definido, usa applicationDefault()
  initializeApp({ credential: applicationDefault() });
}

async function seedProducts() {
  initAdmin();
  const db = getFirestore();

  console.log('🔄 Verificando coleção de produtos...');
  const existing = await db.collection('products').limit(1).get();
  if (!existing.empty) {
    console.log('✅ Já existem produtos. Seed não necessário.');
    return;
  }

  const demoUser = {
    uid: 'demoUser',
    email: 'demo@rewear.test',
    name: 'Demo User',
  };

  const now = Timestamp.fromDate(new Date());

  const demo = Array.from({ length: 10 }).map((_, i) => ({
    name: `Camisola Eco ${i + 1}`,
    description: 'Peça sustentável em ótimo estado, perfeita para dar uma segunda vida.',
    price: 10 + i,
    condition: 'Bom',
    category: 'Roupa',
    imageUrls: [
      `https://placehold.co/700x475.webp?text=Rewear+${i + 1}`,
    ],
    imageHint: `Camisola Eco ${i + 1}`,
    userEmail: demoUser.email,
    userName: demoUser.name,
    userId: demoUser.uid,
    quantity: 1,
    createdAt: now,
    status: 'disponível',
    isVerified: true,
  }));

  const batch = db.batch();
  demo.forEach((p) => {
    const ref = db.collection('products').doc();
    batch.set(ref, p);
  });
  await batch.commit();
  console.log('🎉 Seed concluído com 10 produtos.');
}

seedProducts().catch((e) => {
  console.error('❌ Erro ao executar seed:', e);
  process.exit(1);
});
