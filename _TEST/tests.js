
//***	Single modules tests 				***
//***		i18n tests						***

var __UNITTEST = true;
lang = "en";
extendedMode = true;

QUnit.module("A1. Utils");
QUnit.test("sprintf", function (assert) {
	assert.deepEqual(sprintf("A %1 %2 %3", "B", "C", "D"), "A B C D");
});

QUnit.test("internationalization", function (assert) {
	var i, l;
	var langs = {en:0, hu:0};
	for (i in i18n) {
		for (l in langs) {
			assert.ok(i18n[i][l]);
		}
	}
});

QUnit.test("typeofvalue", function (assert) {
	var check = [
		[0, "number"],
		["0", "number"],
		[0., "number"],
		["0.", "string"],
		[1.5, "number"],
		["1.5", "number"],
		[1.50, "number"],
		["1.50", "string"],
		["1,5", "string"],
		["alma", "string"],
		[{a:"a"}, "object"],
		['{a:"a"}', "string"],
		[true, "boolean"],
		[false, "boolean"],
		["true", "string"],
		["false", "string"],
	];
	var i;
	var fixture = $("#qunit-fixture");
	
	for (i in check) {
		fixture.val(check[i][0]);
		assert.deepEqual(typeofvalue(fixture.val()), check[i][1], "It is so: " + fixture.val() + " is " + check[i][1] + ".");
	}
});

QUnit.test("errors", function (assert) {
	var ue = new RASUserInputError();
	var ue1 = new RASUserInputError("test");
	var ue2 = new RASUserInputError("test", "0001");
	
	assert.deepEqual(ue instanceof RASUserInputError, true);
	assert.deepEqual(ue.message, i18n.error[lang]);
	assert.deepEqual(ue.code, "1000");
	assert.deepEqual(ue1 instanceof RASUserInputError, true);
	assert.deepEqual(ue1.message, "test");
	assert.deepEqual(ue1.code, "1000");
	assert.deepEqual(ue2 instanceof RASUserInputError, true);
	assert.deepEqual(ue2.message, "test");
	assert.deepEqual(ue2.code, "0001");
	
	ue = new RASInternalError();
	ue1 = new RASInternalError("test");
	ue2 = new RASInternalError("test", "0001");
	
	assert.deepEqual(ue instanceof RASInternalError, true);
	assert.deepEqual(ue.message, i18n.error[lang]);
	assert.deepEqual(ue.code, "2000");
	assert.deepEqual(ue1 instanceof RASInternalError, true);
	assert.deepEqual(ue1.message, "test");
	assert.deepEqual(ue1.code, "2000");
	assert.deepEqual(ue2 instanceof RASInternalError, true);
	assert.deepEqual(ue2.message, "test");
	assert.deepEqual(ue2.code, "0001");
	
	
});

//***		Attributes related tests	***/

QUnit.module("A2. Attributes");
QUnit.test("constructor", function (assert) {
	var a = new Attributes("R");
	assert.ok(a instanceof Attributes, "Attribute object created successfully.");
});

QUnit.test("adding attributes one by one", function (assert) {
	var a = new Attributes("R");
	assert.deepEqual(a.add("att1"), true, "New attribute without origin added successfully.");
	assert.throws(function() { a.add("att1"); }, new RASAlreadyDefinedError('att1', i18n.attribute[lang]), "Duplicated attribute without origin is refused to be added.");
	assert.deepEqual(a.add("att1", "S"), true, "New attribute with origin added successfully.");
	assert.throws(function() { a.add("att1", "S"); }, new RASAlreadyDefinedError('att1', i18n.attribute[lang]), "Duplicated attribute with origin is refused to be added. #1");
	assert.deepEqual(a.add("att1", "P"), true, "New attribute with origin added successfully.");
	assert.deepEqual(a.add("Q.att1"), true, "New attribute with origin added successfully.");
});

QUnit.test("checking attributes", function (assert) {
	var a = new Attributes("R");
	assert.deepEqual(a.add("att1"), true, "New attribute without origin 'att1' added successfully to the relation 'R'.");
	assert.deepEqual(a.has("att1"), true, "The attribute exists.");
	assert.deepEqual(a.add("att1", "S"), true, "New attribute 'att1' with origin of 'S' added successfully.");
	assert.deepEqual(a.add("att2", "P"), true, "New attribute 'att2' with origin of 'P' added successfully.");
	assert.throws(function() { a.has("att1"); }, new RASAmbiguousError('att1', i18n.attribute[lang]), "The attribute name 'att1' in itself is ambiguous now.");
	assert.deepEqual(a.has("R.att1"), true, "The attribute added without origin exists as 'R.att1'. #1");
	assert.deepEqual(a.has("att1", "R"), true, "The attribute added without origin exists as 'R.att1'. #2");
	assert.deepEqual(a.has("S.att1"), true, "The attribute added with origin exists as 'S.att1'. #1");
	assert.deepEqual(a.has("att1", "S"), true, "The attribute added with origin exists as 'S.att1'. #2");
	assert.deepEqual(a.has("att2"), true, "The attribute added with origin exists as 'att2'.");
	assert.deepEqual(a.has("P.att2"), true, "The attribute added with origin exists as 'P.att2'. #1");
	assert.deepEqual(a.has("att2", "P"), true, "The attribute added with origin exists as 'P.att2'. #2");
	assert.deepEqual(a.has("att2", "R"), false, "The attribute added with origin does not exist as 'R.att2'.");
});

QUnit.test("get attributes", function (assert) {
	var a = new Attributes("R");
	a.add("att1");
	a.add("att1", "S");
	a.add("att2");
	a.add("att3", "P");
	assert.deepEqual(a.getAttributes(), ["R.att1", "S.att1", "R.att2", "P.att3"], "Attribute list is unique and verbose. #1");
	assert.deepEqual(a.getAttributesOnly(), ["att1", "att1", "att2", "att3"], "Attribute list is minimal. #1");
	assert.deepEqual(a.getAttributesUnique(), ["R.att1", "S.att1", "att2", "att3"], "Attribute list is proper. #1");
	a.add("att3");
	assert.deepEqual(a.getAttributes(), ["R.att1", "S.att1", "R.att2", "P.att3", "R.att3"], "Attribute list is unique and verbose. #2");
	assert.deepEqual(a.getAttributesOnly(), ["att1", "att1", "att2", "att3", "att3"], "Attribute list is minimal. #2");
	assert.deepEqual(a.getAttributesUnique(), ["R.att1", "S.att1", "att2", "P.att3", "R.att3"], "Attribute list is proper. #1");
});

QUnit.test("get number of attributes", function (assert) {
	var a = new Attributes("R");
	assert.deepEqual(a.length, 0, "No attributes.");
	a.add("att1");
	assert.deepEqual(a.length, 1, "1 attribute.");
	a.add("att1", "S");
	assert.deepEqual(a.length, 2, "2 attributes.");
	assert.throws(function() { a.add("att1"); }, new RASAlreadyDefinedError('att1', i18n.attribute[lang]), "Duplicated attribute without origin is refused to be added.");
	assert.deepEqual(a.length, 2, "2 attributes.");
});

QUnit.test("renaming attributes", function (assert) {
	var a = new Attributes("R");
	a.add("att1");
	a.add("att2");
	a.add("P.att2");
	assert.deepEqual(a.rename("btt1", "att1"), true, "Renaming att1->btt1 successful.");
	assert.deepEqual(a.getAttributes(), ["R.btt1", "R.att2", "P.att2"], "Attribute list is correct. #1");
	assert.throws(function() { a.rename("btt2", "att2"); }, new RASAmbiguousError('att2', i18n.attribute[lang]), "Renaming att2->btt2 is ambiguous.");
	assert.deepEqual(a.rename("btt2", "R.att2"), true, "Renaming R.att2->btt2 successful.");
	assert.deepEqual(a.getAttributes(), ["R.btt1", "R.btt2", "P.att2"], "Attribute list is correct. #2");
	assert.deepEqual(a.rename("btt3", "att2"), true, "Renaming att2->btt3 successful.");
	assert.deepEqual(a.getAttributes(), ["R.btt1", "R.btt2", "R.btt3"], "Attribute list is correct. #3");
});

QUnit.test("setting attributes in one go", function (assert) {
	var a = new Attributes("R");
	assert.deepEqual(a.set("att1;att2;att3"), true, "New attributes added successfully.");
	assert.deepEqual(a.length, 3, "3 attributes.");
	assert.deepEqual(a.has("att1") && a.has("att2") && a.has("att3"), true, "Attributes can be checked by has().");
	assert.deepEqual(a.getAttributes(), ["R.att1", "R.att2", "R.att3"], "Attribute list is unique and verbose.");
	
	var b = new Attributes("R");
	assert.deepEqual(b.set("att1;P.att1;att2"), true, "New attributes added successfully.");
	assert.deepEqual(b.length, 3, "3 attributes.");
	assert.deepEqual(b.has("R.att1") && b.has("P.att1") && b.has("att2"), true, "Attributes can be checked by has().");
	assert.deepEqual(b.getAttributes(), ["R.att1", "P.att1", "R.att2"], "Attribute list is unique and verbose.");
	
	var c = new Attributes("R");
	assert.deepEqual(c.set(b.getAttributes()), true, "New attributes are copied successfully.");
	assert.deepEqual(c.getAttributes(), b.getAttributes(), "Attributes match.");
});

QUnit.test("create dictionary", function (assert) {
	var a = new Attributes("R");
	a.add("att1");
	a.add("att2");
	a.add("att3");
	assert.deepEqual(a.translateAttributes(["P.att1", "Q.att2", "S.att3"]), {"P.att1":"R.att1", "Q.att2":"R.att2", "S.att3":"R.att3"}, "Attributes are translated. #1");
	
	a = new Attributes("R");
	a.add("att1");
	a.add("P.att1");
	a.add("Q.att3");
	assert.deepEqual(a.translateAttributes(["P.att1", "Q.att2", "S.att3"]), {"P.att1":"P.att1", "S.att3":"Q.att3"}, "Attributes are translated. #2");
	
	a = new Attributes("R");
	a.add("att1");
	a.add("Q.att3");
	assert.deepEqual(a.translateAttributes(["att1", "Q.att2", "S.att3"]), {"att1":"R.att1", "S.att3":"Q.att3"}, "Attributes are translated. #3");
	// jelenlegi elv szerint csak abszolútokat kérdezünk le
	
	a = new Attributes("R");
	a.add("att1");
	a.add("P.att2");
	a.add("Q.att2");
	assert.deepEqual(a.translateAttributes(["R.att1", "Q.att2", "P.att2"]), {"R.att1":"R.att1", "Q.att2":"Q.att2", "P.att2":"P.att2"}, "Attributes are translated. #4");
	
	a = new Attributes("R");
	a.add("att1");
	a.add("P.att1");
	assert.throws(function() { a.translateAttributes(["att1"]); }, new RASAmbiguousError('att1', i18n.attribute[lang]), "Ambiguousity found. #1");
	
	a = new Attributes("R");
	a.add("Q.att3");
	a.add("S.att3");
	assert.deepEqual(a.translateAttributes(["R.att3"]), {}, "Absolute names are never ambiguous, but they may not match.");
});

QUnit.test("crossproduct", function (assert) {
	var a = new Attributes("R");
	a.add("att1");
	a.add("att2");
	a.add("att3");
	var b = new Attributes("S");
	b.add("att1");
	b.add("att2");
	b.add("att3");
	var r = new Attributes("X");
	r.set(a.getAttributes());
	assert.deepEqual(r.crossproduct(b.getAttributes()), true, "Crossproduct successful.");
	assert.deepEqual(r.getAttributes(), ["R.att1","R.att2","R.att3","S.att1","S.att2","S.att3"], "Attributes are joined correctly.");
	assert.throws(function() { r.has("att1"); }, new RASAmbiguousError('att1', i18n.attribute[lang]), "'att1' is ambiguous after crossproduct with self.");
	assert.throws(function() { r.crossproduct(b.getAttributes()); }, new RASAlreadyDefinedError('S.att1', i18n.attribute[lang]), "Crossproduct is not successful.");
});

QUnit.test("naturaljoin", function (assert) {
	var a = new Attributes("R");
	a.add("att1");
	a.add("att2");
	a.add("att3");
	var b = new Attributes("S");
	b.add("att4");
	b.add("att2");
	b.add("att5");
	var r = new Attributes("X");
	r.set(a.getAttributes());
	assert.deepEqual(r.naturaljoin(b.getAttributes()), true, "Natural join successful.");
	assert.deepEqual(r.getAttributes(), ["R.att1","X.att2","R.att3","S.att4","S.att5"], "Attributes are joined correctly.");
	assert.deepEqual(r.has("att2"), true, "'att2' exists as a joining attribute.");
	assert.deepEqual(r.naturaljoin(b.getAttributes()), true, "Natural join successful again.");
	assert.deepEqual(r.getAttributes(), ["R.att1", "X.att2", "R.att3", "X.att4", "X.att5"], "Attributes are re-joined correctly.");
	
	var s = new Attributes("S");
	s.add("S.att1");
	s.add("P.att1");
	s.add("att6");
	assert.throws(function() { s.naturaljoin(a.getAttributes()); }, new RASAmbiguousError('R.att1', i18n.attribute[lang]), "Attribute name matching multiple attributes yields an error.");
});

QUnit.test("divide", function (assert) {
	var a = new Attributes("R");
	a.add("att1");
	a.add("att2");
	a.add("att3");
	var b = new Attributes("S");
	b.add("att2");
	var r = new Attributes("X");
	r.set(a.getAttributes());
	assert.deepEqual(r.divide(b.getAttributes()), true, "Division successful.");
	assert.deepEqual(r.getAttributes(), ["R.att1","R.att3"], "Attributes are divided correctly. #1");
	assert.deepEqual(r.has("att2"), false, "'att2' does not exist as it was a common attribute.");
	assert.throws(function() { r.divide(b.getAttributes()); }, new RASNotSubsetError(), "Division throws an error on disjunct header sets.");
	assert.deepEqual(r.getAttributes(), ["R.att1", "R.att3",], "Attributes are divded correctly, nothing changed.");
	
	var s = new Attributes("S");
	s.add("att1");
	s.add("att2");
	s.add("att3");
	s.add("att4");
	b.add("att3");
	assert.deepEqual(s.divide(b), true, "Division successful yet again with Attributes as an argument.");
	assert.deepEqual(s.getAttributes(), ["S.att1","S.att4"], "Attributes are divided correctly. #2");
});


//***		SymbolManager related tests 	***

QUnit.module("A3. SymbolManager");

QUnit.test("constructor", function (assert) {
	var sm = new SymbolManager();
	assert.ok(sm instanceof SymbolManager, "SymbolManager object is created.");
});

QUnit.test("add relation, exists relation", function (assert) {
	var sm = new SymbolManager();
	var rel = "Relation";
	assert.deepEqual(sm.existsRelation(rel), false, "There is no " + rel + " symbol before adding it.");
	assert.deepEqual(sm.addRelation(rel), true, "The '" + rel + "' symbol is added successfully.");
	assert.deepEqual(sm.existsRelation(rel), true, "There is a " + rel + " symbol after adding it.");
});

QUnit.test("add relation, exists relation (error test)", function (assert) {
	var sm = new SymbolManager();
	var rel = "Relation";
	
	sm.addRelation(rel);
	assert.throws(function() { sm.addRelation(rel); }, new RASAlreadyDefinedError(rel, i18n.relation[lang]), "Adding an already existing symbol yields an error.");
});

QUnit.test("add attribute, exists attribute", function (assert) {
	var sm = new SymbolManager();
	var rel = "Relation";
	var rel1 = "Relation1";
	var attr = "Attribute";
	var attr1 = "Attribute1";
	sm.addRelation(rel);
	sm.addRelation(rel1);
	assert.deepEqual(sm.existsAttribute(attr, rel), false, "There is no '" + attr + "' symbol before adding it to '" + rel + "'.");
	assert.deepEqual(sm.existsAttribute(rel+"."+attr, rel), false, "There is no '" + rel + "." + attr + "' symbol before adding it to '" + rel + "'.");
	assert.deepEqual(sm.addAttribute(attr, rel), true, "The '" + attr + "' symbol is added successfully to '" + rel + "'.");
	assert.deepEqual(sm.existsRelation(attr), false, "The '" + attr + "' symbol is not a relation.");
	assert.deepEqual(sm.existsAttribute(attr, rel), true, "There is a '" + attr + "' symbol after adding it to '" + rel + "'.");
	assert.deepEqual(sm.existsAttribute(rel+"."+attr, rel), true, "There is a '" + rel + "." + attr + "' symbol after adding it to '" + rel + "'.");
	// ezeket a nyelvtan nem fogadhatja el, ez a belső használat miatt kell
	assert.deepEqual(sm.existsAttribute(attr1, rel), false, "There is no '" + attr1 + "' symbol before adding it to '" + rel + "'.");
	assert.deepEqual(sm.existsAttribute(rel+"."+attr1, rel), false, "There is no '" + rel + "." + attr1 + "' symbol before adding it to '" + rel + "'.");
	assert.deepEqual(sm.addAttribute(rel+"."+attr1, rel), true, "The '" + attr1 + "' symbol is added successfully to '" + rel + "'.");
	assert.deepEqual(sm.existsAttribute(rel+"."+attr1, rel), true, "There is a '" + rel + "." + attr1 + "' symbol after adding it to '" + rel + "'.");
	assert.deepEqual(sm.existsAttribute(attr1, rel), true, "There is a '" + attr1 + "' symbol after adding it to '" + rel + "'.");
	// ezeket a nyelvtan nem fogadhatja el, ez a belső használat miatt kell
	assert.deepEqual(sm.addAttribute(rel+"."+attr1, rel1), true, "The '" + rel + "." + attr1 + "' symbol is added successfully to '" + rel1 + "'.");
	assert.deepEqual(sm.existsAttribute(attr1, rel1), true, "There is a '" + attr1 + "' symbol after adding it to '" + rel1 + "'.");
	assert.deepEqual(sm.existsAttribute(rel+"."+attr1, rel1), true, "There is a '" + rel + "." + attr1 + "' symbol after adding it to '" + rel1 + "'.");
	assert.deepEqual(sm.existsAttribute(rel1+"."+attr1, rel1), false, "There is still no '" + rel1 + "." + attr1 + "' symbol in '" + rel1 + "'.");
});

QUnit.test("add attribute, exists attribute (error test)", function (assert) {
	var sm = new SymbolManager();
	var rel = "Relation";
	var attr = "Attribute";	
	sm.addRelation(rel);
	sm.addAttribute(attr, rel);
	assert.throws(function() { sm.addAttribute(attr, rel); }, new RASAlreadyDefinedError(attr, i18n.attribute[lang]), "Adding an already existing symbol yields an error.");
});

QUnit.test("set attributes", function (assert) {
	var sm = new SymbolManager();
	sm.addRelation("R");
	sm.setAttributes("att1;att2;att3", "R");
	assert.deepEqual(sm.existsAttribute("att1","R"), true, "The 'att1' added to R.");
	assert.deepEqual(sm.existsAttribute("att2","R"), true, "The 'att2' added to R.");
	assert.deepEqual(sm.existsAttribute("att3","R"), true, "The 'att3' added to R.");
});

QUnit.test("proper attributes", function (assert) {
	var sm = new SymbolManager();
	var rel = "Relation";
	var rel1 = "Relation1";
	var rel2 = "Relation2";
	var attr = "Attribute";
	var attr2 = "Attribute2";
	
	sm.addRelation(rel);
	assert.throws(function() { sm.checkProperAttributes([attr], [rel]); }, new RASNotDefinedError(attr, i18n.attribute[lang]), "Not defined attribute found.");
	sm.addAttribute(rel1+"."+attr, rel);
	sm.addAttribute(rel2+"."+attr, rel);
	assert.throws(function() { sm.checkProperAttributes([attr], [rel]); }, new RASAmbiguousError(attr, i18n.attribute[lang]), "ambiguousity found.");
	
	sm.addRelation(rel1);
	sm.addRelation(rel2);
	sm.addAttribute(attr, rel1);
	sm.addAttribute(attr2, rel2);
	assert.deepEqual(sm.checkProperAttributes([attr, attr2], [rel1, rel2]), true, "Matching attributes in multiple relations is working.");
	
	sm.addRelation("R1");
	sm.addAttribute("P1.att1", "R1");
	sm.addAttribute("att2", "R1");
	assert.deepEqual(sm.checkProperAttributes(["att1"], ["R1"]), true, "Relative path to absolute attribute is not necessarily ambiguous.");
	sm.addAttribute("S1.att1", "R1");
	assert.throws(function() { sm.checkProperAttributes(["att1"], ["R1"]); }, new RASAmbiguousError('att1', i18n.attribute[lang]), "ambiguousity found.");
});

QUnit.test("add alias", function (assert) {
	var sm = new SymbolManager();
	var rel = "Relation";
	var attr = "Attribute";
	var alias = "Alias";
	
	sm.addRelation(rel);
	sm.addAttribute(attr, rel);
	assert.deepEqual(sm.addAlias(alias, rel), true, "Alias successful.");
	assert.deepEqual(sm.existsRelation(alias), true, "There is '" + alias + "' symbol after adding it as an alias.");
	assert.deepEqual(sm.existsAttribute(attr, alias), true, "The '" + attr + "' symbol can be accessed through '" + alias + "'.");
	assert.deepEqual(sm.existsAttribute(rel+"."+attr, alias), true, "The '" + rel + "." + attr + "' symbol can be accessed through '" + alias + "'.");
	assert.deepEqual(sm.existsAttribute(alias+"."+attr, alias), false, "There is no '" + alias + "." + attr + "' symbol in '" + alias + "'.");
});

QUnit.test("add crossproduct relation", function (assert) {
	var sm = new SymbolManager();
	var rel1 = "Relation1";
	var attr1 = "Attribute1";
	var rel2 = "Relation2";
	var attr2 = "Attribute2";
	var relJ = "RelationJoined";
	
	sm.addRelation(rel1);
	sm.addAttribute(attr1, rel1);
	sm.addRelation(rel2);
	sm.addAttribute(attr2, rel2);
	assert.deepEqual(sm.addCrossproduct(relJ, rel1, rel2), true, "Join successful.");
	assert.deepEqual(sm.existsRelation(relJ), true, "There is '" + relJ + "' symbol after adding it as a joined relation.");
	assert.deepEqual(sm.existsAttribute(attr1, relJ), true, "The '" + attr1 + "' symbol can be accessed through '" + relJ + "'.");
	assert.deepEqual(sm.existsAttribute(attr2, relJ), true, "The '" + attr2 + "' symbol can be accessed through '" + relJ + "'.");
	assert.deepEqual(sm.existsAttribute(rel1+"."+attr1, relJ), true, "The '" + rel1 + "." + attr1 + "' symbol can be accessed through '" + relJ + "'.");
	assert.deepEqual(sm.existsAttribute(rel2+"."+attr2, relJ), true, "The '" + rel2 + "." + attr2 + "' symbol can be accessed through '" + relJ + "'.");
	assert.deepEqual(sm.existsAttribute(relJ+"."+attr1, relJ), false, "There is no '" + relJ + "." + attr1 + "' symbol in '" + relJ + "'.");
	assert.deepEqual(sm.existsAttribute(relJ+"."+attr2, relJ), false, "There is no '" + relJ + "." + attr2 + "' symbol in '" + relJ + "'.");
});

QUnit.test("add crossproduct relation (error test)", function (assert) {
	var sm = new SymbolManager();
	var rel1 = "Relation1";
	var attr1 = "Attribute1";
	var rel2 = "Relation2";
	var attr2 = "Attribute2";
	var relJ = "RelationJoined";
	
	assert.throws(function() { sm.addCrossproduct(relJ, rel1, rel2); }, new RASNotDefinedError(rel1, i18n.relation[lang]), "Join unsuccessful with a relation missing.");
	sm.addRelation(rel1);
	sm.addAttribute(attr1, rel1);
	assert.throws(function() { sm.addCrossproduct(relJ, rel1, rel2); }, new RASNotDefinedError(rel2, i18n.relation[lang]), "Join unsuccessful with a relation missing.");
	sm.addRelation(rel2);
	sm.addAttribute(attr2, rel2);
	assert.deepEqual(sm.addCrossproduct(relJ, rel1, rel2), true, "Join successful.");
});

QUnit.test("add naturaljoin relation", function (assert) {
	var sm = new SymbolManager();
	sm.addRelation("R");
	sm.addAttribute("a1", "R");
	sm.addAttribute("a2", "R");
	sm.addAttribute("a3", "R");
	sm.addRelation("S");
	sm.addAttribute("a4", "S");
	sm.addAttribute("a2", "S");
	sm.addAttribute("a5", "S");
	assert.deepEqual(sm.addJoin("X", "R", "S"), true, "Join successful.");
	assert.deepEqual(sm.existsRelation("X"), true, "There is '" + "X" + "' symbol after adding it as a joined relation.");
	assert.deepEqual(sm.existsAttribute("a1", "X"), true, "The '" + "a1" + "' symbol can be accessed through '" + "X" + "'.");
	assert.deepEqual(sm.existsAttribute("a2", "X"), true, "The '" + "a2" + "' symbol can be accessed through '" + "X" + "'.");
	assert.deepEqual(sm.existsAttribute("a3", "X"), true, "The '" + "a3" + "' symbol can be accessed through '" + "X" + "'.");
	assert.deepEqual(sm.existsAttribute("a4", "X"), true, "The '" + "a4" + "' symbol can be accessed through '" + "X" + "'.");
	assert.deepEqual(sm.existsAttribute("a5", "X"), true, "The '" + "a5" + "' symbol can be accessed through '" + "X" + "'.");
	assert.deepEqual(sm.existsAttribute("R.a1", "X"), true, "The '" + "R.a1" + "' symbol can be accessed through '" + "X" + "'.");
	assert.deepEqual(sm.existsAttribute("R.a2", "X"), false, "The '" + "R.a2" + "' symbol cannot be accessed through '" + "X" + "'.");
	assert.deepEqual(sm.existsAttribute("R.a3", "X"), true, "The '" + "R.a3" + "' symbol can be accessed through '" + "X" + "'.");
	assert.deepEqual(sm.existsAttribute("S.a4", "X"), true, "The '" + "S.a4" + "' symbol can be accessed through '" + "X" + "'.");
	assert.deepEqual(sm.existsAttribute("S.a2", "X"), false, "The '" + "S.a2" + "' symbol cannot be accessed through '" + "X" + "'.");
	assert.deepEqual(sm.existsAttribute("S.a5", "X"), true, "The '" + "S.a5" + "' symbol can be accessed through '" + "X" + "'.");
	assert.deepEqual(sm.existsAttribute("X.a2", "X"), true, "The '" + "X.a2" + "' symbol can be accessed through '" + "X" + "'.");
});

QUnit.test("add division relation", function (assert) {
	var sm = new SymbolManager();
	sm.addRelation("R");
	sm.addAttribute("a1", "R");
	sm.addAttribute("a2", "R");
	sm.addAttribute("a3", "R");
	sm.addRelation("S");
	sm.addAttribute("a2", "S");
	assert.deepEqual(sm.addDivision("X", "R", "S"), true, "Join successful.");
	assert.deepEqual(sm.existsRelation("X"), true, "There is '" + "X" + "' symbol after adding it as a joined relation.");
	assert.deepEqual(sm.existsAttribute("a1", "X"), true, "The '" + "a1" + "' symbol can be accessed through '" + "X" + "'.");
	assert.deepEqual(sm.existsAttribute("a2", "X"), false, "The '" + "a2" + "' symbol cannot be accessed through '" + "X" + "'.");
	assert.deepEqual(sm.existsAttribute("a3", "X"), true, "The '" + "a3" + "' symbol can be accessed through '" + "X" + "'.");
	assert.deepEqual(sm.existsAttribute("R.a1", "X"), true, "The '" + "R.a1" + "' symbol can be accessed through '" + "X" + "'.");
	assert.deepEqual(sm.existsAttribute("R.a2", "X"), false, "The '" + "R.a2" + "' symbol cannot be accessed through '" + "X" + "'.");
	assert.deepEqual(sm.existsAttribute("R.a3", "X"), true, "The '" + "R.a3" + "' symbol can be accessed through '" + "X" + "'.");
	assert.deepEqual(sm.existsAttribute("X.a2", "X"), false, "The '" + "X.a2" + "' symbol cannot be accessed through '" + "X" + "'.");
});

QUnit.test("remove relation", function (assert) {
	var sm = new SymbolManager();
	var rel = "Relation";
	
	sm.addRelation(rel);
	assert.deepEqual(sm.existsRelation(rel), true, "There is a '" + rel + "' symbol before being removed.");
	assert.deepEqual(sm.removeRelation(rel), true, "Remove successful.");
	assert.deepEqual(sm.existsRelation(rel), false, "There is no '" + rel + "' symbol after being removed.");
});

QUnit.test("remove relation (error test)", function (assert) {
	var sm = new SymbolManager();
	var rel = "Relation";
	
	assert.throws(function() { sm.removeRelation(rel); }, new RASNotDefinedError(rel, i18n.relation[lang]), "Removing non-existing symbol yields an error.");
});

QUnit.test("rename relation #1", function (assert) {
	var sm = new SymbolManager();
	var rel1 = "Relation1";
	var rel2 = "Relation2";
	var attr = "Attribute";
	
	sm.addRelation(rel1);
	sm.addAttribute(attr, rel1);
	assert.deepEqual(sm.existsRelation(rel1), true, "There is a '" + rel1 + "' symbol before renaming.");
	assert.deepEqual(sm.existsRelation(rel2), false, "There is no '" + rel2 + "' symbol before renaming.");
	assert.deepEqual(sm.renameRelation(rel2, rel1), true, "Rename successful. (" + rel1 + "->" + rel2 + ")");
	assert.deepEqual(sm.existsRelation(rel2), true, "There is a '" + rel2 + "' symbol after renaming the '" + rel1 + "' relation.");
	assert.deepEqual(sm.existsRelation(rel1), false, "There is no '" + rel1 + "' symbol after renaming the '" + rel1 + "' relation.");
	assert.deepEqual(sm.existsAttribute(attr, rel2), true, "The '" + rel2 + "." + attr + "' symbol can be accessed through '" + rel2 + "'.");
});

QUnit.test("rename relation #2", function (assert) {
	var sm = new SymbolManager();
	var rel = "Relation";
	var rel1 = "Relation1";
	var attr1 = "Attribute1";
	var rel2 = "Relation2";
	var reln = "RelationNew";
	
	sm.addRelation(rel);
	sm.addAttribute(rel1+"."+attr1, rel);
	sm.addAttribute(rel2+"."+attr1, rel);
	assert.deepEqual(sm.existsAttribute(rel1+"."+attr1, rel), true, "The '" + rel1 + "." + attr1 + "' symbol can be accessed through '" + rel + "'.");
	assert.deepEqual(sm.existsAttribute(rel2+"."+attr1, rel), true, "The '" + rel2 + "." + attr1 + "' symbol can be accessed through '" + rel + "'.");
	assert.throws(function() { sm.renameRelation(reln, rel); }, new RASAlreadyDefinedError(attr1, i18n.attribute[lang]), "Rename failed with error.");
});

QUnit.test("rename relation (error test)", function (assert) {
	var sm = new SymbolManager();
	var rel1 = "Relation1";
	var rel2 = "Relation2";
	
	assert.throws(function() { sm.renameRelation(rel2, rel1); }, new RASNotDefinedError(rel1, i18n.relation[lang]), "Renaming a non-existing symbol yields an error.");
	sm.addRelation(rel1);
	sm.addRelation(rel2);
	assert.throws(function() { sm.renameRelation(rel2, rel1); }, new RASAlreadyDefinedError(rel2, i18n.relation[lang]), "Renaming into an existing symbol yields an error.");
});

QUnit.test("rename attribute", function (assert) {
	var sm = new SymbolManager();
	var rel = "Relation";
	var attrs = ["attr1", "attr2", "attr3"];
	var attrs_old = ["attr1", "attr2"];
	var attrs_new = ["rara1", "rara2"];
	
	sm.addRelation(rel);
	for (a in attrs) {
		sm.addAttribute(attrs[a], rel);
	}
	assert.deepEqual(sm.renameAttributes(attrs_new, attrs_old, rel), true, "Rename succeeded from " + attrs_old.join(',') + " -> " + attrs_new.join(',') + ".");
	assert.deepEqual(sm.existsAttribute(attrs_old[0], rel), false, "Attribute '" + attrs_old[0] + "' does not exist after renaming.");
	assert.deepEqual(sm.existsAttribute(attrs_old[1], rel), false, "Attribute '" + attrs_old[1] + "' does not exist after renaming.");
	assert.deepEqual(sm.existsAttribute(attrs_new[0], rel), true, "Attribute '" + attrs_new[0] + "' exists after renaming.");
	assert.deepEqual(sm.existsAttribute(attrs_new[1], rel), true, "Attribute '" + attrs_new[1] + "' exists after renaming.");
});

QUnit.test("rename attribute (error test)", function (assert) {
	var sm = new SymbolManager();
	var rel = "Relation";
	var rel1 = "Relation1";
	var rel2 = "Relation2";
	var attr1 = "Attribute1";
	var attr2 = "Attribute2";
	
	assert.throws(function() { sm.renameAttributes([attr2], [attr1], rel); }, new RASNotDefinedError(rel, i18n.relation[lang]), "Renaming attribute in non-existing relation yields an error.");
	sm.addRelation(rel);
	assert.throws(function() { sm.renameAttributes([attr2], [attr1], rel); }, new RASNotDefinedError(attr1, i18n.attribute[lang]), "Renaming a non-existing attribute yields an error.");
	
	sm.addAttribute(rel1+"."+attr1, rel);
	sm.addAttribute(rel2+"."+attr1, rel);
	assert.throws(function() { sm.renameAttributes([attr2], [attr1], rel); }, new RASAmbiguousError(attr1, i18n.attribute[lang]), "Renaming to an existing attribute yields an error.");
});

QUnit.test("addProjection relation", function (assert) {
	var sm = new SymbolManager();
	var rel1 = "Relation1";
	var rel2 = "Relation2";
	var attrs1 = ["attr1", "attr2", "attr3"];
	var attrs2 = ["attr2"];
	var a;
	
	sm.addRelation(rel1);
	for (a in attrs1) {
		sm.addAttribute(attrs1[a], rel1);
	}
	assert.deepEqual(sm.addProjection(rel2, attrs2, rel1), true, "addProjectionion successful.");
	assert.deepEqual(sm.existsRelation(rel2), true, "There is a '" + rel2 + "' symbol after renaming the '" + rel1 + "' relation.");
	assert.deepEqual(sm.existsAttribute(attrs2[0], rel2), true, "There is a '" + rel2 + "." + attrs2[0] + "' symbol after addProjectioning from the '" + rel1 + "' relation.");
	assert.deepEqual(sm.existsAttribute(attrs1[0], rel2), false, "There is no '" + rel2 + "." + attrs1[0] + "' symbol after addProjectioning from the '" + rel1 + "' relation.");
	assert.deepEqual(sm.existsAttribute(attrs1[2], rel2), false, "There is no '" + rel2 + "." + attrs1[2] + "' symbol after addProjectioning from the '" + rel1 + "' relation.");
});

QUnit.test("addProjection relation with absolute paths", function (assert) {
	var sm = new SymbolManager();
	var rel = "Relation";
	var rel1 = "Relation1";
	var rel2 = "Relation2";
	var attr1 = "Attribute1";
	var attr2 = "Attribute2";
	var reln = "RelationNew";
	
	sm.addRelation(rel);
	sm.addAttribute(rel1+"."+attr1, rel);
	sm.addAttribute(rel2+"."+attr1, rel);
	sm.addAttribute(attr2, rel);
	assert.throws(function() { sm.addProjection(reln, [attr1], rel); }, new RASAmbiguousError(attr1, i18n.attribute[lang]), "addProjection failed with relative path '" + attr1 + "'.");
	assert.deepEqual(sm.addProjection(reln, [rel1+"."+attr1], rel), true, "addProjectionion succeeded with absolute path '" + rel1+"."+attr1 + "'.");
});

QUnit.test("addProjection relation (error test)", function (assert) {
	var sm = new SymbolManager();
	var rel = "Relation";
	var attr1 = "Attribute1";
	var reln = "RelationNew";
	assert.throws(function() { sm.addProjection(reln, [attr1], rel); }, new RASNotDefinedError(rel, i18n.relation[lang]), "addProjectioning a non-existing relation yields an error.");
	sm.addRelation(rel);
	assert.throws(function() { sm.addProjection(reln, [attr1], rel); }, new RASNotDefinedError(attr1, i18n.attribute[lang]), "addProjectioning to a non-existing attribute in a relation yields an error.");
});

QUnit.test("get symbolmanager", function (assert) {
	var sm1 = getSymbolManager();
	assert.ok(sm1 instanceof SymbolManager, "SymbolManager object is created.");
	var sm2 = getSymbolManager();
	assert.deepEqual(sm1, sm2, "The same SymbolManager object is returned with every call.");
});

QUnit.test("matching attributes", function (assert) {
	var sm = new SymbolManager();
	var rel1 = "R1";
	var attr11 = "Att1";
	var attr12 = "S.Att2";
	var attr13 = "T.Att3";
	var rel2 = "R2";
	var attr21 = "Att4";
	var attr22 = "P.Att1";
	var attr23 = "Q.Att3";
	
	sm.addRelation(rel1);
	sm.addAttribute(attr11, rel1);
	sm.addAttribute(attr12, rel1);
	sm.addAttribute(attr13, rel1);
	sm.addRelation(rel2);
	sm.addAttribute(attr21, rel2);
	sm.addAttribute(attr22, rel2);
	sm.addAttribute(attr23, rel2);
	
	assert.deepEqual(sm.matchingAttributes(rel1, rel2), 1, "Matching attributes successful. #1");
	
	rel1 = "R3";
	attr11 = "Att1";
	attr12 = "S.Att2";
	attr13 = "T.Att3";
	rel2 = "R4";
	attr21 = "Att2";
	attr22 = "P.Att1";
	attr23 = "Q.Att3";
	
	sm.addRelation(rel1);
	sm.addAttribute(attr11, rel1);
	sm.addAttribute(attr12, rel1);
	sm.addAttribute(attr13, rel1);
	sm.addRelation(rel2);
	sm.addAttribute(attr21, rel2);
	sm.addAttribute(attr22, rel2);
	sm.addAttribute(attr23, rel2);
	
	assert.deepEqual(sm.matchingAttributes(rel1, rel2), 2, "Matching attributes successful. #2");
	
	rel1 = "R5";
	attr11 = "Att1";
	attr12 = "Att2";
	attr13 = "Att3";
	rel2 = "R6";
	attr21 = "Att4";
	attr22 = "Att5";
	attr23 = "Att6";
	
	sm.addRelation(rel1);
	sm.addAttribute(attr11, rel1);
	sm.addAttribute(attr12, rel1);
	sm.addAttribute(attr13, rel1);
	sm.addRelation(rel2);
	sm.addAttribute(attr21, rel2);
	sm.addAttribute(attr22, rel2);
	sm.addAttribute(attr23, rel2);
	
	assert.deepEqual(sm.matchingAttributes(rel1, rel2), 0, "Matching attributes successful. #3");
	
	rel1 = "R7";
	attr11 = "Att1";
	attr12 = "Att2";
	attr13 = "Att3";
	rel2 = "R8";
	attr21 = "R.Att1";
	attr22 = "S.Att1";
	attr23 = "Att6";
	
	sm.addRelation(rel1);
	sm.addAttribute(attr11, rel1);
	sm.addAttribute(attr12, rel1);
	sm.addAttribute(attr13, rel1);
	sm.addRelation(rel2);
	sm.addAttribute(attr21, rel2);
	sm.addAttribute(attr22, rel2);
	sm.addAttribute(attr23, rel2);

	assert.deepEqual(sm.matchingAttributes(rel1, rel2), -1, "Matching attributes successful. #4");
	assert.deepEqual(sm.matchingAttributes(rel2, rel1), -1, "Matching attributes successful. #5");
});

//**********************************************

//***		Parsing 	***
QUnit.module("A4. Parsing");
QUnit.test("parser accessible", function (assert) {
	var p = new Parser();
	assert.ok(p instanceof Parser, "Parser object is created.");	
});

QUnit.test("relation", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	sm.addRelation("R1");
	sm.addAttribute("a", "R1");
	assert.deepEqual(p.parse("R1"), { name: "_X0", source: { cmd: "COPY", relation: "R1"}}, "Parsing stand-alone relation.");
	assert.deepEqual(sm.existsAttribute("a", "_X0"), true, "Attribute is accessible. #1");
	assert.deepEqual(sm.existsAttribute("R1.a", "_X0"), true, "Attribute is accessible. #2");
});

QUnit.test("relation (error test)", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	assert.throws(function() { p.parse("R1"); }, new RASNotDefinedError("R1", i18n.relation[lang]), "Parsing non-defined relation yields an error.");
});

QUnit.test("relation (error test for keywords)", function (assert) {
	var p = new Parser();
	var keywords = ['PI', 'SIGMA', 'RO', 'TJ', 'DELTA', 'TAU', 'GAMMA', 'AVG', 'COUNT', 'SUM', 'MIN', 'MAX'];
	var keyword;
	var result;
	
	for (keyword in keywords) {
		assert.throws(function() { p.parse(keywords[keyword]); }, "Parsing a reserved keyword as a relation yields an error.");	
	}
});

QUnit.test("union", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a2", "R1");
	sm.addRelation("R2");
	sm.addAttribute("a1", "R2");
	sm.addAttribute("a2", "R2");
	
	r = p.parse("R1+R2");

	assert.deepEqual(r.name, "_X2", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "UNION", "Command is recognized.");
	assert.deepEqual(r.source.relations[0].name, "_X0", "Source relation #1 name is correct.");
	assert.deepEqual(r.source.relations[0].parent, r, "Source relation #1 parent pointer is correct.");
	assert.deepEqual(r.source.relations[0].source, { cmd: "COPY", relation: "R1"}, "Source relation #1 source is correct.");
	assert.deepEqual(r.source.relations[1].name, "_X1", "Source relation #2 name is correct.");
	assert.deepEqual(r.source.relations[1].parent, r, "Source relation #2 parent pointer is correct.");
	assert.deepEqual(r.source.relations[1].source, { cmd: "COPY", relation: "R2"}, "Source relation #2 source is correct.");
	assert.deepEqual(sm.existsRelation("_X2"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X2"), false, "Attribute from source relation #1 is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a2","_X2"), false, "Attribute from source relation #2 is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R2.a1","_X2"), false, "Attribute from source relation #2 is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R2.a2","_X2"), false, "Attribute from source relation #2 is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X2"), true, "Attribute from source relation #1 is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a2","_X2"), true, "Attribute from source relation #2 is accessible (relative).");
});

QUnit.test("difference", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a2", "R1");
	sm.addRelation("R2");
	sm.addAttribute("a1", "R2");
	sm.addAttribute("a2", "R2");
	
	r = p.parse("R1-R2");

	assert.deepEqual(r.name, "_X2", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "DIFFERENCE", "Command is recognized.");
	assert.deepEqual(r.source.relations[0].name, "_X0", "Source relation #1 name is correct.");
	assert.deepEqual(r.source.relations[0].parent, r, "Source relation #1 parent pointer is correct.");
	assert.deepEqual(r.source.relations[0].source, { cmd: "COPY", relation: "R1"}, "Source relation #1 source is correct.");
	assert.deepEqual(r.source.relations[1].name, "_X1", "Source relation #2 name is correct.");
	assert.deepEqual(r.source.relations[1].parent, r, "Source relation #2 parent pointer is correct.");
	assert.deepEqual(r.source.relations[1].source, { cmd: "COPY", relation: "R2"}, "Source relation #2 source is correct.");
	assert.deepEqual(sm.existsRelation("_X2"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X2"), false, "Attribute from source relation #1 is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a2","_X2"), false, "Attribute from source relation #2 is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R2.a1","_X2"), false, "Attribute from source relation #2 is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R2.a2","_X2"), false, "Attribute from source relation #2 is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X2"), true, "Attribute from source relation #1 is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a2","_X2"), true, "Attribute from source relation #2 is accessible (relative).");
});

QUnit.test("intersection", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a2", "R1");
	sm.addRelation("R2");
	sm.addAttribute("a1", "R2");
	sm.addAttribute("a2", "R2");
	
	r = p.parse("R1*R2");
	assert.deepEqual(r.name, "_X2", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "INTERSECTION", "Command is recognized.");
	assert.deepEqual(r.source.relations[0].name, "_X0", "Source relation #1 name is correct.");
	assert.deepEqual(r.source.relations[0].parent, r, "Source relation #1 parent pointer is correct.");
	assert.deepEqual(r.source.relations[0].source, { cmd: "COPY", relation: "R1"}, "Source relation #1 source is correct.");
	assert.deepEqual(r.source.relations[1].name, "_X1", "Source relation #2 name is correct.");
	assert.deepEqual(r.source.relations[1].parent, r, "Source relation #2 parent pointer is correct.");
	assert.deepEqual(r.source.relations[1].source, { cmd: "COPY", relation: "R2"}, "Source relation #2 source is correct.");
	assert.deepEqual(sm.existsRelation("_X2"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X2"), false, "Attribute from source relation #1 is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a2","_X2"), false, "Attribute from source relation #2 is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R2.a1","_X2"), false, "Attribute from source relation #2 is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R2.a2","_X2"), false, "Attribute from source relation #2 is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X2"), true, "Attribute from source relation #1 is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a2","_X2"), true, "Attribute from source relation #2 is accessible (relative).");
});

QUnit.test("crossproduct", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addRelation("R2");
	sm.addAttribute("a2", "R2");
	
	r = p.parse("R1×R2");
	assert.deepEqual(r.name, "_X2", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "CROSSPRODUCT", "Command is recognized.");
	assert.deepEqual(r.source.relations[0].name, "_X0", "Source relation #1 name is correct.");
	assert.deepEqual(r.source.relations[0].parent, r, "Source relation #1 parent pointer is correct.");
	assert.deepEqual(r.source.relations[0].source, { cmd: "COPY", relation: "R1"}, "Source relation #1 source is correct.");
	assert.deepEqual(r.source.relations[1].name, "_X1", "Source relation #2 name is correct.");
	assert.deepEqual(r.source.relations[1].parent, r, "Source relation #2 parent pointer is correct.");
	assert.deepEqual(r.source.relations[1].source, { cmd: "COPY", relation: "R2"}, "Source relation #2 source is correct.");
	assert.deepEqual(sm.existsRelation("_X2"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X2"), true, "Attribute from source relation #1 is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R2.a2","_X2"), true, "Attribute from source relation #2 is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X2"), true, "Attribute from source relation #1 is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a2","_X2"), true, "Attribute from source relation #2 is accessible (relative).");
});

QUnit.test("division", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a2", "R1");
	sm.addRelation("R2");
	sm.addAttribute("a2", "R2");
	
	r = p.parse("R1÷R2");
	assert.deepEqual(r.name, "_X2", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "DIVISION", "Command is recognized.");
	assert.deepEqual(r.source.relations[0].name, "_X0", "Source relation #1 name is correct.");
	assert.deepEqual(r.source.relations[0].parent, r,"Source relation #1 parent pointer is correct.");
	assert.deepEqual(r.source.relations[0].source, { cmd: "COPY", relation: "R1"}, "Source relation #1 source is correct.");
	assert.deepEqual(r.source.relations[1].name, "_X1", "Source relation #2 name is correct.");
	assert.deepEqual(r.source.relations[1].parent, r, "Source relation #2 parent pointer is correct.");
	assert.deepEqual(r.source.relations[1].source, { cmd: "COPY", relation: "R2"}, "Source relation #2 source is correct.");
	assert.deepEqual(sm.existsRelation("_X2"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X2"), true, "Attribute from source relation #1 is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a2","_X2"), false, "Attribute from source relation #2 is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X2"), true, "Attribute from source relation #1 is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a2","_X2"), false, "Attribute from source relation #2 is not accessible (relative).");
});

QUnit.test("natural join", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a", "R1");
	sm.addRelation("R2");
	sm.addAttribute("a2", "R2");
	sm.addAttribute("a", "R2");
	
	r = p.parse("R1@R2");
	assert.deepEqual(r.name, "_X2", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "NATURAL_JOIN", "Command is recognized.");
	assert.deepEqual(r.source.relations[0].name, "_X0", "Source relation #1 name is correct.");
	assert.deepEqual(r.source.relations[0].parent, r,"Source relation #1 parent pointer is correct.");
	assert.deepEqual(r.source.relations[0].source, { cmd: "COPY", relation: "R1"}, "Source relation #1 source is correct.");
	assert.deepEqual(r.source.relations[1].name, "_X1", "Source relation #2 name is correct.");
	assert.deepEqual(r.source.relations[1].parent, r, "Source relation #2 parent pointer is correct.");
	assert.deepEqual(r.source.relations[1].source, { cmd: "COPY", relation: "R2"}, "Source relation #2 source is correct.");
	assert.deepEqual(sm.existsRelation("_X2"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X2"), true, "Attribute from source relation #1 is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R2.a2","_X2"), true, "Attribute from source relation #2 is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X2"), true, "Attribute from source relation #1 is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a2","_X2"), true, "Attribute from source relation #2 is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a","_X2"), true, "Common attribute is accessible as 'a'.");
	assert.deepEqual(sm.existsAttribute("R1.a","_X2"), false, "Common attribute is not accessible as 'R1.a'.");
	assert.deepEqual(sm.existsAttribute("R2.a","_X2"), false, "Common attribute is not accessible as 'R2.a'.");
	assert.deepEqual(sm.existsAttribute("_X2.a","_X2"), true, "Common attribute is accessible as '_X2.a'.");
});

QUnit.test("leftsemijoin", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a", "R1");
	sm.addRelation("R2");
	sm.addAttribute("a2", "R2");
	sm.addAttribute("a", "R2");
	
	r = p.parse("R1$@R2");
	assert.deepEqual(r.name, "_X2", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "LEFT_SEMI_JOIN", "Command is recognized.");
	assert.deepEqual(r.source.relations[0].name, "_X0", "Source relation #1 name is correct.");
	assert.deepEqual(r.source.relations[0].parent, r,"Source relation #1 parent pointer is correct.");
	assert.deepEqual(r.source.relations[0].source, { cmd: "COPY", relation: "R1"}, "Source relation #1 source is correct.");
	assert.deepEqual(r.source.relations[1].name, "_X1", "Source relation #2 name is correct.");
	assert.deepEqual(r.source.relations[1].parent, r, "Source relation #2 parent pointer is correct.");
	assert.deepEqual(r.source.relations[1].source, { cmd: "COPY", relation: "R2"}, "Source relation #2 source is correct.");
	assert.deepEqual(sm.existsRelation("_X2"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X2"), true, "Attribute from source relation #1 is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R2.a2","_X2"), false, "Attribute from source relation #2 is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X2"), true, "Attribute from source relation #1 is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a2","_X2"), false, "Attribute from source relation #2 is not accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a","_X2"), true, "Common attribute is accessible as 'a'.");
	assert.deepEqual(sm.existsAttribute("R1.a","_X2"), true, "Common attribute is accessible as 'R1.a'.");
	assert.deepEqual(sm.existsAttribute("R2.a","_X2"), false, "Common attribute is not accessible as 'R2.a'.");
	assert.deepEqual(sm.existsAttribute("_X2.a","_X2"), false, "Common attribute is not accessible as '_X2.a'.");
});

QUnit.test("rightsemijoin", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a", "R1");
	sm.addRelation("R2");
	sm.addAttribute("a2", "R2");
	sm.addAttribute("a", "R2");
	
	r = p.parse("R1@$R2");
	assert.deepEqual(r.name, "_X2", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "RIGHT_SEMI_JOIN", "Command is recognized.");
	assert.deepEqual(r.source.relations[0].name, "_X0", "Source relation #1 name is correct.");
	assert.deepEqual(r.source.relations[0].parent, r,"Source relation #1 parent pointer is correct.");
	assert.deepEqual(r.source.relations[0].source, { cmd: "COPY", relation: "R1"}, "Source relation #1 source is correct.");
	assert.deepEqual(r.source.relations[1].name, "_X1", "Source relation #2 name is correct.");
	assert.deepEqual(r.source.relations[1].parent, r, "Source relation #2 parent pointer is correct.");
	assert.deepEqual(r.source.relations[1].source, { cmd: "COPY", relation: "R2"}, "Source relation #2 source is correct.");
	assert.deepEqual(sm.existsRelation("_X2"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X2"), false, "Attribute from source relation #1 is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R2.a2","_X2"), true, "Attribute from source relation #2 is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X2"), false, "Attribute from source relation #1 is not accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a2","_X2"), true, "Attribute from source relation #2 is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a","_X2"), true, "Common attribute is accessible as 'a'.");
	assert.deepEqual(sm.existsAttribute("R1.a","_X2"), false, "Common attribute is not accessible as 'R1.a'.");
	assert.deepEqual(sm.existsAttribute("R2.a","_X2"), true, "Common attribute is accessible as 'R2.a'.");
	assert.deepEqual(sm.existsAttribute("_X2.a","_X2"), false, "Common attribute is not accessible as '_X2.a'.");
});

QUnit.test("antijoin", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a", "R1");
	sm.addRelation("R2");
	sm.addAttribute("a2", "R2");
	sm.addAttribute("a", "R2");
	
	r = p.parse("R1!@R2");
	assert.deepEqual(r.name, "_X2", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "ANTI_JOIN", "Command is recognized.");
	assert.deepEqual(r.source.relations[0].name, "_X0", "Source relation #1 name is correct.");
	assert.deepEqual(r.source.relations[0].parent, r,"Source relation #1 parent pointer is correct.");
	assert.deepEqual(r.source.relations[0].source, { cmd: "COPY", relation: "R1"}, "Source relation #1 source is correct.");
	assert.deepEqual(r.source.relations[1].name, "_X1", "Source relation #2 name is correct.");
	assert.deepEqual(r.source.relations[1].parent, r, "Source relation #2 parent pointer is correct.");
	assert.deepEqual(r.source.relations[1].source, { cmd: "COPY", relation: "R2"}, "Source relation #2 source is correct.");
	assert.deepEqual(sm.existsRelation("_X2"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X2"), true, "Attribute from source relation #1 is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R2.a2","_X2"), false, "Attribute from source relation #2 is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X2"), true, "Attribute from source relation #1 is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a2","_X2"), false, "Attribute from source relation #2 is not accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a","_X2"), true, "Common attribute is accessible as 'a'.");
	assert.deepEqual(sm.existsAttribute("R1.a","_X2"), true, "Common attribute is accessible as 'R1.a'.");
	assert.deepEqual(sm.existsAttribute("R2.a","_X2"), false, "Common attribute is not accessible as 'R2.a'.");
	assert.deepEqual(sm.existsAttribute("_X2.a","_X2"), false, "Common attribute is not accessible as '_X2.a'.");
});
QUnit.test("left outer join", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a", "R1");
	sm.addRelation("R2");
	sm.addAttribute("a2", "R2");
	sm.addAttribute("a", "R2");
	
	r = p.parse("R1&@R2");
	assert.deepEqual(r.name, "_X2", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "LEFT_OUTER_JOIN", "Command is recognized.");
	assert.deepEqual(r.source.relations[0].name, "_X0", "Source relation #1 name is correct.");
	assert.deepEqual(r.source.relations[0].parent, r,"Source relation #1 parent pointer is correct.");
	assert.deepEqual(r.source.relations[0].source, { cmd: "COPY", relation: "R1"}, "Source relation #1 source is correct.");
	assert.deepEqual(r.source.relations[1].name, "_X1", "Source relation #2 name is correct.");
	assert.deepEqual(r.source.relations[1].parent, r, "Source relation #2 parent pointer is correct.");
	assert.deepEqual(r.source.relations[1].source, { cmd: "COPY", relation: "R2"}, "Source relation #2 source is correct.");
	assert.deepEqual(sm.existsRelation("_X2"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X2"), true, "Attribute from source relation #1 is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R2.a2","_X2"), true, "Attribute from source relation #2 is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X2"), true, "Attribute from source relation #1 is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a2","_X2"), true, "Attribute from source relation #2 is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a","_X2"), true, "Common attribute is accessible as 'a'.");
	assert.deepEqual(sm.existsAttribute("R1.a","_X2"), false, "Common attribute is not accessible as 'R1.a'.");
	assert.deepEqual(sm.existsAttribute("R2.a","_X2"), false, "Common attribute is not accessible as 'R2.a'.");
	assert.deepEqual(sm.existsAttribute("_X2.a","_X2"), true, "Common attribute is accessible as '_X2.a'.");
});

QUnit.test("right outer join", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a", "R1");
	sm.addRelation("R2");
	sm.addAttribute("a2", "R2");
	sm.addAttribute("a", "R2");
	
	r = p.parse("R1@&R2");
	assert.deepEqual(r.name, "_X2", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "RIGHT_OUTER_JOIN", "Command is recognized.");
	assert.deepEqual(r.source.relations[0].name, "_X0", "Source relation #1 name is correct.");
	assert.deepEqual(r.source.relations[0].parent, r,"Source relation #1 parent pointer is correct.");
	assert.deepEqual(r.source.relations[0].source, { cmd: "COPY", relation: "R1"}, "Source relation #1 source is correct.");
	assert.deepEqual(r.source.relations[1].name, "_X1", "Source relation #2 name is correct.");
	assert.deepEqual(r.source.relations[1].parent, r, "Source relation #2 parent pointer is correct.");
	assert.deepEqual(r.source.relations[1].source, { cmd: "COPY", relation: "R2"}, "Source relation #2 source is correct.");
	assert.deepEqual(sm.existsRelation("_X2"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X2"), true, "Attribute from source relation #1 is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R2.a2","_X2"), true, "Attribute from source relation #2 is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X2"), true, "Attribute from source relation #1 is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a2","_X2"), true, "Attribute from source relation #2 is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a","_X2"), true, "Common attribute is accessible as 'a'.");
	assert.deepEqual(sm.existsAttribute("R1.a","_X2"), false, "Common attribute is not accessible as 'R1.a'.");
	assert.deepEqual(sm.existsAttribute("R2.a","_X2"), false, "Common attribute is not accessible as 'R2.a'.");
	assert.deepEqual(sm.existsAttribute("_X2.a","_X2"), true, "Common attribute is accessible as '_X2.a'.");
});

QUnit.test("full outer join", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a", "R1");
	sm.addRelation("R2");
	sm.addAttribute("a2", "R2");
	sm.addAttribute("a", "R2");
	
	r = p.parse("R1@@R2");
	assert.deepEqual(r.name, "_X2", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "FULL_OUTER_JOIN", "Command is recognized.");
	assert.deepEqual(r.source.relations[0].name, "_X0", "Source relation #1 name is correct.");
	assert.deepEqual(r.source.relations[0].parent, r,"Source relation #1 parent pointer is correct.");
	assert.deepEqual(r.source.relations[0].source, { cmd: "COPY", relation: "R1"}, "Source relation #1 source is correct.");
	assert.deepEqual(r.source.relations[1].name, "_X1", "Source relation #2 name is correct.");
	assert.deepEqual(r.source.relations[1].parent, r, "Source relation #2 parent pointer is correct.");
	assert.deepEqual(r.source.relations[1].source, { cmd: "COPY", relation: "R2"}, "Source relation #2 source is correct.");
	assert.deepEqual(sm.existsRelation("_X2"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X2"), true, "Attribute from source relation #1 is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R2.a2","_X2"), true, "Attribute from source relation #2 is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X2"), true, "Attribute from source relation #1 is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a2","_X2"), true, "Attribute from source relation #2 is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a","_X2"), true, "Common attribute is accessible as 'a'.");
	assert.deepEqual(sm.existsAttribute("R1.a","_X2"), false, "Common attribute is not accessible as 'R1.a'.");
	assert.deepEqual(sm.existsAttribute("R2.a","_X2"), false, "Common attribute is not accessible as 'R2.a'.");
	assert.deepEqual(sm.existsAttribute("_X2.a","_X2"), true, "Common attribute is accessible as '_X2.a'.");
});

QUnit.test("theta join", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a", "R1");
	sm.addRelation("R2");
	sm.addAttribute("a2", "R2");
	sm.addAttribute("a", "R2");
	
	r = p.parse("THETA(a1==a2;R1,R2)");
	assert.deepEqual(r.name, "_X2", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "THETA_JOIN", "Command is recognized.");
	assert.deepEqual(r.source.parameter, {esc:"%a1%==%a2%", cols:["a1","a2"]}, "Parameter is parsed.");
	assert.deepEqual(r.source.relations[0].name, "_X0", "Source relation #1 name is correct.");
	assert.deepEqual(r.source.relations[0].parent, r,"Source relation #1 parent pointer is correct.");
	assert.deepEqual(r.source.relations[0].source, { cmd: "COPY", relation: "R1"}, "Source relation #1 source is correct.");
	assert.deepEqual(r.source.relations[1].name, "_X1", "Source relation #2 name is correct.");
	assert.deepEqual(r.source.relations[1].parent, r, "Source relation #2 parent pointer is correct.");
	assert.deepEqual(r.source.relations[1].source, { cmd: "COPY", relation: "R2"}, "Source relation #2 source is correct.");
	assert.deepEqual(sm.existsRelation("_X2"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X2"), true, "Attribute from source relation #1 is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R2.a2","_X2"), true, "Attribute from source relation #2 is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X2"), true, "Attribute from source relation #1 is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a2","_X2"), true, "Attribute from source relation #2 is accessible (relative).");
	assert.throws(function() { sm.existsAttribute("a","_X2"); }, new RASAmbiguousError('a', i18n.attribute[lang]), "Common attribute is ambiguous as 'a'.");
	assert.deepEqual(sm.existsAttribute("R1.a","_X2"), true, "Common attribute is accessible as 'R1.a'.");
	assert.deepEqual(sm.existsAttribute("R2.a","_X2"), true, "Common attribute is accessible as 'R2.a'.");
	assert.deepEqual(sm.existsAttribute("_X2.a","_X2"), false, "Common attribute is not accessible as '_X2.a'.");
});

QUnit.test("projection simple", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a2", "R1");
	sm.addAttribute("a3", "R1");
	sm.addAttribute("a4", "R1");
	
	r = p.parse("PI(a1,a3;R1)");
	assert.deepEqual(r.name, "_X1", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "PROJECTION", "Command is recognized.");
	assert.deepEqual(r.source.relation.name, "_X0", "Source relation name is correct.");
	assert.deepEqual(r.source.relation.parent, r, "Source relation's parent pointer is correct.");
	assert.deepEqual(r.source.relation.source, { cmd: "COPY", relation: "R1"}, "Source relation's source is correct.");
	assert.deepEqual(sm.existsRelation("_X1"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X1"), true, "Projected attribute 'R1.a1' from source relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a3","_X1"), true, "Projected attribute 'R1.a3' from source relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X1"), true, "Projected attribute 'a1' from source relation is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a3","_X1"), true, "Projected attribute 'a3' from source relation is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("R1.a2","_X1"), false, "Non-projected attribute 'R1.a2' from source relation is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a4","_X1"), false, "Non-projected attribute 'R1.a4' from source relation is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a2","_X1"), false, "Non-projected attribute 'a2' from source relation is not accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a4","_X1"), false, "Non-projected attribute 'a4' from source relation is not accessible (relative).");
});

QUnit.test("projection extended", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a2", "R1");
	sm.addAttribute("a3", "R1");
	sm.addAttribute("a4", "R1");
	
	r = p.parse("PI(a1+a3->b;R1)");
	assert.deepEqual(r.name, "_X1", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "PROJECTION", "Command is recognized.");
	assert.deepEqual(r.source.relation.name, "_X0", "Source relation name is correct.");
	assert.deepEqual(r.source.relation.parent, r, "Source relation's parent pointer is correct.");
	assert.deepEqual(r.source.relation.source, { cmd: "COPY", relation: "R1"}, "Source relation's source is correct.");
	assert.deepEqual(sm.existsRelation("_X1"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X1"), false, "Non-projected attribute 'R1.a1' from source relation is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a3","_X1"), false, "Non-projected attribute 'R1.a3' from source relation is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X1"), false, "Non-projected attribute 'a1' from source relation is not accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a3","_X1"), false, "Non-projected attribute 'a3' from source relation is not accessible (relative).");
	assert.deepEqual(sm.existsAttribute("R1.a2","_X1"), false, "Non-projected attribute 'R1.a2' from source relation is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a4","_X1"), false, "Non-projected attribute 'R1.a4' from source relation is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a2","_X1"), false, "Non-projected attribute 'a2' from source relation is not accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a4","_X1"), false, "Non-projected attribute 'a4' from source relation is not accessible (relative).");
	assert.deepEqual(sm.existsAttribute("R1.b","_X1"), false, "Renamed attribute 'R1.b' from source relation is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("b","_X1"), true, "Renamed attribute 'b' from source relation is accessible (relative).");
	
});

QUnit.test("groupby without rename", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a2", "R1");
	sm.addAttribute("a3", "R1");
	sm.addAttribute("a4", "R1");
	
	r = p.parse("GAMMA(a1, MAX(a3);R1)");
	assert.deepEqual(r.name, "_X1", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "GROUPBY", "Command is recognized.");
	assert.deepEqual(r.source.relation.name, "_X0", "Source relation name is correct.");
	assert.deepEqual(r.source.relation.parent, r, "Source relation's parent pointer is correct.");
	assert.deepEqual(r.source.relation.source, { cmd: "COPY", relation: "R1"}, "Source relation's source is correct.");
	assert.deepEqual(sm.existsRelation("_X1"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X1"), true, "Groupby attribute 'R1.a1' from source relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a3","_X1"), false, "Non-projected attribute 'R1.a3' from source relation is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X1"), true, "Groupby attribute 'a1' from source relation is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a3","_X1"), false, "Non-projected attribute 'a3' from source relation is not accessible (relative).");
	assert.deepEqual(sm.existsAttribute("R1.a2","_X1"), false, "Non-projected attribute 'R1.a2' from source relation is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a4","_X1"), false, "Non-projected attribute 'R1.a4' from source relation is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a2","_X1"), false, "Projected attribute 'a2' from source relation is not accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a4","_X1"), false, "Projected attribute 'a4' from source relation is not accessible (relative).");
	assert.deepEqual(sm.existsAttribute("R1.MAX(a3)","_X1"), false, "Calculated attribute 'R1.MAXa3' from source relation is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("MAX(a3)","_X1"), true, "Calculated attribute 'MAXa3' from source relation is accessible (relative).");
});

QUnit.test("groupby with rename", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a2", "R1");
	sm.addAttribute("a3", "R1");
	sm.addAttribute("a4", "R1");
	
	r = p.parse("GAMMA(a1, MAX(a3)->b;R1)");
	assert.deepEqual(r.name, "_X1", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "GROUPBY", "Command is recognized.");
	assert.deepEqual(r.source.relation.name, "_X0", "Source relation name is correct.");
	assert.deepEqual(r.source.relation.parent, r, "Source relation's parent pointer is correct.");
	assert.deepEqual(r.source.relation.source, { cmd: "COPY", relation: "R1"}, "Source relation's source is correct.");
	assert.deepEqual(sm.existsRelation("_X1"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X1"), true, "Groupby attribute 'R1.a1' from source relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a3","_X1"), false, "Non-projected attribute 'R1.a3' from source relation is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X1"), true, "Groupby attribute 'a1' from source relation is not accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a3","_X1"), false, "Non-projected attribute 'a3' from source relation is not accessible (relative).");
	assert.deepEqual(sm.existsAttribute("R1.a2","_X1"), false, "Non-projected attribute 'R1.a2' from source relation is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a4","_X1"), false, "Non-projected attribute 'R1.a4' from source relation is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a2","_X1"), false, "Projected attribute 'a2' from source relation is not accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a4","_X1"), false, "Projected attribute 'a4' from source relation is not accessible (relative).");
	assert.deepEqual(sm.existsAttribute("R1.b","_X1"), false, "Renamed attribute 'R1.b' from source relation is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("b","_X1"), true, "Renamed attribute 'b' from source relation is accessible (relative).");
});

QUnit.test("selection", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a2", "R1");
	sm.addAttribute("a3", "R1");
	sm.addAttribute("a4", "R1");
	
	r = p.parse("SIGMA(a1==5&&a3==6;R1)");
	assert.deepEqual(r.name, "_X1", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "SELECTION", "Command is recognized.");
	assert.deepEqual(r.source.parameter, {esc:"%a1%==5&&%a3%==6", cols:["a1","a3"]}, "Parameter is parsed.");
	assert.deepEqual(r.source.relation.name, "_X0", "Source relation name is correct.");
	assert.deepEqual(r.source.relation.parent, r, "Source relation's parent pointer is correct.");
	assert.deepEqual(r.source.relation.source, { cmd: "COPY", relation: "R1"}, "Source relation's source is correct.");
	assert.deepEqual(sm.existsRelation("_X1"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X1"), true, "Original attribute 'R1.a1' from source relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a2","_X1"), true, "Original attribute 'R1.a2' from source relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a3","_X1"), true, "Original attribute 'R1.a3' from source relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a4","_X1"), true, "Original attribute 'R1.a4' from source relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X1"), true, "Original attribute 'a1' from source relation is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a2","_X1"), true, "Original attribute 'a2' from source relation is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a3","_X1"), true, "Original attribute 'a3' from source relation is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a4","_X1"), true, "Original attribute 'a4' from source relation is accessible (relative).");
});

QUnit.test("sort", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a2", "R1");
	sm.addAttribute("a3", "R1");
	sm.addAttribute("a4", "R1");
	
	r = p.parse("TAU(a1,R1.a3;R1)");
	assert.deepEqual(r.name, "_X1", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "SORT", "Command is recognized.");
	assert.deepEqual(r.source.parameter, {a1: {name:"a1", esc:"%a1%", cols:["a1"], isRelative: true}, "R1.a3": {name:"R1.a3", esc:"%R1.a3%", cols:["R1.a3"], isAbsolute: true}}, "Parameter is parsed.");
	assert.deepEqual(r.source.relation.name, "_X0", "Source relation name is correct.");
	assert.deepEqual(r.source.relation.parent, r, "Source relation's parent pointer is correct.");
	assert.deepEqual(r.source.relation.source, { cmd: "COPY", relation: "R1"}, "Source relation's source is correct.");
	assert.deepEqual(sm.existsRelation("_X1"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X1"), true, "Original attribute 'R1.a1' from source relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a2","_X1"), true, "Original attribute 'R1.a2' from source relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a3","_X1"), true, "Original attribute 'R1.a3' from source relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a4","_X1"), true, "Original attribute 'R1.a4' from source relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X1"), true, "Original attribute 'a1' from source relation is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a2","_X1"), true, "Original attribute 'a2' from source relation is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a3","_X1"), true, "Original attribute 'a3' from source relation is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a4","_X1"), true, "Original attribute 'a4' from source relation is accessible (relative).");
});

QUnit.test("rename attributes", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a2", "R1");
	sm.addAttribute("a3", "R1");
	sm.addAttribute("a4", "R1");
	
	r = p.parse("RO(a1/b1,a3/b3;R1)");
	assert.deepEqual(r.name, "_X1", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "RENAME_ATTRIBUTES", "Command is recognized.");
	assert.deepEqual(r.source.parameter, {old:["a1","a3"], new:["b1","b3"]}, "Parameter is parsed.");
	assert.deepEqual(r.source.relation.name, "_X0", "Source relation name is correct.");
	assert.deepEqual(r.source.relation.parent, r, "Source relation's parent pointer is correct.");
	assert.deepEqual(r.source.relation.source, { cmd: "COPY", relation: "R1"}, "Source relation's source is correct.");
	assert.deepEqual(sm.existsRelation("_X1"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X1"), false, "Original attribute 'R1.a1' from source relation is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a2","_X1"), true, "Original attribute 'R1.a2' from source relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a3","_X1"), false, "Original attribute 'R1.a3' from source relation is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a4","_X1"), true, "Original attribute 'R1.a4' from source relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.b1","_X1"), false, "Renamed attribute with original relation name 'R1.b1' is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.b3","_X1"), false, "Renamed attribute with original relation name 'R1.b3' is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("_X0.b1","_X1"), true, "Renamed attribute with hidden relation name '_X1.b1' is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("_X0.b3","_X1"), true, "Renamed attribute with hidden relation name '_X1.b3' is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X1"), false, "Original attribute 'a1' from source relation is not accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a2","_X1"), true, "Original attribute 'a2' from source relation is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a3","_X1"), false, "Original attribute 'a3' from source relation is not accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a4","_X1"), true, "Original attribute 'a4' from source relation is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("b1","_X1"), true, "Renamed attribute 'b1' is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("b3","_X1"), true, "Renamed attribute 'b3' is accessible (relative).");
});

QUnit.test("rename relation", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a2", "R1");
	sm.addAttribute("a3", "R1");
	sm.addAttribute("a4", "R1");
	
	r = p.parse("RO(S1;R1)");
	assert.deepEqual(r.name, "_X1", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "RENAME_RELATION", "Command is recognized.");
	assert.deepEqual(r.source.parameter, "S1", "Parameter is parsed.");
	assert.deepEqual(r.source.relation.name, "_X0", "Source relation name is correct.");
	assert.deepEqual(r.source.relation.parent, r, "Source relation's parent pointer is correct.");
	assert.deepEqual(r.source.relation.source, { cmd: "COPY", relation: "R1"}, "Source relation's source is correct.");
	assert.deepEqual(sm.existsRelation("_X1"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X1"), false, "Original attribute 'R1.a1' is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a2","_X1"), false, "Original attribute 'R1.a2' is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a3","_X1"), false, "Original attribute 'R1.a3' is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a4","_X1"), false, "Original attribute 'R1.a4' is not accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("S1.a1","_X1"), true, "Original attribute 'S1.a1' from renamed relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("S1.a2","_X1"), true, "Original attribute 'S1.a2' from renamed relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("S1.a3","_X1"), true, "Original attribute 'S1.a3' from renamed relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("S1.a4","_X1"), true, "Original attribute 'S1.a4' from renamed relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X1"), true, "Original attribute 'a1' is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a2","_X1"), true, "Original attribute 'a2' is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a3","_X1"), true, "Original attribute 'a3' is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a4","_X1"), true, "Original attribute 'a4' is accessible (relative).");
});

QUnit.test("distinct", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a2", "R1");
	sm.addAttribute("a3", "R1");
	sm.addAttribute("a4", "R1");
	
	r = p.parse("DELTA(R1)");
	assert.deepEqual(r.name, "_X1", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "DISTINCT", "Command is recognized.");
	assert.deepEqual(r.source.parameter, undefined, "No parameter is parsed.");
	assert.deepEqual(r.source.relation.name, "_X0", "Source relation name is correct.");
	assert.deepEqual(r.source.relation.parent, r, "Source relation's parent pointer is correct.");
	assert.deepEqual(r.source.relation.source, { cmd: "COPY", relation: "R1"}, "Source relation's source is correct.");
	assert.deepEqual(sm.existsRelation("_X1"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X1"), true, "Original attribute 'R1.a1' from source relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a2","_X1"), true, "Original attribute 'R1.a2' from source relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a3","_X1"), true, "Original attribute 'R1.a3' from source relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a4","_X1"), true, "Original attribute 'R1.a4' from source relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X1"), true, "Original attribute 'a1' from source relation is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a2","_X1"), true, "Original attribute 'a2' from source relation is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a3","_X1"), true, "Original attribute 'a3' from source relation is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a4","_X1"), true, "Original attribute 'a4' from source relation is accessible (relative).");
});

QUnit.test("copy | parsing relation", function (assert) {
	// practically the same as the test "relation"
	var sm = getSymbolManager(true);
	var p = new Parser();
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addAttribute("a2", "R1");
	
	r = p.parse("R1");
	assert.deepEqual(r.name, "_X0", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "COPY", "Command is recognized.");
	assert.deepEqual(r.source.parameter, undefined, "No parameter is parsed.");
	assert.deepEqual(r.source.relation, "R1", "Source relation name is correct.");	
	assert.deepEqual(sm.existsRelation("_X0"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X0"), true, "Original attribute 'R1.a1' from source relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R1.a2","_X0"), true, "Original attribute 'R1.a2' from source relation is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X0"), true, "Original attribute 'a1' from source relation is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a2","_X0"), true, "Original attribute 'a2' from source relation is accessible (relative).");
});

QUnit.test("nested level 3 - crossproduct", function (assert) {
	var sm = getSymbolManager(true);
	var p = new Parser();
	var r;
	
	sm.addRelation("R1");
	sm.addAttribute("a1", "R1");
	sm.addRelation("R2");
	sm.addAttribute("a2", "R2");
	sm.addRelation("R3");
	sm.addAttribute("a3", "R3");
	
	r = p.parse("R1×R2×R3");
	assert.deepEqual(r.name, "_X4", "Result relation name is correct.");
	assert.deepEqual(r.source.cmd, "CROSSPRODUCT", "Command is recognized.");
	assert.deepEqual(r.source.relations[0].name, "_X2", "Source relation #1 name is correct.");
	assert.deepEqual(r.source.relations[0].parent, r, "Source relation #1 parent pointer is correct.");
	assert.deepEqual(r.source.relations[0].source.cmd, "CROSSPRODUCT", "Source relation #1 command is correct.");
	assert.deepEqual(r.source.relations[0].source.relations[0].name, "_X0", "Source relation #1#1 name is correct.");
	assert.deepEqual(r.source.relations[0].source.relations[0].parent, r.source.relations[0], "Source relation #1#1 parent pointer is correct.");
	assert.deepEqual(r.source.relations[0].source.relations[0].source, { cmd: "COPY", relation: "R1"}, "Source relation #1#1 source is correct.");
	assert.deepEqual(r.source.relations[0].source.relations[1].name, "_X1", "Source relation #1#2 name is correct.");
	assert.deepEqual(r.source.relations[0].source.relations[1].parent, r.source.relations[0], "Source relation #1#2 parent pointer is correct.");
	assert.deepEqual(r.source.relations[0].source.relations[1].source, { cmd: "COPY", relation: "R2"}, "Source relation #1#2 source is correct.");
	assert.deepEqual(r.source.relations[1].name, "_X3", "Source relation #2 name is correct.");
	assert.deepEqual(r.source.relations[1].parent, r, "Source relation #2 parent pointer is correct.");
	assert.deepEqual(r.source.relations[1].source, { cmd: "COPY", relation: "R3"}, "Source relation #2 source is correct.");
	assert.deepEqual(sm.existsRelation("_X4"), true, "Result relation exists.");
	assert.deepEqual(sm.existsAttribute("R1.a1","_X4"), true, "Attribute from source relation #1 is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R2.a2","_X4"), true, "Attribute from source relation #2 is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("R3.a3","_X4"), true, "Attribute from source relation #3 is accessible (absolute).");
	assert.deepEqual(sm.existsAttribute("a1","_X4"), true, "Attribute from source relation #1 is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a2","_X4"), true, "Attribute from source relation #2 is accessible (relative).");
	assert.deepEqual(sm.existsAttribute("a3","_X4"), true, "Attribute from source relation #3 is accessible (relative).");
});

//QUnit.test("relation (error test for missing symbols)", function (assert) {});

//***		Relation related tests 	***
QUnit.module("A5. Relation");

QUnit.test("constructor", function (assert) {
	var r = new Relation("R1");
	assert.ok(r instanceof Relation, "Relation object is created.");
});

QUnit.test("getName", function (assert) {
	var r = new Relation("R1");
	assert.deepEqual(r.getName(), "R1", "Relation name is correct.");
});

QUnit.test("setAttributes", function (assert) {
	var r = new Relation("R1");
	var atts = "att1;att2;att3";
	assert.deepEqual(r.setAttributes(atts), true, "Setting the attributes successfully.");
});

QUnit.test("getAttributes", function (assert) {
	var r = new Relation("R1");
	var atts = "att1;att2;att3";
	assert.deepEqual(r.setAttributes(atts), true, "Setting the attributes successfully.");
	assert.deepEqual(r.getAttributes(), ["R1.att1", "R1.att2", "R1.att3"], "Getting the attributes successfully.");
});

QUnit.test("setAttributes & getAttributes", function (assert) {
	var r = new Relation("R1");
	var s = new Relation("S1");
	var q = new Relation("Q1");
	var atts = "att1;att2;att3";
	assert.deepEqual(r.setAttributes(atts), true, "Setting the attributes successfully.");
	assert.deepEqual(s.setAttributes(r.getAttributes()), true, "Setting the attributes successfully.");
	assert.deepEqual(s.getAttributes(), ["R1.att1", "R1.att2", "R1.att3"], "Getting the attributes successfully.");
	
	atts = "R.att1;S.att2;P.att3";
	assert.deepEqual(q.setAttributes(atts), true, "Setting the attributes successfully.");
	assert.deepEqual(q.getAttributes(), ["R.att1", "S.att2", "P.att3"], "Getting the attributes successfully.");
});

QUnit.test("addRow", function (assert) {
	var r = new Relation("R1");
	var atts = "att1;att2;att3";
	var row = { att1: "data1", att2: "data2", att3: "data3" };
	r.setAttributes(atts);
	assert.deepEqual(r.addRow(row), true, "Adding the row successfully.");
});

QUnit.test("getRow", function (assert) {
	var r = new Relation("R1");
	var atts = "att1;att2;att3";
	var row = { att1: "data1", att2: "data2", att3: "data3" };
	r.setAttributes(atts);
	r.addRow(row);
	assert.deepEqual(r.getRow(0), { "R1.att1": "data1", "R1.att2": "data2", "R1.att3": "data3" }, "Getting the row successfully.");
});

QUnit.test("getRowCount", function (assert) {
	var r = new Relation("R1");
	var atts = "att1;att2;att3";
	var row = { att1: "data1", att2: "data2", att3: "data3" };
	assert.deepEqual(r.getRowCount(), 0, "Row count is 0 before adding any rows.");
	r.setAttributes(atts);
	r.addRow(row);
	assert.deepEqual(r.getRowCount(), 1, "Row count is 1 after adding one row.");
});

QUnit.test("setData", function (assert) {
	var r = new Relation("R1");
	var atts = "att1;att2;att3";
	var data = "data11;data12;data13\ndata21;data22;data23";
	r.setAttributes(atts);
	assert.deepEqual(r.getRowCount(), 0, "Row count is 0 before adding any rows.");
	assert.deepEqual(r.setData(data), true, "Setting the rows successfully.");
	assert.deepEqual(r.getRowCount(), 2, "Row count is 2 after adding two rows.");
	assert.deepEqual(r.getRow(0), { "R1.att1": "data11", "R1.att2": "data12", "R1.att3": "data13" }, "Getting the row #1 successfully.");
	assert.deepEqual(r.getRow(1), { "R1.att1": "data21", "R1.att2": "data22", "R1.att3": "data23" }, "Getting the row #2 successfully.");
	assert.deepEqual(r.getRow(2), undefined, "Row #3 is undefined.");
	
	r = new Relation("R2");
	r.setAttributes(atts);
	data = data.split("\n");
	assert.deepEqual(r.getRowCount(), 0, "Row count is 0 before adding any rows.");
	assert.deepEqual(r.setData(data), true, "Setting the rows successfully.");
	assert.deepEqual(r.getRowCount(), 2, "Row count is 2 after adding two rows.");
	assert.deepEqual(r.getRow(0), { "R2.att1": "data11", "R2.att2": "data12", "R2.att3": "data13" }, "Getting the row #1 successfully.");
	assert.deepEqual(r.getRow(1), { "R2.att1": "data21", "R2.att2": "data22", "R2.att3": "data23" }, "Getting the row #2 successfully.");
	assert.deepEqual(r.getRow(2), undefined, "Row #3 is undefined.");
});

QUnit.test("getData", function (assert) {
	var r = new Relation("R1");
	var atts = "att1;att2;att3";
	var data = "data11;data12;data13\ndata21;data22;data23";
	r.setAttributes(atts);
	r.setData(data), true, "Setting the rows successfully.";
	assert.deepEqual(r.getData(), data, "getData result is correct.");
});

QUnit.test("addRow #1 (relative - absolute test)", function (assert) {
	var r = new Relation("R2");
	var atts = "att1;R1.att2;att3";
	var row = { att1: "data11", att2: "data12", att3: "data13" };
	r.setAttributes(atts);
	assert.deepEqual(r.addRow(row), true, "Adding the row successfully.");
	assert.deepEqual(r.getRowCount(), 1, "Row count is 1 after adding one row.");
	assert.deepEqual(r.getRow(0), { "R2.att1": "data11", "R1.att2": "data12", "R2.att3": "data13" }, "Getting the row successfully.");
	
	row = { "R2.att1": "data21", att2: "data22", "R2.att3": "data23" };
	assert.deepEqual(r.addRow(row), true, "Adding the row successfully.");
	assert.deepEqual(r.getRowCount(), 2, "Row count is 1 after adding one row.");
	assert.deepEqual(r.getRow(1), { "R2.att1": "data21", "R1.att2": "data22", "R2.att3": "data23" }, "Getting the row successfully.");
});

QUnit.test("addRow #2 (relative - absolute test)", function (assert) {
	var r = new Relation("R1");
	var atts = "att1;att2;att3";
	var row = { "R.att1": "data11", "S.att2": "data12", "T.att3": "data13" };
	r.setAttributes(atts);
	assert.deepEqual(r.addRow(row), true, "Adding the row successfully.");
	assert.deepEqual(r.getRowCount(), 1, "Row count is 1 after adding one row.");
	assert.deepEqual(r.getRow(0), { "R1.att1": "data11", "R1.att2": "data12", "R1.att3": "data13" }, "Getting the row successfully.");
});

QUnit.test("addRow #3 (relative - absolute test)", function (assert) {
	var r = new Relation("R1");
	var atts = "P.att1;Q.att2;S.att3";
	var row = { att1: "data11", att2: "data12", att3: "data13" };
	r.setAttributes(atts);
	assert.deepEqual(r.addRow(row), true, "Adding the row successfully.");
	assert.deepEqual(r.getRowCount(), 1, "Row count is 1 after adding one row.");
	assert.deepEqual(r.getRow(0), { "P.att1": "data11", "Q.att2": "data12", "S.att3": "data13" }, "Getting the row successfully.");
});

QUnit.test("hasRow", function (assert) {
	var r = new Relation("R1");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: "data11", att2: "data12", att3: "data13" },
		{ att1: "data21", att2: "data22", att3: "data23" },
		{ att1: "data31", att2: "data32", att3: "data33" }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	assert.deepEqual(r.getRowCount(), 3, "3 rows added successfully.");
	assert.deepEqual(r.hasRow({ "R1.att1": "data21", "R1.att2": "data22", "R1.att3": "data23" }), true, "Existing row found.");
	assert.deepEqual(r.hasRow({ "R1.att1": "data21", att2: "data22", att3: "data23" }), true, "Existing row found.");
	assert.deepEqual(r.hasRow({ "R.att1": "data21", "S.att2": "data22", "P.att3": "data23" }), true, "Existing row found.");
	assert.deepEqual(r.hasRow({ att1: "data11", att2: "data12", att3: "data23" }), false, "Non-existing row not found.");
});

QUnit.test("row satisfies condition", function (assert) {
	var rows = [
		{ att1: "data11", att2: "12", att3: "13" },
		{ "R.att": "data", "S.att": "data", att1: "23" },
		{ "R.att": "data", att1: "data", att2: "23" },
		{ a: 2, b: 3, c: 10 }
	];
	assert.deepEqual(Rows.evaluate(rows[0], { esc:"5*4==20", cols:[]}), true, "5*4==20 satisfies condition as supposed.");
		
	assert.deepEqual(Rows.evaluate(rows[0], { esc:"%att1%=='data11'"	, cols:["att1"]}), true, "Row #1 satisfies condition as supposed.");
	assert.deepEqual(Rows.evaluate(rows[0], { esc:"%att1%!='data12'"	, cols:["att1"]}), true, "Row #1 satisfies condition as supposed.");
	assert.deepEqual(Rows.evaluate(rows[0], { esc:"%att2%==12"			, cols:["att2"]}), true, "Row #1 satisfies condition as supposed.");
	assert.deepEqual(Rows.evaluate(rows[0], { esc:"%att2%<%att3%"		, cols:["att2", "att3"]}), true, "Row #1 satisfies condition as supposed.");
	assert.deepEqual(Rows.evaluate(rows[0], { esc:"%att2%+1==%att3%"	, cols:["att2", "att3"]}), true, "Row #1 satisfies condition as supposed.");
	assert.deepEqual(Rows.evaluate(rows[0], { esc:"%att2%+%att3%==25"	, cols:["att2", "att3"]}), true, "Row #1 satisfies condition as supposed.");
	assert.deepEqual(Rows.evaluate(rows[0], { esc:"%att1%=='data11'&&%att2%+1==%att3%", cols:["att1", "att2", "att3"]}), true, "Row #1 satisfies condition as supposed.");
	assert.deepEqual(Rows.evaluate(rows[0], { esc:"%att1%=='data11'||%att2%+2==%att3%", cols:["att1", "att2", "att3"]}), true, "Row #1 satisfies condition as supposed.");
	assert.deepEqual(Rows.evaluate(rows[0], { esc:"%att1%=='data12'||%att2%+1==%att3%", cols:["att1", "att2", "att3"]}), true, "Row #1 satisfies condition as supposed.");
	assert.deepEqual(Rows.evaluate(rows[0], { esc:"%att1%=='data12'"	, cols:["att1"]}), false, "Row #1 does not satisfy condition as supposed.");
	assert.deepEqual(Rows.evaluate(rows[0], { esc:"%att2%==13"			, cols:["att2"]}), false, "Row #1 does not satisfy condition as supposed.");
	assert.deepEqual(Rows.evaluate(rows[0], { esc:"%att1%=='data12'||%att2%+2==%att3%", cols:["att1", "att2", "att3"]}), false, "Row #1 does not satisfy condition as supposed.");
	
	assert.deepEqual(Rows.evaluate(rows[1], { esc:"%R.att%==%S.att%"	, cols:["R.att", "S.att"]}), true, "Row #2 satisfies condition as supposed.");
	assert.deepEqual(Rows.evaluate(rows[1], { esc:"%att%=='data'"	, cols:["att"]}), true, "ambiguous condition passes, because SymbolManager shouldn't let such calls happen.");
	
	assert.deepEqual(Rows.evaluate(rows[2], { esc:"%att%=='data'"		, cols:["att"]}), true, "Row #3 satisfies condition as supposed.");
	assert.deepEqual(Rows.evaluate(rows[2], { esc:"%att%=='data1'"		, cols:["att"]}), false, "Row #3 does not satisfy condition as supposed.");
	assert.throws(function () { Rows.evaluate(rows[2], { esc:"%att%=='data1'"		, cols:["att1"]}); }, "Malformed call throws error, but SymbolManager shouldn't let such calls happen.");
	assert.deepEqual(Rows.evaluate(rows[2], { esc:"%att%+'11'=='data11'" , cols:["att"]}), true, "Row #3 text concanetation satisfies condition as supposed.");
});

QUnit.test("row clone", function (assert) {
	var row = { att1: "data11", att2: "12", att3: "13" };
	var rowcopy = Rows.copy(row);
	assert.deepEqual(row, { att1: "data11", att2: "12", att3: "13" }, "Cloned row is a clone.");
	rowcopy.att1 = "foo";
	assert.deepEqual(rowcopy, { att1: "foo", att2: "12", att3: "13" }, "Cloned row is changed.");
	assert.deepEqual(row, { att1: "data11", att2: "12", att3: "13" }, "Original row is unchanged by changing cloned row.");
});

QUnit.test("copy rows from #1", function (assert) {
	var r = new Relation("R1");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: "data11", att2: "data12", att3: "data13" },
		{ att1: "data21", att2: "data22", att3: "data23" },
		{ att1: "data31", att2: "data32", att3: "data33" }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	
	var s = new Relation("S1");
	s.setAttributes(r.getAttributes());
	assert.deepEqual(s.copyRowsFrom(r), true, "Rows copied from source relation successfully.");
	assert.deepEqual(s.getRowCount(), 3, "3 rows copied successfully.");
	assert.deepEqual(s.getRow(0), { "R1.att1": "data11", "R1.att2": "data12", "R1.att3": "data13" }, "Getting the row #1 successfully.");
	assert.deepEqual(s.getRow(1), { "R1.att1": "data21", "R1.att2": "data22", "R1.att3": "data23" }, "Getting the row #2 successfully.");
	assert.deepEqual(s.getRow(2), { "R1.att1": "data31", "R1.att2": "data32", "R1.att3": "data33" }, "Getting the row #3 successfully.");
	assert.deepEqual(r.getRow(0), s.getRow(0), "Original row is exact copy of new row.");
});

QUnit.test("copy rows from #2", function (assert) {
	var r = new Relation("R1");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: "data11", att2: "data12", att3: "data13" },
		{ att1: "data21", att2: "data22", att3: "data23" },
		{ att1: "data31", att2: "data32", att3: "data33" }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	
	var s = new Relation("S1");
	s.setAttributes(r.getAttributesOnly());
	assert.deepEqual(s.copyRowsFrom(r), true, "Rows copied from source relation successfully.");
	assert.deepEqual(s.getRowCount(), 3, "3 rows copied successfully.");
	assert.deepEqual(s.getRow(0), { "S1.att1": "data11", "S1.att2": "data12", "S1.att3": "data13" }, "Getting the row #1 successfully.");
	assert.deepEqual(s.getRow(1), { "S1.att1": "data21", "S1.att2": "data22", "S1.att3": "data23" }, "Getting the row #2 successfully.");
	assert.deepEqual(s.getRow(2), { "S1.att1": "data31", "S1.att2": "data32", "S1.att3": "data33" }, "Getting the row #3 successfully.");
	assert.notDeepEqual(r.getRow(0), s.getRow(0), "Original row is not exact copy of new row.");
});

QUnit.test("rename attributes", function (assert) {
	var r = new Relation("R1");
	var atts = "att1; att2; att3";
	r.setAttributes(atts);
	r.addRow({ att1: "data11", att2: "data12", att3: "data13" });
	assert.deepEqual(r.renameAttributes(["btt2"],["att2"]), true, "Attributes are renamed successfully. #1");
	assert.deepEqual(r.getAttributes(), ["R1.att1", "R1.btt2", "R1.att3"], "Attributes are renamed correctly. #1");
	assert.deepEqual(r.getRow(0), { "R1.att1": "data11", "R1.btt2": "data12", "R1.att3": "data13" }, "Row attributes are renamed correctly. #1");
	
	var s = new Relation("S");
	s.setAttributes(r.getAttributes());
	s.copyRowsFrom(r);
	assert.deepEqual(s.renameAttributes(["att2"],["btt2"]), true, "Attributes are renamed successfully. #2");
	assert.deepEqual(s.getAttributes(), ["R1.att1", "S.att2", "R1.att3"], "Attributes are renamed correctly. #2");
	assert.deepEqual(s.getRow(0), { "R1.att1": "data11", "S.att2": "data12", "R1.att3": "data13" }, "Row attributes are renamed correctly. #1");
});

QUnit.test("append rows", function (assert) {
	var r1 = { "R1.att1": "a", "R1.att2": "b" };
	var r2 = { "S1.att2": "a", "S1.att3": "d" };
	assert.deepEqual(Rows.append(r1, r2), { "R1.att1": "a", "R1.att2": "b", "S1.att2": "a", "S1.att3": "d" }, "Appending rows successful. #1");
	
	var r1 = { "R1.att1": "a", "R1.att2": "b" };
	var r2 = { "R1.att2": "a", "S1.att3": "d" };
	assert.deepEqual(Rows.append(r1, r2), { "R1.att1": "a", "R1.att2": "a", "S1.att3": "d" }, "Appending rows successful. #2");
});

QUnit.test("join rows", function (assert) {
	var r1 = { "R1.att1": "a", "R1.att2": "b" };
	var r2 = { "S1.att2": "a", "S1.att3": "d" };
	assert.deepEqual(Rows.join(r1, r2), { "R1.att1": "a", "att2": "b", "S1.att3": "d" }, "Joining rows successful. #1");
	
	var r1 = { "R1.att1": "a", "R1.att2": "b" };
	var r2 = { "R1.att2": "a", "S1.att3": "d" };
	assert.deepEqual(Rows.join(r1, r2), { "R1.att1": "a", "att2": "b", "S1.att3": "d" }, "Joining rows successful. #2");
});

QUnit.test("set & multiset mode", function (assert) {
	var r = new Relation("R1");
	var atts = "P.att1;Q.att2;S.att3";
	var row = { att1: "data11", att2: "data12", att3: "data13" };
	r.setMultisetMode(false);
	r.setAttributes(atts);
	assert.deepEqual(r.addRow(row), true, "Adding the row successfully.");
	assert.deepEqual(r.getRowCount(), 1, "Row count is 1 after adding one row.");
	assert.deepEqual(r.getRow(0), { "P.att1": "data11", "Q.att2": "data12", "S.att3": "data13" }, "Getting the row successfully.");
	assert.deepEqual(r.addRow(row), false, "Adding the row is not successful in set mode.");
	r.setMultisetMode(true);
	assert.deepEqual(r.addRow(row), true, "Adding the row successfully.");
	assert.deepEqual(r.getRowCount(), 2, "Row count is 1 after adding one row.");
	assert.deepEqual(r.getRow(0), { "P.att1": "data11", "Q.att2": "data12", "S.att3": "data13" }, "Getting the row #1 successfully.");
	assert.deepEqual(r.getRow(1), { "P.att1": "data11", "Q.att2": "data12", "S.att3": "data13" }, "Getting the row #2 successfully.");
});

//***		RelationManager related tests 	***

QUnit.module("A6. RelationsManager");

QUnit.test("constructor", function (assert) {
	var rm = new RelationsManager();
	assert.ok(rm instanceof RelationsManager, "RelationsManager object is created.");
});

QUnit.test("add relation", function (assert) {
	var r = new Relation("R");
	var rm = new RelationsManager();
	assert.deepEqual(rm.addRelation(r), true, "Successfully added a new relation.");
});

QUnit.test("get relation", function (assert) {
	var r = new Relation("R");
	var rm = new RelationsManager();
	rm.addRelation(r);
	assert.deepEqual(rm.getRelation("R"), r, "Successfully got back the added relation.");
});

QUnit.test("get relationmanager", function (assert) {
	var rm1 = getRelationsManager();
	assert.ok(rm1 instanceof RelationsManager, "RelationsManager object is created.");
	var rm2 = getRelationsManager();
	assert.deepEqual(rm1, rm2, "The same RelationsManager object is returned with every call.");
});

//***		Operations related tests 	***

QUnit.module("A5. Operations");

QUnit.test("COPY", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: "data11", att2: "data12", att3: "data13" },
		{ att1: "data21", att2: "data22", att3: "data23" },
		{ att1: "data31", att2: "data32", att3: "data33" }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	
	var p = new Parser();
	var qtr = p.parse("R");
	
	var op = getOperation(qtr);
	assert.ok(op instanceof CopyOperation, "CopyOperation object is created.");
	assert.deepEqual(op.execute(), "_X0", "Copy operation executed successfully.");
	var x0 = rm.getRelation("_X0");
	assert.notDeepEqual(x0, undefined, "Result relation exists.");
	assert.deepEqual(x0.getName(), "_X0", "Result relation's name is correct.");
	assert.deepEqual(x0.getRowCount(), 3, "Result relation's rowcount is correct.");
	assert.deepEqual(x0.getAttributes(), ["R.att1", "R.att2", "R.att3"], "Result relation's attributes are correct.");
	assert.deepEqual(Object.keys(x0.getRow(0)), ["R.att1", "R.att2", "R.att3"], "Result relation's attributes are correct.");
	assert.deepEqual(x0.getRow(0), {"R.att1":"data11", "R.att2":"data12", "R.att3":"data13"}, "Result relation's row #1 is correct.");
	assert.deepEqual(x0.getRow(1), {"R.att1":"data21", "R.att2":"data22", "R.att3":"data23"}, "Result relation's row #2 is correct.");
	assert.deepEqual(x0.getRow(2), {"R.att1":"data31", "R.att2":"data32", "R.att3":"data33"}, "Result relation's row #3 is correct.");
	assert.deepEqual(x0.getRow(0), r.getRow(0), "Result relation's row #1 is identical with the source relation's row #1.");
});

QUnit.test("DISTINCT", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: "data11", att2: "data12", att3: "data13" },
		{ att1: "data21", att2: "data22", att3: "data23" },
		{ att1: "data11", att2: "data12", att3: "data13" }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	
	var p = new Parser();
	var qtr = p.parse("DELTA(R)");
	var op = getOperation(qtr.source.relation);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof DistinctOperation, "DistinctOperation object is created.");
	assert.deepEqual(op.execute(), "_X1", "Distinct operation executed successfully.");
	var x1 = rm.getRelation("_X1");
	assert.notDeepEqual(x1, undefined, "Result relation exists.");
	assert.deepEqual(x1.getName(), "_X1", "Result relation's name is correct.");
	assert.deepEqual(x1.getRowCount(), 2, "Result relation's rowcount is correct.");
	assert.deepEqual(x1.getRow(0), {"R.att1":"data11", "R.att2":"data12", "R.att3":"data13"}, "Result relation's row #1 is correct.");
	assert.deepEqual(x1.getRow(1), {"R.att1":"data21", "R.att2":"data22", "R.att3":"data23"}, "Result relation's row #2 is correct.");
	assert.deepEqual(x1.getRow(2), undefined, "Result relation's row #3 is undefined.");
});

QUnit.test("RENAME_RELATION | case #1", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: "data11", att2: "data12", att3: "data13" }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	
	var p = new Parser();
	var qtr = p.parse("RO(S;R)");
	var op = getOperation(qtr.source.relation);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof RenameRelationOperation, "RenameRelationOperation object is created.");
	assert.deepEqual(op.execute(), "_X1", "Distinct operation executed successfully.");
	var x1 = rm.getRelation("_X1");
	assert.notDeepEqual(x1, undefined, "Result relation exists.");
	assert.deepEqual(x1.getName(), "_X1", "Result relation's name is correct.");
	assert.deepEqual(x1.getRowCount(), 1, "Result relation's rowcount is correct.");
	assert.deepEqual(x1.getRow(0), {"S.att1":"data11", "S.att2":"data12", "S.att3":"data13"}, "Result relation's row #1 is correct.");
});

QUnit.test("RENAME_RELATION | case #2", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("S.att1", "R");
	sm.addAttribute("P.att2", "R");
	sm.addAttribute("Q.att3", "R");
	
	var r = new Relation("R");
	var atts = "S.att1; P.att2; Q.att3";
	var rows = [
		{ att1: "data11", att2: "data12", att3: "data13" }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	
	var p = new Parser();
	var qtr = p.parse("RO(S;R)");
	var op = getOperation(qtr.source.relation);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof RenameRelationOperation, "RenameRelationOperation object is created.");
	assert.deepEqual(op.execute(), "_X1", "Rename relation operation executed successfully.");
	var x1 = rm.getRelation("_X1");
	assert.notDeepEqual(x1, undefined, "Result relation exists.");
	assert.deepEqual(x1.getName(), "_X1", "Result relation's name is correct.");
	assert.deepEqual(x1.getAttributes(), ["S.att1", "S.att2", "S.att3"], "Result relation's attributes are renamed properly.");
	assert.deepEqual(x1.getRowCount(), 1, "Result relation's rowcount is correct.");
	assert.deepEqual(x1.getRow(0), {"S.att1":"data11", "S.att2":"data12", "S.att3":"data13"}, "Result relation's row #1 is correct.");
});

QUnit.test("SORT | case #1", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 2, att2: "a", att3: "row1" },
		{ att1: 2, att2: "b", att3: "row2" },
		{ att1: 1, att2: "c", att3: "row3" }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	
	var p = new Parser();
	var qtr = p.parse("TAU(att1,att2;R)");
	var op = getOperation(qtr.source.relation);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof SortOperation, "SortOperation object is created.");
	assert.deepEqual(op.execute(), "_X1", "Sort operation executed successfully.");
	var x1 = rm.getRelation("_X1");
	assert.notDeepEqual(x1, undefined, "Result relation exists.");
	assert.deepEqual(x1.getName(), "_X1", "Result relation's name is correct.");
	assert.deepEqual(x1.getRowCount(), 3, "Result relation's rowcount is correct.");
	assert.deepEqual(x1.getRow(0), {"R.att1":1, "R.att2":"c", "R.att3":"row3"}, "Result relation's row #1 is correct.");
	assert.deepEqual(x1.getRow(1), {"R.att1":2, "R.att2":"a", "R.att3":"row1"}, "Result relation's row #2 is correct.");
	assert.deepEqual(x1.getRow(2), {"R.att1":2, "R.att2":"b", "R.att3":"row2"}, "Result relation's row #3 is correct.");
});

QUnit.test("SORT | case #2", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("S.att1", "R");
	sm.addAttribute("P.att2", "R");
	sm.addAttribute("Q.att3", "R");
	
	var r = new Relation("R");
	var atts = "S.att1; P.att2; Q.att3";
	var rows = [
		{ att1: 2, att2: "a", att3: "row1" },
		{ att1: 2, att2: "b", att3: "row2" },
		{ att1: 1, att2: "c", att3: "row3" }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	
	var p = new Parser();
	var qtr = p.parse("TAU(att1,att2;R)");
	var op = getOperation(qtr.source.relation);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof SortOperation, "SortOperation object is created.");
	assert.deepEqual(op.execute(), "_X1", "Sort operation executed successfully.");
	var x1 = rm.getRelation("_X1");
	assert.notDeepEqual(x1, undefined, "Result relation exists.");
	assert.deepEqual(x1.getName(), "_X1", "Result relation's name is correct.");
	assert.deepEqual(x1.getRowCount(), 3, "Result relation's rowcount is correct.");
	assert.deepEqual(x1.getRow(0), {"S.att1":1, "P.att2":"c", "Q.att3":"row3"}, "Result relation's row #1 is correct.");
	assert.deepEqual(x1.getRow(1), {"S.att1":2, "P.att2":"a", "Q.att3":"row1"}, "Result relation's row #2 is correct.");
	assert.deepEqual(x1.getRow(2), {"S.att1":2, "P.att2":"b", "Q.att3":"row2"}, "Result relation's row #3 is correct.");
});

QUnit.test("RENAME_ATTRIBUTES | case #1", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 2, att2: "a", att3: "row1" },
		{ att1: 2, att2: "b", att3: "row2" },
		{ att1: 1, att2: "c", att3: "row3" }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	
	var p = new Parser();
	var qtr = p.parse("RO(att1/btt1,att3/btt3;R)");
	var op = getOperation(qtr.source.relation);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof RenameAttributesOperation, "RenameAttributesOperation object is created.");
	assert.deepEqual(op.execute(), "_X1", "Rename attributes operation executed successfully.");
	var x1 = rm.getRelation("_X1");
	assert.notDeepEqual(x1, undefined, "Result relation exists.");
	assert.deepEqual(x1.getName(), "_X1", "Result relation's name is correct.");
	assert.deepEqual(x1.getRowCount(), 3, "Result relation's rowcount is correct.");
	assert.deepEqual(x1.getRow(0), {"_X0.btt1":2, "R.att2":"a", "_X0.btt3":"row1"}, "Result relation's row #1 is correct.");
	assert.deepEqual(x1.getRow(1), {"_X0.btt1":2, "R.att2":"b", "_X0.btt3":"row2"}, "Result relation's row #2 is correct.");
	assert.deepEqual(x1.getRow(2), {"_X0.btt1":1, "R.att2":"c", "_X0.btt3":"row3"}, "Result relation's row #3 is correct.");
});

QUnit.test("RENAME_ATTRIBUTES | case #2", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("S.att1", "R");
	sm.addAttribute("P.att2", "R");
	sm.addAttribute("Q.att3", "R");
	
	var r = new Relation("R");
	var atts = "S.att1; P.att2; Q.att3";
	var rows = [
		{ att1: 2, att2: "a", att3: "row1" },
		{ att1: 2, att2: "b", att3: "row2" },
		{ att1: 1, att2: "c", att3: "row3" }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	
	var p = new Parser();
	var qtr = p.parse("RO(att1/btt1,P.att2/btt2,att3/btt3;R)");
	var op = getOperation(qtr.source.relation);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof RenameAttributesOperation, "RenameAttributesOperation object is created.");
	assert.deepEqual(op.execute(), "_X1", "Rename attributes operation executed successfully.");
	var x1 = rm.getRelation("_X1");
	assert.notDeepEqual(x1, undefined, "Result relation exists.");
	assert.deepEqual(x1.getName(), "_X1", "Result relation's name is correct.");
	assert.deepEqual(x1.getRowCount(), 3, "Result relation's rowcount is correct.");
	assert.deepEqual(x1.getRow(0), {"_X0.btt1":2, "_X0.btt2":"a", "_X0.btt3":"row1"}, "Result relation's row #1 is correct.");
	assert.deepEqual(x1.getRow(1), {"_X0.btt1":2, "_X0.btt2":"b", "_X0.btt3":"row2"}, "Result relation's row #2 is correct.");
	assert.deepEqual(x1.getRow(2), {"_X0.btt1":1, "_X0.btt2":"c", "_X0.btt3":"row3"}, "Result relation's row #3 is correct.");
});

QUnit.test("attribute parameter translation", function (assert) {
	var r = new Relation("R");
	var atts = "S.att1; P.att2; Q.att3";
	r.setAttributes(atts);
	
	var parameter = {
		c: {
			esc: "%att1%+%att2%",
			cols: ["att1", "att2"],
			isCalculated: true
		},
		
		d: {
			esc: "%att1%+%att1%",
			cols: ["att1", "att1"],
			isCalculated: true
		},
		
		att3: {
			esc: "%att3%",
			cols: ["att3"]
		}
	};
	
	var parameter_good = {
		c: {
			esc: "%S.att1%+%P.att2%",
			cols: ["S.att1", "P.att2"],
			isCalculated: true
		},
		
		d: {
			esc: "%S.att1%+%S.att1%",
			cols: ["S.att1", "S.att1"],
			isCalculated: true
		},
		
		att3: {
			esc: "%Q.att3%",
			cols: ["Q.att3"]
		}
	};
	
	var att;
	var fields = [];
	for (att in parameter) {
		fields = fields.concat(parameter[att].cols);
	}
	fields = r.translateAttributes(fields);
	assert.deepEqual(AttributeParameter.translate(parameter, fields), parameter_good, "Parameter attribute names properly translated to match the relation's attribute names");
});

QUnit.test("SELECTION | case #1", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: "a", att3: "row1" },
		{ att1: 2, att2: "b", att3: "row2" },
		{ att1: 3, att2: "c", att3: "row3" },
		{ att1: 4, att2: "d", att3: "row4" },
		{ att1: 5, att2: "e", att3: "row5" }

	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	r.addRow(rows[3]);
	r.addRow(rows[4]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	
	var p = new Parser();
	var qtr = p.parse("SIGMA(att2==\"b\";R)");
	var op = getOperation(qtr.source.relation);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof SelectionOperation, "SelectionOperation object is created.");
	assert.deepEqual(op.execute(), "_X1", "Selection operation executed successfully.");
	var x1 = rm.getRelation("_X1");
	assert.notDeepEqual(x1, undefined, "Result relation exists.");
	assert.deepEqual(x1.getName(), "_X1", "Result relation's name is correct.");
	assert.deepEqual(x1.getRowCount(), 1, "Result relation's rowcount is correct.");
	assert.deepEqual(x1.getRow(0), { "R.att1": 2, "R.att2": "b", "R.att3": "row2" }, "Result relation's row #1 is correct.");
});

QUnit.test("SELECTION | case #2", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("S.att1", "R");
	sm.addAttribute("P.att2", "R");
	sm.addAttribute("Q.att3", "R");
	
	var r = new Relation("R");
	var atts = "S.att1; P.att2; Q.att3";
	var rows = [
		{ att1: 1, att2: "a", att3: "row1" },
		{ att1: 2, att2: "b", att3: "row2" },
		{ att1: 3, att2: "c", att3: "row3" },
		{ att1: 4, att2: "d", att3: "row4" },
		{ att1: 5, att2: "e", att3: "row5" }

	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	r.addRow(rows[3]);
	r.addRow(rows[4]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	
	var p = new Parser();
	var qtr = p.parse("SIGMA(att1>=4||att2==\"a\";R)");
	var op = getOperation(qtr.source.relation);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof SelectionOperation, "SelectionOperation object is created.");
	assert.deepEqual(op.execute(), "_X1", "Selection operation executed successfully.");
	var x1 = rm.getRelation("_X1");
	assert.notDeepEqual(x1, undefined, "Result relation exists.");
	assert.deepEqual(x1.getName(), "_X1", "Result relation's name is correct.");
	assert.deepEqual(x1.getRowCount(), 3, "Result relation's rowcount is correct.");
	assert.deepEqual(x1.getRow(0), { "S.att1": 1, "P.att2": "a", "Q.att3": "row1" }, "Result relation's row #1 is correct.");
	assert.deepEqual(x1.getRow(1), { "S.att1": 4, "P.att2": "d", "Q.att3": "row4" }, "Result relation's row #1 is correct.");
	assert.deepEqual(x1.getRow(2), { "S.att1": 5, "P.att2": "e", "Q.att3": "row5" }, "Result relation's row #1 is correct.");
});

QUnit.test("PROJECTION | case #1", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: "a", att3: "row1" },
		{ att1: 2, att2: "b", att3: "row2" },
		{ att1: 3, att2: "c", att3: "row3" }

	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	
	var p = new Parser();
	var qtr = p.parse("PI(att2;R)");
	var op = getOperation(qtr.source.relation);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof ProjectionOperation, "ProjectionOperation object is created.");
	assert.deepEqual(op.execute(), "_X1", "Selection operation executed successfully.");
	var x1 = rm.getRelation("_X1");
	assert.notDeepEqual(x1, undefined, "Result relation exists.");
	assert.deepEqual(x1.getName(), "_X1", "Result relation's name is correct.");
	assert.deepEqual(x1.getRowCount(), 3, "Result relation's rowcount is correct.");
	assert.deepEqual(x1.getRow(0), { "R.att2": "a" }, "Result relation's row #1 is correct.");
	assert.deepEqual(x1.getRow(1), { "R.att2": "b" }, "Result relation's row #2 is correct.");
	assert.deepEqual(x1.getRow(2), { "R.att2": "c" }, "Result relation's row #3 is correct.");
	assert.deepEqual(x1.getAttributes(), ["R.att2"], "Result relation's attribute order is correct.");
});

QUnit.test("PROJECTION | case #2", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: "a", att3: "row1" },
		{ att1: 2, att2: "b", att3: "row2" },
		{ att1: 3, att2: "c", att3: "row3" }

	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	
	var p = new Parser();
	var qtr = p.parse("PI(att1,att3->att4;R)");
	var op = getOperation(qtr.source.relation);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof ProjectionOperation, "ProjectionOperation object is created.");
	assert.deepEqual(op.execute(), "_X1", "Selection operation executed successfully.");
	var x1 = rm.getRelation("_X1");
	assert.notDeepEqual(x1, undefined, "Result relation exists.");
	assert.deepEqual(x1.getName(), "_X1", "Result relation's name is correct.");
	assert.deepEqual(x1.getRowCount(), 3, "Result relation's rowcount is correct.");
	assert.deepEqual(x1.getRow(0), { "R.att1": 1, "_X1.att4": "row1" }, "Result relation's row #1 is correct.");
	assert.deepEqual(x1.getRow(1), { "R.att1": 2, "_X1.att4": "row2" }, "Result relation's row #2 is correct.");
	assert.deepEqual(x1.getRow(2), { "R.att1": 3, "_X1.att4": "row3" }, "Result relation's row #3 is correct.");
	assert.deepEqual(x1.getAttributes(), ["R.att1", "_X1.att4"], "Result relation's attribute order is correct.");
});

QUnit.test("PROJECTION | case #3", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 },
		{ att1: 3, att2: 5, att3: 7 }

	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	
	var p = new Parser();
	var qtr = p.parse("PI(att1+att2*att3->szum;R)");
	var op = getOperation(qtr.source.relation);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof ProjectionOperation, "ProjectionOperation object is created.");
	assert.deepEqual(op.execute(), "_X1", "Selection operation executed successfully.");
	var x1 = rm.getRelation("_X1");
	assert.notDeepEqual(x1, undefined, "Result relation exists.");
	assert.deepEqual(x1.getName(), "_X1", "Result relation's name is correct.");
	assert.deepEqual(x1.getRowCount(), 3, "Result relation's rowcount is correct.");
	assert.deepEqual(x1.getRow(0), { "_X1.szum": 16 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x1.getRow(1), { "_X1.szum": 26 }, "Result relation's row #2 is correct.");
	assert.deepEqual(x1.getRow(2), { "_X1.szum": 38 }, "Result relation's row #3 is correct.");
	assert.deepEqual(x1.getAttributes(), ["_X1.szum"], "Result relation's attribute order is correct.");
});

QUnit.test("PROJECTION | case #4 (attribute order after rename)", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: "a", att3: "row1" },
		{ att1: 2, att2: "b", att3: "row2" },
		{ att1: 3, att2: "c", att3: "row3" }

	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	
	var p = new Parser();
	var qtr = p.parse("PI(att2,att1->att4,att3;R)");
	var op = getOperation(qtr.source.relation);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof ProjectionOperation, "ProjectionOperation object is created.");
	assert.deepEqual(op.execute(), "_X1", "Selection operation executed successfully.");
	var x1 = rm.getRelation("_X1");
	assert.notDeepEqual(x1, undefined, "Result relation exists.");
	assert.deepEqual(x1.getAttributes(), ["R.att2", "_X1.att4", "R.att3"], "Result relation's attribute order is correct.");
});

QUnit.test("GROUPBY | case #1", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: "a", att2: 1, att3: 1 },
		{ att1: "b", att2: 2, att3: 4 },
		{ att1: "c", att2: 3, att3: 0 },
		{ att1: "a", att2: 4, att3: 3 },
		{ att1: "b", att2: 5, att3: 4 },
		{ att1: "c", att2: 6, att3: 10 },
		{ att1: "a", att2: 7, att3: 5 },
		{ att1: "b", att2: 8, att3: 4 },
		{ att1: "c", att2: 9, att3: 20 },
		{ att1: "b", att2: 10, att3: 4 },
		{ att1: "c", att2: 11, att3: 30 },
		{ att1: "c", att2: 12, att3: 40 }

	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	r.addRow(rows[3]);
	r.addRow(rows[4]);
	r.addRow(rows[5]);
	r.addRow(rows[6]);
	r.addRow(rows[7]);
	r.addRow(rows[8]);
	r.addRow(rows[9]);
	r.addRow(rows[10]);
	r.addRow(rows[11]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	
	var p = new Parser();
	var qtr = p.parse("GAMMA(att1,SUM(att2),AVG(att3),MAX(att3)->max;R)");
	var op = getOperation(qtr.source.relation);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof GroupbyOperation, "GroupbyOperation object is created.");
	assert.deepEqual(op.execute(), "_X1", "Aggregating operation executed successfully.");
	var x1 = rm.getRelation("_X1");
	assert.notDeepEqual(x1, undefined, "Result relation exists.");
	assert.deepEqual(x1.getName(), "_X1", "Result relation's name is correct.");
	assert.deepEqual(x1.getRowCount(), 3, "Result relation's rowcount is correct.");
	assert.deepEqual(x1.getRow(0), { "R.att1": "a",	"_X1.SUM(att2)": 12,	"_X1.AVG(att3)": 3,		"_X1.max": 5}, "Result relation's row #1 is correct.");
	assert.deepEqual(x1.getRow(1), { "R.att1": "b",	"_X1.SUM(att2)": 25,	"_X1.AVG(att3)": 4,		"_X1.max": 4}, "Result relation's row #2 is correct.");
	assert.deepEqual(x1.getRow(2), { "R.att1": "c",	"_X1.SUM(att2)": 41,	"_X1.AVG(att3)": 20,	"_X1.max": 40}, "Result relation's row #3 is correct.");
	assert.deepEqual(x1.getAttributes(), ["R.att1", "_X1.SUM(att2)", "_X1.AVG(att3)", "_X1.max"], "Result relation's attribute order is correct.");
});

QUnit.test("GROUPBY | case #2", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("P.att2", "R");
	sm.addAttribute("Q.att3", "R");
	sm.addAttribute("att4", "R");
	
	var r = new Relation("R");
	var atts = "att1; P.att2; Q.att3; att4";
	var rows = [
		{ att1: "a", att2: 1, att3: 1,	att4: "x" },
		{ att1: "b", att2: 2, att3: 4,	att4: "x" },
		{ att1: "c", att2: 3, att3: 0,	att4: "x" },
		{ att1: "a", att2: 4, att3: 3,	att4: "x" },
		{ att1: "b", att2: 5, att3: 4,	att4: "x" },
		{ att1: "c", att2: 6, att3: 10,	att4: "x" },
		{ att1: "a", att2: 7, att3: 5,	att4: "y" },
		{ att1: "b", att2: 8, att3: 4,	att4: "y" },
		{ att1: "c", att2: 9, att3: 20,	att4: "y" },
		{ att1: "b", att2: 10, att3: 4,	att4: "y" },
		{ att1: "c", att2: 11, att3: 30, att4: "y" },
		{ att1: "c", att2: 12, att3: 40, att4: "y" }

	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	r.addRow(rows[3]);
	r.addRow(rows[4]);
	r.addRow(rows[5]);
	r.addRow(rows[6]);
	r.addRow(rows[7]);
	r.addRow(rows[8]);
	r.addRow(rows[9]);
	r.addRow(rows[10]);
	r.addRow(rows[11]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	
	var p = new Parser();
	var qtr = p.parse("GAMMA(att1,SUM(P.att2),att4->nev;R)");
	var op = getOperation(qtr.source.relation);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof GroupbyOperation, "GroupbyOperation object is created.");
	assert.deepEqual(op.execute(), "_X1", "Aggregating operation executed successfully.");
	var x1 = rm.getRelation("_X1");
	assert.notDeepEqual(x1, undefined, "Result relation exists.");
	assert.deepEqual(x1.getName(), "_X1", "Result relation's name is correct.");
	assert.deepEqual(x1.getRowCount(), 6, "Result relation's rowcount is correct.");
	assert.deepEqual(x1.getRow(0), { "R.att1": "a",	"_X1.nev": "x",	"_X1.SUM(P_att2)": 5}, "Result relation's row #1 is correct.");
	assert.deepEqual(x1.getRow(1), { "R.att1": "b",	"_X1.nev": "x",	"_X1.SUM(P_att2)": 7}, "Result relation's row #2 is correct.");
	assert.deepEqual(x1.getRow(2), { "R.att1": "c",	"_X1.nev": "x",	"_X1.SUM(P_att2)": 9}, "Result relation's row #3 is correct.");
	assert.deepEqual(x1.getRow(3), { "R.att1": "a",	"_X1.nev": "y",	"_X1.SUM(P_att2)": 7}, "Result relation's row #4 is correct.");
	assert.deepEqual(x1.getRow(4), { "R.att1": "b",	"_X1.nev": "y",	"_X1.SUM(P_att2)": 18}, "Result relation's row #5 is correct.");
	assert.deepEqual(x1.getRow(5), { "R.att1": "c",	"_X1.nev": "y",	"_X1.SUM(P_att2)": 32}, "Result relation's row #6 is correct.");
	assert.deepEqual(x1.getAttributes(), ["R.att1", "_X1.SUM(P_att2)", "_X1.nev"], "Result relation's attribute order is correct.");
});

QUnit.test("GROUPBY | case #3", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	sm.addAttribute("att4", "R");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3; att4";
	var rows = [
		{ att1: "a", att2: 1, att3: 1,	att4: "x" },
		{ att1: "b", att2: 2, att3: 4,	att4: "x" },
		{ att1: "c", att2: 3, att3: 0,	att4: "x" },
		{ att1: "a", att2: 4, att3: 3,	att4: "x" },
		{ att1: "b", att2: 5, att3: 4,	att4: "x" },
		{ att1: "c", att2: 6, att3: 10,	att4: "x" },
		{ att1: "a", att2: 7, att3: 5,	att4: "y" },
		{ att1: "b", att2: 8, att3: 4,	att4: "y" },
		{ att1: "c", att2: 9, att3: 20,	att4: "y" },
		{ att1: "b", att2: 10, att3: 4,	att4: "y" },
		{ att1: "c", att2: 11, att3: 30, att4: "y" },
		{ att1: "c", att2: 12, att3: 40, att4: "y" }

	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	r.addRow(rows[3]);
	r.addRow(rows[4]);
	r.addRow(rows[5]);
	r.addRow(rows[6]);
	r.addRow(rows[7]);
	r.addRow(rows[8]);
	r.addRow(rows[9]);
	r.addRow(rows[10]);
	r.addRow(rows[11]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	
	var p = new Parser();
	var qtr = p.parse("GAMMA(att1,AVG(att2),SUM(att2)->szumma,COUNT(att2),MIN(att2),MAX(att2);R)");
	var op = getOperation(qtr.source.relation);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof GroupbyOperation, "GroupbyOperation object is created.");
	assert.deepEqual(op.execute(), "_X1", "Aggregating operation executed successfully.");
	var x1 = rm.getRelation("_X1");
	assert.notDeepEqual(x1, undefined, "Result relation exists.");
	assert.deepEqual(x1.getName(), "_X1", "Result relation's name is correct.");
	assert.deepEqual(x1.getRowCount(), 3, "Result relation's rowcount is correct.");
	assert.deepEqual(x1.getRow(0), { "R.att1": "a",	"_X1.AVG(att2)": 4,    "_X1.szumma": 12, "_X1.COUNT(att2)": 3, "_X1.MIN(att2)": 1, "_X1.MAX(att2)": 7 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x1.getRow(1), { "R.att1": "b",	"_X1.AVG(att2)": 25/4, "_X1.szumma": 25, "_X1.COUNT(att2)": 4, "_X1.MIN(att2)": 2, "_X1.MAX(att2)": 10 }, "Result relation's row #2 is correct.");
	assert.deepEqual(x1.getRow(2), { "R.att1": "c",	"_X1.AVG(att2)": 41/5, "_X1.szumma": 41, "_X1.COUNT(att2)": 5, "_X1.MIN(att2)": 3, "_X1.MAX(att2)": 12 }, "Result relation's row #3 is correct.");
	assert.deepEqual(x1.getAttributes(), ["R.att1",	"_X1.AVG(att2)", "_X1.szumma", "_X1.COUNT(att2)", "_X1.MIN(att2)", "_X1.MAX(att2)"], "Result relation's attribute order is correct.");
});

QUnit.test("UNION | case #1", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att1", "S");
	sm.addAttribute("att2", "S");
	sm.addAttribute("att3", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	
	var s = new Relation("S");
	rows = [
		{ att1: 2, att2: 6, att3: 10 },
		{ att1: 4, att2: 8, att3: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R+S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof UnionOperation, "UnionOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Union operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 4, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "_X2.att1": 1, "_X2.att2": 3, "_X2.att3": 5 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "_X2.att1": 2, "_X2.att2": 4, "_X2.att3": 6 }, "Result relation's row #2 is correct.");
	assert.deepEqual(x2.getRow(2), { "_X2.att1": 2, "_X2.att2": 6, "_X2.att3": 10 }, "Result relation's row #3 is correct.");
	assert.deepEqual(x2.getRow(3), { "_X2.att1": 4, "_X2.att2": 8, "_X2.att3": 12 }, "Result relation's row #4 is correct.");
});

QUnit.test("UNION | case #2", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("P.att1", "R");
	sm.addAttribute("Q.att2", "R");
	sm.addAttribute("T.att3", "R");
	sm.addRelation("S");
	sm.addAttribute("Q.att1", "S");
	sm.addAttribute("Q.att2", "S");
	sm.addAttribute("att3", "S");
	
	var r = new Relation("R");
	var atts = "P.att1; Q.att2; T.att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	
	var s = new Relation("S");
	atts = "Q.att1; Q.att2; att3";
	rows = [
		{ att1: 2, att2: 6, att3: 10 },
		{ att1: 4, att2: 8, att3: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R+S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof UnionOperation, "UnionOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Union operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 4, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "_X2.att1": 1, "_X2.att2": 3, "_X2.att3": 5 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "_X2.att1": 2, "_X2.att2": 4, "_X2.att3": 6 }, "Result relation's row #2 is correct.");
	assert.deepEqual(x2.getRow(2), { "_X2.att1": 2, "_X2.att2": 6, "_X2.att3": 10 }, "Result relation's row #3 is correct.");
	assert.deepEqual(x2.getRow(3), { "_X2.att1": 4, "_X2.att2": 8, "_X2.att3": 12 }, "Result relation's row #4 is correct.");
});

QUnit.test("DIFFERENCE | case #1", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att1", "S");
	sm.addAttribute("att2", "S");
	sm.addAttribute("att3", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 },
		{ att1: 2, att2: 6, att3: 10 },
		{ att1: 4, att2: 8, att3: 12 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	r.addRow(rows[3]);
	
	var s = new Relation("S");
	rows = [
		{ att1: 2, att2: 4, att3: 6 },
		{ att1: 0, att2: 0, att3: 0 },
		{ att1: 4, att2: 8, att3: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	s.addRow(rows[2]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R-S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof DifferenceOperation, "DifferenceOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Difference operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 2, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "_X2.att1": 1, "_X2.att2": 3, "_X2.att3": 5 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "_X2.att1": 2, "_X2.att2": 6, "_X2.att3": 10 }, "Result relation's row #2 is correct.");
});

QUnit.test("DIFFERENCE | case #2", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("P.att1", "R");
	sm.addAttribute("Q.att2", "R");
	sm.addAttribute("T.att3", "R");
	sm.addRelation("S");
	sm.addAttribute("Q.att1", "S");
	sm.addAttribute("Q.att2", "S");
	sm.addAttribute("att3", "S");
	
	var r = new Relation("R");
	var atts = "P.att1; Q.att2; T.att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 },
		{ att1: 2, att2: 6, att3: 10 },
		{ att1: 4, att2: 8, att3: 12 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	r.addRow(rows[3]);
	
	var s = new Relation("S");
	rows = [
		{ att1: 2, att2: 4, att3: 6 },
		{ att1: 0, att2: 0, att3: 0 },
		{ att1: 4, att2: 8, att3: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	s.addRow(rows[2]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R-S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof DifferenceOperation, "DifferenceOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Difference operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 2, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "_X2.att1": 1, "_X2.att2": 3, "_X2.att3": 5 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "_X2.att1": 2, "_X2.att2": 6, "_X2.att3": 10 }, "Result relation's row #2 is correct.");
});

QUnit.test("INTERSECTION | case #1", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att1", "S");
	sm.addAttribute("att2", "S");
	sm.addAttribute("att3", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 },
		{ att1: 2, att2: 6, att3: 10 },
		{ att1: 4, att2: 8, att3: 12 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	r.addRow(rows[3]);
	
	var s = new Relation("S");
	rows = [
		{ att1: 2, att2: 4, att3: 6 },
		{ att1: 0, att2: 0, att3: 0 },
		{ att1: 4, att2: 8, att3: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	s.addRow(rows[2]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R*S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof IntersectionOperation, "IntersectionOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Intersection operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 2, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "_X2.att1": 2, "_X2.att2": 4, "_X2.att3": 6 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "_X2.att1": 4, "_X2.att2": 8, "_X2.att3": 12 }, "Result relation's row #2 is correct.");
});

QUnit.test("INTERSECTION | case #2", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("P.att1", "R");
	sm.addAttribute("Q.att2", "R");
	sm.addAttribute("T.att3", "R");
	sm.addRelation("S");
	sm.addAttribute("Q.att1", "S");
	sm.addAttribute("Q.att2", "S");
	sm.addAttribute("att3", "S");
	
	var r = new Relation("R");
	var atts = "P.att1; Q.att2; T.att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 },
		{ att1: 2, att2: 6, att3: 10 },
		{ att1: 4, att2: 8, att3: 12 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	r.addRow(rows[3]);
	
	var s = new Relation("S");
	rows = [
		{ att1: 2, att2: 4, att3: 6 },
		{ att1: 0, att2: 0, att3: 0 },
		{ att1: 4, att2: 8, att3: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	s.addRow(rows[2]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R*S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof IntersectionOperation, "IntersectionOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Intersection operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 2, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "_X2.att1": 2, "_X2.att2": 4, "_X2.att3": 6 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "_X2.att1": 4, "_X2.att2": 8, "_X2.att3": 12 }, "Result relation's row #2 is correct.");
});

QUnit.test("NATURAL JOIN | case #1", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att4", "S");
	sm.addAttribute("att2", "S");
	sm.addAttribute("att5", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	
	var s = new Relation("S");
	atts = "att4; att2; att5";
	rows = [
		{ att4: 2, att2: 4, att5: 10 },
		{ att4: 4, att2: 8, att5: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R@S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof NaturaljoinOperation, "NaturaljoinOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Natural join operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 1, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "R.att1": 2, "_X2.att2": 4, "R.att3": 6, "S.att4": 2, "S.att5": 10 }, "Result relation's row #1 is correct.");
});

QUnit.test("NATURAL JOIN | case #2", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("P.att1", "R");
	sm.addAttribute("Q.att2", "R");
	sm.addAttribute("S.att3", "R");
	sm.addRelation("S");
	sm.addAttribute("A.att4", "S");
	sm.addAttribute("B.att2", "S");
	sm.addAttribute("C.att5", "S");
	sm.addAttribute("D.att3", "S");
	
	var r = new Relation("R");
	var atts = "P.att1; Q.att2; S.att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	
	var s = new Relation("S");
	atts = "A.att4; B.att2; C.att5; D.att3";
	rows = [
		{ att4: 2, att2: 4, att5: 10, att3: 6},
		{ att4: 2, att2: 4, att5: 10, att3: 5},
		{ att4: 4, att2: 3, att5: 12, att3: 5},
		{ att4: 4, att2: 8, att5: 12, att3: 6}
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	s.addRow(rows[2]);
	s.addRow(rows[3]);

	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R@S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof NaturaljoinOperation, "NaturaljoinOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Natural join operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 2, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "P.att1": 1, "_X2.att2": 3, "_X2.att3": 5, "A.att4": 4, "C.att5": 12 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "P.att1": 2, "_X2.att2": 4, "_X2.att3": 6, "A.att4": 2, "C.att5": 10 }, "Result relation's row #2 is correct.");
});

QUnit.test("LEFT SEMI JOIN | case #1", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att4", "S");
	sm.addAttribute("att2", "S");
	sm.addAttribute("att5", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	
	var s = new Relation("S");
	atts = "att4; att2; att5";
	rows = [
		{ att4: 2, att2: 4, att5: 10 },
		{ att4: 4, att2: 8, att5: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R$@S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof LeftSemijoinOperation, "LeftSemijoinOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Left semi join operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 1, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "R.att1": 2, "R.att2": 4, "R.att3": 6 }, "Result relation's row #1 is correct.");
});

QUnit.test("LEFT SEMI JOIN | case #2", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("P.att1", "R");
	sm.addAttribute("Q.att2", "R");
	sm.addAttribute("S.att3", "R");
	sm.addRelation("S");
	sm.addAttribute("A.att4", "S");
	sm.addAttribute("B.att2", "S");
	sm.addAttribute("C.att5", "S");
	sm.addAttribute("D.att3", "S");
	
	var r = new Relation("R");
	var atts = "P.att1; Q.att2; S.att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	
	var s = new Relation("S");
	atts = "A.att4; B.att2; C.att5; D.att3";
	rows = [
		{ att4: 2, att2: 4, att5: 10, att3: 6},
		{ att4: 2, att2: 4, att5: 10, att3: 5},
		{ att4: 4, att2: 3, att5: 12, att3: 5},
		{ att4: 4, att2: 8, att5: 12, att3: 6}
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	s.addRow(rows[2]);
	s.addRow(rows[3]);

	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R$@S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof LeftSemijoinOperation, "LeftSemijoinOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Left semi join operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 2, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "P.att1": 1, "Q.att2": 3, "S.att3": 5 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "P.att1": 2, "Q.att2": 4, "S.att3": 6 }, "Result relation's row #2 is correct.");
});

QUnit.test("RIGHT SEMI JOIN | case #1", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att4", "S");
	sm.addAttribute("att2", "S");
	sm.addAttribute("att5", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	
	var s = new Relation("S");
	atts = "att4; att2; att5";
	rows = [
		{ att4: 2, att2: 4, att5: 10 },
		{ att4: 4, att2: 8, att5: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R@$S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof RightSemijoinOperation, "RightSemijoinOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Right semi join operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 1, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "S.att2": 4, "S.att4": 2, "S.att5": 10 }, "Result relation's row #1 is correct.");
});

QUnit.test("RIGHT SEMI JOIN | case #2", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("P.att1", "R");
	sm.addAttribute("Q.att2", "R");
	sm.addAttribute("S.att3", "R");
	sm.addRelation("S");
	sm.addAttribute("A.att4", "S");
	sm.addAttribute("B.att2", "S");
	sm.addAttribute("C.att5", "S");
	sm.addAttribute("D.att3", "S");
	
	var r = new Relation("R");
	var atts = "P.att1; Q.att2; S.att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	
	var s = new Relation("S");
	atts = "A.att4; B.att2; C.att5; D.att3";
	rows = [
		{ att4: 2, att2: 4, att5: 10, att3: 6},
		{ att4: 2, att2: 4, att5: 10, att3: 5},
		{ att4: 4, att2: 3, att5: 12, att3: 5},
		{ att4: 4, att2: 8, att5: 12, att3: 6}
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	s.addRow(rows[2]);
	s.addRow(rows[3]);

	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R@$S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof RightSemijoinOperation, "RightSemijoinOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Right semi join operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 2, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "B.att2": 3, "D.att3": 5, "A.att4": 4, "C.att5": 12 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "B.att2": 4, "D.att3": 6, "A.att4": 2, "C.att5": 10 }, "Result relation's row #2 is correct.");
});

QUnit.test("LEFT OUTER JOIN | case #1", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att4", "S");
	sm.addAttribute("att2", "S");
	sm.addAttribute("att5", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	
	var s = new Relation("S");
	atts = "att4; att2; att5";
	rows = [
		{ att4: 2, att2: 4, att5: 10 },
		{ att4: 4, att2: 8, att5: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R&@S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof LeftOuterjoinOperation, "LeftOuterjoinOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Left outer join operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 2, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "R.att1": 1, "_X2.att2": 3, "R.att3": 5, "S.att4": "?", "S.att5": "?" }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "R.att1": 2, "_X2.att2": 4, "R.att3": 6, "S.att4": 2, "S.att5": 10 }, "Result relation's row #2 is correct.");
});

QUnit.test("LEFT OUTER JOIN | case #2", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("P.att1", "R");
	sm.addAttribute("Q.att2", "R");
	sm.addAttribute("S.att3", "R");
	sm.addRelation("S");
	sm.addAttribute("A.att4", "S");
	sm.addAttribute("B.att2", "S");
	sm.addAttribute("C.att5", "S");
	sm.addAttribute("D.att3", "S");
	
	var r = new Relation("R");
	var atts = "P.att1; Q.att2; S.att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 1, att2: 8, att3: 8 },
		{ att1: 2, att2: 4, att3: 6 },
		{ att1: 2, att2: 9, att3: 9 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	r.addRow(rows[3]);
	
	var s = new Relation("S");
	atts = "A.att4; B.att2; C.att5; D.att3";
	rows = [
		{ att4: 2, att2: 4, att5: 10, att3: 6},
		{ att4: 2, att2: 4, att5: 10, att3: 5},
		{ att4: 4, att2: 3, att5: 12, att3: 5},
		{ att4: 4, att2: 8, att5: 12, att3: 6}
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	s.addRow(rows[2]);
	s.addRow(rows[3]);

	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R&@S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof LeftOuterjoinOperation, "LeftOuterjoinOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Left outer join operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 4, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "P.att1": 1, "_X2.att2": 3, "_X2.att3": 5, "A.att4": 4, "C.att5": 12 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "P.att1": 1, "_X2.att2": 8, "_X2.att3": 8, "A.att4": "?", "C.att5": "?" }, "Result relation's row #2 is correct.");
	assert.deepEqual(x2.getRow(2), { "P.att1": 2, "_X2.att2": 4, "_X2.att3": 6, "A.att4": 2, "C.att5": 10 }, "Result relation's row #3 is correct.");
	assert.deepEqual(x2.getRow(3), { "P.att1": 2, "_X2.att2": 9, "_X2.att3": 9, "A.att4": "?", "C.att5": "?" }, "Result relation's row #4 is correct.");
});

QUnit.test("RIGHT OUTER JOIN | case #1", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att4", "S");
	sm.addAttribute("att2", "S");
	sm.addAttribute("att5", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	
	var s = new Relation("S");
	atts = "att4; att2; att5";
	rows = [
		{ att4: 2, att2: 4, att5: 10 },
		{ att4: 4, att2: 8, att5: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R@&S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof RightOuterjoinOperation, "RightOuterjoinOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Right outer join operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 2, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "R.att1": 2, "_X2.att2": 4, "R.att3": 6, "S.att4": 2, "S.att5": 10 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "R.att1": "?", "_X2.att2": 8, "R.att3": "?", "S.att4": 4, "S.att5": 12 }, "Result relation's row #2 is correct.");
});

QUnit.test("RIGHT OUTER JOIN | case #2", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("P.att1", "R");
	sm.addAttribute("Q.att2", "R");
	sm.addAttribute("S.att3", "R");
	sm.addRelation("S");
	sm.addAttribute("A.att4", "S");
	sm.addAttribute("B.att2", "S");
	sm.addAttribute("C.att5", "S");
	sm.addAttribute("D.att3", "S");
	
	var r = new Relation("R");
	var atts = "P.att1; Q.att2; S.att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 1, att2: 8, att3: 8 },
		{ att1: 2, att2: 4, att3: 6 },
		{ att1: 2, att2: 9, att3: 9 },
		{ att1: 0, att2: 3, att3: 5 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	r.addRow(rows[3]);
	r.addRow(rows[4]);
	
	var s = new Relation("S");
	atts = "A.att4; B.att2; C.att5; D.att3";
	rows = [
		{ att4: 2, att2: 4, att5: 10, att3: 6},
		{ att4: 2, att2: 4, att5: 10, att3: 5},
		{ att4: 4, att2: 3, att5: 12, att3: 5},
		{ att4: 4, att2: 8, att5: 12, att3: 6}
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	s.addRow(rows[2]);
	s.addRow(rows[3]);

	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R@&S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof RightOuterjoinOperation, "RightOuterjoinOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Right outer join operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 5, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "P.att1": 2, "_X2.att2": 4, "_X2.att3": 6, "A.att4": 2, "C.att5": 10 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "P.att1": "?", "_X2.att2": 4, "_X2.att3": 5, "A.att4": 2, "C.att5": 10 }, "Result relation's row #2 is correct.");
	assert.deepEqual(x2.getRow(2), { "P.att1": 1, "_X2.att2": 3, "_X2.att3": 5, "A.att4": 4, "C.att5": 12 }, "Result relation's row #3 is correct.");
	assert.deepEqual(x2.getRow(3), { "P.att1": 0, "_X2.att2": 3, "_X2.att3": 5, "A.att4": 4, "C.att5": 12 }, "Result relation's row #4 is correct.");
	assert.deepEqual(x2.getRow(4), { "P.att1": "?", "_X2.att2": 8, "_X2.att3": 6, "A.att4": 4, "C.att5": 12 }, "Result relation's row #5 is correct.");
});

QUnit.test("FULL OUTER JOIN | case #1", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att4", "S");
	sm.addAttribute("att2", "S");
	sm.addAttribute("att5", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	
	var s = new Relation("S");
	atts = "att4; att2; att5";
	rows = [
		{ att4: 2, att2: 4, att5: 10 },
		{ att4: 4, att2: 8, att5: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R@@S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof FullOuterjoinOperation, "FullOuterjoinOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Full outer join operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 3, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "R.att1": 1, "_X2.att2": 3, "R.att3": 5, "S.att4": "?", "S.att5": "?" }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "R.att1": 2, "_X2.att2": 4, "R.att3": 6, "S.att4": 2, "S.att5": 10 }, "Result relation's row #2 is correct.");
	assert.deepEqual(x2.getRow(2), { "R.att1": "?", "_X2.att2": 8, "R.att3": "?", "S.att4": 4, "S.att5": 12 }, "Result relation's row #3 is correct.");
});

QUnit.test("FULL OUTER JOIN | case #2", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("P.att1", "R");
	sm.addAttribute("Q.att2", "R");
	sm.addAttribute("S.att3", "R");
	sm.addRelation("S");
	sm.addAttribute("A.att4", "S");
	sm.addAttribute("B.att2", "S");
	sm.addAttribute("C.att5", "S");
	sm.addAttribute("D.att3", "S");
	
	var r = new Relation("R");
	var atts = "P.att1; Q.att2; S.att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 1, att2: 8, att3: 8 },
		{ att1: 2, att2: 4, att3: 6 },
		{ att1: 2, att2: 9, att3: 9 },
		{ att1: 0, att2: 3, att3: 5 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	r.addRow(rows[3]);
	r.addRow(rows[4]);
	
	var s = new Relation("S");
	atts = "A.att4; B.att2; C.att5; D.att3";
	rows = [
		{ att4: 2, att2: 4, att5: 10, att3: 6},
		{ att4: 2, att2: 4, att5: 10, att3: 5},
		{ att4: 4, att2: 3, att5: 12, att3: 5},
		{ att4: 4, att2: 8, att5: 12, att3: 6}
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	s.addRow(rows[2]);
	s.addRow(rows[3]);

	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R@@S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof FullOuterjoinOperation, "FullOuterjoinOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Full outer join operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 7, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "P.att1": 1, "_X2.att2": 3, "_X2.att3": 5, "A.att4": 4, "C.att5": 12 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "P.att1": 1, "_X2.att2": 8, "_X2.att3": 8, "A.att4": "?", "C.att5": "?" }, "Result relation's row #2 is correct.");
	assert.deepEqual(x2.getRow(2), { "P.att1": 2, "_X2.att2": 4, "_X2.att3": 6, "A.att4": 2, "C.att5": 10 }, "Result relation's row #3 is correct.");
	assert.deepEqual(x2.getRow(3), { "P.att1": 2, "_X2.att2": 9, "_X2.att3": 9, "A.att4": "?", "C.att5": "?" }, "Result relation's row #4 is correct.");
	assert.deepEqual(x2.getRow(4), { "P.att1": 0, "_X2.att2": 3, "_X2.att3": 5, "A.att4": 4, "C.att5": 12 }, "Result relation's row #5 is correct.");
	assert.deepEqual(x2.getRow(5), { "P.att1": "?", "_X2.att2": 4, "_X2.att3": 5, "A.att4": 2, "C.att5": 10 }, "Result relation's row #6 is correct.");
	assert.deepEqual(x2.getRow(6), { "P.att1": "?", "_X2.att2": 8, "_X2.att3": 6, "A.att4": 4, "C.att5": 12 }, "Result relation's row #7 is correct.");
});

QUnit.test("DIVISION | case #1", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att2", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: 4, att3: 0 },
		{ att1: 1, att2: 8, att3: 0 },
		{ att1: 2, att2: 4, att3: 2 },
		{ att1: 2, att2: 4, att3: 3 },
		{ att1: 3, att2: 8, att3: 4 },
		{ att1: 3, att2: 4, att3: 4 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	r.addRow(rows[3]);
	r.addRow(rows[4]);
	r.addRow(rows[5]);
	
	var s = new Relation("S");
	atts = "att2";
	rows = [
		{ att2: 4 },
		{ att2: 8 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R÷S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof DivisionOperation, "DivisionOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Division operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 2, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "R.att1": 1, "R.att3": 0 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "R.att1": 3, "R.att3": 4 }, "Result relation's row #2 is correct.");
});

QUnit.test("ANTIJOIN | case #1", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att4", "S");
	sm.addAttribute("att2", "S");
	sm.addAttribute("att5", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	
	var s = new Relation("S");
	atts = "att4; att2; att5";
	rows = [
		{ att4: 2, att2: 4, att5: 10 },
		{ att4: 4, att2: 8, att5: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R!@S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof AntijoinOperation, "AntijoinOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Antijoin operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 1, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "R.att1": 1, "R.att2": 3, "R.att3": 5 }, "Result relation's row #1 is correct.");
});

QUnit.test("ANTIJOIN | case #2", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("P.att1", "R");
	sm.addAttribute("Q.att2", "R");
	sm.addAttribute("S.att3", "R");
	sm.addRelation("S");
	sm.addAttribute("A.att4", "S");
	sm.addAttribute("B.att2", "S");
	sm.addAttribute("C.att5", "S");
	sm.addAttribute("D.att3", "S");
	
	var r = new Relation("R");
	var atts = "P.att1; Q.att2; S.att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 8, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 },
		{ att1: 2, att2: 4, att3: 8 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	r.addRow(rows[3]);
	
	var s = new Relation("S");
	atts = "A.att4; B.att2; C.att5; D.att3";
	rows = [
		{ att4: 2, att2: 4, att5: 10, att3: 6},
		{ att4: 2, att2: 4, att5: 10, att3: 5},
		{ att4: 4, att2: 3, att5: 12, att3: 5},
		{ att4: 4, att2: 8, att5: 12, att3: 6}
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	s.addRow(rows[2]);
	s.addRow(rows[3]);

	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R!@S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof AntijoinOperation, "AntijoinOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Antijoin operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 2, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "P.att1": 2, "Q.att2": 8, "S.att3": 5 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "P.att1": 2, "Q.att2": 4, "S.att3": 8 }, "Result relation's row #2 is correct.");
});

QUnit.test("DIVISION | case #2", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("P.att1", "R");
	sm.addAttribute("Q.att2", "R");
	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att2", "S");
	sm.addAttribute("att3", "S");
	
	var r = new Relation("R");
	var atts = "P.att1; Q.att2; att3";
	var rows = [
		{ att1: 1, att2: 4, att3: 0 },
		{ att1: 1, att2: 8, att3: 4 },
		{ att1: 2, att2: 4, att3: 0 },
		{ att1: 2, att2: 4, att3: 3 },
		{ att1: 3, att2: 8, att3: 4 },
		{ att1: 3, att2: 4, att3: 0 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	r.addRow(rows[3]);
	r.addRow(rows[4]);
	r.addRow(rows[5]);
	
	var s = new Relation("S");
	atts = "att2; att3";
	rows = [
		{ att2: 4, att3: 0 },
		{ att2: 8, att3: 4 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R÷S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof DivisionOperation, "DivisionOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Division operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 2, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "P.att1": 1 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "P.att1": 3 }, "Result relation's row #2 is correct.");
});

QUnit.test("CROSSPRODUCT | case #1", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att4", "S");
	sm.addAttribute("att5", "S");
	sm.addAttribute("att6", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	
	var s = new Relation("S");
	atts = "att4; att5; att6";
	rows = [
		{ att4: 2, att5: 6, att6: 10 },
		{ att4: 4, att5: 8, att6: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R×S");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof CrossproductOperation, "CrossproductOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "Crossproduct operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 4, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "R.att1": 1, "R.att2": 3, "R.att3": 5, "S.att4": 2, "S.att5": 6, "S.att6": 10 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "R.att1": 1, "R.att2": 3, "R.att3": 5, "S.att4": 4, "S.att5": 8, "S.att6": 12 }, "Result relation's row #2 is correct.");
	assert.deepEqual(x2.getRow(2), { "R.att1": 2, "R.att2": 4, "R.att3": 6, "S.att4": 2, "S.att5": 6, "S.att6": 10 }, "Result relation's row #3 is correct.");
	assert.deepEqual(x2.getRow(3), { "R.att1": 2, "R.att2": 4, "R.att3": 6, "S.att4": 4, "S.att5": 8, "S.att6": 12 }, "Result relation's row #4 is correct.");
});

QUnit.test("THETA JOIN | case #1", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att4", "S");
	sm.addAttribute("att5", "S");
	sm.addAttribute("att6", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 },
		{ att1: 3, att2: 8, att3: 7 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	
	var s = new Relation("S");
	atts = "att4; att5; att6";
	rows = [
		{ att4: 1, att5: 6, att6: 10 },
		{ att4: 1, att5: 7, att6: 11 },
		{ att4: 9, att5: 6, att6: 10 },
		{ att4: 3, att5: 8, att6: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	s.addRow(rows[2]);
	s.addRow(rows[3]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("THETA(att1==att4;R,S)");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof ThetajoinOperation, "ThetajoinOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "ThetajoinOperation operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 3, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "R.att1": 1, "R.att2": 3, "R.att3": 5, "S.att4": 1, "S.att5": 6, "S.att6": 10 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "R.att1": 1, "R.att2": 3, "R.att3": 5, "S.att4": 1, "S.att5": 7, "S.att6": 11 }, "Result relation's row #2 is correct.");
	assert.deepEqual(x2.getRow(2), { "R.att1": 3, "R.att2": 8, "R.att3": 7, "S.att4": 3, "S.att5": 8, "S.att6": 12 }, "Result relation's row #3 is correct.");
});

QUnit.test("THETA JOIN | case #2", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att4", "S");
	sm.addAttribute("att5", "S");
	sm.addAttribute("att6", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 },
		{ att1: 3, att2: 8, att3: 7 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	
	var s = new Relation("S");
	atts = "att4; att5; att6";
	rows = [
		{ att4: 1, att5: 6, att6: 10 },
		{ att4: 1, att5: 7, att6: 11 },
		{ att4: 9, att5: 6, att6: 10 },
		{ att4: 3, att5: 8, att6: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	s.addRow(rows[2]);
	s.addRow(rows[3]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("THETA(att1<att4||2*att2==att5;R,S)");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof ThetajoinOperation, "ThetajoinOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "ThetajoinOperation operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 6, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "R.att1": 1, "R.att2": 3, "R.att3": 5, "S.att4": 1, "S.att5": 6, "S.att6": 10 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "R.att1": 1, "R.att2": 3, "R.att3": 5, "S.att4": 9, "S.att5": 6, "S.att6": 10 }, "Result relation's row #2 is correct.");
	assert.deepEqual(x2.getRow(2), { "R.att1": 1, "R.att2": 3, "R.att3": 5, "S.att4": 3, "S.att5": 8, "S.att6": 12 }, "Result relation's row #3 is correct.");
	assert.deepEqual(x2.getRow(3), { "R.att1": 2, "R.att2": 4, "R.att3": 6, "S.att4": 9, "S.att5": 6, "S.att6": 10 }, "Result relation's row #4 is correct.");
	assert.deepEqual(x2.getRow(4), { "R.att1": 2, "R.att2": 4, "R.att3": 6, "S.att4": 3, "S.att5": 8, "S.att6": 12 }, "Result relation's row #5 is correct.");
	assert.deepEqual(x2.getRow(5), { "R.att1": 3, "R.att2": 8, "R.att3": 7, "S.att4": 9, "S.att5": 6, "S.att6": 10 }, "Result relation's row #6 is correct.");
});

QUnit.test("THETA JOIN | case #3", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att4", "S");
	sm.addAttribute("att5", "S");
	sm.addAttribute("att6", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: "A", att2: "D", att3: 5 },
		{ att1: "B", att2: "E", att3: 6 },
		{ att1: "C", att2: "F", att3: 7 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	
	var s = new Relation("S");
	atts = "att4; att5; att6";
	rows = [
		{ att4: "ADE", att5: 6, att6: 10 },
		{ att4: "ABF", att5: 7, att6: 11 },
		{ att4: "BEE", att5: 6, att6: 10 },
		{ att4: "CFF", att5: 8, att6: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	s.addRow(rows[2]);
	s.addRow(rows[3]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("THETA(att1+att2+'E'==att4;R,S)");
	var op = getOperation(qtr.source.relations[0]);
	op.execute();
	op = getOperation(qtr.source.relations[1]);
	op.execute();
	
	op = getOperation(qtr);
	assert.ok(op instanceof ThetajoinOperation, "ThetajoinOperation object is created.");
	assert.deepEqual(op.execute(), "_X2", "ThetajoinOperation operation executed successfully.");
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 2, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "R.att1": "A", "R.att2": "D", "R.att3": 5, "S.att4": "ADE", "S.att5": 6, "S.att6": 10 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "R.att1": "B", "R.att2": "E", "R.att3": 6, "S.att4": "BEE", "S.att5": 6, "S.att6": 10 }, "Result relation's row #2 is correct.");
});


//***	CommandManager related tests ***
QUnit.module("A7. CommandManager");

QUnit.test("basic | R+S", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");	sm.addAttribute("att2", "R");	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att1", "S");	sm.addAttribute("att2", "S");	sm.addAttribute("att3", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);	r.addRow(rows[1]);
	
	var s = new Relation("S");
	rows = [
		{ att1: 2, att2: 6, att3: 10 },
		{ att1: 4, att2: 8, att3: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);	s.addRow(rows[1]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R+S");
	
	var cm = new CommandManager(qtr);
	assert.ok(cm instanceof CommandManager, "CommandManager object created.");
	var clist = cm.getCommandList();
	assert.deepEqual(clist.length, 3, "Correct number of operations.");
	assert.deepEqual(clist[0].constructor, CopyOperation, "R");
	assert.deepEqual(clist[1].constructor, CopyOperation, "S");
	assert.deepEqual(clist[2].constructor, UnionOperation, "_X0+X1");
});

QUnit.test("order | R+S-R*S", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");	sm.addAttribute("att2", "R");	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att1", "S");	sm.addAttribute("att2", "S");	sm.addAttribute("att3", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);	r.addRow(rows[1]);
	
	var s = new Relation("S");
	rows = [
		{ att1: 2, att2: 6, att3: 10 },
		{ att1: 4, att2: 8, att3: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);	s.addRow(rows[1]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R+S-R*S");
	
	var cm = new CommandManager(qtr);
	var clist = cm.getCommandList();
	assert.deepEqual(clist.length, 7, "Correct number of operations.");
	assert.deepEqual(clist[0].constructor, CopyOperation, "R #1");
	assert.deepEqual(clist[1].constructor, CopyOperation, "S #1");
	assert.deepEqual(clist[2].constructor, UnionOperation, "_X0+X1");
	assert.deepEqual(clist[3].constructor, CopyOperation, "R #2");
	assert.deepEqual(clist[4].constructor, DifferenceOperation, "_X2-_X3");
	assert.deepEqual(clist[5].constructor, CopyOperation, "S #2");
	assert.deepEqual(clist[6].constructor, IntersectionOperation, "_X4*_X5");
});

QUnit.test("order | R*S-R+S", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");	sm.addAttribute("att2", "R");	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att1", "S");	sm.addAttribute("att2", "S");	sm.addAttribute("att3", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);	r.addRow(rows[1]);
	
	var s = new Relation("S");
	rows = [
		{ att1: 2, att2: 6, att3: 10 },
		{ att1: 4, att2: 8, att3: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);	s.addRow(rows[1]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R*S-R+S");
	
	var cm = new CommandManager(qtr);
	var clist = cm.getCommandList();
	assert.deepEqual(clist.length, 7, "Correct number of operations.");
	assert.deepEqual(clist[0].constructor, CopyOperation, "R #1");
	assert.deepEqual(clist[1].constructor, CopyOperation, "S #1");
	assert.deepEqual(clist[2].constructor, IntersectionOperation, "_X0*X1");
	assert.deepEqual(clist[3].constructor, CopyOperation, "R #2");
	assert.deepEqual(clist[4].constructor, DifferenceOperation, "_X2-_X3");
	assert.deepEqual(clist[5].constructor, CopyOperation, "S #2");
	assert.deepEqual(clist[6].constructor, UnionOperation, "_X4+_X5");
});

QUnit.test("parenthesis | (R+(S-(R*S)))", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");	sm.addAttribute("att2", "R");	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att1", "S");	sm.addAttribute("att2", "S");	sm.addAttribute("att3", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);	r.addRow(rows[1]);
	
	var s = new Relation("S");
	rows = [
		{ att1: 2, att2: 6, att3: 10 },
		{ att1: 4, att2: 8, att3: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);	s.addRow(rows[1]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("(R+(S-(R*S)))");
	
	var cm = new CommandManager(qtr);
	var clist = cm.getCommandList();
	assert.deepEqual(clist.length, 7, "Correct number of operations.");
	assert.deepEqual(clist[0].constructor, CopyOperation, "R #1");
	assert.deepEqual(clist[1].constructor, CopyOperation, "S #1");
	assert.deepEqual(clist[2].constructor, CopyOperation, "R #2");
	assert.deepEqual(clist[3].constructor, CopyOperation, "S #2");
	assert.deepEqual(clist[4].constructor, IntersectionOperation, "_X2*X3");
	assert.deepEqual(clist[5].constructor, DifferenceOperation, "_X1-_X4");
	assert.deepEqual(clist[6].constructor, UnionOperation, "_X0+_X5");
});

QUnit.test("functions | R*SIGMA(att1==1&&att2<3;S)", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");	sm.addAttribute("att2", "R");	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att1", "S");	sm.addAttribute("att2", "S");	sm.addAttribute("att3", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: 1, att2: 3, att3: 5 },
		{ att1: 2, att2: 4, att3: 6 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);	r.addRow(rows[1]);
	
	var s = new Relation("S");
	rows = [
		{ att1: 2, att2: 6, att3: 10 },
		{ att1: 4, att2: 8, att3: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);	s.addRow(rows[1]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("R*SIGMA(att1==1&&att2<3;S)");
	
	var cm = new CommandManager(qtr);
	var clist = cm.getCommandList();
	assert.deepEqual(clist.length, 4, "Correct number of operations.");
	assert.deepEqual(clist[0].constructor, CopyOperation, "R #1");
	assert.deepEqual(clist[1].constructor, CopyOperation, "S #1");
	assert.deepEqual(clist[2].constructor, SelectionOperation, "SIGMA(_X1)");
	assert.deepEqual(clist[3].constructor, IntersectionOperation, "R*_X2");
});

QUnit.test("execute 'THETA JOIN | case #3'", function (assert) {
	var sm = getSymbolManager(true);
	sm.addRelation("R");
	sm.addAttribute("att1", "R");
	sm.addAttribute("att2", "R");
	sm.addAttribute("att3", "R");
	sm.addRelation("S");
	sm.addAttribute("att4", "S");
	sm.addAttribute("att5", "S");
	sm.addAttribute("att6", "S");
	
	var r = new Relation("R");
	var atts = "att1; att2; att3";
	var rows = [
		{ att1: "A", att2: "D", att3: 5 },
		{ att1: "B", att2: "E", att3: 6 },
		{ att1: "C", att2: "F", att3: 7 }
	];
	r.setAttributes(atts);
	r.addRow(rows[0]);
	r.addRow(rows[1]);
	r.addRow(rows[2]);
	
	var s = new Relation("S");
	atts = "att4; att5; att6";
	rows = [
		{ att4: "ADE", att5: 6, att6: 10 },
		{ att4: "ABF", att5: 7, att6: 11 },
		{ att4: "BEE", att5: 6, att6: 10 },
		{ att4: "CFF", att5: 8, att6: 12 }
	];
	s.setAttributes(atts);
	s.addRow(rows[0]);
	s.addRow(rows[1]);
	s.addRow(rows[2]);
	s.addRow(rows[3]);
	
	var rm = getRelationsManager(true);
	rm.addRelation(r);
	rm.addRelation(s);
	
	var p = new Parser();
	var qtr = p.parse("THETA(att1+att2+'E'==att4;R,S)");
	var cm = new CommandManager(qtr);
	var result = cm.execute();
	var x2 = rm.getRelation(result);
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 2, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "R.att1": "A", "R.att2": "D", "R.att3": 5, "S.att4": "ADE", "S.att5": 6, "S.att6": 10 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "R.att1": "B", "R.att2": "E", "R.att3": 6, "S.att4": "BEE", "S.att5": 6, "S.att6": 10 }, "Result relation's row #2 is correct.");
});

//*** QueryManager related tests ***

QUnit.module("A9. QueryManager");

QUnit.test("constructor", function (assert) {
	var qm = new QueryManager();
	assert.ok(qm instanceof QueryManager, "QueryManager object created successfully.");
});

QUnit.test("base input | error check", function (assert) {
	var qm = new QueryManager("", { "R": { name: "R", data: "att1\n1" } });
	assert.throws(function() { qm.execute(); }, new RASRelationalAlgebraicExpressionMissingError(), "Missing relational agebraic expression.");
	
	qm = new QueryManager("R", { "R.a": { name: "R.a", data: "att1\n1" } });
	assert.throws(function() { qm.execute(); }, new RASNotWellFormedError("R.a", i18n.relation[lang]), "Malformed relation name. #1");
	
	qm = new QueryManager("R", { "R+a": { name: "R+a", data: "att1\n1" } });
	assert.throws(function() { qm.execute(); }, new RASNotWellFormedError("R+a", i18n.relation[lang]), "Malformed relation name. #2");
	
	qm = new QueryManager("R", { "R": { name: "R", data: "R.att1\n1" } });
	assert.throws(function() { qm.execute(); }, new RASNotWellFormedError("R.att1", i18n.attribute[lang]), "Malformed attribute name. #1");
	
	qm = new QueryManager("R", { "R": { name: "R", data: "att1;R.att2\n1;2" } });
	assert.throws(function() { qm.execute(); }, new RASNotWellFormedError("R.att2", i18n.attribute[lang]), "Malformed attribute name. #2");
	
	qm = new QueryManager("R", { "R": { name: "R", data: "att1;;att3\n1;2;3" } });
	assert.throws(function() { qm.execute(); }, new RASNotWellFormedError("", i18n.attribute[lang]), "Malformed attribute name. #3");
	
	qm = new QueryManager("R", { "R": { name: "R", data: "att1;att2;att3\n1;2;3" } });
	assert.ok(qm.execute(), "Well-formed input works well.");
});

QUnit.test("correct handling of SM", function (assert) {
	var qm = new QueryManager("R", { "R": { name: "R", data: "att1;att2;att3\n1;2;3" }, "S": { name: "S", data: "att1;att2;att3\n1;2;3" } });
	qm.execute();
	sm = getSymbolManager();
	assert.deepEqual(sm.existsRelation("R"), true, "R is in SM.");
	assert.deepEqual(sm.existsAttribute("att1", "R"), true, "R.att1 is in SM");
	assert.deepEqual(sm.existsAttribute("att2", "R"), true, "R.att2 is in SM");
	assert.deepEqual(sm.existsAttribute("att3", "R"), true, "R.att3 is in SM");
	assert.deepEqual(sm.existsRelation("S"), true, "S is in SM.");
	assert.deepEqual(sm.existsAttribute("att1", "S"), true, "S.att1 is in SM");
	assert.deepEqual(sm.existsAttribute("att2", "S"), true, "S.att2 is in SM");
	assert.deepEqual(sm.existsAttribute("att3", "S"), true, "S.att3 is in SM");
});

QUnit.test("correct handling of RM", function (assert) {
	var qm = new QueryManager("R", { "R": { name: "R", data: "att1;att2;att3\n1;2;3" }, "S": { name: "S", data: "att4;att5;att6\n4;5;6" } });
	qm.execute();
	rm = getRelationsManager();
	var rel = rm.getRelation("R");
	assert.ok(rel instanceof Relation, "R is a Relation");
	assert.deepEqual(rel.getAttributes(), ["R.att1","R.att2","R.att3"], "R attributes are ok.");
	assert.deepEqual(rel.getRow(0), { "R.att1": 1, "R.att2": 2, "R.att3": 3 }, "R row is ok.");
	rel = rm.getRelation("S");
	assert.ok(rel instanceof Relation, "S is a Relation");
	assert.deepEqual(rel.getAttributes(), ["S.att4","S.att5","S.att6"], "S attributes are ok.");
	assert.deepEqual(rel.getRow(0), { "S.att4": 4, "S.att5": 5, "S.att6": 6 }, "S row is ok.");
});

QUnit.test("result is in RM", function (assert) {
	var cmd = "THETA(att1+att2+'E'==att4;R,S)";
	var rels = {
		R: {
			name: "R",
			data: "att1;att2;att3\nA;D;5\nB;E;6\nC;F;7"
		},
		S: {
			name: "S",
			data: "att4;att5;att6\nADE;6;10\nABF;7;11\nBEE;6;10\nCFF;8;12"
		}
	};
	
	var qm = new QueryManager(cmd, rels);
	qm.execute();
	var rm = getRelationsManager();
	var x2 = rm.getRelation("_X2");
	assert.notDeepEqual(x2, undefined, "Result relation exists.");
	assert.deepEqual(x2.getName(), "_X2", "Result relation's name is correct.");
	assert.deepEqual(x2.getRowCount(), 2, "Result relation's rowcount is correct.");
	assert.deepEqual(x2.getRow(0), { "R.att1": "A", "R.att2": "D", "R.att3": 5, "S.att4": "ADE", "S.att5": 6, "S.att6": 10 }, "Result relation's row #1 is correct.");
	assert.deepEqual(x2.getRow(1), { "R.att1": "B", "R.att2": "E", "R.att3": 6, "S.att4": "BEE", "S.att5": 6, "S.att6": 10 }, "Result relation's row #2 is correct.");
});

QUnit.test("result is an InputRelation", function (assert) {
	var cmd = "THETA(att1+att2+'E'==att4;R,S)";
	var rels = {
		R: {
			name: "R",
			data: "att1;att2;att3\nA;D;5\nB;E;6\nC;F;7"
		},
		S: {
			name: "S",
			data: "att4;att5;att6\nADE;6;10\nABF;7;11\nBEE;6;10\nCFF;8;12"
		}
	};
	
	var qm = new QueryManager(cmd, rels);
	var res = qm.execute();
	assert.deepEqual(res.name, "_X2", "Result relation name is correct.");
	assert.deepEqual(res.data, "att1;att2;att3;att4;att5;att6\nA;D;5;ADE;6;10\nB;E;6;BEE;6;10", "Result relation data is correct.");
});

QUnit.module("A8. User Interface controller");

QUnit.test("constructor", function (assert) {
	var uic = new UserInterfaceController();
	assert.ok(uic instanceof UserInterfaceController, "UserInterfaceController created successfully.");
});

QUnit.test("table insert", function (assert) {
	$("#qunit-fixture").append('<div id="userDefinedRelations" class="row">');
	$("#userDefinedRelations").append('<div id="addRelation" />');
	var uic = new UserInterfaceController();
	uic.setup();
	assert.deepEqual(uic.numberOfRelations(), 0, "No relations yet.");
	assert.deepEqual(uic.insertRelation("R", "att1;att2\n1;2"), 1, "Relation added successfully.");
	assert.deepEqual(uic.numberOfRelations(), 1, "One relation set.");
	assert.deepEqual($("#relation1_name").val(), "R", "Data is set.");
	assert.deepEqual($("#relation1_raw").val(), "att1;att2\n1;2", "Data is set.");
});

QUnit.test("table deletion", function (assert) {
	$("#qunit-fixture").append('<div id="userDefinedRelations" class="row">');
	$("#userDefinedRelations").append('<div id="addRelation" />');
	var uic = new UserInterfaceController();
	uic.setup();
	assert.deepEqual(uic.numberOfRelations(), 0, "No relations yet.");
	uic.insertRelation("R", "att1;att2\n1;2");
	assert.deepEqual(uic.numberOfRelations(), 1, "One relation set.");
	assert.deepEqual(uic.deleteRelation(1), true, "Relation deleted successfully.");
	assert.deepEqual(uic.numberOfRelations(), 0, "No relations again.");
	
	uic.insertRelation("R", "att1;att2\n1;2");
	assert.deepEqual(uic.numberOfRelations(), 1, "One relation set.");
	assert.deepEqual(uic.deleteRelation("#relation1"), true, "Relation deleted successfully.");
	assert.deepEqual(uic.numberOfRelations(), 0, "No relations again.");
	
	uic.insertRelation("R", "att1;att2\n1;2");
	assert.deepEqual(uic.numberOfRelations(), 1, "One relation set.");
	assert.deepEqual(uic.deleteRelation("relation1"), true, "Relation deleted successfully.");
	assert.deepEqual(uic.numberOfRelations(), 0, "No relations again.");
	
	uic.insertRelation("R", "att1;att2\n1;2");
	assert.deepEqual(uic.numberOfRelations(), 1, "One relation set.");
	assert.deepEqual(uic.deleteRelation($("#relation1")), true, "Relation deleted successfully.");
	assert.deepEqual(uic.numberOfRelations(), 0, "No relations again.");
});

QUnit.test("table - row conversion", function (assert) {
	$("#qunit-fixture").append('<div id="userDefinedRelations" class="row">');
	$("#userDefinedRelations").append('<div id="addRelation" />');
	var uic = new UserInterfaceController();
	uic.setup();
	uic.insertRelation("R", "att1;att2\n1;2");
	
	assert.deepEqual(uic.convertRawToTable(1), true, "Conversion from raw data to table successful.");
	
	var jTable = $("#relation1_table");
	assert.deepEqual(jTable.length, 1, "One table found - not much success by itself.");
	assert.deepEqual($("#relation1_name").val(), "R", "Table name correct.");
	
	var jBlock = jTable.find("thead tr th");
	assert.deepEqual(jBlock.length, 2, "Headers found.");
	var jItem = jBlock.first("th");
	assert.deepEqual(jItem.html(), "att1", "Attribute #1 found.");
	jItem = jItem.next("th");
	assert.deepEqual(jItem.html(), "att2", "Attribute #2 found.");
	
	jBlock = jTable.find("tbody tr td");
	assert.deepEqual(jBlock.length, 2, "Cells found.");
	jItem = jBlock.first("td");
	assert.deepEqual(jItem.html(), "1", "Cell #1 found.");
	jItem = jItem.next("td");
	assert.deepEqual(jItem.html(), "2", "Cell #2 found.");
});

QUnit.test("table - row conversion on change", function (assert) {
	$("#qunit-fixture").append('<div id="userDefinedRelations" class="row" />');
	$("#userDefinedRelations").append('<div id="addRelation" />');
	var uic = new UserInterfaceController();
	uic.setup();
	uic.insertRelation("R", "att1;att2\n1;2");
	uic.convertRawToTable(1);
	
	$("#qunit-fixture #relation1_table").dblclick();
	$("#qunit-fixture #relation1_raw").val("att3;att4\n3;4");
	$("#qunit-fixture #relation1_raw").change();
	$("#qunit-fixture #relation1_raw").blur();

	var jTable = $("#relation1_table");
	var jBlock = jTable.find("thead tr th");
	var jItem = jBlock.first("th");
	assert.deepEqual(jItem.html(), "att3", "Attribute #1 found.");
	jItem = jItem.next("th");
	assert.deepEqual(jItem.html(), "att4", "Attribute #2 found.");
	
	jBlock = jTable.find("tbody tr td");
	jItem = jBlock.first("td");
	assert.deepEqual(jItem.html(), "3", "Cell #1 found.");
	jItem = jItem.next("td");
	assert.deepEqual(jItem.html(), "4", "Cell #2 found.");
});

QUnit.test("table insert - using newRelation form", function (assert) {
	setupPage();
	
	var uic = new UserInterfaceController();
	uic.setup();
	
	assert.deepEqual(uic.numberOfRelations(), 0, "No relations yet.");
	$("#relationnew_name").val("R");
	$("#relationnew_data").val("att1;att2\n1;2");
	$("#relationnew_add").click();
	assert.deepEqual(uic.numberOfRelations(), 1, "One relation set.");
	
	var jTable = $("#relation1_table");
	assert.deepEqual(jTable.length, 1, "One table found - not much success by itself.");
	
	var jBlock = jTable.find("thead tr th");
	assert.deepEqual(jBlock.length, 2, "Headers found.");
	var jItem = jBlock.first("th");
	assert.deepEqual(jItem.html(), "att1", "Attribute #1 found.");
	jItem = jItem.next("th");
	assert.deepEqual(jItem.html(), "att2", "Attribute #2 found.");
	
	jBlock = jTable.find("tbody tr td");
	assert.deepEqual(jBlock.length, 2, "Cells found.");
	jItem = jBlock.first("td");
	assert.deepEqual(jItem.html(), "1", "Cell #1 found.");
	jItem = jItem.next("td");
	assert.deepEqual(jItem.html(), "2", "Cell #2 found.");
});

QUnit.test("table deletion - using delete button", function (assert) {
	setupPage();
	
	var uic = new UserInterfaceController();
	uic.setup();
	$("#relationnew_name").val("R");
	$("#relationnew_data").val("att1;att2\n1;2");
	$("#relationnew_add").click();
	$("#relationnew_name").val("S");
	$("#relationnew_data").val("att1;att2\n3;4");
	$("#relationnew_add").click();
	$("#relationnew_name").val("Q");
	$("#relationnew_data").val("att1;att2\n5;6");
	$("#relationnew_add").click();
	assert.deepEqual(uic.numberOfRelations(), 3, "Three relations set.");
	$("#relation2_del").click();
	assert.deepEqual(uic.numberOfRelations(), 2, "Two relations remain.");
	
	var jTable = $("#relation1_table");
	assert.deepEqual(jTable.length, 1, "One table found - not much success by itself.");
	assert.deepEqual($("#relation1_name").val(), "R", "Table name correct.");
	
	var jBlock = jTable.find("thead tr th");
	assert.deepEqual(jBlock.length, 2, "Headers found.");
	var jItem = jBlock.first("th");
	assert.deepEqual(jItem.html(), "att1", "Attribute #1 found.");
	jItem = jItem.next("th");
	assert.deepEqual(jItem.html(), "att2", "Attribute #2 found.");
	
	jBlock = jTable.find("tbody tr td");
	assert.deepEqual(jBlock.length, 2, "Cells found.");
	jItem = jBlock.first("td");
	assert.deepEqual(jItem.html(), "1", "Cell #1 found.");
	jItem = jItem.next("td");
	assert.deepEqual(jItem.html(), "2", "Cell #2 found.");
	
	jTable = $("#relation3_table");
	assert.deepEqual(jTable.length, 1, "One table found - not much success by itself.");
	assert.deepEqual($("#relation3_name").val(), "Q", "Table name correct.");
	
	jBlock = jTable.find("thead tr th");
	assert.deepEqual(jBlock.length, 2, "Headers found.");
	jItem = jBlock.first("th");
	assert.deepEqual(jItem.html(), "att1", "Attribute #1 found.");
	jItem = jItem.next("th");
	assert.deepEqual(jItem.html(), "att2", "Attribute #2 found.");
	
	jBlock = jTable.find("tbody tr td");
	assert.deepEqual(jBlock.length, 2, "Cells found.");
	jItem = jBlock.first("td");
	assert.deepEqual(jItem.html(), "5", "Cell #1 found.");
	jItem = jItem.next("td");
	assert.deepEqual(jItem.html(), "6", "Cell #2 found.");
	
	assert.deepEqual($("#relation2").length, 0, "Deleted relation is no more.");
});

QUnit.test("execute", function (assert) {
	// SETUP PAGE
	setupPage();
	
	var uic = new UserInterfaceController();
	uic.setup();
	
	// INPUT DATA
	$("#relationnew_name").val("R");
	$("#relationnew_data").val("att1;att2\n1;2");
	$("#relationnew_add").click();
	$("#relationnew_name").val("S");
	$("#relationnew_data").val("att1;att2\n3;4");
	$("#relationnew_add").click();
	$("#relationnew_name").val("Q");
	$("#relationnew_data").val("att1;att2\n5;6");
	$("#relationnew_add").click();
	assert.deepEqual(uic.numberOfRelations(), 3, "Three relations set.");
	
	// EXECUTE
	$("#queryCommand").val("R+S+Q");
	$("#startQuery").click();
	
	// ASSERT
	var jTable = $("#relation0_table");
	assert.deepEqual(jTable.length, 1, "Result table found - not much success by itself.");
	
	var jBlock = jTable.find("thead tr th");
	assert.deepEqual(jBlock.length, 2, "Headers found.");
	var jItem = jBlock.first("th");
	assert.deepEqual(jItem.html(), "att1", "Attribute #1 found.");
	jItem = jItem.next("th");
	assert.deepEqual(jItem.html(), "att2", "Attribute #2 found.");
	
	jBlock = jTable.find("tbody tr");
	assert.deepEqual(jBlock.length, 3, "3 rows found.");
	jBlock = jTable.find("tbody");
	var jRow = jBlock.children("tr:nth-child(1)");
	assert.deepEqual(jRow.children("td:nth-child(1)").text(), "1", "Row #1 Cell #1 correct");
	assert.deepEqual(jRow.children("td:nth-child(2)").text(), "2", "Row #1 Cell #2 correct");
	jRow = jBlock.children("tr:nth-child(2)");
	assert.deepEqual(jRow.children("td:nth-child(1)").text(), "3", "Row #2 Cell #1 correct");
	assert.deepEqual(jRow.children("td:nth-child(2)").text(), "4", "Row #2 Cell #2 correct");
	jRow = jBlock.children("tr:nth-child(3)");
	assert.deepEqual(jRow.children("td:nth-child(1)").text(), "5", "Row #3 Cell #1 correct");
	assert.deepEqual(jRow.children("td:nth-child(2)").text(), "6", "Row #3 Cell #2 correct");
	
	assert.deepEqual($("#relation0_raw").val(), "att1;att2\n1;2\n3;4\n5;6", "Result raw data is correct.");
});

QUnit.test("add result relation to source relations", function (assert) {
	// SETUP PAGE
	setupPage();
	
	var uic = new UserInterfaceController();
	uic.setup();
	
	// INPUT DATA
	$("#relationnew_name").val("R");
	$("#relationnew_data").val("att1;att2\n1;2");
	$("#relationnew_add").click();
	
	// EXECUTE
	$("#addResultRelation").click();
	var jTable = $("#relation2_table");
	assert.deepEqual(jTable.length, 0, "Result table not found - good, we don't want to add empty result tables as source table.");
	
	$("#queryCommand").val("R+R");
	$("#startQuery").click();
	
	$("#addResultRelation").click();
	
	jTable = $("#relation2_table");
	assert.deepEqual(jTable.length, 1, "Result table found - not much success by itself.");
});

function setupPage() {
	var addr = '<div id="addRelation" class="col-lg-3 col-md-4 relation"> \
		<div class="input-group"> \
			<input type="text" id="relationnew_name" class="span form-control" placeholder="Reláció neve" /> \
			<span class="input-group-btn"> \
				<button type="button" id="relationnew_add" class="btn btn-success btn-default relationButton"><strong>+</strong></button> \
			</span> \
		</div> \
		<textarea id="relationnew_data" class="form-control relationRaw" placeholder="Táblázat" rows="3"></textarea> \
	</div>';
	var resrel = '<div id="relation0" class="col-lg-6 relation relationBlock"> \
		<div id="relation0_data" class="relationData">	\
			<table id="relation0_table" class="table table-hover relationTable"></table>	\
			<textarea id="relation0_raw" class="form-control relationRaw" placeholder=""class="form-control" rows="3"></textarea>\
		</div>\
	</div>';
	
	$("#qunit-fixture").append('<div id="userDefinedRelations" class="row" />');
	$("#qunit-fixture").append('<textarea id="queryCommand" class="form-control"></textarea>');
	$("#qunit-fixture").append('<button type="button" id="startQuery" class="btn btn-success btn-default col-lg-12">Go!</button>');
	$("#qunit-fixture").append('<button id="addResultRelation" class="btn btn-xs btn-success pull-right" title="Add result as a source relation">+</button>');
	$("#qunit-fixture").append('<div id="results" class="row" />');
	$("#qunit-fixture").append('<div id="errorContainer" />');
	$("#qunit-fixture #userDefinedRelations").append(addr);
	$("#qunit-fixture #results").append(resrel);
}

QUnit.module("A9. Load/Save relations", {
	beforeEach: function() {
		localStorage.clear();
	}
});

QUnit.test("save relation", function (assert) {
	var lsr = LoadSaveRelations;
	lsr.add("R", "att1;att2\n1;2");
	assert.deepEqual(localStorage.getItem("rel_R"), "att1;att2\n1;2", "Local storage contains the saved element.");
	localStorage.removeItem("rel_R");	// keeping it clean
});

QUnit.test("load relation", function (assert) {
	var lsr = LoadSaveRelations;
	assert.deepEqual(lsr.get("R"), null, "LoadSaveRelations doesn't have the relation before adding it.");
	lsr.add("R", "att1;att2\n1;2");
	assert.deepEqual(lsr.get("R"), "att1;att2\n1;2", "LoadSaveRelations has the relation after adding it.");
	localStorage.removeItem("rel_R");	// keeping it clean
});

QUnit.test("exists relation", function (assert) {
	var lsr = LoadSaveRelations;
	assert.deepEqual(lsr.exists("R"), false, "LoadSaveRelations doesn't have the relation before adding it.");
	lsr.add("R", "att1;att2\n1;2");
	assert.deepEqual(lsr.exists("R"), true, "LoadSaveRelations has the relation after adding it.");
	localStorage.removeItem("rel_R");	// keeping it clean
});

QUnit.test("list relations", function (assert) {
	localStorage.setItem("X", "");
	localStorage.setItem("S_rel_S", "");
	var lsr = LoadSaveRelations;
	assert.deepEqual(lsr.listNames(), [], "LoadSaveRelations return empty array when there are no relations.");
	lsr.add("R", "att1;att2\n1;2");
	assert.deepEqual(lsr.listNames(), ["R"], "LoadSaveRelations return proper array when there is one relation.");
	lsr.add("S", "att1;att2\n1;2");
	assert.deepEqual(lsr.listNames(), ["R", "S"], "LoadSaveRelations return proper array when there are two relations.");
	localStorage.removeItem("rel_R");	// keeping it clean
	localStorage.removeItem("rel_S");	// keeping it clean
	localStorage.removeItem("X");		// keeping it clean
	localStorage.removeItem("S_rel_S");	// keeping it clean
});

QUnit.test("delete relation", function (assert) {
	var lsr = LoadSaveRelations;
	lsr.add("R", "att1;att2\n1;2");
	assert.deepEqual(lsr.get("R"), "att1;att2\n1;2", "LoadSaveRelations has the relation after adding it.");
	lsr.del("R");
	assert.deepEqual(lsr.get("R"), null, "LoadSaveRelations doesn't have the relation after deleting it.");
});

QUnit.module("E1. Malformed input error tests");

QUnit.test("relation names", function (assert) {
	setupPage();
	var uic = new UserInterfaceController();
	uic.setup();
	
	// INPUT DATA
	$("#relationnew_name").val("123");
	$("#relationnew_data").val("att1;att2\n1;2");
	$("#relationnew_add").click();
	assert.deepEqual(uic.numberOfRelations(), 1, "Relations set.");
	
	// EXECUTE
	$("#queryCommand").val("123");
	$("#startQuery").click();
	assert.deepEqual($("#overlay").length, 1, "Error overlay appeared.");
	assert.deepEqual($("#error").length, 1, "Errormessage appeared.");
});

QUnit.test("attribute names", function (assert) {
	setupPage();
	var uic = new UserInterfaceController();
	uic.setup();
	
	// INPUT DATA
	$("#relationnew_name").val("R");
	$("#relationnew_data").val("123;456\n1;2");
	$("#relationnew_add").click();
	assert.deepEqual(uic.numberOfRelations(), 1, "Relations set.");
	
	// EXECUTE
	$("#queryCommand").val("R");
	$("#startQuery").click();
	assert.deepEqual($("#overlay").length, 1, "Error overlay appeared.");
	assert.deepEqual($("#error").length, 1, "Errormessage appeared.");
});

QUnit.test("missing attributes", function (assert) {
	setupPage();
	var uic = new UserInterfaceController();
	uic.setup();
	
	// INPUT DATA
	$("#relationnew_name").val("R");
	$("#relationnew_data").val("a;;b\n1;2;");
	$("#relationnew_add").click();
	assert.deepEqual($("#error").length, 1, "Errormessage appeared.");
});

QUnit.test("handling trailing ; marks in attributes", function (assert) {
	setupPage();
	var uic = new UserInterfaceController();
	uic.setup();
	
	// INPUT DATA
	$("#relationnew_name").val("R");
	$("#relationnew_data").val("a;\n1");
	$("#relationnew_add").click();
	assert.deepEqual($("#relation1_table thead tr th").length, 1, "Trailing ; disregarded.");
});

QUnit.test("missing values", function (assert) {
	setupPage();
	var uic = new UserInterfaceController();
	uic.setup();
	
	// INPUT DATA
	$("#relationnew_name").val("R");
	$("#relationnew_data").val("a;b;c\n1;3");
	$("#relationnew_add").click();
	assert.deepEqual($("#error").length, 1, "Errormessage appeared.");
});

QUnit.test("extra values", function (assert) {
	setupPage();
	var uic = new UserInterfaceController();
	uic.setup();
	
	// INPUT DATA
	$("#relationnew_name").val("R");
	$("#relationnew_data").val("a;b\n1;2;3");
	$("#relationnew_add").click();
	assert.deepEqual($("#error").length, 1, "Errormessage appeared.");
});

QUnit.test("handling trailing ; marks in values", function (assert) {
	setupPage();
	var uic = new UserInterfaceController();
	uic.setup();
	
	// INPUT DATA
	$("#relationnew_name").val("R");
	$("#relationnew_data").val("a;b\n1;2;");
	$("#relationnew_add").click();
	assert.deepEqual($("#relation1_table tbody tr td").length, 2, "Trailing ; disregarded.");
});

QUnit.test("handling trailing CRLF", function (assert) {
	setupPage();
	var uic = new UserInterfaceController();
	uic.setup();
	
	// INPUT DATA
	$("#relationnew_name").val("R");
	$("#relationnew_data").val("a;b\n1;2\n");
	$("#relationnew_add").click();
	assert.deepEqual($("#relation1_table tbody tr").length, 1, "Trailing LF disregarded.");
	
	$("#relationnew_name").val("R");
	$("#relationnew_data").val("a;b\r\n1;2\r\n");
	$("#relationnew_add").click();
	assert.deepEqual($("#relation2_table tbody tr").length, 1, "Trailing CRLF disregarded.");
});

QUnit.test("handling TSV data", function (assert) {
	setupPage();
	var uic = new UserInterfaceController();
	uic.setup();
	
	// INPUT DATA
	$("#relationnew_name").val("R");
	$("#relationnew_data").val("a\tb\n1\t2");
	$("#relationnew_add").click();
	assert.deepEqual($("#relation1_table tbody tr td").length, 2, "TSV handled.");
	
	$("#queryCommand").val("R+R");
	$("#startQuery").click();
	
	var jTable = $("#relation0_table");
	assert.deepEqual(jTable.length, 1, "Result table found - not much success by itself.");
	var jBlock = jTable.find("thead tr th");
	assert.deepEqual(jBlock.length, 2, "Headers found.");
});

QUnit.test("adding relation with missing values", function (assert) {
	setupPage();
	var uic = new UserInterfaceController();
	uic.setup();
	
	// INPUT DATA
	$("#relationnew_name").val("");
	$("#relationnew_data").val("");
	$("#relationnew_add").click();
	assert.deepEqual($("#error").length, 1, "Errormessage appeared.");
	$("#error_btnok").click();
	assert.deepEqual($("#error").length, 0, "Errormessage disappeared.");
	
	$("#relationnew_name").val("R");
	$("#relationnew_data").val("");
	$("#relationnew_add").click();
	assert.deepEqual($("#error").length, 1, "Errormessage appeared.");
	$("#error_btnok").click();
	assert.deepEqual($("#error").length, 0, "Errormessage disappeared.");
	
	$("#relationnew_name").val("");
	$("#relationnew_data").val("a\n1");
	$("#relationnew_add").click();
	assert.deepEqual($("#error").length, 1, "Errormessage appeared.");
});

QUnit.test("non-unique relation names", function (assert) {
	setupPage();
	var uic = new UserInterfaceController();
	uic.setup();
	
	// INPUT DATA
	$("#relationnew_name").val("R");
	$("#relationnew_data").val("a\n1");
	$("#relationnew_add").click();
	
	$("#relationnew_name").val("R");
	$("#relationnew_data").val("b\n");
	$("#relationnew_add").click();

	$("#queryCommand").val("R");
	$("#startQuery").click();
	assert.deepEqual($("#overlay").length, 1, "Error overlay appeared.");
	assert.deepEqual($("#error").length, 1, "Errormessage appeared.");
});

QUnit.test("non-unique attribute names", function (assert) {
	setupPage();
	var uic = new UserInterfaceController();
	uic.setup();
	
	// INPUT DATA
	$("#relationnew_name").val("R");
	$("#relationnew_data").val("a;a\n1;2");
	$("#relationnew_add").click();

	$("#queryCommand").val("R");
	$("#startQuery").click();
	assert.deepEqual($("#overlay").length, 1, "Error overlay appeared.");
	assert.deepEqual($("#error").length, 1, "Errormessage appeared.");
});

QUnit.module("B1. Arithmetic input tests");
QUnit.test("basic arithmetics", function (assert) {
	setupPage();
	var jTable;
	var uic = new UserInterfaceController();
	uic.setup();
	
	// INPUT DATA
	$("#relationnew_name").val("R");
	$("#relationnew_data").val("a;b;c;d\n2;3;10;11");
	$("#relationnew_add").click();
	
	$("#queryCommand").val("PI(a+b;R)");
	$("#startQuery").click();
	jTable = $("#relation0_table");
	assert.deepEqual(jTable.find("tbody td").first().text(), "5", "Additional is okay.");
	
	$("#queryCommand").val("PI(a-b;R)");
	$("#startQuery").click();
	jTable = $("#relation0_table");
	assert.deepEqual(jTable.find("tbody td").first().text(), "-1", "Distraction is okay.");
	
	$("#queryCommand").val("PI(a*b;R)");
	$("#startQuery").click();
	jTable = $("#relation0_table");
	assert.deepEqual(jTable.find("tbody td").first().text(), "6", "Multiplication is okay.");
	
	$("#queryCommand").val("PI(c/a;R)");
	$("#startQuery").click();
	jTable = $("#relation0_table");
	assert.deepEqual(jTable.find("tbody td").first().text(), "5", "Division is okay.");
	
	$("#queryCommand").val("PI(d%b;R)");
	$("#startQuery").click();
	jTable = $("#relation0_table");
	assert.deepEqual(jTable.find("tbody td").first().text(), "2", "Modulo is okay.");
	
	$("#queryCommand").val("PI(a^b;R)");
	$("#startQuery").click();
	jTable = $("#relation0_table");
	assert.deepEqual(jTable.find("tbody td").first().text(), "8", "Power is okay.");
});