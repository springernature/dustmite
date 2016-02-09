# Dustmite

Dustmite is a linter for [DustJS](https://github.com/linkedin/dustjs). It checks the syntax of your dust templates and then validates them against a configurable and extensible set of rules. The dust parsing is heavily inspired by [Swiffer.js](https://github.com/smfoote/Swiffer.js).

[![LGPL-3.0 licensed][shield-license]][info-license]
[![Node.js version support][shield-node]][info-node]
[![NPM version][shield-npm]][info-npm]
[![Build status][shield-build]][info-build]

![Susuwatari](https://38.media.tumblr.com/tumblr_mbt6bsseX31rn213no1_500.gif)

## Installation

Install using [npm](https://www.npmjs.com):

```
npm install dustmite
```

or add dustmite as a dependency in the `package.json` for your project.

## Usage

When installed Dustmite creates a binary at `./node_modules/.bin/dustmite`. It can be run with the following options:

* `-p`, `--path` sets the path to lint, this can be a file or directory.
* `-e`, `--extensions` sets the file extensions to search for if `-p` is a directory.
* `-r`, `--rules` sets the path for a [custom rules](#custom-rules) file.

Run `./node_modules/.bin/dustmite -h` to get more details about the supported options.

If you have some files or directories you do not want to lint, list them on separate lines in a file called `.dustmiteignore` in the root of your project.

## Default rules

Dustmite comes packaged with a few default rules that can be configured by placing a `.dustmiterc` file in the root of your project.

### `referencesMustBeSnakeCase`

```js
"referencesMustBeSnakeCase": true|false
```

Validates that all references in your templates are written in snake_case. This could be when printing the reference `{foo_bar}`, referencing it as a section using `{#foo_bar}{/foo_bar}` or when testing it in a conditional with `{?foo_bar}{/foo_bar}` or `{^foo_bar}{/foo_bar}`.

### `referencesMustBeCamelCase`

```js
"referencesMustBeCamelCase": true|false
```

Validates that all references in your templates are written in camelCase. This could be when printing the reference `{fooBar}`, referencing it as a section using `{#fooBar}{/fooBar}` or when testing it in a conditional with `{?fooBar}{/fooBar}` or `{^fooBar}{/fooBar}`.

### `helpersMustBeSnakeCase`

```js
"helpersMustBeSnakeCase": true|false
```

Validates that all helpers in your templates are written in snake_case. For example `{@foo_bar/}`.

### `helpersMustBeCamelCase`

```js
"helpersMustBeCamelCase": true|false
```

Validates that all helpers in your templates are written in camelCase. For example `{@fooBar/}`.

### `escapeCharactersMustBeValid`

```js
"escapeCharactersMustBeValid": true|false
```

Validates that no escape characters other than `{~s}`, `{~r}`, `{~n}`, `{~lb}` and `{~rb}` appear in your templates.

### `helperMustNotBeUsed`

```js
"helperMustNotBeUsed": true|false|["list", "of", "helpers"]
```

Validates that none of the blacklisted helpers are used in your templates.

If this rule is enabled by setting to `true` it will prevent the use of the `@if`, `@idx` and `@default` helpers.

### `helperMustBeInsideSection`

```js
"helperMustBeInsideSection": true|false|["list", "of", "helpers"]
```

Validates that the specified helpers only appear inside a `{#section}{/section}` block in your templates.

If this rule is enabled by setting to `true` it will apply to the `@first`, `@last` and `@sep` helpers.

### `helperMustBeInsideSelect`

```js
"helperMustBeInsideSelect": true|false|["list", "of", "helpers"]
```

Validates that the specified helpers only appear inside a `{@select}{/select}` block in your templates.

If this rule is enabled by setting to `true` it will apply to the `@any` and `@none` helpers.

### `helperMustHaveBody`

```js
"helperMustHaveBody": true|false|["list", "of", "helpers"]
```

Validates that the specified helpers must contain a body. e.g. `{@sep}Body{/sep}`.

If this rule is enabled by setting to `true` it will apply to the `@first`, `@last` and `@sep` helpers.

### `logicHelpersMustHaveKeyAndValue`

```js
"logicHelpersMustHaveKeyAndValue": true|false|["list", "of", "helpers"]
```

Validates that the specified helpers have a key and value, either as parameters or combined with a containing `@select` or `@math` helper. e.g. `{@eq key=foo value="bar"}{/eq}`, `{@select key=foo}{@eq value="bar"}{/eq}{/select}` or `{@math key=foo method="mod" operand="2"}{@eq value=0}{/eq}{/math}`.

If this rule is enabled by setting to `true` it will apply to the `@eq`, `@ne`, `@gt`, `@lt`, `@gte` and `@lte` helpers.

Putting these together, here's an example of a complete `.dustmiterc` file:

```js
{
	"referencesMustBeSnakeCase": true,
	"helpersMustBeCamelCase": true,
	"escapeCharactersMustBeValid": true,
	"helperMustNotBeUsed": [
		"if",
		"idx"
	],
	"helperMustBeInsideSection": [
		"sep",
		"first",
		"last"
	],
	"helperMustBeInsideSelect": [
		"none",
		"any"
	],
	"helperMustHaveBody": [
		"sep",
		"first",
		"last"
	],
	"logicHelpersMustHaveKeyAndValue": true
}
```

Dustmite will only run the default rules that are explicitly enabled in `.dustmiterc`.

## Custom rules

In addition to the default rules Dustmite allows you to provide a JavaScript file containing a list of custom rules to be applied for your project (using the `-r`/`--rules` option). This file should `module.exports` an array of rules objects.

The objects in this array must have a `type` property to define the type of node the rule should be applied to (e.g. a helper or a conditional) and a `test` property defining a function to perform the validations. `type` must have one of the following values:

* `?`
* `^`
* `#`
* `@`
* `<`
* `%`
* `partial`
* `reference`
* `special`
* `comment`

If you would like your rule to be applied to serveral different node types, the `type` can also be an array, like this:

```js
type: ['?', '^']
```

The `test` function will be called each time the Dustmite parser encounters a node of the relevant type in your templates. It should have the following signature:

```js
function(report, node) { }
```

`report` is a callback that should be called with an error message if the validation fails. It supports being called with [format strings](https://nodejs.org/api/util.html#util_util_format_format).

`node` is an object that provides information about the current node being tested. It exposes the following API:

### `node.name()`

Returns the string name of the current node, e.g. for both `{foo|s}` and `{@foo bar="baz"/}` the name would be `"foo"`.

### `node.line()`

Returns the line number where the node appears (is included by default in the message generated by the `report` callback).

### `node.column()`

Returns the column number where the node appears (is included by default in the message generated by the `report` callback).

### `node.context()`

Returns the context of the node, e.g. `{#foo:bar}{/foo}` would be `"bar"`.

### `node.filters()`

Returns an array of filters used in the node, e.g. `{foo|s|js}` would be `["s", "js"]`.

### `node.params()`

Returns an array of parameter names used in the node, e.g. `{@foo bar="baz"/}` and `{#foo bar="baz"}{/foo}` would be `["bar"]`.

### `node.countBodies()`

Returns a count of the bodies within a node, e.g. `{?foo}foo{/foo}` would be 1, `{?foo}foo{:else}bar{/foo}` would be 2.

### `node.type`

A property containing the type of the current node.

### `node.stack`

A property containing an array of the ancestor node objects for the current node.

As a more complete example, the following shows a rules file defining a single rule to validate that any reference using a hypothetical `|html` filter must first have used the `|s` filter.

```js
module.exports = [
	{
		type: 'reference',
		test: function(report, node) {
			var filters = node.filters();
			var htmlPos = filters.indexOf('html');
			var sPos = filters.indexOf('s');

			if (htmlPos !== -1 && (sPos === -1 || sPos > htmlPos)) {
				report(
					'References using the |html filter must first be passed through the |s filter, %s|%s',
					node.name(),
					filters.join('|')
				);
			}
		}
	}
];
```

With this rule `{foo}`, `{foo|s}` and `{foo|s|html}` would be valid, while `{foo|html}` and `{foo|html|s}` would be invalid.

## JavaScript API

You can also run Dustmite from JavaScript code. The basic usage is as follows:

```js
var dustmite = require('dustmite');
var Validator = dustmite();
var validator = new Validator(files, rules);
var status = validator.run(); // 0 if everything passes, 1 if there were failures
console.log(validator.report());
```

`files` is an array containing the paths of the files to lint. `rules` is an object that maps the dust node types to arrays of their validation functions. e.g.

```js
{
	'@': [
		function(report, node) { ... },
		function(report, node) { ... }
	],
	'reference': [
		function(report, node) { ... }
	],
	...
}
```

If you would like to replace the standard Dustmite reporter you can do so by passing a `Reporter` constructor to the `dustmite` function. Please see [lib/reporter.js](https://github.com/springernature/dustmite/blob/master/lib/reporter.js) for the methods that a reporter needs to implement.

## Contributing

Before opening a pull request please make sure you run all the tests. If you're developing new features or refactoring, make sure that your code is covered by unit tests. The `test` directory mirrors the directory structure of the main application so that it's clear where each test belongs.

Unit tests can be run using:

```
make test
```

As well as unit testing, we also lint our JavaScript code with [JSHint](http://jshint.com/) and [JSCS](http://jscs.info/). This keeps everything consistent and readable.

To run the linters, you can use:

```
make lint
```

To run everything you can use:

```
make ci
```

## License

Dustmite is licensed under the [Lesser General Public License (LGPL-3.0)][info-license].  
Copyright &copy; 2015, Springer Nature

[info-coverage]: https://coveralls.io/github/springernature/dustmite
[info-license]: LICENSE
[info-node]: package.json
[info-npm]: https://www.npmjs.com/package/dustmite
[info-build]: https://travis-ci.org/springernature/dustmite
[shield-coverage]: https://img.shields.io/coveralls/springernature/dustmite.svg
[shield-license]: https://img.shields.io/badge/license-LGPL%203.0-blue.svg
[shield-node]: https://img.shields.io/badge/node.js%20support-0.10–5-brightgreen.svg
[shield-npm]: https://img.shields.io/npm/v/dustmite.svg
[shield-build]: https://img.shields.io/travis/springernature/dustmite/master.svg
