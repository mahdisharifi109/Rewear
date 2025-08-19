import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como posso vender um artigo?",
    answer: "Para vender um artigo, basta clicar no botão 'Vender' no topo da página, preencher os detalhes do produto, carregar uma foto e publicar o seu anúncio. A nossa ferramenta de IA pode até ajudar a sugerir um título e uma descrição!"
  },
  {
    question: "Quais são os métodos de pagamento aceites?",
    answer: "Atualmente, todas as transações são simuladas. Não processamos pagamentos reais. Esta funcionalidade serve para demonstrar o fluxo de compra da plataforma."
  },
  {
    question: "É seguro comprar na SecondWave?",
    answer: "Desenvolvemos a plataforma com a segurança em mente. No entanto, como as transações são simuladas, não há risco financeiro. Para uma futura versão real, implementaríamos sistemas de pagamento seguros e proteção ao comprador."
  },
  {
    question: "Como funcionam os envios?",
    answer: "Na versão atual, os envios são simulados. Os utilizadores não precisam de enviar ou receber produtos físicos. Numa plataforma completa, os vendedores seriam responsáveis por enviar os artigos aos compradores."
  },
  {
    question: "Posso editar o meu anúncio depois de publicado?",
    answer: "Sim, no seu perfil de utilizador, terá acesso a uma lista dos seus anúncios. A partir daí, poderá editar ou eliminar qualquer um deles. (Funcionalidade futura)"
  }
];

export default function FAQPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Perguntas Frequentes
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Encontre respostas para as perguntas mais comuns sobre a SecondWave.
        </p>
      </div>

      <div className="mt-12">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
