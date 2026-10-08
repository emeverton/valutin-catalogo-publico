# Valutin — catálogo público e guia técnico

Repositório público de referência para desenvolvimento local e gestão assistida do catálogo da Valutin. Contém um **snapshot revisado do código do site**, seus ativos públicos e documentação consolidada. Não contém senhas, chaves, exports de CRM, contatos, dados do banco nem histórico privado do repositório operacional.

> **Importante:** este repositório não é a origem automática do site em produção. Em 08/10/2026, `www.valutin.com.br` estava associado a um deploy Vercel identificado pelo commit `6c9b8a8`; este snapshot foi preparado a partir da branch de handoff `7244df9`, compilada e testada separadamente. Igualdade exata entre todos os arquivos da produção e deste repositório **não foi certificada**. Não faça deploy deste snapshot sem revisão e autorização.

## Links

- [Catálogo publicado](https://www.valutin.com.br/catalogo)
- [Coleção Primavera–Verão](https://www.valutin.com.br/catalogo/primavera-verao)
- [Editor de conteúdo](https://www.valutin.com.br/editor/login)
- [Arquitetura e limites conhecidos](docs/ARQUITETURA.md)
- [Operação do catálogo](docs/OPERACAO_CATALOGO.md)
- [Inventário de fontes e exclusões](docs/INVENTARIO.md)
- [Prompt para Codex](docs/PROMPT_CODEX.md)

## Executar localmente

```bash
git clone https://github.com/emeverton/valutin-catalogo-publico.git
cd valutin-catalogo-publico
npm ci
cp .env.example .env.local
npm run dev
```

Abra `http://localhost:3001`. `.env.local` é **privado**: configure somente os valores necessários, recebidos da pessoa responsável por cada integração por canal seguro. Sem serviços e credenciais privadas, funções de editor, estoque, CRM e dashboard não podem ser testadas de ponta a ponta localmente. Nunca cole segredos no Codex, em issues ou em commits.

## Modificar com segurança

1. Para texto, fotos, preço, estoque manual e cadastro de peças, priorize o editor publicado. Salvar rascunho não equivale a publicar.
2. Para alterar código, crie uma branch, preserve a estrutura visual aprovada e trabalhe apenas no escopo solicitado.
3. Rode `npm test`, `npm run build` e `git diff --check`; confira catálogo, categoria, PDP e mobile.
4. Peça revisão antes de publicar. Um `git push` neste repositório **não** atualiza `www.valutin.com.br`.

O catálogo atual usa **venda assistida**: descoberta no site e conclusão com a equipe por atendimento/WhatsApp/loja. Não há checkout transacional comprovado no domínio oficial. Estoque manual não tem baixa automática. Produtos novos não entram automaticamente em feeds de anúncios sem vínculo válido de SKU.

## Proveniência e privacidade

Este é um repositório de entrega com histórico novo, separado dos repositórios operacionais e de seus dados privados. A documentação é uma síntese datada de arquivos locais e verificações públicas; não deve ser interpretada como atestado de saúde atual de Kommo, Linx, n8n, Meta, Google ou Supabase. Veja [o inventário](docs/INVENTARIO.md) antes de ampliar o escopo.
