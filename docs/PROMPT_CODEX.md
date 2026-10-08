# Prompt para continuar com Codex

Copie o texto abaixo para uma tarefa nova no Codex da cliente:

> Quero gerenciar o catálogo da Valutin usando o repositório público `https://github.com/emeverton/valutin-catalogo-publico`. Clone o repositório em uma pasta de trabalho nova, leia integralmente `README.md` e os documentos em `docs/`, e mostre um resumo do que é código local, o que depende do editor publicado e o que depende de integrações privadas. Não trate este snapshot como prova de igualdade exata com a produção.
>
> Para trocar fotos, descrições, preços, estoque manual ou criar uma peça, prefira o editor publicado em `https://www.valutin.com.br/editor/login`. Deixe que eu faça o login no navegador; não solicite, registre ou copie minha senha. Trabalhe em rascunho, mostre a prévia e só publique quando eu aprovar expressamente.
>
> Se a tarefa exigir código, crie uma branch própria. Preserve a estrutura visual aprovada e as páginas existentes. Antes de modificar, identifique arquivo, variante e impacto. Depois rode `npm test`, `npm run build` e `git diff --check`, e faça revisão visual no desktop e no celular. Não altere anúncios, CRM, Linx, n8n, Vercel ou o domínio oficial sem autorização específica. Não inclua credenciais ou dados de clientes em commits, prompts ou issues.
>
> Ao concluir, separe claramente: mudanças locais, mudanças publicadas no editor, mudanças enviadas ao GitHub e mudanças efetivamente validadas em produção. Se algum serviço externo não estiver acessível, declare a limitação em vez de presumir sucesso.
