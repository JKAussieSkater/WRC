# WRC
* __Homepage:__ TBA
* __Repository:__ [GitHub/JKAussieSkater/WRC](https://github.com/JKAussieSkater/WRC)
* __Author:__ [JKAussieSkater](https://github.com/JKAussieSkater)
* __License:__ [MIT](http://opensource.org/licenses/MIT)
* __Bugs:__ [GitHub](https://github.com/JKAussieSkater/WRC/issues)

## Future Ideas
* ~~Fix multiple source map problem on distributed files~~ (Fixed?)

### Longterm Ideas
* Release project as a starting template, so that many beginners can have a great beginning.

## Changelog

#### [2016-01-31] v0.2.0
* Improved File Tree directory structure
  * Discarding `src/_processed/` folder
  * Introducing `tmp/` folder
* Optimised Grunt code
  * Introducing `<!--embed:custom-->` HTML tags
    * Grunt replaces them with `/src/embed/` templates
  * Introducing `<!--activate/-->` HTML tag
    * Grunt replaces it with certain HTML features (e.g. Bootstrap features) which require a per-page addition of JavaScript
  * Corrected, simplified and improved Regular Expressions
  * Improved `watch` task's "kill switch"
  * Corrected some errors across multiple tasks
  * Introduced JSLint Configuration
    * Whitelists unnecessary warnings

#### [2016-01-22] v0.1.0
* Improved File Tree directory structure
* Optimised Grunt code
  * Copy but no overwriting
  * HTML Processing
  * `watch` routines

#### [2016-01-07] v0.0.1
* Initial release.
