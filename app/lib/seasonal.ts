export function seasonalCampaign(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year:'numeric', month:'2-digit',day:'2-digit' }).formatToParts(date);
  const value=(key:string)=>Number(parts.find(p=>p.type===key)?.value);
  if(value('year')===2026){
    const month=value('month'),day=value('day');
    if(month===9 && day<20)return {label:'PRIMAVERA VALUTIN',title:'Leveza para os dias de primavera.',body:'Algodão, cores delicadas e detalhes para acompanhar a infância. Explore as peças e encontre tamanhos e combinações com nossa equipe.'};
    if((month===9&&day>=20)||(month===10&&day<=12))return {label:'DIA DAS CRIANÇAS',title:'Um presente para viver a infância.',body:'Escolha com carinho: peças para brincar, passear e celebrar. Nossa equipe ajuda com o tamanho e a combinação para presentear.'};
    if(month===10)return {label:'PRIMAVERA · OCASIÕES ESPECIAIS',title:'Para os encontros que viram lembrança.',body:'Do passeio em família às celebrações, encontre uma composição especial e consulte tamanhos com nossa equipe.'};
    if(month===11)return {label:'CURADORIA DE FIM DE ANO',title:'Os primeiros detalhes de uma celebração.',body:'Inspire-se para os encontros de fim de ano e comece a escolher os presentes de Natal. Consulte as opções disponíveis com nossa equipe.'};
    if(month===12&&day<=25)return {label:'NATAL VALUTIN',title:'O carinho também está no que vestimos.',body:'Para presentear e compartilhar a ceia em família. Consulte tamanhos, disponibilidade e prazos de atendimento antes de combinar sua compra.'};
    if(month===12)return {label:'BOAS FESTAS',title:'Novas lembranças para vestir.',body:'A família Valutin deseja boas festas. Encontre inspirações para os próximos encontros e consulte nosso atendimento.'};
  }
  return {label:'CURADORIA VALUTIN',title:'Uma elegância que pertence à infância.',body:'Peças para bebês e crianças, encontros em família e presentes escolhidos com cuidado. Consulte as opções com nossa equipe.'};
}

// Curated from the current catalog; additions to the collection are intentional.
export const springSummerSourceHandles = [
  'camiseta-algodao', 'conjunto-laise', 'vestido-percal-tricolor',
  'vestido-de-laise', 'vestido-listrado-algodao', 'saia-algodao',
  'macacao-tricoline', 'macacao-fustao', 'conjunto-body-shorts',
  'bloomer-fustao', 'vestido-xadrez', 'vestido-algodao-rosa',
  'bermuda-linho', 'camisa-linho', 'body-linho', 'shorts-algodao',
  'vestido-laise-novidades', 'vestido-algodao-bordado',
] as const;
