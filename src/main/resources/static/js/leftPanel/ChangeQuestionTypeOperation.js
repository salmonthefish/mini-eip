(function(Form, Configuration, Question, QuestionType, Format, Layout, QuestionTemplate, $) {

    $(document).ready(function() {
        addEventHandlers();
    });

    function addEventHandlers() {
        $('.questionType').on('click', onClick);
    }

    function onClick(event) {
        let divId = $(event.target).attr('id');
        let questionTemplate = $(event.target).attr('questionTemplate');
        let questionType = divId ? divId : QuestionTemplate[questionTemplate].questionType;
        let selectedConfigs = Configuration.getSelected();
        let areConfigurationsSelected = selectedConfigs.length > 0;

        if (questionType && areConfigurationsSelected) {
            Configuration.select([]);

            selectedConfigs.forEach(function(config) {
                let configurationDiv = Configuration.getDiv(config.id).removeClass('configurationError');

                if (config.question) {
                    if (questionType !== Format[config.question.format].questionType) {
                        config.question.format = QuestionType[questionType].defaultFormat;
                        config.defaultAnswers = objectUtil.copy(QuestionType[questionType].defaultAnswers);
                        config.layout.style = QuestionType[questionType].createMissingDefaultStyles(config.layout.style);
                        Question.renderTo(config, configurationDiv);
                    }

                    if (questionTemplate) {
                        QuestionTemplate[questionTemplate].appendTemplate(config);
                        Question.renderTo(config, configurationDiv);
                    }
                }
            });

            Form.validate(Form.get());
            Configuration.select(selectedConfigs);
        }
    }

})(pa.ns('Form'), pa.ns('Configuration'), pa.ns('Question'), pa.ns('QuestionType'),
pa.ns('Format'), pa.ns('Layout'), pa.ns('QuestionTemplate'), jQuery);