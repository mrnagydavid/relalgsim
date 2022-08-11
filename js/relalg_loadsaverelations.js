/**
	Relational Algebra Simulator
	author: David Nagy (mrnagydavid)
	
	version: 1.0
	
	@license MIT
*/
"use strict";
var __RELALG_LOADSAVERELS = true;
var _NOSTORAGE;
if (typeof(Storage) === "undefined") {
    _NOSTORAGE = true;
} else {
	_NOSTORAGE = false;
}

/**
 *	LoadSaveRelations namespace holds practical methods to work with HTML5 Local Storage to load and save relations.
 *	@namespace LoadSaveRelations
 */
var LoadSaveRelations = {	
	prefix: "rel_",
	
	check: function() {
		if (_NOSTORAGE) {
			return new RASNoStorageBrowser();
		}
	},
	
	/**
	 *	Add a new relation to the local database.
	 *	@param {String} name Name of the relation to save
	 *	@param {String} data Data rows of the relation to save
	 */
	add: function(name, data) {
		LoadSaveRelations.check();
		localStorage.setItem(LoadSaveRelations.prefix + name, data);
	},
	
	/**
	 *	Get a saved relation from the local database.
	 *	@param {String} name Name of the relation to save
	 *	@param {String} data Data rows of the relation to save
	 *	@return {String|null}
	 */
	get: function(name, data) {
		LoadSaveRelations.check();
		return localStorage.getItem(LoadSaveRelations.prefix + name);
	},
	
	/**
	 *	Get a list of names of the saved relations in the local database.
	 *	@return {String[]}
	 */
	listNames: function() {
		LoadSaveRelations.check();
		var i;
		var key;
		var name;
		var result = [];
		
		for (i = 0; i < localStorage.length; ++i) {
			key = localStorage.key(i);
			if (key.match("^" + LoadSaveRelations.prefix) != null) {
				name = key.slice(LoadSaveRelations.prefix.length);
				result.push(name);
			}
		}
		
		return result.sort();
	},
	
	/**
	 *	Check if a relation with a certain name is already in the local database.
	 *	@param {String} name Name of the relation
	 *	@return {boolean}
	 */
	exists: function(name) {
		LoadSaveRelations.check();
		return localStorage.getItem(LoadSaveRelations.prefix + name) != null;
	},
	
	/**
	 *	Delete a relation from the local database.
	 *	@param {String} name Name of the relation
	 */
	del: function(name) {
		LoadSaveRelations.check();
		localStorage.removeItem(LoadSaveRelations.prefix + name);
	}
};

var LSR = LoadSaveRelations;