# Jogo da Cobrinha 🐍

Um jogo clássico da cobrinha (Snake Game) desenvolvido com HTML, CSS e JavaScript puro.

Jogue agora: https://sirmarciusx.github.io/Snake_Game/

## Como Jogar

1. Abra o arquivo `index.html` em seu navegador
2. Clique em **"Iniciar Jogo"**
3. Use as **setas do teclado** para controlar a cobrinha
4. Coma os alimentos vermelhos para crescer e marcar pontos
5. Evite colidir com as paredes ou com o próprio corpo

## Funcionalidades

- **Introdução Animada**: Ao iniciar, a cobrinha entra na tela com animação de zoom e carinha sorriso
- **Controle com Setas**: Movimento com as teclas direcionais do teclado
- **Sistema de Pontuação**: Cada alimento vale 10 pontos
- **Aumento de Velocidade**: O jogo fica mais rápido a cada 50 pontos
- **Efeitos Sonoros**:
  - Música de fundo durante o jogo
  - Som ao comer alimento
  - Som e música triste no game over
- **Tela de Game Over Animada**: Carinha chorando com zoom e mensagem
- **Sistema de Recordes**: Salva os 3 melhores resultados no navegador
- **Retorno Automático**: Após 5 segundos do game over, retorna à tela inicial
- **Efeito de Brilho**: Título com animação pulsante na tela inicial

## Controles

| Tecla | Ação |
|------|------|
| ↑ Seta para Cima | Mover para cima |
| ↓ Seta para Baixo | Mover para baixo |
| ← Seta para Esquerda | Mover para esquerda |
| → Seta para Direita | Mover para direita |

## Estrutura do Projeto

```
Snake_Game/
├── index.html    # Estrutura da página
├── style.css    # Estilização visuals
├── script.js    # Lógica do jogo
└── README.md    # Esta documentação
```

## Tecnologias

- HTML5 Canvas
- CSS3
- JavaScript (Web Audio API)

## Executando o Jogo

Basta abrir o arquivo `index.html` em qualquer navegador moderno.

```bash
# No Windows
start index.html

# No macOS
open index.html

# No Linux
xdg-open index.html
```

## Personalização

Você pode customizing o jogo alterando variáveis no `script.js`:

- `gridSize` - Tamanho de cada célula
- `speed` - Velocidade inicial
- `snakeColor` - Cor da cobrinha
- `foodColor` - Cor do alimento

## Autor

Desenvolvido como projeto de aprendizado de programação web front-end.

---
Divirta-se jogando! 🐍
