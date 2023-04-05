const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3001;
var http = require('http').createServer(app);
const io = require('socket.io')(http, {
    pingTimeout: 10000,
    pingInterval: 30000
});
//var io = require('engine.io)(http);

app.use(express.static('src'));
app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');





let rooms = [];
let users = [];


http.listen(port , () => {
    console.log("HTTP listening on port " + port + ".");
});

io.on('connection', (socket) => {
    let p;
    let r;

    socket.on('disconnect', () => {
        if (p && p.host) {
            io.to(p.roomId).emit("host-leave");
            rooms.splice(rooms.findIndex(e => e.id == p.roomId), 1);
        }
    });

    socket.on('user-reconnect', (id) => {
        let i = users.findIndex(e => e.id == id);
        if (i != -1) {
            let user = users[i];
            p = user.p;
            r = user.r;
            users.splice(i, 1);
            users.push({id: socket.id, p: p, r: r});
            socket.join(p.roomId);
        }
    });

    socket.on('start-host', (player) => {
        console.log("Starting hosting of room " + player.roomId);
        p = player;
        r = rooms[rooms.findIndex(e => e.id === player.roomId)];
        users.push({id: socket.id, p: p, r: r});
        r.players.push(player);
        r.buzzes = [];
        r.options = { mode: "default-mode", point: false };
        r.currentQuestion = -1;
        r.locked = false;
        r.slam = -1;
        r.scores = ["", "", ""];
        socket.join(p.roomId);
    });

    socket.on('add-player', (player) => {
        console.log("New player " + player.username + " in room " + player.roomId);
        p = player;
        r = rooms.find((e) => { return p.roomId === e.id; });
        users.push({id: socket.id, p: p, r: r});
        if (!r) {
            socket.disconnect();
        } else {
            if (r.players.findIndex(e => e.username == player.username) != -1) {
                r.players.splice(r.players.findIndex(e => e.username == player.username), 1);
                r.players.push(player);
            } else {
                r.players.push(player);
                r.scores[r.scores.findIndex(e => e == "")] = "0";
                io.to(p.roomId).emit("new-player", p);
            }
            socket.join(p.roomId);
            io.to(socket.id).emit("player-init", r, p);
        }
    });

    socket.on("unlock-buzz", () => {
        console.log("Unlocking room " + r.id);
        r.locked = false;
        if (p.host)
            io.to(p.roomId).emit("unlock-buzz");
    });

    socket.on("lock-buzz", () => {
        console.log("Locking room " + r.id);
        r.locked = true;
        if (p.host)
            io.to(p.roomId).emit("lock-buzz");
    });

    socket.on("clear-buzz", () => {
        console.log("Clearing room " + r.id);
        r.locked = false;
        r.buzzes = [];
        if (p.host)
            io.to(p.roomId).emit("clear-buzz");
    });

    socket.on("player-buzz", (player) => {
        console.log(player.username + " buzzed in room " + r.id);
        if (r.buzzes.findIndex(e => e.username == player.username) == -1) {
            r.buzzes.push(player);
            io.to(p.roomId).emit("player-buzz", r.buzzes);
        }
    });

    socket.on("question-change", (n) => {
        if (p.host) {
            r.currentQuestion = n;
            io.to(p.roomId).emit("question-change", n);
        }
    });

    socket.on("dom-grid-change", (dom) => {
        if (p.host) {
            r.dom = dom;
            io.to(p.roomId).emit("dom-grid-change", dom);
        }
    });

    socket.on("score-change", (scores) => {
        if (p.host) {
            r.scores = scores;
            io.to(p.roomId).emit("score-change", scores);
        }
    });

    socket.on("show-def", (def) => {
        if (p.host) {
            io.to(p.roomId).emit("show-def", def);
        }
    });

    socket.on("toggle-slam", (slam, n) => {
        if (p.host) {
            r.slam = slam ? n : -1;
            io.to(p.roomId).emit("toggle-slam", slam, n);
        }
    });

    socket.on("game-end", () => {
        if (p.host)
            io.to(p.roomId).emit("game-end", r);
    });

    socket.on("play-audio", () => {
        if (p.host)
            io.to(p.roomId).emit("play-audio");
    });

    socket.on("pause-audio", () => {
        if (p.host)
            io.to(p.roomId).emit("pause-audio");
    });

    socket.on("image-show", () => {
        if (p.host)
            io.to(p.roomId).emit("image-show");
    });

    socket.on("image-hide", () => {
        if (p.host)
            io.to(p.roomId).emit("image-hide");
    });

    socket.on("request-grid", () => {
        io.to(socket.id).emit("get-grid", { grid: r.grid });
    });
});

app.post('/create-room', (req, res) => {
    let n;
    while (!n || rooms.findIndex(e => e.id == n) != -1)
        n = Math.floor(Math.random() * 1000000);
    rooms.push({ id: n, players: [] });
    let room = n.toString();
    while (room.length < 6)
        room = "0" + room;
    res.redirect('/create/' + room);
});

app.get('/create/:room', (req, res) => {
    const room = req.params.room;
    res.render('create-room.ejs', {room: room});
});

app.post('/create/post-grid', function requestHandler(req, res) {
    const grid = req.body.gridInput;
    const room = req.body.roomCode;
    if (rooms.findIndex(e => e.id == parseInt(room)) != -1) {
        rooms[rooms.findIndex(e => e.id == parseInt(room))].grid = grid;
        res.redirect('/host/' + room);
    } else
        res.redirect('/');
});

app.get('/host/:room', (req, res) => {
    const room = req.params.room;
    if (rooms.findIndex(e => e.id == parseInt(room)) != -1)
        res.render('grille.ejs', { room: room, grid: rooms[rooms.findIndex(e => e.id == parseInt(room))].grid });
    else
        res.redirect('/');
});

app.post('/join-room', (req, res) => {
    res.redirect('/play/' + req.body.code);
});

app.get('/play/:room', (req, res) => {
    const room = req.params.room;
    if (rooms.findIndex(e => e.id == parseInt(room)) != -1)
        res.render('grille-candidat.ejs', { room: room, grid: rooms[rooms.findIndex(e => e.id == parseInt(room))].grid });
    else
        res.redirect('/');
});

app.post('/play/leave', (req, res) => {
    res.redirect('/');
});

app.post('/save-json', (req, res) => {
    res.redirect('/');
});

app.post('/create/create-grid', (req, res) => {
    res.redirect('/editor');
});

app.get('/editor', (req, res) => {
    res.render('editor.ejs');
});

//app.listen(port, () => console.log('App listening on port ' + port + '.'));