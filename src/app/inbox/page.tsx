"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import type { Conversation } from '@/lib/types';
import { Loader2, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image'; // A IMPORTAÇÃO CORRETA

export default function InboxPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/inbox');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const conversationsQuery = query(
      collection(db, "conversations"),
      where("participantIds", "array-contains", user.uid),
      orderBy("lastMessage.createdAt", "desc")
    );

    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
      const convos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Conversation[];
      setConversations(convos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Caixa de Entrada</h1>
        <p className="mt-2 text-lg text-muted-foreground">As suas conversas com outros utilizadores.</p>
      </div>
      
      {conversations.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {conversations.map(convo => {
                if (!user) return null; // Verificação de segurança
                const otherParticipantId = convo.participantIds.find(id => id !== user.uid)!;
                const otherParticipant = convo.participants[otherParticipantId];
                return (
                  <li key={convo.id}>
                    <Link href={`/inbox/${convo.id}`} className="block hover:bg-muted/50 transition-colors">
                      <div className="p-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={otherParticipant.avatar} />
                            <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{otherParticipant.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{convo.lastMessage?.text}</p>
                        </div>
                        {convo.product && (
                           <Image src={convo.product.image} alt={convo.product.name} width={56} height={56} className="h-14 w-14 rounded-md object-cover flex-shrink-0" />
                        )}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">Sem conversas</h3>
          <p className="mt-2 text-muted-foreground">Inicie uma conversa a partir da página de um produto.</p>
        </div>
      )}
    </div>
  );
}