
// generate random string, length: 8
function randomSeed(){
  var str = 'abcdefghiklmnoprstuwxyz1234567890'.split('');
  var finalStr = '';
    for(var i=0; i < 8; i++){
      finalStr += str[Math.floor(Math.random()*str.length)];
    }
    return finalStr;
}

module.exports=randomSeed;