(function(Textarea, AbstractQuestionField, RightPanel, RequiredModule, TextDisplayModule) {
    objectUtil.extend(Textarea, AbstractQuestionField);

    Textarea.defaultFormat = 'TEXTAREA';

    Textarea.select = function(configurationToSelect) {
        AbstractQuestionField.select(configurationToSelect);
        RightPanel.appendModuleToAccordionPanel('CONFIGURATION', 'RequiredModule', RequiredModule.create(configurationToSelect));
        RightPanel.appendModuleToAccordionPanel('CONFIGURATION', 'TextDisplayModule', TextDisplayModule.create(configurationToSelect));
    };

    Textarea.deselect = function(configurationToDeselect) {
        RightPanel.removeModuleFromAccordionPanel('CONFIGURATION', 'TextDisplayModule');
        RightPanel.removeModuleFromAccordionPanel('CONFIGURATION', 'RequiredModule');
        AbstractQuestionField.deselect(configurationToDeselect);
    };

})(pa.ns('QuestionType.TEXTAREA'), pa.ns('QuestionType.AbstractQuestionField'), pa.ns('RightPanel'), pa.ns('RequiredModule'), pa
    .ns('TextDisplayModule'));