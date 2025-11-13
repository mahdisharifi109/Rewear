import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Middleware de autenticação para API routes
 * Valida se o userId existe e corresponde a um utilizador válido
 */
export async function validateAuth(req: NextRequest, userId: string | undefined): Promise<{ valid: boolean; user?: any; error?: NextResponse }> {
  // Rate limiting básico (pode ser melhorado com Redis/Upstash)
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  // Validação básica do userId
  if (!userId || typeof userId !== 'string' || userId.length < 10) {
    return {
      valid: false,
      error: NextResponse.json({ 
        error: 'Autenticação inválida. Por favor, inicie sessão novamente.' 
      }, { status: 401 })
    };
  }

  try {
    // Verificar se o utilizador existe no Firebase
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        valid: false,
        error: NextResponse.json({ 
          error: 'Utilizador não encontrado. Por favor, inicie sessão novamente.' 
        }, { status: 401 })
      };
    }

    const userData = userSnap.data();

    // Verificar se a conta está ativa (pode adicionar mais validações)
    if (userData.status === 'suspended' || userData.status === 'banned') {
      return {
        valid: false,
        error: NextResponse.json({ 
          error: 'Conta suspensa. Contacte o suporte.' 
        }, { status: 403 })
      };
    }

    return {
      valid: true,
      user: userData
    };
  } catch (error) {
    console.error('Erro na validação de autenticação:', error);
    return {
      valid: false,
      error: NextResponse.json({ 
        error: 'Erro no servidor. Tente novamente.' 
      }, { status: 500 })
    };
  }
}

/**
 * Rate limiting simples baseado em IP
 * Em produção, use uma solução mais robusta como Upstash Rate Limit
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}
