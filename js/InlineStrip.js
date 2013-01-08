var styleSheet = '';
var elementStyle = '';
var originalHTMLString = '';
var deStyledHTMLString = '';
var parseResult;
var savedValue = '';
$(document).ready(function(){
	prettyPrint();	
	$("#htmlToParse").click(function(){
		$("#helperMain").css("display","none");
	});
	$("#codeSwap").click(function(){
		$(this).hide(1,function(){
			$("#helperMain").hide();
			$("#htmlToParse").show().focus().scrollTop(0);
		});
	});
	$("#htmlToParse").keyup(function(){
		$("#toParse").text($(this).val());
		$(this).hide(1,function(){
			parseHTML();
			prettyPrint();
			$("#codeSwap").show();
		});
	});	
	function parseHTML(){
		var html = $("#htmlToParse").val();
		var parseResult = loopHTML(html);
		$("#parsedHTML").html("");
		$(".helperText").css("display","none");
		if(parseResult.errors.length > 1){
			$("#HTML").text(parseResult.errors.join('. '));
			return
		}
		$("#HTML").text(parseResult.strippedHTML);
		$("#CSS").html(parseResult.styleSheet);				
		prettyPrint();	
		styleSheet = '';
	}
});
function loopHTML(html){	
	styleSheet = '';
	parseResult = new ParsedHTMLResult();
	parseResult.setStrippedHTML(html.replace(/style="([^"]*)"/ig,""));
	//Strip document of script elements		
	var target_string = html.replace(/<script[^>]*>((\r|\n|.)*?)<\/script[^>]*>/mg, '');
	try{
	var $data = $(target_string);	
	}
	catch(err){
		parseResult.addError("The input you provided is not valid HTML");
		return parseResult;
	}
	//work around for jQuery not including the Body Tag;
	parser = new DOMParser();
	doc = parser.parseFromString(target_string, "text/xml"); 
	var bodyElement = doc.getElementsByTagName("body")
	appendElementToStyleSheet($(bodyElement), false);	
	//load elements that are not plain text (only html elements)
	$data = $data.filter(function(){ return this.nodeType != 3 })
	var data = {};
	$data.each(function () {
		appendElementToStyleSheet($(this), true);	
	});
	parseResult.setStyleSheet(styleSheet);
	return parseResult;
}

function fullPath(element){
	//array to hold selector if ID is not found
	var names = [];
	//iterate through parents to build selector
	while (element.parentNode){
		//if element has ID, use as selector, if not fall back to building a selector
		if (element.id){
			names.unshift('#'+element.id);
			break;
		}
		else{			
			if (element==element.ownerDocument.documentElement) names.unshift(element.tagName);
			else{
				for (var c=1,e=element;e.previousElementSibling;e=e.previousElementSibling,c++);
				names.unshift(element.tagName+":nth-child("+c+")");
			}
			element=element.parentNode;
		}
	}
	//return list of selectors separated by '>' representing parent to child relationships.
	return names.join(" > ");
}

function appendElementToStyleSheet(element, appendChildren){
	try{
		if(element.attr("style") != null){
			createStyleText(element)
		}
		if(appendChildren){
			element.children().each(function(i){
				appendElementToStyleSheet($(this), true);
			});			
		}
	}
	catch(err)
	{
		parseResult.addError(err.message);
	}
}

function createStyleText(element){
	elementStyle = fullPath(element[0]) + '{';
	elementStyle += element.attr("style");
	elementStyle += '}\r';	
	styleSheet += elementStyle;
}

function parseBodyStyle(html){
	var body = html.split('<body')[1].split('>')[0];
	return body.replace('style','').replace(/=/g,'').replace(/"/g,'').replace(/'/g,'');
}

function ParsedHTMLResult(){
	this.errors = [];
}

ParsedHTMLResult.prototype.setStrippedHTML = function(strippedHTML){
	this.strippedHTML = strippedHTML;
}

ParsedHTMLResult.prototype.setStyleSheet = function(styleSheet){
	this.styleSheet = styleSheet;
}

ParsedHTMLResult.prototype.addError = function(error){
	this.errors.push(error);
}