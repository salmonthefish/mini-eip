(function(Label, AbstractQuestionField, Layout, RightPanel, HiddenOnReportModule) {
    objectUtil.extend(Label, AbstractQuestionField);

    Label.defaultFormat = 'LABEL';
    Label.defaultText = 'Label';

    Label.createMissingDefaultStyles = function(styleString) {
        styleString = AbstractQuestionField.createMissingDefaultStyles(styleString);
        styleString = Layout.setStyle(styleString, 'display', 'inline');
        return styleString;
    };

    Label.select = function(configurationToSelect) {
        AbstractQuestionField.select(configurationToSelect);
        RightPanel.appendModuleToAccordionPanel('CONFIGURATION', 'HiddenOnReportModule', HiddenOnReportModule.create(configurationToSelect));
    };

    Label.deselect = function(configurationToDeselect) {
        RightPanel.removeModuleFromAccordionPanel('CONFIGURATION', 'HiddenOnReportModule');
        AbstractQuestionField.deselect(configurationToDeselect);
    };

})(pa.ns('QuestionType.LABEL'), pa.ns('AbstractQuestionField'), pa.ns('pa.form.Layout'), pa.ns('RightPanel'), pa.ns('HiddenOnReportModule'));