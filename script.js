// Variáveis para elementos do DOM
let canvas;
let ctx;
let startButton;
let recordsButton;
let closeRecordsButton;
let recordsModal;
let nameModal;
let playerNameInput;
let saveNameButton;
let scoreElement;
let finalScoreSpan;

// Recordes
const defaultHighScores = [100, 50, 20];
let highScores = JSON.parse(localStorage.getItem('snakeHighScores')) || defaultHighScores;
let highScoresNames = JSON.parse(localStorage.getItem('snakeHighScoresNames')) || ['', '', ''];

// Efeitos sonoros
let audioContext;

let bgMusicInterval;
const bgMusicNotes = [261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66]; // Escalas C major

// Configurações do jogo
const gridSize = 20;
let tileCount;
let speed = 7;

// Estado do jogo
let gameRunning = false;
let gameOver = false;
let score = 0;
let gameOverBlinkCounter = 0;
let gameOverBlinkRate = 10;
let titleGlowCounter = 0;

// Cobrinha
let snake = [];
let snakeLength = 3;

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
    recordsButton = document.getElementById('records-btn');
    closeRecordsButton = document.getElementById('close-records-btn');
    recordsModal = document.getElementById('records-modal');
    nameModal = document.getElementById('name-modal');
    playerNameInput = document.getElementById('player-name');
    saveNameButton = document.getElementById('save-name-btn');
    finalScoreSpan = document.getElementById('final-score');
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
    recordsButton.addEventListener('click', showRecords);
    closeRecordsButton.addEventListener('click', closeRecords);
    saveNameButton.addEventListener('click', savePlayerName);
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') savePlayerName();
    });
    document.addEventListener('keydown', changeDirection);
});

// Carrega os efeitos sonoros
function loadSounds() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function playEatSound() {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1108, audioContext.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playGameOverSound() {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    setTimeout(playDefeatMusic, 600);
}

function playDefeatMusic() {
    if (!audioContext) return;
    
    const sadNotes = [220, 261.63, 196, 220, 261.63, 246.94, 220, 196];
    
    sadNotes.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.3);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.3 + 0.25);
        
        oscillator.start(audioContext.currentTime + i * 0.3);
        oscillator.stop(audioContext.currentTime + i * 0.3 + 0.25);
    });
}

let currentNoteIndex = 0;

function playBgMusicNote() {
    if (!audioContext || !gameRunning || gameOver) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(bgMusicNotes[currentNoteIndex], audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
    
    currentNoteIndex = (currentNoteIndex + 1) % bgMusicNotes.length;
}

function startBgMusic() {
    stopBgMusic();
    bgMusicInterval = setInterval(playBgMusicNote, 200);
}

function stopBgMusic() {
    if (bgMusicInterval) {
        clearInterval(bgMusicInterval);
        bgMusicInterval = null;
    }
}

function saveHighScore() {
    const isNewRecord = score > highScores[highScores.length - 1] || highScores.length < 3;
    
    if (isNewRecord && score > 0) {
        highScores.push(score);
        highScores.sort((a, b) => b - a);
        highScores = highScores.slice(0, 3);
        
        while (highScoresNames.length < highScores.length) {
            highScoresNames.push('');
        }
        
        localStorage.setItem('snakeHighScores', JSON.stringify(highScores));
        localStorage.setItem('snakeHighScoresNames', JSON.stringify(highScoresNames));
        
        finalScoreSpan.textContent = score;
        nameModal.classList.add('show');
        playerNameInput.focus();
    }
}

function savePlayerName() {
    const name = playerNameInput.value.trim() || 'Anônimo';
    const rankIndex = highScores.indexOf(score);
    
    if (rankIndex !== -1) {
        highScoresNames[rankIndex] = name;
        localStorage.setItem('snakeHighScoresNames', JSON.stringify(highScoresNames));
    }
    
    nameModal.classList.remove('show');
    playerNameInput.value = '';
}

function showRecords() {
    const recordsList = document.getElementById('records-list');
    recordsList.innerHTML = '';
    const medals = ['🥇', '🥈', '🥉'];
    
    if (highScores.length === 0) {
        recordsList.innerHTML = '<li>Nenhum record ainda!</li>';
    } else {
        highScores.forEach((s, i) => {
            const name = highScoresNames[i] || '---';
            recordsList.innerHTML += `<li>${medals[i]} ${name} - ${s} pontos</li>`;
        });
    }
    
    recordsModal.classList.add('show');
}

function closeRecords() {
    recordsModal.classList.remove('show');
}

// Funções principais
let isIntro = false;

function startGame() {
    if (gameOver) {
        resetGame();
    }
    
    startButton.disabled = true;
    runIntro();
}

function runIntro() {
    isIntro = true;
    gameRunning = false;
    
    const introLength = 5;
    const startY = 10;
    const startX = -introLength;
    
    let introX = startX;
    
    function animateIntro() {
        if (!isIntro) return;
        
        clearCanvas();
        
        introX++;
        
        const currentSnake = [];
        for (let i = 0; i < introLength; i++) {
            currentSnake.push({ x: introX + i, y: startY });
        }
        
        ctx.fillStyle = snakeColor;
        currentSnake.forEach((seg, i) => {
            if (i < introLength - 1) {
                ctx.fillRect(seg.x * gridSize, seg.y * gridSize, gridSize - 2, gridSize - 2);
            }
        });
        
        ctx.fillStyle = snakeColor;
        ctx.fillRect((introX + introLength - 1) * gridSize, startY * gridSize, gridSize - 2, gridSize - 2);
        
        if (introX + introLength - 1 < 10) {
            setTimeout(animateIntro, 80);
        } else {
            showZoomedFace();
        }
    }
    
    function showZoomedFace() {
        let scale = 1;
        const headPosX = 10 * gridSize;
        const headPosY = 10 * gridSize;
        
        function animateFace() {
            if (!isIntro) return;
            
            clearCanvas();
            
            if (scale < 2) {
                scale += 0.05;
            }
            
            const size = gridSize * scale;
            const offset = (size - gridSize) / 2;
            
            ctx.fillStyle = snakeColor;
            ctx.fillRect(headPosX - offset, headPosY - offset, size - 2, size - 2);
            
            ctx.fillStyle = 'white';
            const eyeSize = size * 0.15;
            ctx.fillRect(headPosX + size * 0.2 - offset, headPosY + size * 0.2 - offset, eyeSize, eyeSize);
            ctx.fillRect(headPosX + size * 0.6 - offset, headPosY + size * 0.2 - offset, eyeSize, eyeSize);
            
            ctx.beginPath();
            ctx.arc(headPosX + size * 0.5 - offset, headPosY + size * 0.7 - offset, size * 0.2, 0, Math.PI);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            if (scale < 2) {
                setTimeout(animateFace, 30);
            } else {
                setTimeout(zoomOutFace, 800);
            }
        }
        
        animateFace();
    }
    
    function zoomOutFace() {
        let scale = 2;
        const headPosX = 10 * gridSize;
        const headPosY = 10 * gridSize;
        
        function animateZoomOut() {
            if (!isIntro) return;
            
            clearCanvas();
            
            scale -= 0.05;
            
            const size = gridSize * Math.max(scale, 1);
            const offset = (size - gridSize) / 2;
            
            ctx.fillStyle = snakeColor;
            ctx.fillRect(headPosX - offset, headPosY - offset, size - 2, size - 2);
            
            if (scale > 1) {
                ctx.fillStyle = 'white';
                const eyeSize = size * 0.15;
                ctx.fillRect(headPosX + size * 0.2 - offset, headPosY + size * 0.2 - offset, eyeSize, eyeSize);
                ctx.fillRect(headPosX + size * 0.6 - offset, headPosY + size * 0.2 - offset, eyeSize, eyeSize);
                
                ctx.beginPath();
                ctx.arc(headPosX + size * 0.5 - offset, headPosY + size * 0.7 - offset, size * 0.2, 0, Math.PI);
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                setTimeout(animateZoomOut, 30);
            } else {
                isIntro = false;
                startGameLoop();
            }
        }
        
        animateZoomOut();
    }
    
    animateIntro();
}

function startGameLoop() {
    velocityX = 1;
    velocityY = 0;
    gameRunning = true;
    startBgMusic();
    gameLoop();
}

function showGameOverZoom() {
    let scale = 1;
    const headPosX = headX * gridSize;
    const headPosY = headY * gridSize;
    
    function animateZoomIn() {
        clearCanvas();
        
        if (scale < 2) {
            scale += 0.05;
        }
        
        const size = gridSize * scale;
        const offset = (size - gridSize) / 2;
        
        ctx.fillStyle = snakeColor;
        ctx.fillRect(headPosX - offset, headPosY - offset, size - 2, size - 2);
        
        ctx.fillStyle = 'white';
        const eyeSize = size * 0.15;
        
        ctx.fillRect(headPosX + size * 0.2 - offset, headPosY + size * 0.2 - offset, eyeSize, eyeSize);
        ctx.fillRect(headPosX + size * 0.6 - offset, headPosY + size * 0.2 - offset, eyeSize, eyeSize);
        
        // Lágrimas
        ctx.fillStyle = '#4FC3F7';
        const tearSize = size * 0.08;
        ctx.fillRect(headPosX + size * 0.2 - offset, headPosY + size * 0.35 - offset, tearSize, tearSize);
        ctx.fillRect(headPosX + size * 0.6 - offset, headPosY + size * 0.35 - offset, tearSize, tearSize);
        
        // Boca chorando
        ctx.beginPath();
        ctx.arc(headPosX + size * 0.5 - offset, headPosY + size * 0.75 - offset, size * 0.15, 0, Math.PI, false);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        if (scale < 2) {
            requestAnimationFrame(animateZoomIn);
        } else {
            requestAnimationFrame(drawGame);
            
            setTimeout(() => {
                resetGame();
            }, 5000);
        }
    }
    
    animateZoomIn();
}

function resetGame() {
    // Reseta o estado do jogo
    isIntro = false;
    gameRunning = false;
    gameOver = false;
    score = 0;
    titleGlowCounter = 0;
    scoreElement.textContent = score;
    
    // Reseta a cobrinha
    snake = [];
    snakeLength = 3;
    headX = 10;
    headY = 10;
    // Reseta a velocidade
    velocityX = 0;
    velocityY = 0;
    
    // Gera nova comida
    placeFood();
    
    // Reseta botão
    startButton.disabled = false;
    
    // Desenha o estado inicial
    drawGame();
}

function gameLoop() {
    if (!gameRunning) return;
    
    setTimeout(() => {
        if (gameOver) {
            drawGame();
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
    
    if (snake.length === 0) {
        for (let i = 0; i < snakeLength; i++) {
            ctx.fillRect((headX - i) * gridSize, headY * gridSize, gridSize - 2, gridSize - 2);
        }
        snake.push({ x: headX, y: headY });
    } else {
        for (let i = 0; i < snake.length; i++) {
            ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 2, gridSize - 2);
        }
        
        snake.push({ x: headX, y: headY });
        
        while (snake.length > snakeLength) {
            snake.shift();
        }
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
        
        // Salva pontuação se for record
        saveHighScore();
        
        // Para a música de fundo
        stopBgMusic();
        
        // Reproduz o som de game over
        playGameOverSound();
        
        // Animation de game over
        setTimeout(showGameOverZoom, 600);
        
        return;
    }
    
    // Verifica colisão com o próprio corpo
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === headX && snake[i].y === headY) {
            gameOver = true;
            gameRunning = false;
            startButton.disabled = false;
            
            // Salva pontuação se for record
            saveHighScore();
            
            // Para a música de fundo
            stopBgMusic();
            
            // Reproduz o som de game over
            playGameOverSound();
            
            // Animation de game over
            setTimeout(showGameOverZoom, 600);
            
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
        
        // Som ao comer
        playEatSound();
        
        // Aumenta a velocidade a cada 5 pontos
        if (score % 50 === 0) {
            speed += 1;
        }
        
        // Gera nova comida
        placeFood();
    }
}

function placeFood() {
    let attempts = 0;
    const maxAttempts = tileCount * tileCount;
    
    function tryPlaceFood() {
        foodX = Math.floor(Math.random() * tileCount);
        foodY = Math.floor(Math.random() * tileCount);
        
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === foodX && snake[i].y === foodY) {
                if (attempts < maxAttempts) {
                    attempts++;
                    tryPlaceFood();
                    return;
                }
            }
        }
    }
    
    tryPlaceFood();
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
        
        // Desenha a carinha chorando
        const faceX = canvas.width / 2;
        const faceY = canvas.height / 2 + 90;
        const faceSize = 40;
        
        ctx.fillStyle = snakeColor;
        ctx.fillRect(faceX - faceSize / 2, faceY - faceSize / 2, faceSize, faceSize);
        
        // Olhos
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(faceX - 10, faceY - 5, 5, 0, Math.PI * 2);
        ctx.arc(faceX + 10, faceY - 5, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Lágrimas
        ctx.fillStyle = '#4FC3F7';
        ctx.beginPath();
        ctx.arc(faceX - 10, faceY + 8, 3, 0, Math.PI * 2);
        ctx.arc(faceX + 10, faceY + 8, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Boca invertida (para baixo)
        ctx.beginPath();
        ctx.arc(faceX, faceY + 20, 8, Math.PI, 0, false);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
        
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
        
        // Continua atualizando a tela para a animação de piscar
        if (gameOver) {
            requestAnimationFrame(drawGame);
        }
        
        return;
    }
    
    // Mostra instruções se o jogo estiver parado
    if (!gameRunning) {
        titleGlowCounter++;
        const glowIntensity = (Math.sin(titleGlowCounter / 10) + 1) / 2;
        const r = Math.floor(76 + 100 * glowIntensity);
        const g = Math.floor(175 + 80 * glowIntensity);
        const b = Math.floor(80);
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Jogo da Cobrinha', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText('Aperte Iniciar Jogo para começar', canvas.width / 2, canvas.height / 2 + 20);
        
        if (!isIntro) {
            requestAnimationFrame(() => drawGame());
        }
    } else {
        drawFood();
        drawSnake();
    }
}