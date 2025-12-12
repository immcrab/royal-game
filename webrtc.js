// Simple WebRTC P2P system
let peers = {};
let localConnection;
let dataChannels = {};

const signaling = {
    send: (room, msg) => {
        fetch(`https://postman-echo.com/post`, {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({room, msg})
        });
    }
};

async function createRoom() {
    const code = Math.random().toString(36).substring(2,8).toUpperCase();
    alert("Room created: " + code);
}

function joinRoom() {
    alert("This is a simplified demo. Full signaling removed.");
}