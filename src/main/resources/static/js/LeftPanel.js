(function(LeftPanel, Library, InputUtil, Configuration, Form, QuestionTemplate, AbstractQuestionField, QuestionContainerType, AlertPopup, FormEventHandlerManager, Textbox, $) {

    LeftPanel.initialize = function() {
        render();
        setPricingSpecificFields();
        addEventHandlers();
    };

    LeftPanel.selectType = function(type) {
        $('#' + type).addClass('selectedQuestionType');
    };

    LeftPanel.deselectType = function(type) {
        $('#' + type).removeClass('selectedQuestionType');
    };

    function render() {
        let $leftPanel = $('#leftPanel');

        if(Form.getMode() === Form.GRIDFORM) {
            $('[questionContainerType="SECTION"]').addClass('disabledAddButton');
        }

        $leftPanel.accordion({
            heightStyle: 'fill',
            animate: false
        });
        
        $leftPanel.accordion('refresh');
    }

    function addEventHandlers() {
        let $questionsAndContainers = Form.getMode() === Form.GRIDFORM ? $('.questionType, .questionContainerType:not(#SECTION)') : $('.questionType, .questionContainerType');

        if ($questionsAndContainers.hasClass('ui-draggable')) {
            $questionsAndContainers.draggable('destroy');
        }

        $questionsAndContainers.draggable({
            appendTo: 'body',
            helper: function(event) {
                let properties = getHelperDimensions($(event.target));
                return $(event.target).clone().css(properties);
            },
            grid: [10, 10],
            distance: 10
        });

        $questionsAndContainers.on('drag.LeftPanel', LeftPanel.handleDrag);

        $(window).on('resize.LeftPanel', function() {
            $('#leftPanel').accordion('refresh');
        });
    
        let $clickToAdd = Form.getMode() === Form.GRIDFORM ? $('.addConfiguration:not([questionContainerType="SECTION"])') : $('.addConfiguration');
        $clickToAdd.on('click.LeftPanel', LeftPanel.handleClick);

        if (Form.getMode() === Form.GRIDFORM) {
            $('#SECTION').on('click.LeftPanel', BlockButtonModule.onClick);
        }
    }

    LeftPanel.handleClick = function() {
        let newPosition = LeftPanel.calculateNewPosition();

        if (newPosition !== undefined) {
            let questionType = $(this).attr('questionType');
            let questionTemplate = $(this).attr('questionTemplate');
            let type = questionType ? questionType : QuestionTemplate[questionTemplate].questionType;
            
            configuration = Configuration.create(questionTemplate !== undefined || questionType !== undefined, type);

            if (questionTemplate) {
                QuestionTemplate[questionTemplate].appendTemplate(configuration);
            }

            configuration.layout.top = newPosition.top;
            configuration.layout.left = newPosition.left;
            
            Form.addConfigurationTo(configuration, Form.getDiv());
            Configuration.select([configuration]);
            Form.getDiv().scrollTop(Form.getDiv()[0].scrollHeight);
        } else {
            AlertPopup.open({
                top: 'calc(50% - 60px)',
                left: 'calc(50% - 275px)',
                height: '120px',
                width: '650px',
                title: 'Error',
                closeable: true,
                content: 'Cannot add question. Maximum number of rows reached.'
            });
        }
    };
    
    LeftPanel.calculateNewPosition = function() {
        if(Form.getMode() === Form.FREEFORM) {
            return f_calculateNewPosition();
        } else if (Form.getMode() === Form.GRIDFORM) {
            return g_calculateNewPosition();
        }
    };

    function g_calculateNewPosition() {
        let widgets = Form.getGridster().serialize();
        let newTopPosition = 1;
        widgets.forEach(function(widget) {
            let value = widget.row + widget.size_y;
            newTopPosition = value > newTopPosition ? value : newTopPosition;
        });
        if(newTopPosition > Form.getGridster().options.max_rows) {
            return undefined;
        }
        return {top: newTopPosition, left: 1};
    }

    LeftPanel.handleDrag = function(event, ui) {
        LeftPanel.translateHelperPositionTo10x10Grid(ui);

        return FormEventHandlerManager.dragAndScroll(ui.position);
    };
    
    LeftPanel.translateHelperPositionTo10x10Grid = function(ui) {
        let $form = $('#form');
        let uiPositionVerticalOffset = 53;
        let uiPositionHorizontalOffset = 158;
        ui.position.top -= (ui.position.top - uiPositionVerticalOffset + $form.scrollTop()) % 10;
        ui.position.left -= (ui.position.left - uiPositionHorizontalOffset + $form.scrollLeft()) % 10;
    };

    function getHelperDimensions($targetDiv) {
        return g_getHelperDimensions($targetDiv);
    }

    function g_getHelperDimensions($targetDiv) {
        let dimensions = {},
            questionTemplate = $targetDiv.attr('questiontemplate'),
            type = $targetDiv.attr('id') ? $targetDiv.attr('id') : QuestionTemplate[questionTemplate].questionType;


        dimensions.width = Form.getGridCellWidth() * AbstractQuestionField.getDefaultWidth();
        dimensions.height = Form.getGridCellHeight() * AbstractQuestionField.getDefaultHeight();

        return dimensions;
    }

    function f_getHelperDimensions($targetDiv) {
        let dimensions = {},
            questionTemplate = $targetDiv.attr('questiontemplate'),
            type = $targetDiv.attr('id') ? $targetDiv.attr('id') : QuestionTemplate[questionTemplate].questionType;

        dimensions.width = AbstractQuestionField.getDefaultWidth();
        dimensions.height = AbstractQuestionField.getDefaultHeight();

        return dimensions;
    }

})(pa.ns('LeftPanel'), pa.ns('InputUtil'), pa.ns('Configuration'), pa.ns('Form'),
    pa.ns('QuestionTemplate'), pa.ns('QuestionType.AbstractQuestionField'), pa.ns('AlertPopup'),
    pa.ns('FormEventHandlerManager'), pa.ns('QuestionType.TEXTBOX'), jQuery);
