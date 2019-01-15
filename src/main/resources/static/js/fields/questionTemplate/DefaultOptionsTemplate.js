(function(DefaultOptionsTemplate, Option) {

    DefaultOptionsTemplate.appendTemplate = function(questionConfiguration) {
        let option1 = Option.create('Option1');
        let option2 = Option.create('Option2');
        questionConfiguration.question.options = [option1, option2];
    };

})(pa.ns('DefaultOptionsTemplate'), pa.ns('Option'));