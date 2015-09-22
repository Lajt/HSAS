/*io = io.connect()

// Emit ready event.
io.emit('ready') 

// Listen for the talk event.
io.on('talk', function(data) {
//    alert(data.message)
})  

io.on('choose', function(data){
    var card = data.pick;
    $(".lajt").append($("<li class ='list-group-item' style='background-color: #69C181'>").text(card));
    if($('.cardOne').text()==card){
        $(".OneImg").effect( "highlight", {color:"#669966"}, 3000 ); 
    }
    else if($('.cardTwo').text()==card){
        $(".TwoImg").effect( "highlight", {color:"#669966"}, 3000 ); 
    }
    else if($('.cardThree').text()==card){
        $(".ThreeImg").effect( "highlight", {color:"#669966"}, 3000 ); 
    }
    else{
        console.log('fuck');
    }
    
})

io.on('pick', function(data){
    //alert(data.cardOne+"\n"+data.cardTwo+"\n"+data.cardThree)
    $('.cardOne').text(data.cardOne);
    $('.cardTwo').text(data.cardTwo);
    $('.cardThree').text(data.cardThree);
    
    
    //CLEAR loading.jpg
    $('.OneDesc').text('');
    $('.TwoDesc').text('');
    $('.ThreeDesc').text('');
    $('.OneImg').attr("src", "http://wstaw.org/m/2015/09/03/loading.jpg");
    $('.TwoImg').attr("src", "http://wstaw.org/m/2015/09/03/loading.jpg");
    $('.ThreeImg').attr("src", "http://wstaw.org/m/2015/09/03/loading.jpg");
    
    
   //**********************
   //FIRST CARD
   $.getJSON("http://lajt.ovh:3000/card/"+data.cardOne, function(){
    console.log('success');
  })
  .done(function(cards){
      //$('.cardOne').text(cards[0].name);
      $('.OneDesc').text(cards[0].flavor);
      $('.OneImg').attr("src", cards[0].img);
  })
  .fail(function(){
      var txt = $('.cardOne').text();
      $('.cardOne').text(txt+" ERROR");
  })
  //**********************
  //2ND CARD
  //**********************
     $.getJSON("http://lajt.ovh:3000/card/"+data.cardTwo, function(){
    console.log('success');
  })
  .done(function(cards){
      //$('.cardTwo').text(cards[0].name);
      $('.TwoDesc').text(cards[0].flavor);
      $('.TwoImg').attr("src", cards[0].img);
  })
  .fail(function(){
      var txt = $('.cardTwo').text();
      $('.cardTwo').text(txt+" ERROR");
  })
  //**********************
  // 3RD CARD
     $.getJSON("http://lajt.ovh:3000/card/"+data.cardThree, function(){
    console.log('success');
  })
  .done(function(cards){
      //$('.cardThree').text(cards[0].name);
      $('.ThreeDesc').text(cards[0].flavor);
      $('.ThreeImg').attr("src", cards[0].img);
  })
  .fail(function(){
      var txt = $('.cardThree').text();
      $('.cardThree').text(txt+" ERROR");
  })
  //**********************

    
    
})*/