/**
	Relational Algebra Simulator
	author: David Nagy (mrnagydavid)
	
	version: 1.0
	
	@license MIT
*/
"use strict";
var __RELALG_QUERYMANAGER = true;

/**
 *	The QueryManager class manages the whole process of parsing and executing the relational algebraic expression.
 *	It performs a prelminary syntax check on its arguments (i.e relation names and attribute names are well-formatted).
 *	It creates the SymbolManager instance, the RelationManager instance and loads the relations, attributes and data into them.
 *	It creates the Parser instance which builds the query tree.
 *	It creates the CommandManager which takes the resultant query tree as its parameter.
 *	If implemented, the step for query tree optimization is here.
 *	The QueryManager gives the execute command to the CommandManager.
 *	The treeviewer module is also given the query tree to create the processingjs tree.
 *	@param {String} command The relational algebraic expression to parse and execute.
 *	@param {InputRelationMap} relations A map of the relations to be used with the 'command'.
 *	@constructor
 */
function QueryManager(command, relations) {
	var that = this;
	/**
	 *	The relational algebraic command to be parsed and executed.
	 */
	var cmd = command;
	var rels = relations;
	
	/**
	 *	This private method performs a prelminary syntax check on the arguments (i.e relation names and attribute names exist and are well-formatted).
	 */
	function preliminaryCheck() {
		var rel;
		var row;
		var atts;
		var att;
		var i;
		var regchck;
		
		if (typeof cmd === 'undefined' || cmd.length === 0) {
			throw new RASRelationalAlgebraicExpressionMissingError();
		}
		
		for (rel in rels) {
			regchck = rels[rel].name.match(/[A-Za-z][A-Za-z0-9_]*/);
			if (rels[rel].name.length === 0 || (typeof regchck === 'object' && regchck === null) || regchck[0] !== rels[rel].name) {
				throw new RASNotWellFormedError(rels[rel].name, i18n.relation[lang]);
			}
			row = rels[rel].data.split("\n")[0];
			row = row.trim();
			atts = row.split(";");
			for (i in atts) {
				att = atts[i].trim();
				regchck = att.match(/[A-Za-z][A-Za-z0-9_]*/);
				if (att.length === 0 || (typeof regchck === 'object' && regchck === null) || regchck[0] !== att) {
					throw new RASNotWellFormedError(att, i18n.attribute[lang]);
				}
			}
		}
	}
	
	/**
	 * This method begins the whole process of executing the relational algebraic command.
	 * @return {InputRelation}
	 */
	this.execute = function() {
		preliminaryCheck();		
				
		var sm = getSymbolManager(true);
		var rm = getRelationsManager(true);
		var tm = getTreeManager(true);
		var r;
		var rel;
		var rows;
		
		for (rel in rels) {
			sm.addRelation(rels[rel].name);
			rows = rels[rel].data.split("\n");
			sm.setAttributes(rows[0], rels[rel].name);
			
			r = new Relation(rels[rel].name);
			r.setAttributes(rows[0]);
			rows.splice(0, 1);
			r.setData(rows);
			rm.addRelation(r);
		}
		
		var p = new Parser();
		var qtr = p.parse(cmd);
		var cm = new CommandManager(qtr);
		var res = cm.execute();		
		var result = [];
		
		rel = rm.getRelation(res);
		result.push(rel.getAttributesUnique().join(";"));
		result.push(rel.getData());
		
		tm.addTree(qtr);		
		
		return { name: rel.getName(), data: result.join("\n") };
	}
	
}