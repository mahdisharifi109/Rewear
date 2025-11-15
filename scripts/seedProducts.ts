/**
 * Seed de produtos fictícios para evitar catálogo vazio.
 * Executar com: npm run seed
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../src/lib/firebase';

function ensureEnv(keys: string[]) {
  const missing = keys.filter((k) => !process.env[k] || process.env[k]?.trim() === '');
  if (missing.length) {
    console.error('❌ Variáveis de ambiente em falta (ficheiro .env.local):', missing.join(', '));
    console.error('Exemplo: NEXT_PUBLIC_FIREBASE_API_KEY=...');
    process.exit(1);
  }
}

ensureEnv([
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
]);

async function seedProducts() {
  console.log('🔄 Verificando coleção de produtos...');
  const snap = await getDocs(collection(db, 'products'));
  if (!snap.empty) {
    console.log('✅ Já existem produtos. Seed não necessário.');
    return;
  }

  const demo = Array.from({ length: 12 }).map((_, i) => ({
    name: `Camisola Eco ${i + 1}`,
    description: 'Peça sustentável em ótimo estado, perfeita para dar uma segunda vida.',
    price: 10 + i,
    quantity: 1,
    status: 'disponível',
    category: 'Roupa',
    condition: 'Bom',
    imageUrls: [
      `https://placehold.co/700x475.webp?text=Rewear+${i + 1}`,
    ],
    userId: 'demoUser',
    createdAt: new Date(),
  }));

  for (const p of demo) {
    await addDoc(collection(db, 'products'), p);
  }
  console.log('🎉 Seed concluído com 12 produtos.');
}

seedProducts().catch((e) => {
  console.error('❌ Erro ao executar seed:', e);
  process.exit(1);
});
