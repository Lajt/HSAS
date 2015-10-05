var express = require('express');
var mongoose = require('mongoose');
var fs = require('fs');
var unirest = require('unirest');

//var app = express();
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var lajt = require('./lib/lajt.js');

var port = process.env.port || 9000;

mongoose.connect('mongodb://localhost/test');

var currentArena = '';
var currentCards = [];
var tempCards = [];
var usersCount = 0;

var apiKey = "";

var Arena = mongoose.model('Arena', {
	name: String,
	className: String,
	cards: [{ cardName: String, cardRace: String, cardMana: Number }]
});

fs.readFile(__dirname+'/api.key', 'utf8', function(err, data){
	if(err){
		return console.log(err+"\nMake sure you've creatued api.key file with your mashape-key");
	}
	apiKey = data.trim();
	console.log(apiKey);
});

//var kitty = new Cat({ name: 'Piotr', gatunek: 'wymarly' });
console.log(lajt());


//UpdateArena('Shaman');
io.on('connection', function(socket){
  	console.log('a user connected');
  	usersCount++;
	console.log(usersCount);
	SendChanges(); // - send changes to all
	socket.broadcast.emit('online', {count: usersCount});
	socket.on('disconnect', function(socket){
		console.log('user disconnected');
		usersCount--;
		console.log(usersCount);
		
	});
});

io.on('testt', function(socket){
	console.log('test');
	Arena.findOne({ name: currentArena }, function(err, data){
		if(err){
			return console.log(err);
		}
		if(data===null){
			return;
		}
		socket.broadcast.emit('update', 
		{ hero: data.className, cards: data.cards }
		);
	});
});

app.use(express.static(__dirname + '/public'));

app.get('/', function(req,res){
	res.send('Hello World');
});

app.get('/test', function(req, res){
	SendChanges();
	//testCard("Imp", function(err, data){
	//	console.log(data);
	//});
	res.send(200, 'OK');
});

app.get('/update/newarena', function(req, res){
	ArenaNew();
	console.log('UPDATE: New arena started: '+currentArena);
	res.send(currentArena);
});

app.get('/update/hero/:id', function(req, res){
	UpdateClass(req.params.id);
	console.log('UPDATE: Hero Picked: '+req.params.id);
	res.send('OK');
});

app.get('/update/detected/:id1/:id2/:id3', function(req, res){
	
	for(var card in req.params){
		apiCall(req.params[card], getCard);
	}
	
	console.log('UPDATE: Cards Drafted');
	res.send('OK');
});

app.get('/update/card/:id', function(req, res){
	//UpdateCards(req.params.id);
	console.log('UPDATE: Card Picked: '+req.params.id);
	//addCard(req.params.id);
	
	apiCall(req.params.id, addCard);
	
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

app.get('/api/card/:id', function(req,res){
   
	apiCall(req.params.id, function(data){
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(data)); 
   });
});

http.listen(port);
//app.listen(port);
console.log('Listening on port: ', port);

function apiCall(cardName, callback){
    unirest.get("https://omgvamp-hearthstone-v1.p.mashape.com/cards/"+cardName+"?locale=enEN")
    .header("X-Mashape-Key", apiKey)
    .header("Accept", "application/json")
    .end(function (result) {
    //console.log(result.status, result.headers, result.body);
		return callback(result.body);
    });
}

function getCard(results){
	
	tempCards.push({name: results[0].name, mana: results[0].cost || results[1].cost, race: results[0].race, img: results[0].img || results[1].img });
	if(tempCards.length === 3){
		DraftedCards();
	}
	
}

function addCard(results){
	
	Arena.findOne({ name: currentArena }, function(err, data){
		var picked = { cardName: results[0].name, cardRace: results[0].race, cardMana: results[0].cost || results[1].cost };
		data.cards.push(picked);
		data.save();
		//tempCards = [];
		setTimeout(function(){
			SendChanges();
		}, 100);
	});
	
}

function ArenaNew(){
	// generate random arena name
	currentArena = lajt();
	
	// create new arena record in DB
	var arenka = new Arena({ name: currentArena, className: 'none' });

	arenka.save(function(err){
		if(err){
			console.log("DB save error.");
		}
	})
}

// update class to DB
function UpdateClass(klasa){
	Arena.findOne({ name: currentArena }, function(err, data){
		data.className = klasa;
		data.save();
	});
}

//add new card to databse
function UpdateCards(card){
	Arena.findOne({ name: currentArena }, function(err, data){
		var picked = { cardName: card, cardRace: 'Murloc', cardMana: 10 };
		data.cards.push(picked);
		data.save();
		//tempCards = [];
	});
}

function DraftedCards(){
	io.sockets.emit('detected', tempCards);
	tempCards = [];
}

function SendChanges(){
	Arena.findOne({ name: currentArena }, function(err, data){
		if(err){
			return console.log(err);
		}
		if(data===null){
			return;
		}
		io.sockets.emit('update', 
		{ hero: data.className, cards: data.cards }
		);
	});
	console.log('Sent update to '+usersCount+' users.');
}



