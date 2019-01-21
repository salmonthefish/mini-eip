(function(Configuration, Form, Question, LeftPanel, RightPanel, AbstractField, QuestionType, Format, Layout) {

    let _nextId = -1;
    let _selectedConfigurations = [];
    let _originalConfigurationRenderTo = Configuration.renderTo;

    Configuration.renderTo = function(configuration, parent) {
        if (parent.find('#gridsterContainer').length === 1) {
            parent = parent.find('#gridsterContainer');
        }
        _originalConfigurationRenderTo(configuration, parent);
        Configuration.getDiv(configuration.id).addClass('ui-selectee');
        if (Form.getMode() === Form.GRIDFORM) {
            Configuration.getDiv(configuration.id).attr({
                'data-col': configuration.layout.left,
                'data-row': configuration.layout.top,
                'data-sizex': configuration.layout.width,
                'data-sizey': configuration.layout.height
            });
        }
    };

    Configuration.getNextId = function() {
        return _nextId--;
    };

    Configuration.copy = function(configuration) {
        let copiedConfiguration = objectUtil.copy(configuration);
        copiedConfiguration.id = Configuration.getNextId();

        return copiedConfiguration;
    };

    Configuration.create = function(type, settings) {
        return {
            id: Configuration.getNextId(),
            question: isQuestion ? Question.create(type) : undefined,
            answerRequired: isQuestion ? false : undefined,
            defaultAnswers: isQuestion ? objectUtil.copy(QuestionType[type].defaultAnswers) : [],
            layout: {
                top: 0,
                left: 0,
                height: QuestionType[type].getDefaultHeight(),
                width: QuestionType[type].getDefaultWidth(),
                style: QuestionType[type].createMissingDefaultStyles('')
            }
        };
    };

    Configuration.selectNextConfiguration = function() {
        let nextConfig = null;
        // nothing is selected, then get the first config
        if (_selectedConfigurations.length === 0) {
            nextConfig = findFirstConfiguration(Form.get().configurations); 
        // multi configs are selected, then get the first config in the selection 
        } else if (_selectedConfigurations.length > 1) {
            nextConfig = findFirstConfiguration(_selectedConfigurations, true);
        // one config is selected
        } else {
            let selectedConfig = _selectedConfigurations[0];
            // selected config is container, then get the first config in the container
            if (selectedConfig.formId === Form.get().id) {
                nextConfig = findNextConfiguration(selectedConfig, Form.get().configurations) || findFirstConfiguration(Form.get().configurations);
            // selected config is not container but inside a container, then get the next in the config, if no, get next one of its container
            } else {
                nextConfig = findNextConfiguration(selectedConfig, Form.getFromId(selectedConfig.formId).configurations);
                if (nextConfig === null) {
                    let configContainerDiv = Configuration.getDiv(selectedConfig.id).parent('.configuration');
                    let configContainer = Configuration.getFromDiv(configContainerDiv);
                    nextConfig = findNextConfiguration(configContainer, Form.get().configurations) || findFirstConfiguration(Form.get().configurations);
                }
            }
        }
        if (nextConfig) {
            Configuration.select([nextConfig]);
            Form.adjustViewport(nextConfig);
        }
    };

    Configuration.getSelected = function() {
        return _selectedConfigurations;
    };

    Configuration.setSelected = function(selectedConfigurations) {
        return _selectedConfigurations = selectedConfigurations;
    };

    Configuration.select = function(configurationsToSelect) {
        if (!Array.isArray(configurationsToSelect)) {
            throw 'Configuration.select only supports arrays!';
        }

        deselectConfigurations(_selectedConfigurations);
        selectConfigurations(configurationsToSelect);
    };

    Configuration.validate = function(configuration, asyncValidation) {
        return QuestionType[Format[configuration.question.format].questionType].validate(configuration, asyncValidation);
    };

    function findNextConfiguration(targetConfig, configs) {
        let nextPosition = null, targetPosition = {
            id: targetConfig.id,
            left: targetConfig.layout.left,
            top: targetConfig.layout.top
        };
        for (let index=0; index<configs.length; index++) {
            let config = configs[index];
            let position = {
                left: config.layout.left,
                top: config.layout.top,
                id: config.id
            };

            if (config.id !== targetPosition.id) {
                if ((isFirstConfigBeforeSecond(targetPosition, position)) && (nextPosition === null || isFirstConfigBeforeSecond(position, nextPosition))) {
                    nextPosition = position;
                }
            }
        }
        return nextPosition === null ? null: Configuration.getFromId(nextPosition.id);
    }

    function findFirstConfiguration(configs, shouldAddContainerOffset){
        let firstConfig = null, containerMap = {};
        for (let index=0; index<configs.length; index++) {
            let config = configs[index];
            if ((Layout.getStyle(config.layout.style, 'row') === '0' && Layout.getStyle(config.layout.style, 'col') === '0')) {
                continue;
            }
            let position = {
                left: config.layout.left,
                top: config.layout.top,
                id: config.id
            };

            if (shouldAddContainerOffset && config.formId !== Form.get().id) {
                if (!containerMap[config.formId]) {
                    let configContainerDiv = Configuration.getDiv(config.id).parent('.configuration');
                    containerMap[config.formId] = Configuration.getFromDiv(configContainerDiv);
                }
                let configContainer = containerMap[config.formId];
                position.left += configContainer.layout.left -1;
                position.top += configContainer.layout.top -1;
            }

            if (firstConfig === null || isFirstConfigBeforeSecond(position, firstConfig)) {
                firstConfig = position;
            }
        }
        return firstConfig === null ? null: Configuration.getFromId(firstConfig.id);
    }

    function isFirstConfigBeforeSecond(posOne, posTwo) {
        if (posOne.top === posTwo.top) {
            return posTwo.left > posOne.left;
        } else {
            return posTwo.top > posOne.top;
        }
    }

    function deselectConfigurations(configurationsToDeselect) {
        let singleConfigDeselected = configurationsToDeselect.length === 1;
        let multipleConfigsDeselected = configurationsToDeselect.length >= 2;
        RightPanel.removeButton('UndoDeleteButton');

        if (singleConfigDeselected) {
            let configurationToDeselect = configurationsToDeselect[0];

            if (configurationToDeselect && configurationToDeselect.question) {
                QuestionType[Format[configurationToDeselect.question.format].questionType].deselect(configurationToDeselect);
            } else {
                throw 'Cannot select/deselect an invalid configuration.';
            }
        } else if (multipleConfigsDeselected) {
            AbstractField.deselectMulti(configurationsToDeselect);
        }
    }

    function selectConfigurations(configurationsToSelect) {
        _selectedConfigurations = configurationsToSelect;

        let singleConfigSelected = configurationsToSelect.length === 1;
        let multipleConfigsSelected = configurationsToSelect.length >= 2;

        if (singleConfigSelected) {
            let configurationToSelect = configurationsToSelect[0];

            if (configurationToSelect && configurationToSelect.question) {
                QuestionType[Format[configurationToSelect.question.format].questionType].select(configurationToSelect);
            } else {
                throw 'Cannot select/deselect an invalid configuration.';
            }
        } else if (multipleConfigsSelected) {
            AbstractField.selectMulti(configurationsToSelect);
        }
    }

})(pa.ns('Configuration'), pa.ns('Form'), pa.ns('Question'), pa.ns('LeftPanel'), pa.ns('RightPanel'),
    pa.ns('AbstractField'), pa.ns('QuestionType'), pa.ns('Format'), pa.ns('Layout'), jQuery);