/**
	Relational Algebra Simulator
	author: David Nagy (mrnagydavid)
	
	version: 1.0
	
	@license MIT
*/
"use strict";

var lang = "en";
var extendedMode = false;

var __RELALG_COMMON = true;

/***				 Common						 ***/
/**
 * This function is a string formatter like sprintf in C.
 * The first argument is the text to format which might include placeholders with numbers, e.g.: Hello %1! My name is %2.
 * The placeholders will be replaced by the additional arguments.
 * @example assert(sprintf("Hello %1! My name is %2.", "foo", "bar") === "Hello foo! My name is bar.");
 * @param {String} text
 * @param {String} ...
 * @return {String}
 */
function sprintf() {
	if (arguments.length < 1) {
		return;
	} else if (arguments.length == 1) {
		return arguments[0];
	}
	var text = arguments[0];
	var param;
	
	for (param = 1; param < arguments.length; ++param) {
		text = text.replace(new RegExp("%"+param, 'g'), arguments[param]);
	}
	return text;
}

/**
 * This function is similar to the typeof keyword,
 * but it aims to recognize numbers formatted as a string.
 * To check for string formatted numbers it converts the
 * value into a Number then back to String.
 * If the result matches the original value, then it was a number.
 * (In case the value wasn't a number, the result would be "NaN".)
 * @param value
 * @return {String} The type of the value.  
 */
function typeofvalue(value) {
	/*
		object		object
		boolean		boolean
	string:	
		0			number
		1.5			number
		1.560		string
		1.			string
		01			string
		1,9			string
		alma		string
	*/
	
	switch (typeof value) {
		case "object":
			return "object";
		case "boolean":
			return "boolean";
		case "number":
			return "number";
		case "string":
			return ((+value).toString() === value) ? "number" : "string";
	}
}

/**
 * Helper function to create an Array with 'nr' fields all set to the default value of 'def'.
 * @param {Number} nr The size of the array.
 * @param def - The default value of the fields.
 * @return {Array}
 */
function arrayFill(nr, def) {
	var a = [];
	var i;
	for (i=0;i<nr;++i) a[i] = def;
	return a;
}

/*
	jsDoc snipplets to define the anonymous objects and constructions
	that were used in the documentation throughout.
*/

/**
 *	The InputRelationMap is an anonymous hash array used to store InputRelation
 *	objects - also anonymous.
 *	The fields are the names of the relations, their values are references to the
 *	anonymous InputRelation objects.
 *	@constructor InputRelationMap
 */

/**
 *	The InputRelation is an anonymous hash array used to pass the
 *	user-defined relations to the model by the QueryManager.
 *	It consists of a 'name' and a 'data' field. Both are String types.
 *	@constructor InputRelation
 *	@property {String} _name Name of the relation.
 *	@property {String} _data Data of the relation in CSV format. First line defines the attributes.
 */
 
/**
 *	The RelationMap is an anonymous hash array used to store Relation
 *	objects.
 *	The fields are the names of the relations, their values are references to the
 *	Relation instances.
 *	@constructor RelationMap
 */

/**
 *	The Row is a an anonymous hash array used to store the values of the relations.
 *	The fields are the names of the attributes and the values are the values of the given row in a relation.
 *	@constructor Row
 */

/**
 *	The AttributeDictionary is an anonymous hash array used to store the values of the attribute names.
 *	The fields are a possible representations of attribute names while the values are their unique counterpart in a given relation.
 *	This is used to translate a set of arbitrary attribute names into their actual counterpart in the relation.
 *	The fields are the names we wanted to use, their values are how we can access them in the rows of the relation.
 *	@constructor AttributeDictionary
 */

/**
 *	The AttributesMap is an anonymous hash array used to store Attributes instances.
 *	The fields are the names of the relations, their values are references to the Attributes instance related to them.
 *	Used mainly by the SymbolManager class.
 *	@constructor AttributesMap
 */
 
/**
 *	The QueryTreeRelation is an anonymous hash array that represents a tree or subtree of the query-tree.
 *	@constructor QueryTreeRelation
 *	@property {String} name Represents the name of the relation that should come to exist once the command it is 'holding' is executed.
 *	@property {QueryTreeRelationDetails} source A QueryTreeRelationDetails type object defining the operation that would build this relation.
 *	@property {QueryTreeRelation} parent A QueryTreeRelation reference pointing to its parent in the query-tree.
 */

/**
 *	The QueryTreeRelationDetails is an anonymous hash array that represents an operation - or a vertex in the query-tree.
 *	@constructor QueryTreeRelationDetails
 *	@property {String} cmd Represents the name of the relation that should come to exist once the command it is 'holding' is executed.
 *	@property {QueryTreeRelation} relation A QueryTreeRelation type used with unary commands.
 *	@property {QueryTreeRelation[]} relations A QueryTreeRelation[] type used with binary commands.
 *	@property parameter Used to pass arguments to the command if necessary.
 */

/**
 *	The RenameAttributeList is an anonymous hash array for the RenameAttributesOperation class.
 *	It is typically held in the 'parameter' field of the QueryTreeRelationDetails objects.
 *	@constructor RenameAttributeList
 *	@property {String[]} old Names of the attributes to be renamed.
 *	@property {String[]} new Names of the new attribute names respectively.
 */

/**
 *	The QueryTreeAttributeList is an anonymous hash array used to store QueryTreeAttributeDetails objects.
 *	It is used by the Parser to build a parameter list for certain operations that have to interact with attributes, like the projection or selection etc.
 *	It is typically held in the 'parameter' field of the QueryTreeRelationDetails objects.
 *	@constructor QueryTreeAttributeList
 */

/**
 *	The QueryTreeAttributeDetails is an anonymous hash array that represent one column in a relation.
 *	It is used by the Parser to build a parameter for certain operations that have to interact with attributes, like conditions or calculations.
 *	@constructor QueryTreeAttributeDetails
 *	@property {String} name Name of the attribute.
 *	@property {String} esc The complete expression with the attribute names escaped with surrounding '%' marks - e.g.: "%att1%+5==%att3%
 *	@property {String[]} cols The unescaped names of the attributes used in 'esc' - e.g.: ["att1", "att3"]
 *	@property {String} originalName Used if the object represent an attribute renaming, it shows the original name of the attribute.
 *	@property {boolean} isCalculated Indicates if the object holds a calculation - e.g.: %att1%+560
 *	@property {boolean} isAbsolute Indicates if the 'name' or 'originalName' is an absolute path to the attribute.
 *	@property {boolean} isRelative Indicates if the 'name' or 'originalName' is a relative path to the attribute.
 *	@property {boolean} isGroupOperation Indicates if the object represent a group operation - e.g. "MAX(att1)"
 *	@property {boolean} isRenamed Indicates if the object represent an attribute renaming.
 */
