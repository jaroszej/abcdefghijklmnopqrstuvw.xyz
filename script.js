let canvas, ctx, spriteY, spriteVelocity, gravity, isGameRunning, obstacles, score;
let startButton, instructionsText, scoreText, finalScoreText, countdownText;
const spriteHeight = 20;
const spriteWidth = 20;
const spriteJumpHeight = 60;
const obstacleSpacing = 240;
const obstacleWidth = 34;
const obstacleSpeed = 2.15;

const minGapSize = 0.92 * spriteJumpHeight;
const maxGapSize = 1.58 * spriteJumpHeight;
const topPipeMargin = 2 * spriteHeight;
const bottomPipeMargin = 2 * spriteHeight;

function randomColor() {
    return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
}

function adjustCanvasBackground(color) {
    const values = color.match(/\d+/g).map(Number);
    const brightness = (values[0] + values[1] + values[2]) / 3;
    return brightness > 128
        ? `rgb(${values[0] - 30}, ${values[1] - 30}, ${values[2] - 30})`
        : `rgb(${values[0] + 30}, ${values[1] + 30}, ${values[2] + 30})`;
}

function applyRandomStyle() {
    const body = document.body;
    const centerText = document.querySelector("a");
    const instructions = document.getElementById("instructions");
    const score = document.getElementById("score");
    const finalScore = document.getElementById("final-score");
    const startButton = document.getElementById("start-button");

    const bgColor = randomColor();
    const textColor = randomColor();
    const shadowColor = randomColor();

    body.style.backgroundColor = bgColor;
    centerText.style.color = textColor;
    centerText.style.textShadow = `2px 2px ${shadowColor}`;
    instructions.style.color = textColor;
    instructions.style.textShadow = `1px 1px ${shadowColor}`;
    score.style.color = textColor;
    score.style.textShadow = `1px 1px ${shadowColor}`;
    finalScore.style.color = textColor;
    finalScore.style.textShadow = `2px 2px ${shadowColor}`;
    startButton.style.color = textColor;
    startButton.style.textShadow = `1px 1px ${shadowColor}`;
    startButton.style.borderColor = textColor;

    const gradient = createDynamicGradient(bgColor);
    canvas.style.background = gradient;
}

function createDynamicGradient(color) {
    const values = color.match(/\d+/g).map(Number);
    const brightness = (values[0] + values[1] + values[2]) / 3;

    let lighterAdjustment, darkerAdjustment;

    if (brightness > 128) {
        lighterAdjustment = -10;
        darkerAdjustment = -30;
    } else {
        lighterAdjustment = 10;
        darkerAdjustment = 30;
    }

    const gradientTop = adjustCanvasBackground(color, lighterAdjustment);
    const gradientBottom = adjustCanvasBackground(color, darkerAdjustment);

    return `linear-gradient(to bottom, ${gradientTop} 0%, ${gradientBottom} 100%)`;
}


function adjustCanvasBackground(color, adjustment) {
    const values = color.match(/\d+/g).map(Number);
    const adjustedValues = values.map((v) => Math.min(255, Math.max(0, v + adjustment)));
    return `rgba(${adjustedValues.join(",")}, 0.95)`;
}

function startGame() {
    spriteY = canvas.height / 2.5;
    spriteVelocity = 0;
    gravity = 0.18;
    isGameRunning = false;
    obstacles = [];
    for (let i = 0; i < 50; i++) {
        obstacles.push(generateObstacle(canvas.width + i * obstacleSpacing));
    }
    score = 0;

    finalScoreText.style.visibility = "hidden";
    scoreText.textContent = `Score: ${score}`;
    scoreText.style.display = "block";
    startButton.disabled = true;

    startCountdown(3);
}

function startCountdown(seconds) {
    countdownText.style.display = "block";
    const countdownInterval = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPreview();
        countdownText.textContent = seconds;
        seconds--;
        if (seconds < 0) {
            clearInterval(countdownInterval);
            countdownText.style.display = "none";
            isGameRunning = true;
            requestAnimationFrame(gameLoop);
        }
    }, 1000);
}

function drawPreview() {
    ctx.fillStyle = "#fff";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sprite styling
    const spriteGradient = ctx.createLinearGradient(50, spriteY, 50 + spriteWidth, spriteY + spriteHeight);
    spriteGradient.addColorStop(0, "#a36dd9"); // Light purple
    spriteGradient.addColorStop(1, "#6c2c9c"); // Dark purple
    ctx.fillStyle = spriteGradient;
    ctx.fillRect(50, spriteY, spriteWidth, spriteHeight);

    ctx.strokeStyle = "#502076"; // Outline for sprite
    ctx.strokeRect(50, spriteY, spriteWidth, spriteHeight);

    // Obstacle styling
    obstacles.forEach((obstacle) => {
        const obstacleGradient = ctx.createLinearGradient(
            obstacle.x,
            0,
            obstacle.x + obstacleWidth,
            canvas.height
        );
        obstacleGradient.addColorStop(0, "#e27d60"); // Light coral
        obstacleGradient.addColorStop(1, "#c6412c"); // Dark coral

        // Top obstacle
        ctx.fillStyle = obstacleGradient;
        ctx.fillRect(obstacle.x, 0, obstacleWidth, obstacle.gapY - obstacle.obstacleGap);

        ctx.strokeStyle = "#aa3f2d"; // Outline for obstacles
        ctx.strokeRect(obstacle.x, 0, obstacleWidth, obstacle.gapY - obstacle.obstacleGap);

        // Bottom obstacle
        ctx.fillRect(
            obstacle.x,
            obstacle.gapY + obstacle.obstacleGap,
            obstacleWidth,
            canvas.height - obstacle.gapY - obstacle.obstacleGap
        );

        ctx.strokeRect(
            obstacle.x,
            obstacle.gapY + obstacle.obstacleGap,
            obstacleWidth,
            canvas.height - obstacle.gapY - obstacle.obstacleGap
        );
    });
}


function generateObstacle(xPosition) {
    const obstacleGap = Math.random() * (maxGapSize - minGapSize) + minGapSize;
    const maxGapStart = canvas.height - obstacleGap - bottomPipeMargin;
    const gapY = Math.random() * (maxGapStart - topPipeMargin) + topPipeMargin;
    return { x: xPosition, gapY, obstacleGap };
}

function gameLoop() {
    if (!isGameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sprite
    const spriteGradient = ctx.createLinearGradient(50, spriteY, 50 + spriteWidth, spriteY + spriteHeight);
    spriteGradient.addColorStop(0, "#a36dd9"); // Light purple
    spriteGradient.addColorStop(1, "#6c2c9c"); // Dark purple
    ctx.fillStyle = spriteGradient;
    ctx.fillRect(50, spriteY, spriteWidth, spriteHeight);

    ctx.strokeStyle = "#502076"; // Outline
    ctx.strokeRect(50, spriteY, spriteWidth, spriteHeight);

    spriteVelocity += gravity;
    spriteY += spriteVelocity;

    if (spriteY > canvas.height || spriteY < 0) {
        endGame();
        return;
    }

    // Obstacle
    obstacles.forEach((obstacle, index) => {
        const obstacleGradient = ctx.createLinearGradient(
            obstacle.x,
            0,
            obstacle.x + obstacleWidth,
            canvas.height
        );
        obstacleGradient.addColorStop(0, "#e27d60"); // Light coral
        obstacleGradient.addColorStop(1, "#c6412c"); // Dark coral

        // Top
        ctx.fillStyle = obstacleGradient;
        ctx.fillRect(obstacle.x, 0, obstacleWidth, obstacle.gapY - obstacle.obstacleGap);

        ctx.strokeStyle = "#aa3f2d"; // Outline
        ctx.strokeRect(obstacle.x, 0, obstacleWidth, obstacle.gapY - obstacle.obstacleGap);

        // Bottom
        ctx.fillRect(
            obstacle.x,
            obstacle.gapY + obstacle.obstacleGap,
            obstacleWidth,
            canvas.height - obstacle.gapY - obstacle.obstacleGap
        );

        ctx.strokeRect(
            obstacle.x,
            obstacle.gapY + obstacle.obstacleGap,
            obstacleWidth,
            canvas.height - obstacle.gapY - obstacle.obstacleGap
        );

        obstacle.x -= obstacleSpeed;

        if (obstacle.x + obstacleWidth < 0) {
            obstacles[index] = generateObstacle(canvas.width + obstacleSpacing * (obstacles.length - 1));
            score++;
            scoreText.textContent = `Score: ${score}`;
        }

        if (
            50 + spriteWidth > obstacle.x &&
            50 < obstacle.x + obstacleWidth &&
            (spriteY < obstacle.gapY - obstacle.obstacleGap || spriteY + spriteHeight > obstacle.gapY + obstacle.obstacleGap)
        ) {
            endGame();
        }
    });

    requestAnimationFrame(gameLoop);
}

function flap() {
    if (isGameRunning) spriteVelocity = -spriteJumpHeight / 10;
}

function endGame() {
    isGameRunning = false;
    finalScoreText.textContent = `Final Score: ${score}`;
    finalScoreText.style.visibility = "visible";
    startButton.disabled = false;
}

document.addEventListener("DOMContentLoaded", () => {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    startButton = document.getElementById("start-button");
    instructionsText = document.getElementById("instructions");
    scoreText = document.getElementById("score");
    finalScoreText = document.getElementById("final-score");
    countdownText = document.getElementById("countdown");

    applyRandomStyle();

    document.addEventListener("keydown", (event) => {
        if (event.code === "Space" && isGameRunning) flap();
    });
    document.addEventListener("click", () => {
        if (isGameRunning) flap();
    });

    startButton.addEventListener("click", startGame);
});
