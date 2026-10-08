# Arquitetura da Valutin — síntese pública

**Levantamento:** 08/10/2026. Esta página separa a presença do código, o acesso público observado e a validação operacional de cada integração. Não substitui um teste real de ponta a ponta.

## Experiência comercial

O domínio oficial é `https://www.valutin.com.br`. A navegação pública observada no levantamento inclui `/catalogo`, `/catalogo/primavera-verao`, páginas de categoria e páginas individuais de produto (PDP). A página institucional, as políticas e o login do editor também responderam no domínio. O site é um **catálogo de venda assistida**, não um checkout online com pagamento comprovado.

```text
Busca / anúncio / acesso direto
        ↓
Coleção → categoria → PDP
        ↓
Consulta de disponibilidade e atendimento
        ↓
Equipe comercial / WhatsApp / loja
        ↓
CRM e mensuração, quando os serviços externos respondem
```

O código do site está em `app/`. `app/lib/catalog.json` contém 63 cadastros-base neste snapshot; `app/lib/catalog-individual.ts` separa variantes em fichas individuais. `app/lib/catalog-navigation.ts` define departamentos e categorias. O número de fichas visíveis pode diferir porque depende de variantes, publicações do editor e regras de elegibilidade.

## Fontes de informação

| Dado | Fonte no desenho atual | Limite |
| --- | --- | --- |
| Produto-base, variantes, imagens de fallback e navegação | Código e `app/lib/catalog.json` | Não é, sozinho, o conteúdo editado mais recentemente no banco. |
| Alterações salvas/publicadas no editor | Armazenamento privado do editor | Não é exportado para este GitHub público. |
| Disponibilidade de peça existente | Consulta backend à Linx ou saldo manual publicado, conforme a peça | Saldo manual requer atualização humana; resposta da Linx depende do serviço externo. |
| Interesse e origem da consulta | Site e API de atendimento | Clique não prova venda. |
| Oportunidade e fechamento | Kommo e operação da equipe | Sem reconciliação real, não declarar compra concluída. |
| Conversões e relatórios | Fluxos n8n / provedores de mídia / dashboard | Código implementado não comprova entrega atual a cada destino. |

## Editor e segurança

O editor publicado fica em `/editor/login` e tem acesso separado do dashboard privado. As rotas em `app/editor/` e `app/api/editor/` oferecem rascunho, prévia e publicação de conteúdo; o armazenamento fica fora deste repositório. Fotos carregadas pelo editor usam mídia privada e rota controlada. O repositório não traz usuários, senhas, tokens nem dados da tabela de conteúdo. A senha deve ser inserida pela cliente no navegador, não em prompt de IA.

## Integrações presentes no código

- **Linx:** consulta de estoque pelo backend. Não presumir que cada peça nova já possui SKU válido.
- **Kommo e n8n:** passagem de interesse, deduplicação e sinalização comercial conforme configuração externa. O código local não prova que o lead chegou ao CRM hoje.
- **WhatsApp:** links e roteamento próprios do site; campanhas Click-to-WhatsApp podem usar um número nativo e não passar pelo roteador.
- **Supabase:** persistência privada de conteúdo do editor e componentes operacionais. Nunca inserir a chave de serviço no navegador ou neste repositório.
- **Meta, Google, GA4 e dashboard:** feeds, eventos e relatórios. Exigem validação individual de catálogo, disponibilidade, consentimento e resposta das plataformas.

## Rotas e arquivos úteis

| Necessidade | Arquivos principais |
| --- | --- |
| Categorias e departamentos | `app/lib/catalog-navigation.ts`, `app/catalogo/categoria/[category]/page.tsx` |
| Produto-base e variantes | `app/lib/catalog.json`, `app/lib/catalog-individual.ts` |
| Vitrines e coleção | `app/catalogo/primavera-verao/page.tsx`, `app/components/SpringSummer*.tsx` |
| PDP e disponibilidade | `app/catalogo/[handle]/page.tsx`, `app/components/ProductDetail.tsx`, `app/lib/linx/stock.ts` |
| Editor de conteúdo/produtos | `app/editor/`, `app/api/editor/`, `app/lib/editor/` |
| Feed de catálogo | `app/feeds/meta.xml/route.ts`, `app/feeds/google.xml/route.ts` |
| Páginas institucionais | `app/sobre-a-valutin/`, `app/politica-de-privacidade/` e rotas correlatas |

## O que não está comprovado por este repositório

Este snapshot não certifica que o conteúdo do banco corresponda aos arquivos locais, que o saldo Linx esteja saudável, que um lead consentido atravesse site → n8n → Kommo sem duplicação, nem que uma venda real seja recebida por Meta/Google/GA4. O protótipo local `commerce/` encontrado no workspace original usa Medusa e **não** representa o backend oficial publicado. Essas verificações exigem acesso autorizado, IDs conciliáveis e teste controlado em cada serviço.
