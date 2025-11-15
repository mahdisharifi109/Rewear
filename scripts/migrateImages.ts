/**
 * Script de migração de imagens Base64 para Firebase Storage.
 * Executar via: npm run migrate:images
 * Certifica-te que tens variáveis de ambiente configuradas (.env.local).
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { app } from '../src/lib/firebase';

function ensureEnv(keys: string[]) {
  const missing = keys.filter((k) => !process.env[k] || process.env[k]?.trim() === '');
  if (missing.length) {
    console.error('❌ Variáveis de ambiente em falta (ficheiro .env.local):', missing.join(', '));
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

async function migrateImagesToStorage() {
  const firestore = getFirestore(app);
  const storage = getStorage(app);
  const productsRef = collection(firestore, 'products');

  console.log('🔄 Iniciando migração de imagens...');
  const snapshot = await getDocs(productsRef);
  let migratedCount = 0;

  for (const productDoc of snapshot.docs) {
    const product = productDoc.data() as any;
    const imageUrls: string[] = product.imageUrls || [];

    if (!imageUrls.length) continue;

    const newUrls: string[] = [];
    let changed = false;

    for (let i = 0; i < imageUrls.length; i++) {
      const img = imageUrls[i];
      if (img && img.startsWith('data:image')) {
        changed = true;
        try {
          const storageRef = ref(storage, `products/${productDoc.id}/image-${i}.webp`);
          await uploadString(storageRef, img, 'data_url');
          const downloadUrl = await getDownloadURL(storageRef);
          newUrls.push(downloadUrl);
          console.log(`✅ Migrada imagem ${i} do produto ${productDoc.id}`);
        } catch (err) {
          console.error(`❌ Erro ao migrar imagem ${i} do produto ${productDoc.id}`, err);
        }
      } else {
        newUrls.push(img);
      }
    }

    if (changed) {
      await updateDoc(doc(firestore, 'products', productDoc.id), {
        imageUrls: newUrls,
        migratedAt: new Date(),
      });
      migratedCount++;
    }
  }

  console.log(`🏁 Migração concluída. Produtos alterados: ${migratedCount}`);
}

migrateImagesToStorage().catch(err => {
  console.error('Erro geral na migração', err);
  process.exit(1);
});
