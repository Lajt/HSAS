var express = require('express');
var mongoose = require('mongoose');

//var app = express();
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.port || 9000;

mongoose.connect('mongodb://localhost/test');

var currentArena = 'arena1';
var currentCards = [];
var usersCount = 0;

var Arena = mongoose.model('Arena', {
	name: String,
	className: String,
	cards: [{ cardName: String, cardRace: String, cardMana: Number }]
});



//var kitty = new Cat({ name: 'Piotr', gatunek: 'wymarly' });
//var arenka = new Arena({ name: 'arena1', className: 'Warrior' });

//arenka.save(function(err){
//	if(err){
//		console.log('mial');
//	}
//});

//UpdateArena('Shaman');
io.on('connection', function(socket){
  	console.log('a user connected');
  	usersCount++;
	console.log(usersCount);  
	socket.broadcast.emit('online', {count: usersCount});
	socket.on('disconnect', function(socket){
		console.log('user disconnected');
		usersCount--;
		console.log(usersCount);
		
	});
});

app.use(express.static(__dirname + '/public'));

app.get('/', function(req,res){
	res.send('Hello World');
});

app.get('/test', function(req, res){
	SendChanges();
	res.send('OK');
});

app.get('/update/newarena', function(req, res){
	ArenaNew();
	res.send('arena2');
});

app.get('/update/hero/:id', function(req, res){
	UpdateClass(req.params.id);
});

app.get('/update/detected/:id', function(req, res){
	// detected cards just emit socket io info
});

app.get('/update/card/:id', function(req, res){
	UpdateCards(req.params.id);
	res.send('OK');
});

app.get('/arena/:id', function(req, res){
	Arena.find({ name: req.params.id }, function(err, data){
		if(err) return console.error(err);
		console.log(data);
		res.send(data);
	})
	//res.send('I gotya' + req.params.id);
});
http.listen(port);
//app.listen(port);
console.log('Listening on port ', port);

// generate random arena name
function ArenaNew(){
	currentArena = 'arena2';
}

function UpdateClass(klasa){
	Arena.findOne({ name: currentArena }, function(err, data){
		data.className = klasa;
		data.save();
	});
}

function UpdateCards(card){
	Arena.findOne({ name: currentArena }, function(err, data){
		var picked = { cardName: card, cardRace: 'Dragon', cardMana: 5 };
		data.cards.push(picked);
		data.save();
	});
}

function SendChanges(){
	Arena.findOne({ name: currentArena }, function(err, data){
		io.sockets.emit('update', 
		{ hero: data.className, cards: data.cards }
		);
	});
}

