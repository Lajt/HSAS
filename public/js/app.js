/* global io */
var app = angular.module('HSApp', []);

app.controller('MainCtrl', [
	'$scope', '$http', 
	function($scope, $http){
		
		io = io.connect()
		
		// Emit ready event - not working no idea why
		io.emit('ready')
		
		
		$scope.status = false;
		
		// All choosen cards
		$scope.cards = [/*
			{ name: 'Imp Master', mana: 5, count: 1},
			{ name: 'Imp Master', mana: 4, count: 1},
			{ name: 'Imp Master', mana: 2, count: 1},
			{ name: 'Imp Master', mana: 2, count: 1},
			{ name: 'Imp Master', mana: 6, count: 1},
			{ name: 'Imp Master', mana: 0, count: 1}*/
		];
		
		// All possible races
		$scope.races = [
			{ name: 'Demon', count: 0 },
			{ name: 'Dragon', count: 0 },
			{ name: 'Mech', count: 0 },
			{ name: 'Murloc', count: 0 },
			{ name: 'Beast', count: 0 },
			{ name: 'Pirate', count: 0 },
			{ name: 'Totem', count: 0 }
		];
		
		$scope.currentCards = [
			{name: '', img: '', desc: ''},
			{name: '', img: '', desc: ''},
			{name: '', img: '', desc: ''}
		];
		
		// How many people online on site
		$scope.online = 0;
		// How many cards drafted already
		$scope.cardsCount = 6;
		
		// New user on site
		io.on('online', function(data) {
			//console.log(data.count);
			//console.log(typeof(data.count));
			$scope.online = data.count;
			$scope.$apply();
		})  
		io.on('detected', function(data) {
			//console.log(data);
			//console.log(typeof(data));
			//console.log(data.length);
			
			// render detected cards
			for(var i =0; i < 3; i++){
				$scope.currentCards[i].name = data[i].name;
				$scope.currentCards[i].img = data[i].img;
			}
			$scope.$apply();
			
		})
		
		/*$http.get('/api/card/Imp Master').
		then(function(crd){
			console.log(crd.flavor);
		}, function(err){
			console.log(err);
		});*/
		
		// New card choosen
		io.on('update', function(data){
			$scope.status = true;
			$scope.$apply();
			// Log basic info
			// name: String, className: String, 
			// cards: [{ cardName: String, cardRace: String, cardMana: Number }]
			//console.log(data.hero);
			//console.log(data.cards);
			// asign choosen cards from database
			var cardsDB = data.cards;
			// clear cards array
			$scope.cards = [];
			resetMana();
			resetRaces();
			// add cards to scope but if duplicate increament count
			for(var i=0; i < cardsDB.length ; i++){
				
				var cardMana = cardsDB[i].cardMana;
				var index = checkCard(cardsDB[i].cardName);
				
				// check if 'i' card is in $scope.cards variable
				if(index === -1){
					// if no, add new card to array
					$scope.cards.push({
						name: cardsDB[i].cardName,
						mana: cardMana,
						count: 1
						});
				}
				else{
					// else increament count instead of pushing new card
					$scope.cards[index].count++;
				}
				// check if card has any race, if yes increament count
				
				if(cardsDB[i].cardRace !== undefined){
					var indexRace = checkRace(cardsDB[i].cardRace);
						if(indexRace !== -1){
							$scope.races[indexRace].count++;
						}
				}
				// add info to mana curve
				if(cardMana > 7){
					manaChart.datasets[0].bars[7].value++;
				}
				else{
					manaChart.datasets[0].bars[cardMana].value++;
				}
				
			}
			
			// apply changes
			manaChart.update();
			$scope.$apply();
						
		})
		// debug info
		$scope.test = 'Hello World!';
		//console.log(checkRace("Totem"));
		
		// chart with mana curve
			var barChartData = {
				labels : ["0","1","2","3","4","5","6", "7+"],
				datasets : [
				{
					fillColor : "rgba(220,220,220,0.5)",
					strokeColor : "rgba(220,220,220,0.8)",
					highlightFill: "rgba(220,220,220,0.75)",
					highlightStroke: "rgba(220,220,220,1)",
					data : [0,0,0,0,0,0,0,0]
				}
				]
				}
			var ctx = document.getElementById("canvas").getContext("2d");
			var manaChart = new Chart(ctx).Bar(barChartData, {
			responsive : true
			});
			
			//reset chart values
			function resetMana(){
				for(var i =0; i < 8; i++){
					manaChart.datasets[0].bars[i].value = 0;
				}
			}
			
			function resetRaces(){
				for(var i=0; i < $scope.races.length; i++){
					$scope.races[i].count = 0;
				}
			}
			
			// check if input variable exist in race array
			function checkRace(race){
				for(var i=0; i < $scope.races.length; i++){
					if($scope.races[i].name === race){
						//console.log(i);
						return i;
					}
				}
				return -1;
			}
			// check if input variable exist in cards array
			function checkCard(card){
				for(var i=0; i < $scope.cards.length; i++){
					if($scope.cards[i].name === card){
						//console.log(i);
						return i;
					}
				}
				return -1;
			}
}]);