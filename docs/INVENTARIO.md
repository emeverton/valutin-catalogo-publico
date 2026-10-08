# Inventário de fontes e decisão de publicação

**Levantamento:** 08/10/2026. O workspace original foi inspecionado por áreas, não copiado integralmente. A regra deste repositório é publicar o que permite desenvolver e compreender o catálogo sem divulgar dados operacionais de terceiros ou criar uma falsa equivalência com produção.

| Fonte encontrada no workspace original | Decisão | Motivo |
| --- | --- | --- |
| `valutin-lp/app`, configurações, testes e `public` | **Incluído como snapshot** | Código e ativos necessários para executar e evoluir o catálogo. Build e 79 testes passaram na preparação. |
| `valutin-lp/app/lib/catalog.json` | **Incluído** | Catálogo-base de 63 cadastros nesta cópia; não contém os registros publicados posteriormente pelo editor. |
| Documentação local sobre arquitetura, editor e feed | **Consolidada** nestes documentos | Algumas versões antigas descrevem estados já superados ou afirmações ainda não validadas. |
| `valutin-lp/docs/EDITOR_DA_PAGINA.md` e guias de fotos | **Não copiados literalmente** | Contêm histórico de implantação e trechos datados que poderiam confundir o fluxo atual. |
| `commerce/` (Medusa/storefront local) | **Não incluído** | Protótipo separado, sem prova de checkout ou deploy no domínio oficial; incluí-lo como produção seria incorreto. |
| `apps/kommo-mcp`, `mcp/`, `n8n/`, `scripts/exports/` | **Excluídos** | Ferramentas, fluxos e exports operacionais; podem conter identificadores, dados de lead ou detalhes de acesso. |
| `reports/`, `exports/`, `output/` e planilhas | **Excluídos** | Material de auditoria, mídia ou campanhas; parte contém evidência datada, dados comerciais ou arquivos não revisados para divulgação. |
| `.env*`, `.vercel`, dados de Postgres, tokens e backups | **Excluídos** | Segredos e estados locais nunca pertencem a um repositório público. `.env.example` é somente uma lista de nomes de configuração. |
| Repositório Git operacional original | **Histórico não copiado** | Este repositório tem histórico novo; branches e commits antigos não são publicados em conjunto. A visibilidade atual do original deve ser auditada separadamente. |

## Proveniência técnica

- Snapshot de código preparado a partir de uma branch de handoff identificada pelo commit `7244df92577fda347843ca360c1654f3e4de1c8b`.
- No levantamento, a produção Vercel estava associada ao deploy `dpl_GingLRewMzvmHJ53dHtXzzwEuJKN`, com metadado de commit `6c9b8a83fef93fbee345831acf7c6a9c16b7beb1`. A branch de handoff tinha um deploy de **prévia** separado. Esses metadados não provam igualdade byte a byte entre a produção e o snapshot público.
- Os endpoints públicos de catálogo, coleção, editor/login, página institucional e privacidade responderam em 08/10/2026. Isso prova acessibilidade HTTP, não validação completa de conteúdo, autenticação ou integrações.
- O banco de conteúdo do editor, dados do CRM, saldos e métricas das plataformas **não** foram exportados. O uso local da interface exige configuração privada e dados apropriados.

## Verificações antes de qualquer deploy futuro

Confirmar a versão aprovada com a cliente; comparar as rotas e os ativos da prévia com o domínio oficial; testar editor autenticado com a própria usuária; conferir catálogo/categoria/PDP no desktop e mobile; auditar URLs, consentimento e feeds; validar serviços externos com evidência real. Um teste unitário ou resposta HTTP 200 isolada não fecha essas etapas.
