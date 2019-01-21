(function(FormulaValidationUtil, Format) {

	FormulaValidationUtil.delimiter = '@';
    FormulaValidationUtil.regExpForDelimiter = new RegExp(FormulaValidationUtil.delimiter, 'g');
    FormulaValidationUtil.regExpForDelimitersAroundIds = new RegExp('(' + FormulaValidationUtil.delimiter + '.*?' + FormulaValidationUtil.delimiter + ')', 'g');
    FormulaValidationUtil.depthLimit = 5;

	let _operators = '+-*/';

    FormulaValidationUtil.tokenize = function(formula, regExp) {
        regExp = regExp ? regExp : /(\+|\-|\*|\/|\(|\)|\s+)/g;
        return formula.toString().split(regExp).filter(function(entry) {
            return entry.length !== 0;
        });
    };

    FormulaValidationUtil.isOperand = function(token) {
    	let isOperator = _operators.indexOf(token) > -1;
    	let isParenthesis = token === '(' || token === ')';
        return !isOperator && !isParenthesis;
    };

    FormulaValidationUtil.getListOfIdsFromFormula = function(formulaAfterConversion) {
    	let idStrings = formulaAfterConversion.split(FormulaValidationUtil.regExpForDelimitersAroundIds).filter(function(token) {
			return token.charAt(0) === FormulaValidationUtil.delimiter;
		});
    	
        let ids = idStrings.map(function(idString) {
            let idWithoutAtSign = idString.replace(FormulaValidationUtil.regExpForDelimiter, '');
            
            return (idWithoutAtSign === '' ? NaN : Number(idWithoutAtSign).valueOf());
        });
        
        return ids;
    };

    FormulaValidationUtil.buildCalculationIdToExpressionMap = function(configurations) {
        return configurations.reduce(function(map, configuration) {
            if (configuration.question && Format[configuration.question.format] === Format.CALCULATION) {
                map[configuration.id] = configuration.defaultAnswers[0].value;
            } else  (configuration.questionContainer) {
                let containerMap = FormulaValidationUtil.buildCalculationIdToExpressionMap(configuration.questionContainer.configurations);
                for(let id in containerMap) {
                    map[id] = containerMap[id];
                }
            }

            return map;
        }, {});
    };

    FormulaValidationUtil.expandExpression = function(expression, calculationId, listOfIdsToExpressions) {
        let referencedExpressionIds = {};
        referencedExpressionIds[calculationId] = true;
        return expandExpressionHelper(expression, referencedExpressionIds, listOfIdsToExpressions, 0);
    };

    function expandExpressionHelper(expression, referencedExpressionIds, listOfIdsToExpressions, depth) {
        if (depth > FormulaValidationUtil.depthLimit) {
            return {
                expression: null,
                errorMessage: 'Max depth reached: Only 5 levels allowed'
            };
        }

        let ids = FormulaValidationUtil.getListOfIdsFromFormula(expression);

        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];

            if (referencedExpressionIds[id]) {
                return {
                    expression: null,
                    errorMessage: 'Circular dependency detected'
                };
            }

            if (listOfIdsToExpressions[id]) {
                let nestedExpression = listOfIdsToExpressions[id];
                let clonedReferencedExpressionIds = objectUtil.copy(referencedExpressionIds);
                clonedReferencedExpressionIds[id] = true;
                let expandedResult = expandExpressionHelper(nestedExpression, clonedReferencedExpressionIds, listOfIdsToExpressions, depth + 1);

                if (expandedResult.errorMessage) {
                    return expandedResult;
                } else {
                    expression = expression.replace(new RegExp('@' + id + '@', 'g'), '(' + expandedResult.expression + ')');
                }
            }
        }

        return {
            expression: expression,
            errorMessage: null
        };
    }
    
})(pa.ns('pa.util.FormulaValidationUtil'), pa.ns('pa.form.Format'));