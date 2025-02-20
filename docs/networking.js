import {globals} from "./globals.js";

var peerIdLinkContainer = document.getElementById("peer-id-link-container");
var status = document.getElementById("status");

const urlParams = new URLSearchParams(window.location.search);
const peerShareCode = urlParams.get('peerShareCode');

console.log('Receive Receiver Receiver Receiver');
console.log("peerShareCode", peerShareCode);


/**
 * Create the Peer object and set up callbacks
 */
export function initializePeer() {
    console.log("initializing Peer");
    globals.peer = new Peer(null, {
        debug: 2
    });

    globals.peer.on('open', function (id) {
        if (peerShareCode !== null) {
            console.log('connecting w/ peerShareCode', peerShareCode)
            join()
        } else {
            console.log('creating link to share')
            peerIdLinkContainer.innerHTML = `<a href='http://localhost:8004/?peerShareCode=${globals.peer.id}'>link to share</a>`;
        }
    });

    globals.peer?.on('connection', (conn) => {
        console.log("connection", conn)

        globals.conn = conn;
        globals.conn.on('data', data => {
            // Handle incoming data; called continuously when data is received
            console.log("data from (from peer w/ peerShareCode in URL)", data)
            globals.shared_bubble_text = JSON.parse(data)
        });
    });
}

function join() {
    console.log('join peer to connect to', peerShareCode);
    globals.conn = globals.peer.connect(peerShareCode, {
        reliable: true
    });

    globals.conn.on('open', function () {
        console.log("Connected to: " + globals.conn.peer);
    });


    globals.conn.on('data', function (data) {
        // Handle incoming data; called continuously when data is received
        console.log("data from peer in join", data)
        globals.shared_bubble_text = JSON.parse(data)
    });
};
