(function() {
	'use strict';

	/* global ionic: true */

	angular.module('opennms.services.DB', [
		'ionic',
		'angularLocalStorage',
		'pouchdb',
		'uuid4',
	])
	.config(function(pouchDBProvider, POUCHDB_METHODS) {
		var extraMethods = {
			createIndex: 'qify',
			getIndexes: 'qify',
			deleteIndex: 'qify',
			find: 'qify',
		};
		pouchDBProvider.methods = angular.extend({}, POUCHDB_METHODS, extraMethods);
	}).factory('db', function($rootScope, storage, pouchDB, uuid4) {
		console.log('DB: Initializing.');

		var db = pouchDB('compass');
		db.allDocs({
			include_docs: true
		}).then(function(docs) {
			/*
			console.log('all docs: ' + angular.toJson(docs));
			for (var i=0; i < docs.rows.length; i++) {
				db.remove(docs.rows[i].doc);
			} */
			return docs;
		});

		return db;
	});

}());
