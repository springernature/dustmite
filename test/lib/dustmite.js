
'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var sinon = require('sinon');
var path = require('path');

var dustmite = require(path.join(__dirname, '..', '..', 'lib', 'dustmite'));

describe('lib/dustmite', function() {
	it('Should export a function', function() {
		assert.isFunction(dustmite);
	});

	it('Should return a function when dustmite is called', function() {
		assert.isFunction(dustmite());
	});

	it('Should pass arguments through to `Validator`', function() {
		var validator = sinon.stub().returns(sinon.stub());

		mockery.registerMock('./validator', validator);

		dustmite('foo', 'bar');
		assert.isTrue(validator.calledWith('foo', 'bar'));
	});

	it('Should export a `Reporter` function', function() {
		assert.isFunction(dustmite.Reporter);
	});

	it('Should export a `Parser` function', function() {
		assert.isFunction(dustmite.Parser);
	});

	it('Should export a `Node` function', function() {
		assert.isFunction(dustmite.Node);
	});

	it('Should export a `Rules` object', function() {
		assert.isObject(dustmite.Rules);
	});
});
