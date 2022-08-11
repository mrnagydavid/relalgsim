/**
	Relational Algebra Simulator
	author: David Nagy (mrnagydavid)
	
	version: 1.0
	
	@license MIT
*/
"use strict";
var __RELALG_UIMANAGER = true;

/**
 *	This method is a jQuery variant of document.onLoad.
 *	It sets up the basic trigger-event pairs betweenthe user interface and the UI-controller.
 */
$("document").ready(function() {
	if (typeof __UNITTEST === 'undefined') {
		if (typeof __RELALG_I18N === 'undefined') {
			alert("Could not load the translations. The site won't be usable. We are sorry!\nPlease, try to refresh the page.");
			return;
		}
		if (typeof __RELALG_EXCEPTIONS === 'undefined') {
			alert("Could not load some necessary modules. The site won't be usable. We are sorry!\nPlease, try to refresh the page.");
			return;
		}
		try {
			var uic = new UserInterfaceController();
			uic.setup();
		} catch (e) {
			alert(e.message);
		}
	}
});

/**
 *	This class manages the interactions between the user interface and the model we use for executing relational algebraic expression.
 *	As it is the connection to the user interface, it heavily relies on the jQuery library.
 *	@see {@link http://api.jquery.com/jQuery/} for further information.
 *	@constructor
 *	@throws {RASNotLoadedError}
 */
function UserInterfaceController() {
	var that = this;
	var __dblclick;
	var templates = {};
	
	if (typeof $ === 'undefined') {
		throw new RASNotLoadedError("jQuery");
	}
	
	/**
	 *	This method is used to translate any kind of identification to a relation into a jQuery object holding the HTML code of that very relation.
	 *	@param {(Number|String|jQuery)} id
	 *	@return {jQuery}
	 */
	function idTo$(id) {
		if (id instanceof jQuery) {
			return id.closest(".relationBlock");
		} else if (typeof id === "string" && typeofvalue(id) === "number") {
			return $("#relation" + Number(id).valueOf());
		} else if (typeof id === "string") {
			if (id.charAt(0) === "#") {
				return $(id);
			} else {
				return $("#" + id);
			}
		} else if (typeof id === "number") {
			return $("#relation" + id);
		}
		return $;
	}
	
	/**
	 *	This method is used to find the relation by one of its components referenced in the selector.
	 *	@example assert(parseId("#relation5_name") === 5);
	 *	@param {String} selector
	 *	@return {Number}
	 */	
	function parseId(selector) {
		if (typeof selector === 'undefined') return 0;
		return Number(selector.match(/\d+/)[0]).valueOf();
	}
	
	/**
	 *	Settings namespace holds the methods for loading and saving the settings from/to cookies.
	 */	
	var settings = {
			/**
			 *	Load settings from cookies, if there is any.
			 */
			load: function() {
				var c;
				var selector;
				
				// language
				c = $.cookie('language');
				if (typeof c !== 'undefined' && c.length == 2) {
					lang = c;
				}
				$("#" + lang).append(templates.settings_selected());
				$("#" + lang).addClass("selected");
				if (lang !== "en") changeLanguage(lang);
				
				// extended mode
				c = $.cookie('mode');
				if (typeof c !== 'undefined') {
					extendedMode = (c === "true") ? true : false;
				}
				if (extendedMode) {				
					$("#extended").append(templates.settings_selected());
					$("#extended").addClass("selected");
				} else {
					$("#normal").append(templates.settings_selected());
					$("#normal").addClass("selected");
				}
				changeMode(extendedMode);
			},
			/**
			 *	Save settings to cookies.
			 */
			save: function() {
				$.cookie('language', lang);
				$.cookie('mode', extendedMode);
			}
	};
	
	/**
	 *	Change mode. By changing mode certain symbols become unaccessable on the toolbar as well.
	 *	@param {boolean} mode
	 */
	function changeMode(mode) {
		extendedMode = mode;
		$("#tbDistinct").attr("disabled", !mode);
		$("#tbSort").attr("disabled", !mode);
		$("#tbAggregation").attr("disabled", !mode);
	}
	
	/**
	 *	Change website language to the one specified in the parameter by
	 *	using an ajax call to download translations.xml
	 *	and replace the text elements of the site to the ones found in the XML file.
	 *	@param {String} l The two-letter countrycode.
	 */
	function changeLanguage(l) {
		$.ajax({
			url: 'translations.xml',
			dataType: 'xml',
			beforeSend: function( xhr ) {
				xhr.overrideMimeType( "text/plain; charset=UTF-8" );
			},
			success: function(xml) {
				$(xml).find('translation').each(function(){
					var id = $(this).attr('id');
					var type = $(this).attr('type');
					var dstn = $(this).attr('dstn');
					var text = $(this).find(l).text();
					var selector = "";
					switch (type) {
						case "class":
							selector = "." + id;
							break;
						case "id":
							selector = "#" + id;
							break;
					}
					if (dstn === 'html') {
						$(selector).html(text);
					} else {
						$(selector).attr(dstn, text);
					}
				});
				
				// fixes
				$(".settingsMode.selected").append(templates.settings_selected());
			}
		});
	}
	
	/**
	 *	This method prepares the site to handle user interaction by attaching event listeners to UI elements.
	 *	Practically this is the booting of the UI.
	 *	It is separated from the constructor to better work with the unit testing method employed during the development.
	 */
	this.setup = function() {		
		// compiling HTML templates
		var att;
		for (att in raw_templates) {
			templates[att] = Handlebars.compile(raw_templates[att]);
		}
		
		// cleaning after refresh
		$("#relationnew_name").val("");
		$("#relationnew_data").val("");
		$("#relation0_raw").val("");
		
		// settings
		settings.load();
		
		$("#settings").on("click", function(event) {
			event.stopPropagation();
		});
		
		$(".settingsMode").on("click", function(event) {
			$(".settingsMode span.settingsSelected").remove();
			$(".settingsMode.selected").removeClass("selected");
			$(this).append(templates.settings_selected());
			$(this).addClass("selected");
			that.eventHandler.change.mode($(this));
		});
		
		$(".settingsLang").on("click", function(event) {
			$(".settingsLang span.settingsSelected").remove();
			$(this).append(templates.settings_selected());
			that.eventHandler.change.lang($(this));
		});
		
		// start editing
		$("body").on("dblclick", "div.relationData, div#relation0_data" , function(event) {
			__dblclick = true;
			// exit editing mode if there was anything being edited
			that.eventHandler.edit_finish();
			// enter editing mode for current element and its counterpart
			that.eventHandler.edit_start(this);
			// stop event from reaching "body"
			event.stopPropagation();
			__dblclick = false;
		});
		
		// finish editing
		$("body").on("blur", "div#userDefinedRelations div.relationBlock div.relationData, div#relation0_data" , function () {
			if (!__dblclick) {
				that.eventHandler.edit_finish();
			}
		});
		
		// any changes to the raw data is noted
		$("body").on("change", "textarea.relationRaw", that.eventHandler.change.relationRaw);
		
		// add relation green + button
		$("#relationnew_add").click(that.eventHandler.add_relation);
		
		// delete relation
		$("body").on("click", "#userDefinedRelations .deleteRelation", that.eventHandler.delete_relation);
		
		// add result relation to source relations
		$("#addResultRelation").click(that.eventHandler.add_result_relation);
		
		// parse
		$("#startQuery").click(that.eventHandler.startQuery);
		
		// errorpanel
		$("body").on("click", "#error button", function (event) {
			$("#overlay").remove();
			$("#error").remove();
		});
		
		// token toolbar
		$("#queryToolbar button").mousedown(that.eventHandler.insertToken);
		$("#queryToolbar button").mouseup(function() { $("#queryCommand").focus(); });
		
		// saving and loading relations
		// show loading panel
		$("#loadRelation").click(that.eventHandler.loadsave.show_saved_relations);
		
		// close loading panel
		$("body").on("click", "div#manageRelationsPanel #rl_btnclose", function (event) {
			$("#overlay").remove();
			$("#manageRelationsPanel").remove();
		});
		
		// save relation
		$("body").on("click", "div#userDefinedRelations .saveRelation", that.eventHandler.loadsave.save_relation);
		
		// load relation
		$("body").on("click", "div#manageRelationsPanel .loadSavedRelation", that.eventHandler.loadsave.load_relation);
		
		// delete relation
		$("body").on("click", "div#manageRelationsPanel .delSavedRelation", that.eventHandler.loadsave.delete_relation);
		
		// checking required modules
		if (typeof __RELALG_ATTRIBUTES === 'undefined' || 
			typeof __RELALG_COMMANDMANAGER === 'undefined' || 
			typeof __RELALG_COMMON === 'undefined' || 
			typeof __RELALG_OPERATIONS === 'undefined' || 
			typeof __RELALG_PARSER === 'undefined' || 
			typeof __RELALG_QUERYMANAGER === 'undefined' || 
			typeof __RELALG_RELATIONSMANAGER === 'undefined' || 
			typeof __RELALG_SYMBOLMANAGER === 'undefined' || 
			typeof __RELALG_TREEVIEWER === 'undefined' || 
			typeof __RELALG_LOADSAVERELS === 'undefined') 
		{
			handleError(new RASNotLoadedError('Some important'));
			return;
		}
		
		// loading screen
		$("#loading").remove();
		
	}
	
	/**
	 *	The eventHandler functions are fired after certain events occure, like the editing of a table starts or finishes.
	 */
	this.eventHandler = {
		/**
		 *	This method inserts a new block into the source relations
		 */
		add_relation: function() {
			try {
				var newid = that.insertRelation($("#relationnew_name").val(), $("#relationnew_data").val());
				$("#relationnew_name").val("");
				$("#relationnew_data").val("");
			} catch (e) {
				handleError(e);
			}
		},
		
		delete_relation: function() {
			try {
				that.deleteRelation($(this));
			} catch (e) {
				handleError(e);
			}
		},
		
		/**
		 *	This method inserts the result relation into a new block in the source relations.
		 */
		add_result_relation: function() {
			try {
				var resval = $("#relation0_raw").val();
				if (resval.length > 0) {
					var newid = that.insertRelation(i18n.result[lang].toUpperCase(), $("#relation0_raw").val());
				}
			} catch (e) {
				handleError(e);
			}
		},
		
		/**
		 *	This method makes the appropriate CSS-changes so the user can start editing the rows of a relation.
		 */
		edit_start: function(item) {
			$(item).addClass("edit");
			$(item).children("textarea").focus();
		},
		
		/**
		 *	This method makes the appropriate CSS-changes when the user finishes editing the rows of a relation.
		 *	If the rows were changed, the change is update into the table view.
		 */
		edit_finish: function() {
			try {
				var jEdit = $("#userDefinedRelations .relationData.edit textarea, #relation0 .relationData.edit textarea");
				if (jEdit.hasClass("changed")) {
					that.convertRawToTable(parseId(jEdit.attr("id")));
					jEdit.removeClass("changed");
				}
				$(".edit").removeClass("edit");
			}  catch (e) {
				handleError(e);
			}
		},
		
		loadsave: {
			show_saved_relations: function() {
				try {				
					var context = {
						title_block: i18n.title_listrels[lang],
						relations: LSR.listNames(),
						title_loadbtn: i18n.title_loadrelbtn[lang],
						title_delbtn: i18n.title_delrelbtn[lang],
						no_saved_rels: i18n.ph_no_saved_relation[lang],
						closebtn: i18n.ph_closebutton[lang]
					};
					
					var dom = templates.relation_list(context);
					$("#manageRelationsContainer").append('<div id="overlay"></div>');
					$("#manageRelationsContainer").append(dom);	
				} catch (e) {
					handleError(e);
				}
			},
			
			save_relation: function() {
				var id = $(this).attr("data-id");
				try {
					LSR.add($("#relation" + id + "_name").val(), $("#relation" + id + "_raw").val());
				} catch (e) {
					handleError(e);
				}
				$(this).switchClass( "btn-info", "btn-success", 1000).switchClass( "btn-success", "btn-info", 1000);
			},
			
			load_relation: function() {
				try {
					var name = $(this).attr("data-rel");
					var data = LSR.get(name);
					that.insertRelation(name, data);
				} catch (e) {
					handleError(e);
				}
			},
			
			delete_relation: function() {
				try {
					var name = $(this).attr("data-rel");
					LSR.del(name);
					$("#manageRelationsPanel #rel_" + name).remove();
				} catch (e) {
					handleError(e);
				}
			}
		},
		
		/**
		 *	This namespace holds events that respond to changes in the UI done by the user, e.g. changing settings or relation data.
		 */
		change: {
			/**
			 *	Notes that the currently edited relation's data has been changed by the user, and upon exiting edit mode, it has to be reviewed.
			 */
			relationRaw: function() {
				$(this).addClass("changed");
			},
			
			/**
			 *	Applies the user's new choice whether the system is working with standard or extended relational algebra.
			 */
			mode: function(jItem) {
				switch (jItem.attr("id")) {
					case "normal":
						changeMode(false);
						break;
					case "extended":
						changeMode(true);
						break;
				}
				settings.save();
			},
			
			/**
			 *	Applies the user's new choice for the language of the site.
			 */
			lang: function(jItem) {
				// http://www.webgeekly.com/tutorials/jquery/how-to-make-your-site-multilingual-using-xml-and-jquery/
				var l = jItem.attr("id");
				lang = l;
				changeLanguage(l);
				settings.save();
			}
		},
		
		/**
		 *	Insert a syntax token into the query editor.
		 */
		insertToken: function() {
			var jThis = $(this);
			var id = jThis.attr('id');
			var jEditor = $("#queryCommand");
			var isSelected = (jEditor.selection("text").length > 0);
			var before = "";
			var after = "";
			switch (id) {
				case "tbProjection":
					before = "\u03c0 ( __ ; ";
					after = " )";
					break;

				case "tbSelection":
					before = "\u03c3 ( __ ; ";
					after = " )";
					break;

				case "tbRename":
					before = "\u03c1 ( __ ; ";
					after = " )";
					break;

				case "tbDistinct":
					before = "\u03b4 ( ";
					after = " )";					
					break;

				case "tbSort":
					before = "\u03c4 ( __ ; ";
					after = " )";
					break;

				case "tbAggregation":
					before = "\u03b3( __ ; ";
					after = " )";
					break;

				case "tbThetajoin":
					before = "\u03b8 ( __ ; ";
					after = " , __ )";
					break;

				case "tbCrossproduct":
					if (isSelected) {
						before = "( ";
						after = " ) × ";
					} else {
						before = " × ";
					}
					break;

				case "tbUnion":
					if (isSelected) {
						before = "( ";
						after = " ) \u22c3 ";
					} else {
						before = " \u22c3 ";
					}
					break;

				case "tbDifference":
					if (isSelected) {
						before = "( ";
						after = " ) - ";
					} else {
						before = " - ";
					}
					break;

				case "tbIntersection":
					if (isSelected) {
						before = "( ";
						after = " ) \u22c2 ";
					} else {
						before = " \u22c2 ";
					}
					break;

				case "tbDivision":
					if (isSelected) {
						before = "( ";
						after = " ) ÷ ";
					} else {
						before = " ÷ ";
					}
					break;

				case "tbNaturaljoin":
					if (isSelected) {
						before = "( ";
						after = " ) \u22c8 ";
					} else {
						before = " \u22c8 ";
					}
					break;

				case "tbLeftsemijoin":
					if (isSelected) {
						before = "( ";
						after = " ) \u22c9 ";
					} else {
						before = " \u22c9 ";
					}
					break;

				case "tbRightsemijoin":
					if (isSelected) {
						before = "( ";
						after = " ) \u22ca ";
					} else {
						before = " \u22ca ";
					}
					break;

				case "tbAntijoin":
					if (isSelected) {
						before = "( ";
						after = " ) \u25b7 ";
					} else {
						before = " \u25b7 ";
					}
					break;

				case "tbLeftouterjoin":
					if (isSelected) {
						before = "( ";
						after = " ) \u27d5 ";
					} else {
						before = " \u27d5 ";
					}
					break;

				case "tbRightouterjoin":
					if (isSelected) {
						before = "( ";
						after = " ) \u27d6 ";
					} else {
						before = " \u27d6 ";
					}
					break;

				case "tbFullouterjoin":
					if (isSelected) {
						before = "( ";
						after = " ) \u27d7 ";
					} else {
						before = " \u27d7 ";
					}
					break;
			}
			jEditor
				.selection('insert', {text: before, mode: 'before'})
				.selection('insert', {text: after, mode: 'after'});
		},
		
		/**
		 *	Starts the execution of the query as the user pressed the 'Go!' button.
		 */
		startQuery: function() {
			try {
				that.execute();
			} catch (e) {
				handleError(e);
				return false;
			}
		}
	}
	
	/**
	 *	Shows the number of relations currently defined by the user.
	 *	Note, that their IDs might not be a continuous stream of integers.
	 *	@return {Number}
	 */
	this.numberOfRelations = function() {
		return $("#userDefinedRelations .relationBlock").length;
	}
	
	/**
	 *	This method inserts a new relation block into the user interface.
	 *	It is called after the user has pressed the 'add relation' button on the UI*
	 *	The user-defined data is copied from the 'new relation' form and inserted into a template and then the user interface.
	 *	@param {String} _name The name of the new relation
	 *	@param {String} _data The body of the new relation in CSV format.
	 *	@throws {RASNotWellFormedError}
	 *	@throws {RASTooManyValuesError}
	 *	@throws {RASNotEnoughValuesError}
	 *	@throws {RASEmptyBodyError}
	 */
	this.insertRelation = function(_name, _data) {		
		if (typeof _name === 'undefined' || _name.length === 0) {
			throw new RASEmptyBodyError(i18n.relation_name[lang]);
		}
		
		if (typeof _data === 'undefined' || _data.length === 0) {
			throw new RASEmptyBodyError(i18n.attribute[lang]);
		}
		
		var delim = identifyDelimiter(_data);	
		_data = cleanUserInput(_data, delim);
		
		var newid = parseId($("#userDefinedRelations .relationBlock").last().attr("id"))+1;
		var context = {
			id: newid,
			name: _name,
			data: _data,
			delim: delim,
			placeholder: {
				relation: i18n.ph_relation_name[lang],
				data: i18n.ph_data[lang]
			},
			title_delrelbtn: i18n.title_delrelbtn[lang],
			title_saverelbtn: i18n.title_saverelbtn[lang]
		};
		var dom = templates.relation_block(context);
		$("#addRelation").before(dom);
		that.convertRawToTable(newid);
		return newid;
	}

	/**
	 *	This method deletes the relation block with the specified id.
	 *	@param {String} id
	 *	@return {boolean}
	 */
	this.deleteRelation = function(id) {
		idTo$(id).remove();
		return true;
	}
	
	/**
	 *	This method converts the raw (CSV-style) data into a table format using HTML template.
	 *	@param {(Number|String|jQuery)} _id The id of the relation whose raw data has to be formatted into table.
	 *	@return {boolean}
	 */
	this.convertRawToTable = function(_id) {
		var jRel = idTo$(_id);
		var id = parseId(jRel.attr("id"));
		var context = {
			'id': id,
			attributes: [],
			rows: []
		};

		var jRaw = jRel.find("#relation" + id + "_raw");
		var raw = jRaw.val();
		var raws = raw.split("\n");
		var delim = identifyDelimiter(raws);
		raws = cleanUserInput(raws, delim);
		jRaw.val(raws.join('\n'));
		jRaw.attr('data-delim', delim);
		var vals;
		var row;
		var atts = raws[0].split(delim);
		var i, o;
		
		for (i = 0; i < atts.length; ++i) {
			context.attributes.push({ attribute: atts[i].trim() });
		}
		for (i = 1; i < raws.length; ++i) {
			vals = raws[i].split(delim);
			row = [];
			for (o = 0; o < vals.length; ++o) {
				row.push({ value: vals[o].trim() });
			}
			context.rows.push({ values: row });
		}
		var dom = templates.relation_table(context);
		jRel.find(".table").replaceWith($(dom));
		
		return true;
	}
	
	/**
	 *	The 'execute' method performs a preliminary check on the user-input data (i.e. they exist),
	 *	then collects the data and formats them to match the requirements of the model.
	 *	Creates an instance of QueryManager and executes the operation.
	 *	The result data is then loaded into its place and converted into a table view.
	 *	@return {boolean}
	 *	@throws {RASNoRelationsError}
	 *	@throws {RASRelationalAlgebraicExpressionMissingError}
	 *	@throws {RASAlreadyDefinedError}
	 */
	this.execute = function() {
		// preliminary check
		if (that.numberOfRelations() === 0) {
			throw new RASNoRelationsError();
		}
		if ($("#queryCommand").val().length === 0) {
			throw new RASRelationalAlgebraicExpressionMissingError();
		}
		
		// building the parameter for the QueryManager filled with the relations
		var jRels = $("#userDefinedRelations .relationBlock");
		var jItem = jRels.first(".relationBlock");
		var relations = {};
		var id, name, jRaw, raw;
		while (jItem.length === 1) {
			id = parseId(jItem.attr("id"));
			name = jItem.find("#relation" + id + "_name").val();
			if (typeof relations[name] === 'undefined') {
				relations[name] = {};
				relations[name].name = name;
				relations[name].data = jItem.find("#relation" + id + "_raw").val();
				jRaw = jItem.find("#relation" + id + "_raw");
				raw = jRaw.val();
				if (jRaw.attr('data-delim') != ";") {
					raw = raw.replace(new RegExp(jRaw.attr('data-delim'), 'g'), ';');
				}
				relations[name].data = raw;
			} else {
				throw new RASAlreadyDefinedError(name, i18n.relation[lang]);
			}
			jItem = jItem.next(".relationBlock");
		}
		
		// relalg expression
		var cmd = $("#queryCommand").val();
		cmd = replaceUnicode(cmd);
		
		// doing the business
		var qm = new QueryManager(cmd, relations);
		var result = qm.execute();
		
		// handling the result relation
		$("#relation0_raw").val(result.data);
		that.convertRawToTable(0);
		
		// creating the query-tree
		var jCanvas = $("#tv");
		if (jCanvas.length > 0) {
			jCanvas.remove();
		}
		$("#processingjs").append($("<canvas id='tv'></canvas>"));
		var canvas = $("#tv").get(0);
		var processingInstance = (typeof canvas === 'undefined') ? "" : new Processing(canvas, treeViewer);
		
		// done
		return true;
	}
	
	/**
	 *	This method replace the special unicode characters to their grammar counterpart.
		@param {String} cmd
		@return {String}
	 */
	function replaceUnicode(cmd) {
		// http://en.wikipedia.org/wiki/Greek_and_Coptic
		var codes = {
			"PI"	: "\u03c0",
			"SIGMA" : "\u03c3",
			"RO"	: "\u03c1",
			"DELTA"	: "\u03b4",
			"TAU"	: "\u03c4",
			"GAMMA"	: "\u03b3",
			"THETA_JOIN": "\u03b8",
			"+"		: "\u22c3",
			"*"		: "\u22c2",
			"@"		: "\u22c8",
			"$@"	: "\u22c9",
			"@$"	: "\u22ca",
			"!@"	: "\u25b7",
			"&@"	: "\u27d5",
			"@&"	: "\u27d6",
			"@@"	: "\u27d7"			
		};
		var att;
		
		for (att in codes) {
			cmd = cmd.replace(new RegExp(codes[att], 'g'), att);
		}
		
		return cmd;
	}
	
	/**
	 *	The 'handleError' method shows the user the errors that have occured.
	 *	@param {Error} e
	 */
	function handleError(e) {
		var context = {
			type: "",
			errortitle: "",
			intro: "",
			errorwas: "",
			errormsg: ""
		};
		
		if (e instanceof RASUserInputError) {
			context.type = "warning";
			context.intro = i18n.error_user_intro[lang];
		} else if (e instanceof RASInternalError) {
			context.type = "danger";
			context.intro = i18n.error_internal_intro[lang];
		} else {
			context.type = "danger";
			context.intro = i18n.error_system_intro[lang];
		}
		
		context.errortitle = i18n.error_errortitle[lang];
		context.errorwas = i18n.error_errormsg[lang];
		context.errormsg = e.message;
		
		var dom = templates.errormsg(context);
		$("#errorContainer").append('<div id="overlay"></div>');
		$("#errorContainer").append(dom);
	}
	
	/**
	 *	Takes a stream of string as data input and returns with the delimiter that was used.
	 *	@param {String} d The input data that is either comma separated or tab separated.
	 *	@return {String} The delimiter.  
	 */
	function identifyDelimiter(d) {
		var rows;
		if (typeof d === 'string') {
			rows = d.split('\n');
		} else if (typeof d === 'object' && d.constructor === Array) {
			rows = d;
		} else {
			return ";";
		}
		var csv = rows[0].split(';').length;
		var tsv = rows[0].split('\t').length;
		return (csv>=tsv) ? ";" : "\t";
	}
	
	/**
	 *	Cleans the user's data input so minor mistakes don't stop the execution.
	 *	It checks if every attribute is well-formed and the rows contain the expected number of values.
	 *	It corrects typos like <ul>
	 *	<li>a newline after the last line of data - which would normally indicate a new row and that would throw an error as not having any values in it</li>
	 *	<li>a delimiter after the last value of the row - e.g: "Guiness;Ireland;5.0;" <li>but it does not tolerate the same mistake when declaring the attributes in the first row</li>
	 *	</ul>
	 *	@param {String|String[]} d The data as single stream of string or as an array of strings.
	 *	@param {String} delim The delimiter of values in the row.
	 *	@return {String|String[]} The cleaned data.  
	 */
	function cleanUserInput(d, delim) {
		var i, values;
		var rows;
		if (typeof d === 'string') {
			rows = d.split('\n');
		} else if (typeof d === 'object' && d.constructor === Array) {
			rows = d;
		} else {
			throw new RASParameterError(i18n.erroneous_parameter_list[lang]);
		}
		
		// last line ending with \r\n check
		if (rows[rows.length-1].length === 0) {
			rows.splice(rows.length-1,1);
		}
		
		// attributes check
		values = rows[0].split(delim);
		if (values[values.length-1] === '') {
			rows[0] = rows[0].slice(0, -1);
			values = rows[0].split(delim);
		}
		var numOfAtts = values.length;
		for (i = 0; i < values.length; ++i) {
			if (values[i] === '') {
				throw new RASNotWellFormedError(values[i], i18n.attribute[lang]);
			}
		}

		// rows check
		for (i = 1; i < rows.length; ++i) {
			values = rows[i].split(delim);
			if (values.length > numOfAtts) {
				if (values[values.length-1] === '') {
					rows[i] = rows[i].substr(0, rows[i].length-1);
				} else {
					throw new RASTooManyValuesError(i+1);
				}
			} else if (values.length < numOfAtts) {
				throw new RASNotEnoughValuesError(i+1);
			}
		}
		if (typeof d === 'string') {
			return rows.join('\n');
		} else {
			return rows;
		}
	}
}