var assert = require('assert');
var EventTransport = require('./helpers/event-transport.js').EventTransport;
var createScope = require('./helpers/event-transport.js').createScope;

describe('EventTransport', function() {
    var scope;

    beforeEach(function() {
        scope = createScope();
    });
    afterEach(function() {
        scope.destroy();
        scope = null;
    });

    it('create a transport with no pair', function(done) {
        new EventTransport('foo', 'bar');

        scope.await(function(messages) {
            assert.deepEqual(messages, [
                { from: 'foo:...', to: 'bar:connect', payload: { initiator: 'foo', inited: false, endpoints: [] } }
            ]);
            done();
        });
    });

    it('create transport pair in one frame', function(done) {
        new EventTransport('foo', 'bar');
        new EventTransport('bar', 'foo');

        scope.await(function(messages) {
            assert.deepEqual(messages, [
                { from: 'foo:...', to: 'bar:connect', payload: { initiator: 'foo', inited: false, endpoints: [] } },
                { from: 'bar:...', to: 'foo:connect', payload: { initiator: 'bar', inited: false, endpoints: [] } },
                { from: 'bar:...', to: 'foo:connect', payload: { initiator: 'bar', inited: true, endpoints: [] } },
                { from: 'bar:...', to: 'foo:...',     payload: { type: 'connect',  endpoints: [] } },
                { from: 'foo:...', to: 'bar:connect', payload: { initiator: 'foo', inited: true, endpoints: [] } },
                { from: 'foo:...', to: 'bar:...',     payload: { type: 'connect',  endpoints: [] } },
                { from: 'foo:...', to: 'bar:...',     payload: { type: 'connect',  endpoints: [] } },
                { from: 'bar:...', to: 'foo:...',     payload: { type: 'connect',  endpoints: [] } }
            ]);
            done();
        });
    });

    it('create transport pair in different frames', function(done) {
        new EventTransport('foo', 'bar');

        scope.await(function(messages) {
            assert.deepEqual(messages, [
                { from: 'foo:...', to: 'bar:connect', payload: { initiator: 'foo', inited: false, endpoints: [] } }
            ]);

            new EventTransport('bar', 'foo');

            scope.await(function(messages) {
                assert.deepEqual(messages, [
                    { from: 'bar:...', to: 'foo:connect', payload: { initiator: 'bar', inited: false, endpoints: [] } },
                    { from: 'foo:...', to: 'bar:connect', payload: { initiator: 'foo', inited: true, endpoints: [] } },
                    { from: 'foo:...', to: 'bar:...', payload: { type: 'connect', endpoints: [] } },
                    { from: 'bar:...', to: 'foo:...', payload: { type: 'connect', endpoints: [] } }
                ]);
                done();
            });
        });
    });

    it('transports created in one frame should not connect when no full match (foo->bar && bar->baz)', function(done) {
        new EventTransport('foo', 'bar');
        new EventTransport('bar', 'baz');

        scope.await(function(messages) {
            assert.deepEqual(messages, [
                { from: 'foo:...', to: 'bar:connect', payload: { initiator: 'foo', inited: false, endpoints: [] } },
                { from: 'bar:...', to: 'baz:connect', payload: { initiator: 'bar', inited: false, endpoints: [] } }
            ]);

            done();
        });
    });

    it('transports created in different frames should not connect when no full match (foo->bar && bar->baz)', function(done) {
        new EventTransport('foo', 'bar');

        scope.await(function(messages) {
            assert.deepEqual(messages, [
                { from: 'foo:...', to: 'bar:connect', payload: { initiator: 'foo', inited: false, endpoints: [] } }
            ]);

            new EventTransport('bar', 'baz');
            scope.await(function(messages) {
                assert.deepEqual(messages, [
                    { from: 'bar:...', to: 'baz:connect', payload: { initiator: 'bar', inited: false, endpoints: [] } }
                ]);
                done();
            });
        });
    });

    it('transports created in one frame should not connect when no full match (foo->bar && baz->foo)', function(done) {
        new EventTransport('foo', 'bar');
        new EventTransport('baz', 'foo');

        scope.await(function(messages) {
            assert.deepEqual(messages, [
                { from: 'foo:...', to: 'bar:connect', payload: { initiator: 'foo', inited: false, endpoints: [] } },
                { from: 'baz:...', to: 'foo:connect', payload: { initiator: 'baz', inited: false, endpoints: [] } }
            ]);

            done();
        });
    });

    it('transports created in different frames should not connect when no full match (foo->bar && baz->foo)', function(done) {
        new EventTransport('foo', 'bar');

        scope.await(function(messages) {
            assert.deepEqual(messages, [
                { from: 'foo:...', to: 'bar:connect', payload: { initiator: 'foo', inited: false, endpoints: [] } }
            ]);

            new EventTransport('baz', 'foo');
            scope.await(function(messages) {
                assert.deepEqual(messages, [
                    { from: 'baz:...', to: 'foo:connect', payload: { initiator: 'baz', inited: false, endpoints: [] } }
                ]);
                done();
            });
        });
    });
});
