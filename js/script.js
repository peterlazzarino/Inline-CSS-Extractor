var styleSheet = '';
var elementStyle = '';
var originalHTMLString = '';
var deStyledHTMLString = '';
var parseResult;
var result;

$(document).ready(function(){
	ResultWidget.init();
	ExtractCSSWidget.init();
});

var ResultWidget = {
	init: function(){
		result = this.variables;
	},
	variables: {
		errors: [],
		html: '',
		css: '',
	},
	reset: function(){
		this.variables.errors = [];
		this.variables.html = '';
		this.variables.css = ''
	}
}

var ExtractCSSWidget = {		
	init: function(){
		htmlInput = $("#htmlToParse");
		helperText = $(".helperText");
		HTMLresult = $("#HTML");
		CSSResult = $("#CSS");	
		this.bindUIActions(this.extractionComplete);
	},	
	bindUIActions: function(callbackFunction){	
		htmlInput.keyup(function(){
			callbackFunction(parseHTML(htmlInput.val(), result));
			ResultWidget.reset();
			ResultWidget.init();
		});	
		htmlInput.click(function(){
			helperText.css("display","none");
			htmlInput.focus();
		});
		helperText.on("click", function(){
			helperText.css("display","none");
			htmlInput.focus();
		});
	},		
	extractionComplete: function(data){
		helperText.css("display","none");
		if(data.errors.length > 0){
			CSSResult.text("");
			return HTMLresult.text(data.errors);
		}			
		HTMLresult.text(data.html);
		CSSResult.text(data.css);
		prettyPrint();
	}
};

