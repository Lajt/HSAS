var app = angular.module('HSApp', []);

app.controller('MainCtrl', [
	'$scope', 
	function($scope){
		
		io = io.connect()
		
		// Emit ready event
		io.emit('ready') 
		
		
		// All choosen cards
		$scope.cards = [
			{ name: 'Imp Master', mana: 5, count: 1},
			{ name: 'Imp Master', mana: 4, count: 1},
			{ name: 'Imp Master', mana: 2, count: 1},
			{ name: 'Imp Master', mana: 2, count: 1},
			{ name: 'Imp Master', mana: 6, count: 1},
			{ name: 'Imp Master', mana: 0, count: 1}
		];
		
		// All possible races
		$scope.races = [
			{ name: 'Demon', count: 1 },
			{ name: 'Dragon', count: 0 },
			{ name: 'Mech', count: 0 },
			{ name: 'Murloc', count: 5 },
			{ name: 'Beast', count: 0 },
			{ name: 'Pirate', count: 0 },
			{ name: 'Totem', count: 0 }
		];
		// How many people online on site
		$scope.online = 0;
		// How many cards drafted already
		$scope.cardsCount = 6;
		
		// New user on site
		io.on('online', function(data) {
			console.log(data.count);
			console.log(typeof(data.count));
			$scope.online = data.count;
			$scope.$apply();
		})  
		
		// New card choosen
		io.on('update', function(data){
			// Log basic info
			// name: String, className: String, 
			// cards: [{ cardName: String, cardRace: String, cardMana: Number }]
			console.log(data.hero);
			console.log(data.cards);
			// asingn choosen cards from database
			var cardsDB = data.cards;
			// clear array with cards
			$scope.cards = [];
			
			// add cards to scope but if duplicate increament count
			for(var i=0; i < cardsDB.length ; i++){
				// check if 'i' card is in $scope.cards variable
				var index = checkCard(cardsDB[i].cardName);
				if(index === -1){
					// if no, add new card to array
					$scope.cards.push({
						name: cardsDB[i].cardName,
						mana: cardsDB[i].cardMana,
						count: 1
						});
				}
				else{
					// else increament count instead of pushing new card
					$scope.cards[index].count++;
				}
				// check if card has any race, if yes increament count
				var indexRace = checkRace(cardsDB[i].cardRace);
					if(indexRace !== -1){
						$scope.races[indexRace].count++;
					}
				
			}
			// apply changes
			$scope.$apply();
			
		})
		// debug info
		$scope.test = 'Hello World!';
		console.log(checkRace("Totem"));
		
		// chart with mana curve
				var barChartData = {
			labels : ["0","1","2","3","4","5","6", "7+"],
			datasets : [
			{
				fillColor : "rgba(220,220,220,0.5)",
				strokeColor : "rgba(220,220,220,0.8)",
				highlightFill: "rgba(220,220,220,0.75)",
				highlightStroke: "rgba(220,220,220,1)",
				data : [1,3,6,5,5,4,2,2]
			}
			]
			}
			window.onload = function(){
			var ctx = document.getElementById("canvas").getContext("2d");
			window.myBar = new Chart(ctx).Bar(barChartData, {
			responsive : true
			});
			}
			
			// check if input variable exist in race array
			function checkRace(race){
				for(var i=0; i < $scope.races.length; i++){
					if($scope.races[i].name === race){
						console.log(i);
						return i;
					}
				}
				return -1;
			}
			// check if input variable exist in cards array
			function checkCard(card){
				for(var i=0; i < $scope.cards.length; i++){
					if($scope.cards[i].name === card){
						console.log(i);
						return i;
					}
				}
				return -1;
			}
}]);