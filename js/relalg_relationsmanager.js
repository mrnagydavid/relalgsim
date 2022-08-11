/**
	Relational Algebra Simulator
	author: David Nagy (mrnagydavid)
	
	version: 1.0
	
	@license MIT
*/
"use strict";
var __RELALG_RELATIONSMANAGER = true;

/**
 *	Rows namespace holds practical methods to work with anonymous Row objects.
 *	@namespace Rows
 */
var Rows = {
	/**
	 *	Evaluates a condition using the values in the row and returns with the result of the evaluation.
	 *	The condition can be a literal condition e.g. "%att1%==5 or a calculation e.g. "%att1%*5+%att2%"
	 *	The method replaces the placeholders (%att1%) with the value of the attribute (att1 field in Row),
	 *	and then uses Javascript's eval function to evaluate the expression, and returns with its result.
	 *	@param {Row} row One row from a relation.
	 *	@param {QueryTreeAttributeDetails} condition Object holding calculation details of one attribute
	 *	@return Result of evaluation
	 */
	evaluate: function(row, condition) {
		var esc = condition.esc;
		var cols = condition.cols;
		var i;
		var value;
		var result;
		
		for (i in cols) {
			value = Rows.getValue(row,cols[i]);
			if (typeofvalue(value) === "string") {
				esc = esc.replace(new RegExp("%"+cols[i]+"%", 'g'), "'" + value + "'");
			} else {
				esc = esc.replace(new RegExp("%"+cols[i]+"%", 'g'), value);
			}
		}

		try {
			result = eval(esc);
		} catch (e) {
			result = false;
			throw new RASConditionEvaluationError(e.name, condition.esc.replace(new RegExp("%", 'g'), ""), e.message);
		}

		return result;
	},
	
	/**
	 *	Looks up the 'attribute' in 'row'.
	 *	If 'attribute' is a direct member of 'row' it returns row[attribute].
	 *	If 'attribute' is not a direct member of 'row',
	 *	then it iterates through 'row' to check if it is stored as an absolute path.
	 *	If an attribute is absolute (e.g. "Rel.att1") and the attribute name matches,
	 *	it returns with its value (e.g.: row["Rel.att1"]).
	 *	@param {Row} row One row from a relation
	 *	@param {String} attribute Attribute name
	 *	@return The value of the attribute in the row
	 */
	getValue: function(row, attribute) {
		var att;
		if (typeof row[attribute] !== 'undefined') {
			return row[attribute];
		}
		for (att in row) {
			if (att.indexOf('.') !== -1 && att.split('.')[1] === attribute) {
				return row[att];
			}
		}
		return undefined;
	},
	
	/**
	 *	Copies a row attribute by attribute.
	 *	@param {Row} row One row from a relation.
	 *	@return {Row} A copy of 'row'.  
	 */
	copy: function(row) {
		var att;
		var result = {};
		for (att in row) {
			result[att] = row[att];
		}
		return result;
	},
	
	/**
	 *	Append two rows together. Does not care about ambiguousity. In that case the attribute coming last overwrites previous values in the field of the same name.
	 *	@example append({ "att1": "a" }, { "att2": "b" }); // returns { "att1": "a", "att2": "b" }
	 *	@param {Row} row1
	 *	@param {Row} row2
	 *	@return {Row}
	 */
	append: function(row1, row2) {
		var newrow = {};
		var att;
		
		for (att in row1) {
			newrow[att] = row1[att];
		}
		
		for (att in row2) {
			newrow[att] = row2[att];
		}

		return newrow;
	},
	
	/**
	 *	Joins two rows together. Matching attribute names will lose ownership, exactly as a natural join like operation would do it.
	 *	This method does not check if matching attributes match in their values as well!
	 *	@example join({ "R.att1": "a", "R.att2": "b" }, { "S.att2": "c", "S.att3": "c" }); // returns { "R.att1": "a", "att2": "c", "S.att3": "c"  }
	 *	@param {Row} row1
	 *	@param {Row} row2
	 *	@return {Row}
	 */
	join: function(row1, row2) {
		var newrow = {};
		var i;
		
		var k1 = Object.keys(row1);
		var k2 = Object.keys(row2);
		var a1 = new Attributes("R1");
		var a2 = new Attributes("S1");
		
		a1.set(k1);
		a2.set(k2);
		
		var a1o = a1.getAttributesOnly();
		var a2o = a2.getAttributesOnly();
		
		for (i in k1) {
			if (a2o.indexOf(a1o[i]) === -1) {
				// unique
				newrow[k1[i]] = row1[k1[i]];
			} else {
				// common
				newrow[a1o[i]] = row1[k1[i]];
			}
		}
		
		for (i in k2) {
			if (a1o.indexOf(a2o[i]) === -1) {
				// unique
				newrow[k2[i]] = row2[k2[i]];
			} 
		}
		
		return newrow;
	},
	
	/**
	 *	Evaluates a condition using the values in the row and saves it in an attribute in a new row.
	 *	'parameter' contains a list of attribute names as fields
	 *	and a calculation (QueryTreeAttributeDetails) as their values.
	 *	The method iterates through every such attribute, and evaluates it, and saves the value in a new row.
	 *	@param {Row} row One row from a relation.
	 *	@param {QueryTreeAttributeList} parameter Object holding calculation details of attributes:
	 *		fields as attribute names, values as QueryTreeAttributeDetails.
	 *	@return {Row} A row whose every attribute is calculated based on 'parameter'.  
	 */
	calculate: function (row, parameter) {
		var newrow = {};
		var att;
		
		for (att in parameter) {
			newrow[att] = Rows.evaluate(row, parameter[att]);
		}
		
		return newrow;
	}

};

/**
 *	Represents a relation.
 *	Can work in either set or multiset mode. This can be changed via the setMultisetMode method.
 *	By default the ctor sets it to match the extendedMode global variable.
 *	@constructor
 */
function Relation(_name) {
	var that = this;
	/**
	 * The name of the relation.
	 */
	var name = _name;
	/**
	 * The Attributes object handling the relation's attributes.
	 * @see {@link Attributes} for further information.
	 */
	var attributes = new Attributes(_name);
	/**
	 * The array of anonymous, hash-like / dictionary-like objects.
	 * The Row object is not instantiated with the new keyword.
	 * This is a Javascript specific object where fields are the attribute names,
	 * and their values are the contents of the row.
	 * @see {@link Row} for further information.
	 */
	var rows = [];
	/**
	 * Indicates whether the relation is working in set or multiset mode.
	 * By default the ctor sets it to match the extendedMode global variable.
	 */
	var multiset = extendedMode;
	
	/**
	 * Prepares a row by translating its fieldnames into attributes matching
	 * the current relation's attributes.
	 * Fieldnames that do not have a counterpart in the set of attributes are skipped
	 * and not included in the result.
	 * Values that are numbers formatted as strings will be converted into numbers.
	 * @param {Row} row
	 * @return {Row}
	 */
	function prepareRow(row) {
		var fields = attributes.translateAttributes(Object.keys(row));
		var att;
		var newrow;
		var num;
		
		newrow = {};
		for (att in fields) {
			if (typeofvalue(row[att]) === "number" && typeof row[att] !== "number") {
				num = Number(row[att]);
				row[att] = num.valueOf();
			}
			newrow[fields[att]] = row[att];
		}
		
		return newrow;
	}
	
	/**
	 *	Utility function to look up a row based on its values.
	 *	It checks if any row matches the attribute names and their values of 'row'.
	 *	@param {Row} row A Row object containing attribute names as fields and their values
	 *	@return {Number} The index number of the matching row, or -1.  
	 */
	function findRow(row) {
		var newrow = prepareRow(row);
		var fnd = true;
		var i;
		var att;
		
		if (rows.length === 0 || Object.keys(newrow).length === 0 || Object.keys(newrow).length !== attributes.length) return -1;
		
		for (i in rows) {
			fnd = true;
			for (att in newrow) {
				if (newrow[att] !== rows[i][att]) {
					fnd = false;
					break;
				}
			}
			if (fnd) break;
		}
		
		return (fnd) ? i : -1;
	}

	/**
	 *	Getter function for the private property 'name' of this relation
	 *	@return {String}
	 */
	this.getName = function() {
		return name;
	}
	
	/**
	 *	Setter function for the private property 'multiset' of this relation.
	 *	'multiset' indicates whether the relation is a set or a multiset of a rows.
	 *	If set to false, the addRow() and setData() won't allow multiple rows and fail silently.
	 *	@param {boolean} mode [Optional] If omitted, the multiset mode is set to match the extendedMode global variable.
	 */
	this.setMultisetMode = function(mode) {
		multiset = (typeof mode==='undefined')?extendedMode:mode;
	}
	
	/**
	 *	Setter function for this relation's attributes.
	 *	If parameter is string (e.g. "att1; att2") or an array of strings (e.g. ["att1", "att2"]).
	 *	@param {(String|Array|Attributes)} atts Attributes to add. 
	 *	@see {@link Attributes#set} for further information.
	 *	@return {boolean}
	 */
	this.setAttributes = function(atts) {
		if (atts.length === 0) {
			throw new RASParameterError(i18n.attribute_list_empty[lang], i18n.attribute_list_empty.errorcode);
		}
		attributes.set(atts);
		return true;
	}
	
	/**
	 *	Getter function for the private property 'attributes' of this relation.
	 *	@see {@link Attributes#getAttributes} for further information.
	 *	@return {String[]} The result of the getAttributes function of the Attributes class. 
	 */
	this.getAttributes = function() {
		return attributes.getAttributes();
	}
	
	/**
	 *	Getter function for the private property 'attributes' of this relation.
	 *	@see {@link Attributes#getAttributesOnly} for further information.
	 *	@return {String[]} The result of the getAttributesOnly function of the Attributes class. 
	 */
	this.getAttributesOnly = function() {
		return attributes.getAttributesOnly();
	}
	
	/**
	 *	Getter function for the private property 'attributes' of this relation.
	 *	@see {@link Attributes#getAttributesUnique} for further information.
	 *	@return {String[]} The result of the getAttributesUnique function of the Attributes class. 
	 */
	this.getAttributesUnique = function() {
		return attributes.getAttributesUnique();
	}
	
	/**
	 *	This method renames attributes in the relation and also updates the rows to match the new attribute names.
	 *	@see {@link Attributes#rename} for further information.
	 *	@param {String[]} newnames Array of strings as the new attribute names.
	 *	@param {String[]} oldnames Array of strings as the old attribute names.
	 *	@return {boolean}
	 */
	this.renameAttributes = function(newnames, oldnames) {
		var i, o;
		var before;
		var after;
		
		before = attributes.translateAttributes(oldnames);
		for (i in oldnames) {
			attributes.rename(newnames[i], oldnames[i]);
		}
		after = attributes.translateAttributes(newnames);
		
		for (i in rows) {
			for (o in oldnames) {
				rows[i][after[newnames[o]]] = rows[i][before[oldnames[o]]];
				delete rows[i][before[oldnames[o]]];
			}
		}
		
		return true;
	}
	
	/**
	 *	Adds a new row to the relation.
	 *	The attributes of the new row that are not defined in this relation are skipped, but
	 *	every attribute in this relation must be given a value in the new row.
	 *	In extended relational algebra mode or multiset mode, the same row can be added multiple times.
	 *	Otherwise addRow silently refuses to add an already existing row to the relation - returning false.
	 *	The values are transformed into their proper forms meaning that numbers received as strings will be converted into numbers. 
	 *	@see {@link Relation~prepareRow} for further information.
	 *	@param {Row} row A row object to append to the relation.
	 *	@return {boolean}
	 */
	this.addRow = function(row) {
		var att;
		var newrow = prepareRow(row);
		
		if (Object.keys(newrow).length < attributes.length) {
			throw new RASMissingAttributeError();
		}
		
		if (multiset || !that.hasRow(newrow)) {
			rows.push(newrow);
		} else {
			return false;
		}
		
		return true;
	}
	
	/**
	 *	Gets a row by its index.
	 *	@param {Number} nr The index number of the row.
	 *	@return {(Row|undefined)}
	 */
	this.getRow = function(nr) {
		if (nr >= rows.length || nr < 0) {
			return;
		}		
		return Rows.copy(rows[nr]);
	}
	
	/**
	 *	Checks if this relation has a row that matches 'row'.
	 *	@param {Row} row Row to match.
	 *	@return {boolean} Whether a matching row has been found  
	 */
	this.hasRow = function(row) {
		return findRow(row) !== -1;
	}
	
	/**
	 *	Gets the number of rows in this relation.
	 *	@return {Number}
	 */
	this.getRowCount = function() {
		return rows.length;
	}
	
	/**
	 *	This method is to be used with user input.
	 *	Expecting a string of row data in CSV format to be split, cleaned and saved.
	 *	@param {(String|String[])} data String of row data in CSV format or array of strings as rows in CSV format
	 *	@return {boolean}
	 */
	this.setData = function(data) {
		var rows;
		var i, o;
		var row;
		var values;
		var atts = attributes.getAttributes();
		
		if (attributes.length === 0) {
			throw new RASAttributesNotDefinedError();
		}
		
		if (data.length === 0) {
			return false;
		}
		
		if (typeof data === "string") {
			data = data.replace("\r\n", "\n");
			data = data.replace("\r", "\n");
			rows = data.split("\n");
		} else if (data.constructor === Array) {
			rows = data;
		} else {
			throw new RASParameterError();
		}
		
		for (i = 0; i < rows.length; ++i) {
			values = rows[i].split(";");
			if (values.length !== atts.length) {
				throw new RASMissingAttributeError();
			}
			row = {};
			for (o in atts) {
				row[atts[o]] = values[o].trim();
			}
			that.addRow(row);
		}
		
		return true;
	}
	
	/**
	 *	This method returns the row data of the relation in CSV format.
	 *	@return {String}
	 */
	this.getData = function() {
		var data = [];
		var data_row, i, att, o;
		var atts = attributes.getAttributes();
		
		for (i in rows) {
			data_row = [];
			for (o in atts) {
				data_row.push(rows[i][atts[o]]);
			}
			data.push(data_row.join(";"));
		}
		
		return data.join("\n");
	}
	
	/**
	 *	
	 *	Utility function to copy rows from a relation by taking its rows.
	 *	@param {Relation} relation Relation to copy from
	 *	@return {boolean}
	 */
	this.copyRowsFrom = function(relation) {
		var rowi;
		var srowcnt = relation.getRowCount();
		var rows = [];
		
		for (rowi = 0; rowi < srowcnt; ++rowi) {
			that.addRow(relation.getRow(rowi));
		}
		
		return true;
	}
	
	/**
	 *	This method is used to create a dictionary object where the fieldnames are the original attributes and their values are the attribute names that are unique and verbose,
	 *	meaning that they are absolute. Note that only those fieldnames will be included in the dictionary that already exist, non-existing attribute names are skipped.
	 *	An exception is generated if an attribute is ambiguous.
	 *	@see {@link Attributes#translateAttributes} for further information.
	 *	@param {String[]} attributes Array of strings as attribute names.
	 *	@return {AttributeDictionary}}
	 */
	this.translateAttributes = function(atts) {
		return attributes.translateAttributes(atts);
	}
}

/**
 *	RelationsManager represents a Database, managing relations.
 *	@constructor
 */
function RelationsManager() {
	var that = this;
	/**
	 * Dictionary of the relations.
	 * The fieldnames are the names of the relations, and the values are references to
	 * their Relation object.
	 * @see {@link RelationMap} for further information.
	 */
	var relations = {};
	
	/**
	 *	This method adds a new relation to the database.
	 *	@param {Relation} relation Relation to add.
	 *	@return {boolean}
	 */
	this.addRelation = function(relation) {
		if (typeof relations[relation.getName()] !== 'undefined') {
			throw new RASAlreadyDefinedError(relation.getName(), i18n.relation[lang]);
		}
		relations[relation.getName()] = relation;
		return true;
	}
	
	/**
	 *	This method returns a relation by its name.
	 *	@param {String} name The name of the relation to look up.
	 *	@return {(Relation|undefined)}
	 */
	this.getRelation = function(name) {
		return relations[name];
	}
}

/**
 *	This is a factory for RelationsManager.
 *	As many objects depend on a single instance of RelationsManager,
 *	this is a factory to get an instance of it.
 *	If it has not yet been created, it first instantiates it.
 *	@param {boolean} newcopy Indicates whether a new copy of RelationsManager is to be created,
 *		regardless of a previously existing one. Chiefly used by the unit test module.
 *	@return {RelationsManager}
 */
function getRelationsManager(newcopy) {
	if (newcopy || getRelationsManager.rm === undefined) {
		getRelationsManager.rm = new RelationsManager();
	}
	return getRelationsManager.rm;
}