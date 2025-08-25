// Variáveis para elementos do DOM
let canvas;
let ctx;
let startButton;
let restartButton;
let scoreElement;

// Efeitos sonoros
let gameOverSound;

// Configurações do jogo
const gridSize = 20;
let tileCount;
let speed = 7;

// Estado do jogo
let gameRunning = false;
let gameOver = false;
let score = 0;
let gameOverBlinkCounter = 0;
let gameOverBlinkRate = 10; // Taxa de piscagem

// Cobrinha
let snake = [];
let snakeLength = 5;

// Posição inicial da cabeça da cobrinha
let headX = 10;
let headY = 10;

// Velocidade da cobrinha
let velocityX = 0;
let velocityY = 0;

// Comida
let foodX = 5;
let foodY = 5;

// Cores
const snakeColor = '#4CAF50';
const foodColor = '#FF5252';

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Obtém os elementos do DOM
    canvas = document.getElementById('game');
    ctx = canvas.getContext('2d');
    startButton = document.getElementById('start-btn');
    restartButton = document.getElementById('restart-btn');
    scoreElement = document.getElementById('score');
    
    // Calcula o número de células no grid
    tileCount = canvas.width / gridSize;
    
    // Carrega os efeitos sonoros
    loadSounds();
    
    // Inicializa a cobrinha
    resetGame();
    
    // Desenha o estado inicial
    drawGame();
    
    // Event listeners
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', resetGame);
    document.addEventListener('keydown', changeDirection);
});

// Carrega os efeitos sonoros
function loadSounds() {
    gameOverSound = new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3');
    gameOverSound.volume = 0.5;
}

// Funções principais
function startGame() {
    if (gameOver) {
        resetGame();
    }
    
    // Define uma direção inicial para a cobrinha
    velocityX = 1; // Move para a direita inicialmente
    velocityY = 0;
    
    gameRunning = true;
    startButton.disabled = true;
    restartButton.disabled = false;
    gameLoop();
}

function resetGame() {
    // Reseta o estado do jogo
    gameRunning = false;
    gameOver = false;
    score = 0;
    scoreElement.textContent = score;
    
    // Reseta a cobrinha
    snake = [];
    snakeLength = 5;
    headX = 10;
    headY = 10;
    // Reseta a velocidade
    velocityX = 0;
    velocityY = 0;
    
    // Gera nova comida
    placeFood();
    
    // Reseta botões
    startButton.disabled = false;
    restartButton.disabled = false;
    
    // Desenha o estado inicial
    drawGame();
}

function gameLoop() {
    if (!gameRunning) return;
    
    setTimeout(() => {
        if (gameOver) {
            return;
        }
        
        clearCanvas();
        moveSnake();
        checkCollision();
        drawFood();
        drawSnake();
        
        gameLoop();
    }, 1000 / speed);
}

function clearCanvas() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = snakeColor;
    
    // Desenha cada segmento da cobrinha
    for (let i = 0; i < snake.length; i++) {
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 2, gridSize - 2);
    }
    
    // Adiciona a cabeça atual à cobrinha
    snake.push({ x: headX, y: headY });
    
    // Remove segmentos extras se a cobrinha estiver maior que o comprimento definido
    while (snake.length > snakeLength) {
        snake.shift();
    }
}

function drawFood() {
    ctx.fillStyle = foodColor;
    ctx.fillRect(foodX * gridSize, foodY * gridSize, gridSize - 2, gridSize - 2);
}

function moveSnake() {
    headX += velocityX;
    headY += velocityY;
}

function changeDirection(event) {
    // Impede que a direção seja alterada se o jogo estiver em game over
    if (gameOver) return;
    
    // Teclas de seta
    switch(event.key) {
        case 'ArrowUp':
            // Impede que a cobrinha volte diretamente para baixo
            if (velocityY !== 1) {
                velocityX = 0;
                velocityY = -1;
                
                // Inicia o jogo se uma tecla for pressionada e o jogo não estiver em execução
                if (!gameRunning && !gameOver) {
                    startGame();
                }
            }
            break;
        case 'ArrowDown':
            // Impede que a cobrinha volte diretamente para cima
            if (velocityY !== -1) {
                velocityX = 0;
                velocityY = 1;
                
                // Inicia o jogo se uma tecla for pressionada e o jogo não estiver em execução
                if (!gameRunning && !gameOver) {
                    startGame();
                }
            }
            break;
        case 'ArrowLeft':
            // Impede que a cobrinha volte diretamente para a direita
            if (velocityX !== 1) {
                velocityX = -1;
                velocityY = 0;
                
                // Inicia o jogo se uma tecla for pressionada e o jogo não estiver em execução
                if (!gameRunning && !gameOver) {
                    startGame();
                }
            }
            break;
        case 'ArrowRight':
            // Impede que a cobrinha volte diretamente para a esquerda
            if (velocityX !== -1) {
                velocityX = 1;
                velocityY = 0;
                
                // Inicia o jogo se uma tecla for pressionada e o jogo não estiver em execução
                if (!gameRunning && !gameOver) {
                    startGame();
                }
            }
            break;
    }
}

function checkCollision() {
    // Verifica colisão com as paredes
    if (headX < 0 || headX >= tileCount || headY < 0 || headY >= tileCount) {
        gameOver = true;
        gameRunning = false;
        startButton.disabled = false;
        restartButton.disabled = false;
        
        // Reproduz o som de game over
        if (gameOverSound) {
            gameOverSound.play();
        }
        
        return;
    }
    
    // Verifica colisão com o próprio corpo
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === headX && snake[i].y === headY) {
            gameOver = true;
            gameRunning = false;
            startButton.disabled = false;
            restartButton.disabled = false;
            
            // Reproduz o som de game over
            if (gameOverSound) {
                gameOverSound.play();
            }
            
            return;
        }
    }
    
    // Verifica colisão com a comida
    if (headX === foodX && headY === foodY) {
        // Aumenta o tamanho da cobrinha
        snakeLength++;
        
        // Atualiza a pontuação
        score += 10;
        scoreElement.textContent = score;
        
        // Aumenta a velocidade a cada 5 pontos
        if (score % 50 === 0) {
            speed += 1;
        }
        
        // Gera nova comida
        placeFood();
    }
}

function placeFood() {
    // Gera posição aleatória para a comida
    foodX = Math.floor(Math.random() * tileCount);
    foodY = Math.floor(Math.random() * tileCount);
    
    // Verifica se a comida não foi gerada sobre a cobrinha
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === foodX && snake[i].y === foodY) {
            // Se a comida foi gerada sobre a cobrinha, gera novamente
            placeFood();
            return;
        }
    }
}

function drawGame() {
    clearCanvas();
    
    if (gameOver) {
        // Atualiza o contador de piscagem
        gameOverBlinkCounter++;
        if (gameOverBlinkCounter > gameOverBlinkRate * 2) {
            gameOverBlinkCounter = 0;
        }
        
        // Desenha um fundo semi-transparente para a mensagem de game over
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(canvas.width / 4, canvas.height / 4, canvas.width / 2, canvas.height / 2);
        
        // Desenha borda para o fundo
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 5;
        ctx.strokeRect(canvas.width / 4, canvas.height / 4, canvas.width / 2, canvas.height / 2);
        
        // Desenha mensagem de game over
        // Faz o texto "Você Perdeu!" piscar
        if (gameOverBlinkCounter <= gameOverBlinkRate) {
            ctx.fillStyle = 'red';
        } else {
            ctx.fillStyle = 'white';
        }
        
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Você Perdeu!', canvas.width / 2, canvas.height / 2 - 30);
        
        // Resto do texto sempre em branco
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText(`Pontuação: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
        ctx.font = '18px Arial';
        ctx.fillText('Tente novamente! Clique em "Reiniciar"', canvas.width / 2, canvas.height / 2 + 60);
        
        // Continua atualizando a tela para a animação de piscar
        if (gameOver) {
            requestAnimationFrame(drawGame);
        }
        
        return;
    }
    
    // Mostra instruções se o jogo estiver parado
    if (!gameRunning) {
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Clique em "Iniciar" para começar o jogo', canvas.width / 2, canvas.height / 2);
        ctx.font = '16px Arial';
        ctx.fillText('Use as setas para controlar a cobrinha', canvas.width / 2, canvas.height / 2 + 30);
    }
    
    drawFood();
    drawSnake();
}