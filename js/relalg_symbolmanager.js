/**
	Relational Algebra Simulator
	author: David Nagy (mrnagydavid)
	
	version: 1.0
	
	@license MIT
*/
"use strict";
var __RELALG_SYMBOLMANAGER = true;

/***				 SymbolManager (SM)				 ***/

/**
 *	SymbolManager handles the symbols used during parsing. The parsing engine reads and writes symboles and checks if the algebraic expressions given by the user are semantically correct.
 *	The SM uses the Attributes class to manage the attributes of the relations in its symboltable.
 *	@constructor
 */
function SymbolManager() {
	
	var that = this;
	/**
	 * Dictionary of the attributes.
	 * The fieldnames are the names of the relations, and the values are references to
	 * the Attributes object.
	 * @see {@link RelationMap} for further information.
	 */
	var relations = {};		
	
	/**
	 *	This method adds a new relation to the symboltable.
	 *	If the relation already exists, it throws an error.
	 *	@param {String} name Name of the new relation.
	 *	@return {boolean}
	 */
	this.addRelation = function(name) {
		if (that.existsRelation(name)) {
			throw new RASAlreadyDefinedError(name, i18n.relation[lang]);
		}
		
		relations[name] = new Attributes(name);
		
		return true;
	}
		 
	/**
	 *	This method removes a relation from the symboltable.
	 *	@param {String} relation Name of the relation to be removed.
	 *	@return {boolean}
	 */
	this.removeRelation = function(relation) {
		if (!that.existsRelation(relation)) {
			throw new RASNotDefinedError(relation, i18n.relation[lang]);
		}
		
		delete relations[relation];
		return true;
	}
	
	/**
	 *	This method renames an existing relation by creating a new relation, taking the attributes from the source relation
	 *	and marking their source as its own, then deleting the source relation from the symboltable.
	 *	If the source relation does not exist or if the new relations exists it throws an error.
	 *	Also if the source relation has attributes with the same name, because they would become ambiguous after renaming the relation.
	 *	@param {String} newname
	 *	@param {String} oldname
	 *	@return {boolean}
	 */
	this.renameRelation = function(newname, oldname) {
		if (!that.existsRelation(oldname)) {
			throw new RASNotDefinedError(oldname, i18n.relation[lang]);
		}
		if (that.existsRelation(newname)) {
			throw new RASAlreadyDefinedError(newname, i18n.relation[lang]);
		}
		
		relations[newname] = new Attributes(newname);
		relations[newname].set(relations[oldname].getAttributesOnly());
		delete relations[oldname];
		
		return true;
	}
	
	/**
	 *	This method checks if a relation is already added to the symboltable.
	 *	@return {boolean}
	 */
	this.existsRelation = function(name) {
		return (typeof relations[name] !== 'undefined');
	}
	
	/**
	 *	This method adds a new attribute to the relation in the symboltable.
	 *	If the relation does not exist, it throws an error. Also if the attribute already exists.
	 *	@param {String} attribute The name of the attribute. It can be either relative ("att1") or absolute ("R.att1").
	 *	@param {String} relation The name of the relation we want to add the attribute to.
	 *	@return {boolean}
	 */
	this.addAttribute = function(attribute, relation) {
		if (!that.existsRelation(relation)) {
			throw new RASNotDefinedError(relation, i18n.relation[lang]);
		}
		
		relations[relation].add(attribute);
		
		return true;
	}
	
	/**
	 *	This method sets the attributes of the relation in the symboltable.
	 *	If the relation does not exist, it throws an error. Also if the attribute already exists.
	 *	@param {(String|Array|Attributes)} attributes The names of the attributes.
	 *	@param {String} relation The name of the relation we want to add the attribute to.
	 *	@return {boolean}
	 *	@see {@link Attributes#set} for further information.
	 */
	this.setAttributes = function(attributes, relation) {
		if (!that.existsRelation(relation)) {
			throw new RASNotDefinedError(relation, i18n.relation[lang]);
		}
		
		relations[relation].set(attributes);
		
		return true;
	}
	
	/**
	 *	This method renames attributes in the relation.
	 *	@param {String[]} newnames Array of strings as the new attribute names.
	 *	@param {String[]} oldnames Array of strings as the old attribute names.
	 *	@param {String} relation
	 *	@return {boolean}
	 */
	this.renameAttributes = function(newnames, oldnames, relation) {
		var i;
		
		if (!that.existsRelation(relation)) {
			throw new RASNotDefinedError(relation, i18n.relation[lang]);
		}
		
		for (i in oldnames) {
			relations[relation].rename(newnames[i], oldnames[i]);
		}
		
		return true;
	}
	
	/**
	 *	This method checks if an attribute is already added to relation in the symboltable.
	 *	If the relation does not exist, it throws an error.
	 *	@param {String} attribute The name of the attribute. It can be either relative ("att1") or absolute ("R.att1").
	 *	@param {String} relation The name of the relation we want to check the attribute in.
	 *	@return {boolean}
	 */
	this.existsAttribute = function(attribute, relation) {
		if (!that.existsRelation(relation)) {
			throw new RASNotDefinedError(relation, i18n.relation[lang]);
		}
		return relations[relation].has(attribute);
	}
	
	/**
	 *	This method checks if the attributes exist in at least one of the relations.
	 *	It is used with checking if conditionals are properly written -> every attribute in the condition has exactly one matching attribute in a relation.
	 *	Throws an error if a relation is not defined in the symboltable.
	 *	@param {String[]} attributes Array of strings as attribute names.
	 *	@param {String[]} relationlist Array of strings as relation names.
	 *	@return {boolean}
	 */
	this.checkProperAttributes = function(attributes, relationlist) {
		var i;
		var r;
		var cnt;
		
		for (r in relationlist) {
			if (!that.existsRelation(relationlist[r])) {
				throw new RASNotDefinedError(relationlist[r], i18n.relation[lang]);
			}
		}
		
		for (i in attributes) {
			cnt = 0;
			for (r in relationlist) {
				if (relations[relationlist[r]].has(attributes[i])) ++cnt;
			}
			if (cnt === 0) {
				throw new RASNotDefinedError(attributes[i], i18n.attribute[lang]);
			} else if (cnt > 1) {
				throw new RASAmbiguousError(attributes[i], i18n.attribute[lang]);
			}
		}
		
		return true;
	}
	
	/**
	 *	This method adds an alias to a relation. The alias' attributes will be exactly the same as in the 'relation'.
	 *	@param {String} alias As the alias name to be created.
	 *	@param {String} relation As the name of the source relation.
	 *	@param {boolean}
	 */
	this.addAlias = function(alias, relation) {
		if (!that.existsRelation(relation)) {
			throw new RASNotDefinedError(relation, i18n.relation[lang]);
		}
		if (that.existsRelation(alias)) {
			throw new RASAlreadyDefinedError(alias, i18n.relation[lang]);
		}
		
		relations[alias] = new Attributes(alias);
		relations[alias].set(relations[relation].getAttributes());
		
		return true;
	}
	
	/**
	 *	This method creates a new relation 'result' and its attributes will be the crossproduct of 'source1' and 'source2'.
	 *	@param {String} result As the name of the result relation.
	 *	@param {String} source1 As the name of the source relation.
	 *	@param {String} source2 As the name of the source relation.
	 *	@return {boolean}
	 */
	this.addCrossproduct = function(result, source1, source2) {
		if (!that.existsRelation(source1)) {
			throw new RASNotDefinedError(source1, i18n.relation[lang]);
		}
		if (!that.existsRelation(source2)) {
			throw new RASNotDefinedError(source2, i18n.relation[lang]);
		}
		if (that.existsRelation(result)) {
			throw new RASAlreadyDefinedError(result, i18n.relation[lang]);
		}
		
		relations[result] = new Attributes(result);
		relations[result].set(relations[source1].getAttributes());
		relations[result].crossproduct(relations[source2].getAttributes());
		return true;
	}
	
	/**
	 *	This method creates a new relation 'result' and its attributes will be the same as with the natural join of 'source1' and 'source2'.
	 *	@param {String} result As the name of the result relation.
	 *	@param {String} source1 As the name of the source relation.
	 *	@param {String} source2 As the name of the source relation.
	 *	@return {boolean}
	 */
	this.addJoin = function(result, source1, source2) {
		if (!that.existsRelation(source1)) {
			throw new RASNotDefinedError(source1, i18n.relation[lang]);
		}
		if (!that.existsRelation(source2)) {
			throw new RASNotDefinedError(source2, i18n.relation[lang]);
		}
		if (that.existsRelation(result)) {
			throw new RASAlreadyDefinedError(result, i18n.relation[lang]);
		}
		
		relations[result] = new Attributes(result);
		relations[result].set(relations[source1].getAttributes());
		relations[result].naturaljoin(relations[source2].getAttributes());
		
		return true;
	}
	
	/**
	 *	This method creates a new relation 'result' and its attributes will be the same as with the division of 'source1' and 'source2'.
	 *	@param {String} result As the name of the result relation.
	 *	@param {String} source1 As the name of the source relation.
	 *	@param {String} source2 As the name of the source relation.
	 *	@return {boolean}
	 */
	this.addDivision = function(result, source1, source2) {
		if (!that.existsRelation(source1)) {
			throw new RASNotDefinedError(source1, i18n.relation[lang]);
		}
		if (!that.existsRelation(source2)) {
			throw new RASNotDefinedError(source2, i18n.relation[lang]);
		}
		if (that.existsRelation(result)) {
			throw new RASAlreadyDefinedError(result, i18n.relation[lang]);
		}
		
		relations[result] = new Attributes(result);
		relations[result].set(relations[source1].getAttributes());
		relations[result].divide(relations[source2]);
		
		return true;
	}
	
	/**
	 *	This method creates a new relation and adds attributes to it after checking they exist in the source relation.
	 *	@param {String} result As the name of the result relation.
	 *	@param {String[]} attributes The attribute names to keep in the result relation.
	 *	@param {String} source As the name of the source relation.
	 *	@return {boolean}
	 */
	this.addProjection = function(result, attributes, source) {
		var i;
		var fields;
		
		if (!that.existsRelation(source)) {
			throw new RASNotDefinedError(source, i18n.relation[lang]);
		}
		if (that.existsRelation(result)) {
			throw new RASAlreadyDefinedError(result, i18n.relation[lang]);
		}
		
		fields = relations[source].translateAttributes(attributes);
		relations[result] = new Attributes(source);
		for (i in attributes) {
			if (relations[source].has(attributes[i])) {
				relations[result].add(fields[attributes[i]]);
			} else {
				throw new RASNotDefinedError(attributes[i], i18n.attribute[lang]);
			}
		}
		
		return true;
	}
	
	/**
	 *	This method checks the number of matching attributes of two relations.
	 *	In case of a SET operation like UNION, DIFFERENCE, INTERSECTION, it should be possible to pair up all of the attributes in each relation.
	 *	In case of a NATURAL JOIN-like operation, it should be possible to pair up at least one of the attributes in each relation.
	 *	@param {String} relation1 First relation whose attribute we pair with the second relation's attributes
	 *	@param {String} relation2 Second relation whose attribute we pair with the first relation's attributes
	 *	@return {Number} 0: no such attribute-pairs could be made,   
	 *		1: some attributes can be paired, 
	 *		2: every attribute in one relation has a match in the other one
	 *		-1: error - possible ambigousity
	 */
	this.matchingAttributes = function(relation1, relation2) {
		var fields1, fields2;
		var fields1_len, fields2_len;
		var result;
		
		if (!that.existsRelation(relation1)) {
			throw new RASNotDefinedError(relation1, i18n.relation[lang]);
		}
		if (!that.existsRelation(relation2)) {
			throw new RASNotDefinedError(relation2, i18n.relation[lang]);
		}
		
		fields1 = relations[relation2].translateAttributes(relations[relation1].getAttributes());
		fields2 = relations[relation1].translateAttributes(relations[relation2].getAttributes());
		fields1_len = Object.keys(fields1).length;
		fields2_len = Object.keys(fields2).length;
		
		if (fields1_len !== fields2_len) {
			return -1;
		}
		if (fields1_len > 0 && fields2_len > 0) {
			if (relations[relation1].length === relations[relation1].length) {
				if (fields1_len === relations[relation1].length) {
					result = 2;
				} else {
					result = 1;
				}
			} else {
				result = 1;
			}
		} else {
			result = 0;
		}
		
		return result;
	}
}

/**
 *	Factory function. Makes sure, there is only one SymbolManager object used.
 *	@param {boolean} newcopy Indicates whether a new SymbolManager should be created, even if one exists.
 *	@return {SymbolManager}
 */
function getSymbolManager(newcopy) {
	if (newcopy || typeof getSymbolManager.sm === 'undefined') {
		getSymbolManager.sm = new SymbolManager();
	}
	return getSymbolManager.sm;
}
