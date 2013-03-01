var step = require('./');

var one = function(one, two, next) {
  console.log('one', arguments);
  setTimeout(function() {
    next(one);
  }, 1000);
};

var two = function(one, next) {
  console.log('two', arguments);
  setTimeout(function() {
    next(one);
  }, 1000);
};

step('1st arg', '2nd arg')(one, two, function(err) {
  if(err) throw err;
  console.log('done', arguments);
})
