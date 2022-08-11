/**
	Relational Algebra Simulator
	author: David Nagy (mrnagydavid)
	
	version: 1.0
	
	@license MIT
*/

var __RELALG_TEMPLATES = true;
"use strict";

/**
 *	This object carries all the templates that are used to make the site dynamic.
 *	Every field references one template
 *	@static
 *	@global
 */

var raw_templates = {
	relation_block: '\
		<div id="relation{{id}}" class="col-lg-3 col-md-4 relation relationBlock"> \
			<div class="input-group"> \
				<input type="text" id="relation{{id}}_name" class="span form-control relationName" placeholder="{{placeholder.relation}}" value="{{name}}" /> \
				<span class="input-group-btn"> \
					<button type="button" id="relation{{id}}_save" class="btn btn-info btn-default relationButton saveRelation" title="{{title_saverelbtn}}" data-id="{{id}}"><span class=" glyphicon glyphicon-floppy-save"></span></button> \
					<button type="button" id="relation{{id}}_del" class="btn btn-danger btn-default relationButton deleteRelation" title="{{title_delrelbtn}}" data-id="{{id}}"><strong>x</strong></button> \
				</span> \
			</div> \
			<div id="relation{{id}}_data" class="panel panel-default relationData"> \
				<table id="relation{{id}}_table" class="table table-hover relationTable"> \
				</table> \
				<textarea id="relation{{id}}_raw" class="form-control relationRaw" placeholder="{{placeholder.data}}" rows="3" data-delim="{{delim}}">{{data}}</textarea> \
			</div> \
		</div>',
		
	relation_table: '\
		<table id="relation{{id}}_table" class="table table-hover">	\
			<thead>	\
				<tr>	\
					{{#attributes}}	\
						<th>{{attribute}}</th>	\
					{{/attributes}}	\
				</tr>	\
			</thead>	\
			<tbody>	\
				{{#rows}}	\
					<tr>	\
						{{#values}}	\
						<td>{{value}}</td>	\
						{{/values}}	\
					</tr>	\
				{{/rows}}	\
			</tbody>	\
		</table>',
		
	settings_selected: '<span class="glyphicon glyphicon-ok settingsSelected" aria-hidden="true"></span>',
	
	errormsg: '\
		<div id="error" class="panel panel-{{type}} errormsg" role="alert">	\
			<div class="panel-heading"><strong>{{errortitle}}</strong></div>	\
			<div class="panel-body">	\
				<p>{{intro}}</p>	\
				<p>{{errorwas}}</p>	\
				<pre>{{errormsg}}</pre>	\
			</div>	\
			<button id="error_btnok" type="button" class="btn btn-default center-block">Ok</button>	\
		</div>',
		
	relation_list: '\
		<div id="manageRelationsPanel" class="panel panel-info">	\
			<div class="panel panel-heading"><h4>{{title_block}}</h4></div>	\
			<div class="panel panel-body">	\
				<ul class="list-group">	\
					{{#each relations}} \
					<li id="rel_{{this}}" class="list-group-item"> \
						<div class="btn-group" role="group"> \
							<button class="btn btn-s btn-success loadSavedRelation" title="{{../title_loadbtn}}" data-rel="{{this}}">+</button>	\
							<button class="btn btn-s btn-danger delSavedRelation" title="{{../title_delbtn}}" data-rel="{{this}}"><strong>x</strong></button>	\
						</div> \
						{{this}} \
					</li>	\
					{{else}} \
					<li class="list-group-item">{{no_saved_rels}}</li> \
					{{/each}}	\
				</ul>	\
			</div>	\
			<button id="rl_btnclose" type="button" class="btn btn-default center-block">{{closebtn}}</button>	\
		</div>'
}