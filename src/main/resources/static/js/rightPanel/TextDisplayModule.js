(function(TextDisplayModule, Configuration, Layout, Question, $) {

    TextDisplayModule.create = function(configuration) {
        let module = $('<div>');

        appendTextDisplayed(configuration, module);
        appendPosition(configuration, module);

        return module;
    };

    function appendTextDisplayed(configuration, module) {
        let textDisplayed = $('<div>').attr('id', 'textDisplayed').addClass('checkbox').appendTo(module);
        let label = $('<div>').addClass('label').text('Text Displayed:').appendTo(textDisplayed);
        let input = $('<input>').attr('type', 'checkbox').appendTo(label);

        input.prop('checked', isTextDisplayedSelected(configuration));
        input.on('change', onChange);
    }

    function appendPosition(configuration, module) {
        let position = $('<select>').attr('id', 'position').appendTo(module);
        let above = $('<option>').val('above').text('Display Above').appendTo(position);
        let left = $('<option>').val('left').text('Display Left').appendTo(position);

        if (!isTextDisplayedSelected(configuration)) {
            position.hide();
        }

        if (Layout.hasStyle(configuration.layout.style, 'float')) {
            left.prop('selected', 'selected');
        } else {
            above.prop('selected', 'selected');
        }

        position.on('change', onChange);
    }

    function onChange() {
        let selected = Configuration.getSelected()[0];

        if ($('#textDisplayed input').is(':checked') && $('#position').val() === 'above') {
            $('#position').show();
            selected.layout.style = Layout.setStyle(selected.layout.style, 'padding', '0px 0px 10px 0px');
            selected.layout.style = Layout.removeStyle(selected.layout.style, 'display');
            selected.layout.style = Layout.removeStyle(selected.layout.style, 'float');
        } else if ($('#textDisplayed input').is(':checked') && $('#position').val() === 'left') {
            $('#position').show();
            selected.layout.style = Layout.setStyle(selected.layout.style, 'padding', '0px 10px 0px 0px');
            selected.layout.style = Layout.setStyle(selected.layout.style, 'display', 'inline');
            selected.layout.style = Layout.setStyle(selected.layout.style, 'float', 'left');
        } else {
            $('#position').hide();
            selected.layout.style = Layout.setStyle(selected.layout.style, 'display', 'none');
            selected.layout.style = Layout.removeStyle(selected.layout.style, 'float');
            selected.layout.style = Layout.removeStyle(selected.layout.style, 'padding');
        }

        Question.renderTo(selected, Configuration.getDiv(selected.id));
    }

    function isTextDisplayedSelected(configuration) {
        return !Layout.hasStyle(configuration.layout.style, 'display:none;');
    }

})(pa.ns('TextDisplayModule'), pa.ns('Configuration'), pa.ns('Layout'), pa.ns('Question'), jQuery);