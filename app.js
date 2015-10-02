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
	res.send('OK');
});

app.get('/update/newarena', function(req, res){
	ArenaNew();
	console.log('UPDATE: New arena started: '+currentArena);
	res.send('arena2');
});

app.get('/update/hero/:id', function(req, res){
	UpdateClass(req.params.id);
	console.log('UPDATE: Hero Picked: '+req.params.id);
	res.send('OK');
});

app.get('/update/detected/:id1/:id2/:id3', function(req, res){
	// detected cards just emit socket io info
	getCard(req.params.id1);
	getCard(req.params.id2);
	getCard(req.params.id3);
	console.log('UPDATE: Card Drafted: ');
	res.send('OK');
});

app.get('/update/card/:id', function(req, res){
	//UpdateCards(req.params.id);
	console.log('UPDATE: Card Picked: '+req.params.id);
	addCard(req.params.id);
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
   
   // These code snippets use an open-source library. http://unirest.io/nodejs
    unirest.get("https://omgvamp-hearthstone-v1.p.mashape.com/cards/"+req.params.id+"?locale=enEN")
    .header("X-Mashape-Key", apiKey)
    .header("Accept", "application/json")
    .end(function (result) {
    console.log(result.status, result.headers, result.body);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result.body));
    //res.send(JSON.stringify({ a: 1 }, null, 3));
    });
   
});

http.listen(port);
//app.listen(port);
console.log('Listening on port: ', port);

function getCard(name){
	// These code snippets use an open-source library. http://unirest.io/nodejs
    unirest.get("https://omgvamp-hearthstone-v1.p.mashape.com/cards/"+name+"?locale=enEN")
    .header("X-Mashape-Key", apiKey)
    .header("Accept", "application/json")
    .end(function (result) {
    //console.log(result.status, result.headers, result.body);
    console.log(result.body[0].name);
	var mana = result.body[0].cost;
	if(mana === null || mana === undefined){
		mana = result.body[1].cost;		
		if(mana === null || mana === undefined){
			mana = 0;
		}
	}
	
	tempCards.push({name: result.body[0].name, mana: mana, race: result.body[0].race, img: result.body[0].img});
	if(tempCards.length === 3){
		DraftedCards();
	}
    //res.send(JSON.stringify({ a: 1 }, null, 3));
    });
}

function addCard(cardN){
	// These code snippets use an open-source library. http://unirest.io/nodejs
    unirest.get("https://omgvamp-hearthstone-v1.p.mashape.com/cards/"+cardN+"?locale=enEN")
    .header("X-Mashape-Key", apiKey)
    .header("Accept", "application/json")
    .end(function (result) {
    //console.log(result.status, result.headers, result.body);
    console.log(result.body[0].name);
	//tempCards.push({name: result.body[0].name, mana: result.body[0].cost, race: result.body[0].race, img: result.body[0].img});
	var mana = result.body[0].cost;
	if(mana === null || mana === undefined){
		mana = result.body[1].cost;		
		if(mana === null || mana === undefined){
			mana = 0;
		}
	}
	Arena.findOne({ name: currentArena }, function(err, data){
		var picked = { cardName: cardN, cardRace: result.body[0].race, cardMana: mana };
		data.cards.push(picked);
		data.save();
		//tempCards = [];
		setTimeout(function(){
			SendChanges();
		}, 100);
	});
    //res.send(JSON.stringify({ a: 1 }, null, 3));
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



