/**
	Relational Algebra Simulator
	author: David Nagy (mrnagydavid)
	
	version: 1.0
	
	@license MIT
*/
var __RELALG_I18N = true;
"use strict";

/**
 *	This object carries all the texts that might be included in messages to the user or might be used on the dynamic parts of the webUI.
 *	Every field references one message type, and every field has sub-fields that are named as country-codes and that carry the translated message.
 *	@static
 *	@global
 */
var i18n = {
	/* error messages */
	error: {
		errorcode: '0000',
		en: "Unknown error",
		hu: "Ismeretlen hiba"
	},
	
	is_already_defined: {
		errorcode: '1001',
		en: "The '%1' %2 already exists.",
		hu: "A(z) '%1' %2 már létezik"
	},
	
	is_ambiguous: {
		errorcode: '1002',
		en: "The '%1' %2 is ambiguous.",
		hu: "A(z) '%1' %2 nem egyértelmű."
	},
	
	is_not_defined:	{
		errorcode: '1003',
		en:	"The '%1' %2 is not defined.",
		hu: "A(z) '%1' %2 nincs definiálva."
	},
	
	is_not_subset: {
		errorcode: '1004',
		en:	"Division operation requires that with R÷S, the header of S be a subset of the header of R.",
		hu:	"Osztás művelet során elvárt, hogy R÷S esetén az S attribútumlistája részhalmaza legyen R attribútumlistájának."
	},
	
	attributes_mismatch: {
		errorcode: '1005',
		en: "In basic set operations (union, difference, intersection) the attributes of both relations must match unambiguously. [%1]",
		hu: "Halmazműveletek esetén (unió, különbség, metszet) mindkét reláció attribútumainak egyértelműen megfeleltethetőnek kell lenniük egymáshoz. [%1]"
	},
	
	attributes_some_match: {
		errorcode: '1006',
		en: "In 'natural join'-like operations the attributes of the relation must have an intersection. [%1]",
		hu: "Natural join szerű műveletek esetén a két reláció attribútumhalmazának kell legyen metszete. [%1]"
	},
	
	parse_error_text: {
		errorcode: '1007',
		en: "Parse error in line %1 near %2, expecting %3.",
		hu: "Fordítási hiba a %1 sorban a %2 közelében. Adott helyen várt szimólum: %3."
	},
	
	relational_algebraic_expression_missing: {
		errorcode: '1008',
		en: "The relational algebraic expression is missing.",
		hu: "A relációs algebrai kifejezés hiányzik."
	},
	
	is_not_well_formed: {
		errorcode: '1009',
		en: "The '%1' %2 is not well formed.",
		hu: "A '%1' %2 nem szabályos."
	},
	
	is_missing_attributes: {
		errorcode: '1011',
		en: "When adding rows, every attribute must be given a value.",
		hu: "Sorok hozzadásakor minden attribútumnak szükséges értéket adni."
	},
	
	no_relations_are_set: {
		errorcode: '1012',
		en: "You haven't given any source relations.",
		hu:	"Nincsenek megadva relációk."
	},
	
	too_many_values: {
		errorcode: '1013',
		en: "Too many values in the %1. row.\nThe values in this row do not match the number of attributes.",
		hu: "Túl sok érték van a(z) %1. sorban.\nA sorban lévő értékek száma meghaladja az attribútumok számát."
	},
	
	not_enough_values: {
		errorcode: '1014',
		en: "Not enough values in the %1. row.\nThe values in this row do not match the number of attributes.",
		hu: "Túl kevés érték van a(z) %1. sorban.\nA sorban lévő értékek száma kevesebb az attribútumok számánál."
	},
	
	is_empty: {
		errorcode: '1015',
		en: "You haven't specified any data for %1.",
		hu: "Nem adtál meg semmilyen adatot mint %1."
	},
	
	query_tree_error: {
		errorcode: '2001',
		en: "Problem happend during the query tree traversal, couldn't build a commandlist.",
		hu: "Probléma történt a lekérdezésfa elemzésekor, nem lehetett parancslistát építeni."
	},
	
	attribute_list_empty: {
		errorcode: '2002',
		en: "Attribute list is empty.",
		hu: "Az attribútum lista üres."
	},
	
	erroneous_parameter_list: {
		errorcode: '2003',
		en: "Erroneous parameter list.",
		hu: "Hibás paraméterlista."
	},
	
	attributes_must_be_defined: {
		errorcode: '2004',
		en: "The attributes must be defined before adding rows to a relation.",
		hu: "A sorok hozzáadása előtt szükséges definiálni a reláció attribútumait."
	},
	
	is_not_loaded: {
		errorcode: '2005',
		en: "%1 module is not loaded. The site won't be usable. We are sorry!\nPlease, try to refresh the page. ",
		hu: "%1 modul nem elérhető. Az oldal így nem lesz használható. Elnézést!\nPróbáld meg frissíteni az oldalt."
	},
	
	no_storage_browser: {
		errorcode: '2006',
		en: "Your browser does not support local storage. You cannot save or load relations.",
		hu: "A böngésződ nem támogatja 'HTML5 helyi adatbázist', a relációk mentésére és betöltésére nincs lehetőség."
	},
	
	/* error supplemental */
	
	error_evaluating_condition_text: {
		errorcode: '1010',
		en: "%1 occured while parsing the parameter (%2), because: %3.",
		hu: "%1 hiba történt a paraméter (%2) feldolgozása során, mert: %3."
	},
	
	extended_error_text: {
		en: "You are in standard relational algebra mode. You cannot use '%1'.",
		hu: "Az alapértelmezett relációs algebrában nem használhatsz '%1' műveletet."
	},
	
	extended_pi: {
		en: "extended projection",
		hu: "kiterjesztett projekció"
	},
	
	rename_to_absolute_text: {
		en: "You cannot rename an attribute (%1) to an absolute name (%2).",
		hu: "Nem nevezhetsz át egy attribútumot (%1) egy abszolút elérési úttá (%2)."
	},
	
	aggregating_in_projection_text: {
		en: "You cannot use aggregate functions (%1) in a projection.",
		hu: "Nem használhatsz összesítő függvényt (%1) egy projekcióban."
	},
	
	error_user_intro: {
		en: "Looks like some error occured this time. Perhaps you have made a typo.",
		hu: "Úgy fest, valami hiba történt ezúttal. Talán elírtál valamit."
	},
	
	error_internal_intro: {
		en: "Some nasty things occured this time, and it seems like we have messed up, not you. Sorry for this!",
		hu: "Valami nem túl szép dolog történt, és úgy néz ki, a mi hibánk, nem a tiéd. Elnézést érte!"
	},
	
	error_system_intro: {
		en: "That's trouble. Completely unimaginable errors occured. Sorry for this!",
		hu: "Na, most baj van. Teljesen elképzelhetetlen hibába futottunk. Elnézést érte!"
	},
	
	error_errormsg: {
		en: "The error message was:",
		hu: "A hibaüzenet ez volt:"
	},
	
	error_errortitle: {
		en: "Something went wrong...",
		hu: "Valami nem sikerült..."
	},
	
	/* words */
	attribute: {
		en: "attribute",
		hu: "attribútum"
	},
	
	relation_name: {
		en: "relation name",
		hu: "relációnév"
	},
	
	relation: {
		en: "relation",
		hu: "reláció",
	},
	
	result: {
		en: "result",
		hu: "eredmeny"
	},
	
	/* UI-elements */
	ph_relation_name: {
		en: "Relation name",
		hu: "Reláció név"
	},
	
	ph_data: {
		en: "Data table",
		hu: "Adattábla"
	},
	
	title_delrelbtn: {
		en: "Delete this relation",
		hu: "Reláció törlése"
	},

	title_saverelbtn: {
		en: "Save this relation",
		hu: "Reláció mentése"
	},
	
	title_loadrelbtn: {
		en: "Load this relation",
		hu: "Reláció betöltése"
	},
	
	title_listrels: {
		en:	"Available saved relations",
		hu: "Betölthető relációk"
	},
	
	ph_no_saved_relation: {
		en:	"There are no saved relations.",
		hu:	"Nincsenek elmentett relációk."
	},
	
	ph_closebutton: {
		en: "Close",
		hu: "Bezárás"
	}
};