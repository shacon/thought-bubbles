import {globals} from "./globals.js";

var peerIdLinkContainer = document.getElementById("peer-id-link-container");
var status = document.getElementById("status");
var message = document.getElementById("message");
var sendMessageInput = document.getElementById("send-message-input");
var sendButton = document.getElementById("send-button");

const urlParams = new URLSearchParams(window.location.search);
const peerShareCode = urlParams.get('peerShareCode');

console.log('Receive Receiver Receiver Receiver');
console.log("peerShareCode", peerShareCode);


/**
 * Create the Peer object and set up callbacks
 */
export function initializePeer() {
    globals.peer = new Peer(null, {
        debug: 2
    });

    globals.peer.on('open', function (id) {
        if (peerShareCode !== null) {
            console.log('connecting w/ peerShareCode', peerShareCode)
            join()
        } else {
            peerIdLinkContainer.innerHTML = `<a href='http://localhost:8001/?peerShareCode=${globals.peer.id}'>link to share</a>`;
        }
    });

    globals.peer?.on('connection', (conn) => {
        globals.conn = conn;
        globals.conn.on('data', data => {
            // Handle incoming data; called continuously when data is received
            addMessage("Peer: " + data + " (from peer w/ peerShareCode in URL)");
        });
    });
};


function addMessage(msg) {
    message.innerHTML = "<br>  " + msg + message.innerHTML;
}

function join() {
    console.log('join peer to connect to', peerShareCode);
    globals.conn = globals.peer.connect(peerShareCode, {
        reliable: true
    });

    globals.conn.on('open', function () {
        status.innerHTML = "Connected to: " + globals.conn.peer;
    });


    globals.conn.on('data', function (data) {
        // Handle incoming data; called continuously when data is received
        addMessage("Peer: " + data + " (from peer who shared link)");
    });
};


sendButton.addEventListener('click', function () {
    if (globals.conn && globals.conn.open) {
        var msg = sendMessageInput.value;
        sendMessageInput.value = "";
        globals.conn.send(msg);
        addMessage("Self: " + msg);
    } else {
        console.log('Connection is closed send button');
    }
});


