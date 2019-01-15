(function(Form, Configuration, URLParametersUtil, FormEventHandlerManager, Table, Section, QuestionContainerType, QuestionType, Format, $) {

    let _nextId = -1;
    let _originalFormRenderTo = Form.renderTo;

    Form.getNextId = function() {
        return _nextId--;
    };

    Form.renderTo = function(form, parent) {
        if(Form.getMode() === Form.GRIDFORM) {
            Form.g_renderTo.apply(this, arguments);
        } else if(Form.getMode() === Form.FREEFORM){
            Form.f_renderTo.apply(this, arguments);
        }
    };

    Form.f_renderTo = function() {
        _originalFormRenderTo.apply(this, arguments);
    };

    Form.g_renderTo = function(form, parent) {
        let $gridsterContainer = $('#gridsterContainer');
        if($gridsterContainer.length === 0) {
            $gridsterContainer = $('<div class="gridster" id="gridsterContainer"></div>').appendTo(parent);
        }
        
        _originalFormRenderTo.apply(this, arguments);
        
        if(!parent.is('.configuration')) {
            Form.initializeGridster($gridsterContainer);
        }
    };

    Form.initializeGridster = function($gridsterContainer) {
        let originalHeight, originalWidth;
        _gridster = $gridsterContainer.gridster({
            min_cols: 12,
            min_rows: 6,
            max_rows: 5000,
            avoid_overlapped_widgets: true,
            widget_base_dimensions: [Form.getGridCellWidth(), Form.getGridCellHeight()],
            widget_margins: [0, 0],
            resize: {
                enabled: true,
                start: function(event, position, configurationDiv) {
                    originalHeight = parseInt(configurationDiv.attr('data-sizey'));
                    originalWidth = parseInt(configurationDiv.attr('data-sizex'));
                },
                stop: function(event, position, configurationDiv) {
                    let config = Configuration.getFromDiv(configurationDiv);
                    if (config.questionContainer && config.questionContainer.formType === 'TABLE') {
                        Table.handleTableResizeStop(config, originalHeight, originalWidth);
                    } else if(config.questionContainer && config.questionContainer.formType === 'SECTION') {
                        Section.handleResizeStop(config, originalHeight, originalWidth);
                    }
                }
            },
            draggable: {
                start: FormEventHandlerManager.onDragStart,
                fix_scroll_position: FormEventHandlerManager.fixScrollPosition,
                dragAndScroll: Form.onDragAndScroll
            },
            autogenerate_stylesheet: false,
            shift_widgets_up: false,
            widget_selector: 'div.configuration:not(.table-cell)',
            shift_larger_widgets_down: true,
            collision: {
                wait_for_mouseup: true
            },
            attr_callback: Form.updateLayout
        }).data('gridster');
    };

    Form.onDragAndScroll = function(event, ui) {
        FormEventHandlerManager.dragAndScroll(ui.pointer);
    };

    Form.updateLayout = function(name, value) {
        if($(this).hasClass('configuration')) {
            let configuration = Configuration.getFromId(this[0].id);
            if(value) {
                if(name === 'data-col') {
                    configuration.layout.left = parseInt(value);
                } else if(name === 'data-row') {
                    configuration.layout.top = parseInt(value);
                } else if(name === 'data-sizex') {
                    configuration.layout.width = parseInt(value);
                } else if(name === 'data-sizey') {
                    configuration.layout.height = parseInt(value);
                }
            } else if(typeof (name) === 'object') {
                for( let prop in name) {
                    if(prop === 'data-col') {
                        configuration.layout.left = parseInt(name[prop]);
                    } else if(prop === 'data-row') {
                        configuration.layout.top = parseInt(name[prop]);
                    } else if(prop === 'data-sizex') {
                        configuration.layout.width = parseInt(name[prop]);
                    } else if(prop === 'data-sizey') {
                        configuration.layout.height = parseInt(name[prop]);
                    }
                }
            }
        }
    };

    Form.create = function() {
        return {
            id: Form.getNextId(),
            name: 'Name',
            formMode: Form.getMode(),
            formType: URLParametersUtil.getParameter('formType'),
            configurations: []
        };
    };

    Form.createQuestionContainer = function(formType, settings) {
        let questionContainer = {
            id: Form.getNextId(),
            formMode: Form.getMode(),
            formType: formType,
            configurations: QuestionContainerType[formType].generateDefaultConfigurations(settings)
        };

        questionContainer.configurations.forEach(function(configuration) {
            configuration.formId = questionContainer.id;
        });

        return questionContainer;
    };

    Form.render = function(form) {
        form = form ? form : Form.create();

        $('#formName').val(form.name);
        Form.renderTo(form, $('#form'));

        FormEventHandlerManager.addEventHandlers(Form.getDiv());

        form.configurations.forEach(function(configuration) {
            let configurationDiv = Configuration.getDiv(configuration.id);
            if(configuration.questionContainer && configuration.questionContainer.formType === 'SECTION' && Form.getMode() === Form.FREEFORM) {
                Section.addDroppableEventHandlers(configurationDiv);
            }
        });
    };

    Form.addConfigurationsTo = function() {
        if (Form.getMode() === Form.GRIDFORM) {
            Form.g_addConfigurationsTo.apply(this, arguments);
        } else if(Form.getMode() === Form.FREEFORM) {
            Form.f_addConfigurationsTo.apply(this, arguments);
        }
    };

    Form.f_addConfigurationsTo = function(configurations, formDiv) {
        let form = Form.getFromDiv(formDiv);
        configurations.forEach(function(configuration){
            form.configurations.push(configuration);
            configuration.formId = form.id;
            Configuration.renderTo(configuration, formDiv);
        });
    };

    Form.g_addConfigurationsTo = function(configurations, formDiv) {
        Form.getGridster().destroy();
        let form = Form.getFromDiv(formDiv);
        configurations.forEach(function(configuration){
            form.configurations.push(configuration);
            configuration.formId = form.id;
            Configuration.renderTo(configuration, formDiv);
        });

        Form.initializeGridster($('#gridsterContainer'));
    };

    Form.addConfigurationTo = function(configuration, formDiv) {
        let form = Form.getFromDiv(formDiv);

        form.configurations.push(configuration);
        configuration.formId = form.id;

        Configuration.renderTo(configuration, formDiv);
        if (Form.getMode() === Form.GRIDFORM) {
            Form.getGridster().add_widget(
                Configuration.getDiv(configuration.id),
                configuration.layout.width,
                configuration.layout.height,
                configuration.layout.left,
                configuration.layout.top
            );
        }
    };

    Form.moveConfigurationTo = function(configuration, formDiv) {
        let configurations = Form.getFromId(configuration.formId).configurations, form = Form.getFromDiv(formDiv);

        configurations.splice(configurations.indexOf(configuration), 1);
        form.configurations.push(configuration);
        configuration.formId = form.id;

        formDiv.append(Configuration.getDiv(configuration.id));
    };

    Form.removeConfiguration = function(configuration) {
        let parentForm = Form.getFromId(configuration.formId);

        let parentFormConfigurations = parentForm.configurations;
        parentFormConfigurations.splice(parentFormConfigurations.indexOf(configuration), 1);

        Form.removeConfigurationFromDOM(configuration.id);

        Configuration.removeFromMap(configuration.id);

        if (configuration.questionContainer) {
            Form.removeFromMap(configuration.questionContainer.id);
            configuration.questionContainer.configurations.forEach(function(configuration) {
                Configuration.removeFromMap(configuration.id);
            });
        }
    };

    Form.removeConfigurationFromDOM = function(id) {
        let configurationDiv = Configuration.getDiv(id);

        if (Form.getMode() === Form.FREEFORM) {
            configurationDiv.remove();
        } else if (Form.getMode() === Form.GRIDFORM) {
            Form.getGridster().remove_widget(configurationDiv, true);
        }
    };

    Form.validate = function(form) {
        let validity = 'valid';

        form.configurations.forEach(function(configuration) {
            switch(Configuration.validate(configuration)) {
                case 'invalid':
                    validity = 'invalid';
                    break;
                case 'validating':
                    validity = validity === 'invalid' ? 'invalid' : 'validating';
                    break;
                case 'valid':
                    break;
            }
        });

        return validity;
    };

    Form.getGridster = function() {
        return _gridster;
    };

})(pa.ns('Form'), pa.ns('Configuration'), pa.ns('FormEventHandlerManager'), pa.ns('QuestionContainerType'),
    pa.ns('QuestionType'), pa.ns('Format'), jQuery);