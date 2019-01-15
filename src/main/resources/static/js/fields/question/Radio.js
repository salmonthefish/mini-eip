(function(Radio, AbstractQuestionField, RightPanel, RequiredModule, TextDisplayModule, OptionsModule, OptionsPositionModule) {
    objectUtil.extend(Radio, AbstractQuestionField);

    Radio.defaultFormat = 'RADIO';

    Radio.select = function(configurationToSelect) {
        AbstractQuestionField.select(configurationToSelect);
        RightPanel.appendModuleToAccordionPanel('CONFIGURATION', 'RequiredModule', RequiredModule.create(configurationToSelect));
        RightPanel.appendModuleToAccordionPanel('CONFIGURATION', 'TextDisplayModule', TextDisplayModule.create(configurationToSelect));
        RightPanel.addAccordionPanel('SELECTIONS');
        RightPanel.appendModuleToAccordionPanel('SELECTIONS', 'OptionsPositionModule', OptionsPositionModule.create(configurationToSelect));
        RightPanel.appendModuleToAccordionPanel('SELECTIONS', 'OptionsModule', OptionsModule.create(configurationToSelect));
    };

    Radio.deselect = function(configurationToDeselect) {
        RightPanel.removeModuleFromAccordionPanel('SELECTIONS', 'OptionsModule');
        RightPanel.removeModuleFromAccordionPanel('SELECTIONS', 'OptionsPositionModule');
        RightPanel.removeAccordionPanel('SELECTIONS');
        RightPanel.removeModuleFromAccordionPanel('CONFIGURATION', 'TextDisplayModule');
        RightPanel.removeModuleFromAccordionPanel('CONFIGURATION', 'RequiredModule');
        AbstractQuestionField.deselect(configurationToDeselect);
    };

})(pa.ns('QuestionType.RADIO'), pa.ns('AbstractQuestionField'), pa.ns('RightPanel'), pa.ns('RequiredModule'), pa
    .ns('TextDisplayModule'), pa.ns('OptionsModule'), pa.ns('OptionsPositionModule'));