
'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var sinon = require('sinon');
var path = require('path');

var modulePath = path.join(__dirname, '..', '..', 'lib', 'cli');

describe('cli', function() {
	var logger;
	var fs;
	var path;
	var glob;
	var cli;

	beforeEach(function() {
		fs = require('../mock/fs');
		path = require('../mock/path');
		glob = require('../mock/glob');
		logger = require('../mock/logger');

		mockery.registerMock('fs', fs);
		mockery.registerMock('path', path);
		mockery.registerMock('glob', glob);
		mockery.registerMock('./logger', logger);

		sinon.stub(process, 'cwd').returns('/cwd');

		cli = require(modulePath);
	});

	afterEach(function() {
		process.cwd.restore();
	});

	describe('getFiles', function() {
		beforeEach(function() {
			path.join.withArgs('/cwd', '.dustmiteignore').returnsArg(1);
		});

		it('Should read from the `.dustmiteignore` file', function() {
			fs.readFileSync.withArgs('.dustmiteignore').returns('');

			cli.getFiles({path: 'foo'});
			assert.isTrue(fs.readFileSync.calledOnce);
			assert.isTrue(fs.readFileSync.calledWith('.dustmiteignore'));
		});

		it('Should not throw if the `.dustmiteignore` file does not exist', function() {
			fs.readFileSync.withArgs('.dustmiteignore').throws(new Error());

			assert.doesNotThrow(function() {
				cli.getFiles({path: 'foo'});
			});
		});

		it('Should stat the file provided in `args.path`', function() {
			fs.readFileSync.withArgs('.dustmiteignore').returns('');

			cli.getFiles({path: 'foo'});
			assert.isTrue(fs.lstatSync.calledWith('foo'));
		});

		it('Should not throw if the stat fails, but the error should be logged', function() {
			fs.readFileSync.withArgs('.dustmiteignore').returns('');
			fs.lstatSync.withArgs('foo').throws(new Error('Error!'));

			assert.doesNotThrow(function() {
				cli.getFiles({path: 'foo'});
			});
			assert.isTrue(logger.get().error.calledWith('Error!'));
		});

		it('Should use `args.extensions` to glob a directory', function() {
			fs.readFileSync.withArgs('.dustmiteignore').returns('');
			fs.lstatSync.withArgs('foo').returns({
				isDirectory: sinon.stub().returns(true),
				isFile: sinon.stub().returns(false)
			});
			glob.sync.returns([]);

			var files = cli.getFiles({
				path: 'foo',
				extensions: 'dust'
			});
			assert.isTrue(glob.sync.calledWith('foo/**/*.dust'));
			assert.isArray(files);
		});

		it('Should resolve the path for each file returned', function() {
			fs.readFileSync.withArgs('.dustmiteignore').returns('');
			fs.lstatSync.withArgs('foo').returns({
				isDirectory: sinon.stub().returns(true),
				isFile: sinon.stub().returns(false)
			});
			glob.sync.returns(['a', 'b', 'c']);
			path.resolve.returnsArg(0);

			var files = cli.getFiles({
				path: 'foo',
				extensions: 'dust'
			});
			assert.isTrue(path.resolve.calledThrice);
			assert.isTrue(path.resolve.calledWith('a'));
			assert.isTrue(path.resolve.calledWith('b'));
			assert.isTrue(path.resolve.calledWith('c'));
			assert.strictEqual(files.length, 3);
			assert.strictEqual(files[0], 'a');
			assert.strictEqual(files[1], 'b');
			assert.strictEqual(files[2], 'c');
		});

		it('Should filter out any files found in `.dustmiteignore`', function() {
			fs.readFileSync.withArgs('.dustmiteignore').returns('\nb\n');
			fs.lstatSync.withArgs('foo').returns({
				isDirectory: sinon.stub().returns(true),
				isFile: sinon.stub().returns(false)
			});
			glob.sync.returns(['a', 'b', 'c']);
			path.resolve.returnsArg(0);

			var files = cli.getFiles({
				path: 'foo',
				extensions: 'dust'
			});
			assert.strictEqual(files.length, 2);
			assert.strictEqual(files[0], 'a');
			assert.strictEqual(files[1], 'c');
		});

		it('Should return an array with the resolved path of `args.path` if it is a file', function() {
			fs.readFileSync.withArgs('.dustmiteignore').returns('\nb\n');
			fs.lstatSync.withArgs('foo').returns({
				isDirectory: sinon.stub().returns(false),
				isFile: sinon.stub().returns(true)
			});
			path.resolve.returnsArg(0);

			var files = cli.getFiles({path: 'foo'});
			assert.isTrue(path.resolve.calledOnce);
			assert.isTrue(path.resolve.calledWith('foo'));
			assert.strictEqual(files.length, 1);
			assert.strictEqual(files[0], 'foo');
		});
	});

	describe('getRules', function() {
		var customRules;
		var defaultRules;

		beforeEach(function() {
			customRules = [
				{
					type: 'reference',
					test: function() { }
				},
				{
					type: 'reference',
					test: function() { },
					meta: 'foo'
				},
				{
					type: '?',
					test: function() { }
				}
			];

			defaultRules = {
				someRule: {
					type: 'reference',
					test: function() { }
				},
				someOtherRule: {
					type: 'reference',
					test: function() { }
				},
				helperRule: {
					type: '@',
					test: function() { }
				}
			};

			path.join.withArgs('/cwd', '.dustmiterc').returnsArg(1);
			mockery.registerMock('custom-rules', customRules);
			mockery.registerMock('./rules', defaultRules);
		});

		it('Should read from the `.dustmiterc` file', function() {
			fs.readFileSync.withArgs('.dustmiterc').returns('');

			cli.getRules({});
			assert.isTrue(fs.readFileSync.calledOnce);
			assert.isTrue(fs.readFileSync.calledWith('.dustmiterc'));
		});

		it('Should not throw if the `.dustmiterc` file does not exist', function() {
			fs.readFileSync.withArgs('.dustmiterc').throws(new Error());

			assert.doesNotThrow(function() {
				cli.getRules({});
			});
		});

		it('Should load default rules from `.dustmiterc`', function() {
			fs.readFileSync.withArgs('.dustmiterc').returns('{"someRule": true, "someOtherRule": true, "helperRule": true}');

			var rules = cli.getRules({});

			assert.isObject(rules);
			assert.isArray(rules.reference);
			assert.strictEqual(rules.reference.length, 2);
			assert.strictEqual(rules.reference[0], defaultRules.someRule.test);
			assert.strictEqual(rules.reference[1], defaultRules.someOtherRule.test);
			assert.isArray(rules['@']);
			assert.strictEqual(rules['@'].length, 1);
			assert.strictEqual(rules['@'][0], defaultRules.helperRule.test);
		});

		it('Should not include default rules that aren\'t included in `.dustmiterc', function() {
			fs.readFileSync.withArgs('.dustmiterc').returns('{"someOtherRule": true, "helperRule": true}');

			var rules = cli.getRules({});

			assert.isObject(rules);
			assert.isArray(rules.reference);
			assert.strictEqual(rules.reference.length, 1);
			assert.strictEqual(rules.reference[0], defaultRules.someOtherRule.test);
			assert.isArray(rules['@']);
			assert.strictEqual(rules['@'].length, 1);
			assert.strictEqual(rules['@'][0], defaultRules.helperRule.test);
		});

		it('Should not include default rules that are explicitly disabled in `.dustmiterc', function() {
			fs.readFileSync.withArgs('.dustmiterc').returns('{"someRule": false, "someOtherRule": true}');

			var rules = cli.getRules({});

			assert.isObject(rules);
			assert.isArray(rules.reference);
			assert.strictEqual(rules.reference.length, 1);
			assert.strictEqual(rules.reference[0], defaultRules.someOtherRule.test);
		});

		it('Should add a `meta` property to the rule if it\'s specified in `.dustmiterc`', function() {
			fs.readFileSync.withArgs('.dustmiterc').returns('{"someRule": "foo"}');

			var rules = cli.getRules({});

			assert.isObject(rules);
			assert.isArray(rules.reference);
			assert.strictEqual(rules.reference.length, 1);
			assert.strictEqual(rules.reference[0].test, defaultRules.someRule.test);
			assert.strictEqual(rules.reference[0].meta, 'foo');
		});

		it('Should log an error if `.dustmiterc` includes an unknown rule', function() {
			fs.readFileSync.withArgs('.dustmiterc').returns('{"unknownRule": true}');

			cli.getRules({});

			assert.isTrue(logger.get().error.calledOnce);
			assert.isTrue(logger.get().error.calledWith('Unknown dustmite rule: unknownRule'));
		});

		it('Should throw an error if `.dustmiterc` is invalid JSON', function() {
			fs.readFileSync.withArgs('.dustmiterc').returns('{someRule: true}');

			assert.throws(function() {
				cli.getRules({});
			});
		});

		it('Should load rules from `args.rules`', function() {
			fs.readFileSync.withArgs('.dustmiterc').returns('');
			path.resolve.returnsArg(0);

			var rules = cli.getRules({rules: 'custom-rules'});

			assert.isTrue(path.resolve.calledWith('custom-rules'));
			assert.isObject(rules);
			assert.isArray(rules.reference);
			assert.strictEqual(rules.reference.length, 2);
			assert.strictEqual(rules.reference[0], customRules[0].test);
			assert.strictEqual(rules.reference[1].meta, customRules[1].meta);
			assert.strictEqual(rules.reference[1].test, customRules[1].test);
			assert.isArray(rules['?']);
			assert.strictEqual(rules['?'].length, 1);
			assert.strictEqual(rules['?'][0], customRules[2].test);
		});

		it('Should combine custom and default rules', function() {
			fs.readFileSync.withArgs('.dustmiterc').returns('{"someRule": true, "helperRule": true}');
			path.resolve.returnsArg(0);

			var rules = cli.getRules({rules: 'custom-rules'});

			assert.isTrue(path.resolve.calledWith('custom-rules'));
			assert.isObject(rules);
			assert.isArray(rules.reference);
			assert.strictEqual(rules.reference.length, 3);
			assert.strictEqual(rules.reference[0], customRules[0].test);
			assert.strictEqual(rules.reference[1].meta, customRules[1].meta);
			assert.strictEqual(rules.reference[1].test, customRules[1].test);
			assert.strictEqual(rules.reference[2], defaultRules.someRule.test);
			assert.isArray(rules['?']);
			assert.strictEqual(rules['?'].length, 1);
			assert.strictEqual(rules['?'][0], customRules[2].test);
			assert.isArray(rules['@']);
			assert.strictEqual(rules['@'].length, 1);
			assert.strictEqual(rules['@'][0], defaultRules.helperRule.test);
		});

		it('Should allow rules to apply to multiple types of node', function() {
			customRules = [
				{
					type: ['reference', '#'],
					test: function() { }
				},
				{
					type: 'reference',
					test: function() { },
					meta: 'foo'
				},
				{
					type: '?',
					test: function() { }
				}
			];

			defaultRules = {
				someRule: {
					type: 'reference',
					test: function() { }
				},
				someOtherRule: {
					type: ['reference', '^'],
					test: function() { }
				},
				helperRule: {
					type: '@',
					test: function() { }
				}
			};
			mockery.registerMock('custom-rules', customRules);
			mockery.registerMock('./rules', defaultRules);

			fs.readFileSync.withArgs('.dustmiterc').returns('{"someRule": true, "someOtherRule": true, "helperRule": true}');
			path.resolve.returnsArg(0);

			var rules = cli.getRules({rules: 'custom-rules'});
			assert.isObject(rules);
			assert.isArray(rules.reference);
			assert.strictEqual(rules.reference.length, 4);
			assert.strictEqual(rules.reference[0], customRules[0].test);
			assert.strictEqual(rules.reference[1].meta, customRules[1].meta);
			assert.strictEqual(rules.reference[1].test, customRules[1].test);
			assert.strictEqual(rules.reference[2], defaultRules.someRule.test);
			assert.strictEqual(rules.reference[3], defaultRules.someOtherRule.test);
			assert.isArray(rules['?']);
			assert.strictEqual(rules['?'].length, 1);
			assert.strictEqual(rules['?'][0], customRules[2].test);
			assert.isArray(rules['@']);
			assert.strictEqual(rules['@'].length, 1);
			assert.strictEqual(rules['@'][0], defaultRules.helperRule.test);
			assert.isArray(rules['#']);
			assert.strictEqual(rules['#'].length, 1);
			assert.strictEqual(rules['#'][0], customRules[0].test);
			assert.isArray(rules['^']);
			assert.strictEqual(rules['^'].length, 1);
			assert.strictEqual(rules['^'][0], defaultRules.someOtherRule.test);
		});
	});
});
