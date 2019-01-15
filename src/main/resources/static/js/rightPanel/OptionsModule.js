(function(OptionsModule, Configuration, Option, Question, $) {

    OptionsModule.create = function(configuration) {
        let module = $('<div>').width(145);

        configuration.question.options.forEach(function(option) {
            createOptionDiv(option).appendTo(module);
        });

        let addOption = $('<div>').attr('id', 'addOption').text('+').appendTo(module);
        addOption.on('click', addOptionOnClick);

        return module;
    };

    function addOptionOnClick() {
        let option = Option.create(), selected = Configuration.getSelected()[0];
        selected.question.options.push(option);
        Question.renderTo(selected, Configuration.getDiv(selected.id));
        createOptionDiv(option).insertBefore($('#addOption')).find('input').focus();
    }

    function createOptionDiv(option) {
        let div = $('<div>').addClass('option');
        let deleteOption = $('<div>').addClass('deleteOption').text('x').appendTo(div);
        let text = $('<input type="text">').addClass('optionText').val(option.text).appendTo($('<div>').addClass('optionTextWrapper').appendTo(div));

        text.attr('maxlength', '4000');

        text.on('keyup', function(event) {
            let selected = Configuration.getSelected()[0];
            if (event.which === 13) {
                addOptionOnClick();
            } else {
                option.text = text.val();
                Question.renderTo(selected, Configuration.getDiv(selected.id));
            }
        });

        text.on('focusout', function() {
            let selected = Configuration.getSelected()[0];
            if (text.val().length === 0) {
                if (selected && selected.question) {
                    selected.question.options.splice(selected.question.options.indexOf(option), 1);
                    Question.renderTo(selected, Configuration.getDiv(selected.id));
                    div.remove();
                }
            }
        });

        deleteOption.on('click', function() {
            let selected = Configuration.getSelected()[0];
            selected.question.options.splice(selected.question.options.indexOf(option), 1);
            Question.renderTo(selected, Configuration.getDiv(selected.id));
            div.remove();
        });

        return div;
    }

})(pa.ns('OptionsModule'), pa.ns('Configuration'), pa.ns('Option'), pa.ns('Question'), jQuery);