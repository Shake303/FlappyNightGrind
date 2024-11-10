// Game Variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const SCREEN_WIDTH = 400;
const SCREEN_HEIGHT = 600;

const INITIAL_SPEED = 6;     // Set initial speed as a constant
const INITIAL_GRAVITY = 0.18; // Set initial gravity as a constant
const GAME_SPEED = 1.25;
const PIPE_GAP = 150;

let birdColor = "yellow";  // Default colors
let pipeColor = "green";

let birdSprite, pipeSpriteTop, pipeSpriteBottom, groundSprite;

let bird;
let pipes = [];
let ground;
let score = 0;
let gameRunning = false;
let inStartScreen = true;        // Tracks if we are on the start screen
let inGameOverScreen = false;    // Tracks if we are on the game over screen
let gameLoopId;                  // Variable to store the game loop ID

// Load images based on selected color
function loadSprites() {
    birdSprite = new Image();
    birdSprite.src = `assets/bird_${birdColor}.png`;

    pipeSpriteTop = new Image();
    pipeSpriteBottom = new Image();
    pipeSpriteTop.src = `assets/pipe_${pipeColor}.png`;
    pipeSpriteBottom.src = `assets/pipe_${pipeColor}.png`;
    
    // Load ground image
    groundSprite = new Image();
    groundSprite.src = `assets/ground.png`; // Make sure this file exists in your assets folder
}

// Bird class
class Bird {
    constructor() {
        this.width = 34;
        this.height = 24;
        this.x = SCREEN_WIDTH / 6;
        this.y = SCREEN_HEIGHT / 2;
        this.speed = 0; // Reset bird's speed on restart
    }

    draw() {
        ctx.drawImage(birdSprite, this.x, this.y, this.width, this.height);
    }

    update() {
        if (!inStartScreen && gameRunning) {  // Only update position if game is running
            this.speed += INITIAL_GRAVITY; // Use the initial gravity value
            this.y += this.speed;

            // Prevent bird from going off the top of the screen
            if (this.y < 0) this.y = 0;
        }
    }

    jump() {
        this.speed = -INITIAL_SPEED; // Use the initial speed value
    }
}

// Pipe class with bounding box
class Pipe {
    constructor(x, height, isTop) {
        this.width = 80;
        this.height = height;
        this.x = x;
        this.isTop = isTop;
    }

    draw() {
        if (this.isTop) {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.height / 2);
            ctx.scale(1, -1);
            ctx.drawImage(pipeSpriteTop, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        } else {
            ctx.drawImage(pipeSpriteBottom, this.x, SCREEN_HEIGHT - this.height, this.width, this.height);
        }
    }

    update() {
        this.x -= GAME_SPEED;
    }
}

// Ground class with scrolling effect
class Ground {
    constructor() {
        this.y = SCREEN_HEIGHT - 100;
        this.height = 100;
        this.width = SCREEN_WIDTH; // Ensure the ground spans the entire width

        // Start two ground segments for continuous scrolling
        this.x1 = 0;
        this.x2 = this.width;
    }

    draw() {
        // Draw two ground images side by side for scrolling effect
        ctx.drawImage(groundSprite, this.x1, this.y, this.width, this.height);
        ctx.drawImage(groundSprite, this.x2, this.y, this.width, this.height);
    }

    update() {
        // Move both ground segments to the left
        this.x1 -= GAME_SPEED;
        this.x2 -= GAME_SPEED;

        // Reset position when a ground segment moves off-screen
        if (this.x1 <= -this.width) {
            this.x1 = this.width;
        }
        if (this.x2 <= -this.width) {
            this.x2 = this.width;
        }
    }
}

// Initialize game objects for a fresh start
function init() {
    bird = new Bird();
    ground = new Ground();
    pipes = [];
    score = 0;
    gameRunning = false;
    inStartScreen = true;
    inGameOverScreen = false; // Reset Game Over screen flag

    addPipes();
    drawStartScreen(); // Show start screen on initialization
}

// Add pipes
function addPipes() {
    const pipeHeight = Math.floor(Math.random() * (SCREEN_HEIGHT - PIPE_GAP - 200)) + 100;
    pipes.push(new Pipe(SCREEN_WIDTH, pipeHeight, true)); // Top pipe
    pipes.push(new Pipe(SCREEN_WIDTH, SCREEN_HEIGHT - pipeHeight - PIPE_GAP, false)); // Bottom pipe
}

// Updated checkCollisions function with bounding box collision for pipes
function checkCollisions() {
    // Check if bird hits the ground
    if (bird.y + bird.height >= ground.y) {
        endGame();
        return;
    }

    // Check if bird collides with any pipe using bounding box collision
    for (const pipe of pipes) {
        const pipeTopY = pipe.isTop ? 0 : SCREEN_HEIGHT - pipe.height;

        if (
            bird.x < pipe.x + pipe.width &&
            bird.x + bird.width > pipe.x &&
            bird.y < pipeTopY + pipe.height &&
            bird.y + bird.height > pipeTopY
        ) {
            // Collision detected
            endGame();
            return;
        }
    }
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    bird.update();
    bird.draw();
    ground.update();
    ground.draw();

    if (!inStartScreen && gameRunning) {
        pipes.forEach(pipe => {
            pipe.update();
            pipe.draw();
        });

        if (pipes[0].x + pipes[0].width < 0) {
            pipes.splice(0, 2);
            addPipes();
            score++;
        }
        
        // Draw score during gameplay
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText(`Score: ${score}`, SCREEN_WIDTH / 2 - 50, 50);
        
        checkCollisions();
    } else if (inStartScreen) {
        drawStartScreen();
    }

    if (gameRunning) {
        gameLoopId = requestAnimationFrame(gameLoop);
    } else if (inGameOverScreen) {
        drawGameOverScreen();
    }
}

// Draw start screen with all game elements pre-rendered
function drawStartScreen() {
    // Draw background
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Draw initial pipes
    pipes.forEach(pipe => pipe.draw());

    // Draw ground and bird
    ground.draw();
    bird.draw();

    // Display "Press Space to Start" text
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("Flappy Bird", SCREEN_WIDTH / 2 - 90, SCREEN_HEIGHT / 4);
    ctx.font = "20px Arial";
    ctx.fillText("Press Space to Start", SCREEN_WIDTH / 2 - 90, SCREEN_HEIGHT / 3);
}

// Game over screen
function drawGameOverScreen() {
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over", SCREEN_WIDTH / 2 - 100, SCREEN_HEIGHT / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Press Space to Restart", SCREEN_WIDTH / 2 - 100, SCREEN_HEIGHT / 2 + 40);
}

// End game and show Game Over screen
function endGame() {
    gameRunning = false;
    inGameOverScreen = true; // Set flag for Game Over screen
    cancelAnimationFrame(gameLoopId); // Stop the game loop
}

// Event listener for controls
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        if (inStartScreen) {
            // Start the game when "Space" is pressed on start screen
            inStartScreen = false;
            gameRunning = true;
            bird.jump();  // Start the game with an initial jump
            gameLoop();
        } else if (inGameOverScreen) {
            // Reset the game and return to the start screen
            init();
        } else if (gameRunning) {
            // Make the bird jump while the game is running
            bird.jump();
        }
    }
});

// Start game based on selected colors
function startGame() {
    birdColor = document.getElementById("birdColor").value;
    pipeColor = document.getElementById("pipeColor").value;

    loadSprites();

    document.getElementById("selectionMenu").style.display = "none";
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;

    init(); // Initialize to show the start screen on game load
}

async function saveScore(playerName, score) {
    try {
        const response = await fetch('/save-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ playerName, score })
        });
        const data = await response.json();
        console.log(data.message);  // Confirm if the score was saved
    } catch (error) {
        console.error('Error saving score:', error);
    }
}