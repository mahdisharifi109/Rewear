// Página estática de FAQ - renderizada no servidor
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Centro de Ajuda | Rewear',
  description: 'Perguntas frequentes sobre como comprar e vender na Rewear. Encontre respostas sobre pagamentos, envios e segurança.',
};

// Lista de perguntas e respostas mais completa
const faqs = [
  {
    question: "Como posso vender um artigo na Rewear?", // <-- ALTERADO
    answer: "É muito simples! Clique no botão 'Vender' no topo da página, preencha os detalhes do seu produto (título, descrição, preço, etc.), carregue uma ou mais fotografias de qualidade e publique o seu anúncio. Ficará imediatamente disponível no nosso catálogo."
  },
  {
    question: "Quais são os métodos de pagamento aceites?",
    answer: "Atualmente, todas as transações na Rewear são simuladas para fins desta Prova de Aptidão Profissional. Não processamos pagamentos reais. Numa versão futura, implementaríamos integrações com gateways de pagamento seguros como Stripe ou PayPal." // <-- ALTERADO
  },
  {
    question: "É seguro comprar e vender na plataforma?",
    answer: "A segurança é a nossa prioridade. Implementámos um sistema de avaliações para que possa verificar a reputação de outros utilizadores. Além disso, oferecemos um serviço (simulado) de 'Verificação de Artigo' para garantir a autenticidade dos produtos."
  },
  {
    question: "Como funcionam os envios?",
    answer: "Na versão atual da plataforma, os envios são da responsabilidade do vendedor, que deve combinar o método de entrega diretamente com o comprador. Recomendamos sempre a utilização de serviços de correio registado para maior segurança."
  },
  {
    question: "Posso editar o meu anúncio depois de o publicar?",
    answer: "Sim! No seu perfil, na secção 'À Venda', encontrará todos os seus artigos. Cada artigo tem um botão 'Editar' que lhe permite alterar o título, a descrição, o preço e as imagens a qualquer momento."
  },
  {
    question: "O que acontece quando marco um artigo como 'Vendido'?",
    answer: "Ao marcar um artigo como vendido, ele deixa de estar visível no catálogo público e no seu perfil. O valor da venda é (simuladamente) adicionado ao saldo da sua Carteira Rewear, e essa transação aparecerá no seu Dashboard de Vendedor." // <-- ALTERADO
  }
];

export default function FAQPage() {
  return (
    <div className="bg-gradient-to-b from-muted/30 to-background min-h-screen">
        <div className="container mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-primary/10">
                  <HelpCircle className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl font-heading">
                  Centro de Ajuda
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
                  Encontre respostas para as perguntas mais comuns sobre a Rewear.
                </p>
            </div>

            <div className="bg-card border border-border/50 p-8 rounded-2xl shadow-lg">
                <Accordion type="single" collapsible className="w-full space-y-2">
                {faqs.map((faq, index) => (
                    <AccordionItem value={`item-${index}`} key={index} className="border-b border-border/70 last:border-0">
                    <AccordionTrigger className="text-left text-base md:text-lg font-semibold hover:no-underline hover:text-primary transition-colors py-5">
                        {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-5">
                        {faq.answer}
                    </AccordionContent>
                    </AccordionItem>
                ))}
                </Accordion>
            </div>

            <div className="mt-16 text-center p-8 bg-muted/50 rounded-2xl border border-border/50">
                <h3 className="text-xl md:text-2xl font-semibold">Não encontrou a sua resposta?</h3>
                <p className="mt-3 text-muted-foreground text-base">A nossa equipa está pronta para ajudar.</p>
                <Button asChild size="lg" className="mt-6 shadow-md hover:shadow-lg transition-shadow">
                    <Link href="/contact">
                        <Mail className="mr-2 h-5 w-5" /> Contacte o Suporte
                    </Link>
                </Button>
            </div>
        </div>
    </div>
  );
}