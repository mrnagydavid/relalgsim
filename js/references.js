/**
	Relational Algebra Simulator
	author: David Nagy (mrnagydavid)
	
	version: 1.0
	
	@license MIT
*/
if (typeof $ !== 'undefined') {
	$("document").ready(function() {
		var jToc = $("#toc");
		$("h1, h2, h3, h4").each(function () {
			var jThis = $(this);
			var id = jThis.attr('id');
			var lvl = jThis.prop('tagName').match(/\d+/)[0];
			var html = jThis.html();
			if (typeof id !== 'undefined' && id !== '') {
				jToc.append('<a href="#' + id + '" class="toc-' + lvl + '">' + html + '</a>');
			}
		});
		
		var uic = new UserInterfaceController();
		uic.setup();

		$('[data-toggle="tooltip"]').tooltip();
	});
}

function UserInterfaceController() {
	var that = this;
	var templates = {};
	
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
	
	function parseId(selector) {
		if (typeof selector === 'undefined') return 0;
		return Number(selector.match(/\d+/)[0]).valueOf();
	}
	
	this.setup = function() {
		// compiling HTML templates
		var att;
		for (att in raw_templates) {
			templates[att] = Handlebars.compile(raw_templates[att]);
		}
	
		// start editing
		$("body").on("dblclick", "div#userDefinedRelations div.relationBlock div.relationData, div#relation0_data" , function(event) {
			// exit editing mode if there was anything being edited
			that.eventHandler.edit_finish();
			// enter editing mode for current element and its counterpart
			that.eventHandler.edit_start(this);
			// stop event from reaching "body"
			event.stopPropagation();
		});
		
		// finish editing
		$("body").on("blur", "div#userDefinedRelations div.relationBlock div.relationData, div#relation0_data" , that.eventHandler.edit_finish);
		
		// any changes to the raw data is noted
		$("body").on("change", "textarea.relationRaw", that.eventHandler.change.relationRaw);
	}
	
	this.eventHandler = {
		edit_start: function(item) {
			$(item).addClass("edit");
			$(item).children("textarea").focus();
		},
		
		edit_finish: function() {
			var jEdit = $("#userDefinedRelations .relationData.edit textarea, #relation0 .relationData.edit textarea");
			if (jEdit.hasClass("changed")) {
				that.convertRawToTable(parseId(jEdit.attr("id")));
				jEdit.removeClass("changed");
			}
			$(".edit").removeClass("edit");
		},
		
		change: {
			relationRaw: function() {
				$(this).addClass("changed");
			},
		}
	}
	
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
}