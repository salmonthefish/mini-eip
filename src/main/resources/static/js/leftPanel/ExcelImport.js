(function(ExcelImport, AlertPopup, Form, Configuration, AbstractQuestionField, Layout, Format, QuestionType, Calculation, $) {

    let _productKey = URLParametersUtil.getParameter('productKey');
    let _shadowStyle = '-webkit-box-shadow: 2px 2px 3px 0px rgba(50, 50, 50, 0.25);-moz-box-shadow: 2px 2px 3px 0px rgba(50, 50, 50, 0.25);box-shadow: 2px 2px 3px 0px rgba(50, 50, 50, 0.25);';
    let _fileSelectStyle = 'position: absolute;top: 48px;left: 363px;display: inline-block;height: 25px;width: 100px;background-color: #7D93A8;color: #FFFFFF;cursor: pointer;font-size: 12px;line-height: 25px;margin: 2px;text-align: center;';
    let _popupDefaultHeight = 120;
    let _popupDefaultWidth = 500;
    
    let _excelDocument = null;

    let _errorMessagesHeader = "We encountered the following error(s) during the import. No questions were imported.\nPlease make the recommended changes and try again.\n";

    let CONFIG_ID_MATCHER = /@(\d+)@/g;

    $(document).ready(function() {
        addEventHandlers();
    });

    function addEventHandlers() {
        $('.importButton').on('click', onClick);
    }

    function onClick() {
        _excelDocument = null;
        Configuration.select([]);
        createPopup('Import Questions from Excel', createImportForm(), createImportFormButtons());
    }

    function createImportForm() {
        let titleInput = $('<input>').attr({
            'id': 'titleInput',
            'disabled': 'disabled',
            'style': 'height: 21px;width: 314px;position: absolute;top: 50px;left: 37px;'
        });

        let uploadInput = $('<input>').attr({
            'id': 'uploadInput',
            'type': 'file',
            'accept': '.xlsx',
            'name': 'file',
            'style': 'display: none'
        }).on('change', function() {
            if (uploadInput[0].files.length > 0) {
                _excelDocument = uploadInput[0].files[0];
                titleInput.val(_excelDocument.name);
            }
        });

        let fileSelect = $('<label>').text('Select File').attr({
            'style': _fileSelectStyle + _shadowStyle,
            'for': 'uploadInput'
        });

        fileSelect.hover(function() {
            fileSelect.attr('style', _fileSelectStyle);
        }, function() {
            fileSelect.attr('style', _fileSelectStyle + _shadowStyle);
        });

        return $('<div>').append(uploadInput).append(titleInput).append(fileSelect);
    }

    function createImportFormButtons() {
        return [{
            label: 'UPLOAD',
            handler: uploadDocument
        }, {
            label: 'CANCEL'
        }];
    }

    function uploadDocument() {
        if (_excelDocument) {
            $(document.body).mask('Importing might take up to two minutes. Please do not close your browser or hit refresh.',
                {'font-size': '15pt', 'font-weight': 'bold'}, null, true);

            let formData = new FormData();
            formData.append('file', _excelDocument, _excelDocument.name);

            let xhr = new XMLHttpRequest();
            xhr.open('POST', '/' + Products.URLPrefixes[_productKey] + '/commonModule/forms/' + Form.get().id + '/import', true);
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.onload = onLoad;
            xhr.send(formData);
        } else {
            createPopup('Error', 'No Excel Document Selected.');
        }
    }

    function onLoad(event) {
        if (event.target.status === 200) {
            let response = JSON.parse(event.target.response);
            
            if (response.errorMessages && response.errorMessages.length > 0) {
                createPopupWithListText('Error', response.errorMessages);
            } else {
                let form = $('#form');
                let formData = Form.get();
                let importedConfigurations = [];
                let topOffsetForImportedConfigurations = calculateTopOffsetForImportedConfigurations();
                let configIdTranslationMap = new Map();

                response.result.forEach(function(configuration) {
                    updateAndMapConfigurationId(configuration, configIdTranslationMap);

                    configuration.layout = configureLayout(configuration.layout, topOffsetForImportedConfigurations);
                    configuration.question.text = configuration.question.text || QuestionType[Format[configuration.question.format].questionType].defaultText;

                    importedConfigurations.push(configuration);
                });

                importedConfigurations.forEach(function(configuration) {
                    translateExpressionForCalculationQuestion(configuration, configIdTranslationMap);
                });

                reduceWhitespace(importedConfigurations);

                Form.addConfigurationsTo(importedConfigurations, form);
                createPopupWithListText('Warning', response.warningMessages);
            }
        } else {
            createPopup('Error', 'Import failed: Only Excel (.xlsx) files are allowed. Selected file is either in the wrong format or corrupted.', undefined, _popupDefaultHeight, 750);
        }

        $(document.body).unmask();
    }

    function updateAndMapConfigurationId(configuration, configIdTranslationMap) {
        let newId = Configuration.getNextId();
        configIdTranslationMap.set(configuration.id, newId);
        configuration.id = newId;
    }

    function translateExpressionForCalculationQuestion(configuration, configIdTranslationMap) {
        if (configuration.question && configuration.question.format === Format.CALCULATION.questionType) {
            configuration.layout.style = Calculation.createMissingDefaultStyles(configuration.layout.style);
            let originalExpression = configuration.defaultAnswers[0].value;
            let translatedExpression = ExcelImport.translateCalculationExpression(originalExpression, configIdTranslationMap);
            configuration.defaultAnswers[0].value = translatedExpression;
        }
    }

    function generateMapKey(row, col) {
        return row + ':' + col;
    }

    function calculateTopOffsetForImportedConfigurations() {
        let lowestUnoccupiedBottom = 1;

        let existingConfigurations = Form.get().configurations;
        existingConfigurations.forEach(function (config) {
            let configBottom = config.layout.top + config.layout.height;
            if(configBottom > lowestUnoccupiedBottom) {
                lowestUnoccupiedBottom = configBottom;
            }
        });

        return lowestUnoccupiedBottom;
    }

    function configureLayout(layout, topOffset) {
        return g_configureLayout(layout, topOffset);
    }

    function g_configureLayout(layout, topOffset) {
        return {
            top: (layout.top - 1) * AbstractQuestionField.getDefaultHeight() + topOffset,
            left: (layout.left - 1) * AbstractQuestionField.getDefaultWidth() + 1,
            height: layout.height * AbstractQuestionField.getDefaultHeight(),
            width: layout.width * AbstractQuestionField.getDefaultWidth(),
            style: layout.style
        };
    }

    function reduceWhitespace(configurations) {
        g_reduceWhitespace(configurations);
    }

    function g_reduceWhitespace(configurations) {
        if (configurations.length >= 1) {
            let rowDelta = 0;
            let currentConfig = configurations[0];
            let prevColOriginalEnd = currentConfig.layout.left + AbstractQuestionField.getDefaultWidth();
            if(currentConfig.layout.left !== 1) {
                rowDelta = Math.floor(currentConfig.layout.left / 2);
                currentConfig.layout.left = rowDelta + 1;
            }
            let prevConfigAdjusted = currentConfig;
            for (let idx = 1; idx < configurations.length; idx++) {
                currentConfig = configurations[idx];
                let curColStart = currentConfig.layout.left;

                if (currentConfig.layout.top === prevConfigAdjusted.layout.top) {
                    // same row, contributes to rowDelta
                    rowDelta += Math.floor((curColStart - prevColOriginalEnd) / 2);
                } else {
                    // starting a new row, reset rowDelta
                    rowDelta = Math.floor(currentConfig.layout.left / 2);
                }

                currentConfig.layout.left -= rowDelta;

                prevConfigAdjusted = currentConfig;
                prevColOriginalEnd = curColStart + AbstractQuestionField.getDefaultWidth();
            }
        }
    }

    function createPopupWithListText(title, messages) {
        if(messages && messages.length > 0) {
            messages.unshift(_errorMessagesHeader);
            let messagesWithLineBreaks = messages.join('\n');
            let popupHeight = _popupDefaultHeight + (messages.length + 2) * 16;
            let content = $('<div>').text(messagesWithLineBreaks).attr('style', 'height: ' + (popupHeight - 60) + 'px;font-size: 16px;white-space: pre;margin-top: 25px;text-align: center;');
            let popupWidth = 1000;

            createPopup(title, content, undefined, popupHeight, popupWidth);
        }
    }

    function createPopup(title, content, buttons, height, width) {
        let topDiff = height ? height / 2 : _popupDefaultHeight / 2;
        let leftDiff = width ? width / 2 : _popupDefaultWidth / 2;
                
        AlertPopup.open({
            top: 'calc(50% - ' + topDiff + 'px)',
            left: 'calc(50% - ' + leftDiff + 'px)',
            height: (height || _popupDefaultHeight) + 'px',
            width: (width || _popupDefaultWidth) + 'px',
            title: title,
            content: content,
            buttons: buttons
        });
    }

    ExcelImport.translateCalculationExpression = function(originalExpression, configIdTranslationMap) {
        return originalExpression.replace(CONFIG_ID_MATCHER, function(fullMatch, matchedConfigurationId, position) {
            let translatedConfigurationId = configIdTranslationMap.get(parseInt(matchedConfigurationId));
            return '@' + (translatedConfigurationId ? translatedConfigurationId : '[error]') + '@';
        });
    }

})(pa.ns('ExcelImport'), pa.ns('AlertPopup'), pa.ns('Form'), pa.ns('Configuration'),
    pa.ns('QuestionType.AbstractQuestionField'), pa.ns('Layout'), pa.ns('Format'), pa.ns('QuestionType'),
    pa.ns('QuestionType.CALCULATION'), jQuery);