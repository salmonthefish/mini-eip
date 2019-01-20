(function(Calculation, AbstractQuestionField, Configuration, Layout, Table, Format, RightPanel, TextDisplayModule, CalculationExpressionModule,
    CopyCalculationInTableModule, FormulaValidationUtil, Form, $) {
    objectUtil.extend(Calculation, AbstractQuestionField);

    let _validSyntaxFieldMap = {};
    let _userIsTyping = false;

    Calculation.defaultAnswers = [{
        value: ''
    }];

    Calculation.defaultFormat = 'CALCULATION';

    Calculation.createMissingDefaultStyles = function(styleString) {
        styleString = AbstractQuestionField.createMissingDefaultStyles(styleString);
        styleString = Layout.hasStyle(styleString, 'treatEmptyAsZero') ? styleString : Layout.setStyle(styleString, 'treatEmptyAsZero', 'true');
        return styleString;
    };

    Calculation.select = function(configurationToSelect) {
        AbstractQuestionField.select(configurationToSelect);
        RightPanel.appendModuleToAccordionPanel('CONFIGURATION', 'TextDisplayModule', TextDisplayModule.create(configurationToSelect));
        RightPanel.appendModuleToAccordionPanel('CONFIGURATION', 'CalculationExpressionModule', CalculationExpressionModule.create(configurationToSelect));

        if (Table.isTableCell(configurationToSelect)) {
            RightPanel.appendModuleToAccordionPanel('CONFIGURATION', 'CopyCalculationInTableModule', CopyCalculationInTableModule.create(configurationToSelect));
        }

        Calculation.validate(configurationToSelect, true);
    };

    Calculation.deselect = function(configurationToDeselect) {
        RightPanel.removeModuleFromAccordionPanel('CONFIGURATION', 'CalculationExpressionModule');
        RightPanel.removeModuleFromAccordionPanel('CONFIGURATION', 'TextDisplayModule');

        if(Table.isTableCell(configurationToDeselect)) {
            RightPanel.removeModuleFromAccordionPanel('CONFIGURATION', 'CopyCalculationInTableModule');
        }

        AbstractQuestionField.deselect(configurationToDeselect);
    };

    Calculation.setUserIsTyping = function(userIsTyping) {
        _userIsTyping = userIsTyping;
    };

    Calculation.validate = function(configuration, asyncValidation) {
        _validSyntaxFieldMap[configuration.id] = _validSyntaxFieldMap[configuration.id] ? _validSyntaxFieldMap[configuration.id] : {};

        let expression = configuration.defaultAnswers[0].value || '';
        let listOfIdsToExpressions = FormulaValidationUtil.buildCalculationIdToExpressionMap(Form.get().configurations);
        let expandedResult = FormulaValidationUtil.expandExpression(expression, configuration.id, listOfIdsToExpressions);

        if (expandedResult.errorMessage) {
            showValidateUserFeedback(configuration, false, expandedResult.errorMessage);
            return 'invalid';
        }

        let validIds = FormulaValidationUtil.getListOfIdsFromFormula(expandedResult.expression).every(checkIdExistsAndIsValidQuestionType);
        let asyncValidationRequest = _validSyntaxFieldMap[configuration.id].asyncValidationRequest;
        let asyncValidationResponse = _validSyntaxFieldMap[configuration.id].asyncValidationResponse || '';
        let validSyntax = asyncValidationResponse.length === 0;

        if (!validIds) {
            showValidateUserFeedback(configuration, false, 'Invalid IDs');
            return 'invalid';
        } else if (!asyncValidation && asyncValidationRequest || _userIsTyping) {
            return 'validating';
        } else if (!asyncValidation && !asyncValidationRequest && !validSyntax) {
            showValidateUserFeedback(configuration, false, asyncValidationResponse);
            return 'invalid';
        } else if (asyncValidation) {
            if(_validSyntaxFieldMap[configuration.id].asyncValidationRequest) {
                _validSyntaxFieldMap[configuration.id].asyncValidationRequest.abort();
            }

            let validSyntaxUrl = '/commonModule/forms/validateCalculationExpression';

            _validSyntaxFieldMap[configuration.id].asyncValidationRequest = $.ajax({
                url: validSyntaxUrl,
                type: 'POST',
                contentType: 'text/plain',
                data: expandedResult.expression,
                success: function(response) {
                    delete _validSyntaxFieldMap[configuration.id].asyncValidationRequest;

                    if(Format[configuration.question.format].questionType === 'CALCULATION') {
                        _validSyntaxFieldMap[configuration.id].asyncValidationResponse = response;
                        showValidateUserFeedback(configuration, response.length === 0, response);
                    }
                }
            });

            return 'validating';
        } else {
            showValidateUserFeedback(configuration, true, '');
            return 'valid';
        }
    };

    Calculation.isEligibleQuestionType = function(type) {
        switch (type) {
            case 'TEXTBOX':
            case 'TEXTAREA':
            case 'CALCULATION':
                return true;
                break;
            default:
                return false;
        }
    };

    function showValidateUserFeedback(configuration, valid, expressionErrorMessage) {
        if (valid) {
            Configuration.getDiv(configuration.id).removeClass('configurationError');
        } else {
            Configuration.getDiv(configuration.id).addClass('configurationError');
        }

        let selectedList = Configuration.getSelected();
        let singleSelection = selectedList.length === 1;
        let firstSelected = selectedList[0];

        if (singleSelection && firstSelected && firstSelected.id === configuration.id) {
            $('#calculationFormulaText').removeClass('calculationFormulaTextError');
            $('#expressionError').remove();
            if (expressionErrorMessage.length > 0) {
                $('#calculationFormulaText').addClass('calculationFormulaTextError');
                $('<div>').attr('id', 'expressionError').text(expressionErrorMessage).appendTo($('#rightPanelAccordion .accordionPanel:first'));
            }
        }
    }

    function checkIdExistsAndIsValidQuestionType(id) {
        return Configuration.exists(id) && Calculation.isEligibleQuestionType(Format[Configuration.getFromId(id).question.format].questionType);
    }

})(pa.ns('QuestionType.CALCULATION'), pa.ns('AbstractQuestionField'), pa.ns('Configuration'), pa
    .ns('Layout'), pa.ns('Format'), pa.ns('RightPanel'), pa.ns('TextDisplayModule'), pa
    .ns('CalculationExpressionModule'), pa.ns('FormulaValidationUtil'), pa.ns('Form'), jQuery);