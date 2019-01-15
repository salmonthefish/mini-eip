(function(CopyCalculationInTableModule, Configuration, Table, Form, Layout, Calculation, Format, FormulaValidationUtil, AlertPopup, $) {

    let DELIMITER = FormulaValidationUtil.delimiter;
    let CONFIGURATION_TOKEN_REGEX = new RegExp('(' + DELIMITER + '[^' + DELIMITER + ']*' + DELIMITER + ')', 'g');
    let _selectedConfiguration;

    CopyCalculationInTableModule.create = function(configuration) {
        let module = $('<div>');

        appendCopyToColumnButton(module);
        appendCopyToRowButton(module);

        return module;
    };

    function appendCopyToColumnButton(module) {
        let copyToColumnButton = $('<div>').attr('id', 'copyToColumnModuleButton').addClass('button rightPanelButton').text('COPY TO COLUMN');
        copyToColumnButton.css('left', '3px');
        copyToColumnButton.css('top', '6px');
        copyToColumnButton.on('click', onCopyToColumnModuleButtonClick);
        copyToColumnButton.appendTo(module);
    }

    function appendCopyToRowButton(module) {
        let copyToRowButton = $('<div>').attr('id', 'copyToRowModuleButton').addClass('button rightPanelButton').text('COPY TO ROW');
        copyToRowButton.css('left', '3px');
        copyToRowButton.css('top', '6px');
        copyToRowButton.on('click', onCopyToRowModuleButtonClick);
        copyToRowButton.appendTo(module);
    }

    function onCopyToColumnModuleButtonClick() {
        _selectedConfiguration = Configuration.getSelected()[0];
        if (!checkIfValid(onCopyToColumnModuleButtonClick, 'Copy to Column failed. The formula has an error, please correct it and try again.')) {
            return;
        }

        let form = Form.getFromId(_selectedConfiguration.formId);
        let selectedConfigurationColIndex = parseInt(Layout.getStyle(_selectedConfiguration.layout.style, 'col'));
        let tokens = tokenizeAndProcessExpression(_selectedConfiguration.defaultAnswers[0].value);
        let warningFlag = false;

        let copyCalculationToCell = function(table, rowIndex, colIndex) {
            let configuration = table[rowIndex][colIndex];
            if (configuration.question.format === 'CALCULATION') {
                configuration.defaultAnswers[0].value = createNewExpressionFromProcessedTokens(configuration, tokens, table);
            } else {
                warningFlag = true;
            }
        };

        Table.forEachCellInColumn(form, selectedConfigurationColIndex, isValidCellForCalcCopy, copyCalculationToCell);

        if (warningFlag) {
            popup('WARNING', 120, 720, 'Copy to Column succeeded, however, one or more cells in the column were not calculation cells.');
        }
        Form.validate(Form.get());
    }

    function onCopyToRowModuleButtonClick() {
        _selectedConfiguration = Configuration.getSelected()[0];
        if (!checkIfValid(onCopyToRowModuleButtonClick, 'Copy to Row failed. The formula has an error, please correct it and try again.')) {
            return;
        }

        let form = Form.getFromId(_selectedConfiguration.formId);
        let selectedConfigurationRowIndex = parseInt(Layout.getStyle(_selectedConfiguration.layout.style, 'row'));
        let tokens = tokenizeAndProcessExpression(_selectedConfiguration.defaultAnswers[0].value);
        let warningFlag = false;

        let copyCalculationToCell = function(table, rowIndex, colIndex) {
            let configuration = table[rowIndex][colIndex];
            if (configuration.question.format === 'CALCULATION') {
                configuration.defaultAnswers[0].value = createNewExpressionFromProcessedTokens(configuration, tokens, table);
            } else {
                warningFlag = true;
            }
        };

        Table.forEachCellInRow(form, selectedConfigurationRowIndex, isValidCellForCalcCopy, copyCalculationToCell);

        if (warningFlag) {
            popup('WARNING', 120, 720, 'Copy to Row succeeded, however, one or more cells in the row were not calculation cells.');
        }
        Form.validate(Form.get());
    }

    function isValidCellForCalcCopy(table, rowIndex, colIndex) {
        let configuration = table[rowIndex][colIndex];
        let isCalculationQuestion = configuration.question.format === 'CALCULATION';
        let isNotSelectedConfiguration = configuration != _selectedConfiguration;
        let isHeader = rowIndex === 0 || colIndex === 0;

        return isNotSelectedConfiguration && (!isHeader || isCalculationQuestion)
    }

    function tokenizeAndProcessExpression(expression) {
        let tokens = [];

        if (expression) {
            let selectedConfigurationRowIndex = parseInt(Layout.getStyle(_selectedConfiguration.layout.style, 'row'));
            let selectedConfigurationColIndex = parseInt(Layout.getStyle(_selectedConfiguration.layout.style, 'col'));
            let form = Form.getFromId(_selectedConfiguration.formId);
            let rawTokens = FormulaValidationUtil.tokenize(expression.replaceAll(' ', ''), CONFIGURATION_TOKEN_REGEX);

            rawTokens.forEach(function(token) {
                if (token[0] === DELIMITER) {
                    let configurationId = parseInt(token.replaceAll(DELIMITER, ''));
                    let configuration = Configuration.getFromId(configurationId);

                    if (configuration && Table.isTableCell(configuration, form)) {
                        let rowIndex = parseInt(Layout.getStyle(configuration.layout.style, 'row'));
                        let colIndex = parseInt(Layout.getStyle(configuration.layout.style, 'col'));

                        tokens.push({
                            rowOffset: rowIndex - selectedConfigurationRowIndex,
                            colOffset: colIndex - selectedConfigurationColIndex
                        });
                    } else {
                        tokens.push(token);
                    }
                } else {
                    tokens.push(token);
                }
            });
        }

        return tokens;
    }

    function createNewExpressionFromProcessedTokens(calculationConfiguration, tokens, table) {
        let newExpression = '';

        tokens.forEach(function(token) {
            if (token instanceof Object) {
                newExpression += formatProcessedTokenObject(calculationConfiguration, token, table);
            } else {
                newExpression += token;
            }
        });

        return newExpression;
    }

    function formatProcessedTokenObject(calculationConfiguration, token, table) {
        let rowIndex = parseInt(Layout.getStyle(calculationConfiguration.layout.style, 'row'));
        let colIndex = parseInt(Layout.getStyle(calculationConfiguration.layout.style, 'col'));
        let offsetRowIndex = rowIndex + token.rowOffset;
        let offsetColIndex = colIndex + token.colOffset;
        let outOfBounds = !table[offsetRowIndex] || !table[offsetRowIndex][offsetColIndex];

        if (!outOfBounds) {
            let configuration = table[offsetRowIndex][offsetColIndex];
            let questionType = Format[configuration.question.format].questionType;

            if (Calculation.isEligibleQuestionType(questionType)) {
                return DELIMITER + configuration.id + DELIMITER;
            }
        }

        return DELIMITER + '[error]' + DELIMITER;
    }

    function checkIfValid(functionToRetry, invalidMessage) {
        let valid = true;

        if (Calculation.validate(_selectedConfiguration) === 'validating') {
            setTimeout(functionToRetry, 500);
            valid = false;
        } else if (Calculation.validate(_selectedConfiguration) === 'invalid') {
            popup('ERROR', 120, 600, invalidMessage);
            valid = false;
        }

        return valid;
    }

    function popup(title, height, width, content) {
        AlertPopup.open({
            title: title,
            top: 'calc(50% - ' + (height / 2) + 'px)',
            left: 'calc(50% - ' + (width / 2) + 'px)',
            height: height + 'px',
            width: width + 'px',
            content: content
        });
    }

})(pa.ns('CopyCalculationInTableModule'), pa.ns('Configuration'), pa.ns('Form'), 
    pa.ns('Layout'), pa.ns('QuestionType.CALCULATION'), pa.ns('Format'), pa.ns('FormulaValidationUtil'), 
    pa.ns('AlertPopup'), jQuery);