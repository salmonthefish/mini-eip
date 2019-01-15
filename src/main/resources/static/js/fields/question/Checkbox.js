(function(Checkbox, AbstractQuestionField, RightPanel, RequiredModule, TextDisplayModule, OptionsModule, OptionsPositionModule) {
    objectUtil.extend(Checkbox, AbstractQuestionField);

    Checkbox.defaultFormat = 'CHECKBOX';

    Checkbox.select = function(configurationToSelect) {
        AbstractQuestionField.select(configurationToSelect);
        RightPanel.appendModuleToAccordionPanel('CONFIGURATION', 'RequiredModule', RequiredModule.create(configurationToSelect));
        RightPanel.appendModuleToAccordionPanel('CONFIGURATION', 'TextDisplayModule', TextDisplayModule.create(configurationToSelect));
        RightPanel.addAccordionPanel('SELECTIONS');
        RightPanel.appendModuleToAccordionPanel('SELECTIONS', 'OptionsPositionModule', OptionsPositionModule.create(configurationToSelect));
        RightPanel.appendModuleToAccordionPanel('SELECTIONS', 'OptionsModule', OptionsModule.create(configurationToSelect));
    };

    Checkbox.deselect = function(configurationToDeselect) {
        RightPanel.removeModuleFromAccordionPanel('SELECTIONS', 'OptionsModule');
        RightPanel.removeModuleFromAccordionPanel('SELECTIONS', 'OptionsPositionModule');
        RightPanel.removeAccordionPanel('SELECTIONS');
        RightPanel.removeModuleFromAccordionPanel('CONFIGURATION', 'TextDisplayModule');
        RightPanel.removeModuleFromAccordionPanel('CONFIGURATION', 'RequiredModule');
        AbstractQuestionField.deselect(configurationToDeselect);
    };

})(pa.ns('QuestionType.CHECKBOX'), pa.ns('AbstractQuestionField'), pa.ns('RightPanel'), pa.ns('RequiredModule'), pa
    .ns('TextDisplayModule'), pa.ns('OptionsModule'), pa.ns('OptionsPositionModule'));