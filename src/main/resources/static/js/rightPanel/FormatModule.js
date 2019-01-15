(function(FormatModule, Configuration, Question, QuestionType, Format, $) {

    FormatModule.create = function(configuration) {
        let module = $('<div>').attr('id', 'format');
        let label = $('<div>').addClass('label').text('Format:').appendTo(module);
        let select = $('<select>').appendTo(label);

        QuestionType[Format[configuration.question.format].questionType].formats.forEach(function(format) {
            select.append($('<option>').val(format).text(Format[format].name));
        });
        select.val(configuration.question.format);

        select.on('change', onChange);

        return module;
    };

    function onChange() {
        let me = $(this), selected = Configuration.getSelected()[0];
        selected.question.format = me.val();
        Question.renderTo(selected, Configuration.getDiv(selected.id));
    }

})(pa.ns('FormatModule'), pa.ns('Configuration'), pa.ns('Question'), pa.ns('QuestionType'), pa.ns('Format'), jQuery);