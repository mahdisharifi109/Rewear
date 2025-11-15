/**
 * Verificação simples de rotas públicas para encontrar links quebrados.
 * Executar com: npx ts-node scripts/checkLinks.ts
 */

// Prefer 3001 (used by check:links:dev). Allow override via CHECK_BASE_URL.
const BASE = process.env.CHECK_BASE_URL || 'http://127.0.0.1:3001';
const PATHS = ['/', '/catalog', '/sell', '/login', '/about', '/contact'];

async function check() {
  console.log(`🔎 Verificando links em ${BASE}`);
  let failures = 0;
  for (const p of PATHS) {
    try {
      const res = await fetch(`${BASE}${p}`);
      console.log(`${p} -> ${res.status}`);
      if (!res.ok) failures++;
    } catch (e: any) {
      console.log(`${p} -> ERROR: ${e?.message ?? 'unknown error'}`);
      failures++;
    }
  }
  if (failures) {
    console.log(`❌ ${failures} falha(s)`);
    console.log('Dica: garanta que o dev server está a correr (npm run dev) durante o teste.');
  } else {
    console.log('✅ Todos OK');
  }
}

check();
