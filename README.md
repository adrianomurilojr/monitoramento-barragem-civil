# MoniBarragem

Interface demonstrativa para monitoramento de instrumentos de barragem, construída com Next.js, React, TypeScript, Tailwind CSS e Recharts.

A navegação entre as áreas fica centralizada na barra superior. A interface oferece temas escuro e claro, com preferência salva no navegador.

## Executar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. A tela inicial direciona para `/login`; para entrar na demonstração, basta informar qualquer e-mail válido e uma senha não vazia.

## Rotas

- `/home` — página inicial pós-login com atalhos visuais para as áreas
- `/login` — acesso demonstrativo
- `/dashboard` — visão geral e leituras recentes
- `/instruments` — cadastro de instrumentos e programação de leituras
- `/readings` — histórico de leituras
- `/charts` — gráficos de tendência
- `/reports` — relatórios demonstrativos
- `/indicators` — indicadores e alertas

O login e os dados são apenas demonstrativos: a sessão é guardada no `localStorage` e os registros ficam no estado da interface. Antes de uso em produção, conecte autenticação, persistência, autorização e geração real de relatórios a serviços seguros.

As transições, animações de rolagem e perspectiva 3D são efeitos visuais em CSS; não representam análise estrutural ou dados operacionais reais.

## Imagem de fundo

A foto local `public/xingo-dam.jpg` mostra as comportas da Usina Hidrelétrica de Xingó. Crédito: High source, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Comportas_da_Usina_Hidrel%C3%A9trica_de_Xing%C3%B3.jpg), licenciada sob [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
