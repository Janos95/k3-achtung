// Achtung Die Kurve (Curve Fever) implementation in JavaScript

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Game variables
const players = [
    { x: 0, y: 0, angle: 0, color: 'red', trail: [], isDrawing: true },
    { x: 0, y: 0, angle: 0, color: 'blue', trail: [], isDrawing: true }
];
const speed = 1;
const turnSpeed = 0.05;
let gameLoop;

// Key states
const keys = {};

// Initialize game
function init() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    randomizePlayerPositions();
    gameLoop = setInterval(update, 1000 / 60); // 60 FPS
}

// Randomize player positions
function randomizePlayerPositions() {
    const margin = 100; // Margin from the borders
    players.forEach(player => {
        player.x = Math.random() * (canvas.width - 2 * margin) + margin;
        player.y = Math.random() * (canvas.height - 2 * margin) + margin;
        player.angle = Math.random() * 2 * Math.PI; // Random angle between 0 and 2π
    });
}

// Handle key press
function handleKeyDown(e) {
    keys[e.key] = true;
}

// Handle key release
function handleKeyUp(e) {
    keys[e.key] = false;
}

// Update game state
function update() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    players.forEach((player, index) => {
        // Move player
        player.x += Math.cos(player.angle) * speed;
        player.y += Math.sin(player.angle) * speed;

        // Turn player
        if (index === 0) {
            if (keys['a']) player.angle -= turnSpeed;
            if (keys['d']) player.angle += turnSpeed;
        } else {
            if (keys['ArrowLeft']) player.angle -= turnSpeed;
            if (keys['ArrowRight']) player.angle += turnSpeed;
        }

        // Randomly create small holes in the trail
        if (Math.random() < 0.001) { // 0.1% chance each frame to start a hole
            player.isDrawing = false;
            const holeSize = Math.floor(Math.random() * 100) + 200; // Random hole size between 200 and 300
            setTimeout(() => {
                player.isDrawing = true;
            }, holeSize); // Hole duration: random between 300ms and 600ms
        }

        // Draw player's trail
        ctx.fillStyle = player.color;
        player.trail.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw player's head
        ctx.beginPath();
        ctx.arc(player.x, player.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Add current position to trail only if drawing
        if (player.isDrawing) {
            player.trail.push({x: player.x, y: player.y});
        }

        // Check for collision with own trail (excluding the neck)
        const neckLength = 10; // Adjust this value to change the "safe" area behind the player
        if (isCollisionWithSelf(player, neckLength)) {
            clearInterval(gameLoop);
            alert(`Player ${index + 1} crashed into their own trail!`);
        }

        // Check collision with opponent's trail
        const opponent = players[(index + 1) % 2];
        if (isCollisionWithOpponent(player, opponent) || 
            player.x < 0 || player.x > canvas.width || player.y < 0 || player.y > canvas.height) {
            clearInterval(gameLoop);
            alert(`${player.color} crashed! Reload the page to play again.`);
        }
    });
}

// Check if collision is with the opponent's trail
function isCollisionWithOpponent(player, opponent) {
    return isCollisionWithPoints(player, opponent.trail);
}

// Check if collision is with own trail
function isCollisionWithSelf(player, neckLength) {
    return isCollisionWithPoints(player, player.trail.slice(0, -neckLength));
}

function isCollisionWithPoints(player, points) {
    return points.some(collidesWith(player));
}

function collidesWith(player) {
    return (point) => {
        const distance = Math.sqrt(Math.pow(point.x - player.x, 2) + Math.pow(point.y - player.y, 2));
        return distance < 5; // Adjust this value to change collision sensitivity
    }
}

// Start the game
init();
