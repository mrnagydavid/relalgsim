/**
	Relational Algebra Simulator
	author: David Nagy (mrnagydavid)
	
	version: 1.0
	
	@license MIT
*/
"use strict";
var __RELALG_ATTRIBUTES = true;

/**
 *	Attributes class handles the attributes of relations for both the SymbolManager, the Relation class and even the Operation classes.
 *	It manages the attributes, looks up relative and absolute references and makes sure there is no ambiguousity in the attribute list.
 *	@constructor
 *	@param {String} relationName The name of the relation the Attributes object belongs to.
 */
function Attributes(relationName) {
	var that = this;
	/**
	 * The name of the relation this set of attributes belong to.
	 * In case a new attribute is added that is relative (without owner, e.g. "att1"),
	 * then the current relation will take ownership of it.
	 */
	var name = relationName;
	/**
	 * The names of the attributes in this set.
	 */
	var names = [];
	/**
	 * The names of the relations that own the attributes in this set.
	 * @example names[0] is the attribute name, origins[0] is the owner relation's name.
	 */
	var origins = [];
	
	/**
	 *	Shows the number of attributes.
	 */
	this.length = 0;
	
	/**
	 *	This method adds attributes to the list.
	 *	@param {String} attribute The name of the attribute to be appended to the list. It can be either relative ("att1") or absolute ("R.att1").
	 *	@param {String} relation The name of the relation the attributes originates from. If omitted, the current relation takes ownership.
	 *	@return {boolean}
	 */
	this.add = function(attribute, relation) {
		var att, rel;
		if (attribute.indexOf('.') !== -1) {
			att = attribute.split('.')[1];
			rel = attribute.split('.')[0];
		} else {
			att = attribute;
		}
		if (typeof relation !== 'undefined' && relation.length > 0) {
			rel = relation;
		} else if (typeof rel === 'undefined') {
			rel = name;
		}
		
		if (that.has(att, rel)) {
			throw new RASAlreadyDefinedError(attribute, i18n.attribute[lang]);
		}

		names.push(att);
		origins.push(rel);
		that.length = names.length;
		return true;
	}
	
	/**
	 *	This method checks if an attribute is in the attribute list. If the attribute name is ambiguous, it throws an error.
	 *	@param {String} attribute The name of the attribute to check. It can be either relative ("att1") or absolute ("R.att1").
	 *	@param {String} relation [Optional] The name of the relation that originally carried the attribute. It is the same as specifying an absolute attribute: has("att1","R") === has("R.att1"),
	 *	but if 'relation' is specified, it takes precedence over an absolute attribute: has("P.att1", "R") === has("att1", "R").
	 *	@return {boolean}
	 */
	this.has = function(attribute, relation) {
		var rel;
		var att;
		var positions = [];
		var i;
		
		if (attribute.indexOf('.') !== -1) {
			att = attribute.split('.')[1];
			rel = attribute.split('.')[0];
		} else {
			att = attribute;
		}
		if (typeof relation !== 'undefined' && relation.length > 0) {
			rel = relation;
		}
		names.map(function(curval, ind) { if (curval===att) positions.push(ind); });
		
		if (typeof rel === 'undefined' && positions.length > 1) {
			throw new RASAmbiguousError(attribute, i18n.attribute[lang]);
		}
		
		// by this point, all ambiguousity should have been checked
		for (i in positions) {
			if (names[positions[i]] === att && (typeof rel === 'undefined' || origins[positions[i]] === rel)) return true;
		}
		
		return false;
	}
	
	/**
	 *	This method creates an Array of attribute names, where the attribute names are unique and verbose, meaning that they will be absolute.
	 *	@return {String[]}
	 */
	this.getAttributes = function() {
		var i;
		var result = [];
		
		for (i in names) {
			result.push(origins[i] + "." + names[i]);
		}
		
		return result;
	}
	
	/**
	 *	This method creates an Array of attribute names only (with no origin or relation name), where the attribute names might not be unique.
	 *	@return {String[]}
	 */
	this.getAttributesOnly = function() {		
		return names.slice(0);
	}
	
	/**
	 *	This method creates an Array of attribute names, where the attribute names are unique and verbose only if the attribute name in itself would be ambiguous.
	 *	@example	
	 *	this.setAttributes("R.att1", "R.att2", "S.att3", "S.att2");
	 *	assert(this.getAttributesUnique() === ["att1", "R.att2", "att3", "S.att2"]);
	 *	@return {String[]}
	 */
	this.getAttributesUnique = function() {	
		var i;
		var result = [];
		
		for (i in names) {
			if (names.indexOf(names[i]) < i || names.lastIndexOf(names[i]) > i) {
				result.push(origins[i] + "." + names[i]);
			} else {
				result.push(names[i]);
			}
		}
		return result;
	}
	
	/**
	 *	This method is used to set multiple attributes at once, overwriting the currently held attributes completely. It uses the add method on the parameter once it is processed.
	 *	@param {(String|Array|Attributes)} attributes The attributes to be set. It can either be a CSV-like string ("att1;att2;P.att3") or an array of attributes like the result of getAttributes.
	 *	Or also an Attributes object.
	 *	@return {boolean}
	 */
	this.set = function(attributes) {
		var atts;
		var i;
		
		if (typeof attributes === "string") {
			atts = attributes.split(';');
		} else {
			if (attributes.constructor === Array) {
				atts = attributes;
			} else if (attributes.constructor === Attributes) {
				atts = attributes.getAttributes();
				return true;
			}
		}
		
		for (i in atts) {
			that.add(atts[i].trim());
		}
		
		return true;
	}
	
	/**
	 *	This method renames an attribute in the list to a new name. If the attribute originated from a different relation, the current relation takes ownership.
	 *	@param {String} newname
	 *	@param {String} oldname
	 *	@return {boolean}
	 */
	this.rename = function(newname, oldname) {
		var positions;
		var rel, att;
		var i;
		if (that.has(newname, name)) {
			throw new RASAlreadyDefinedError(newname, i18n.attribute[lang]);
		}
		if (oldname.indexOf('.') !== -1) {
			att = oldname.split('.')[1];
			rel = oldname.split('.')[0];
		} else {
			att = oldname;
		}
		
		positions = [];
		names.map(function(curval, ind) { if (curval===att) positions.push(ind); });
		
		if (positions.length > 1) {
			if (typeof rel === 'undefined') {
				throw new RASAmbiguousError(oldname, i18n.attribute[lang]);
			}
		} 
		for (i in positions) {
			if (typeof rel === 'undefined' || origins[positions[i]] === rel) {
				names[positions[i]] = newname;
				origins[positions[i]] = name;
				return true;
			}
		}
		
		throw new RASNotDefinedError(oldname, i18n.attribute[lang]);
	}
	
	/**
	 *	This method is used to create a dictionary object where the fieldnames are the original attributes and their values are the attribute names that are unique and verbose,
	 *	meaning that they are absolute. Note that only those fieldnames will be included in the dictionary that already exist, non-existing attribute names are skipped.
	 *	An exception is generated if an attribute is ambiguous.
	 *	@param {String[]} attributes Array of strings as attribute names.
	 *	@return {AttributeDictionary}
	 */
	this.translateAttributes = function(attributes) {
		var i, o;
		var positions;
		var att, rel;
		var result = {};
		
		for (i in attributes) {
			att = undefined;
			rel = undefined;
			if (attributes[i].indexOf('.') !== -1) {
				att = attributes[i].split('.')[1];
				rel = attributes[i].split('.')[0];
			} else {
				att = attributes[i];
			}
			
			positions = [];
			names.map(function(curval, ind) { if (curval===att) positions.push(ind); });
			
			if (typeof rel === 'undefined' && positions.length > 1) {
				throw new RASAmbiguousError(attributes[i], i18n.attribute[lang]);
			}
		
			// by this point, all ambiguousity should have been checked
			for (o in positions) {
				if (names[positions[o]] === att) {
					if (typeof rel === 'undefined' || positions.length === 1) {
						result[attributes[i]] = origins[positions[o]] + "." + att;
					} else if (origins[positions[o]] === rel) {
						result[attributes[i]] = rel + "." + att;
					}
				}
			}
		}
		
		return result;
	}
	
	/**
	 *	This method is used to combine the attribute list with another attribute list exactly as it would happen during the crossproduction of two relations.
	 *	@param {String[]} attributes Array of strings as attribute names, preferably the result of a getAttributes() call.
	 *	@return {boolean}
	 */
	this.crossproduct = function(attributes) {
		var i;
		for (i in attributes) {
			that.add(attributes[i]);
		}
		return true;
	}
	
	/**
	 *	This method is used to combine the attribute list with another attribute list exactly as it would happen during the joining of two relations.
	 *	@param {String[]} attributes Array of strings as absolute attribute names, preferably the result of a getAttributes() call.
	 *	@return {boolean}
	 */
	this.naturaljoin = function(attributes) {
		var i;
		var att, rel;
		var positions;
		
		for (i in attributes) {
			att = attributes[i].split('.')[1];
			rel = attributes[i].split('.')[0];
			
			positions = [];
			names.map(function(curval, ind) { if (curval===att) positions.push(ind); });
			
			if (positions.length > 1) {
				throw new RASAmbiguousError(attributes[i], i18n.attribute[lang]);
			} else if (positions.length === 1) {
				origins[positions[0]] = name;
			} else {
				that.add(att, rel);
			}
		}
		
		return true;
	}
	
	/**
	 *	This method is used to changed the attribute list by another attribute list exactly as it would happen during the division of two relations.
	 *	"It is usually required that the attribute names in the header of S are a subset of those of R because otherwise the result of the operation will always be empty."
	 *	(http://en.wikipedia.org/wiki/Relational_algebra#Division_.28.C3.B7.29)
	 *	@param {(Array|Attributes)} attributes Array of strings as absolute attribute names, preferably the result of a getAttributes() call or the Attributes object itself.
	 *	@return {boolean}
	 *	@see {@link http://en.wikipedia.org/wiki/Relational_algebra#Division_.28.C3.B7.29}
	 */
	this.divide = function(attributes) {
		var attso = [];
		var i;
		var todelete = [];
		
		if (attributes.constructor === Array) {
			for (i in attributes) {
				if (attributes[i].indexOf('.') !== -1) {
					attso.push(attributes[i].split('.')[1]);
				} else {
					attso.push(attributes[i]);
				}
			}
		} else if (attributes.constructor === Attributes) {
			attso = attributes.getAttributesOnly()
		} else {
			return false;
		}
		
		for (i in attso) {
			todelete.push(names.indexOf(attso[i]));
		}
		
		for (i in todelete) {
			if (todelete[i] === -1) throw new RASNotSubsetError();
			delete names[todelete[i]];
			delete origins[todelete[i]];
		}
		that.length = names.length;
		return true;
	}
}