(function(AbstractQuestionField, AbstractField, Layout, Format, LeftPanel, RightPanel, QuestionTextModule, Form, Section, Configuration) {
    objectUtil.extend(AbstractQuestionField, AbstractField);

    AbstractQuestionField.defaultText = 'Question:';

    AbstractQuestionField.getDefaultHeight = function() {
        if (Form.getMode() === Form.FREEFORM) {
            return 60;
        } else if (Form.getMode() === Form.GRIDFORM) {
            return 1;
        }
    };

    AbstractQuestionField.getDefaultWidth = function() {
        if (Form.getMode() === Form.FREEFORM) {
            return 640;
        } else if(Form.getMode() === Form.GRIDFORM) {
            return 6;
        }
    };

    AbstractQuestionField.createMissingDefaultStyles = function(styleString) {
        styleString = AbstractField.createMissingDefaultStyles(styleString);
        styleString = Layout.hasStyle(styleString, 'padding') ? styleString : Layout.setStyle(styleString, 'padding', '0px 10px 0px 0px');
        styleString = Layout.hasStyle(styleString, 'display') ? styleString : Layout.setStyle(styleString, 'display', 'inline');
        styleString = Layout.hasStyle(styleString, 'float') ? styleString : Layout.setStyle(styleString, 'float', 'left');
        styleString = Layout.hasStyle(styleString, 'font-size') ? styleString : Layout.setStyle(styleString, 'font-size', '12px');
        styleString = Layout.hasStyle(styleString, 'font-family') ? styleString : Layout.setStyle(styleString, 'font-family', 'Arial, Helvetica, sans-serif');
        styleString = Layout.setStyle(styleString, 'hidden-on-report', 'false');
        return styleString;
    };

    AbstractQuestionField.select = function(configurationToSelect) {
        AbstractField.select(configurationToSelect);
        LeftPanel.selectType(Format[configurationToSelect.question.format].questionType);
        RightPanel.addAccordionPanel('CONFIGURATION');
        RightPanel.appendModuleToAccordionPanel('CONFIGURATION', 'QuestionTextModule', QuestionTextModule.create(configurationToSelect));
        if (Form.getMode() === Form.GRIDFORM) {
            if (Section.isInsideSection(configurationToSelect)) {
                let blockConfig = Configuration.getFromDiv(Configuration.getDiv(configurationToSelect.id).parent());
                RightPanel.addButton('UngroupBlock', BlockUngroupModule.create(blockConfig));
            }
            AbstractQuestionField.focusRightPanelTextBox(configurationToSelect);
        }
    };

    AbstractQuestionField.deselect = function(configurationToDeselect) {
        RightPanel.removeModuleFromAccordionPanel('CONFIGURATION', 'QuestionTextModule');
        RightPanel.removeAccordionPanel('CONFIGURATION');
        if (Form.getMode() === Form.GRIDFORM && Section.isInsideSection(configurationToDeselect)) {
            RightPanel.removeButton('UngroupBlock');
        }
        LeftPanel.deselectType(Format[configurationToDeselect.question.format].questionType);
        AbstractField.deselect(configurationToDeselect);
    };

    AbstractQuestionField.focusRightPanelTextBox = function(configurationToSelect) {
        let configDiv = Configuration.getDiv(configurationToSelect.id);
        if (!configDiv.find('input,select,textarea').is(':focus')) {
            let $text = $('#text');
            $text.focus();
            // ensure that the typing cursor starts at the end of the text
            let val = $text.val();
            $text.val('');
            $text.val(val);
        }
    };

})(pa.ns('AbstractQuestionField'), pa.ns('AbstractField'), pa.ns('Layout'), pa.ns('Format'), pa
    .ns('LeftPanel'), pa.ns('RightPanel'), pa.ns('QuestionTextModule'), pa.ns('Form'), pa.ns('Configuration'));