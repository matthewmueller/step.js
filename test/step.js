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
      step().run(function(err) {
        assert(!err);
        done();
      });
    })

    it('should pass args through', function(done) {
      step().run('hi', 'hello', function(err, msg, msg2) {
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

      step()
        .use(a)
        .run('hi', function(err, msg) {
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

      step()
        .use(a)
        .run('hi', function(err, msg) {
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

      step()
        .use(a)
        .run('hi', function(err, msg) {
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

      step()
        .use(a)
        .run('hi', function(err, msg) {
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

      step()
        .use(a)
        .run('hi', function(err, msg) {
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

      step()
        .use(a)
        .run('hi', function(err, msg) {
          assert('blow up' == err.message);
          assert(!msg);
          done();
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

      step()
        .use(a)
        .use(b)
        .run('hi', function(err, msg) {
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

      step()
        .use(a)
        .use(b)
        .run('hi', 'wahoo', function(err, msg, msg2) {
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

      step()
        .use(a)
        .use(b)
        .run('hi', 'wahoo', function(err, msg, msg2) {
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

      step()
        .use(a)
        .use(b)
        .run('hi', 'wahoo', function(err, msg, msg2) {
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

      step()
        .use(a)
        .use(b)
        .run('hi', 'wahoo', function(err, msg, msg2) {
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

      step()
        .use(a)
        .use(b)
        .run('hi', 'wahoo', function(err, msg, msg2) {
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

      step()
        .use([a, b])
        .run('hi', 'wahoo', function(err, msg, msg2) {
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

      step()
        .use(a)
        .use(b)
        .run('hi', 'wahoo', function(err, msg, msg2) {
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

      step()
        .use(a)
        .use(b)
        .run('hi', 'wahoo', function(err, msg, msg2) {
          assert('blow up' == err.message);
          assert(!called);
          assert(!msg);
          assert(!msg2);
          done();
        });
    });

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
