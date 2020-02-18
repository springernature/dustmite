
'use strict';

var dust = require('dustjs-linkedin');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Node = require('./node');

var Parser = function() {
	EventEmitter.call(this);
};
util.inherits(Parser, EventEmitter);

Parser.prototype.parse = function(content, reporter) {
	var ast = [];

	try {
		ast = dust.parse(content);
	} catch (e) {
		reporter.add(e.line, e.column, e.message);
	}

	if (ast.length) {
		this.step(ast, []);
	}
};

Parser.prototype.walk = function(node, stack, options) {
	options = options || {};

	var i = typeof options.startOffset !== 'undefined' ? options.startOffset : 1;
	var len = node.length - (options.endOffset || 0);
	for (; i < len; ++i) {
		this.step(node[i], stack);
	}
};

Parser.prototype.step = function(node, stack) {
	// jshint maxcomplexity: 14
	switch (node[0]) {
		case 'body':
			this.walk(node, stack, {endOffset: 2});
		break;
		case 'bodies':
			this.walk(node, stack);
		break;
		case '?':
		case '#':
		case '^':
		case '@':
			this.notify(node, stack);
			stack.push(new Node(node));
			this.step(node[4], stack);
			stack.pop();
		break;
		case '+':
		case '<':
			this.notify(node, stack);
			this.step(node[4], stack);
		break;
		case 'param':
			this.step(node[1], stack);
			this.step(node[2], stack);
		break;
		case 'partial':
			this.notify(node, stack);
			stack.push(new Node(node));
			this.step(node[1], stack);
			stack.pop();
		break;
		case '%':
		case 'comment':
		case 'reference':
		case 'special':
			this.notify(node, stack);
		break;
	}
};

Parser.prototype.notify = function(node, stack) {
	this.emit('node', new Node(node, stack), node);
};

module.exports = Parser;
