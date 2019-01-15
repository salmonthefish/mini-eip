(function(Select, AbstractQuestionField, RightPanel, RequiredModule, TextDisplayModule, OptionsModule, undefined) {
    objectUtil.extend(Select, AbstractQuestionField);

    Select.defaultFormat = 'SELECT';

    Select.select = function(configurationToSelect) {
        AbstractQuestionField.select(configurationToSelect);
        RightPanel.appendModuleToAccordionPanel('CONFIGURATION', 'RequiredModule', RequiredModule.create(configurationToSelect));
        RightPanel.appendModuleToAccordionPanel('CONFIGURATION', 'TextDisplayModule', TextDisplayModule.create(configurationToSelect));
        RightPanel.addAccordionPanel('SELECTIONS');
        RightPanel.appendModuleToAccordionPanel('SELECTIONS', 'OptionsModule', OptionsModule.create(configurationToSelect));
    };

    Select.deselect = function(configurationToDeselect) {
        RightPanel.removeModuleFromAccordionPanel('SELECTIONS', 'OptionsModule');
        RightPanel.removeAccordionPanel('SELECTIONS');
        RightPanel.removeModuleFromAccordionPanel('CONFIGURATION', 'TextDisplayModule');
        RightPanel.removeModuleFromAccordionPanel('CONFIGURATION', 'RequiredModule');
        AbstractQuestionField.deselect(configurationToDeselect);
    };

})(pa.ns('QuestionType.SELECT'), pa.ns('AbstractQuestionField'), pa.ns('RightPanel'), pa.ns('RequiredModule'), pa
    .ns('TextDisplayModule'), pa.ns('OptionsModule'));