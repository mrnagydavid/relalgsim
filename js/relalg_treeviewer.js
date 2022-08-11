/**
	Relational Algebra Simulator
	author: David Nagy (mrnagydavid)
	
	version: 1.0
	
	@license MIT
*/
var __RELALG_TREEVIEWER = true;

// nem constructor - function
/**
 *	This function is used by the ProcessingJS module to draw on the HTML canvas.
 *	It takes the last QueryTreeRelation set to the TreeManager and traverses that graph to create a binary tree drawing of it on the HTML canvas element.
 *	@function
 *	@param {ProcessingJS} P
 */
function treeViewer(P) {
	var canvasW = 300;
	var canvasH = 300;
	var viewX = 0;
	var viewY = 0;
	var viewS = 1;
	var viewSOptimal = 1;
	var pmouseX = 0;
	var pmouseY = 0;
	var mouseActive = false;
	var blockW = 20;
	var blockH = 20;
	var blockMargin = 10;
	var myFont;
	var graph;
	
	P.setup = function() {
		P.size(canvasW, canvasH);
		graph = traverseTree(getTreeManager().last);
		
		//viewY =  (graph.level === -2) ? canvasH/2 : ((graph.level+3)*(blockH + blockMargin) - blockMargin) / 2;
		//viewY = (graph.level < -1) ? 150 : 150 - ((graph.level+3)*(blockH + blockMargin) - blockMargin) / 2;
		//viewY = canvasH/2;
		//viewY = ((graph.level+3)*(blockH + blockMargin) - blockMargin);
		// if (graph.level === -2) {
			// viewY = canvasH;
		// } else if (graph.level === -1) {
			// viewY = canvasH/2;
		// } else {
			// viewY = ((graph.level+3)*(blockH + blockMargin) - blockMargin);
		// }
		viewY = canvasH/Math.pow(2, graph.level+2) + (Math.pow(2, graph.level+0.5))*blockMargin;
		viewX = canvasW/2;
		
		//viewSOptimal = 1 / (((graph.level+3)*(blockH + blockMargin)) / canvasH);
		viewSOptimal = Math.min(canvasW / (((Math.pow(2, graph.level+2)) * blockW)), canvasH / (((graph.level+3)*(blockH + blockMargin) - blockMargin)));
		viewS = viewSOptimal;
		
		myFont = P.createFont("Cambria Math", 72);
		//myFont = P.createFont("Segoe UI Symbol", 32);
		P.textFont(myFont);
		
		//console.log(canvasW / (((Math.pow(2, graph.level+2)) * blockW)), canvasH / (((graph.level+3)*(blockH + blockMargin) - blockMargin)));
		//console.log(viewX, viewY, viewS);
	}
	
	P.draw = function() {
		P.background(255, 255, 255);
		P.stroke(0, 0, 0);
		P.fill(0, 0, 0);
		
		//P.ellipse(150, 150, 1, 1);
		
		P.scale(viewS);
		P.translate(viewX/viewS, viewY/viewS/2);
		graph.draw();

		//P.ellipse(0, 0, 1, 1);		
	}
	
	P.mouseOut = function() {
		mouseActive = false;
	}
	
	P.mouseMoved = function() {
		pmouseX = P.mouseX;
		pmouseY = P.mouseY;
		mouseActive = true;
	}
	
	P.mouseDragged = function() {
		viewX += (P.mouseX - pmouseX);
		viewY += (P.mouseY - pmouseY);
		pmouseX = P.mouseX;
		pmouseY = P.mouseY;
	}
	
	P.mouseClicked = function() {
		if (P.mouseButton === P.LEFT) {
			viewS += 0.5;
		} else if (P.mouseButton === P.RIGHT) {
			viewS += -0.5
		} else {
			viewS = viewSOptimal;
		}
	}
	
	/**
	 *	Recursive function to traverse the tree depth-first post-order.
	 *	It builds up an anonymous object also in a recursive-fashion.
	 *	Every level has a 'level' field and a 'draw' function.
	 *	Each draw function incorporates the draw function of the lower level.
	 *	So calling the top-level draw() actually draws the whole tree.
	 *	@param {QueryTreeRelation} qtr
	*/
	function traverseTree(qtr) {
		var left;
		var right;
		var mid;
		var lvl;
		
		if (qtr.source.cmd === "COPY") {
			return {
				draw: function() {
					doDraw(qtr.source); 
				},
				level: -2
			};
		} else {
			if (typeof qtr.source.relations !== "undefined") {
				left = traverseTree(qtr.source.relations[0]);
				right = traverseTree(qtr.source.relations[1]);
				lvl = Math.max(left.level,right.level);
				return {
					draw: function() {
						doDraw(qtr.source);
						P.line(-2, blockH*0.5+2, -blockW * Math.pow(2, lvl)+2, blockH*0.5+blockMargin-2);
						P.line(2, blockH*0.5+2, blockW * Math.pow(2, lvl)-2, blockH*0.5+blockMargin-2);
						
						P.pushMatrix();
						P.translate(-blockW * Math.pow(2, lvl), blockH+blockMargin);
						left.draw();
						//P.noFill();
						//P.rect(-10, -10, 20, 20);
						//P.ellipse(0,0,1,1);
						P.popMatrix();
						
						P.pushMatrix();
						P.translate(blockW * Math.pow(2, lvl), blockH+blockMargin);
						right.draw();
						//P.noFill();
						//P.rect(-10, -10, 20, 20);
						//P.ellipse(0,0,1,1);
						P.popMatrix();
					},
					level: ++lvl
				};
			} else if (typeof qtr.source.relation !== "undefined") {
				mid = traverseTree(qtr.source.relation);
				return {
					draw: function() {
						doDraw(qtr.source);
						P.line(0, blockH*0.5, 0, blockH*0.5+blockMargin);
						P.pushMatrix();
						P.translate(0, blockH+blockMargin);
						mid.draw();
						//P.noFill();
						//P.rect(-10, -10, 20, 20);
						//P.ellipse(0,0,1,1);
						P.popMatrix();
					},
					level: mid.level + 1
				};
			} else {
				throw new RASQueryTreeError();
			}
		}
	}
	
	/**
	 *	This is used to draw a given vertex.
	 *	@param {QueryTreeRelationDetails} source
	 */
	function doDraw(source) {
		var param;
		
		/**
		 *	Helper function to draw the vertex. If both parameters are specified, it aligns elements so that the 'parameter' can be shown too.
		 *	@param {String} p1
		 *	@param {String} [p2]
		 */
		function draw(p1, p2) {
			var txtsize;
			p1 = p1.toString();
			if (typeof p2 === "undefined") {
				txtsize = 0.9;
				if (p1.length > 9) {
					p1 = p1.substr(0, 3) + "-\n" + p1.substr(3, 3) + "-\n" + p1.substr(6, 3) + "...";
					txtsize = 0.25;
				} else if (p1.length > 6) {
					p1 = p1.substr(0, 3) + "-\n" + p1.substr(3, 3) + "-\n" + p1.substr(6);
					txtsize = 0.3;
				} else if (p1.length > 3) {
					p1 = p1.substr(0, 3) + "-\n" + p1.substr(3);
					txtsize = 0.4;
				} else if (p1.length === 3) {
					txtsize = 0.4;
				}
				P.textAlign(P.CENTER, P.CENTER);
				P.textSize(blockH * txtsize);
				P.text(p1, 0, 0);
			} else {
				p2 = p2.toString();
				if (p2.length > 10) {
					p2 = p2.substr(0,10) + "...";
				}
				P.textAlign(P.CLEFT, P.CENTER);
				P.textSize(blockH * 0.9);
				P.text(p1, -blockW*0.5, -blockH*0.3);
				P.textAlign(P.LEFT, P.CENTER);
				P.textSize(blockH * 0.3);
				P.text(p2, 0, blockH*0.3);
			}
		}
		
		switch (source.cmd) {
			case "COPY":
				draw(source.relation);
				break;
			case "DISTINCT":
				draw("δ");
				break;
			case "RENAME_RELATION":
				draw("ϱ", source.parameter);
				break;
			case "SORT":
				draw("τ", Object.keys(source.parameter).join(','));
				break;
			case "RENAME_ATTRIBUTES":
				param = [];
				for (i in source.parameter.old) {
					param.push(source.parameter.old[i] + "/" + source.parameter['new'][i]);
				}
				draw("ϱ", param.join(','));
				break;
			case "SELECTION":
				draw("σ", source.parameter.esc.replace(new RegExp('%', 'g'), ''));
				break;
			case "PROJECTION":
				draw("π", Object.keys(source.parameter).join(','));
				break;
			case "GROUPBY":
				draw("γ", Object.keys(source.parameter).join(','));
				break;
			case "UNION":
				draw("+");
				break;
			case "DIFFERENCE":
				draw("-");
				break;
			case "INTERSECTION":
				draw("*");
				break;
			case "NATURAL_JOIN":
				draw('\u22c8');
				break;
			case "LEFT_SEMI_JOIN":
				draw('\u22c9');
				break;
			case "RIGHT_SEMI_JOIN":
				draw('\u22ca');
				break;
			case "LEFT_OUTER_JOIN":
				draw('\u27d5');
				break;
			case "RIGHT_OUTER_JOIN":
				draw('\u27d6');
				break;
			case "FULL_OUTER_JOIN":
				draw('\u27d7');
				break;
			case "ANTI_JOIN":
				draw('\u25b7');
				break;
			case "DIVISION":
				draw('÷');
				break;
			case "CROSSPRODUCT":
				draw('×');
				break;
			case "THETA_JOIN":
				draw("θ", source.parameter.esc.replace(new RegExp('%', 'g'), ''));
				break;
		}
	}
}

/**
 *	TreeManager is used to collect every querytree that is created during the process.
 *	Currently it has little use, but if query-tree optimization is once implemented,
 *	the different steps of the optimization can be saved as snapshots.
 *	If the treeViewer is updated to handle this, it could be used to draw the different graphs 
 *	after each step of optimization.
 *	@constructor
 */
function TreeManager() {
	var that = this;
	
	var qtrs = [];
	this.length = 0;
	this.last;
	
	/**
	 *	Adds a querytree to the list.
	 *	@param {QueryTreeRelation} qtr
	 */
	this.addTree = function(qtr) {	
		qtrs.push(qtr);
		that.last = qtr;
		++that.length;
	}
	/**
	 *	Returns with the query tree specified by the index number.
	 *	@param {Number} nr
	 *	@return {QueryTreeRelation}
	 */
	this.getTree = function(nr) {
		return qtrs[nr];
	}
}

/**
 *	This is a factory for TreeManager.
 *	As many objects depend on a single instance of TreeManager,
 *	this is a factory to get an instance of it.
 *	If it has not yet been created, it first instantiates it.
 *	@param {boolean} newcopy Indicates whether a new copy of TreeManager is to be created,
 *		regardless of a previously existing one. Chiefly used by the unit test module.
 *	@return {TreeManager}
 */
function getTreeManager(newcopy) {
	if (newcopy || getTreeManager.tm === undefined) {
		getTreeManager.tm = new TreeManager();
	}
	return getTreeManager.tm;
}