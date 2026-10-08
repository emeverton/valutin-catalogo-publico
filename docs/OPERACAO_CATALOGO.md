# Operação do catálogo

## Primeiro escolha a superfície correta

| Tarefa | Caminho indicado |
| --- | --- |
| Trocar foto, capa ou descrição de peça existente | Editor: `/editor/catalogo` |
| Ajustar nome, descrição, preço ou estoque manual por tamanho | Editor: `/editor/produtos` |
| Cadastrar peça individual nova | Editor: `/editor/novos-produtos` |
| Alterar banner, texto editorial ou CTA permitido | Editor: `/editor` |
| Mudar regra de categoria, layout, integração ou feed | Código em branch revisada; não fazer pela interface |

O editor deve ser acessado em `https://www.valutin.com.br/editor/login`. A pessoa responsável preenche a senha diretamente no navegador. Não compartilhar a senha com o agente nem gravá-la em `.env` versionado.

## Processo seguro de publicação

1. Identifique a URL/handle e a variante exata (cor, estampa e tamanho). Uma foto não deve migrar para outra variante por semelhança de nome.
2. Confira a foto original, direitos de uso, proporção e detalhes da peça. Para produto de venda, não use geração de imagem que altere costura, textura, etiqueta, forma ou cor.
3. Salve o rascunho. Revise capa, ordem das vistas, legenda, preço, categoria, tamanhos e saldo.
4. Faça prévia desktop e mobile. Só publique depois de aprovação explícita.
5. Após publicar, confira categoria, vitrine, PDP, imagem social e disponibilidade no domínio oficial.

## Estoque e anúncios

Campo de estoque vazio significa não informado; zero significa esgotado. O estoque manual é declarado pela loja e não baixa automaticamente após venda assistida. A equipe precisa confirmar o saldo antes de concluir a compra.

Uma peça nova no editor não recebe automaticamente SKU Linx validado nem entra automaticamente nos feeds Meta/Google. Antes de anunciá-la, valide correspondência peça/cor/tamanho ↔ SKU, imagem, preço, disponibilidade e aceitação do feed na plataforma. Não configure campanhas a partir de um produto apenas porque sua PDP existe.

## Desenvolvimento local

Use o `README.md` para clonar e iniciar. Faça alterações de código em branch própria. Preserve a estrutura visual aprovada; mudanças em hero, dobras ou navegação requerem pedido específico. Rode testes, build e revisão visual. Não confunda o build local ou a prévia da Vercel com o domínio de produção.

As configurações necessárias para o editor, Linx, Kommo, n8n, dashboard e anúncios pertencem a serviços externos. Obtenha-as com a equipe em cofre/canal seguro. Não copie dados de clientes nem credenciais para o repositório público.
