/**
	Relational Algebra Simulator
	author: David Nagy (mrnagydavid)
	
	version: 1.0
	
	@license MIT
*/
"use strict";
var __RELALG_EXCEPTIONS = true;

function RASError(message, code) {
	this.message = message || i18n.error[lang];
	this.code = code || '0000';
}
RASError.prototype = Object.create(Error.prototype);
RASError.prototype.constructor = RASError;

function RASNotLoadedError(name) {
	this.message = sprintf(i18n.is_not_loaded[lang], name);
	this.code = i18n.is_not_loaded.errorcode;
}
RASNotLoadedError.prototype = Object.create(RASError.prototype);
RASNotLoadedError.prototype.constructor = RASNotLoadedError;

/*	================= USER ERRORS ==================== */

function RASUserInputError(message, code) {
	this.message = message || i18n.error[lang];
	this.code = code || '1000';
}
RASUserInputError.prototype = Object.create(RASError.prototype);
RASUserInputError.prototype.constructor = RASUserInputError;

function RASEmptyBodyError(name) {
	this.message = sprintf(i18n.is_empty[lang], name);
	this.code = i18n.is_empty.errorcode;
}
RASEmptyBodyError.prototype = Object.create(RASUserInputError.prototype);
RASEmptyBodyError.prototype.constructor = RASEmptyBodyError;

function RASAlreadyDefinedError(name, type) {
	this.message = sprintf(i18n.is_already_defined[lang], name, type);
	this.code = i18n.is_already_defined.errorcode;
}
RASAlreadyDefinedError.prototype = Object.create(RASUserInputError.prototype);
RASAlreadyDefinedError.prototype.constructor = RASAlreadyDefinedError;

function RASNotDefinedError(name, type) {
	this.message = sprintf(i18n.is_not_defined[lang], name, type);
	this.code = i18n.is_not_defined.errorcode;
}
RASNotDefinedError.prototype = Object.create(RASUserInputError.prototype);
RASNotDefinedError.prototype.constructor = RASNotDefinedError;

function RASAmbiguousError(name, type) {
	this.message = sprintf(i18n.is_ambiguous[lang], name, type);
	this.code = i18n.is_ambiguous.errorcode;
}
RASAmbiguousError.prototype = Object.create(RASUserInputError.prototype);
RASAmbiguousError.prototype.constructor = RASAmbiguousError;

function RASNotWellFormedError(name, type) {
	this.message = sprintf(i18n.is_not_well_formed[lang], name, type);
	this.code = i18n.is_not_well_formed.errorcode;
}
RASNotWellFormedError.prototype = Object.create(RASUserInputError.prototype);
RASNotWellFormedError.prototype.constructor = RASNotWellFormedError;

function RASNotSubsetError() {
	this.message = i18n.is_not_subset[lang];
	this.code = i18n.is_not_subset.errorcode;
}
RASNotSubsetError.prototype = Object.create(RASUserInputError.prototype);
RASNotSubsetError.prototype.constructor = RASNotSubsetError;

function RASAttributeMustMatchError(name) {
	this.message = sprintf(i18n.attributes_mismatch[lang], name);
	this.code = i18n.attributes_mismatch.errorcode;
}
RASAttributeMustMatchError.prototype = Object.create(RASUserInputError.prototype);
RASAttributeMustMatchError.prototype.constructor = RASAttributeMustMatchError;

function RASParseError(msg) {
	this.message = msg;
	this.code = i18n.parse_error_text.errorcode;
}
RASParseError.prototype = Object.create(RASUserInputError.prototype);
RASParseError.prototype.constructor = RASParseError;

function RASRelationalAlgebraicExpressionMissingError() {
	this.message = i18n.relational_algebraic_expression_missing[lang];
	this.code = i18n.relational_algebraic_expression_missing.errorcode;
}
RASRelationalAlgebraicExpressionMissingError.prototype = Object.create(RASUserInputError.prototype);
RASRelationalAlgebraicExpressionMissingError.prototype.constructor = RASRelationalAlgebraicExpressionMissingError;

function RASAttributeSomeMustMatchError(name) {
	this.message = sprintf(i18n.attributes_some_match[lang], name);
	this.code = i18n.attributes_some_match.errorcode;
}
RASAttributeSomeMustMatchError.prototype = Object.create(RASUserInputError.prototype);
RASAttributeSomeMustMatchError.prototype.constructor = RASAttributeSomeMustMatchError;

function RASConditionEvaluationError(errtype, evaltxt, errmsg) {
	this.message = sprintf(i18n.error_evaluating_condition_text[lang], errtype, evaltxt, errmsg);
	this.code = i18n.error_evaluating_condition_text.errorcode;
}
RASConditionEvaluationError.prototype = Object.create(RASUserInputError.prototype);
RASConditionEvaluationError.prototype.constructor = RASConditionEvaluationError;

function RASMissingAttributeError() {
	this.message = i18n.is_missing_attributes[lang];
	this.code = i18n.is_missing_attributes.errorcode;
}
RASMissingAttributeError.prototype = Object.create(RASUserInputError.prototype);
RASMissingAttributeError.prototype.constructor = RASMissingAttributeError;

function RASNoRelationsError() {
	this.message = i18n.no_relations_are_set[lang];
	this.code = i18n.no_relations_are_set.errorcode;
}
RASNoRelationsError.prototype = Object.create(RASUserInputError.prototype);
RASNoRelationsError.prototype.constructor = RASNoRelationsError;

function RASTooManyValuesError(rownum) {
	this.message = sprintf(i18n.too_many_values[lang], rownum);
	this.code = i18n.too_many_values.errorcode;
}
RASTooManyValuesError.prototype = Object.create(RASUserInputError.prototype);
RASTooManyValuesError.prototype.constructor = RASTooManyValuesError;

function RASNotEnoughValuesError(rownum) {
	this.message = sprintf(i18n.not_enough_values[lang], rownum);
	this.code = i18n.not_enough_values.errorcode;
}
RASNotEnoughValuesError.prototype = Object.create(RASUserInputError.prototype);
RASNotEnoughValuesError.prototype.constructor = RASNotEnoughValuesError;

/*	================= INTERNAL ERRORS ==================== */

function RASInternalError(message, code) {
	this.message = message || i18n.error[lang];
	this.code = code || '2000';
}
RASInternalError.prototype = Object.create(RASError.prototype);
RASInternalError.prototype.constructor = RASInternalError;

function RASQueryTreeError() {
	this.message = i18n.query_tree_error[lang];
	this.code = i18n.query_tree_error.errorcode;
}
RASQueryTreeError.prototype = Object.create(RASInternalError.prototype);
RASQueryTreeError.prototype.constructor = RASQueryTreeError;

function RASParameterError(msg, code) {
	this.message = msg || i18n.erroneous_parameter_list[lang];
	this.code = code || i18n.erroneous_parameter_list.errorcode;
}
RASParameterError.prototype = Object.create(RASInternalError.prototype);
RASParameterError.prototype.constructor = RASParameterError;

function RASAttributesNotDefinedError(msg, code) {
	this.message = msg || i18n.attributes_must_be_defined[lang];
	this.code = code || i18n.attributes_must_be_defined.errorcode;
}
RASAttributesNotDefinedError.prototype = Object.create(RASInternalError.prototype);
RASAttributesNotDefinedError.prototype.constructor = RASAttributesNotDefinedError;

function RASNoStorageBrowser() {
	this.message = i18n.no_storage_browser[lang];
	this.code = i18n.no_storage_browser.errorcode;
}
RASNoStorageBrowser.prototype = Object.create(RASInternalError.prototype);
RASNoStorageBrowser.prototype.constructor = RASNoStorageBrowser;