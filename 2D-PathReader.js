var a = "x * cos ( x )";
var b = "x * sin ( x )";

var boss = "ln ( 2.71828 ^ x + root ( x ^ 2 + 4 ^ 2 ) )";
var superboss = "ln(2.71828^x+root(x^2+4^2))";

var test = "( 1 + 2 / ( 5 + 6 ) * 10 ) ^ 10 / 20";
var test1 = "( 4 + 8 ) * ( 6 - 5 ) / ( ( 3 - 2 ) * ( 2 + 2 ) )";

var ERROR_SIGN = false; //When this is true, disable all functions.

var valid_symbols = ['+', '-', '*', '/', '(', ')', '^', 'root', 'sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'lg', 'ln', 'x'];
var num_symbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];

//Squeeze continuously-appearing char, this is adapted from my another project, lineutils.
function squeeze(read_str, chr) {
	if (arguments.length == 1) {
		chr = " ";
	} else if (arguments.length == 2) {
		read_str = arguments[0];
		chr = arguments[1];
	} else {
		throw new Error("Input error");
		ERROR_SIGN = true;
	}
	var arr = "";
	var has_chr_before = false;
	for (var i = 0; i < read_str.length; i++) {
		var str = read_str[i];
		if ((str != chr) || (has_chr_before == false)) {
			if (str == chr) {
				has_chr_before = true;
			} else {
				has_chr_before = false;
			}
			arr += (read_str[i]);
		}
	}
	return arr;
}

function block_identifier(str) {
	var stack_str = "";
	var stack_num = "";
	var result = "";
	var dot_counter = 0;
	
	while (str.indexOf(" ") >= 0) {
		str = str.replace(" ", "");
	}
	
	for (var i = 0; i < str.length; i++) {
		if (num_symbols.indexOf(String(str[i])) >= 0) {
			stack_num += str[i];
			if (str[i] == '.') {
				dot_counter++;
				if (dot_counter > 1) { //DO NOT ALLOW MORE THAN 1 DOT IN NUMBER!!!
					throw new Error("Erred input string");
					ERROR_SIGN = true;
				}
			}
		} else {
			dot_counter = 0; //Reset dot counter
			
			stack_str += str[i];
			result = result + " " + stack_num + " ";
			stack_num = "";
		}
		if (valid_symbols.indexOf(stack_str) >= 0) {
			result = result + " " + stack_str + " ";
			stack_str = "";
		}
		
		if (stack_str.length >= 4) { //Normally its max is 4, but when 4 it should have been popped already.
			throw new Error("Erred input string");
			ERROR_SIGN = true;
		}
	}
	
	result = squeeze(result, " ");
	return result;
}


//In order to avoid problems, I finally gave up the idea of using the special symbol to evaluate nth root. Please use ^ (1 / n) instead.
function top(arr) {
	return arr[arr.length-1];
}


var names = {
	plus: 'plus',
	minus: 'minus',
	mult: 'mult',
	div: 'div',
	caret: 'caret',
	root: 'root',
	left_brac: 'left_brac',
	right_brac: 'right_brac',
	sin: 'sin',
	cos: 'cos',
	tan: 'tan',
	cot: 'cot',
	sec: 'sec',
	csc: 'csc',
	lg: 'lg',
	ln: 'ln'
}

//Notice all of these symbols are special in normal calculations. √ is 
function is_operator(str) {
	str = String(str);
	switch (str) {
		case '+':
		case '-':
		case '*':
		case '/':
		case '^':
		case '(':
		case ')':
			return true;
			break;
		default:
			return false;
			break;
	}
	return false;
}

//These follow one same rule: take only 1 number as argument, instead of two (+, -, etc.)
var trig_and_notation = {
	sin: 'sin',
	cos: 'cos',
	tan: 'tan',
	cot: 'cot',
	sec: 'sec',
	csc: 'csc',
	
	
	lg: 'lg',
	ln: 'ln',
	
	root: 'root'
};

function is_trig_or_notation(str) {
	str = String(str);
	if (trig_and_notation[str] !== undefined) {
		return true;
	}
	return false;
}

function is_num(str) {
	str = String(str);
	var dot_num = 0;
	for (var i = 0; i < str.length; i++) {
		//Unfortunately, due to unity system limitations, I cannot use anonymous functions here.
		switch(str[i]) {
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
				break;
			case '-':
				if (i !== 0) {
					return false;
				}
			case '.':
				dot_num++;
				break;
			default:
				return false;
		}
	}
	if (dot_num <= 1) {
		return true;
	}
}

//Split the string to arr based on spc, this is adapted from my another project, lineutils.
function split_by_pattern(str, line) {
	if (str === undefined) {
		throw new Error("Cannot use undefined string as pattern!");
	}
	var arr = [];
	var temp_str = line;
	var subindex = -1;
	do {
		subindex = temp_str.indexOf(str);
		if (subindex > -1) {
			arr.push(temp_str.substring(0, subindex));
			temp_str = temp_str.substring(subindex, temp_str.length);
			temp_str = temp_str.replace(str, "");
		}
	} while (subindex > -1);
	arr.push(temp_str);
	while (arr.indexOf("") > -1) {
		arr.splice(arr.indexOf(""), 1);
	} //remove extra "" entry
	return arr;
}


function infix_to_postfix(str) {
	if (ERROR_SIGN == true) {
		throw new Error("Oops, we cannot interpret your expression.");
		return "";
	}
	str = block_identifier(str);
	return infix_to_postfix_raw(str);
}


function infix_to_postfix_raw(str) {
	var infix = split_by_pattern(" ", str)
	var postfix = [];
	var op_stack = [];
	var notation_stack = [];
	//Record previous so that could change to '[' when prev is notation
	var prev = " ";
	
	infix.forEach(function(curr) {
		if (curr === 'x' || is_num(curr)) { //Normal operands
			postfix.push(curr);
		} else if (is_operator(curr)) { //Operator
			if (curr === ')') { //If )
				while (top(op_stack) !== '(' && top(op_stack) !== '[') {
					postfix.push(op_stack.pop()); //pop to postfix till met with brackets
				}
				var bracket = op_stack.pop(); //pop the bracket for check
				if (bracket === '[') { //if [, should pop the last notation to stack
					var a = notation_stack.pop();
					postfix.push(a);
				}
			} else if (op_stack.length !== 0) { //Other operator
				while ((get_precedence(top(op_stack)) >= get_precedence(curr)) && top(op_stack) !== '(' && top(op_stack) !== '[') { //pop all lower/equal precedence operators
					postfix.push(op_stack.pop());
				}
				if (curr === '(' && is_trig_or_notation(prev)) { //special handle [ for notation prev
					op_stack.push("[");
				} else {
					op_stack.push(curr);
				}
			} else {
				if (curr === '(' && is_trig_or_notation(prev)) { //special handle [ for notation prev
					op_stack.push("[");
				} else {
					op_stack.push(curr);
				}
			}
		} else if (is_trig_or_notation(curr)) {
			notation_stack.push(curr);
		}
		prev = curr; //update prev
	});
	
	while (op_stack.length !== 0) {
		postfix.push(op_stack.pop());
	}
	while (notation_stack.length !== 0) {
		postfix.push(notation_stack.pop());
	}
	console.log(postfix);
}


function simple_InfixToPostFix(str) {
	var infix = split_by_pattern(" ", str)
	//console.log(infix);
	var postfix = [];
	var op_stack = [];
	//var notation_stack = [];

	infix.forEach(function(curr) {
		if (curr === 'x') {
			postfix.push(curr);
		} else if (is_operator(curr)) {
			if (curr === ')') {
				while (top(op_stack) !== '(') {
					postfix.push(op_stack.pop());
				}
				op_stack.pop();
				
			} else if (op_stack.length !== 0) {
				while ((get_precedence(top(op_stack)) >= get_precedence(curr)) && top(op_stack) !== '(') {
					console.log(top(op_stack));
					postfix.push(op_stack.pop());
				}
				op_stack.push(curr);
			} else {
				op_stack.push(curr);
			}
		} else {
			postfix.push(curr);
		}
	});
	
	while (op_stack.length !== 0) {
		postfix.push(op_stack.pop());
	}
	console.log(postfix);
}

simple_InfixToPostFix(test);
simple_InfixToPostFix(test1);
infix_to_postfix_raw(boss);
infix_to_postfix(superboss);

function get_precedence(str) {
	switch (str) {
		case '+':
		case '-':
			return 100;
			break;
		case '*':
		case '/':
			return 200;
			break;
		case '^':
			return 300;
			break;
		case '(':
		case ')':
		case '[':
			return 400;
			break;
		default:
			return -1
			break;
	}
	return -1;
}

var prec_map = {
	left_brac: 1,
	mult: 2,
	div: 3,
	plus: 4,
	minus: 5
};
