/**
 * Module Dependencies
 */

var slice = Array.prototype.slice;

/**
 * Export `Step`
 */

module.exports = Step;

/**
 * Initialize `Step`
 *
 * @return {Step}
 * @api public
 */

function Step() {
  if (!(this instanceof Step)) return new Step();
  this.fns = [];
}

/**
 * Add a step
 *
 * @param {Function|Array} fns
 * @return {Step}
 * @api public
 */

Step.prototype.use = function(fns) {
  fns = 'function' == typeof fns ? [fns] : fns;
  this.fns = this.fns.concat(fns);
  return this;
};

/**
 * Run the steps
 *
 * @param {Args...} args
 * @param {Function} fn
 * @api public
 */

Step.prototype.run = function() {
  var fns = this.fns;
  var args = slice.call(arguments);
  var last = args[args.length - 1];
  var done = 'function' == typeof last ? args.pop() : noop;

  // kick us off
  call(fns.shift(), args);

  // next
  function next(err) {
    if (err) return done(err);
    var args = slice.call(arguments, 1);
    var fn = fns.pop();
    call(fn, args);
  }

  // call
  function call(fn, args) {
    if (!fn) return done.apply(done, [null].concat(args));
    else if (fn.length > args.length) fn.apply(fn, args.concat(next));
    else {
      var ret = fn.apply(fn, args);
      ret instanceof Error ? next(ret) : next(null, ret);
    }
  }
};
