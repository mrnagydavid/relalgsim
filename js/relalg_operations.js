/**
	Relational Algebra Simulator
	author: David Nagy (mrnagydavid)
	
	version: 1.0
	
	@license MIT
*/
"use strict";
var __RELALG_OPERATIONS = true;
var __RELALG_MISSING = "?";

/**
 *	This namespace carries methods to replace the attribute placeholders in conditionals received from the grammar parser.
 *	The attribute placeholders are replaced by the actual attribute names that are listed in a dictionary-like map.
 *	For certain operations the grammar parser builds a parameter object that can carry either a condition or a calculation method.
 *	One such item (condition or calculation) has two fields: cols, esc. Where esc carries the calculation, the cols show which columns/attributes are used
 *	in the esc/calculation. Note the following:
 *	<ul>
 *	<li>The 'esc' contains the calculation where the attribute names given by the user are _esc_aped with a '%'. </li>
 *	<li>If the user input is att1=5,</li>
 *	<ul>
 *		<li>the 'esc' will contain %att1%==5,</li>
 *		<li>and the 'cols' [att1].</li>
 *	</ul>
 *	<li>If the user input is att1=5&&att2=4,</li>
 *	<ul>
 *		<li>the 'esc' will contain %att1%==5&&%att2%==4,</li>
 *		<li>and the 'cols' [att1], att4].</li>
 *	</ul>
 *	<li>The operations will take the cols and ask the relations to translate the columnnames into their matching attribute names. This is given in a dictionary-like 'fields' object.</li>
 *	<li>A possible fields object from [att1, att4] --> { 'att1': 'R.att1', 'att4': 'S.att4' }.</li>
 *	<li>The AttributeParameter methods use the 'fields' object to translate the 'esc' placeholders into their proper form that can later be evaluated.</li>
 *	<ul>
 *		<li>'esc': %att1%==5&&%att2%==4</li>
 *		<li>'fields': { 'att1': 'R.att1', 'att4': 'S.att4' }</li>
 *		<li>==> 'esc': %R.att1%==5&&%S.att4%==4</li>
 *	</ul>
 *	<li>Using this 'esc', the Rows namespace evaluate method (with the proper row data) can replace the placeholders with values and evaluate the expression.</li>
 *	</ul>
 *	@namespace AttributeParameter
 */
var AttributeParameter = {
	/**
	 *	This method translates the QueryTreeAttributeList's parameters one-by-one using the translateOne method, or
	 *	if the parameter is a QueryTreeAttributeDetails object, then it translates it (using the translateOne method).
	 *	@param {(QueryTreeAttributeList|QueryTreeAttributeDetails)} parameter
	 *	@param {AttributeDictionary} fields
	 *	@return {(QueryTreeAttributeList|QueryTreeAttributeDetails)}
	 */
	translate: function(parameter, fields) {
		var p;
		if (parameter.esc !== undefined && parameter.cols !== undefined) {		// if QueryTreeAttributeDetails
			parameter = AttributeParameter.translateOne(parameter, fields);
		} else {																// if QueryTreeAttributeList
			for (p in parameter) {
				parameter[p] = AttributeParameter.translateOne(parameter[p], fields);
			}
		}
		return parameter;
	},
	
	/**
	 *	This method translates one parameter object's esc field using the fields dictionary.
	 *	@param {QueryTreeAttributeDetails} parameter
	 *	@param {AttributeDictionary} fields
	 *	@return {QueryTreeAttributeDetails} With the 'esc' field changed to contain escaped but proper attribute names.  
	 */
	translateOne: function(parameter, fields) {
		var field;
		var pcols;
		
		for (field in fields) {
			parameter.esc = parameter.esc.replace(new RegExp("%" + field + "%", 'g'), "%"+fields[field]+"%");
			pcols = parameter.cols;
			while (field !== fields[field] && pcols.indexOf(field) !== -1) {	// cries for refactoring
				pcols[pcols.indexOf(field)] = fields[field];
			}
		}
		return parameter;
	}
};

/**
 *	This is a factory for the operation classes.
 *	Based on the actual command the QueryTreeRelationDetails objects holds in its top level,
 *	it creates and returns with the proper operation class.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command.
 *	@return {Operation} The proper operation class that matches the command in qtr.  
 */
function getOperation(qtr) {
	switch (qtr.source.cmd) {
		case "COPY":
			return new CopyOperation(qtr);
		case "DISTINCT":
			return new DistinctOperation(qtr);
		case "RENAME_RELATION":
			return new RenameRelationOperation(qtr);
		case "SORT":
			return new SortOperation(qtr);
		case "RENAME_ATTRIBUTES":
			return new RenameAttributesOperation(qtr);
		case "SELECTION":
			return new SelectionOperation(qtr);
		case "PROJECTION":
			return new ProjectionOperation(qtr);
		case "GROUPBY":
			return new GroupbyOperation(qtr);
		case "UNION":
			return new UnionOperation(qtr);
		case "DIFFERENCE":
			return new DifferenceOperation(qtr);
		case "INTERSECTION":
			return new IntersectionOperation(qtr);
		case "NATURAL_JOIN":
			return new NaturaljoinOperation(qtr);
		case "LEFT_SEMI_JOIN":
			return new LeftSemijoinOperation(qtr);
		case "RIGHT_SEMI_JOIN":
			return new RightSemijoinOperation(qtr);
		case "LEFT_OUTER_JOIN":
			return new LeftOuterjoinOperation(qtr);
		case "RIGHT_OUTER_JOIN":
			return new RightOuterjoinOperation(qtr);
		case "FULL_OUTER_JOIN":
			return new FullOuterjoinOperation(qtr);
		case "ANTI_JOIN":
			return new AntijoinOperation(qtr);
		case "DIVISION":
			return new DivisionOperation(qtr);
		case "CROSSPRODUCT":
			return new CrossproductOperation(qtr);
		case "THETA_JOIN":
			return new ThetajoinOperation(qtr);
	}
}

/**
 *	This class copies a relation into a new one - which does not represent a relational algebraic operation.
 *	The basic method of the current project is to leave the original (user-input) relations intact.
 *	If the grammar parser notices a reference to such a relation, it first creates a copy of it, and then manipulates it.
 *	This class creates that copy.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function CopyOperation(qtr) {
	var that = this;
	var sourceRelationName = qtr.source.relation;
	var resultRelationName = qtr.name;
	
	this.execute = function() {
		var rm = getRelationsManager();
		var sr = rm.getRelation(sourceRelationName);
		var rr = new Relation(resultRelationName);
		
		rr.setAttributes(sr.getAttributes());
		rr.copyRowsFrom(sr);
		rm.addRelation(rr);
		rr.getName();
		
		return rr.getName();
	}
}

/**
 *	This class creates a new relation whose rows are unique and also a subset of the source relation. 
 *	Represents the relation algebraic DELTA operation or the DISTINCT modifier in SQL.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function DistinctOperation(qtr) {
	var that = this;
	var sourceRelationName = qtr.source.relation.name;
	var resultRelationName = qtr.name;
	
	this.execute = function() {
		var rm = getRelationsManager();
		var sr = rm.getRelation(sourceRelationName);
		var rr = new Relation(resultRelationName);
		var srowcnt = sr.getRowCount();
		var srow;
		var rowi;
		
		rr.setAttributes(sr.getAttributes());

		for (rowi = 0; rowi < srowcnt; ++rowi) {
			srow = sr.getRow(rowi);
			if (!rr.hasRow(srow)) {
				rr.addRow(srow);
			}
		}
		
		rm.addRelation(rr);	
		
		return rr.getName();
	}
}

/**
 *	This class creates a new relation whose rows are a copy of the source relation matching in values, but not necessarily in attributes too.
 *	The new relation has a new name and also takes ownership of the source relation's attributes.
 *	Represents the relation algebraic RO operation or the "relation_name new_name" in SQL FROM clause.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function RenameRelationOperation(qtr) {
	var that = this;
	var sourceRelationName = qtr.source.relation.name;
	var renamedRelationName = qtr.source.parameter;
	var resultRelationName = qtr.name;
	
	this.execute = function() {
		var rm = getRelationsManager();
		var sr = rm.getRelation(sourceRelationName);
		var tr = new Relation(renamedRelationName);
		var rr = new Relation(resultRelationName);
				
		tr.setAttributes(sr.getAttributesOnly());		
		tr.copyRowsFrom(sr);
		
		rr.setAttributes(tr.getAttributes());
		rr.copyRowsFrom(tr);
		rm.addRelation(rr);
		
		return rr.getName();
	}
}

/**
 *	This class creates a new relation whose rows are an exact copy of the source relation's, but their order is changed.
 *	Represents the relation algebraic TAU operation or the "ORDER BY" in SQL.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function SortOperation(qtr) {
	var that = this;
	var sourceRelationName = qtr.source.relation.name;
	var resultRelationName = qtr.name;
	var fields = Object.keys(qtr.source.parameter);
	
	function my_sort(a, b) {
		var field;
		
		for (field in fields) {
			if (a[fields[field]] < b[fields[field]]) return -1;
			if (a[fields[field]] > b[fields[field]]) return 1;
		}
		
		return 0;
	}
	
	this.execute = function() {
		var rm = getRelationsManager();
		var sr = rm.getRelation(sourceRelationName);
		var rr = new Relation(resultRelationName);
		var srowcnt = sr.getRowCount();
		var rowi;
		var srows = [];
		
		rr.setAttributes(sr.getAttributes());
		fields = rr.translateAttributes(fields);

		for (rowi = 0; rowi < srowcnt; ++rowi) {
			srows.push(sr.getRow(rowi));
		}
		
		srows.sort(my_sort);
		
		for (rowi = 0; rowi < srowcnt; ++rowi) {
			rr.addRow(srows[rowi]);
		}
		
		rm.addRelation(rr);		

		return rr.getName();
	}
}

/**
 *	This class creates a new relation whose rows are a copy of the source relation matching in values, but the attributes are renamed.
 *	The new relation takes ownership of the renamed attributes.
 *	Represents the relation algebraic RO operation or the "attribute_name AS new_name" in SQL SELECT clause.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function RenameAttributesOperation(qtr) {
	var that = this;
	var sourceRelationName = qtr.source.relation.name;
	var resultRelationName = qtr.name;
	var old_new = qtr.source.parameter;
	
	this.execute = function() {
		var rm = getRelationsManager();
		var sr = rm.getRelation(sourceRelationName);
		var rr = new Relation(resultRelationName);
		
		sr.renameAttributes(old_new["new"], old_new.old);
		rr.setAttributes(sr.getAttributes());
		rr.copyRowsFrom(sr);		
		rm.addRelation(rr);		
		
		return rr.getName();
	}
}

/**
 *	This class creates a new relation whose rows are an exact copy and the subset of the source relation's rows. 
 *	Only those rows are included that satisfy the condition.
 *	Represents the relation algebraic RO operation or the "attribute_name AS new_name" in SQL SELECT clause.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function SelectionOperation(qtr) {
	var that = this;
	var sourceRelationName = qtr.source.relation.name;
	var resultRelationName = qtr.name;
	var conditional = qtr.source.parameter;
	
	this.execute = function() {
		var rm = getRelationsManager();
		var sr = rm.getRelation(sourceRelationName);
		var rr = new Relation(resultRelationName);
		var srowcnt = sr.getRowCount();
		var rowi;
		var srow;
		var fields = conditional.cols;
		
		fields = sr.translateAttributes(fields);
		conditional = AttributeParameter.translate(conditional, fields);
		
		rr.setAttributes(sr.getAttributes());
		
		for (rowi = 0; rowi < srowcnt; ++rowi) {
			srow = sr.getRow(rowi);
			if (Rows.evaluate(srow, conditional)) {
				rr.addRow(srow);
			}
		}
		
		rm.addRelation(rr);		
		
		return rr.getName();
	}
}

/**
 *	This class creates a new relation changing the attributes of the source relation's attributes.
 *	In case of standard relational algebra, the result relation's attributes are a permutation of the source relation's attributes,
 *	however extended relational algebra provides the possiblity of renaming the attributes so does this class too.
 *	The rows are copied but their values are changed according to the attribute changes.
 *	It is possible to rename the attributes or to do numeric or textual operations with the attributes.
 *	Represents the relation algebraic PI operation or the "SELECT" clause in SQL.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function ProjectionOperation(qtr) {
	var that = this;
	var sourceRelationName = qtr.source.relation.name;
	var resultRelationName = qtr.name;
	var parameter = qtr.source.parameter;
	
	this.execute = function() {
		var rm = getRelationsManager();
		var sr = rm.getRelation(sourceRelationName);
		var rr = new Relation(resultRelationName);
		var srowcnt = sr.getRowCount();
		var rowi;
		var srow;
		var rattributes = [];
		var att;
		var fields = [];
		
		fields = sr.translateAttributes(Object.keys(parameter));	// to keep ownership on source attributes
		for (att in parameter) {
			if (fields[att] === undefined) {						// to add calculated attributes without matching source attribute
				fields[att] = att;									// note that it messes up the attribute order given by the user in the parameterlist
			}
		}
		/*
		for (att in fields) {
			rattributes.push(fields[att]);							// setAttributes expects an Array
		}
		*/
		for (att in parameter) {
			rattributes.push(fields[att]);							// setAttributes expects an Array
		}
		rr.setAttributes(rattributes);
		
		fields = [];
		for (att in parameter) {
			fields = fields.concat(parameter[att].cols);
		}
		fields = sr.translateAttributes(fields);
		parameter = AttributeParameter.translate(parameter, fields);
		
		for (rowi = 0; rowi < srowcnt; ++rowi) {
			srow = sr.getRow(rowi);
			rr.addRow(Rows.calculate(srow, parameter));
		}
		
		rm.addRelation(rr);		
		
		return rr.getName();
	}
}

/**
 *	This class creates a new relation that is a statistical aggregation of a source relation's rows.
 *	Represents the relation algebraic GAMMA operation or the "GROUP BY" in SQL.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function GroupbyOperation(qtr) {
	var that = this;
	var sourceRelationName = qtr.source.relation.name;
	var resultRelationName = qtr.name;
	var parameter = qtr.source.parameter;
	
	var by = {};			// this object will hold the aggregating attributes (att1, att2 ...)
	var groupie = {};		// this object will hold the aggregation attributes (e.g. MAX, SUM, AVG...)
	var temp_relation = {};	// this object will hold the aggregated rows until every source row is processed
	
	this.execute = function() {
		var rm = getRelationsManager();
		var sr = rm.getRelation(sourceRelationName);
		var rr = new Relation(resultRelationName);
		var att;
		var columns = [];
		var dictionary;
		
		var i, srow, groupby_key, temp_field;
		var attributes = [];
		var rattributes;
		
		// separating aggregation [groupie] and aggregating attributes [by]
		// also collecting all the columns/attributes that will be used in the calculations
		for (att in parameter) {
			if (parameter[att].isGroupOperation) {
				groupie[att] = parameter[att];
			} else {
				by[att] = parameter[att];
				if (by[att].isRenamed) by[att].name = by[att].originalName;
			}
			columns = columns.concat(parameter[att].cols);
			attributes.push(att);
		}
		
		// creating a dictionary of attributes to match the source relation attributes' names
		// and renaming every reference to the attributes to match the source relation attributes' names
		dictionary = sr.translateAttributes(columns);
		parameter = AttributeParameter.translate(parameter, dictionary);

		for (i = 0; i < sr.getRowCount(); ++i) {
			srow = sr.getRow(i);
			// creating an index using the aggregating attributes
			groupby_key = '';
			for (att in by) {
				if (by[att].isRenamed || by[att].isCalculated) {
					groupby_key = groupby_key.concat(Rows.evaluate(srow, by[att]));
				} else {
					groupby_key = groupby_key.concat(srow[dictionary[by[att].name]]);
				}
			}
			// in case groupby_key is new, create the necessary row in temp_relation
			if (temp_relation[groupby_key] === undefined) temp_relation[groupby_key] = {};
			// going over 'by' again, but this time evaluating values and adding it to the temp_relation one-by-one
			for (att in by) {
				temp_relation[groupby_key][att] = Rows.evaluate(srow, by[att]);
			}
			// going over 'groupie' to calculate the value of the aggregations
			// these are not simply added to temp_relation, but their values are merged into existing rows by updateJournal
			for (att in groupie) {
				temp_field = Rows.evaluate(srow, parameter[att]);
				updateJournal(groupby_key, att, temp_field);
			}
		}
		finishJournal();
		
		// setting the attributes of the result relation
		// by collecting the intended attribute names
		// and checking which of them exist in the source relation
		// because those should keep their owner
		// (an attribute doesnt exist in the source relation if it is a renamed attribute: MAX(att1)->max)
		rattributes = [];
		dictionary = sr.translateAttributes(attributes);
		for (i in attributes) {
			if (dictionary[attributes[i]] !== undefined) {
				rattributes.push(dictionary[attributes[i]]);
			} else {
				rattributes.push(attributes[i]);
			}
		}
		rr.setAttributes(rattributes);
		
		// copying rows from temp_relation to result relation
		for (att in temp_relation) {
			rr.addRow(temp_relation[att]);
		}
		
		rm.addRelation(rr);
		
		return rr.getName();
	}
	
	/**
	 *	This method is used to add the aggregated values to the temporary table.
	 *	The MIN attributes are changed if the new value is smaller.
	 *	The MAX attributes are changed if the new value is greater.
	 *	etc.
	 *	@param {String} key The index that references the proper row in the temporary table.
	 *	@param {String} att The attribute we wish to update.
	 *	@param {(String|Number)} field The value with which we want to update the attribute.
	 *	@private
	 */
	function updateJournal(key, att, field) {
		if (temp_relation[key][att] === undefined) {
			temp_relation[key][att] = {};
			temp_relation[key][att].name = att;
			temp_relation[key][att].type = groupie[att].type;
			switch (temp_relation[key][att].type) {
				case "AVG":
					temp_relation[key][att].value = { sum: 0, count: 0 };
					break;
				case "MIN":
					temp_relation[key][att].value = Number.POSITIVE_INFINITY;
					break;
				case "MAX":
					temp_relation[key][att].value = Number.NEGATIVE_INFINITY;
					break;
				case "SUM":
				case "COUNT":
					temp_relation[key][att].value = 0;
					break;
			}
		}
		
		switch (temp_relation[key][att].type) {
			case "AVG":
				temp_relation[key][att].value.sum += field;
				++temp_relation[key][att].value.count;
				break;
			case "COUNT":
				++temp_relation[key][att].value;
				break;
			case "SUM":
				temp_relation[key][att].value += field;
				break;
			case "MIN":
				temp_relation[key][att].value = (temp_relation[key][att].value > field) ? field : temp_relation[key][att].value;
				break;
			case "MAX":
				temp_relation[key][att].value = (temp_relation[key][att].value < field) ? field : temp_relation[key][att].value;
				break;
		}
	}
	
	/**
	 *	This method is used to finalize the values in the temporary table.
	 *	It actually iterates through the rows and calculates the AVG columns,
	 *	because AVG values are a special in being an Object that collects sum and cnt values.
	 *	This method calculates sum/cnt and changes the attribute value to it.
	 *	@private
	 */
	function finishJournal() {
		//temprelationön átmegy és az AVG-ket kiszámolja
		var key;
		var att;
		for (key in temp_relation) {
			for (att in groupie) {
				if (temp_relation[key][att].type === "AVG") {
					temp_relation[key][att] = temp_relation[key][att].value.sum / temp_relation[key][att].value.count;
				} else {
					temp_relation[key][att] = temp_relation[key][att].value;
				}
			}
		}
	}
}

/**
 *	This class creates a new relation using two source relations. The source relation's rows are a subset of the new relation's rows.
 *	The new relation takes ownership of the attributes.
 *	Represents the set union operation or the "UNION" in SQL.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function UnionOperation(qtr) {
	var that = this;
	var sourceRelationName1 = qtr.source.relations[0].name;
	var sourceRelationName2 = qtr.source.relations[1].name;
	var resultRelationName = qtr.name;

	this.execute = function() {
		var rm = getRelationsManager();
		var sr1 = rm.getRelation(sourceRelationName1);
		var sr2 = rm.getRelation(sourceRelationName2);
		var rr = new Relation(resultRelationName);
		var srowcnt;
		var rowi;
		
		rr.setAttributes(sr1.getAttributesOnly());
		
		srowcnt = sr1.getRowCount();
		for (rowi = 0; rowi < srowcnt; ++rowi) {
			rr.addRow(sr1.getRow(rowi));
		}
		srowcnt = sr2.getRowCount();
		for (rowi = 0; rowi < srowcnt; ++rowi) {
			rr.addRow(sr2.getRow(rowi));
		}
		
		rm.addRelation(rr);
		
		return rr.getName();
	}
}

/**
 *	This class creates a new relation using two source relations. The new relation's rows are a subset of the first relation's rows.
 *	All the rows from the first source that also exist in the second source are excluded.
 *	The new relation takes ownership of the attributes.
 *	Represents the set difference operation or the "MINUS" in SQL.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function DifferenceOperation(qtr) {
	var that = this;
	var sourceRelationName1 = qtr.source.relations[0].name;
	var sourceRelationName2 = qtr.source.relations[1].name;
	var resultRelationName = qtr.name;

	this.execute = function() {
		var rm = getRelationsManager();
		var sr1 = rm.getRelation(sourceRelationName1);
		var sr2 = rm.getRelation(sourceRelationName2);
		var rr = new Relation(resultRelationName);
		var srowcnt;
		var rowi;
		var srow;
		
		rr.setAttributes(sr1.getAttributesOnly());
		
		srowcnt = sr1.getRowCount();
		for (rowi = 0; rowi < srowcnt; ++rowi) {
			srow = sr1.getRow(rowi);
			if (! sr2.hasRow(srow)) rr.addRow(srow);
		}
		
		rm.addRelation(rr);
		
		return rr.getName();
	}
}

/**
 *	This class creates a new relation using two source relations. The new relation's rows are a subset of the first and second relation's rows.
 *	All the rows from the first source that also exist in the second source are included.
 *	The new relation takes ownership of the attributes.
 *	Represents the set intersection operation or the "INTERSECT" in SQL.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function IntersectionOperation(qtr) {
	var that = this;
	var sourceRelationName1 = qtr.source.relations[0].name;
	var sourceRelationName2 = qtr.source.relations[1].name;
	var resultRelationName = qtr.name;

	this.execute = function() {
		var rm = getRelationsManager();
		var sr1 = rm.getRelation(sourceRelationName1);
		var sr2 = rm.getRelation(sourceRelationName2);
		var rr = new Relation(resultRelationName);
		var srowcnt;
		var rowi;
		var srow;
		
		rr.setAttributes(sr1.getAttributesOnly());
		
		srowcnt = sr1.getRowCount();
		for (rowi = 0; rowi < srowcnt; ++rowi) {
			srow = sr1.getRow(rowi);
			if (sr2.hasRow(srow)) rr.addRow(srow);
		}
		
		rm.addRelation(rr);

		return rr.getName();
	}
}

/**
 *	This class creates a new relation using two source relations.
 *	The result relation's rows are the combinations of rows in the sources that are equal on their common attribute names.
 *	The new relation takes ownership of the common attributes.
 *	Represents the relation algebraic 'bowtie' operation or the "INNER JOIN" in SQL.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function NaturaljoinOperation(qtr) {
	var that = this;
	var sourceRelationName1 = qtr.source.relations[0].name;
	var sourceRelationName2 = qtr.source.relations[1].name;
	var resultRelationName = qtr.name;
	
	this.execute = function() {
		var rm = getRelationsManager();
		var sr1 = rm.getRelation(sourceRelationName1);
		var sr2 = rm.getRelation(sourceRelationName2);
		var rr = new Relation(resultRelationName);
		
		var srowcnt1 = sr1.getRowCount();
		var srowcnt2 = sr2.getRowCount();
		var srow1;
		var srow2;
		var match;
		
		var condition = {};
		var sr1a = new Attributes(sr1.getName());
		var sr2a = new Attributes(sr2.getName());
		var newatts = new Attributes(resultRelationName);
		var newattso, dictionary1, dictionary2;
		var att, i, o;

		sr1a.set(sr1.getAttributes());
		sr2a.set(sr2.getAttributes());
		newatts.set(sr1a.getAttributes());

		newatts.naturaljoin(sr2a.getAttributes());
		rr.setAttributes(newatts.getAttributes());
		
		newattso = newatts.getAttributesOnly();
		dictionary1 = sr1a.translateAttributes(newattso);
		dictionary2 = sr2a.translateAttributes(newattso);

		for (i in newattso) {
			att = newattso[i];
			if (sr1a.has(att) && sr2a.has(att)) {
				// common and supposed to match
				condition[att] = {};
				condition[att].name = att;
				condition[att].esc = "%" + dictionary1[att] + "%==%" + dictionary2[att] + "%";
				condition[att].cols = [dictionary1[att], dictionary2[att]];
			}
		}
		
		for (i = 0; i < srowcnt1; ++i) {		// every line
			srow1 = sr1.getRow(i);
			for (o = 0; o < srowcnt2; ++o) {	// with every line
				srow2 = sr2.getRow(o);
				match = false;
				for (att in condition) {		// and every matching attributename
					match = Rows.evaluate(Rows.append(srow1, srow2), condition[att]);
					if (match === false) break;
				}
				if (match === true) {
					rr.addRow(Rows.join(srow1, srow2));	// @TODO: ne egyenként hivogassa a join-t, hanem épüljön fel az attribute szótár (prepareJoin()) és utána egyesével már csak az összekapcsolást
				}
			}
		}
		
		rm.addRelation(rr);

		return rr.getName();
	}
}

/**
 *	This class creates a new relation using two source relations.
 *	The result relation's rows are a set of rows in the first source for which there is a row in the second source that are equal on their common attribute names.
 *	The new relation does not take ownership of the common attributes.
 *	Represents the relation algebraic 'ltimes' or 'half-bowtie' operation or the "LEFT JOIN" in SQL.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function LeftSemijoinOperation(qtr) {
	var that = this;
	var sourceRelationName1 = qtr.source.relations[0].name;
	var sourceRelationName2 = qtr.source.relations[1].name;
	var resultRelationName = qtr.name;
	
	this.execute = function() {
		var rm = getRelationsManager();
		var sr1 = rm.getRelation(sourceRelationName1);
		var sr2 = rm.getRelation(sourceRelationName2);
		var rr = new Relation(resultRelationName);
		
		var srowcnt1 = sr1.getRowCount();
		var srowcnt2 = sr2.getRowCount();
		var srow1;
		var srow2;
		var match;
		
		var condition = {};
		var sr1a = new Attributes(sr1.getName());
		var sr2a = new Attributes(sr2.getName());
		var newatts = new Attributes(resultRelationName);
		var newattso, dictionary1, dictionary2;
		var att, i, o;

		sr1a.set(sr1.getAttributes());
		sr2a.set(sr2.getAttributes());
		newatts.set(sr1a.getAttributes());

		newatts.naturaljoin(sr2a.getAttributes());
		rr.setAttributes(sr1.getAttributes());		// differs from natural join
		
		newattso = newatts.getAttributesOnly();
		dictionary1 = sr1a.translateAttributes(newattso);
		dictionary2 = sr2a.translateAttributes(newattso);

		for (i in newattso) {
			att = newattso[i];
			if (sr1a.has(att) && sr2a.has(att)) {
				// common and supposed to match
				condition[att] = {};
				condition[att].name = att;
				condition[att].esc = "%" + dictionary1[att] + "%==%" + dictionary2[att] + "%";
				condition[att].cols = [dictionary1[att], dictionary2[att]];
			}
		}
		
		for (i = 0; i < srowcnt1; ++i) {		// every line
			srow1 = sr1.getRow(i);
			for (o = 0; o < srowcnt2; ++o) {	// with every line
				srow2 = sr2.getRow(o);
				match = false;
				for (att in condition) {		// and every matching attributename
					match = Rows.evaluate(Rows.append(srow1, srow2), condition[att]);
					if (match === false) break;
				}
				if (match === true) {
					rr.addRow(srow1);			// differs from natural join
				}
			}
		}
		
		rm.addRelation(rr);

		return rr.getName();
	}
}

/**
 *	This class creates a new relation using two source relations.
 *	The result relation's rows are a set of rows in the second source for which there is a row in the first source that are equal on their common attribute names.
 *	The new relation does not take ownership of the common attributes.
 *	Represents the relation algebraic 'rtimes' or 'half-bowtie' operation or the "RIGHT JOIN" in SQL.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function RightSemijoinOperation(qtr) {
	var that = this;
	var sourceRelationName1 = qtr.source.relations[0].name;
	var sourceRelationName2 = qtr.source.relations[1].name;
	var resultRelationName = qtr.name;
	
	this.execute = function() {
		var rm = getRelationsManager();
		var sr1 = rm.getRelation(sourceRelationName1);
		var sr2 = rm.getRelation(sourceRelationName2);
		var rr = new Relation(resultRelationName);
		
		var srowcnt1 = sr1.getRowCount();
		var srowcnt2 = sr2.getRowCount();
		var srow1;
		var srow2;
		var match;
		
		var condition = {};
		var sr1a = new Attributes(sr1.getName());
		var sr2a = new Attributes(sr2.getName());
		var newatts = new Attributes(resultRelationName);
		var newattso, dictionary1, dictionary2;
		var att, i, o;

		sr1a.set(sr1.getAttributes());
		sr2a.set(sr2.getAttributes());
		newatts.set(sr1a.getAttributes());

		newatts.naturaljoin(sr2a.getAttributes());
		rr.setAttributes(sr2.getAttributes());		// differs from natural join
		
		newattso = newatts.getAttributesOnly();
		dictionary1 = sr1a.translateAttributes(newattso);
		dictionary2 = sr2a.translateAttributes(newattso);

		for (i in newattso) {
			att = newattso[i];
			if (sr1a.has(att) && sr2a.has(att)) {
				// common and supposed to match
				condition[att] = {};
				condition[att].name = att;
				condition[att].esc = "%" + dictionary1[att] + "%==%" + dictionary2[att] + "%";
				condition[att].cols = [dictionary1[att], dictionary2[att]];
			}
		}
		
		for (i = 0; i < srowcnt1; ++i) {		// every line
			srow1 = sr1.getRow(i);
			for (o = 0; o < srowcnt2; ++o) {	// with every line
				srow2 = sr2.getRow(o);
				match = false;
				for (att in condition) {		// and every matching attributename
					match = Rows.evaluate(Rows.append(srow1, srow2), condition[att]);
					if (match === false) break;
				}
				if (match === true) {
					rr.addRow(srow2);			// differs from natural join
				}
			}
		}
		
		rm.addRelation(rr);

		return rr.getName();
	}
}

/**
 *	This class creates a new relation using two source relations.
 *	The result relation's rows are a set of rows in the first source for which there is a row in the second source that are equal on their common attribute names
 *	in addition (loosely speaking) to rows in the first source that have no matching rows in the second source.
 *	The new relation takes ownership of the common attributes.
 *	Represents the relation algebraic 'left-bowtie' operation or the "LEFT OUTER JOIN" in SQL.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function LeftOuterjoinOperation(qtr) {
	var that = this;
	var sourceRelationName1 = qtr.source.relations[0].name;
	var sourceRelationName2 = qtr.source.relations[1].name;
	var resultRelationName = qtr.name;
	
	this.execute = function() {
		var rm = getRelationsManager();
		var sr1 = rm.getRelation(sourceRelationName1);
		var sr2 = rm.getRelation(sourceRelationName2);
		var rr = new Relation(resultRelationName);
		
		var srowcnt1 = sr1.getRowCount();
		var srowcnt2 = sr2.getRowCount();
		var srow1;
		var srow2;
		var match;
		
		var condition = {};
		var sr1a = new Attributes(sr1.getName());
		var sr2a = new Attributes(sr2.getName());
		var newatts = new Attributes(resultRelationName);
		var newattso, dictionary1, dictionary2;
		var att, i, o;
		
		var isHangingrow;	// outer join specific variable
		var omegarow = {};	// outer join specific variable

		sr1a.set(sr1.getAttributes());
		sr2a.set(sr2.getAttributes());
		newatts.set(sr1a.getAttributes());

		newatts.naturaljoin(sr2a.getAttributes());
		rr.setAttributes(newatts.getAttributes());
		
		newattso = newatts.getAttributesOnly();
		dictionary1 = sr1a.translateAttributes(newattso);
		dictionary2 = sr2a.translateAttributes(newattso);

		for (i in newattso) {
			att = newattso[i];
			if (sr1a.has(att) && sr2a.has(att)) {
				// common and supposed to match
				condition[att] = {};
				condition[att].name = att;
				condition[att].esc = "%" + dictionary1[att] + "%==%" + dictionary2[att] + "%";
				condition[att].cols = [dictionary1[att], dictionary2[att]];
			}
			if (!sr1a.has(att) && sr2a.has(att)) {	// outer join specific block
				omegarow[att] = __RELALG_MISSING;
			}
		}
		
		for (i = 0; i < srowcnt1; ++i) {		// every line
			srow1 = sr1.getRow(i);
			isHangingrow = true;
			for (o = 0; o < srowcnt2; ++o) {	// with every line
				srow2 = sr2.getRow(o);
				match = false;
				for (att in condition) {		// and every matching attributename
					match = Rows.evaluate(Rows.append(srow1, srow2), condition[att]);
					if (match === false) break;
				}
				if (match === true) {
					rr.addRow(Rows.join(srow1, srow2));	// @TODO: ne egyenként hivogassa a join-t, hanem épüljön fel az attribute szótár (prepareJoin()) és utána egyesével már csak az összekapcsolást
					isHangingrow = false;
				}
			}
			if (isHangingrow) {
				rr.addRow(Rows.join(srow1, omegarow))
			}
		}
		
		rm.addRelation(rr);

		return rr.getName();
	}
}

/**
 *	This class creates a new relation using two source relations.
 *	The result relation's rows are a set of rows in the second source for which there is a row in the first source that are equal on their common attribute names
 *	in addition (loosely speaking) to rows in the second source that have no matching rows in the first source.
 *	The new relation takes ownership of the common attributes.
 *	Represents the relation algebraic 'right-bowtie' operation or the "RIGHT OUTER JOIN" in SQL.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function RightOuterjoinOperation(qtr) {
	var that = this;
	var sourceRelationName1 = qtr.source.relations[0].name;
	var sourceRelationName2 = qtr.source.relations[1].name;
	var resultRelationName = qtr.name;
	
	this.execute = function() {
		var rm = getRelationsManager();
		var sr1 = rm.getRelation(sourceRelationName1);
		var sr2 = rm.getRelation(sourceRelationName2);
		var rr = new Relation(resultRelationName);
		
		var srowcnt1 = sr1.getRowCount();
		var srowcnt2 = sr2.getRowCount();
		var srow1;
		var srow2;
		var match;
		
		var condition = {};
		var sr1a = new Attributes(sr1.getName());
		var sr2a = new Attributes(sr2.getName());
		var newatts = new Attributes(resultRelationName);
		var newattso, dictionary1, dictionary2;
		var att, i, o;
		
		var isHangingrow;	// outer join specific variable
		var omegarow = {};	// outer join specific variable

		sr1a.set(sr1.getAttributes());
		sr2a.set(sr2.getAttributes());
		newatts.set(sr1a.getAttributes());

		newatts.naturaljoin(sr2a.getAttributes());
		rr.setAttributes(newatts.getAttributes());
		
		newattso = newatts.getAttributesOnly();
		dictionary1 = sr1a.translateAttributes(newattso);
		dictionary2 = sr2a.translateAttributes(newattso);

		for (i in newattso) {
			att = newattso[i];
			if (sr1a.has(att) && sr2a.has(att)) {
				// common and supposed to match
				condition[att] = {};
				condition[att].name = att;
				condition[att].esc = "%" + dictionary1[att] + "%==%" + dictionary2[att] + "%";
				condition[att].cols = [dictionary1[att], dictionary2[att]];
			}
			if (sr1a.has(att) && !sr2a.has(att)) {	// outer join specific block
				omegarow[att] = __RELALG_MISSING;
			}
		}
		
		for (i = 0; i < srowcnt2; ++i) {		// every line	!! iterations are reversed between tables
			srow2 = sr2.getRow(i);
			isHangingrow = true;
			for (o = 0; o < srowcnt1; ++o) {	// with every line
				srow1 = sr1.getRow(o);
				match = false;
				for (att in condition) {		// and every matching attributename
					match = Rows.evaluate(Rows.append(srow1, srow2), condition[att]);
					if (match === false) break;
				}
				if (match === true) {
					rr.addRow(Rows.join(srow1, srow2));	// @TODO: ne egyenként hivogassa a join-t, hanem épüljön fel az attribute szótár (prepareJoin()) és utána egyesével már csak az összekapcsolást
					isHangingrow = false;
				}
			}
			if (isHangingrow) {
				rr.addRow(Rows.join(omegarow, srow2))
			}
		}
		
		rm.addRelation(rr);

		return rr.getName();
	}
}

/**
 *	This class creates a new relation using two source relations.
 *	The result relation's rows are a set of rows in the first source for which there is a row in the second source that are equal on their common attribute names
 *	in addition (loosely speaking) to rows in the first source that have no matching rows in the second source and rows in the second source that have no matching rows in the first source.
 *	The new relation takes ownership of the common attributes.
 *	Represents the relation algebraic 'full-bowtie' operation or the "FULL OUTER JOIN" in SQL.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function FullOuterjoinOperation(qtr) {
	var that = this;
	var sourceRelationName1 = qtr.source.relations[0].name;
	var sourceRelationName2 = qtr.source.relations[1].name;
	var resultRelationName = qtr.name;
	
	this.execute = function() {
		var rm = getRelationsManager();
		var sr1 = rm.getRelation(sourceRelationName1);
		var sr2 = rm.getRelation(sourceRelationName2);
		var rr = new Relation(resultRelationName);
		
		var srowcnt1 = sr1.getRowCount();
		var srowcnt2 = sr2.getRowCount();
		var srow1;
		var srow2;
		var match;
		
		var condition = {};
		var sr1a = new Attributes(sr1.getName());
		var sr2a = new Attributes(sr2.getName());
		var newatts = new Attributes(resultRelationName);
		var newattso, dictionary1, dictionary2;
		var att, i, o;
		
		var isHangingrow1;	// outer join specific variable
		var isHangingrow2 = arrayFill(srowcnt2, true); // outer join specific variable
		var omegarow1 = {};	// outer join specific variable
		var omegarow2 = {};	// outer join specific variable

		sr1a.set(sr1.getAttributes());
		sr2a.set(sr2.getAttributes());
		newatts.set(sr1a.getAttributes());

		newatts.naturaljoin(sr2a.getAttributes());
		rr.setAttributes(newatts.getAttributes());
		
		newattso = newatts.getAttributesOnly();
		dictionary1 = sr1a.translateAttributes(newattso);
		dictionary2 = sr2a.translateAttributes(newattso);

		for (i in newattso) {
			att = newattso[i];
			if (sr1a.has(att) && sr2a.has(att)) {
				// common and supposed to match
				condition[att] = {};
				condition[att].name = att;
				condition[att].esc = "%" + dictionary1[att] + "%==%" + dictionary2[att] + "%";
				condition[att].cols = [dictionary1[att], dictionary2[att]];
			}
			if (!sr1a.has(att) && sr2a.has(att)) {	// outer join specific block
				omegarow2[att] = __RELALG_MISSING;
			} else
			if (sr1a.has(att) && !sr2a.has(att)) {	// outer join specific block
				omegarow1[att] = __RELALG_MISSING;
			}
		}
		
		for (i = 0; i < srowcnt1; ++i) {		// every line
			srow1 = sr1.getRow(i);
			isHangingrow1 = true;
			for (o = 0; o < srowcnt2; ++o) {	// with every line
				srow2 = sr2.getRow(o);
				match = false;
				for (att in condition) {		// and every matching attributename
					match = Rows.evaluate(Rows.append(srow1, srow2), condition[att]);
					if (match === false) break;
				}
				if (match === true) {
					rr.addRow(Rows.join(srow1, srow2));	// @TODO: ne egyenként hivogassa a join-t, hanem épüljön fel az attribute szótár (prepareJoin()) és utána egyesével már csak az összekapcsolást
					isHangingrow1 = false;
					isHangingrow2[o] = false;
				}
			}
			if (isHangingrow1) {
				rr.addRow(Rows.join(srow1, omegarow2))
			}
		}
		i = isHangingrow2.indexOf(true);
		while (i !== -1) {
			rr.addRow(Rows.join(omegarow1, sr2.getRow(i)));
			i = isHangingrow2.indexOf(true, i+1);
		}
		
		rm.addRelation(rr);

		return rr.getName();
	}
}

/**
 *	This class creates a new relation using two source relations.
 *	The result relation's rows are the rows in the first source for which there is no row in the second source that would be equal on their common attribute names.
 *	The new relation doesn't take ownership of the common attributes.
 *	Represents the relation algebraic 'triangle-right' operation or the "NOT IN" in SQL WHERE clause.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function AntijoinOperation(qtr) {
	var that = this;
	var sourceRelationName1 = qtr.source.relations[0].name;
	var sourceRelationName2 = qtr.source.relations[1].name;
	var resultRelationName = qtr.name;
	
	this.execute = function() {
		var rm = getRelationsManager();
		var sr1 = rm.getRelation(sourceRelationName1);
		var sr2 = rm.getRelation(sourceRelationName2);
		var rr = new Relation(resultRelationName);
		
		var srowcnt1 = sr1.getRowCount();
		var srowcnt2 = sr2.getRowCount();
		var srow1;
		var srow2;
		var match;
		var match_outer;
		
		var condition = {};
		var sr1a = new Attributes(sr1.getName());
		var sr2a = new Attributes(sr2.getName());
		var newatts = new Attributes(resultRelationName);
		var newattso, dictionary1, dictionary2;
		var att, i, o;

		sr1a.set(sr1.getAttributes());
		sr2a.set(sr2.getAttributes());
		newatts.set(sr1a.getAttributes());

		newatts.naturaljoin(sr2a.getAttributes());
		rr.setAttributes(sr1.getAttributes());		// differs from natural join, same as leftjoin
		
		newattso = newatts.getAttributesOnly();
		dictionary1 = sr1a.translateAttributes(newattso);
		dictionary2 = sr2a.translateAttributes(newattso);

		for (i in newattso) {
			att = newattso[i];
			if (sr1a.has(att) && sr2a.has(att)) {
				// common and supposed to match
				condition[att] = {};
				condition[att].name = att;
				condition[att].esc = "%" + dictionary1[att] + "%==%" + dictionary2[att] + "%";
				condition[att].cols = [dictionary1[att], dictionary2[att]];
			}
		}
		
		// this block differs from natural join, left join, right join
		for (i = 0; i < srowcnt1; ++i) {		// every line
			srow1 = sr1.getRow(i);
			match_outer = false;
			for (o = 0; o < srowcnt2; ++o) {	// with every line
				srow2 = sr2.getRow(o);
				match = false;
				for (att in condition) {		// and every matching attributename
					match = Rows.evaluate(Rows.append(srow1, srow2), condition[att]);
					if (match === false) break;
				}
				if (match === true) {
					match_outer = true;
				}
			}
			if (!match_outer) {
				rr.addRow(srow1);
			}
		}
		
		rm.addRelation(rr);

		return rr.getName();
	}
}

/**
 *	This class creates a new relation using two source relations.
 *	The result consists of the restrictions of rows in the first source to the attribute names unique to the first source
 *	for which it holds that all their combinations with rows in the second source are present in the first source.
 *	The new relation doesn't have the attributes that are common in both source relations.
 *	Represents the relation algebraic '÷' operation.
 *	It doesn't have a counterpart in SQL, it can be emulated with a special 'GROUP BY - HAVING - COUNT' construct.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function DivisionOperation(qtr) {
	var that = this;
	var sourceRelationName1 = qtr.source.relations[0].name;
	var sourceRelationName2 = qtr.source.relations[1].name;
	var resultRelationName = qtr.name;
	
	this.execute = function() {
		var rm = getRelationsManager();
		var sr1 = rm.getRelation(sourceRelationName1);
		var sr2 = rm.getRelation(sourceRelationName2);
		var tr1 = new Relation(sourceRelationName1);
		var rr = new Relation(resultRelationName);
		var srowcnt1;
		var srowcnt2;
		var srow1, srow2;
		var matchedall;
		
		var i, o;
		var condition = {};
		condition.cols = [];
		condition.esc = [];
		var a1 = sr1.getAttributes();
		var a2o = sr2.getAttributesOnly();
		var a = new Attributes(sourceRelationName1);
		a.set(a1);
		a.divide(a2o);
		tr1.setAttributes(a.getAttributes());
		rr.setAttributes(a.getAttributes());
		
		tr1.setMultisetMode(false);
		tr1.copyRowsFrom(sr1);
		srowcnt1 = tr1.getRowCount();
		srowcnt2 = sr2.getRowCount();
		
		for (i = 0; i < srowcnt1; ++i) {
			srow1 = tr1.getRow(i);
			matchedall = true;
			for (o = 0; o < srowcnt2; ++o) {
				srow2 = sr2.getRow(o);
				if (!sr1.hasRow(Rows.append(srow1, srow2))) {
					matchedall = false;
					break;
				}
			}
			if (matchedall) {
				rr.addRow(srow1);
			}
		}

		rm.addRelation(rr);

		return rr.getName();
	}
}

/**
 *	This class creates a new relation using two source relations and creating the crossproduct of their rows.
 *	The new relation leaves the ownership of the attributes intact.
 *	Represents the set Cartesian product operation or the "relation_name1, relation_name2" in SQL FROM clause.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function CrossproductOperation(qtr) {
	var that = this;
	var sourceRelationName1 = qtr.source.relations[0].name;
	var sourceRelationName2 = qtr.source.relations[1].name;
	var resultRelationName = qtr.name;
	
	this.execute = function() {
		var rm = getRelationsManager();
		var sr1 = rm.getRelation(sourceRelationName1);
		var sr2 = rm.getRelation(sourceRelationName2);
		var rr = new Relation(resultRelationName);
		
		var srowcnt1 = sr1.getRowCount();
		var srowcnt2 = sr2.getRowCount();
		var srow1;
		var srow2;
		var i, o;
		
		var a = new Attributes(resultRelationName);
		a.set(sr1.getAttributes());
		a.crossproduct(sr2.getAttributes());
		rr.setAttributes(a.getAttributes());

		for (i = 0; i < srowcnt1; ++i) {
			srow1 = sr1.getRow(i);
			for (o = 0; o < srowcnt2; ++o) {
				srow2 = sr2.getRow(o);
				rr.addRow(Rows.append(srow1, srow2));
			}
		}
		
		rm.addRelation(rr);

		return rr.getName();
	}
	
}

/**
 *	This class creates a new relation using two source relations.
 *	The result of this operation consists of all combinations of rows in the source relations that satisfy the θ condition.
 *	The new relation leaves the ownership of the attributes intact.
 *	Represents the relational algebraic 'bowtie-θ' operation or the "JOIN ON" in SQL JOIN clause.
 *	@param {QueryTreeRelationDetails} qtr One element (sub tree) of the Query Tree containing a command and parameters to this command.
 *	@constructor
 */
function ThetajoinOperation(qtr) {
	var that = this;
	var sourceRelationName1 = qtr.source.relations[0].name;
	var sourceRelationName2 = qtr.source.relations[1].name;
	var resultRelationName = qtr.name;
	var conditional = qtr.source.parameter;	// differs from Crossproduct
	
	this.execute = function() {
		var rm = getRelationsManager();
		var sr1 = rm.getRelation(sourceRelationName1);
		var sr2 = rm.getRelation(sourceRelationName2);
		var rr = new Relation(resultRelationName);
		
		var srowcnt1 = sr1.getRowCount();
		var srowcnt2 = sr2.getRowCount();
		var srow1;
		var srow2;
		var i, o;
		
		var a = new Attributes(resultRelationName);
		a.set(sr1.getAttributes());
		a.crossproduct(sr2.getAttributes());
		rr.setAttributes(a.getAttributes());
		
		// differs from Crossproduct
		var rowapp;							
		var fields = conditional.cols;
		fields = a.translateAttributes(fields);
		conditional = AttributeParameter.translate(conditional, fields);

		for (i = 0; i < srowcnt1; ++i) {
			srow1 = sr1.getRow(i);
			for (o = 0; o < srowcnt2; ++o) {
				srow2 = sr2.getRow(o);
				rowapp = Rows.append(srow1, srow2);			// differs from Crossproduct, but could be the same there too
				if (Rows.evaluate(rowapp, conditional)) {	// differs from Crossproduct
					rr.addRow(rowapp);
				}
			}
		}
		
		rm.addRelation(rr);

		return rr.getName();
	}
	
}
