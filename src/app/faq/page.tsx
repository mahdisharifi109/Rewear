"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // IMPORTAÇÃO ADICIONADA

// Lista de perguntas e respostas mais completa
const faqs = [
  {
    question: "Como posso vender um artigo na SecondWave?",
    answer: "É muito simples! Clique no botão 'Vender' no topo da página, preencha os detalhes do seu produto (título, descrição, preço, etc.), carregue uma ou mais fotografias de qualidade e publique o seu anúncio. Ficará imediatamente disponível no nosso catálogo."
  },
  {
    question: "Quais são os métodos de pagamento aceites?",
    answer: "Atualmente, todas as transações na SecondWave são simuladas para fins desta Prova de Aptidão Profissional. Não processamos pagamentos reais. Numa versão futura, implementaríamos integrações com gateways de pagamento seguros como Stripe ou PayPal."
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
    answer: "Ao marcar um artigo como vendido, ele deixa de estar visível no catálogo público e no seu perfil. O valor da venda é (simuladamente) adicionado ao saldo da sua Carteira SecondWave, e essa transação aparecerá no seu Dashboard de Vendedor."
  }
];

export default function FAQPage() {
  return (
    <div className="bg-muted/40">
        <div className="container mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <HelpCircle className="mx-auto h-12 w-12 text-primary" />
                <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                Centro de Ajuda
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Encontre respostas para as perguntas mais comuns sobre a SecondWave.
                </p>
            </div>

            <div className="bg-background p-6 rounded-lg shadow-sm">
                <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                        {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">
                        {faq.answer}
                    </AccordionContent>
                    </AccordionItem>
                ))}
                </Accordion>
            </div>

            <div className="mt-12 text-center border-t pt-8">
                <h3 className="text-xl font-semibold">Não encontrou a sua resposta?</h3>
                <p className="mt-2 text-muted-foreground">A nossa equipa está pronta para ajudar.</p>
                <Button asChild className="mt-4">
                    <Link href="/contact">
                        <Mail className="mr-2 h-4 w-4" /> Contacte o Suporte
                    </Link>
                </Button>
            </div>
        </div>
    </div>
  );
}