(function(RequiredModule, Configuration, Question, $) {

    RequiredModule.create = function(configuration) {
        let module = $('<div>').attr('id', 'required').addClass('checkbox');
        let label = $('<div>').addClass('label').text('Required:').appendTo(module);
        let input = $('<input>').attr('type', 'checkbox').appendTo(label);

        input.prop('checked', configuration.answerRequired);
        input.on('change', onChange);

        return module;
    };

    function onChange() {
      let me = $(this), selected = Configuration.getSelected()[0];
      selected.answerRequired = me.is(':checked');
      Question.renderTo(selected, Configuration.getDiv(selected.id));
    }

})(pa.ns('RequiredModule'), pa.ns('Configuration'), pa.ns('Question'), jQuery);