
'use strict';

var assert = require('proclaim');
var path = require('path');
var sinon = require('sinon');

var rules = require(path.join(__dirname, '..', '..', 'lib', 'rules'));

describe('lib/rules', function() {
	describe('referencesMustBeSnakeCase', function() {
		it('Should apply for references', function() {
			assert.strictEqual(rules.referencesMustBeSnakeCase.type, 'reference');
		});

		it('Should callback if the name of the node being tested does not satisfy the criteria', function() {
			['abcAbc', '9abc', 'abc$'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name)
				};
				rules.referencesMustBeSnakeCase.test(callback, node);
				assert.isTrue(callback.calledOnce, name + ' should be an invalid name for referencesMustBeSnakeCase');
			});
		});

		it('Should not callback if the name of the node being tested statisfies the criteria', function() {
			['abc', 'foo_bar', '_foo_bar_baz', '$len', 'foo.$idx', '.', 'abc.foo_bar'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name)
				};
				rules.referencesMustBeSnakeCase.test(callback, node);
				assert.isTrue(callback.notCalled, name + ' should be a valid name for referencesMustBeSnakeCase');
			});
		});
	});

	describe('referencesMustBeCamelCase', function() {
		it('Should apply for references', function() {
			assert.strictEqual(rules.referencesMustBeCamelCase.type, 'reference');
		});

		it('Should callback if the name of the node being tested does not satisfy the criteria', function() {
			['abc_abc', '9abc', 'abc$', 'foo$bar'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name)
				};
				rules.referencesMustBeCamelCase.test(callback, node);
				assert.isTrue(callback.calledOnce, name + ' should be an invalid name for referencesMustBeCamelCase');
			});
		});

		it('Should not callback if the name of the node being tested statisfies the criteria', function() {
			['abc', 'fooBar', 'FooBarBaz', '$len', 'foo.$idx', '.', 'abc.fooBar'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name)
				};
				rules.referencesMustBeCamelCase.test(callback, node);
				assert.isTrue(callback.notCalled, name + ' should be a valid name for referencesMustBeCamelCase');
			});
		});
	});

	describe('helpersMustBeSnakeCase', function() {
		it('Should apply for helpers', function() {
			assert.strictEqual(rules.helpersMustBeSnakeCase.type, '@');
		});

		it('Should callback if the name of the node being tested does not satisfy the criteria', function() {
			['abcAbc', '9abc', 'abc$', 'foo.$idx', '_foo', '$test', '.', 'a.b'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name)
				};
				rules.helpersMustBeSnakeCase.test(callback, node);
				assert.isTrue(callback.calledOnce, name + ' should be an invalid name for helpersMustBeSnakeCase');
			});
		});

		it('Should not callback if the name of the node being tested statisfies the criteria', function() {
			['abc', 'foo_bar', 'foo_bar_baz'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name)
				};
				rules.helpersMustBeSnakeCase.test(callback, node);
				assert.isTrue(callback.notCalled, name + ' should be a valid name for helpersMustBeSnakeCase');
			});
		});
	});

	describe('helpersMustBeCamelCase', function() {
		it('Should apply for helpers', function() {
			assert.strictEqual(rules.helpersMustBeCamelCase.type, '@');
		});

		it('Should callback if the name of the node being tested does not satisfy the criteria', function() {
			['abc_abc', '9abc', 'abc$', 'foo.$idx', '$test', '.', 'a.b'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name)
				};
				rules.helpersMustBeCamelCase.test(callback, node);
				assert.isTrue(callback.calledOnce, name + ' should be an invalid name for helpersMustBeCamelCase');
			});
		});

		it('Should not callback if the name of the node being tested statisfies the criteria', function() {
			['abc', 'fooBar', 'fooBarBaz', 'Foo'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name)
				};
				rules.helpersMustBeCamelCase.test(callback, node);
				assert.isTrue(callback.notCalled, name + ' should be a valid name for helpersMustBeCamelCase');
			});
		});
	});

	describe('helperMustNotBeUsed', function() {
		it('Should apply for helpers', function() {
			assert.strictEqual(rules.helperMustNotBeUsed.type, '@');
		});

		it('Should callback if the name of the node is `if`', function() {
			var callback = sinon.stub();
			var node = {
				name: sinon.stub().returns('if')
			};
			rules.helperMustNotBeUsed.test(callback, node);
			assert.isTrue(callback.calledOnce, 'if helper must not be used');
		});

		it('Should not callback for other names', function() {
			var callback = sinon.stub();
			var node = {
				name: sinon.stub().returns('foo')
			};
			rules.helperMustNotBeUsed.test(callback, node);
			assert.isTrue(callback.notCalled, 'helper names other than if should be allowed');
		});

		it('Should allow the list of disallowed helpers to be configured', function() {
			var names = ['foo'];
			var callback1 = sinon.stub();
			var callback2 = sinon.stub();
			var node1 = {
				name: sinon.stub().returns('foo')
			};
			var node2 = {
				name: sinon.stub().returns('if')
			};
			rules.helperMustNotBeUsed.test(callback1, node1, names);
			assert.isTrue(callback1.calledOnce, 'foo helper must not be used');
			rules.helperMustNotBeUsed.test(callback2, node2, names);
			assert.isTrue(callback2.notCalled, 'if helper can be used');
		});
	});

	describe('escapeCharactersMustBeValid', function() {
		it('Should apply for special characters', function() {
			assert.strictEqual(rules.escapeCharactersMustBeValid.type, 'special');
		});

		it('Should callback if any invalid escape sequences are used', function() {
			['a', 'foo', 'ssss', 'vb', '1', '.'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name)
				};
				rules.escapeCharactersMustBeValid.test(callback, node);
				assert.isTrue(callback.calledOnce, name + ' should be an invalid name for escapeCharactersMustBeValid');
			});
		});

		it('Should not callback if the valid escape sequences are used', function() {
			['s', 'n', 'r', 'lb', 'rb'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name)
				};
				rules.escapeCharactersMustBeValid.test(callback, node);
				assert.isTrue(callback.notCalled, name + ' should be a valid name for escapeCharactersMustBeValid');
			});
		});
	});

	describe('helperMustBeInsideSection', function() {
		it('Should apply for helpers', function() {
			assert.strictEqual(rules.helperMustBeInsideSection.type, '@');
		});

		it('Should callback if any of `sep`, `first` or `last` are used outside of a section', function() {
			['sep', 'first', 'last'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name),
					stack: [
						{type: 'foo'},
						{type: 'bar'}
					]
				};
				rules.helperMustBeInsideSection.test(callback, node);
				assert.isTrue(callback.calledOnce, name + ' should be invalid outside a section for helperMustBeInsideSection');
			});
		});

		it('Should not callback if `sep`, `first` or `last` are used inside a section', function() {
			['sep', 'first', 'last'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name),
					stack: [
						{type: 'foo'},
						{type: '#'}
					]
				};
				rules.helperMustBeInsideSection.test(callback, node);
				assert.isTrue(callback.notCalled, name + ' should be valid inside a section for helperMustBeInsideSection');
			});
		});

		it('Should not callback if other helpers are used outside of a section', function() {
			['select', 'foo'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name),
					stack: [
						{type: 'foo'}
					]
				};
				rules.helperMustBeInsideSection.test(callback, node);
				assert.isTrue(callback.notCalled, name + ' should be valid outisde a section for helperMustBeInsideSection');
			});
		});

		it('Should allow the default list of tested helpers to be overidden', function() {
			var names = ['gt', 'foo'];
			names.forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name),
					stack: [
						{type: 'foo'},
						{type: 'bar'}
					]
				};
				rules.helperMustBeInsideSection.test(callback, node, names);
				assert.isTrue(callback.calledOnce, name + ' should be invalid outside a section for helperMustBeInsideSection with custom helper list');
			});

			['sep', 'first', 'last'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name),
					stack: [
						{type: 'foo'},
						{type: 'bar'}
					]
				};
				rules.helperMustBeInsideSection.test(callback, node, names);
				assert.isTrue(callback.notCalled, name + ' should be valid outisde a section for helperMustBeInsideSection with custom helper list');
			});
		});
	});

	describe('helperMustBeInsideSelect', function() {
		it('Should apply for helpers', function() {
			assert.strictEqual(rules.helperMustBeInsideSelect.type, '@');
		});

		it('Should callback if the `none` or `any` helpers are used outside of a `select`', function() {
			['any', 'none'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name),
					stack: [
						{
							type: '@',
							name: sinon.stub().returns('foo')
						},
						{type: '#'}
					]
				};
				rules.helperMustBeInsideSelect.test(callback, node);
				assert.isTrue(callback.calledOnce, name + ' should be invalid outside a select for helperMustBeInsideSelect');
			});
		});

		it('Should not callback if the `none` or `any` helpers are used inside of a `select`', function() {
			['any', 'none'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name),
					stack: [
						{type: 'foo'},
						{
							type: '@',
							name: sinon.stub().returns('select')
						},
						{type: '#'}
					]
				};
				rules.helperMustBeInsideSelect.test(callback, node);
				assert.isTrue(callback.notCalled, name + ' should be valid inside a select for helperMustBeInsideSelect');
			});
		});

		it('Should not callback if other helpers are used outside of a `select`', function() {
			['foo', 'eq'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name),
					stack: [
						{type: 'foo'},
						{type: '#'}
					]
				};
				rules.helperMustBeInsideSelect.test(callback, node);
				assert.isTrue(callback.notCalled, name + ' should be valid outside a select for helperMustBeInsideSelect');
			});
		});


		it('Should allow the default list of tested helpers to be overidden', function() {
			var names = ['gt', 'foo'];
			names.forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name),
					stack: [
						{
							type: '@',
							name: sinon.stub().returns('foo')
						},
						{type: '#'}
					]
				};
				rules.helperMustBeInsideSelect.test(callback, node, names);
				assert.isTrue(callback.calledOnce, name + ' should be invalid outside a select for helperMustBeInsideSelect with custom helper list');
			});

			['any', 'none'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name),
					stack: [
						{
							type: '@',
							name: sinon.stub().returns('foo')
						},
						{type: '#'}
					]
				};
				rules.helperMustBeInsideSelect.test(callback, node, names);
				assert.isTrue(callback.notCalled, name + ' should be valid outside a select for helperMustBeInsideSelect with custom helper list');
			});
		});
	});

	describe('helperMustHaveBody', function() {
		it('Should apply for helpers', function() {
			assert.strictEqual(rules.helperMustHaveBody.type, '@');
		});

		it('Should not callback if the `sep`, `first` or `last` helpers have a body', function() {
			['first', 'sep', 'last'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name),
					countBodies: sinon.stub().returns(1)
				};
				rules.helperMustHaveBody.test(callback, node);
				assert.isTrue(callback.notCalled, name + ' should be valid if it has a body for helperMustHaveBody');
			});
		});

		it('Should callback if the `sep`, `first` or `last` helpers have a body', function() {
			['first', 'sep', 'last'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name),
					countBodies: sinon.stub().returns(0)
				};
				rules.helperMustHaveBody.test(callback, node);
				assert.isTrue(callback.calledOnce, name + ' should be invalid if it has no body for helperMustHaveBody');
			});
		});

		it('Should not callback if other helpers do not have a body', function() {
			['lt', 'foo'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name),
					countBodies: sinon.stub().returns(0)
				};
				rules.helperMustHaveBody.test(callback, node);
				assert.isTrue(callback.notCalled, name + ' should be valid if it has no body for helperMustHaveBody');
			});
		});

		it('Should allow the default list of tested helpers to be overidden', function() {
			var names = ['gt', 'foo'];
			names.forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name),
					countBodies: sinon.stub().returns(0)
				};
				rules.helperMustHaveBody.test(callback, node, names);
				assert.isTrue(callback.calledOnce, name + ' should be invalid if it has no body for helperMustHaveBody with custom helper list');
			});

			['first', 'sep', 'last'].forEach(function(name) {
				var callback = sinon.stub();
				var node = {
					name: sinon.stub().returns(name),
					countBodies: sinon.stub().returns(0)
				};
				rules.helperMustHaveBody.test(callback, node, names);
				assert.isTrue(callback.notCalled, name + ' should be valid if it has no body for helperMustHaveBody with custom helper list');
			});
		});
	});
});