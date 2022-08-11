/~ --- Helper functions --- ~/
[*
	var _version = "3.3.4";
	var extended = extendedMode;
    var _id = 0;
    var sm = getSymbolManager();
    var parsingResult;
    var errorStack = [];
    var p,i;
	
    function getId() {
        return "_X" + (_id++);
    }
	
	function newCommand(arg) {
		var newRelation = getId();
		var array = [];
		var att;
        
        switch (arg.cmd) {
            case "CROSSPRODUCT":
                sm.addCrossproduct(newRelation, arg.r1.name, arg.r2.name);
                break;
			case "THETA_JOIN":
				sm.checkProperAttributes(arg.param.cols, [arg.r1.name, arg.r2.name]);
                sm.addCrossproduct(newRelation, arg.r1.name, arg.r2.name);
				break;
			case "PROJECTION":
            case "GROUPBY":
                for (att in arg.param) {
                    if (arg.param[att].isCalculated === true || arg.param[att].isRenamed) { // calculated column OR projectional rename happened, e.g.: a+b->c or AVG(a)->average
                        sm.addAttribute(newRelation + "." + arg.param[att].name, arg.r1.name);
						array.push(arg.param[att].name);
                    } else {
						array = array.concat(arg.param[att].cols);
					}
                }
                sm.checkProperAttributes(array, [arg.r1.name]);
                sm.addProjection(newRelation, array, arg.r1.name);
                break;
            case "SELECTION":
            case "SORT":
                sm.checkProperAttributes(arg.param.cols, [arg.r1.name]);
                sm.addAlias(newRelation, arg.r1.name);
                break;
            case "RENAME_ATTRIBUTES":
                sm.checkProperAttributes(arg.param.old, [arg.r1.name]);
                sm.renameAttributes(arg.param["new"], arg.param.old, arg.r1.name);
				sm.addAlias(newRelation, arg.r1.name);
                break;
            case "RENAME_RELATION":
                sm.renameRelation(arg.param, arg.r1.name);
				sm.addAlias(newRelation, arg.param);
                break;
            case "DISTINCT":
                sm.addAlias(newRelation, arg.r1.name);
                break;
            case "COPY":
                sm.addAlias(newRelation, arg.r1);
                break;
			case "UNION":
			case "DIFFERENCE":
			case "INTERSECTION":
				if (sm.matchingAttributes(arg.r1.name, arg.r2.name) !== 2) {
					throw sprintf(i18n.attributes_all_match_text[lang], arg.cmd);
				}
				sm.addAlias(newRelation+"_tmp", arg.r1.name);
				sm.renameRelation(newRelation, newRelation+"_tmp");
				break;
			case "NATURAL_JOIN":
			case "LEFT_OUTER_JOIN":
			case "RIGHT_OUTER_JOIN":
			case "FULL_OUTER_JOIN":
				if (sm.matchingAttributes(arg.r1.name, arg.r2.name) < 1) {
					throw sprintf(i18n.attributes_some_match_text[lang], arg.cmd);
				}
				sm.addJoin(newRelation, arg.r1.name, arg.r2.name);
				break;
			case "ANTI_JOIN":	// @TODO
			case "LEFT_SEMI_JOIN":
				sm.addAlias(newRelation, arg.r1.name);
				break;
			case "RIGHT_SEMI_JOIN":
				sm.addAlias(newRelation, arg.r2.name);
				break;
			case "DIVISION":
				sm.addDivision(newRelation, arg.r1.name, arg.r2.name);
				break;
			
			
        }
		
		var result = {};
        result["name"] = newRelation;
        result["source"] = {};
        var source = result["source"];
        source["cmd"] = arg.cmd;
        if (arg.r2 !== undefined) {
			source["relations"] = [arg.r1, arg.r2];
			arg.r2["parent"] = result;
		} else {
			source["relation"] = arg.r1;
		}
		if (arg.r1 instanceof Object) {
			arg.r1["parent"] = result;
		}
		if (arg.param !== undefined) {
            source["parameter"] = arg.param;
        }
        return result;			
	}    
*]

/~ Characters to be ignored ~/
!   ' |\t'
	;


/~ Alaptokenek - nem-asszociatív ~/
	'PI'							PI
	'SIGMA'							SIGMA
	'RO'							RO
	'THETA'							THETA_JOIN
	'DELTA'							DELTA
	'TAU'							TAU
	'GAMMA'							GAMMA
	'AVG'							AVG
	'COUNT'							COUNT
	'SUM'							SUM
	'MIN'							MIN
	'MAX'							MAX
	'[A-Za-z][A-Za-z0-9_]*'			NAME
	'"[^"]*"'						STRING1
	'\'[^\']*\''					STRING2
	'[0-9]+\.[0-9]+'				REAL
	'[0-9]+'						INTEGER
	';'								SEMICOLON
	','								COMMA
	'\.'							PERIOD
	'\->'							ARROW
	;
	
/~ Relációs muveletek ~/
<	'\+'							PLUS
	'\-'							MINUS
	'\*'							ASTERISK
	'\×'							CROSSPRODUCT
	'÷'								DIVISION
	'@'								NATURAL_JOIN
	'$@'							LEFT_SEMI_JOIN
	'@$'							RIGHT_SEMI_JOIN
	'!@'							ANTI_JOIN
	'&@'							LEFT_OUTER_JOIN
	'@&'							RIGHT_OUTER_JOIN
	'@@'							FULL_OUTER_JOIN
	;

/~ Logikai-matematikai muveletek - bal-asszociatív ~/
<	'&&'							DBL_AMPS
	'\|\|'							DBL_VBAR
	;
<	'<='							LESS_THAN_OR_EQUALS
	'>='							GREATER_THAN_OR_EQUALS
	'=='							EQUALS
	'<'								LESS_THAN
	'>'								GREATER_THAN
	'!='							NOT_EQUALS
	'\/'							SLASH
	'%'								MODULO
	'\^'							POWER
	;
>	'!'								NEGATION
    '\('							PARENTHESIS_OPEN
    '\)'							PARENTHESIS_CLOSE
	;


##


/~ --- Grammar specification --- ~/

query:			
				relation								[* 
															parsingResult = %1;
														*]
				;

relation:		
				relation PLUS relation					&CROSSPRODUCT	[*		
																			%% = newCommand({cmd:"UNION", r1:%1, r2:%3});
																		*]
				| relation CROSSPRODUCT relation		&CROSSPRODUCT	[*		
																			%% = newCommand({cmd:"CROSSPRODUCT", r1:%1, r2:%3});
																		*]
				| relation MINUS relation				&CROSSPRODUCT	[*		
																			%% = newCommand({cmd:"DIFFERENCE", r1:%1, r2:%3});
																		*]
				| relation ASTERISK relation			&CROSSPRODUCT	[*		
																			%% = newCommand({cmd:"INTERSECTION", r1:%1, r2:%3});
																		*]
				| relation DIVISION relation			&CROSSPRODUCT	[*		
																			%% = newCommand({cmd:"DIVISION", r1:%1, r2:%3});
																		*]
				| relation NATURAL_JOIN relation		&CROSSPRODUCT	[*		
																			%% = newCommand({cmd:"NATURAL_JOIN", r1:%1, r2:%3});
																		*]
				| relation LEFT_SEMI_JOIN relation		&CROSSPRODUCT	[*		
																			%% = newCommand({cmd:"LEFT_SEMI_JOIN", r1:%1, r2:%3});
																		*]
				| relation RIGHT_SEMI_JOIN relation		&CROSSPRODUCT	[*		
																			%% = newCommand({cmd:"RIGHT_SEMI_JOIN", r1:%1, r2:%3});
																		*]
				| relation ANTI_JOIN relation			&CROSSPRODUCT	[*		
																			%% = newCommand({cmd:"ANTI_JOIN", r1:%1, r2:%3});
																		*]
				| relation LEFT_OUTER_JOIN relation		&CROSSPRODUCT	[*		
																			%% = newCommand({cmd:"LEFT_OUTER_JOIN", r1:%1, r2:%3});
																		*]
				| relation RIGHT_OUTER_JOIN relation	&CROSSPRODUCT	[*		
																			%% = newCommand({cmd:"RIGHT_OUTER_JOIN", r1:%1, r2:%3});
																		*]
				| relation FULL_OUTER_JOIN relation		&CROSSPRODUCT	[*		
																			%% = newCommand({cmd:"FULL_OUTER_JOIN", r1:%1, r2:%3});
																		*]
				
				
				| PI PARENTHESIS_OPEN extrended_attribute_list SEMICOLON relation PARENTHESIS_CLOSE	[*	
																										for (p in %3) {
																											if (!extended && p.isCalculated) {
																												parseError(sprintf(i18n.extended_error_text[lang], i18n.extended_pi[lang]));
																											}
																											if (p.isGroupOperation) {
																												parseError(i18n.aggregating_in_projection_text[lang]);
																											}
																										}
																										%% = newCommand({cmd:"PROJECTION", r1:%5, param:%3});
																									*]
				| GAMMA PARENTHESIS_OPEN extrended_attribute_list SEMICOLON relation PARENTHESIS_CLOSE 
																									[*		
																										if (!extended) {
																											parseError(sprintf(i18n.extended_error_text[lang], %1));
																										}
																										%% = newCommand({cmd:"GROUPBY", r1:%5, param:%3});
																									*]
				| SIGMA PARENTHESIS_OPEN conditional SEMICOLON relation PARENTHESIS_CLOSE			[*		
																										%% = newCommand({cmd:"SELECTION", r1:%5, param:%3});
																									*]
				| THETA_JOIN PARENTHESIS_OPEN conditional SEMICOLON relation COMMA relation PARENTHESIS_CLOSE		
																									[*		
																										%% = newCommand({cmd:"THETA_JOIN", r1:%5, r2:%7, param:%3});
																									*]
				| RO PARENTHESIS_OPEN rename_list SEMICOLON relation PARENTHESIS_CLOSE				[*		
																										%% = newCommand({cmd:"RENAME_ATTRIBUTES", r1:%5, param:%3});
																									*]
				| TAU PARENTHESIS_OPEN attribute_list SEMICOLON relation PARENTHESIS_CLOSE			[*		
																										if (!extended) {
																											parseError(sprintf(i18n.extended_error_text[lang], %1));
																										}
																										%% = newCommand({cmd:"SORT", r1:%5, param:%3});
																									*]
				| RO PARENTHESIS_OPEN NAME SEMICOLON relation PARENTHESIS_CLOSE						[*		
																										%% = newCommand({cmd:"RENAME_RELATION", r1:%5, param:%3});
																									*]
				| DELTA PARENTHESIS_OPEN relation PARENTHESIS_CLOSE									[*		
																										if (!extended) {
																											parseError(sprintf(i18n.extended_error_text[lang], %1));
																										}
																										%% = newCommand({cmd:"DISTINCT", r1:%3});
																									*]
				| NAME																				[* 
																										%% = newCommand({cmd:"COPY", r1:%1});
																									*]
				| PARENTHESIS_OPEN relation PARENTHESIS_CLOSE										[*
																										%% = %2;
																									*]
				;

string:
				STRING1
				| STRING2
				;

number:
				INTEGER
				| REAL
				| MINUS INTEGER		/~	a "-5"	kezelésére ~/	[* %% = %1 + %2 *]
				| MINUS REAL		/~	a "-5"	kezelésére ~/	[* %% = %1 + %2 *]
				;
				
attribute:
				NAME PERIOD NAME								[* 	
																	%% = {};
																	%%["name"] = %1+%2+%3;
																	%%["esc"]  = "%" + %1+%2+%3 + "%";
																	%%["cols"] = [%1+%2+%3];
																	%%["isAbsolute"] = true;
																*]
				| NAME											[* 	
																	%% = {};
																	%%["name"] = %1;
																	%%["esc"]  = "%" + %1 + "%";
																	%%["cols"] = [%1];
																	%%["isRelative"] = true;
																*]
				;

attribute_list:
				attribute										[*	
																	%% = {};
																	%%[%1.name] = %1;
																*]
				| attribute_list COMMA attribute				[* 
																	%% = %1;
																	%%[%3.name] = %3;
																*]
				;

literal:
				attribute										
				| number										[*	
																	%% = {};
																	%%["name"] = %1;
																	%%["esc"] = %1;
																	%%["cols"] = [];
																*]
				| string										[*	
																	%% = {};
																	%%["name"] = %1;
																	%%["esc"] = %1;
																	%%["cols"] = [];
																*]
				;

literal_calculation:
				literal															
				| PARENTHESIS_OPEN literal_calculation PARENTHESIS_CLOSE		[* 
																					%% = %2;
																					%%["name"] = %1+%2.name+%3;
																					%%["esc"] = %1 + %1.esc + %3;
																					%%["isCalculated"] = true;
																				*]
				| literal_calculation PLUS literal_calculation					[* 
																					%% = {};
																					%%["name"] = %1.name+%2+%3.name;
																					%%["esc"] = %1.esc + %2 + %3.esc;
																					%%["cols"] = %1.cols.concat(%3.cols);
																					%%["isCalculated"] = true;
																				*]
				| literal_calculation MINUS literal_calculation					[* 
																					%% = {};
																					%%["name"] = %1.name+%2+%3.name;
																					%%["esc"] = %1.esc + %2 + %3.esc;
																					%%["cols"] = %1.cols.concat(%3.cols);
																					%%["isCalculated"] = true;
																				*]
				| literal_calculation ASTERISK literal_calculation				[* 
																					%% = {};
																					%%["name"] = %1.name+%2+%3.name;
																					%%["esc"] = %1.esc + %2 + %3.esc;
																					%%["cols"] = %1.cols.concat(%3.cols);
																					%%["isCalculated"] = true;
																				*]
				| literal_calculation SLASH literal_calculation					[* 
																					%% = {};
																					%%["name"] = %1.name+%2+%3.name;
																					%%["esc"] = %1.esc + %2 + %3.esc;
																					%%["cols"] = %1.cols.concat(%3.cols);
																					%%["isCalculated"] = true;
																				*]
				| literal_calculation MODULO literal_calculation					[* 
																					%% = {};
																					%%["name"] = %1.name+%2+%3.name;
																					%%["esc"] = %1.esc + %2 + %3.esc;
																					%%["cols"] = %1.cols.concat(%3.cols);
																					%%["isCalculated"] = true;
																				*]
				| literal_calculation POWER literal_calculation					[* 
																					%% = {};
																					%%["name"] = %1.name+%2+%3.name;
																					%%["esc"] = 'Math.pow(' + %1.esc + ',' + %3.esc + ')';
																					%%["cols"] = %1.cols.concat(%3.cols);
																					%%["isCalculated"] = true;
																				*]
				;

extended_attribute:
				literal_calculation											[*
																				%% = {};
																				%%["name"] = %1.esc.match(/[A-Za-z0-9_]*/g).join('');
																				%%["esc"] = %1.esc;
																				%%["cols"] = %1.cols;
																				if (%1["isCalculated"]) %%["isCalculated"] = true;
																			*]
				| group_operation											[*
																				%% = %1;
																				%%["name"] = %%.name.replace(".", "_");
																				%%["isGroupOperation"] = true;
																			*]
				| extended_attribute ARROW NAME								[* 
																				%% = %1; 
																				%%["originalName"] = %%.name;
																				%%.name = %3;
																				%%["isRenamed"] = true;
																			*]
				;
				
extrended_attribute_list:
				extended_attribute											[* 	
																				%% = {}; 
																				%%[%1.name] = %1;
																			*]
				| extrended_attribute_list COMMA extended_attribute			[* 	
																				%% = %1;
																				%%[%3.name] = %3;
																			*]
				;


group_operation:
				AVG	PARENTHESIS_OPEN literal_calculation PARENTHESIS_CLOSE [*	
																				%% = {};
																				%%["name"] = %1+%2+%3.name+%4;
																				%%["esc"] = %3.esc;
																				%%["cols"] = %3.cols;
																				%%["type"] = %1;
																				%%["isCalculated"] = true;
																			*]
				| COUNT PARENTHESIS_OPEN literal_calculation PARENTHESIS_CLOSE [*	
																				%% = {};
																				%%["name"] = %1+%2+%3.name+%4;
																				%%["esc"] = %3.esc;
																				%%["cols"] = %3.cols;
																				%%["type"] = %1;
																				%%["isCalculated"] = true;
																			*]
				| SUM PARENTHESIS_OPEN literal_calculation PARENTHESIS_CLOSE [*	
																				%% = {};
																				%%["name"] = %1+%2+%3.name+%4;
																				%%["esc"] = %3.esc;
																				%%["cols"] = %3.cols;
																				%%["type"] = %1;
																				%%["isCalculated"] = true;
																			*]
				| MIN PARENTHESIS_OPEN literal_calculation PARENTHESIS_CLOSE [*	
																				%% = {};
																				%%["name"] = %1+%2+%3.name+%4;
																				%%["esc"] = %3.esc;
																				%%["cols"] = %3.cols;
																				%%["type"] = %1;
																				%%["isCalculated"] = true;
																			*]
				| MAX PARENTHESIS_OPEN literal_calculation PARENTHESIS_CLOSE [*	
																				%% = {};
																				%%["name"] = %1+%2+%3.name+%4;
																				%%["esc"] = %3.esc;
																				%%["cols"] = %3.cols;
																				%%["type"] = %1;
																				%%["isCalculated"] = true;
																			*]
				;

rename_list:
				attribute SLASH attribute 									[* 
																				%% = {};
																				%%["old"] = [];
																				%%["new"] = [];
																				%%["old"].push(%1.cols[0]);
																				%%["new"].push(%3.cols[0]);
																				if (%3.isAbsolute) {
																					parseError(sprintf(i18n.extended_error_text[lang], %1.name, %3.name));
																				}
																			*]
				| rename_list COMMA attribute SLASH attribute 				[* 
																				%% = %1;
																				%%["old"].push(%3.cols[0]);
																				%%["new"].push(%5.cols[0]);
																				if (%5.isAbsolute) {
																					parseError(sprintf(i18n.rename_to_absolute_text[lang], %3.name, %5.name));
																				}
																			*]
				;

conditional:
			NEGATION conditional														[* 
																							%% = %2;
																							%%["esc"] = %1 + %1.esc;
																						*]
			| PARENTHESIS_OPEN conditional PARENTHESIS_CLOSE							[* 
																							%% = %2;
																							%%["esc"] = %1 + %1.esc + %3;
																						*]
			| conditional DBL_AMPS conditional											[* 
																							%% = {};
																							%%["esc"] = %1.esc + %2 + %3.esc;
																							%%["cols"] = %1.cols.concat(%3.cols);
																						*]
			| conditional DBL_VBAR conditional											[* 
																							%% = {};
																							%%["esc"] = %1.esc + %2 + %3.esc;
																							%%["cols"] = %1.cols.concat(%3.cols);
																						*]
			| extended_attribute EQUALS extended_attribute								[* 
																							%% = {};
																							%%["esc"] = %1.esc + %2 + %3.esc;
																							%%["cols"] = %1.cols.concat(%3.cols);
																						*]
			| extended_attribute NOT_EQUALS extended_attribute								[* 
																							%% = {};
																							%%["esc"] = %1.esc + %2 + %3.esc;
																							%%["cols"] = %1.cols.concat(%3.cols);
																						*]
			| extended_attribute LESS_THAN extended_attribute							[* 
																							%% = {};
																							%%["esc"] = %1.esc + %2 + %3.esc;
																							%%["cols"] = %1.cols.concat(%3.cols);
																						*]
			| extended_attribute GREATER_THAN extended_attribute						[* 
																							%% = {};
																							%%["esc"] = %1.esc + %2 + %3.esc;
																							%%["cols"] = %1.cols.concat(%3.cols);
																						*]
			| extended_attribute LESS_THAN_OR_EQUALS extended_attribute					[* 
																							%% = {};
																							%%["esc"] = %1.esc + %2 + %3.esc;
																							%%["cols"] = %1.cols.concat(%3.cols);
																						*]
			| extended_attribute GREATER_THAN_OR_EQUALS extended_attribute				[* 
																							%% = {};
																							%%["esc"] = %1.esc + %2 + %3.esc;
																							%%["cols"] = %1.cols.concat(%3.cols);
																						*]
			;
