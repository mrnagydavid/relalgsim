/**
	Relational Algebra Simulator
	author: David Nagy (mrnagydavid)
	
	version: 1.0
	
	@license MIT
*/
var __RELALG_PARSER = true;

/**
 *	The Parser class handles the methods needed to parse the relational algebraic expression
 *	and to create a query-tree that can be processed and executed.
 *	The class is wrapped around the grammar parsing code to seamlessly fit into the model of this project.
 *	Most of the parser code comes from JS/CC, the LALR(1) parser and lexical analyzer generator for JavaScript, written in JavaScript.
 *	JS/CC is open source software released under the BSD license.
 *	The grammar parsing code is generated based on the grammar context written for this project.
 *	@see {@link http://jscc.phorward-software.com/}
 *	@constructor
 */
function Parser(s) {
// beginning of JSCC generated code based on the grammar written by David Nagy
var _version = "3.3.7";        // THETA vs THETA-join
    var extended = extendedMode;
var _id = 0;
var sm = getSymbolManager();
var parsingResult;
var errorStack = [];
var p,i;
    
function getId() {
return "_X" + (_id++);
}
    
    function parseError(errormsg) {
errorStack.push(errormsg);
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
            case "ANTI_JOIN":    // @TODO
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

/*
    Default template driver for JS/CC generated parsers running as
    browser-based JavaScript/ECMAScript applications.
    
    WARNING:     This parser template will not run as console and has lesser
                features for debugging than the console derivates for the
                various JavaScript platforms.
    
    Features:
    - Parser trace messages
    - Integrated panic-mode error recovery
    
    Written 2007, 2008 by Jan Max Meyer, J.M.K S.F. Software Technologies
    
    This is in the public domain.
*/

var _dbg_withtrace        = false;
var _dbg_string            = new String();

function __dbg_print( text )
{
    _dbg_string += text + "\n";
}

function __lex( info )
{
    var state        = 0;
    var match        = -1;
    var match_pos    = 0;
    var start        = 0;
    var pos            = info.offset + 1;

    do
    {
        pos--;
        state = 0;
        match = -2;
        start = pos;

        if( info.src.length <= start )
            return 64;

        do
        {

switch( state )
{
    case 0:
        if( info.src.charCodeAt( pos ) == 9 || info.src.charCodeAt( pos ) == 32 ) state = 1;
        else if( info.src.charCodeAt( pos ) == 33 ) state = 2;
        else if( info.src.charCodeAt( pos ) == 37 ) state = 3;
        else if( info.src.charCodeAt( pos ) == 40 ) state = 4;
        else if( info.src.charCodeAt( pos ) == 41 ) state = 5;
        else if( info.src.charCodeAt( pos ) == 42 ) state = 6;
        else if( info.src.charCodeAt( pos ) == 43 ) state = 7;
        else if( info.src.charCodeAt( pos ) == 44 ) state = 8;
        else if( info.src.charCodeAt( pos ) == 45 ) state = 9;
        else if( info.src.charCodeAt( pos ) == 46 ) state = 10;
        else if( info.src.charCodeAt( pos ) == 47 ) state = 11;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 12;
        else if( info.src.charCodeAt( pos ) == 59 ) state = 13;
        else if( info.src.charCodeAt( pos ) == 60 ) state = 14;
        else if( info.src.charCodeAt( pos ) == 62 ) state = 15;
        else if( info.src.charCodeAt( pos ) == 64 ) state = 16;
        else if( info.src.charCodeAt( pos ) == 65 ) state = 17;
        else if( info.src.charCodeAt( pos ) == 94 ) state = 18;
        else if( info.src.charCodeAt( pos ) == 215 ) state = 19;
        else if( info.src.charCodeAt( pos ) == 247 ) state = 20;
        else if( info.src.charCodeAt( pos ) == 34 ) state = 50;
        else if( info.src.charCodeAt( pos ) == 80 ) state = 51;
        else if( info.src.charCodeAt( pos ) == 36 ) state = 52;
        else if( info.src.charCodeAt( pos ) == 82 ) state = 53;
        else if( info.src.charCodeAt( pos ) == 38 ) state = 54;
        else if( info.src.charCodeAt( pos ) == 39 ) state = 56;
        else if( info.src.charCodeAt( pos ) == 61 ) state = 58;
        else if( info.src.charCodeAt( pos ) == 124 ) state = 60;
        else if( info.src.charCodeAt( pos ) == 66 || ( info.src.charCodeAt( pos ) >= 69 && info.src.charCodeAt( pos ) <= 70 ) || ( info.src.charCodeAt( pos ) >= 72 && info.src.charCodeAt( pos ) <= 76 ) || ( info.src.charCodeAt( pos ) >= 78 && info.src.charCodeAt( pos ) <= 79 ) || info.src.charCodeAt( pos ) == 81 || ( info.src.charCodeAt( pos ) >= 85 && info.src.charCodeAt( pos ) <= 90 ) || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else if( info.src.charCodeAt( pos ) == 67 ) state = 83;
        else if( info.src.charCodeAt( pos ) == 68 ) state = 85;
        else if( info.src.charCodeAt( pos ) == 71 ) state = 86;
        else if( info.src.charCodeAt( pos ) == 77 ) state = 87;
        else if( info.src.charCodeAt( pos ) == 83 ) state = 88;
        else if( info.src.charCodeAt( pos ) == 84 ) state = 89;
        else state = -1;
        break;

    case 1:
        state = -1;
        match = 1;
        match_pos = pos;
        break;

    case 2:
        if( info.src.charCodeAt( pos ) == 61 ) state = 21;
        else if( info.src.charCodeAt( pos ) == 64 ) state = 22;
        else state = -1;
        match = 47;
        match_pos = pos;
        break;

    case 3:
        state = -1;
        match = 45;
        match_pos = pos;
        break;

    case 4:
        state = -1;
        match = 48;
        match_pos = pos;
        break;

    case 5:
        state = -1;
        match = 49;
        match_pos = pos;
        break;

    case 6:
        state = -1;
        match = 26;
        match_pos = pos;
        break;

    case 7:
        state = -1;
        match = 24;
        match_pos = pos;
        break;

    case 8:
        state = -1;
        match = 21;
        match_pos = pos;
        break;

    case 9:
        if( info.src.charCodeAt( pos ) == 62 ) state = 28;
        else state = -1;
        match = 25;
        match_pos = pos;
        break;

    case 10:
        state = -1;
        match = 22;
        match_pos = pos;
        break;

    case 11:
        state = -1;
        match = 44;
        match_pos = pos;
        break;

    case 12:
        if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 12;
        else if( info.src.charCodeAt( pos ) == 46 ) state = 62;
        else state = -1;
        match = 19;
        match_pos = pos;
        break;

    case 13:
        state = -1;
        match = 20;
        match_pos = pos;
        break;

    case 14:
        if( info.src.charCodeAt( pos ) == 61 ) state = 29;
        else state = -1;
        match = 41;
        match_pos = pos;
        break;

    case 15:
        if( info.src.charCodeAt( pos ) == 61 ) state = 31;
        else state = -1;
        match = 42;
        match_pos = pos;
        break;

    case 16:
        if( info.src.charCodeAt( pos ) == 36 ) state = 32;
        else if( info.src.charCodeAt( pos ) == 38 ) state = 33;
        else if( info.src.charCodeAt( pos ) == 64 ) state = 34;
        else state = -1;
        match = 29;
        match_pos = pos;
        break;

    case 17:
        if( info.src.charCodeAt( pos ) == 86 ) state = 55;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 85 ) || ( info.src.charCodeAt( pos ) >= 87 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 18:
        state = -1;
        match = 46;
        match_pos = pos;
        break;

    case 19:
        state = -1;
        match = 27;
        match_pos = pos;
        break;

    case 20:
        state = -1;
        match = 28;
        match_pos = pos;
        break;

    case 21:
        state = -1;
        match = 43;
        match_pos = pos;
        break;

    case 22:
        state = -1;
        match = 32;
        match_pos = pos;
        break;

    case 23:
        state = -1;
        match = 16;
        match_pos = pos;
        break;

    case 24:
        state = -1;
        match = 30;
        match_pos = pos;
        break;

    case 25:
        state = -1;
        match = 36;
        match_pos = pos;
        break;

    case 26:
        state = -1;
        match = 33;
        match_pos = pos;
        break;

    case 27:
        state = -1;
        match = 17;
        match_pos = pos;
        break;

    case 28:
        state = -1;
        match = 23;
        match_pos = pos;
        break;

    case 29:
        state = -1;
        match = 38;
        match_pos = pos;
        break;

    case 30:
        state = -1;
        match = 40;
        match_pos = pos;
        break;

    case 31:
        state = -1;
        match = 39;
        match_pos = pos;
        break;

    case 32:
        state = -1;
        match = 31;
        match_pos = pos;
        break;

    case 33:
        state = -1;
        match = 34;
        match_pos = pos;
        break;

    case 34:
        state = -1;
        match = 35;
        match_pos = pos;
        break;

    case 35:
        if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 2;
        match_pos = pos;
        break;

    case 36:
        if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 4;
        match_pos = pos;
        break;

    case 37:
        state = -1;
        match = 37;
        match_pos = pos;
        break;

    case 38:
        if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 38;
        else state = -1;
        match = 18;
        match_pos = pos;
        break;

    case 39:
        if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 10;
        match_pos = pos;
        break;

    case 40:
        if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 14;
        match_pos = pos;
        break;

    case 41:
        if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 13;
        match_pos = pos;
        break;

    case 42:
        if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 12;
        match_pos = pos;
        break;

    case 43:
        if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 8;
        match_pos = pos;
        break;

    case 44:
        if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 11;
        match_pos = pos;
        break;

    case 45:
        if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 7;
        match_pos = pos;
        break;

    case 46:
        if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 9;
        match_pos = pos;
        break;

    case 47:
        if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 3;
        match_pos = pos;
        break;

    case 48:
        if( info.src.charCodeAt( pos ) == 95 ) state = 76;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 5;
        match_pos = pos;
        break;

    case 49:
        if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 6;
        match_pos = pos;
        break;

    case 50:
        if( info.src.charCodeAt( pos ) == 34 ) state = 23;
        else if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 33 ) || ( info.src.charCodeAt( pos ) >= 35 && info.src.charCodeAt( pos ) <= 254 ) ) state = 50;
        else state = -1;
        break;

    case 51:
        if( info.src.charCodeAt( pos ) == 73 ) state = 35;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 72 ) || ( info.src.charCodeAt( pos ) >= 74 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 52:
        if( info.src.charCodeAt( pos ) == 64 ) state = 24;
        else state = -1;
        break;

    case 53:
        if( info.src.charCodeAt( pos ) == 79 ) state = 36;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 78 ) || ( info.src.charCodeAt( pos ) >= 80 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 54:
        if( info.src.charCodeAt( pos ) == 38 ) state = 25;
        else if( info.src.charCodeAt( pos ) == 64 ) state = 26;
        else state = -1;
        break;

    case 55:
        if( info.src.charCodeAt( pos ) == 71 ) state = 39;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 70 ) || ( info.src.charCodeAt( pos ) >= 72 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 56:
        if( info.src.charCodeAt( pos ) == 39 ) state = 27;
        else if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 38 ) || ( info.src.charCodeAt( pos ) >= 40 && info.src.charCodeAt( pos ) <= 254 ) ) state = 56;
        else state = -1;
        break;

    case 57:
        if( info.src.charCodeAt( pos ) == 85 ) state = 69;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 84 ) || ( info.src.charCodeAt( pos ) >= 86 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 58:
        if( info.src.charCodeAt( pos ) == 61 ) state = 30;
        else state = -1;
        break;

    case 59:
        if( info.src.charCodeAt( pos ) == 76 ) state = 70;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 75 ) || ( info.src.charCodeAt( pos ) >= 77 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 60:
        if( info.src.charCodeAt( pos ) == 124 ) state = 37;
        else state = -1;
        break;

    case 61:
        if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 76 ) || ( info.src.charCodeAt( pos ) >= 78 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else if( info.src.charCodeAt( pos ) == 77 ) state = 81;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 62:
        if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 38;
        else state = -1;
        break;

    case 63:
        if( info.src.charCodeAt( pos ) == 88 ) state = 40;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 87 ) || ( info.src.charCodeAt( pos ) >= 89 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 64:
        if( info.src.charCodeAt( pos ) == 78 ) state = 41;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 77 ) || ( info.src.charCodeAt( pos ) >= 79 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 65:
        if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 70 ) || ( info.src.charCodeAt( pos ) >= 72 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else if( info.src.charCodeAt( pos ) == 71 ) state = 84;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 66:
        if( info.src.charCodeAt( pos ) == 77 ) state = 42;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 76 ) || ( info.src.charCodeAt( pos ) >= 78 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 67:
        if( info.src.charCodeAt( pos ) == 85 ) state = 43;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 84 ) || ( info.src.charCodeAt( pos ) >= 86 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 68:
        if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 68 ) || ( info.src.charCodeAt( pos ) >= 70 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else if( info.src.charCodeAt( pos ) == 69 ) state = 82;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 69:
        if( info.src.charCodeAt( pos ) == 78 ) state = 71;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 77 ) || ( info.src.charCodeAt( pos ) >= 79 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 70:
        if( info.src.charCodeAt( pos ) == 84 ) state = 72;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 83 ) || ( info.src.charCodeAt( pos ) >= 85 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 71:
        if( info.src.charCodeAt( pos ) == 84 ) state = 44;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 83 ) || ( info.src.charCodeAt( pos ) >= 85 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 72:
        if( info.src.charCodeAt( pos ) == 65 ) state = 45;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 66 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 73:
        if( info.src.charCodeAt( pos ) == 65 ) state = 46;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 66 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 74:
        if( info.src.charCodeAt( pos ) == 65 ) state = 47;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 66 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 75:
        if( info.src.charCodeAt( pos ) == 65 ) state = 48;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 66 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 76:
        if( info.src.charCodeAt( pos ) == 74 ) state = 77;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 73 ) || ( info.src.charCodeAt( pos ) >= 75 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 77:
        if( info.src.charCodeAt( pos ) == 79 ) state = 78;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 78 ) || ( info.src.charCodeAt( pos ) >= 80 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 78:
        if( info.src.charCodeAt( pos ) == 73 ) state = 79;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 72 ) || ( info.src.charCodeAt( pos ) >= 74 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 79:
        if( info.src.charCodeAt( pos ) == 78 ) state = 49;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 77 ) || ( info.src.charCodeAt( pos ) >= 79 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 80:
        if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 81:
        if( info.src.charCodeAt( pos ) == 77 ) state = 73;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 76 ) || ( info.src.charCodeAt( pos ) >= 78 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 82:
        if( info.src.charCodeAt( pos ) == 84 ) state = 75;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 83 ) || ( info.src.charCodeAt( pos ) >= 85 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 83:
        if( info.src.charCodeAt( pos ) == 79 ) state = 57;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 78 ) || ( info.src.charCodeAt( pos ) >= 80 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 84:
        if( info.src.charCodeAt( pos ) == 77 ) state = 74;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 76 ) || ( info.src.charCodeAt( pos ) >= 78 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 85:
        if( info.src.charCodeAt( pos ) == 69 ) state = 59;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 68 ) || ( info.src.charCodeAt( pos ) >= 70 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 86:
        if( info.src.charCodeAt( pos ) == 65 ) state = 61;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 66 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 87:
        if( info.src.charCodeAt( pos ) == 65 ) state = 63;
        else if( info.src.charCodeAt( pos ) == 73 ) state = 64;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 66 && info.src.charCodeAt( pos ) <= 72 ) || ( info.src.charCodeAt( pos ) >= 74 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 88:
        if( info.src.charCodeAt( pos ) == 73 ) state = 65;
        else if( info.src.charCodeAt( pos ) == 85 ) state = 66;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 72 ) || ( info.src.charCodeAt( pos ) >= 74 && info.src.charCodeAt( pos ) <= 84 ) || ( info.src.charCodeAt( pos ) >= 86 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

    case 89:
        if( info.src.charCodeAt( pos ) == 65 ) state = 67;
        else if( info.src.charCodeAt( pos ) == 72 ) state = 68;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 66 && info.src.charCodeAt( pos ) <= 71 ) || ( info.src.charCodeAt( pos ) >= 73 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 80;
        else state = -1;
        match = 15;
        match_pos = pos;
        break;

}


            pos++;

        }
        while( state > -1 );

    }
    while( 1 > -1 && match == 1 );

    if( match > -1 )
    {
        info.att = info.src.substr( start, match_pos - start );
        info.offset = match_pos;
        

    }
    else
    {
        info.att = new String();
        match = -1;
    }

    return match;
}


function __parse( src, err_off, err_la )
{
    var        sstack            = new Array();
    var        vstack            = new Array();
    var     err_cnt            = 0;
    var        act;
    var        go;
    var        la;
    var        rval;
    var     parseinfo        = new Function( "", "var offset; var src; var att;" );
    var        info            = new parseinfo();
    
/* Pop-Table */
var pop_tab = new Array(
    new Array( 0/* query' */, 1 ),
    new Array( 51/* query */, 1 ),
    new Array( 50/* relation */, 3 ),
    new Array( 50/* relation */, 3 ),
    new Array( 50/* relation */, 3 ),
    new Array( 50/* relation */, 3 ),
    new Array( 50/* relation */, 3 ),
    new Array( 50/* relation */, 3 ),
    new Array( 50/* relation */, 3 ),
    new Array( 50/* relation */, 3 ),
    new Array( 50/* relation */, 3 ),
    new Array( 50/* relation */, 3 ),
    new Array( 50/* relation */, 3 ),
    new Array( 50/* relation */, 3 ),
    new Array( 50/* relation */, 6 ),
    new Array( 50/* relation */, 6 ),
    new Array( 50/* relation */, 6 ),
    new Array( 50/* relation */, 8 ),
    new Array( 50/* relation */, 6 ),
    new Array( 50/* relation */, 6 ),
    new Array( 50/* relation */, 6 ),
    new Array( 50/* relation */, 4 ),
    new Array( 50/* relation */, 1 ),
    new Array( 50/* relation */, 3 ),
    new Array( 54/* theta_join */, 1 ),
    new Array( 54/* theta_join */, 1 ),
    new Array( 57/* string */, 1 ),
    new Array( 57/* string */, 1 ),
    new Array( 58/* number */, 1 ),
    new Array( 58/* number */, 1 ),
    new Array( 58/* number */, 2 ),
    new Array( 58/* number */, 2 ),
    new Array( 59/* attribute */, 3 ),
    new Array( 59/* attribute */, 1 ),
    new Array( 56/* attribute_list */, 1 ),
    new Array( 56/* attribute_list */, 3 ),
    new Array( 60/* literal */, 1 ),
    new Array( 60/* literal */, 1 ),
    new Array( 60/* literal */, 1 ),
    new Array( 61/* literal_calculation */, 1 ),
    new Array( 61/* literal_calculation */, 3 ),
    new Array( 61/* literal_calculation */, 3 ),
    new Array( 61/* literal_calculation */, 3 ),
    new Array( 61/* literal_calculation */, 3 ),
    new Array( 61/* literal_calculation */, 3 ),
    new Array( 61/* literal_calculation */, 3 ),
    new Array( 61/* literal_calculation */, 3 ),
    new Array( 63/* extended_attribute */, 1 ),
    new Array( 63/* extended_attribute */, 1 ),
    new Array( 63/* extended_attribute */, 3 ),
    new Array( 52/* extrended_attribute_list */, 1 ),
    new Array( 52/* extrended_attribute_list */, 3 ),
    new Array( 62/* group_operation */, 4 ),
    new Array( 62/* group_operation */, 4 ),
    new Array( 62/* group_operation */, 4 ),
    new Array( 62/* group_operation */, 4 ),
    new Array( 62/* group_operation */, 4 ),
    new Array( 55/* rename_list */, 3 ),
    new Array( 55/* rename_list */, 5 ),
    new Array( 53/* conditional */, 2 ),
    new Array( 53/* conditional */, 3 ),
    new Array( 53/* conditional */, 3 ),
    new Array( 53/* conditional */, 3 ),
    new Array( 53/* conditional */, 3 ),
    new Array( 53/* conditional */, 3 ),
    new Array( 53/* conditional */, 3 ),
    new Array( 53/* conditional */, 3 ),
    new Array( 53/* conditional */, 3 ),
    new Array( 53/* conditional */, 3 )
);

/* Action-Table */
var act_tab = new Array(
    /* State 0 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 1 */ new Array( 64/* "$" */,0 ),
    /* State 2 */ new Array( 35/* "FULL_OUTER_JOIN" */,14 , 34/* "RIGHT_OUTER_JOIN" */,15 , 33/* "LEFT_OUTER_JOIN" */,16 , 32/* "ANTI_JOIN" */,17 , 31/* "RIGHT_SEMI_JOIN" */,18 , 30/* "LEFT_SEMI_JOIN" */,19 , 29/* "NATURAL_JOIN" */,20 , 28/* "DIVISION" */,21 , 26/* "ASTERISK" */,22 , 25/* "MINUS" */,23 , 27/* "CROSSPRODUCT" */,24 , 24/* "PLUS" */,25 , 64/* "$" */,-1 ),
    /* State 3 */ new Array( 48/* "PARENTHESIS_OPEN" */,26 ),
    /* State 4 */ new Array( 48/* "PARENTHESIS_OPEN" */,27 ),
    /* State 5 */ new Array( 48/* "PARENTHESIS_OPEN" */,28 ),
    /* State 6 */ new Array( 48/* "PARENTHESIS_OPEN" */,29 ),
    /* State 7 */ new Array( 48/* "PARENTHESIS_OPEN" */,30 ),
    /* State 8 */ new Array( 48/* "PARENTHESIS_OPEN" */,31 ),
    /* State 9 */ new Array( 48/* "PARENTHESIS_OPEN" */,32 ),
    /* State 10 */ new Array( 64/* "$" */,-22 , 24/* "PLUS" */,-22 , 27/* "CROSSPRODUCT" */,-22 , 25/* "MINUS" */,-22 , 26/* "ASTERISK" */,-22 , 28/* "DIVISION" */,-22 , 29/* "NATURAL_JOIN" */,-22 , 30/* "LEFT_SEMI_JOIN" */,-22 , 31/* "RIGHT_SEMI_JOIN" */,-22 , 32/* "ANTI_JOIN" */,-22 , 33/* "LEFT_OUTER_JOIN" */,-22 , 34/* "RIGHT_OUTER_JOIN" */,-22 , 35/* "FULL_OUTER_JOIN" */,-22 , 49/* "PARENTHESIS_CLOSE" */,-22 , 21/* "COMMA" */,-22 ),
    /* State 11 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 12 */ new Array( 48/* "PARENTHESIS_OPEN" */,-24 ),
    /* State 13 */ new Array( 48/* "PARENTHESIS_OPEN" */,-25 ),
    /* State 14 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 15 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 16 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 17 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 18 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 19 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 20 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 21 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 22 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 23 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 24 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 25 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 26 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 10/* "AVG" */,52 , 11/* "COUNT" */,53 , 12/* "SUM" */,54 , 13/* "MIN" */,55 , 14/* "MAX" */,56 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 27 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 10/* "AVG" */,52 , 11/* "COUNT" */,53 , 12/* "SUM" */,54 , 13/* "MIN" */,55 , 14/* "MAX" */,56 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 28 */ new Array( 47/* "NEGATION" */,68 , 48/* "PARENTHESIS_OPEN" */,69 , 10/* "AVG" */,52 , 11/* "COUNT" */,53 , 12/* "SUM" */,54 , 13/* "MIN" */,55 , 14/* "MAX" */,56 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 29 */ new Array( 47/* "NEGATION" */,68 , 48/* "PARENTHESIS_OPEN" */,69 , 10/* "AVG" */,52 , 11/* "COUNT" */,53 , 12/* "SUM" */,54 , 13/* "MIN" */,55 , 14/* "MAX" */,56 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 30 */ new Array( 15/* "NAME" */,73 ),
    /* State 31 */ new Array( 15/* "NAME" */,60 ),
    /* State 32 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 33 */ new Array( 35/* "FULL_OUTER_JOIN" */,14 , 34/* "RIGHT_OUTER_JOIN" */,15 , 33/* "LEFT_OUTER_JOIN" */,16 , 32/* "ANTI_JOIN" */,17 , 31/* "RIGHT_SEMI_JOIN" */,18 , 30/* "LEFT_SEMI_JOIN" */,19 , 29/* "NATURAL_JOIN" */,20 , 28/* "DIVISION" */,21 , 26/* "ASTERISK" */,22 , 25/* "MINUS" */,23 , 27/* "CROSSPRODUCT" */,24 , 24/* "PLUS" */,25 , 49/* "PARENTHESIS_CLOSE" */,78 ),
    /* State 34 */ new Array( 35/* "FULL_OUTER_JOIN" */,-13 , 34/* "RIGHT_OUTER_JOIN" */,-13 , 33/* "LEFT_OUTER_JOIN" */,-13 , 32/* "ANTI_JOIN" */,-13 , 31/* "RIGHT_SEMI_JOIN" */,-13 , 30/* "LEFT_SEMI_JOIN" */,-13 , 29/* "NATURAL_JOIN" */,-13 , 28/* "DIVISION" */,-13 , 26/* "ASTERISK" */,-13 , 25/* "MINUS" */,-13 , 27/* "CROSSPRODUCT" */,-13 , 24/* "PLUS" */,-13 , 64/* "$" */,-13 , 49/* "PARENTHESIS_CLOSE" */,-13 , 21/* "COMMA" */,-13 ),
    /* State 35 */ new Array( 35/* "FULL_OUTER_JOIN" */,-12 , 34/* "RIGHT_OUTER_JOIN" */,-12 , 33/* "LEFT_OUTER_JOIN" */,-12 , 32/* "ANTI_JOIN" */,-12 , 31/* "RIGHT_SEMI_JOIN" */,-12 , 30/* "LEFT_SEMI_JOIN" */,-12 , 29/* "NATURAL_JOIN" */,-12 , 28/* "DIVISION" */,-12 , 26/* "ASTERISK" */,-12 , 25/* "MINUS" */,-12 , 27/* "CROSSPRODUCT" */,-12 , 24/* "PLUS" */,-12 , 64/* "$" */,-12 , 49/* "PARENTHESIS_CLOSE" */,-12 , 21/* "COMMA" */,-12 ),
    /* State 36 */ new Array( 35/* "FULL_OUTER_JOIN" */,-11 , 34/* "RIGHT_OUTER_JOIN" */,-11 , 33/* "LEFT_OUTER_JOIN" */,-11 , 32/* "ANTI_JOIN" */,-11 , 31/* "RIGHT_SEMI_JOIN" */,-11 , 30/* "LEFT_SEMI_JOIN" */,-11 , 29/* "NATURAL_JOIN" */,-11 , 28/* "DIVISION" */,-11 , 26/* "ASTERISK" */,-11 , 25/* "MINUS" */,-11 , 27/* "CROSSPRODUCT" */,-11 , 24/* "PLUS" */,-11 , 64/* "$" */,-11 , 49/* "PARENTHESIS_CLOSE" */,-11 , 21/* "COMMA" */,-11 ),
    /* State 37 */ new Array( 35/* "FULL_OUTER_JOIN" */,-10 , 34/* "RIGHT_OUTER_JOIN" */,-10 , 33/* "LEFT_OUTER_JOIN" */,-10 , 32/* "ANTI_JOIN" */,-10 , 31/* "RIGHT_SEMI_JOIN" */,-10 , 30/* "LEFT_SEMI_JOIN" */,-10 , 29/* "NATURAL_JOIN" */,-10 , 28/* "DIVISION" */,-10 , 26/* "ASTERISK" */,-10 , 25/* "MINUS" */,-10 , 27/* "CROSSPRODUCT" */,-10 , 24/* "PLUS" */,-10 , 64/* "$" */,-10 , 49/* "PARENTHESIS_CLOSE" */,-10 , 21/* "COMMA" */,-10 ),
    /* State 38 */ new Array( 35/* "FULL_OUTER_JOIN" */,-9 , 34/* "RIGHT_OUTER_JOIN" */,-9 , 33/* "LEFT_OUTER_JOIN" */,-9 , 32/* "ANTI_JOIN" */,-9 , 31/* "RIGHT_SEMI_JOIN" */,-9 , 30/* "LEFT_SEMI_JOIN" */,-9 , 29/* "NATURAL_JOIN" */,-9 , 28/* "DIVISION" */,-9 , 26/* "ASTERISK" */,-9 , 25/* "MINUS" */,-9 , 27/* "CROSSPRODUCT" */,-9 , 24/* "PLUS" */,-9 , 64/* "$" */,-9 , 49/* "PARENTHESIS_CLOSE" */,-9 , 21/* "COMMA" */,-9 ),
    /* State 39 */ new Array( 35/* "FULL_OUTER_JOIN" */,-8 , 34/* "RIGHT_OUTER_JOIN" */,-8 , 33/* "LEFT_OUTER_JOIN" */,-8 , 32/* "ANTI_JOIN" */,-8 , 31/* "RIGHT_SEMI_JOIN" */,-8 , 30/* "LEFT_SEMI_JOIN" */,-8 , 29/* "NATURAL_JOIN" */,-8 , 28/* "DIVISION" */,-8 , 26/* "ASTERISK" */,-8 , 25/* "MINUS" */,-8 , 27/* "CROSSPRODUCT" */,-8 , 24/* "PLUS" */,-8 , 64/* "$" */,-8 , 49/* "PARENTHESIS_CLOSE" */,-8 , 21/* "COMMA" */,-8 ),
    /* State 40 */ new Array( 35/* "FULL_OUTER_JOIN" */,-7 , 34/* "RIGHT_OUTER_JOIN" */,-7 , 33/* "LEFT_OUTER_JOIN" */,-7 , 32/* "ANTI_JOIN" */,-7 , 31/* "RIGHT_SEMI_JOIN" */,-7 , 30/* "LEFT_SEMI_JOIN" */,-7 , 29/* "NATURAL_JOIN" */,-7 , 28/* "DIVISION" */,-7 , 26/* "ASTERISK" */,-7 , 25/* "MINUS" */,-7 , 27/* "CROSSPRODUCT" */,-7 , 24/* "PLUS" */,-7 , 64/* "$" */,-7 , 49/* "PARENTHESIS_CLOSE" */,-7 , 21/* "COMMA" */,-7 ),
    /* State 41 */ new Array( 35/* "FULL_OUTER_JOIN" */,-6 , 34/* "RIGHT_OUTER_JOIN" */,-6 , 33/* "LEFT_OUTER_JOIN" */,-6 , 32/* "ANTI_JOIN" */,-6 , 31/* "RIGHT_SEMI_JOIN" */,-6 , 30/* "LEFT_SEMI_JOIN" */,-6 , 29/* "NATURAL_JOIN" */,-6 , 28/* "DIVISION" */,-6 , 26/* "ASTERISK" */,-6 , 25/* "MINUS" */,-6 , 27/* "CROSSPRODUCT" */,-6 , 24/* "PLUS" */,-6 , 64/* "$" */,-6 , 49/* "PARENTHESIS_CLOSE" */,-6 , 21/* "COMMA" */,-6 ),
    /* State 42 */ new Array( 35/* "FULL_OUTER_JOIN" */,-5 , 34/* "RIGHT_OUTER_JOIN" */,-5 , 33/* "LEFT_OUTER_JOIN" */,-5 , 32/* "ANTI_JOIN" */,-5 , 31/* "RIGHT_SEMI_JOIN" */,-5 , 30/* "LEFT_SEMI_JOIN" */,-5 , 29/* "NATURAL_JOIN" */,-5 , 28/* "DIVISION" */,-5 , 26/* "ASTERISK" */,-5 , 25/* "MINUS" */,-5 , 27/* "CROSSPRODUCT" */,-5 , 24/* "PLUS" */,-5 , 64/* "$" */,-5 , 49/* "PARENTHESIS_CLOSE" */,-5 , 21/* "COMMA" */,-5 ),
    /* State 43 */ new Array( 35/* "FULL_OUTER_JOIN" */,-4 , 34/* "RIGHT_OUTER_JOIN" */,-4 , 33/* "LEFT_OUTER_JOIN" */,-4 , 32/* "ANTI_JOIN" */,-4 , 31/* "RIGHT_SEMI_JOIN" */,-4 , 30/* "LEFT_SEMI_JOIN" */,-4 , 29/* "NATURAL_JOIN" */,-4 , 28/* "DIVISION" */,-4 , 26/* "ASTERISK" */,-4 , 25/* "MINUS" */,-4 , 27/* "CROSSPRODUCT" */,-4 , 24/* "PLUS" */,-4 , 64/* "$" */,-4 , 49/* "PARENTHESIS_CLOSE" */,-4 , 21/* "COMMA" */,-4 ),
    /* State 44 */ new Array( 35/* "FULL_OUTER_JOIN" */,-3 , 34/* "RIGHT_OUTER_JOIN" */,-3 , 33/* "LEFT_OUTER_JOIN" */,-3 , 32/* "ANTI_JOIN" */,-3 , 31/* "RIGHT_SEMI_JOIN" */,-3 , 30/* "LEFT_SEMI_JOIN" */,-3 , 29/* "NATURAL_JOIN" */,-3 , 28/* "DIVISION" */,-3 , 26/* "ASTERISK" */,-3 , 25/* "MINUS" */,-3 , 27/* "CROSSPRODUCT" */,-3 , 24/* "PLUS" */,-3 , 64/* "$" */,-3 , 49/* "PARENTHESIS_CLOSE" */,-3 , 21/* "COMMA" */,-3 ),
    /* State 45 */ new Array( 35/* "FULL_OUTER_JOIN" */,-2 , 34/* "RIGHT_OUTER_JOIN" */,-2 , 33/* "LEFT_OUTER_JOIN" */,-2 , 32/* "ANTI_JOIN" */,-2 , 31/* "RIGHT_SEMI_JOIN" */,-2 , 30/* "LEFT_SEMI_JOIN" */,-2 , 29/* "NATURAL_JOIN" */,-2 , 28/* "DIVISION" */,-2 , 26/* "ASTERISK" */,-2 , 25/* "MINUS" */,-2 , 27/* "CROSSPRODUCT" */,-2 , 24/* "PLUS" */,-2 , 64/* "$" */,-2 , 49/* "PARENTHESIS_CLOSE" */,-2 , 21/* "COMMA" */,-2 ),
    /* State 46 */ new Array( 21/* "COMMA" */,79 , 20/* "SEMICOLON" */,80 ),
    /* State 47 */ new Array( 23/* "ARROW" */,81 , 20/* "SEMICOLON" */,-50 , 21/* "COMMA" */,-50 ),
    /* State 48 */ new Array( 46/* "POWER" */,82 , 45/* "MODULO" */,83 , 44/* "SLASH" */,84 , 26/* "ASTERISK" */,85 , 25/* "MINUS" */,86 , 24/* "PLUS" */,87 , 20/* "SEMICOLON" */,-47 , 23/* "ARROW" */,-47 , 21/* "COMMA" */,-47 , 40/* "EQUALS" */,-47 , 43/* "NOT_EQUALS" */,-47 , 41/* "LESS_THAN" */,-47 , 42/* "GREATER_THAN" */,-47 , 38/* "LESS_THAN_OR_EQUALS" */,-47 , 39/* "GREATER_THAN_OR_EQUALS" */,-47 , 36/* "DBL_AMPS" */,-47 , 37/* "DBL_VBAR" */,-47 , 49/* "PARENTHESIS_CLOSE" */,-47 ),
    /* State 49 */ new Array( 20/* "SEMICOLON" */,-48 , 23/* "ARROW" */,-48 , 21/* "COMMA" */,-48 , 40/* "EQUALS" */,-48 , 43/* "NOT_EQUALS" */,-48 , 41/* "LESS_THAN" */,-48 , 42/* "GREATER_THAN" */,-48 , 38/* "LESS_THAN_OR_EQUALS" */,-48 , 39/* "GREATER_THAN_OR_EQUALS" */,-48 , 36/* "DBL_AMPS" */,-48 , 37/* "DBL_VBAR" */,-48 , 49/* "PARENTHESIS_CLOSE" */,-48 ),
    /* State 50 */ new Array( 20/* "SEMICOLON" */,-39 , 24/* "PLUS" */,-39 , 25/* "MINUS" */,-39 , 26/* "ASTERISK" */,-39 , 44/* "SLASH" */,-39 , 45/* "MODULO" */,-39 , 46/* "POWER" */,-39 , 23/* "ARROW" */,-39 , 21/* "COMMA" */,-39 , 40/* "EQUALS" */,-39 , 43/* "NOT_EQUALS" */,-39 , 41/* "LESS_THAN" */,-39 , 42/* "GREATER_THAN" */,-39 , 38/* "LESS_THAN_OR_EQUALS" */,-39 , 39/* "GREATER_THAN_OR_EQUALS" */,-39 , 49/* "PARENTHESIS_CLOSE" */,-39 , 36/* "DBL_AMPS" */,-39 , 37/* "DBL_VBAR" */,-39 ),
    /* State 51 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 52 */ new Array( 48/* "PARENTHESIS_OPEN" */,89 ),
    /* State 53 */ new Array( 48/* "PARENTHESIS_OPEN" */,90 ),
    /* State 54 */ new Array( 48/* "PARENTHESIS_OPEN" */,91 ),
    /* State 55 */ new Array( 48/* "PARENTHESIS_OPEN" */,92 ),
    /* State 56 */ new Array( 48/* "PARENTHESIS_OPEN" */,93 ),
    /* State 57 */ new Array( 20/* "SEMICOLON" */,-36 , 24/* "PLUS" */,-36 , 25/* "MINUS" */,-36 , 26/* "ASTERISK" */,-36 , 44/* "SLASH" */,-36 , 45/* "MODULO" */,-36 , 46/* "POWER" */,-36 , 23/* "ARROW" */,-36 , 21/* "COMMA" */,-36 , 40/* "EQUALS" */,-36 , 43/* "NOT_EQUALS" */,-36 , 41/* "LESS_THAN" */,-36 , 42/* "GREATER_THAN" */,-36 , 38/* "LESS_THAN_OR_EQUALS" */,-36 , 39/* "GREATER_THAN_OR_EQUALS" */,-36 , 49/* "PARENTHESIS_CLOSE" */,-36 , 36/* "DBL_AMPS" */,-36 , 37/* "DBL_VBAR" */,-36 ),
    /* State 58 */ new Array( 20/* "SEMICOLON" */,-37 , 24/* "PLUS" */,-37 , 25/* "MINUS" */,-37 , 26/* "ASTERISK" */,-37 , 44/* "SLASH" */,-37 , 45/* "MODULO" */,-37 , 46/* "POWER" */,-37 , 23/* "ARROW" */,-37 , 21/* "COMMA" */,-37 , 40/* "EQUALS" */,-37 , 43/* "NOT_EQUALS" */,-37 , 41/* "LESS_THAN" */,-37 , 42/* "GREATER_THAN" */,-37 , 38/* "LESS_THAN_OR_EQUALS" */,-37 , 39/* "GREATER_THAN_OR_EQUALS" */,-37 , 49/* "PARENTHESIS_CLOSE" */,-37 , 36/* "DBL_AMPS" */,-37 , 37/* "DBL_VBAR" */,-37 ),
    /* State 59 */ new Array( 20/* "SEMICOLON" */,-38 , 24/* "PLUS" */,-38 , 25/* "MINUS" */,-38 , 26/* "ASTERISK" */,-38 , 44/* "SLASH" */,-38 , 45/* "MODULO" */,-38 , 46/* "POWER" */,-38 , 23/* "ARROW" */,-38 , 21/* "COMMA" */,-38 , 40/* "EQUALS" */,-38 , 43/* "NOT_EQUALS" */,-38 , 41/* "LESS_THAN" */,-38 , 42/* "GREATER_THAN" */,-38 , 38/* "LESS_THAN_OR_EQUALS" */,-38 , 39/* "GREATER_THAN_OR_EQUALS" */,-38 , 49/* "PARENTHESIS_CLOSE" */,-38 , 36/* "DBL_AMPS" */,-38 , 37/* "DBL_VBAR" */,-38 ),
    /* State 60 */ new Array( 22/* "PERIOD" */,94 , 20/* "SEMICOLON" */,-33 , 24/* "PLUS" */,-33 , 25/* "MINUS" */,-33 , 26/* "ASTERISK" */,-33 , 44/* "SLASH" */,-33 , 45/* "MODULO" */,-33 , 46/* "POWER" */,-33 , 23/* "ARROW" */,-33 , 21/* "COMMA" */,-33 , 40/* "EQUALS" */,-33 , 43/* "NOT_EQUALS" */,-33 , 41/* "LESS_THAN" */,-33 , 42/* "GREATER_THAN" */,-33 , 38/* "LESS_THAN_OR_EQUALS" */,-33 , 39/* "GREATER_THAN_OR_EQUALS" */,-33 , 49/* "PARENTHESIS_CLOSE" */,-33 , 36/* "DBL_AMPS" */,-33 , 37/* "DBL_VBAR" */,-33 ),
    /* State 61 */ new Array( 20/* "SEMICOLON" */,-28 , 24/* "PLUS" */,-28 , 25/* "MINUS" */,-28 , 26/* "ASTERISK" */,-28 , 44/* "SLASH" */,-28 , 45/* "MODULO" */,-28 , 46/* "POWER" */,-28 , 23/* "ARROW" */,-28 , 21/* "COMMA" */,-28 , 40/* "EQUALS" */,-28 , 43/* "NOT_EQUALS" */,-28 , 41/* "LESS_THAN" */,-28 , 42/* "GREATER_THAN" */,-28 , 38/* "LESS_THAN_OR_EQUALS" */,-28 , 39/* "GREATER_THAN_OR_EQUALS" */,-28 , 49/* "PARENTHESIS_CLOSE" */,-28 , 36/* "DBL_AMPS" */,-28 , 37/* "DBL_VBAR" */,-28 ),
    /* State 62 */ new Array( 20/* "SEMICOLON" */,-29 , 24/* "PLUS" */,-29 , 25/* "MINUS" */,-29 , 26/* "ASTERISK" */,-29 , 44/* "SLASH" */,-29 , 45/* "MODULO" */,-29 , 46/* "POWER" */,-29 , 23/* "ARROW" */,-29 , 21/* "COMMA" */,-29 , 40/* "EQUALS" */,-29 , 43/* "NOT_EQUALS" */,-29 , 41/* "LESS_THAN" */,-29 , 42/* "GREATER_THAN" */,-29 , 38/* "LESS_THAN_OR_EQUALS" */,-29 , 39/* "GREATER_THAN_OR_EQUALS" */,-29 , 49/* "PARENTHESIS_CLOSE" */,-29 , 36/* "DBL_AMPS" */,-29 , 37/* "DBL_VBAR" */,-29 ),
    /* State 63 */ new Array( 18/* "REAL" */,95 , 19/* "INTEGER" */,96 ),
    /* State 64 */ new Array( 20/* "SEMICOLON" */,-26 , 24/* "PLUS" */,-26 , 25/* "MINUS" */,-26 , 26/* "ASTERISK" */,-26 , 44/* "SLASH" */,-26 , 45/* "MODULO" */,-26 , 46/* "POWER" */,-26 , 23/* "ARROW" */,-26 , 21/* "COMMA" */,-26 , 40/* "EQUALS" */,-26 , 43/* "NOT_EQUALS" */,-26 , 41/* "LESS_THAN" */,-26 , 42/* "GREATER_THAN" */,-26 , 38/* "LESS_THAN_OR_EQUALS" */,-26 , 39/* "GREATER_THAN_OR_EQUALS" */,-26 , 49/* "PARENTHESIS_CLOSE" */,-26 , 36/* "DBL_AMPS" */,-26 , 37/* "DBL_VBAR" */,-26 ),
    /* State 65 */ new Array( 20/* "SEMICOLON" */,-27 , 24/* "PLUS" */,-27 , 25/* "MINUS" */,-27 , 26/* "ASTERISK" */,-27 , 44/* "SLASH" */,-27 , 45/* "MODULO" */,-27 , 46/* "POWER" */,-27 , 23/* "ARROW" */,-27 , 21/* "COMMA" */,-27 , 40/* "EQUALS" */,-27 , 43/* "NOT_EQUALS" */,-27 , 41/* "LESS_THAN" */,-27 , 42/* "GREATER_THAN" */,-27 , 38/* "LESS_THAN_OR_EQUALS" */,-27 , 39/* "GREATER_THAN_OR_EQUALS" */,-27 , 49/* "PARENTHESIS_CLOSE" */,-27 , 36/* "DBL_AMPS" */,-27 , 37/* "DBL_VBAR" */,-27 ),
    /* State 66 */ new Array( 21/* "COMMA" */,79 , 20/* "SEMICOLON" */,97 ),
    /* State 67 */ new Array( 37/* "DBL_VBAR" */,98 , 36/* "DBL_AMPS" */,99 , 20/* "SEMICOLON" */,100 ),
    /* State 68 */ new Array( 47/* "NEGATION" */,68 , 48/* "PARENTHESIS_OPEN" */,69 , 10/* "AVG" */,52 , 11/* "COUNT" */,53 , 12/* "SUM" */,54 , 13/* "MIN" */,55 , 14/* "MAX" */,56 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 69 */ new Array( 47/* "NEGATION" */,68 , 48/* "PARENTHESIS_OPEN" */,69 , 10/* "AVG" */,52 , 11/* "COUNT" */,53 , 12/* "SUM" */,54 , 13/* "MIN" */,55 , 14/* "MAX" */,56 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 70 */ new Array( 23/* "ARROW" */,81 , 39/* "GREATER_THAN_OR_EQUALS" */,104 , 38/* "LESS_THAN_OR_EQUALS" */,105 , 42/* "GREATER_THAN" */,106 , 41/* "LESS_THAN" */,107 , 43/* "NOT_EQUALS" */,108 , 40/* "EQUALS" */,109 ),
    /* State 71 */ new Array( 37/* "DBL_VBAR" */,98 , 36/* "DBL_AMPS" */,99 , 20/* "SEMICOLON" */,110 ),
    /* State 72 */ new Array( 21/* "COMMA" */,111 , 20/* "SEMICOLON" */,112 ),
    /* State 73 */ new Array( 22/* "PERIOD" */,94 , 20/* "SEMICOLON" */,113 , 44/* "SLASH" */,-33 ),
    /* State 74 */ new Array( 44/* "SLASH" */,114 ),
    /* State 75 */ new Array( 21/* "COMMA" */,115 , 20/* "SEMICOLON" */,116 ),
    /* State 76 */ new Array( 20/* "SEMICOLON" */,-34 , 21/* "COMMA" */,-34 ),
    /* State 77 */ new Array( 35/* "FULL_OUTER_JOIN" */,14 , 34/* "RIGHT_OUTER_JOIN" */,15 , 33/* "LEFT_OUTER_JOIN" */,16 , 32/* "ANTI_JOIN" */,17 , 31/* "RIGHT_SEMI_JOIN" */,18 , 30/* "LEFT_SEMI_JOIN" */,19 , 29/* "NATURAL_JOIN" */,20 , 28/* "DIVISION" */,21 , 26/* "ASTERISK" */,22 , 25/* "MINUS" */,23 , 27/* "CROSSPRODUCT" */,24 , 24/* "PLUS" */,25 , 49/* "PARENTHESIS_CLOSE" */,117 ),
    /* State 78 */ new Array( 64/* "$" */,-23 , 24/* "PLUS" */,-23 , 27/* "CROSSPRODUCT" */,-23 , 25/* "MINUS" */,-23 , 26/* "ASTERISK" */,-23 , 28/* "DIVISION" */,-23 , 29/* "NATURAL_JOIN" */,-23 , 30/* "LEFT_SEMI_JOIN" */,-23 , 31/* "RIGHT_SEMI_JOIN" */,-23 , 32/* "ANTI_JOIN" */,-23 , 33/* "LEFT_OUTER_JOIN" */,-23 , 34/* "RIGHT_OUTER_JOIN" */,-23 , 35/* "FULL_OUTER_JOIN" */,-23 , 49/* "PARENTHESIS_CLOSE" */,-23 , 21/* "COMMA" */,-23 ),
    /* State 79 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 10/* "AVG" */,52 , 11/* "COUNT" */,53 , 12/* "SUM" */,54 , 13/* "MIN" */,55 , 14/* "MAX" */,56 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 80 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 81 */ new Array( 15/* "NAME" */,120 ),
    /* State 82 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 83 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 84 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 85 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 86 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 87 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 88 */ new Array( 46/* "POWER" */,82 , 45/* "MODULO" */,83 , 44/* "SLASH" */,84 , 26/* "ASTERISK" */,85 , 25/* "MINUS" */,86 , 24/* "PLUS" */,87 , 49/* "PARENTHESIS_CLOSE" */,127 ),
    /* State 89 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 90 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 91 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 92 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 93 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 94 */ new Array( 15/* "NAME" */,133 ),
    /* State 95 */ new Array( 20/* "SEMICOLON" */,-31 , 24/* "PLUS" */,-31 , 25/* "MINUS" */,-31 , 26/* "ASTERISK" */,-31 , 44/* "SLASH" */,-31 , 45/* "MODULO" */,-31 , 46/* "POWER" */,-31 , 23/* "ARROW" */,-31 , 21/* "COMMA" */,-31 , 40/* "EQUALS" */,-31 , 43/* "NOT_EQUALS" */,-31 , 41/* "LESS_THAN" */,-31 , 42/* "GREATER_THAN" */,-31 , 38/* "LESS_THAN_OR_EQUALS" */,-31 , 39/* "GREATER_THAN_OR_EQUALS" */,-31 , 49/* "PARENTHESIS_CLOSE" */,-31 , 36/* "DBL_AMPS" */,-31 , 37/* "DBL_VBAR" */,-31 ),
    /* State 96 */ new Array( 20/* "SEMICOLON" */,-30 , 24/* "PLUS" */,-30 , 25/* "MINUS" */,-30 , 26/* "ASTERISK" */,-30 , 44/* "SLASH" */,-30 , 45/* "MODULO" */,-30 , 46/* "POWER" */,-30 , 23/* "ARROW" */,-30 , 21/* "COMMA" */,-30 , 40/* "EQUALS" */,-30 , 43/* "NOT_EQUALS" */,-30 , 41/* "LESS_THAN" */,-30 , 42/* "GREATER_THAN" */,-30 , 38/* "LESS_THAN_OR_EQUALS" */,-30 , 39/* "GREATER_THAN_OR_EQUALS" */,-30 , 49/* "PARENTHESIS_CLOSE" */,-30 , 36/* "DBL_AMPS" */,-30 , 37/* "DBL_VBAR" */,-30 ),
    /* State 97 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 98 */ new Array( 47/* "NEGATION" */,68 , 48/* "PARENTHESIS_OPEN" */,69 , 10/* "AVG" */,52 , 11/* "COUNT" */,53 , 12/* "SUM" */,54 , 13/* "MIN" */,55 , 14/* "MAX" */,56 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 99 */ new Array( 47/* "NEGATION" */,68 , 48/* "PARENTHESIS_OPEN" */,69 , 10/* "AVG" */,52 , 11/* "COUNT" */,53 , 12/* "SUM" */,54 , 13/* "MIN" */,55 , 14/* "MAX" */,56 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 100 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 101 */ new Array( 37/* "DBL_VBAR" */,-59 , 36/* "DBL_AMPS" */,-59 , 20/* "SEMICOLON" */,-59 , 49/* "PARENTHESIS_CLOSE" */,-59 ),
    /* State 102 */ new Array( 46/* "POWER" */,82 , 45/* "MODULO" */,83 , 44/* "SLASH" */,84 , 26/* "ASTERISK" */,85 , 25/* "MINUS" */,86 , 24/* "PLUS" */,87 , 49/* "PARENTHESIS_CLOSE" */,127 , 40/* "EQUALS" */,-47 , 43/* "NOT_EQUALS" */,-47 , 41/* "LESS_THAN" */,-47 , 42/* "GREATER_THAN" */,-47 , 38/* "LESS_THAN_OR_EQUALS" */,-47 , 39/* "GREATER_THAN_OR_EQUALS" */,-47 , 23/* "ARROW" */,-47 ),
    /* State 103 */ new Array( 37/* "DBL_VBAR" */,98 , 36/* "DBL_AMPS" */,99 , 49/* "PARENTHESIS_CLOSE" */,138 ),
    /* State 104 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 10/* "AVG" */,52 , 11/* "COUNT" */,53 , 12/* "SUM" */,54 , 13/* "MIN" */,55 , 14/* "MAX" */,56 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 105 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 10/* "AVG" */,52 , 11/* "COUNT" */,53 , 12/* "SUM" */,54 , 13/* "MIN" */,55 , 14/* "MAX" */,56 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 106 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 10/* "AVG" */,52 , 11/* "COUNT" */,53 , 12/* "SUM" */,54 , 13/* "MIN" */,55 , 14/* "MAX" */,56 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 107 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 10/* "AVG" */,52 , 11/* "COUNT" */,53 , 12/* "SUM" */,54 , 13/* "MIN" */,55 , 14/* "MAX" */,56 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 108 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 10/* "AVG" */,52 , 11/* "COUNT" */,53 , 12/* "SUM" */,54 , 13/* "MIN" */,55 , 14/* "MAX" */,56 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 109 */ new Array( 48/* "PARENTHESIS_OPEN" */,51 , 10/* "AVG" */,52 , 11/* "COUNT" */,53 , 12/* "SUM" */,54 , 13/* "MIN" */,55 , 14/* "MAX" */,56 , 15/* "NAME" */,60 , 19/* "INTEGER" */,61 , 18/* "REAL" */,62 , 25/* "MINUS" */,63 , 16/* "STRING1" */,64 , 17/* "STRING2" */,65 ),
    /* State 110 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 111 */ new Array( 15/* "NAME" */,60 ),
    /* State 112 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 113 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 114 */ new Array( 15/* "NAME" */,60 ),
    /* State 115 */ new Array( 15/* "NAME" */,60 ),
    /* State 116 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 117 */ new Array( 64/* "$" */,-21 , 24/* "PLUS" */,-21 , 27/* "CROSSPRODUCT" */,-21 , 25/* "MINUS" */,-21 , 26/* "ASTERISK" */,-21 , 28/* "DIVISION" */,-21 , 29/* "NATURAL_JOIN" */,-21 , 30/* "LEFT_SEMI_JOIN" */,-21 , 31/* "RIGHT_SEMI_JOIN" */,-21 , 32/* "ANTI_JOIN" */,-21 , 33/* "LEFT_OUTER_JOIN" */,-21 , 34/* "RIGHT_OUTER_JOIN" */,-21 , 35/* "FULL_OUTER_JOIN" */,-21 , 49/* "PARENTHESIS_CLOSE" */,-21 , 21/* "COMMA" */,-21 ),
    /* State 118 */ new Array( 23/* "ARROW" */,81 , 20/* "SEMICOLON" */,-51 , 21/* "COMMA" */,-51 ),
    /* State 119 */ new Array( 35/* "FULL_OUTER_JOIN" */,14 , 34/* "RIGHT_OUTER_JOIN" */,15 , 33/* "LEFT_OUTER_JOIN" */,16 , 32/* "ANTI_JOIN" */,17 , 31/* "RIGHT_SEMI_JOIN" */,18 , 30/* "LEFT_SEMI_JOIN" */,19 , 29/* "NATURAL_JOIN" */,20 , 28/* "DIVISION" */,21 , 26/* "ASTERISK" */,22 , 25/* "MINUS" */,23 , 27/* "CROSSPRODUCT" */,24 , 24/* "PLUS" */,25 , 49/* "PARENTHESIS_CLOSE" */,152 ),
    /* State 120 */ new Array( 20/* "SEMICOLON" */,-49 , 23/* "ARROW" */,-49 , 21/* "COMMA" */,-49 , 40/* "EQUALS" */,-49 , 43/* "NOT_EQUALS" */,-49 , 41/* "LESS_THAN" */,-49 , 42/* "GREATER_THAN" */,-49 , 38/* "LESS_THAN_OR_EQUALS" */,-49 , 39/* "GREATER_THAN_OR_EQUALS" */,-49 , 36/* "DBL_AMPS" */,-49 , 37/* "DBL_VBAR" */,-49 , 49/* "PARENTHESIS_CLOSE" */,-49 ),
    /* State 121 */ new Array( 46/* "POWER" */,-46 , 45/* "MODULO" */,-46 , 44/* "SLASH" */,-46 , 26/* "ASTERISK" */,-46 , 25/* "MINUS" */,-46 , 24/* "PLUS" */,-46 , 20/* "SEMICOLON" */,-46 , 23/* "ARROW" */,-46 , 21/* "COMMA" */,-46 , 40/* "EQUALS" */,-46 , 43/* "NOT_EQUALS" */,-46 , 41/* "LESS_THAN" */,-46 , 42/* "GREATER_THAN" */,-46 , 38/* "LESS_THAN_OR_EQUALS" */,-46 , 39/* "GREATER_THAN_OR_EQUALS" */,-46 , 49/* "PARENTHESIS_CLOSE" */,-46 , 36/* "DBL_AMPS" */,-46 , 37/* "DBL_VBAR" */,-46 ),
    /* State 122 */ new Array( 46/* "POWER" */,-45 , 45/* "MODULO" */,-45 , 44/* "SLASH" */,-45 , 26/* "ASTERISK" */,-45 , 25/* "MINUS" */,-45 , 24/* "PLUS" */,-45 , 20/* "SEMICOLON" */,-45 , 23/* "ARROW" */,-45 , 21/* "COMMA" */,-45 , 40/* "EQUALS" */,-45 , 43/* "NOT_EQUALS" */,-45 , 41/* "LESS_THAN" */,-45 , 42/* "GREATER_THAN" */,-45 , 38/* "LESS_THAN_OR_EQUALS" */,-45 , 39/* "GREATER_THAN_OR_EQUALS" */,-45 , 49/* "PARENTHESIS_CLOSE" */,-45 , 36/* "DBL_AMPS" */,-45 , 37/* "DBL_VBAR" */,-45 ),
    /* State 123 */ new Array( 46/* "POWER" */,-44 , 45/* "MODULO" */,-44 , 44/* "SLASH" */,-44 , 26/* "ASTERISK" */,-44 , 25/* "MINUS" */,-44 , 24/* "PLUS" */,-44 , 20/* "SEMICOLON" */,-44 , 23/* "ARROW" */,-44 , 21/* "COMMA" */,-44 , 40/* "EQUALS" */,-44 , 43/* "NOT_EQUALS" */,-44 , 41/* "LESS_THAN" */,-44 , 42/* "GREATER_THAN" */,-44 , 38/* "LESS_THAN_OR_EQUALS" */,-44 , 39/* "GREATER_THAN_OR_EQUALS" */,-44 , 49/* "PARENTHESIS_CLOSE" */,-44 , 36/* "DBL_AMPS" */,-44 , 37/* "DBL_VBAR" */,-44 ),
    /* State 124 */ new Array( 46/* "POWER" */,82 , 45/* "MODULO" */,83 , 44/* "SLASH" */,84 , 26/* "ASTERISK" */,-43 , 25/* "MINUS" */,-43 , 24/* "PLUS" */,-43 , 20/* "SEMICOLON" */,-43 , 23/* "ARROW" */,-43 , 21/* "COMMA" */,-43 , 40/* "EQUALS" */,-43 , 43/* "NOT_EQUALS" */,-43 , 41/* "LESS_THAN" */,-43 , 42/* "GREATER_THAN" */,-43 , 38/* "LESS_THAN_OR_EQUALS" */,-43 , 39/* "GREATER_THAN_OR_EQUALS" */,-43 , 49/* "PARENTHESIS_CLOSE" */,-43 , 36/* "DBL_AMPS" */,-43 , 37/* "DBL_VBAR" */,-43 ),
    /* State 125 */ new Array( 46/* "POWER" */,82 , 45/* "MODULO" */,83 , 44/* "SLASH" */,84 , 26/* "ASTERISK" */,-42 , 25/* "MINUS" */,-42 , 24/* "PLUS" */,-42 , 20/* "SEMICOLON" */,-42 , 23/* "ARROW" */,-42 , 21/* "COMMA" */,-42 , 40/* "EQUALS" */,-42 , 43/* "NOT_EQUALS" */,-42 , 41/* "LESS_THAN" */,-42 , 42/* "GREATER_THAN" */,-42 , 38/* "LESS_THAN_OR_EQUALS" */,-42 , 39/* "GREATER_THAN_OR_EQUALS" */,-42 , 49/* "PARENTHESIS_CLOSE" */,-42 , 36/* "DBL_AMPS" */,-42 , 37/* "DBL_VBAR" */,-42 ),
    /* State 126 */ new Array( 46/* "POWER" */,82 , 45/* "MODULO" */,83 , 44/* "SLASH" */,84 , 26/* "ASTERISK" */,-41 , 25/* "MINUS" */,-41 , 24/* "PLUS" */,-41 , 20/* "SEMICOLON" */,-41 , 23/* "ARROW" */,-41 , 21/* "COMMA" */,-41 , 40/* "EQUALS" */,-41 , 43/* "NOT_EQUALS" */,-41 , 41/* "LESS_THAN" */,-41 , 42/* "GREATER_THAN" */,-41 , 38/* "LESS_THAN_OR_EQUALS" */,-41 , 39/* "GREATER_THAN_OR_EQUALS" */,-41 , 49/* "PARENTHESIS_CLOSE" */,-41 , 36/* "DBL_AMPS" */,-41 , 37/* "DBL_VBAR" */,-41 ),
    /* State 127 */ new Array( 20/* "SEMICOLON" */,-40 , 24/* "PLUS" */,-40 , 25/* "MINUS" */,-40 , 26/* "ASTERISK" */,-40 , 44/* "SLASH" */,-40 , 45/* "MODULO" */,-40 , 46/* "POWER" */,-40 , 23/* "ARROW" */,-40 , 21/* "COMMA" */,-40 , 49/* "PARENTHESIS_CLOSE" */,-40 , 40/* "EQUALS" */,-40 , 43/* "NOT_EQUALS" */,-40 , 41/* "LESS_THAN" */,-40 , 42/* "GREATER_THAN" */,-40 , 38/* "LESS_THAN_OR_EQUALS" */,-40 , 39/* "GREATER_THAN_OR_EQUALS" */,-40 , 36/* "DBL_AMPS" */,-40 , 37/* "DBL_VBAR" */,-40 ),
    /* State 128 */ new Array( 46/* "POWER" */,82 , 45/* "MODULO" */,83 , 44/* "SLASH" */,84 , 26/* "ASTERISK" */,85 , 25/* "MINUS" */,86 , 24/* "PLUS" */,87 , 49/* "PARENTHESIS_CLOSE" */,153 ),
    /* State 129 */ new Array( 46/* "POWER" */,82 , 45/* "MODULO" */,83 , 44/* "SLASH" */,84 , 26/* "ASTERISK" */,85 , 25/* "MINUS" */,86 , 24/* "PLUS" */,87 , 49/* "PARENTHESIS_CLOSE" */,154 ),
    /* State 130 */ new Array( 46/* "POWER" */,82 , 45/* "MODULO" */,83 , 44/* "SLASH" */,84 , 26/* "ASTERISK" */,85 , 25/* "MINUS" */,86 , 24/* "PLUS" */,87 , 49/* "PARENTHESIS_CLOSE" */,155 ),
    /* State 131 */ new Array( 46/* "POWER" */,82 , 45/* "MODULO" */,83 , 44/* "SLASH" */,84 , 26/* "ASTERISK" */,85 , 25/* "MINUS" */,86 , 24/* "PLUS" */,87 , 49/* "PARENTHESIS_CLOSE" */,156 ),
    /* State 132 */ new Array( 46/* "POWER" */,82 , 45/* "MODULO" */,83 , 44/* "SLASH" */,84 , 26/* "ASTERISK" */,85 , 25/* "MINUS" */,86 , 24/* "PLUS" */,87 , 49/* "PARENTHESIS_CLOSE" */,157 ),
    /* State 133 */ new Array( 20/* "SEMICOLON" */,-32 , 24/* "PLUS" */,-32 , 25/* "MINUS" */,-32 , 26/* "ASTERISK" */,-32 , 44/* "SLASH" */,-32 , 45/* "MODULO" */,-32 , 46/* "POWER" */,-32 , 23/* "ARROW" */,-32 , 21/* "COMMA" */,-32 , 40/* "EQUALS" */,-32 , 43/* "NOT_EQUALS" */,-32 , 41/* "LESS_THAN" */,-32 , 42/* "GREATER_THAN" */,-32 , 38/* "LESS_THAN_OR_EQUALS" */,-32 , 39/* "GREATER_THAN_OR_EQUALS" */,-32 , 49/* "PARENTHESIS_CLOSE" */,-32 , 36/* "DBL_AMPS" */,-32 , 37/* "DBL_VBAR" */,-32 ),
    /* State 134 */ new Array( 35/* "FULL_OUTER_JOIN" */,14 , 34/* "RIGHT_OUTER_JOIN" */,15 , 33/* "LEFT_OUTER_JOIN" */,16 , 32/* "ANTI_JOIN" */,17 , 31/* "RIGHT_SEMI_JOIN" */,18 , 30/* "LEFT_SEMI_JOIN" */,19 , 29/* "NATURAL_JOIN" */,20 , 28/* "DIVISION" */,21 , 26/* "ASTERISK" */,22 , 25/* "MINUS" */,23 , 27/* "CROSSPRODUCT" */,24 , 24/* "PLUS" */,25 , 49/* "PARENTHESIS_CLOSE" */,158 ),
    /* State 135 */ new Array( 37/* "DBL_VBAR" */,-62 , 36/* "DBL_AMPS" */,-62 , 20/* "SEMICOLON" */,-62 , 49/* "PARENTHESIS_CLOSE" */,-62 ),
    /* State 136 */ new Array( 37/* "DBL_VBAR" */,-61 , 36/* "DBL_AMPS" */,-61 , 20/* "SEMICOLON" */,-61 , 49/* "PARENTHESIS_CLOSE" */,-61 ),
    /* State 137 */ new Array( 35/* "FULL_OUTER_JOIN" */,14 , 34/* "RIGHT_OUTER_JOIN" */,15 , 33/* "LEFT_OUTER_JOIN" */,16 , 32/* "ANTI_JOIN" */,17 , 31/* "RIGHT_SEMI_JOIN" */,18 , 30/* "LEFT_SEMI_JOIN" */,19 , 29/* "NATURAL_JOIN" */,20 , 28/* "DIVISION" */,21 , 26/* "ASTERISK" */,22 , 25/* "MINUS" */,23 , 27/* "CROSSPRODUCT" */,24 , 24/* "PLUS" */,25 , 49/* "PARENTHESIS_CLOSE" */,159 ),
    /* State 138 */ new Array( 20/* "SEMICOLON" */,-60 , 36/* "DBL_AMPS" */,-60 , 37/* "DBL_VBAR" */,-60 , 49/* "PARENTHESIS_CLOSE" */,-60 ),
    /* State 139 */ new Array( 23/* "ARROW" */,81 , 20/* "SEMICOLON" */,-68 , 36/* "DBL_AMPS" */,-68 , 37/* "DBL_VBAR" */,-68 , 49/* "PARENTHESIS_CLOSE" */,-68 ),
    /* State 140 */ new Array( 23/* "ARROW" */,81 , 20/* "SEMICOLON" */,-67 , 36/* "DBL_AMPS" */,-67 , 37/* "DBL_VBAR" */,-67 , 49/* "PARENTHESIS_CLOSE" */,-67 ),
    /* State 141 */ new Array( 23/* "ARROW" */,81 , 20/* "SEMICOLON" */,-66 , 36/* "DBL_AMPS" */,-66 , 37/* "DBL_VBAR" */,-66 , 49/* "PARENTHESIS_CLOSE" */,-66 ),
    /* State 142 */ new Array( 23/* "ARROW" */,81 , 20/* "SEMICOLON" */,-65 , 36/* "DBL_AMPS" */,-65 , 37/* "DBL_VBAR" */,-65 , 49/* "PARENTHESIS_CLOSE" */,-65 ),
    /* State 143 */ new Array( 23/* "ARROW" */,81 , 20/* "SEMICOLON" */,-64 , 36/* "DBL_AMPS" */,-64 , 37/* "DBL_VBAR" */,-64 , 49/* "PARENTHESIS_CLOSE" */,-64 ),
    /* State 144 */ new Array( 23/* "ARROW" */,81 , 20/* "SEMICOLON" */,-63 , 36/* "DBL_AMPS" */,-63 , 37/* "DBL_VBAR" */,-63 , 49/* "PARENTHESIS_CLOSE" */,-63 ),
    /* State 145 */ new Array( 35/* "FULL_OUTER_JOIN" */,14 , 34/* "RIGHT_OUTER_JOIN" */,15 , 33/* "LEFT_OUTER_JOIN" */,16 , 32/* "ANTI_JOIN" */,17 , 31/* "RIGHT_SEMI_JOIN" */,18 , 30/* "LEFT_SEMI_JOIN" */,19 , 29/* "NATURAL_JOIN" */,20 , 28/* "DIVISION" */,21 , 26/* "ASTERISK" */,22 , 25/* "MINUS" */,23 , 27/* "CROSSPRODUCT" */,24 , 24/* "PLUS" */,25 , 21/* "COMMA" */,160 ),
    /* State 146 */ new Array( 44/* "SLASH" */,161 ),
    /* State 147 */ new Array( 35/* "FULL_OUTER_JOIN" */,14 , 34/* "RIGHT_OUTER_JOIN" */,15 , 33/* "LEFT_OUTER_JOIN" */,16 , 32/* "ANTI_JOIN" */,17 , 31/* "RIGHT_SEMI_JOIN" */,18 , 30/* "LEFT_SEMI_JOIN" */,19 , 29/* "NATURAL_JOIN" */,20 , 28/* "DIVISION" */,21 , 26/* "ASTERISK" */,22 , 25/* "MINUS" */,23 , 27/* "CROSSPRODUCT" */,24 , 24/* "PLUS" */,25 , 49/* "PARENTHESIS_CLOSE" */,162 ),
    /* State 148 */ new Array( 35/* "FULL_OUTER_JOIN" */,14 , 34/* "RIGHT_OUTER_JOIN" */,15 , 33/* "LEFT_OUTER_JOIN" */,16 , 32/* "ANTI_JOIN" */,17 , 31/* "RIGHT_SEMI_JOIN" */,18 , 30/* "LEFT_SEMI_JOIN" */,19 , 29/* "NATURAL_JOIN" */,20 , 28/* "DIVISION" */,21 , 26/* "ASTERISK" */,22 , 25/* "MINUS" */,23 , 27/* "CROSSPRODUCT" */,24 , 24/* "PLUS" */,25 , 49/* "PARENTHESIS_CLOSE" */,163 ),
    /* State 149 */ new Array( 20/* "SEMICOLON" */,-57 , 21/* "COMMA" */,-57 ),
    /* State 150 */ new Array( 20/* "SEMICOLON" */,-35 , 21/* "COMMA" */,-35 ),
    /* State 151 */ new Array( 35/* "FULL_OUTER_JOIN" */,14 , 34/* "RIGHT_OUTER_JOIN" */,15 , 33/* "LEFT_OUTER_JOIN" */,16 , 32/* "ANTI_JOIN" */,17 , 31/* "RIGHT_SEMI_JOIN" */,18 , 30/* "LEFT_SEMI_JOIN" */,19 , 29/* "NATURAL_JOIN" */,20 , 28/* "DIVISION" */,21 , 26/* "ASTERISK" */,22 , 25/* "MINUS" */,23 , 27/* "CROSSPRODUCT" */,24 , 24/* "PLUS" */,25 , 49/* "PARENTHESIS_CLOSE" */,164 ),
    /* State 152 */ new Array( 64/* "$" */,-14 , 24/* "PLUS" */,-14 , 27/* "CROSSPRODUCT" */,-14 , 25/* "MINUS" */,-14 , 26/* "ASTERISK" */,-14 , 28/* "DIVISION" */,-14 , 29/* "NATURAL_JOIN" */,-14 , 30/* "LEFT_SEMI_JOIN" */,-14 , 31/* "RIGHT_SEMI_JOIN" */,-14 , 32/* "ANTI_JOIN" */,-14 , 33/* "LEFT_OUTER_JOIN" */,-14 , 34/* "RIGHT_OUTER_JOIN" */,-14 , 35/* "FULL_OUTER_JOIN" */,-14 , 49/* "PARENTHESIS_CLOSE" */,-14 , 21/* "COMMA" */,-14 ),
    /* State 153 */ new Array( 20/* "SEMICOLON" */,-52 , 23/* "ARROW" */,-52 , 21/* "COMMA" */,-52 , 40/* "EQUALS" */,-52 , 43/* "NOT_EQUALS" */,-52 , 41/* "LESS_THAN" */,-52 , 42/* "GREATER_THAN" */,-52 , 38/* "LESS_THAN_OR_EQUALS" */,-52 , 39/* "GREATER_THAN_OR_EQUALS" */,-52 , 36/* "DBL_AMPS" */,-52 , 37/* "DBL_VBAR" */,-52 , 49/* "PARENTHESIS_CLOSE" */,-52 ),
    /* State 154 */ new Array( 20/* "SEMICOLON" */,-53 , 23/* "ARROW" */,-53 , 21/* "COMMA" */,-53 , 40/* "EQUALS" */,-53 , 43/* "NOT_EQUALS" */,-53 , 41/* "LESS_THAN" */,-53 , 42/* "GREATER_THAN" */,-53 , 38/* "LESS_THAN_OR_EQUALS" */,-53 , 39/* "GREATER_THAN_OR_EQUALS" */,-53 , 36/* "DBL_AMPS" */,-53 , 37/* "DBL_VBAR" */,-53 , 49/* "PARENTHESIS_CLOSE" */,-53 ),
    /* State 155 */ new Array( 20/* "SEMICOLON" */,-54 , 23/* "ARROW" */,-54 , 21/* "COMMA" */,-54 , 40/* "EQUALS" */,-54 , 43/* "NOT_EQUALS" */,-54 , 41/* "LESS_THAN" */,-54 , 42/* "GREATER_THAN" */,-54 , 38/* "LESS_THAN_OR_EQUALS" */,-54 , 39/* "GREATER_THAN_OR_EQUALS" */,-54 , 36/* "DBL_AMPS" */,-54 , 37/* "DBL_VBAR" */,-54 , 49/* "PARENTHESIS_CLOSE" */,-54 ),
    /* State 156 */ new Array( 20/* "SEMICOLON" */,-55 , 23/* "ARROW" */,-55 , 21/* "COMMA" */,-55 , 40/* "EQUALS" */,-55 , 43/* "NOT_EQUALS" */,-55 , 41/* "LESS_THAN" */,-55 , 42/* "GREATER_THAN" */,-55 , 38/* "LESS_THAN_OR_EQUALS" */,-55 , 39/* "GREATER_THAN_OR_EQUALS" */,-55 , 36/* "DBL_AMPS" */,-55 , 37/* "DBL_VBAR" */,-55 , 49/* "PARENTHESIS_CLOSE" */,-55 ),
    /* State 157 */ new Array( 20/* "SEMICOLON" */,-56 , 23/* "ARROW" */,-56 , 21/* "COMMA" */,-56 , 40/* "EQUALS" */,-56 , 43/* "NOT_EQUALS" */,-56 , 41/* "LESS_THAN" */,-56 , 42/* "GREATER_THAN" */,-56 , 38/* "LESS_THAN_OR_EQUALS" */,-56 , 39/* "GREATER_THAN_OR_EQUALS" */,-56 , 36/* "DBL_AMPS" */,-56 , 37/* "DBL_VBAR" */,-56 , 49/* "PARENTHESIS_CLOSE" */,-56 ),
    /* State 158 */ new Array( 64/* "$" */,-15 , 24/* "PLUS" */,-15 , 27/* "CROSSPRODUCT" */,-15 , 25/* "MINUS" */,-15 , 26/* "ASTERISK" */,-15 , 28/* "DIVISION" */,-15 , 29/* "NATURAL_JOIN" */,-15 , 30/* "LEFT_SEMI_JOIN" */,-15 , 31/* "RIGHT_SEMI_JOIN" */,-15 , 32/* "ANTI_JOIN" */,-15 , 33/* "LEFT_OUTER_JOIN" */,-15 , 34/* "RIGHT_OUTER_JOIN" */,-15 , 35/* "FULL_OUTER_JOIN" */,-15 , 49/* "PARENTHESIS_CLOSE" */,-15 , 21/* "COMMA" */,-15 ),
    /* State 159 */ new Array( 64/* "$" */,-16 , 24/* "PLUS" */,-16 , 27/* "CROSSPRODUCT" */,-16 , 25/* "MINUS" */,-16 , 26/* "ASTERISK" */,-16 , 28/* "DIVISION" */,-16 , 29/* "NATURAL_JOIN" */,-16 , 30/* "LEFT_SEMI_JOIN" */,-16 , 31/* "RIGHT_SEMI_JOIN" */,-16 , 32/* "ANTI_JOIN" */,-16 , 33/* "LEFT_OUTER_JOIN" */,-16 , 34/* "RIGHT_OUTER_JOIN" */,-16 , 35/* "FULL_OUTER_JOIN" */,-16 , 49/* "PARENTHESIS_CLOSE" */,-16 , 21/* "COMMA" */,-16 ),
    /* State 160 */ new Array( 2/* "PI" */,3 , 9/* "GAMMA" */,4 , 3/* "SIGMA" */,5 , 4/* "RO" */,7 , 8/* "TAU" */,8 , 7/* "DELTA" */,9 , 15/* "NAME" */,10 , 48/* "PARENTHESIS_OPEN" */,11 , 5/* "THETA1" */,12 , 6/* "THETA2" */,13 ),
    /* State 161 */ new Array( 15/* "NAME" */,60 ),
    /* State 162 */ new Array( 64/* "$" */,-18 , 24/* "PLUS" */,-18 , 27/* "CROSSPRODUCT" */,-18 , 25/* "MINUS" */,-18 , 26/* "ASTERISK" */,-18 , 28/* "DIVISION" */,-18 , 29/* "NATURAL_JOIN" */,-18 , 30/* "LEFT_SEMI_JOIN" */,-18 , 31/* "RIGHT_SEMI_JOIN" */,-18 , 32/* "ANTI_JOIN" */,-18 , 33/* "LEFT_OUTER_JOIN" */,-18 , 34/* "RIGHT_OUTER_JOIN" */,-18 , 35/* "FULL_OUTER_JOIN" */,-18 , 49/* "PARENTHESIS_CLOSE" */,-18 , 21/* "COMMA" */,-18 ),
    /* State 163 */ new Array( 64/* "$" */,-20 , 24/* "PLUS" */,-20 , 27/* "CROSSPRODUCT" */,-20 , 25/* "MINUS" */,-20 , 26/* "ASTERISK" */,-20 , 28/* "DIVISION" */,-20 , 29/* "NATURAL_JOIN" */,-20 , 30/* "LEFT_SEMI_JOIN" */,-20 , 31/* "RIGHT_SEMI_JOIN" */,-20 , 32/* "ANTI_JOIN" */,-20 , 33/* "LEFT_OUTER_JOIN" */,-20 , 34/* "RIGHT_OUTER_JOIN" */,-20 , 35/* "FULL_OUTER_JOIN" */,-20 , 49/* "PARENTHESIS_CLOSE" */,-20 , 21/* "COMMA" */,-20 ),
    /* State 164 */ new Array( 64/* "$" */,-19 , 24/* "PLUS" */,-19 , 27/* "CROSSPRODUCT" */,-19 , 25/* "MINUS" */,-19 , 26/* "ASTERISK" */,-19 , 28/* "DIVISION" */,-19 , 29/* "NATURAL_JOIN" */,-19 , 30/* "LEFT_SEMI_JOIN" */,-19 , 31/* "RIGHT_SEMI_JOIN" */,-19 , 32/* "ANTI_JOIN" */,-19 , 33/* "LEFT_OUTER_JOIN" */,-19 , 34/* "RIGHT_OUTER_JOIN" */,-19 , 35/* "FULL_OUTER_JOIN" */,-19 , 49/* "PARENTHESIS_CLOSE" */,-19 , 21/* "COMMA" */,-19 ),
    /* State 165 */ new Array( 35/* "FULL_OUTER_JOIN" */,14 , 34/* "RIGHT_OUTER_JOIN" */,15 , 33/* "LEFT_OUTER_JOIN" */,16 , 32/* "ANTI_JOIN" */,17 , 31/* "RIGHT_SEMI_JOIN" */,18 , 30/* "LEFT_SEMI_JOIN" */,19 , 29/* "NATURAL_JOIN" */,20 , 28/* "DIVISION" */,21 , 26/* "ASTERISK" */,22 , 25/* "MINUS" */,23 , 27/* "CROSSPRODUCT" */,24 , 24/* "PLUS" */,25 , 49/* "PARENTHESIS_CLOSE" */,167 ),
    /* State 166 */ new Array( 20/* "SEMICOLON" */,-58 , 21/* "COMMA" */,-58 ),
    /* State 167 */ new Array( 64/* "$" */,-17 , 24/* "PLUS" */,-17 , 27/* "CROSSPRODUCT" */,-17 , 25/* "MINUS" */,-17 , 26/* "ASTERISK" */,-17 , 28/* "DIVISION" */,-17 , 29/* "NATURAL_JOIN" */,-17 , 30/* "LEFT_SEMI_JOIN" */,-17 , 31/* "RIGHT_SEMI_JOIN" */,-17 , 32/* "ANTI_JOIN" */,-17 , 33/* "LEFT_OUTER_JOIN" */,-17 , 34/* "RIGHT_OUTER_JOIN" */,-17 , 35/* "FULL_OUTER_JOIN" */,-17 , 49/* "PARENTHESIS_CLOSE" */,-17 , 21/* "COMMA" */,-17 )
);

/* Goto-Table */
var goto_tab = new Array(
    /* State 0 */ new Array( 51/* query */,1 , 50/* relation */,2 , 54/* theta_join */,6 ),
    /* State 1 */ new Array( ),
    /* State 2 */ new Array( ),
    /* State 3 */ new Array( ),
    /* State 4 */ new Array( ),
    /* State 5 */ new Array( ),
    /* State 6 */ new Array( ),
    /* State 7 */ new Array( ),
    /* State 8 */ new Array( ),
    /* State 9 */ new Array( ),
    /* State 10 */ new Array( ),
    /* State 11 */ new Array( 50/* relation */,33 , 54/* theta_join */,6 ),
    /* State 12 */ new Array( ),
    /* State 13 */ new Array( ),
    /* State 14 */ new Array( 50/* relation */,34 , 54/* theta_join */,6 ),
    /* State 15 */ new Array( 50/* relation */,35 , 54/* theta_join */,6 ),
    /* State 16 */ new Array( 50/* relation */,36 , 54/* theta_join */,6 ),
    /* State 17 */ new Array( 50/* relation */,37 , 54/* theta_join */,6 ),
    /* State 18 */ new Array( 50/* relation */,38 , 54/* theta_join */,6 ),
    /* State 19 */ new Array( 50/* relation */,39 , 54/* theta_join */,6 ),
    /* State 20 */ new Array( 50/* relation */,40 , 54/* theta_join */,6 ),
    /* State 21 */ new Array( 50/* relation */,41 , 54/* theta_join */,6 ),
    /* State 22 */ new Array( 50/* relation */,42 , 54/* theta_join */,6 ),
    /* State 23 */ new Array( 50/* relation */,43 , 54/* theta_join */,6 ),
    /* State 24 */ new Array( 50/* relation */,44 , 54/* theta_join */,6 ),
    /* State 25 */ new Array( 50/* relation */,45 , 54/* theta_join */,6 ),
    /* State 26 */ new Array( 52/* extrended_attribute_list */,46 , 63/* extended_attribute */,47 , 61/* literal_calculation */,48 , 62/* group_operation */,49 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 27 */ new Array( 52/* extrended_attribute_list */,66 , 63/* extended_attribute */,47 , 61/* literal_calculation */,48 , 62/* group_operation */,49 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 28 */ new Array( 53/* conditional */,67 , 63/* extended_attribute */,70 , 61/* literal_calculation */,48 , 62/* group_operation */,49 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 29 */ new Array( 53/* conditional */,71 , 63/* extended_attribute */,70 , 61/* literal_calculation */,48 , 62/* group_operation */,49 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 30 */ new Array( 55/* rename_list */,72 , 59/* attribute */,74 ),
    /* State 31 */ new Array( 56/* attribute_list */,75 , 59/* attribute */,76 ),
    /* State 32 */ new Array( 50/* relation */,77 , 54/* theta_join */,6 ),
    /* State 33 */ new Array( ),
    /* State 34 */ new Array( ),
    /* State 35 */ new Array( ),
    /* State 36 */ new Array( ),
    /* State 37 */ new Array( ),
    /* State 38 */ new Array( ),
    /* State 39 */ new Array( ),
    /* State 40 */ new Array( ),
    /* State 41 */ new Array( ),
    /* State 42 */ new Array( ),
    /* State 43 */ new Array( ),
    /* State 44 */ new Array( ),
    /* State 45 */ new Array( ),
    /* State 46 */ new Array( ),
    /* State 47 */ new Array( ),
    /* State 48 */ new Array( ),
    /* State 49 */ new Array( ),
    /* State 50 */ new Array( ),
    /* State 51 */ new Array( 61/* literal_calculation */,88 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 52 */ new Array( ),
    /* State 53 */ new Array( ),
    /* State 54 */ new Array( ),
    /* State 55 */ new Array( ),
    /* State 56 */ new Array( ),
    /* State 57 */ new Array( ),
    /* State 58 */ new Array( ),
    /* State 59 */ new Array( ),
    /* State 60 */ new Array( ),
    /* State 61 */ new Array( ),
    /* State 62 */ new Array( ),
    /* State 63 */ new Array( ),
    /* State 64 */ new Array( ),
    /* State 65 */ new Array( ),
    /* State 66 */ new Array( ),
    /* State 67 */ new Array( ),
    /* State 68 */ new Array( 53/* conditional */,101 , 63/* extended_attribute */,70 , 61/* literal_calculation */,48 , 62/* group_operation */,49 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 69 */ new Array( 61/* literal_calculation */,102 , 53/* conditional */,103 , 63/* extended_attribute */,70 , 60/* literal */,50 , 62/* group_operation */,49 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 70 */ new Array( ),
    /* State 71 */ new Array( ),
    /* State 72 */ new Array( ),
    /* State 73 */ new Array( ),
    /* State 74 */ new Array( ),
    /* State 75 */ new Array( ),
    /* State 76 */ new Array( ),
    /* State 77 */ new Array( ),
    /* State 78 */ new Array( ),
    /* State 79 */ new Array( 63/* extended_attribute */,118 , 61/* literal_calculation */,48 , 62/* group_operation */,49 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 80 */ new Array( 50/* relation */,119 , 54/* theta_join */,6 ),
    /* State 81 */ new Array( ),
    /* State 82 */ new Array( 61/* literal_calculation */,121 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 83 */ new Array( 61/* literal_calculation */,122 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 84 */ new Array( 61/* literal_calculation */,123 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 85 */ new Array( 61/* literal_calculation */,124 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 86 */ new Array( 61/* literal_calculation */,125 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 87 */ new Array( 61/* literal_calculation */,126 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 88 */ new Array( ),
    /* State 89 */ new Array( 61/* literal_calculation */,128 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 90 */ new Array( 61/* literal_calculation */,129 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 91 */ new Array( 61/* literal_calculation */,130 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 92 */ new Array( 61/* literal_calculation */,131 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 93 */ new Array( 61/* literal_calculation */,132 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 94 */ new Array( ),
    /* State 95 */ new Array( ),
    /* State 96 */ new Array( ),
    /* State 97 */ new Array( 50/* relation */,134 , 54/* theta_join */,6 ),
    /* State 98 */ new Array( 53/* conditional */,135 , 63/* extended_attribute */,70 , 61/* literal_calculation */,48 , 62/* group_operation */,49 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 99 */ new Array( 53/* conditional */,136 , 63/* extended_attribute */,70 , 61/* literal_calculation */,48 , 62/* group_operation */,49 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 100 */ new Array( 50/* relation */,137 , 54/* theta_join */,6 ),
    /* State 101 */ new Array( ),
    /* State 102 */ new Array( ),
    /* State 103 */ new Array( ),
    /* State 104 */ new Array( 63/* extended_attribute */,139 , 61/* literal_calculation */,48 , 62/* group_operation */,49 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 105 */ new Array( 63/* extended_attribute */,140 , 61/* literal_calculation */,48 , 62/* group_operation */,49 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 106 */ new Array( 63/* extended_attribute */,141 , 61/* literal_calculation */,48 , 62/* group_operation */,49 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 107 */ new Array( 63/* extended_attribute */,142 , 61/* literal_calculation */,48 , 62/* group_operation */,49 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 108 */ new Array( 63/* extended_attribute */,143 , 61/* literal_calculation */,48 , 62/* group_operation */,49 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 109 */ new Array( 63/* extended_attribute */,144 , 61/* literal_calculation */,48 , 62/* group_operation */,49 , 60/* literal */,50 , 59/* attribute */,57 , 58/* number */,58 , 57/* string */,59 ),
    /* State 110 */ new Array( 50/* relation */,145 , 54/* theta_join */,6 ),
    /* State 111 */ new Array( 59/* attribute */,146 ),
    /* State 112 */ new Array( 50/* relation */,147 , 54/* theta_join */,6 ),
    /* State 113 */ new Array( 50/* relation */,148 , 54/* theta_join */,6 ),
    /* State 114 */ new Array( 59/* attribute */,149 ),
    /* State 115 */ new Array( 59/* attribute */,150 ),
    /* State 116 */ new Array( 50/* relation */,151 , 54/* theta_join */,6 ),
    /* State 117 */ new Array( ),
    /* State 118 */ new Array( ),
    /* State 119 */ new Array( ),
    /* State 120 */ new Array( ),
    /* State 121 */ new Array( ),
    /* State 122 */ new Array( ),
    /* State 123 */ new Array( ),
    /* State 124 */ new Array( ),
    /* State 125 */ new Array( ),
    /* State 126 */ new Array( ),
    /* State 127 */ new Array( ),
    /* State 128 */ new Array( ),
    /* State 129 */ new Array( ),
    /* State 130 */ new Array( ),
    /* State 131 */ new Array( ),
    /* State 132 */ new Array( ),
    /* State 133 */ new Array( ),
    /* State 134 */ new Array( ),
    /* State 135 */ new Array( ),
    /* State 136 */ new Array( ),
    /* State 137 */ new Array( ),
    /* State 138 */ new Array( ),
    /* State 139 */ new Array( ),
    /* State 140 */ new Array( ),
    /* State 141 */ new Array( ),
    /* State 142 */ new Array( ),
    /* State 143 */ new Array( ),
    /* State 144 */ new Array( ),
    /* State 145 */ new Array( ),
    /* State 146 */ new Array( ),
    /* State 147 */ new Array( ),
    /* State 148 */ new Array( ),
    /* State 149 */ new Array( ),
    /* State 150 */ new Array( ),
    /* State 151 */ new Array( ),
    /* State 152 */ new Array( ),
    /* State 153 */ new Array( ),
    /* State 154 */ new Array( ),
    /* State 155 */ new Array( ),
    /* State 156 */ new Array( ),
    /* State 157 */ new Array( ),
    /* State 158 */ new Array( ),
    /* State 159 */ new Array( ),
    /* State 160 */ new Array( 50/* relation */,165 , 54/* theta_join */,6 ),
    /* State 161 */ new Array( 59/* attribute */,166 ),
    /* State 162 */ new Array( ),
    /* State 163 */ new Array( ),
    /* State 164 */ new Array( ),
    /* State 165 */ new Array( ),
    /* State 166 */ new Array( ),
    /* State 167 */ new Array( )
);



/* Symbol labels */
var labels = new Array(
    "query'" /* Non-terminal symbol */,
    "WHITESPACE" /* Terminal symbol */,
    "PI" /* Terminal symbol */,
    "SIGMA" /* Terminal symbol */,
    "RO" /* Terminal symbol */,
    "THETA1" /* Terminal symbol */,
    "THETA2" /* Terminal symbol */,
    "DELTA" /* Terminal symbol */,
    "TAU" /* Terminal symbol */,
    "GAMMA" /* Terminal symbol */,
    "AVG" /* Terminal symbol */,
    "COUNT" /* Terminal symbol */,
    "SUM" /* Terminal symbol */,
    "MIN" /* Terminal symbol */,
    "MAX" /* Terminal symbol */,
    "NAME" /* Terminal symbol */,
    "STRING1" /* Terminal symbol */,
    "STRING2" /* Terminal symbol */,
    "REAL" /* Terminal symbol */,
    "INTEGER" /* Terminal symbol */,
    "SEMICOLON" /* Terminal symbol */,
    "COMMA" /* Terminal symbol */,
    "PERIOD" /* Terminal symbol */,
    "ARROW" /* Terminal symbol */,
    "PLUS" /* Terminal symbol */,
    "MINUS" /* Terminal symbol */,
    "ASTERISK" /* Terminal symbol */,
    "CROSSPRODUCT" /* Terminal symbol */,
    "DIVISION" /* Terminal symbol */,
    "NATURAL_JOIN" /* Terminal symbol */,
    "LEFT_SEMI_JOIN" /* Terminal symbol */,
    "RIGHT_SEMI_JOIN" /* Terminal symbol */,
    "ANTI_JOIN" /* Terminal symbol */,
    "LEFT_OUTER_JOIN" /* Terminal symbol */,
    "RIGHT_OUTER_JOIN" /* Terminal symbol */,
    "FULL_OUTER_JOIN" /* Terminal symbol */,
    "DBL_AMPS" /* Terminal symbol */,
    "DBL_VBAR" /* Terminal symbol */,
    "LESS_THAN_OR_EQUALS" /* Terminal symbol */,
    "GREATER_THAN_OR_EQUALS" /* Terminal symbol */,
    "EQUALS" /* Terminal symbol */,
    "LESS_THAN" /* Terminal symbol */,
    "GREATER_THAN" /* Terminal symbol */,
    "NOT_EQUALS" /* Terminal symbol */,
    "SLASH" /* Terminal symbol */,
    "MODULO" /* Terminal symbol */,
    "POWER" /* Terminal symbol */,
    "NEGATION" /* Terminal symbol */,
    "PARENTHESIS_OPEN" /* Terminal symbol */,
    "PARENTHESIS_CLOSE" /* Terminal symbol */,
    "relation" /* Non-terminal symbol */,
    "query" /* Non-terminal symbol */,
    "extrended_attribute_list" /* Non-terminal symbol */,
    "conditional" /* Non-terminal symbol */,
    "theta_join" /* Non-terminal symbol */,
    "rename_list" /* Non-terminal symbol */,
    "attribute_list" /* Non-terminal symbol */,
    "string" /* Non-terminal symbol */,
    "number" /* Non-terminal symbol */,
    "attribute" /* Non-terminal symbol */,
    "literal" /* Non-terminal symbol */,
    "literal_calculation" /* Non-terminal symbol */,
    "group_operation" /* Non-terminal symbol */,
    "extended_attribute" /* Non-terminal symbol */,
    "$" /* Terminal symbol */
);


    
    info.offset = 0;
    info.src = src;
    info.att = new String();
    
    if( !err_off )
        err_off    = new Array();
    if( !err_la )
    err_la = new Array();
    
    sstack.push( 0 );
    vstack.push( 0 );
    
    la = __lex( info );

    while( true )
    {
        act = 169;
        for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
        {
            if( act_tab[sstack[sstack.length-1]][i] == la )
            {
                act = act_tab[sstack[sstack.length-1]][i+1];
                break;
            }
        }

        if( _dbg_withtrace && sstack.length > 0 )
        {
            __dbg_print( "\nState " + sstack[sstack.length-1] + "\n" +
                            "\tLookahead: " + labels[la] + " (\"" + info.att + "\")\n" +
                            "\tAction: " + act + "\n" +
                            "\tSource: \"" + info.src.substr( info.offset, 30 ) + ( ( info.offset + 30 < info.src.length ) ?
                                    "..." : "" ) + "\"\n" +
                            "\tStack: " + sstack.join() + "\n" +
                            "\tValue stack: " + vstack.join() + "\n" );
        }
        
            
        //Panic-mode: Try recovery when parse-error occurs!
        if( act == 169 )
        {
            if( _dbg_withtrace )
                __dbg_print( "Error detected: There is no reduce or shift on the symbol " + labels[la] );
            
            err_cnt++;
            err_off.push( info.offset - info.att.length );            
            err_la.push( new Array() );
            for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
                err_la[err_la.length-1].push( labels[act_tab[sstack[sstack.length-1]][i]] );
            
            //Remember the original stack!
            var rsstack = new Array();
            var rvstack = new Array();
            for( var i = 0; i < sstack.length; i++ )
            {
                rsstack[i] = sstack[i];
                rvstack[i] = vstack[i];
            }
            
            while( act == 169 && la != 64 )
            {
                if( _dbg_withtrace )
                    __dbg_print( "\tError recovery\n" +
                                    "Current lookahead: " + labels[la] + " (" + info.att + ")\n" +
                                    "Action: " + act + "\n\n" );
                if( la == -1 )
                    info.offset++;
                    
                while( act == 169 && sstack.length > 0 )
                {
                    sstack.pop();
                    vstack.pop();
                    
                    if( sstack.length == 0 )
                        break;
                        
                    act = 169;
                    for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
                    {
                        if( act_tab[sstack[sstack.length-1]][i] == la )
                        {
                            act = act_tab[sstack[sstack.length-1]][i+1];
                            break;
                        }
                    }
                }
                
                if( act != 169 )
                    break;
                
                for( var i = 0; i < rsstack.length; i++ )
                {
                    sstack.push( rsstack[i] );
                    vstack.push( rvstack[i] );
                }
                
                la = __lex( info );
            }
            
            if( act == 169 )
            {
                if( _dbg_withtrace )
                    __dbg_print( "\tError recovery failed, terminating parse process..." );
                break;
            }


            if( _dbg_withtrace )
                __dbg_print( "\tError recovery succeeded, continuing" );
        }
        
        /*
        if( act == 169 )
            break;
        */
        
        
        //Shift
        if( act > 0 )
        {            
            if( _dbg_withtrace )
                __dbg_print( "Shifting symbol: " + labels[la] + " (" + info.att + ")" );
        
            sstack.push( act );
            vstack.push( info.att );
            
            la = __lex( info );
            
            if( _dbg_withtrace )
                __dbg_print( "\tNew lookahead symbol: " + labels[la] + " (" + info.att + ")" );
        }
        //Reduce
        else
        {        
            act *= -1;
            
            if( _dbg_withtrace )
                __dbg_print( "Reducing by producution: " + act );
            
            rval = void(0);
            
            if( _dbg_withtrace )
                __dbg_print( "\tPerforming semantic action..." );
            
switch( act )
{
    case 0:
    {
        rval = vstack[ vstack.length - 1 ];
    }
    break;
    case 1:
    {
        
                                                            parsingResult = vstack[ vstack.length - 1 ];
                                                        
    }
    break;
    case 2:
    {
                
                                                                            rval = newCommand({cmd:"UNION", r1:vstack[ vstack.length - 3 ], r2:vstack[ vstack.length - 1 ]});
                                                                        
    }
    break;
    case 3:
    {
                
                                                                            rval = newCommand({cmd:"CROSSPRODUCT", r1:vstack[ vstack.length - 3 ], r2:vstack[ vstack.length - 1 ]});
                                                                        
    }
    break;
    case 4:
    {
                
                                                                            rval = newCommand({cmd:"DIFFERENCE", r1:vstack[ vstack.length - 3 ], r2:vstack[ vstack.length - 1 ]});
                                                                        
    }
    break;
    case 5:
    {
                
                                                                            rval = newCommand({cmd:"INTERSECTION", r1:vstack[ vstack.length - 3 ], r2:vstack[ vstack.length - 1 ]});
                                                                        
    }
    break;
    case 6:
    {
                
                                                                            rval = newCommand({cmd:"DIVISION", r1:vstack[ vstack.length - 3 ], r2:vstack[ vstack.length - 1 ]});
                                                                        
    }
    break;
    case 7:
    {
                
                                                                            rval = newCommand({cmd:"NATURAL_JOIN", r1:vstack[ vstack.length - 3 ], r2:vstack[ vstack.length - 1 ]});
                                                                        
    }
    break;
    case 8:
    {
                
                                                                            rval = newCommand({cmd:"LEFT_SEMI_JOIN", r1:vstack[ vstack.length - 3 ], r2:vstack[ vstack.length - 1 ]});
                                                                        
    }
    break;
    case 9:
    {
                
                                                                            rval = newCommand({cmd:"RIGHT_SEMI_JOIN", r1:vstack[ vstack.length - 3 ], r2:vstack[ vstack.length - 1 ]});
                                                                        
    }
    break;
    case 10:
    {
                
                                                                            rval = newCommand({cmd:"ANTI_JOIN", r1:vstack[ vstack.length - 3 ], r2:vstack[ vstack.length - 1 ]});
                                                                        
    }
    break;
    case 11:
    {
                
                                                                            rval = newCommand({cmd:"LEFT_OUTER_JOIN", r1:vstack[ vstack.length - 3 ], r2:vstack[ vstack.length - 1 ]});
                                                                        
    }
    break;
    case 12:
    {
                
                                                                            rval = newCommand({cmd:"RIGHT_OUTER_JOIN", r1:vstack[ vstack.length - 3 ], r2:vstack[ vstack.length - 1 ]});
                                                                        
    }
    break;
    case 13:
    {
                
                                                                            rval = newCommand({cmd:"FULL_OUTER_JOIN", r1:vstack[ vstack.length - 3 ], r2:vstack[ vstack.length - 1 ]});
                                                                        
    }
    break;
    case 14:
    {
            
                                                                                                        for (p in vstack[ vstack.length - 4 ]) {
                                                                                                            if (!extended && p.isCalculated) {
                                                                                                                parseError(sprintf(i18n.extended_error_text[lang], i18n.extended_pi[lang]));
                                                                                                                return;
                                                                                                            }
                                                                                                            if (p.isGroupOperation) {
                                                                                                                parseError(i18n.aggregating_in_projection_text[lang]);
                                                                                                                return;
                                                                                                            }
                                                                                                        }
                                                                                                        rval = newCommand({cmd:"PROJECTION", r1:vstack[ vstack.length - 2 ], param:vstack[ vstack.length - 4 ]});
                                                                                                    
    }
    break;
    case 15:
    {
                
                                                                                                        if (!extended) {
                                                                                                            parseError(sprintf(i18n.extended_error_text[lang], vstack[ vstack.length - 6 ]));
                                                                                                            return;
                                                                                                        }
                                                                                                        rval = newCommand({cmd:"GROUPBY", r1:vstack[ vstack.length - 2 ], param:vstack[ vstack.length - 4 ]});
                                                                                                    
    }
    break;
    case 16:
    {
                
                                                                                                        rval = newCommand({cmd:"SELECTION", r1:vstack[ vstack.length - 2 ], param:vstack[ vstack.length - 4 ]});
                                                                                                    
    }
    break;
    case 17:
    {
                
                                                                                                        rval = newCommand({cmd:"THETA_JOIN", r1:vstack[ vstack.length - 4 ], r2:vstack[ vstack.length - 2 ], param:vstack[ vstack.length - 6 ]});
                                                                                                    
    }
    break;
    case 18:
    {
                
                                                                                                        rval = newCommand({cmd:"RENAME_ATTRIBUTES", r1:vstack[ vstack.length - 2 ], param:vstack[ vstack.length - 4 ]});
                                                                                                    
    }
    break;
    case 19:
    {
                
                                                                                                        if (!extended) {
                                                                                                            parseError(sprintf(i18n.extended_error_text[lang], vstack[ vstack.length - 6 ]));
                                                                                                            return;
                                                                                                        }
                                                                                                        rval = newCommand({cmd:"SORT", r1:vstack[ vstack.length - 2 ], param:vstack[ vstack.length - 4 ]});
                                                                                                    
    }
    break;
    case 20:
    {
                
                                                                                                        rval = newCommand({cmd:"RENAME_RELATION", r1:vstack[ vstack.length - 2 ], param:vstack[ vstack.length - 4 ]});
                                                                                                    
    }
    break;
    case 21:
    {
                
                                                                                                        if (!extended) {
                                                                                                            parseError(sprintf(i18n.extended_error_text[lang], vstack[ vstack.length - 4 ]));
                                                                                                            return;
                                                                                                        }
                                                                                                        rval = newCommand({cmd:"DISTINCT", r1:vstack[ vstack.length - 2 ]});
                                                                                                    
    }
    break;
    case 22:
    {
        
                                                                                                        rval = newCommand({cmd:"COPY", r1:vstack[ vstack.length - 1 ]});
                                                                                                    
    }
    break;
    case 23:
    {
        
                                                                                                        rval = vstack[ vstack.length - 2 ];
                                                                                                    
    }
    break;
    case 24:
    {
        rval = vstack[ vstack.length - 1 ];
    }
    break;
    case 25:
    {
        rval = vstack[ vstack.length - 1 ];
    }
    break;
    case 26:
    {
        rval = vstack[ vstack.length - 1 ];
    }
    break;
    case 27:
    {
        rval = vstack[ vstack.length - 1 ];
    }
    break;
    case 28:
    {
        rval = vstack[ vstack.length - 1 ];
    }
    break;
    case 29:
    {
        rval = vstack[ vstack.length - 1 ];
    }
    break;
    case 30:
    {
         rval = vstack[ vstack.length - 2 ] + vstack[ vstack.length - 1 ]
    }
    break;
    case 31:
    {
         rval = vstack[ vstack.length - 2 ] + vstack[ vstack.length - 1 ]
    }
    break;
    case 32:
    {
             
                                                                    rval = {};
                                                                    rval["name"] = vstack[ vstack.length - 3 ]+vstack[ vstack.length - 2 ]+vstack[ vstack.length - 1 ];
                                                                    rval["esc"] = "%" + vstack[ vstack.length - 3 ]+vstack[ vstack.length - 2 ]+vstack[ vstack.length - 1 ] + "%";
                                                                    rval["cols"] = [vstack[ vstack.length - 3 ]+vstack[ vstack.length - 2 ]+vstack[ vstack.length - 1 ]];
                                                                    rval["isAbsolute"] = true;
                                                                
    }
    break;
    case 33:
    {
             
                                                                    rval = {};
                                                                    rval["name"] = vstack[ vstack.length - 1 ];
                                                                    rval["esc"] = "%" + vstack[ vstack.length - 1 ] + "%";
                                                                    rval["cols"] = [vstack[ vstack.length - 1 ]];
                                                                    rval["isRelative"] = true;
                                                                
    }
    break;
    case 34:
    {
            
                                                                    rval = {};
                                                                    rval[vstack[ vstack.length - 1 ].name] = vstack[ vstack.length - 1 ];
                                                                
    }
    break;
    case 35:
    {
        
                                                                    rval = vstack[ vstack.length - 3 ];
                                                                    rval[vstack[ vstack.length - 1 ].name] = vstack[ vstack.length - 1 ];
                                                                
    }
    break;
    case 36:
    {
        rval = vstack[ vstack.length - 1 ];
    }
    break;
    case 37:
    {
            
                                                                    rval = {};
                                                                    rval["name"] = vstack[ vstack.length - 1 ];
                                                                    rval["esc"] = vstack[ vstack.length - 1 ];
                                                                    rval["cols"] = [];
                                                                
    }
    break;
    case 38:
    {
            
                                                                    rval = {};
                                                                    rval["name"] = vstack[ vstack.length - 1 ];
                                                                    rval["esc"] = vstack[ vstack.length - 1 ];
                                                                    rval["cols"] = [];
                                                                
    }
    break;
    case 39:
    {
        rval = vstack[ vstack.length - 1 ];
    }
    break;
    case 40:
    {
        
                                                                                    rval = vstack[ vstack.length - 2 ];
                                                                                    rval["name"] = vstack[ vstack.length - 3 ]+vstack[ vstack.length - 2 ].name+vstack[ vstack.length - 1 ];
                                                                                    rval["esc"] = vstack[ vstack.length - 3 ] + vstack[ vstack.length - 3 ].esc + vstack[ vstack.length - 1 ];
                                                                                    rval["isCalculated"] = true;
                                                                                
    }
    break;
    case 41:
    {
        
                                                                                    rval = {};
                                                                                    rval["name"] = vstack[ vstack.length - 3 ].name+vstack[ vstack.length - 2 ]+vstack[ vstack.length - 1 ].name;
                                                                                    rval["esc"] = vstack[ vstack.length - 3 ].esc + vstack[ vstack.length - 2 ] + vstack[ vstack.length - 1 ].esc;
                                                                                    rval["cols"] = vstack[ vstack.length - 3 ].cols.concat(vstack[ vstack.length - 1 ].cols);
                                                                                    rval["isCalculated"] = true;
                                                                                
    }
    break;
    case 42:
    {
        
                                                                                    rval = {};
                                                                                    rval["name"] = vstack[ vstack.length - 3 ].name+vstack[ vstack.length - 2 ]+vstack[ vstack.length - 1 ].name;
                                                                                    rval["esc"] = vstack[ vstack.length - 3 ].esc + vstack[ vstack.length - 2 ] + vstack[ vstack.length - 1 ].esc;
                                                                                    rval["cols"] = vstack[ vstack.length - 3 ].cols.concat(vstack[ vstack.length - 1 ].cols);
                                                                                    rval["isCalculated"] = true;
                                                                                
    }
    break;
    case 43:
    {
        
                                                                                    rval = {};
                                                                                    rval["name"] = vstack[ vstack.length - 3 ].name+vstack[ vstack.length - 2 ]+vstack[ vstack.length - 1 ].name;
                                                                                    rval["esc"] = vstack[ vstack.length - 3 ].esc + vstack[ vstack.length - 2 ] + vstack[ vstack.length - 1 ].esc;
                                                                                    rval["cols"] = vstack[ vstack.length - 3 ].cols.concat(vstack[ vstack.length - 1 ].cols);
                                                                                    rval["isCalculated"] = true;
                                                                                
    }
    break;
    case 44:
    {
        
                                                                                    rval = {};
                                                                                    rval["name"] = vstack[ vstack.length - 3 ].name+vstack[ vstack.length - 2 ]+vstack[ vstack.length - 1 ].name;
                                                                                    rval["esc"] = vstack[ vstack.length - 3 ].esc + vstack[ vstack.length - 2 ] + vstack[ vstack.length - 1 ].esc;
                                                                                    rval["cols"] = vstack[ vstack.length - 3 ].cols.concat(vstack[ vstack.length - 1 ].cols);
                                                                                    rval["isCalculated"] = true;
                                                                                
    }
    break;
    case 45:
    {
        
                                                                                    rval = {};
                                                                                    rval["name"] = vstack[ vstack.length - 3 ].name+vstack[ vstack.length - 2 ]+vstack[ vstack.length - 1 ].name;
                                                                                    rval["esc"] = vstack[ vstack.length - 3 ].esc + vstack[ vstack.length - 2 ] + vstack[ vstack.length - 1 ].esc;
                                                                                    rval["cols"] = vstack[ vstack.length - 3 ].cols.concat(vstack[ vstack.length - 1 ].cols);
                                                                                    rval["isCalculated"] = true;
                                                                                
    }
    break;
    case 46:
    {
        
                                                                                    rval = {};
                                                                                    rval["name"] = vstack[ vstack.length - 3 ].name+vstack[ vstack.length - 2 ]+vstack[ vstack.length - 1 ].name;
                                                                                    rval["esc"] = 'Math.pow(' + vstack[ vstack.length - 3 ].esc + ',' + vstack[ vstack.length - 1 ].esc + ')';
                                                                                    rval["cols"] = vstack[ vstack.length - 3 ].cols.concat(vstack[ vstack.length - 1 ].cols);
                                                                                    rval["isCalculated"] = true;
                                                                                
    }
    break;
    case 47:
    {
        
                                                                                rval = {};
                                                                                rval["name"] = vstack[ vstack.length - 1 ].esc.match(/[A-Za-z0-9_]*/g).join('');
                                                                                rval["esc"] = vstack[ vstack.length - 1 ].esc;
                                                                                rval["cols"] = vstack[ vstack.length - 1 ].cols;
                                                                                if (vstack[ vstack.length - 1 ]["isCalculated"]) rval["isCalculated"] = true;
                                                                            
    }
    break;
    case 48:
    {
        
                                                                                rval = vstack[ vstack.length - 1 ];
                                                                                rval["name"] = rval.name.replace(".", "_");
                                                                                rval["isGroupOperation"] = true;
                                                                            
    }
    break;
    case 49:
    {
        
                                                                                rval = vstack[ vstack.length - 3 ];
                                                                                rval["originalName"] = rval.name;
                                                                                rval.name = vstack[ vstack.length - 1 ];
                                                                                rval["isRenamed"] = true;
                                                                            
    }
    break;
    case 50:
    {
             
                                                                                rval = {};
                                                                                rval[vstack[ vstack.length - 1 ].name] = vstack[ vstack.length - 1 ];
                                                                            
    }
    break;
    case 51:
    {
             
                                                                                rval = vstack[ vstack.length - 3 ];
                                                                                rval[vstack[ vstack.length - 1 ].name] = vstack[ vstack.length - 1 ];
                                                                            
    }
    break;
    case 52:
    {
            
                                                                                rval = {};
                                                                                rval["name"] = vstack[ vstack.length - 4 ]+vstack[ vstack.length - 3 ]+vstack[ vstack.length - 2 ].name+vstack[ vstack.length - 1 ];
                                                                                rval["esc"] = vstack[ vstack.length - 2 ].esc;
                                                                                rval["cols"] = vstack[ vstack.length - 2 ].cols;
                                                                                rval["type"] = vstack[ vstack.length - 4 ];
                                                                                rval["isCalculated"] = true;
                                                                            
    }
    break;
    case 53:
    {
            
                                                                                rval = {};
                                                                                rval["name"] = vstack[ vstack.length - 4 ]+vstack[ vstack.length - 3 ]+vstack[ vstack.length - 2 ].name+vstack[ vstack.length - 1 ];
                                                                                rval["esc"] = vstack[ vstack.length - 2 ].esc;
                                                                                rval["cols"] = vstack[ vstack.length - 2 ].cols;
                                                                                rval["type"] = vstack[ vstack.length - 4 ];
                                                                                rval["isCalculated"] = true;
                                                                            
    }
    break;
    case 54:
    {
            
                                                                                rval = {};
                                                                                rval["name"] = vstack[ vstack.length - 4 ]+vstack[ vstack.length - 3 ]+vstack[ vstack.length - 2 ].name+vstack[ vstack.length - 1 ];
                                                                                rval["esc"] = vstack[ vstack.length - 2 ].esc;
                                                                                rval["cols"] = vstack[ vstack.length - 2 ].cols;
                                                                                rval["type"] = vstack[ vstack.length - 4 ];
                                                                                rval["isCalculated"] = true;
                                                                            
    }
    break;
    case 55:
    {
            
                                                                                rval = {};
                                                                                rval["name"] = vstack[ vstack.length - 4 ]+vstack[ vstack.length - 3 ]+vstack[ vstack.length - 2 ].name+vstack[ vstack.length - 1 ];
                                                                                rval["esc"] = vstack[ vstack.length - 2 ].esc;
                                                                                rval["cols"] = vstack[ vstack.length - 2 ].cols;
                                                                                rval["type"] = vstack[ vstack.length - 4 ];
                                                                                rval["isCalculated"] = true;
                                                                            
    }
    break;
    case 56:
    {
            
                                                                                rval = {};
                                                                                rval["name"] = vstack[ vstack.length - 4 ]+vstack[ vstack.length - 3 ]+vstack[ vstack.length - 2 ].name+vstack[ vstack.length - 1 ];
                                                                                rval["esc"] = vstack[ vstack.length - 2 ].esc;
                                                                                rval["cols"] = vstack[ vstack.length - 2 ].cols;
                                                                                rval["type"] = vstack[ vstack.length - 4 ];
                                                                                rval["isCalculated"] = true;
                                                                            
    }
    break;
    case 57:
    {
        
                                                                                rval = {};
                                                                                rval["old"] = [];
                                                                                rval["new"] = [];
                                                                                rval["old"].push(vstack[ vstack.length - 3 ].cols[0]);
                                                                                rval["new"].push(vstack[ vstack.length - 1 ].cols[0]);
                                                                                if (vstack[ vstack.length - 1 ].isAbsolute) {
                                                                                    parseError(sprintf(i18n.extended_error_text[lang], vstack[ vstack.length - 3 ].name, vstack[ vstack.length - 1 ].name));
                                                                                    return;
                                                                                }
                                                                            
    }
    break;
    case 58:
    {
        
                                                                                rval = vstack[ vstack.length - 5 ];
                                                                                rval["old"].push(vstack[ vstack.length - 3 ].cols[0]);
                                                                                rval["new"].push(vstack[ vstack.length - 1 ].cols[0]);
                                                                                if (vstack[ vstack.length - 1 ].isAbsolute) {
                                                                                    parseError(sprintf(i18n.rename_to_absolute_text[lang], vstack[ vstack.length - 3 ].name, vstack[ vstack.length - 1 ].name));
                                                                                    return;
                                                                                }
                                                                            
    }
    break;
    case 59:
    {
        
                                                                                            rval = vstack[ vstack.length - 1 ];
                                                                                            rval["esc"] = vstack[ vstack.length - 2 ] + vstack[ vstack.length - 2 ].esc;
                                                                                        
    }
    break;
    case 60:
    {
        
                                                                                            rval = vstack[ vstack.length - 2 ];
                                                                                            rval["esc"] = vstack[ vstack.length - 3 ] + vstack[ vstack.length - 3 ].esc + vstack[ vstack.length - 1 ];
                                                                                        
    }
    break;
    case 61:
    {
        
                                                                                            rval = {};
                                                                                            rval["esc"] = vstack[ vstack.length - 3 ].esc + vstack[ vstack.length - 2 ] + vstack[ vstack.length - 1 ].esc;
                                                                                            rval["cols"] = vstack[ vstack.length - 3 ].cols.concat(vstack[ vstack.length - 1 ].cols);
                                                                                        
    }
    break;
    case 62:
    {
        
                                                                                            rval = {};
                                                                                            rval["esc"] = vstack[ vstack.length - 3 ].esc + vstack[ vstack.length - 2 ] + vstack[ vstack.length - 1 ].esc;
                                                                                            rval["cols"] = vstack[ vstack.length - 3 ].cols.concat(vstack[ vstack.length - 1 ].cols);
                                                                                        
    }
    break;
    case 63:
    {
        
                                                                                            rval = {};
                                                                                            rval["esc"] = vstack[ vstack.length - 3 ].esc + vstack[ vstack.length - 2 ] + vstack[ vstack.length - 1 ].esc;
                                                                                            rval["cols"] = vstack[ vstack.length - 3 ].cols.concat(vstack[ vstack.length - 1 ].cols);
                                                                                        
    }
    break;
    case 64:
    {
        
                                                                                            rval = {};
                                                                                            rval["esc"] = vstack[ vstack.length - 3 ].esc + vstack[ vstack.length - 2 ] + vstack[ vstack.length - 1 ].esc;
                                                                                            rval["cols"] = vstack[ vstack.length - 3 ].cols.concat(vstack[ vstack.length - 1 ].cols);
                                                                                        
    }
    break;
    case 65:
    {
        
                                                                                            rval = {};
                                                                                            rval["esc"] = vstack[ vstack.length - 3 ].esc + vstack[ vstack.length - 2 ] + vstack[ vstack.length - 1 ].esc;
                                                                                            rval["cols"] = vstack[ vstack.length - 3 ].cols.concat(vstack[ vstack.length - 1 ].cols);
                                                                                        
    }
    break;
    case 66:
    {
        
                                                                                            rval = {};
                                                                                            rval["esc"] = vstack[ vstack.length - 3 ].esc + vstack[ vstack.length - 2 ] + vstack[ vstack.length - 1 ].esc;
                                                                                            rval["cols"] = vstack[ vstack.length - 3 ].cols.concat(vstack[ vstack.length - 1 ].cols);
                                                                                        
    }
    break;
    case 67:
    {
        
                                                                                            rval = {};
                                                                                            rval["esc"] = vstack[ vstack.length - 3 ].esc + vstack[ vstack.length - 2 ] + vstack[ vstack.length - 1 ].esc;
                                                                                            rval["cols"] = vstack[ vstack.length - 3 ].cols.concat(vstack[ vstack.length - 1 ].cols);
                                                                                        
    }
    break;
    case 68:
    {
        
                                                                                            rval = {};
                                                                                            rval["esc"] = vstack[ vstack.length - 3 ].esc + vstack[ vstack.length - 2 ] + vstack[ vstack.length - 1 ].esc;
                                                                                            rval["cols"] = vstack[ vstack.length - 3 ].cols.concat(vstack[ vstack.length - 1 ].cols);
                                                                                        
    }
    break;
}



            if( _dbg_withtrace )
                __dbg_print( "\tPopping " + pop_tab[act][1] + " off the stack..." );
                
            for( var i = 0; i < pop_tab[act][1]; i++ )
            {
                sstack.pop();
                vstack.pop();
            }
                                    
            go = -1;
            for( var i = 0; i < goto_tab[sstack[sstack.length-1]].length; i+=2 )
            {
                if( goto_tab[sstack[sstack.length-1]][i] == pop_tab[act][0] )
                {
                    go = goto_tab[sstack[sstack.length-1]][i+1];
                    break;
                }
            }
            
            if( act == 0 )
                break;
                
            if( _dbg_withtrace )
                __dbg_print( "\tPushing non-terminal " + labels[ pop_tab[act][0] ] );
                
            sstack.push( go );
            vstack.push( rval );            
        }
        
        if( _dbg_withtrace )
        {        
            alert( _dbg_string );
            _dbg_string = new String();
        }
    }

    if( _dbg_withtrace )
    {
        __dbg_print( "\nParse complete." );
        alert( _dbg_string );
    }
    
    return err_cnt;
}

// end of JS/CC generated code

	/**
	 *	The parse method is wrapped around the grammar parsing part generated by JS/CC.
	 *	It takes the relational algebraic expression as parameter and returns the QueryTreeRelation representing the query tree.
	 *	@param {String} command The relational algebraic expression.
	 *	@return {QueryTreeRelation}
	 */
	this.parse = function(command) {
		var error_offsets = new Array();
		var error_lookaheads = new Array();
		var error_count = 0;
		var str = command;
		var result = {};
		if( ( error_count = __parse( str, error_offsets, error_lookaheads ) ) > 0 || errorStack.length > 0) {
			result.success = false;
			result.error = errorStack;
			for( var i = 0; i < error_count; i++ ) 
				result.error.push(sprintf(i18n.parse_error_text[lang], 
					(str.substr( 0, error_offsets[i] ).match( /\n/g ) ? str.substr( 0, error_offsets[i] ).match( /\n/g ).length : 1 ),
					str.substr( error_offsets[i] ),
					error_lookaheads[i]));
		} else {
			result = parsingResult;
		}
		if (error_count === 0) {
			return result;
		} else {
			throw new RASParseError(result.error.join("\n"));
		}
	}
}