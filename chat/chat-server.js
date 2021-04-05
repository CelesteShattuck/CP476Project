// https://medium.com/@martin.sikora/node-js-websocket-simple-chat-tutorial-2def3a841b61

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

// Port where we'll run the websocket server
var webSocketsServerPort = 1337;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');
var url = require('url');

/**
 * Global variables
 */
// latest 100 messages

const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const urlMongo = 'mongodb://localhost:27017';
const ObjectID = mongo.ObjectID;

var history = [];
// list of currently connected clients (users)
var clients = [];

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function userSentMessage(message){ //Instead of inserting a message into history, we will put it into database
    //If i have time I will make this more efficent then closing and opening mongo many times
    MongoClient.connect(urlMongo, { useNewUrlParser: true }, (err, client) => {

        if (err) throw err;
    
        const db = client.db("chat");
        let doc = {_id: new ObjectID(), timeStamp: message.time, userSending: message.author, messageContents: message.text, colour: message.color };
        
        db.collection('chatData').insertOne(doc).then((doc) => {
            console.log('Chat Message inserted')
            console.log(doc);
        }).catch((err) => {
    
            console.log(err);
        }).finally(() => {
    
            client.close();
        });
    });

}
function userJoined(){ //When a user joins, instead of drawing 100 messages from history, we will take them from the database
    //We want to mimic the chat history feature, and use the messages in the database to feed into the chatbox
    MongoClient.connect(urlMongo, { useNewUrlParser: true }, (err, client) => {

        if (err) throw err;
    
        const db = client.db("chat");
        db.collection('chatData').toArray().then((docs) => {

            //console.log(docs); //Now through this all into the chatbox

            connection.sendUTF(JSON.stringify({ type: 'history', data: docs }));
    
        }).catch((err) => {
    
            console.log(err);
        }).finally(() => {
    
            client.close();
        });
    });
}

// Array with some colors
var colors = ['red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange'];
// ... in random order
colors.sort(function (a, b) { return Math.random() > 0.5; });

/**
 * HTTP server
 */
var server = http.createServer(function (req, res) {
    var q = url.parse(req.url, true);
    console.log(q.pathname);
    var filename = "." + q.pathname;
    fs.readFile(filename, function (err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end("404 Not Found");
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
    });
});
server.listen(webSocketsServerPort, function () {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});



// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function (request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin);
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;
    var userName = false;
    var userColor = false;

    console.log((new Date()) + ' Connection accepted.');

    // send back chat history  REPLACE WITH MONGO
    // if (history.length > 0) {
    //     connection.sendUTF(JSON.stringify({ type: 'history', data: history }));
    // }
    userJoined()

    // user sent some message
    connection.on('message', function (message) {
        if (message.type === 'utf8') { // accept only text
            if (userName === false) { // first message sent by user is their name
                // remember user name
                userName = htmlEntities(message.utf8Data);
                // get random color and send it back to the user
                userColor = colors.shift();
                connection.sendUTF(JSON.stringify({ type: 'color', data: userColor }));
                console.log((new Date()) + ' User is known as: ' + userName
                    + ' with ' + userColor + ' color.');

            } else { // log and broadcast the message
                console.log((new Date()) + ' Received Message from '
                    + userName + ': ' + message.utf8Data);

                // we want to keep history of all sent messages
                var obj = {
                    time: (new Date()).getTime(),
                    text: htmlEntities(message.utf8Data),
                    author: userName,
                    color: userColor
                };
                userSentMessage(obj)
                // history.push(obj);
                // history = history.slice(-100);

                // broadcast message to all connected clients
                var json = JSON.stringify({ type: 'message', data: obj });
                for (var i = 0; i < clients.length; i++) {
                    clients[i].sendUTF(json);
                }
            }
        }
    });

    // user disconnected
    connection.on('close', function (connection) {
        if (userName !== false && userColor !== false) {
            console.log((new Date()) + " Peer "
                + connection.remoteAddress + " disconnected.");
            // remove user from the list of connected clients
            clients.splice(index, 1);
            // push back user's color to be reused by another user
            colors.push(userColor);
        }
    });

});
