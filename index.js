/**
 * Module Dependencies
 */

var flatten = require('arr-flatten');
var sliced = require('sliced');
var wrap = require('wrap-fn');
var noop = function() {};

/**
 * Export `Step`
 */

module.exports = Step;

/**
 * Initialize `Step`
 *
 * @param {Mixed} fn (optional)
 * @return {Step}
 * @api public
 */

function Step() {
  var args = sliced(arguments);

  return function step() {
    var fns = flatten(sliced(arguments).map(use));
    var last = fns.pop();
    var ctx = this;

    // kick us off
    // next tick to ensure we're async (no double callbacks)
    setTimeout(function() {
      call(fns.shift(), args);
    }, 0);

    // next
    function next(err) {
      if (err) return last(err);
      var arr = sliced(arguments, 1);
      args = extend(args, arr);
      var fn = fns.shift();
      call(fn, args);
    }

    // call
    function call(fn, args) {
      if (!fn) return last.apply(ctx, [null].concat(args));
      else return wrap(fn, next).apply(ctx, args);
    }
  }
}

/**
 * Add a step
 *
 * @param {Function|Generator|Array} fn
 * @return {Step}
 * @api public
 */

function use(fn) {
  if (fn instanceof Step) return fn.fns;
  return fn;
}

/**
 * Pull values from another array
 * @param  {Array} a
 * @param  {Array} b
 * @return {Array}
 */

function extend(a, b) {
  var len = a.length;
  var out = [];

  for (var i = 0; i < len; i++) {
    out[i] = undefined === b[i] ? a[i] : b[i];
  }

  return out;
}

/**
 * Is generator?
 *
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function generator(value){
  return value
    && value.constructor
    && 'GeneratorFunction' == value.constructor.name;
}
