
# step.js

  My kind of step library. Implicit error handling, argument passing, 22 lines of code.

## Example

```js
function fetch(notes, posts, next) {
  // fetch notes and posts
  next(notes, posts)
}

function compare(notes, posts) {
  // compare, update posts if necessary
  next(updated)
}

Step(notes, posts)(fetch, compare, function(err, updated) {
  if(err) throw err;
  console.log(updated);
});
```

## Installation

With node.js:

    npm install step.js

With component:

    component install matthewmueller/step.js

## API

### `Step([arg1, arg2, ...])`

Initialize a step library with some initial parameters.

```js
Step(notes, posts)
```

### `Step(...)([step1, step2, ...])`

Run through each step functions sequentially.

```js
function fetch(notes, posts, next) {
  // fetch notes and posts
  next(notes, posts)
}

function compare(notes, posts) {
  // compare, update posts if necessary
  next(updated)
}

Step(notes, posts)(fetch, compare, function(err, updated) {
  if(err) throw err;
  console.log(updated);
});
```

## Error Handling

If an error occurs during the step, you simply pass it along with `next(someErr)`. At this point, step will see that `argument[0] instanceof Error` and jump to the final function in the step, passing the error along with it.

```js
function fetch(next) {
  console.log('fetching...');
  next(new Error('blow up'));
}

function compare(next) {
  console.log('comparing...');
  next();
}

Step()(fetch, compare, function(err) {
  if(err) throw err;
});
```

Output would be:

```
fetching...
[Error] blow up
```

## TODO

* more examples
* more tests

## License

(The MIT License)

Copyright (c) 2012 matthew mueller &lt;mattmuelle@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
