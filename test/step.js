/**
 * Module Dependencies
 */

var step = require('..');
var assert = require('assert');

/**
 * Tests
 */

describe('step', function() {

  describe('no steps', function() {

    it('should work without any args', function(done) {
      step()(function(err) {
        assert(!err);
        done();
      });
    })

    it('should pass args through', function(done) {
      step('hi', 'hello')(function(err, msg, msg2) {
        assert(!err);
        assert('hi' == msg);
        assert('hello' == msg2);
        done();
      });
    })
  })

  describe('one step', function() {
    it('should pass args through (sync)', function(done) {
      function a(msg) {
        assert('hi' == msg);
        return 'hello';
      }

      step('hi')(a, function(err, msg) {
        assert(!err);
        assert('hello' == msg);
        done()
      });
    })

    it('should pass args through (async)', function(done) {
      function a(msg, next) {
        assert('hi' == msg);
        setTimeout(function() {
          next(null, 'hello');
        }, 0);
      }

      step('hi')(a, function(err, msg) {
          assert(!err);
          assert('hello' == msg);
          done();
        });
    })

    it('should pass args through (gen)', function (done) {
      function *a(msg) {
        assert('hi' == msg);
        yield wait(100);
        return 'hello';
      }

      step('hi')(a, function(err, msg) {
        assert(!err);
        assert('hello' == msg);
        done();
      });
    })

    it('should propagate errors (sync)', function(done) {
      function a(msg) {
        assert('hi' == msg);
        return new TypeError('blow up');
      }

      step('hi')(a, function(err, msg) {
        assert('blow up' == err.message);
        assert(!msg);
        done();
      });
    })

    it('should propagate errors(async)', function(done) {
      function a(msg, next) {
        assert('hi' == msg);
        setTimeout(function() {
          next(new TypeError('blow up'), msg);
        }, 0)
      }

      step('hi')(a, function(err, msg) {
        assert('blow up' == err.message);
        assert(!msg);
        done();
      });
    })

    it('should catch sync errors inside async fns', function(done) {
      function a(msg, next) {
        assert('hi' == msg);
        throw new Error('blow up');
        setTimeout(function() {
          next(null, msg);
        }, 0)
      }

      step('hi')(a, function(err, msg) {
        assert('blow up' == err.message);
        assert(!msg);
        done();
      });
    })

    it('should propagate errors (gen)', function(done) {
      function *a(msg) {
        assert('hi' == msg);
        yield wait(100);
        throw new TypeError('blow up');
      }

      step('hi')(a, function(err, msg) {
          assert('blow up' == err.message);
          assert(!msg);
          done();
        });
    })

    it('should allow you to call run multiple times', function(done) {
      called = 0;
      function a() {
        called++;
      }

      var s = step();

      s(a, function() {
        s(a, function() {
          assert(2 == called);
          done();
        })
      });
    })
  })

  describe('multiple steps', function() {
    it('should pass args through (sync)', function(done) {
      function a(msg) {
        assert('hi' == msg);
        return 'hello';
      }

      function b(msg) {
        assert('hello' == msg);
        return 'howdy';
      }

      step('hi')(a, b, function(err, msg) {
        assert(!err);
        assert('howdy' == msg);
        done();
      });
    });

    it('should pass args through (async)', function(done) {
      function a(msg, msg2, next) {
        assert('hi' == msg);
        assert('wahoo' == msg2);
        setTimeout(function() {
          next(null, 'hello', 'yahoo');
        }, 0);
      }

      function b(msg, msg2, next) {
        assert('hello' == msg);
        assert('yahoo' == msg2);
        setTimeout(function() {
          next(null, 'howdy');
        }, 0);
      }

      step('hi', 'wahoo')(a, b, function(err, msg, msg2) {
        assert(!err);
        assert('howdy' == msg);
        assert('yahoo' == msg2);
        done();
      });
    });

    it('should work with both sync and async fns', function(done) {
      function a(msg, msg2) {
        assert('hi' == msg);
        assert('wahoo' == msg2);
        return 'hello';
      }

      function b(msg, msg2, next) {
        assert('hello' == msg);
        assert('wahoo' == msg2);

        setTimeout(function() {
          next(null, 'howdy');
        }, 0);
      }

      step('hi', 'wahoo')(a, b, function(err, msg, msg2) {
        assert(!err);
        assert('howdy' == msg);
        assert('wahoo' == msg2);
        done();
      });
    });

    it('functions dont need to return anything', function(done) {
      function a(msg, msg2) {
        assert('hi' == msg);
        assert('wahoo' == msg2);
      }

      function b(msg, msg2, next) {
        setTimeout(next, 0);
      }

      step('hi', 'wahoo')(a, b, function(err, msg, msg2) {
        assert(!err);
        assert('hi' == msg);
        assert('wahoo' == msg2);
        done();
      });
    });

    it('should skip functions if an error happens (sync)', function(done) {
      var called = false;

      function a(msg, msg2) {
        assert('hi' == msg);
        assert('wahoo' == msg2);
        return new Error('blow up');
      }

      function b(msg, msg2, next) {
        called = true;
        setTimeout(next, 0);
      }

      step('hi', 'wahoo')(a, b, function(err, msg, msg2) {
        assert('blow up' == err.message);
        assert(!called);
        assert(!msg);
        assert(!msg2);
        done();
      });
    })

    it('should skip functions if an error happens (async)', function(done) {
      var called = false;

      function a(msg, msg2, next) {
        assert('hi' == msg);
        assert('wahoo' == msg2);
        next(new Error('blow up'));
      }

      function b(msg, msg2, next) {
        called = true;
        setTimeout(next, 0);
      }

      step('hi', 'wahoo')(a, b, function(err, msg, msg2) {
          assert('blow up' == err.message);
          assert(!called);
          assert(!msg);
          assert(!msg2);
          done();
        });
    });

    it('step#use(fn) should work with arrays', function(done) {
      function a(msg, msg2) {
        assert('hi' == msg);
        assert('wahoo' == msg2);
        return 'hello';
      }

      function b(msg, msg2, next) {
        assert('hello' == msg);
        assert('wahoo' == msg2);
        setTimeout(function() {
          next(null, 'howdy');
        }, 0);
      }

      step('hi', 'wahoo')([a, b], function(err, msg, msg2) {
        assert(!err);
        assert('howdy' == msg);
        assert('wahoo' == msg2);
        done();
      });
    })

    it('step#use(fn) should work with generators', function(done) {
      function a(msg, msg2) {
        assert('hi' == msg);
        assert('wahoo' == msg2);
        return 'hello';
      }

      function *b(msg) {
        assert('hello' == msg);
        yield wait(100);
        return 'howdy';
      }

      step('hi', 'wahoo')(a, b, function(err, msg, msg2) {
        assert(!err);
        assert('howdy' == msg);
        assert('wahoo' == msg2);
        done();
      });
    })

    it('should skip functions if an error happens (async)', function(done) {
      var called = false;

      function *a(msg, msg2) {
        assert('hi' == msg);
        assert('wahoo' == msg2);
        throw new Error('blow up');
      }

      function b() {
        called = true;
      }

      step('hi', 'wahoo')(a, b, function(err, msg, msg2) {
        assert('blow up' == err.message);
        assert(!called);
        assert(!msg);
        assert(!msg2);
        done();
      });
    });

    it('should support a context', function(done) {
      function *a(msg) {
        assert('hi' == msg);
        this.a = 'a';
      }

      function b(msg) {
        assert('hi' == msg);
        this.b = 'b';
      }

      step('hi').call({}, a, b, function(err, msg) {
        if (err) return done(err);
        assert(this.a = 'a');
        assert(this.b = 'b');
        assert('hi' == msg);
        done();
      });
    })
  })
});

/**
 * Wait `ms` milliseconds
 *
 * @param {Number} ms
 * @return {Function}
 * @api private
 */

function wait(ms) {
  return function(fn) {
    setTimeout(fn, ms);
  };
}
