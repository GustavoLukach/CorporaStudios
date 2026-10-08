# Tema sazonal de Halloween

## O que foi implementado

- O admin controla o estado global em `site_settings` usando a chave `halloween`.
- Quando o evento está desativado no admin, o tema fica desativado para todos os visitantes.
- O visitante pode usar o botão `Desativar efeitos` para desligar apenas no próprio navegador.
- A preferência local fica salva em `localStorage` e não altera a configuração global.
- O efeito é composto por partículas pequenas e lentas, sem cobrir as fotografias.
- `prefers-reduced-motion` desativa a animação automaticamente.

## Ativação no Supabase

1. Abra o SQL Editor do projeto Supabase.
2. Execute o arquivo `supabase/migrations/20261008_site_settings.sql`.
3. Publique os arquivos atualizados do projeto.
4. Entre em `admin.html` com uma conta autorizada.
5. Use a seção **Tema de Halloween** para ativar ou desativar o evento.

A migration cria a tabela `site_settings`, permite leitura pública apenas da configuração e limita inserção/atualização a usuários presentes em `admin_users`.

## Estado padrão

A migration insere o evento com `enabled: true`. Se a tabela ainda não estiver criada ou estiver temporariamente indisponível, o frontend usa o tema ativo por padrão para evitar que a campanha deixe de aparecer silenciosamente. O controle administrativo só funciona depois da execução da migration.
