(function() {
	'use strict';

	/* global ionic: true */
	/* global AvailabilityNode: true */
	/* global AvailabilitySection: true */

	angular.module('opennms.services.Availability', [
		'ionic',
		'opennms.services.Rest',
	])
	.factory('AvailabilityService', function($q, $rootScope, RestService, util) {
		console.log('AvailabilityService: Initializing.');

		var hasAvailability;

		var checkAvailability = function() {
			var oldAvailability = hasAvailability;
			var done = function(value) {
				if (oldAvailability) {
					oldAvailability.resolve(value);
				}
				hasAvailability.resolve(value);
			};

			hasAvailability = $q.defer();
			console.log('AvailabilityService.checkAvailability: checking if availability service is valid.');
			RestService.getXml('/availability').then(function() {
				console.log('AvailabilityService.checkAvailability: availability service works!');
				done(true);
			}, function() {
				console.log('AvailabilityService.checkAvailability: availability service does not work. :(');
				done(false);
			});
		};

		var isSupported = function() {
			return hasAvailability.promise;
		};

		var getAvailability = function() {
			return isSupported().then(function(canDo) {
				if (canDo) {
					return RestService.getXml('/availability').then(function(results) {
						/* jshint -W069 */ /* "better written in dot notation" */
						var ret = [];

						if (results && results.availability && results.availability.section) {
							var sections = results.availability.section;
							if (!angular.isArray(sections)) {
								sections = [sections];
							}
							for (var i=0; i < sections.length; i++) {
								ret.push(new AvailabilitySection(sections[i]));
							}
						}

						return ret;
					});
				} else {
					return [];
				}
			}, function(err) {
				err.caller = 'AvailabilityService.getAvailability';
				return $q.reject(err);
			});
		};

		var getCategory = function(category) {
			return isSupported().then(function(canDo) {
				if (canDo) {
					var url = '/availability/' + encodeURIComponent(category);
					return RestService.getXml(url);
				} else {
					return [];
				}
			}, function(err) {
				err.caller = 'AvailabilityService.getCategory';
				return $q.reject(err);
			});
		};

		var getNodes = function(category) {
			return isSupported().then(function(canDo) {
				if (canDo) {
					var url = '/availability/' + encodeURIComponent(category) + '/nodes';
					return RestService.getXml(url);
				} else {
					return [];
				}
			}, function(err) {
				err.caller = 'AvailabilityService.getNodes';
				return $q.reject(err);
			});
		};

		var getNode = function(node) {
			return isSupported().then(function(canDo) {
				if (canDo) {
					var nodeId = node;
					if (!angular.isNumber(node)) {
						nodeId = node.id;
					}
					var url = '/availability/nodes/' + nodeId;
					return RestService.getXml(url).then(function(results) {
						if (results && results.node) {
							return new AvailabilityNode(results.node);
						} else {
							return undefined;
						}
					});
				} else {
					return undefined;
				}
			}, function(err) {
				err.caller = 'AvailabilityService.getNode';
				return $q.reject(err);
			});
		};

		util.onSettingsUpdated(checkAvailability);
		util.onServersUpdated(checkAvailability);
		checkAvailability();

		return {
			supported: isSupported,
			availability: getAvailability,
			category: getCategory,
			nodes: getNodes,
			node: getNode,
		};
	});

}());
