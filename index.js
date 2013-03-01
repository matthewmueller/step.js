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
 * @param {[Mixed, ...]} initial arguments
 * @return {Function} step function
 */

function Step() {
  var self = this,
      initials = slice.call(arguments),
      before = function(next) { next.apply(self, initials) };

  return function() {
    var stack = slice.call(arguments).reverse();
    stack.push(before);

    function next(err) {
      // Jump to last func if error occurs
      if (err instanceof Error) return stack[0].call(self, err);

      // Otherwise gather arguments and add next func to end
      var args = slice.call(arguments);

      // If we have more on the stack, tack on next function,
      // otherwise push a null value for no error
      if (stack.length > 1) {
        args.push(next);
      } else {
        args.unshift(null);
      }

      // Call the next function on the stack with given args
      stack.pop().apply(self, args);
    }

    // Kick us off
    stack.pop().call(self, next);
  };
}
