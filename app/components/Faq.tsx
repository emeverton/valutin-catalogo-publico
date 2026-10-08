const questions = [
  ['Como consultar uma peça?', 'Escolha uma peça no catálogo e toque em “Consultar esta peça no WhatsApp”. Informe seu nome e telefone; nossa equipe ajuda com tamanho, cor, preço atual e disponibilidade.'],
  ['Os preços e tamanhos do catálogo estão disponíveis?', 'Os valores são de referência e as grades mostram os tamanhos da curadoria. Confirme o preço atual e a disponibilidade da peça com a equipe antes da compra.'],
  ['Vocês ajudam a escolher presentes?', 'Sim. Conte a idade da criança e a ocasião para receber ajuda na escolha de tamanho e combinação.'],
  ['Como combinar entrega ou retirada?', 'Consulte as opções, os custos e os prazos durante o atendimento, antes de concluir sua compra.'],
  ['A Valutin vende no atacado?', 'Não. O atendimento é exclusivo ao consumidor final, para uso próprio, da família ou para presentear.'],
];
export default function Faq() { return <section className="bg-white px-6 py-16"><div className="mx-auto max-w-3xl"><h2 className="mb-8 font-playfair text-4xl italic">Antes de conversar com a equipe</h2>{questions.map(([question,answer])=><details key={question} className="border-b border-brand/25 py-5"><summary className="cursor-pointer py-2 font-medium text-brand-strong">{question}</summary><p className="pt-4 text-sm leading-relaxed text-ink/75">{answer}</p></details>)}</div></section>; }
