// game.js

let canvas, ctx;
let isGameRunning = false;
let gameState = {}; // Will hold the server-synced game state
let socket;

// Images for rock, paper, and scissors
const images = {};

// Load images for rock, paper, and scissors
function loadImages(callback) {
    const imgNames = ["rock", "paper", "scissors"];
    let loadedCount = 0;

    imgNames.forEach(name => {
        const img = new Image();
        img.src = `${name}.png`; // Ensure images are named rock.png, paper.png, scissors.png in the same folder
        img.onload = () => {
            images[name] = img;
            loadedCount++;
            if (loadedCount === imgNames.length) callback();
        };
    });
}

// Initialize WebSocket connection and canvas
function initialize() {
    canvas = document.getElementById('gc');
    ctx = canvas.getContext('2d');
    document.getElementById('startButton').addEventListener('click', startGame);
    loadImages(connectWebSocket); // Load images, then connect to WebSocket
}

// Start game and inform the server
function startGame() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'start' })); // Request server to start the game
    } else {
        console.log("WebSocket not open");
    }
}


// Connect to the WebSocket server
function connectWebSocket() {
    socket = new WebSocket('ws://localhost:8080/ws');

    socket.onopen = () => {
        console.log('Connected to the WebSocket server');
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'update') {
            gameState = data.state; // Update the local game state
            renderGame(); // Render the game with the updated state
        }
    };

    socket.onclose = () => {
        console.log('Disconnected from the WebSocket server');
    };
}

// Render the game based on the synchronized state
function renderGame() {
    const { balls, radius, centerX, centerY } = gameState;

    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw circular boundary
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();

    // Draw balls
    balls.forEach(ball => {
        const img = images[ball.type];
        if (img) {
            ctx.drawImage(img, ball.x - 20, ball.y - 20, 40, 40); // Adjust for ball size
        }
    });

    // Check if there's a winner
    if (gameState.winner) {
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText('Winner: ' + gameState.winner, 250, 500);
    }
}

window.onload = initialize;
