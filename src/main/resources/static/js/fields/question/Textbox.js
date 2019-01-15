(function(Textbox, AbstractQuestionField, RightPanel, RequiredModule, TextDisplayModule, FormatModule) {
    objectUtil.extend(Textbox, AbstractQuestionField);

    Textbox.defaultFormat = 'TEXT';

    Textbox.select = function(configurationToSelect) {
        AbstractQuestionField.select(configurationToSelect);
        RightPanel.appendModuleToAccordionPanel('CONFIGURATION', 'RequiredModule', RequiredModule.create(configurationToSelect));
        RightPanel.appendModuleToAccordionPanel('CONFIGURATION', 'TextDisplayModule', TextDisplayModule.create(configurationToSelect));
        RightPanel.appendModuleToAccordionPanel('CONFIGURATION', 'FormatModule', FormatModule.create(configurationToSelect));
    };

    Textbox.deselect = function(configurationToDeselect) {
        RightPanel.removeModuleFromAccordionPanel('CONFIGURATION', 'FormatModule');
        RightPanel.removeModuleFromAccordionPanel('CONFIGURATION', 'TextDisplayModule');
        RightPanel.removeModuleFromAccordionPanel('CONFIGURATION', 'RequiredModule');
        AbstractQuestionField.deselect(configurationToDeselect);
    };

})(pa.ns('QuestionType.TEXTBOX'), pa.ns('AbstractQuestionField'), pa.ns('RightPanel'), pa.ns('RequiredModule'), pa
    .ns('TextDisplayModule'), pa.ns('FormatModule'));