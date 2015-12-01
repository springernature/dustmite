
'use strict';

var assert = require('proclaim');
var sinon = require('sinon');
var path = require('path');

var Parser = require(path.join(__dirname, '..', '..', 'lib', 'parser'));
var Node = require(path.join(__dirname, '..', '..', 'lib', 'node'));
var Reporter = require(path.join(__dirname, '..', 'mock', 'reporter'));

describe('lib/parser', function() {
	var parser;

	beforeEach(function() {
		parser = new Parser();
	});

	describe('parse', function() {
		var reporter;

		beforeEach(function() {
			reporter = new Reporter();
		});
		afterEach(function() {
			reporter.add.reset();
		});

		it('Should catch dust syntax errors', function() {
			var step = sinon.stub(parser, 'step');

			assert.doesNotThrow(function() {
				parser.parse('{?foo}bar{foo}', reporter);
			});
			assert.isTrue(reporter.add.calledOnce);
			assert.strictEqual(reporter.add.firstCall.args.length, 3);
			assert.isTrue(step.notCalled);
		});

		it('Should step into the AST if there are no syntax errors', function() {
			var step = sinon.stub(parser, 'step');

			assert.doesNotThrow(function() {
				parser.parse('{?foo}bar{/foo}', reporter);
			});
			assert.isTrue(reporter.add.notCalled);
			assert.isTrue(step.calledOnce);
			assert.strictEqual(step.firstCall.args[0][0], 'body');
			assert.strictEqual(step.firstCall.args[0][1][0], '?');
		});
	});

	describe('step', function() {
		var stack;

		beforeEach(function() {
			stack = {
				push: sinon.stub(),
				pop: sinon.stub()
			};
		});

		it('Should walk all but the last two nodes in the current level of the AST when it encounters a `body` node', function() {
			var walk = sinon.stub(parser, 'walk');
			var node = ['body'];

			parser.step(node, stack);

			assert.isTrue(walk.calledOnce);
			assert.isTrue(walk.calledWith(node, stack));
			assert.strictEqual(walk.firstCall.args.length, 3);
			assert.strictEqual(walk.firstCall.args[2].endOffset, 2);
		});

		it('Should walk all nodes in the current level of the AST when it encounters a `bodies` node', function() {
			var walk = sinon.stub(parser, 'walk');
			var node = ['bodies'];

			parser.step(node, stack);

			assert.isTrue(walk.calledOnce);
			assert.isTrue(walk.calledWith(node, stack));
			assert.strictEqual(walk.firstCall.args.length, 2);
		});

		it('Should notify clients when it encounters a `?` node and step into the children', function() {
			var notify = sinon.stub(parser, 'notify');
			var step = sinon.spy(parser, 'step');
			var child = ['test'];
			var node = ['?', '', '', '', child];

			parser.step(node, stack);

			assert.isTrue(notify.calledOnce);
			assert.isTrue(notify.calledWith(node, stack));
			assert.isTrue(step.calledTwice);
			assert.isTrue(step.calledWith(node, stack));
			assert.isTrue(step.calledWith(child, stack));
			assert.isTrue(stack.push.calledOnce);
			assert.isTrue(stack.pop.calledOnce);
		});

		it('Should notify clients when it encounters a `#` node and step into the children', function() {
			var notify = sinon.stub(parser, 'notify');
			var step = sinon.spy(parser, 'step');
			var child = ['test'];
			var node = ['#', '', '', '', child];

			parser.step(node, stack);

			assert.isTrue(notify.calledOnce);
			assert.isTrue(notify.calledWith(node, stack));
			assert.isTrue(step.calledTwice);
			assert.isTrue(step.calledWith(node, stack));
			assert.isTrue(step.calledWith(child, stack));
			assert.isTrue(stack.push.calledOnce);
			assert.isTrue(stack.pop.calledOnce);
		});

		it('Should notify clients when it encounters a `^` node and step into the children', function() {
			var notify = sinon.stub(parser, 'notify');
			var step = sinon.spy(parser, 'step');
			var child = ['test'];
			var node = ['^', '', '', '', child];

			parser.step(node, stack);

			assert.isTrue(notify.calledOnce);
			assert.isTrue(notify.calledWith(node, stack));
			assert.isTrue(step.calledTwice);
			assert.isTrue(step.calledWith(node, stack));
			assert.isTrue(step.calledWith(child, stack));
			assert.isTrue(stack.push.calledOnce);
			assert.isTrue(stack.pop.calledOnce);
		});

		it('Should notify clients when it encounters an `@` node and step into the children', function() {
			var notify = sinon.stub(parser, 'notify');
			var step = sinon.spy(parser, 'step');
			var child = ['test'];
			var node = ['@', '', '', '', child];

			parser.step(node, stack);

			assert.isTrue(notify.calledOnce);
			assert.isTrue(notify.calledWith(node, stack));
			assert.isTrue(step.calledTwice);
			assert.isTrue(step.calledWith(node, stack));
			assert.isTrue(step.calledWith(child, stack));
			assert.isTrue(stack.push.calledOnce);
			assert.isTrue(stack.pop.calledOnce);
		});

		it('Should notify clients when it encounters a `<` node and step into the children', function() {
			var notify = sinon.stub(parser, 'notify');
			var step = sinon.spy(parser, 'step');
			var child = ['test'];
			var node = ['<', '', '', '', child];

			parser.step(node, stack);

			assert.isTrue(notify.calledOnce);
			assert.isTrue(notify.calledWith(node, stack));
			assert.isTrue(step.calledTwice);
			assert.isTrue(step.calledWith(node, stack));
			assert.isTrue(step.calledWith(child, stack));
			assert.isTrue(stack.push.notCalled);
			assert.isTrue(stack.pop.notCalled);
		});

		it('Should notify clients when it encounters a `partial` node and step into the children', function() {
			var notify = sinon.stub(parser, 'notify');
			var step = sinon.spy(parser, 'step');
			var child = ['test'];
			var node = ['partial', child];

			parser.step(node, stack);

			assert.isTrue(notify.calledOnce);
			assert.isTrue(notify.calledWith(node, stack));
			assert.isTrue(step.calledTwice);
			assert.isTrue(step.calledWith(node, stack));
			assert.isTrue(step.calledWith(child, stack));
			assert.isTrue(stack.push.calledOnce);
			assert.isTrue(stack.pop.calledOnce);
		});

		it('Should notify clients when it encounters a `%` node', function() {
			var notify = sinon.stub(parser, 'notify');
			var step = sinon.spy(parser, 'step');
			var node = ['%'];

			parser.step(node, stack);

			assert.isTrue(notify.calledOnce);
			assert.isTrue(notify.calledWith(node, stack));
			assert.isTrue(step.calledOnce);
			assert.isTrue(step.calledWith(node, stack));
		});

		it('Should notify clients when it encounters a `comment` node', function() {
			var notify = sinon.stub(parser, 'notify');
			var step = sinon.spy(parser, 'step');
			var node = ['comment'];

			parser.step(node, stack);

			assert.isTrue(notify.calledOnce);
			assert.isTrue(notify.calledWith(node, stack));
			assert.isTrue(step.calledOnce);
			assert.isTrue(step.calledWith(node, stack));
		});

		it('Should notify clients when it encounters a `reference` node', function() {
			var notify = sinon.stub(parser, 'notify');
			var step = sinon.spy(parser, 'step');
			var node = ['reference'];

			parser.step(node, stack);

			assert.isTrue(notify.calledOnce);
			assert.isTrue(notify.calledWith(node, stack));
			assert.isTrue(step.calledOnce);
			assert.isTrue(step.calledWith(node, stack));
		});

		it('Should notify clients when it encounters a `special` node', function() {
			var notify = sinon.stub(parser, 'notify');
			var step = sinon.spy(parser, 'step');
			var node = ['special'];

			parser.step(node, stack);

			assert.isTrue(notify.calledOnce);
			assert.isTrue(notify.calledWith(node, stack));
			assert.isTrue(step.calledOnce);
			assert.isTrue(step.calledWith(node, stack));
		});

		it('Should step into the child branches when it encounters a `param` node', function() {
			var notify = sinon.stub(parser, 'notify');
			var step = sinon.spy(parser, 'step');
			var branch1 = ['test 1'];
			var branch2 = ['test 2'];
			var node = ['param', branch1, branch2];

			parser.step(node, stack);

			assert.isTrue(notify.notCalled);
			assert.isTrue(step.calledThrice);
			assert.isTrue(step.calledWith(node, stack));
			assert.isTrue(step.calledWith(branch1, stack));
			assert.isTrue(step.calledWith(branch2, stack));
		});
	});

	describe('walk', function() {
		it('Should walk all but the first top level nodes by default', function() {
			var step = sinon.stub(parser, 'step');
			var nodes = ['node 1', 'node 2', 'node 3'];
			var stack = [];

			parser.walk(nodes, stack);

			assert.isFalse(step.calledWith(nodes[0]));
			assert.isTrue(step.calledWith(nodes[1], stack));
			assert.isTrue(step.calledWith(nodes[2], stack));
		});

		it('Should allow an `endOffset` config option to control where the iteration stops', function() {
			var step = sinon.stub(parser, 'step');
			var nodes = ['node 1', 'node 2', 'node 3'];
			var stack = [];

			parser.walk(nodes, stack, {endOffset: 1});

			assert.isFalse(step.calledWith(nodes[0]));
			assert.isTrue(step.calledWith(nodes[1], stack));
			assert.isFalse(step.calledWith(nodes[2]));
		});

		it('Should allow a `startOffset` config option to control where the iteration starts', function() {
			var step = sinon.stub(parser, 'step');
			var nodes = ['node 1', 'node 2', 'node 3'];
			var stack = [];

			parser.walk(nodes, stack, {startOffset: 0});

			assert.isTrue(step.calledWith(nodes[0], stack));
			assert.isTrue(step.calledWith(nodes[1], stack));
			assert.isTrue(step.calledWith(nodes[2], stack));
		});
	});

	describe('notify', function() {
		it('Should emit a `node` event with a `Node` object and the raw node from the AST', function() {
			var emit = sinon.stub(parser, 'emit');
			var node = ['test'];
			var stack = [];

			parser.notify(node, stack);

			assert.isTrue(emit.calledOnce);
			assert.strictEqual(emit.firstCall.args.length, 3);
			assert.strictEqual(emit.firstCall.args[0], 'node');
			assert.instanceOf(emit.firstCall.args[1], Node);
			assert.strictEqual(emit.firstCall.args[2], node);
		});
	});
});
