
3.1.0 / 2015-03-17
==================

  * remove always async (due to double callbacks). I *think* this is handled downstream via wrap-fn's once(...), but I could be wrong

3.0.1 / 2015-01-22
==================

  * Fix deps

3.0.0 / 2015-01-22
==================

  * API change.
  * Now using wrap-fn for better error handling and promise support
  * Supports passing a context

2.0.5 / 2014-11-30
==================

  * ensure step is always async, even if plugins are all sync

2.0.4 / 2014-11-28
==================

  * add co to component.json

2.0.3 / 2014-11-28
==================

  * strict undefined equality

2.0.2 / 2014-08-16
==================

 * add a length property

2.0.1 / 2014-07-22
==================

 * allow you to run step#run() multiple times on the same instance

2.0.0 / 2014-07-22
==================

 * support generators
 * remove variable argument support

1.0.0 / 2014-06-24
==================

 * change api entirely

0.0.1 / 2010-01-03
==================

  * Initial release
