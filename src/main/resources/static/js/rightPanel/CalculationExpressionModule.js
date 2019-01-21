(function(CalculationExpressionModule, Form, Configuration, Format, AlertPopup, Calculation, FormulaValidationUtil, Layout, $) {

    let _desiredQuestionMap = {};
    let _reverseDesiredQuestionMap = {};
    let _timeoutMap = {};

    let _calculationHelpText =
        '<b>Supported Operations</b>: + - * / ( ) <br>' +
        '<b>Referencing a Question</b>: Q[number], e.g. Q5 <br>' +
        '<br><b>Example formulas:</b><br>' +
        '<ul style="list-style-type: circle; padding-left: 25px;">' +
        '<li>Q1 + Q2 - 5</li>' +
        '<li>(Q1 - Q2) * 10</li>' +
        '<li>-Q1 / 8</li>' +
        '<li>100 + -15</li>' +
        '<li>(Q1 + Q1) / 0.55</li>' +
        '<li>Q1 + 55620</li>' +
        '</ul>';

    CalculationExpressionModule.create = function(configuration) {
        let module = $('<div>');

        addTooltips(configuration);
        appendLabelAndHelpButton(module);
        appendTextArea(configuration, module);
        appendEmptyAsZeroToggle(configuration, module);
        module.on('remove', createOnModuleRemove(configuration));

        return module;
    };

    function addTooltips(configuration) {
        _desiredQuestionMap = {};
        _reverseDesiredQuestionMap = {};

        let desiredQuestions = findAllCalculableConfigurationsSortedByTopLeft(configuration, Form.get().configurations);
        desiredQuestions.forEach(function(questionConfiguration, index) {
            let tooltipText = 'Q' + (index + 1);
            let div = Configuration.getDiv(questionConfiguration.id);
            let calculatedTooltip = div.children('.calculatedTooltip');

            if (calculatedTooltip.length === 1) {
                calculatedTooltip.text(tooltipText);
                calculatedTooltip.show();
            } else {
                calculatedTooltip = $('<div>').addClass('calculatedTooltip').text(tooltipText);
                div.append(calculatedTooltip);
            }

            _desiredQuestionMap[questionConfiguration.id] = tooltipText;
            _reverseDesiredQuestionMap[tooltipText] = questionConfiguration.id;
        });
    }

    function findAllCalculableConfigurationsSortedByTopLeft(selectedConfiguration, configurations) {
        configurations.sort(topLeftSorter);
        let desiredConfigurations = [];

        configurations.forEach(function(configuration) {
            if (configuration.id !== selectedConfiguration.id) {
                let questionType = Format[configuration.question.format].questionType;
                if (Calculation.isEligibleQuestionType(questionType)) {
                    desiredConfigurations.push(configuration);
                }
            }
        });

        return desiredConfigurations;
    }

    function topLeftSorter(configuration1, configuration2) {
        return configuration1.layout.top === configuration2.layout.top ? configuration1.layout.left - configuration2.layout.left : configuration1.layout.top
            - configuration2.layout.top;
    }

    function appendLabelAndHelpButton(module) {
        let parentDiv = $('<div>').appendTo(module);
        let label = $('<div>').text('Formula:').css('float', 'left').css('margin-top', '3px').css('margin-bottom', '3px').appendTo(parentDiv);
        let helpText = $('<div>').attr('id', 'calculationHelpLink').text('Help').appendTo(parentDiv);
        helpText.on('click', helpButtonOnClick);
    }

    function helpButtonOnClick() {
        AlertPopup.open({
            top: 'calc(50% - 110px)',
            left: 'calc(50% - 165px)',
            height: '220px',
            width: '330px',
            color: '#7D93A8',
            title: 'Calculation Field Help',
            content: $('<div>').attr('style', 'padding: 5px').html(_calculationHelpText)
        });
    }

    function appendTextArea(configuration, module) {
        let textArea = $('<textarea>').attr('id', 'calculationFormulaText').attr('maxlength', '4000').appendTo(module);
        textArea.val(convertFormulaForDisplaying(configuration.defaultAnswers[0].value));
        textArea.on('input', onInput);
    }

    function appendEmptyAsZeroToggle(configuration, module){
        let toggleDiv = $('<div>').attr('id', 'emptyAsZeroDiv').addClass('checkbox').appendTo(module);
        let labelDiv = $('<div>').text('Unanswered questions defaulted to 0: ').appendTo(toggleDiv);
        let toggleButton = $('<input>').attr('type','checkbox').attr('id', 'calculationEmptyAsZeroToggle').appendTo(labelDiv);
        toggleDiv.css('margin', '8px 0');
        let configTreatEmptyAsZero = Layout.getStyle(configuration.layout.style, 'treatEmptyAsZero');
        toggleButton[0].checked = (configTreatEmptyAsZero === 'true');

        toggleButton.on('change', function() {
            configuration.layout.style = Layout.setStyle(configuration.layout.style, 'treatEmptyAsZero', this.checked);
        });
    }

    function onInput() {
        Calculation.setUserIsTyping(true);
        let me = $(this), selected = Configuration.getSelected()[0];

        clearTimeout(_timeoutMap[selected.id]);
        _timeoutMap[selected.id] = setTimeout(function() {
            selected.defaultAnswers[0].value = convertFormulaForSaving(me.val());
            Calculation.setUserIsTyping(false);
            Calculation.validate(selected, true);
        }, 1000);
    }

    function createOnModuleRemove(configuration) {
        return function() {
            configuration.defaultAnswers[0].value = convertFormulaForSaving($('#calculationFormulaText').val());
            $('.calculatedTooltip').hide();
        };
    }

    function convertFormulaForDisplaying(formula) {
        if (!formula || formula === '') {
            return '';
        }

        let result = '';
        let tokens = FormulaValidationUtil.tokenize(formula, FormulaValidationUtil.regExpForDelimitersAroundIds);

        for (let i = 0; i < tokens.length; i++) {
            let displayValue = tokens[i];

            if(displayValue.charAt(0) === FormulaValidationUtil.delimiter) {
                let configurationId = displayValue.replace(FormulaValidationUtil.regExpForDelimiter, '');
                displayValue = _desiredQuestionMap[configurationId] || 'Q[error]';
            }

            result = result + displayValue;
        }

        result = result.replace(/\\DELIMITER;/g, FormulaValidationUtil.delimiter);
        return result;
    }

    function convertFormulaForSaving(formula) {
        formula = formula || '';
        formula = formula.replace(FormulaValidationUtil.regExpForDelimiter, '\\DELIMITER;');

        let result = '';
        let tokens = FormulaValidationUtil.tokenize(formula);

        for (let i = 0; i < tokens.length; i++) {
            let saveValue = tokens[i];

            if(FormulaValidationUtil.isOperand(saveValue) && saveValue.charAt(0) === 'Q') {
                saveValue = FormulaValidationUtil.delimiter + (_reverseDesiredQuestionMap[saveValue] || '[error]') + FormulaValidationUtil.delimiter;
            }

            result = result + saveValue;
        }

        return result;
    }

})(pa.ns('CalculationExpressionModule'), pa.ns('Form'), pa.ns('Configuration'), pa.ns('Format'), pa.ns('AlertPopup'),
    pa.ns('QuestionType.CALCULATION'), pa.ns('FormulaValidationUtil'), pa.ns('Layout'), jQuery);