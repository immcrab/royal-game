// Simple WebRTC P2P system
let peers = {};
let localConnection;
let dataChannels = {};
let roomCode;
let localUsername = "Player"; // Default username

// *** PLACEHOLDER FOR ACTUAL SIGNALING SERVER (e.g., Cloudflare Worker with WebSockets) ***
const signaling = {
    // In a real app, this would be a WebSocket connection to the server
    send: (msg) => {
        // Log the message that would be sent to the signaling server
        console.log(`[SIGNALING] Sending to room ${roomCode}:`, msg);
        // NOTE: A functional version requires a real WebSocket server
    },
    // This is the function that the signaling server would call when a message arrives
    onMessage: (message) => {
        // Handle incoming signaling messages (SDP, ICE)
        handleSignalingMessage(message);
    }
};

// --- WebRTC Setup ---

function createPeerConnection(isInitiator, remoteId) {
    const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
        if (event.candidate) {
            signaling.send({
                type: 'candidate',
                candidate: event.candidate,
                to: remoteId
            });
        }
    };

    pc.onnegotiationneeded = async () => {
        if (isInitiator) {
            try {
                await pc.setLocalDescription(await pc.createOffer());
                signaling.send({
                    type: 'offer',
                    sdp: pc.localDescription,
                    to: remoteId
                });
            } catch (error) {
                console.error("Error creating offer:", error);
            }
        }
    };

    pc.ondatachannel = (event) => {
        console.log("Remote data channel received:", event.channel.label);
        setupDataChannel(event.channel, remoteId);
    };

    return pc;
}

function setupDataChannel(channel, remoteId) {
    dataChannels[remoteId] = channel;

    channel.onopen = () => {
        console.log(`Data Channel to ${remoteId} opened!`);
        // Send initial connection message including local username
        channel.send(JSON.stringify({ type: 'init', username: localUsername }));
    };

    channel.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'game_state') {
                updateRemotePlayer(remoteId, data.state);
            } else if (data.type === 'init') {
                setRemoteUsername(remoteId, data.username);
            }
        } catch (e) {
            console.error("Error parsing data channel message:", e);
        }
    };

    channel.onclose = () => {
        console.log(`Data Channel to ${remoteId} closed.`);
        removeRemotePlayer(remoteId);
    };
}

// --- Signaling Handlers ---

async function handleSignalingMessage(message) {
    const peerId = message.from || 'default_peer'; // Use 'from' or a default ID

    if (!peers[peerId]) {
        peers[peerId] = createPeerConnection(false, peerId); // Not initiator
    }

    const pc = peers[peerId];

    try {
        if (message.type === 'offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
            await pc.setLocalDescription(await pc.createAnswer());
            signaling.send({
                type: 'answer',
                sdp: pc.localDescription,
                to: peerId
            });
        } else if (message.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
        } else if (message.type === 'candidate') {
            await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
    } catch (error) {
        console.error("Error handling signaling message:", error);
    }
}

// --- Public Room Functions ---

async function createRoom() {
    localUsername = document.getElementById("username").value || "Player";
    roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    alert("Room created: " + roomCode + ". Send this code to a friend.");

    // In a real system: signaling.send({type: 'create', room: roomCode, username: localUsername})
    // For this demo, we'll simulate the "other peer is ready" event immediately to test the connection.
    // In a real P2P system, the server would notify the initiator (creator) when another peer joins.
    
    // Simulate a peer joining (for testing local connection flow)
    // You would normally need a real server to orchestrate this.
    const remoteId = 'remote_peer_1';
    peers[remoteId] = createPeerConnection(true, remoteId); // Initiator
    setupDataChannel(peers[remoteId].createDataChannel("game-data"), remoteId);
    
    // The loop in game.js will now start sending data if the channel opens
}

function joinRoom() {
    localUsername = document.getElementById("username").value || "Player";
    roomCode = document.getElementById("roomCode").value.toUpperCase();
    if (!roomCode) {
        alert("Please enter a room code.");
        return;
    }

    // In a real system: signaling.send({type: 'join', room: roomCode, username: localUsername})
    alert(`Attempting to join room: ${roomCode}. (Full signaling removed in this demo)`);

    // Simulate connection for the joining peer.
    // In a real P2P system, the server would notify the creator (peer 1) to send an offer.
    
    const remoteId = 'remote_peer_1'; // Assume the creator is the first remote peer
    peers[remoteId] = createPeerConnection(false, remoteId); // Not initiator
    
    // NOTE: The initiator (creator) will create the data channel and trigger the offer.
    // The joiner (not initiator) will receive the offer and the data channel later via pc.ondatachannel.
}

// --- Game Integration ---

// Function called by game.js to send state
function broadcastGameState(state) {
    const payload = JSON.stringify({ type: 'game_state', state });
    for (const id in dataChannels) {
        if (dataChannels[id].readyState === 'open') {
            dataChannels[id].send(payload);
        }
    }
}

// These functions will be defined in game.js and called here
let updateRemotePlayer = (id, state) => console.log('Game function updateRemotePlayer not defined yet.');
let removeRemotePlayer = (id) => console.log('Game function removeRemotePlayer not defined yet.');
let setRemoteUsername = (id, username) => console.log('Game function setRemoteUsername not defined yet.');