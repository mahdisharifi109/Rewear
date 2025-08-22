"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore'; // IMPORTADO O UPDATEDOC
import type { Message, Conversation } from '@/lib/types';
import { Loader2, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import Image from 'next/image';

export default function ConversationPage() {
    const { user, loading: authLoading } = useAuth();
    const params = useParams();
    const router = useRouter();
    const conversationId = params.conversationId as string;

    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (authLoading) return; // Espera a autenticação carregar
        if (!user) {
            router.push('/login?redirect=/inbox');
            return;
        };
        
        const convoDocRef = doc(db, 'conversations', conversationId);
        const unsubscribeConvo = onSnapshot(convoDocRef, (doc) => {
            if (doc.exists() && doc.data().participantIds.includes(user.uid)) {
                setConversation({ id: doc.id, ...doc.data() } as Conversation);
            } else {
                router.push('/inbox');
            }
        });
        
        const messagesQuery = query(
            collection(db, `conversations/${conversationId}/messages`),
            orderBy('createdAt', 'asc')
        );
        const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
            setMessages(msgs);
            setLoading(false);
        });

        return () => {
            unsubscribeConvo();
            unsubscribeMessages();
        };
    }, [user, authLoading, conversationId, router]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newMessage.trim()) return;

        await addDoc(collection(db, `conversations/${conversationId}/messages`), {
            conversationId,
            senderId: user.uid,
            text: newMessage,
            createdAt: serverTimestamp(),
        });
        
        await updateDoc(doc(db, 'conversations', conversationId), {
            lastMessage: {
                text: newMessage,
                createdAt: serverTimestamp(),
            },
        });

        setNewMessage("");
    };
    
    if (authLoading || loading || !conversation || !user) {
        return <div className="container mx-auto flex min-h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    const otherParticipantId = conversation.participantIds.find(id => id !== user.uid)!;
    const otherParticipant = conversation.participants[otherParticipantId];
    
    return (
        <div className="container mx-auto max-w-3xl py-8">
            <Card className="h-[80vh] flex flex-col">
                <CardHeader className="border-b">
                    <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={otherParticipant.avatar} />
                            <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold">{otherParticipant.name}</p>
                            {conversation.product && (
                                <Link href={`/product/${conversation.product.id}`} className="text-sm text-muted-foreground hover:underline">
                                    Sobre: {conversation.product.name}
                                </Link>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === user.uid ? "justify-end" : "justify-start")}>
                           {msg.senderId !== user.uid && <Avatar className="h-8 w-8"><AvatarImage src={otherParticipant.avatar} /><AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback></Avatar>}
                            <div className={cn("max-w-xs md:max-w-md p-3 rounded-2xl", msg.senderId === user.uid ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none")}>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </CardContent>
                <CardFooter className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2">
                        <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Escreva uma mensagem..." />
                        <Button type="submit" size="icon" disabled={!newMessage.trim()}><Send className="h-4 w-4" /></Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}