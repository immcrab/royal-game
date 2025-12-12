const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 500;

// Local Player State
let player = {
    x: 400,
    y: 250,
    speed: 3,
    color: "cyan",
    username: document.getElementById("username").value || "Player"
};

// Remote Players State
let remotePlayers = {};

// --- WebRTC Hooks from webrtc.js ---

// Function to update a remote player's state (called from webrtc.js)
updateRemotePlayer = (id, state) => {
    if (remotePlayers[id]) {
        remotePlayers[id].x = state.x;
        remotePlayers[id].y = state.y;
    } else {
        // Add a new remote player with a random color
        remotePlayers[id] = {
            ...state,
            color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
        };
    }
};

// Function to set the username of a remote player (called from webrtc.js)
setRemoteUsername = (id, username) => {
    if (!remotePlayers[id]) {
        remotePlayers[id] = { x:0, y:0, color: 'white' }; // Placeholder if state hasn't arrived
    }
    remotePlayers[id].username = username;
};

// Function to remove a remote player (called from webrtc.js)
removeRemotePlayer = (id) => {
    delete remotePlayers[id];
};


// --- Input and Game Loop ---

document.addEventListener("keydown", e => {
    let moved = false;
    if (e.key === "w") { player.y -= player.speed; moved = true; }
    if (e.key === "s") { player.y += player.speed; moved = true; }
    if (e.key === "a") { player.x -= player.speed; moved = true; }
    if (e.key === "d") { player.x += player.speed; moved = true; }

    // Broadcast state if the player moved
    if (moved) {
        broadcastGameState({ x: player.x, y: player.y });
    }
});


function drawPlayer(p, isLocal = false) {
    const size = 20;

    // Draw Username
    if (p.username) {
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(p.username, p.x, p.y - size / 2 - 5);
    }

    // Draw Player Square
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
    
    // Highlight local player
    if (isLocal) {
        ctx.strokeStyle = 'gold';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x - size / 2, p.y - size / 2, size, size);
    }
}


function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Local Player
    player.username = document.getElementById("username").value || "Player"; // Update username in case it was changed
    drawPlayer(player, true);

    // Draw Remote Players
    for (const id in remotePlayers) {
        drawPlayer(remotePlayers[id]);
    }

    requestAnimationFrame(loop);
}

loop();