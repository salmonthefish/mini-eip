(function(QuestionTextModule, Configuration, Layout, Question, QuestionContainerType, Form, $) {

    QuestionTextModule.create = function(configuration) {
        let module = $('<div>');

        appendTextArea(configuration, module);
        appendStyleButton(configuration, 'font-weight', 'bold', 'B', module);
        appendStyleButton(configuration, 'font-style', 'italic', 'I', module);
        appendStyleButton(configuration, 'text-decoration', 'underline', 'U', module);
        appendFont(configuration, module);
        appendFontSize(configuration, module);

        return module;
    };

    function appendTextArea(configuration, module) {
        let textArea = $('<textarea>').attr('id', 'text').attr('maxlength', '4000').appendTo(module);
        textArea.val(configuration.question.text);
        textArea.on('input', textAreaOnInput);
        textArea.on('focus', textAreaOnFocus);
        textArea.on('focusout', textAreaOnFocusOut);
    }

    function textAreaOnInput() {
        let me = $(this), selected = Configuration.getSelected()[0];
        let originalText = selected.question.text;
        selected.question.text = me.val();
        let configDiv = Configuration.getDiv(selected.id);
        let prevTextHeight = configDiv.find('.configQuestionText')[0].scrollHeight;
        Question.renderTo(selected, configDiv);

        if (selected.formId === Form.get().id)  {
            let currentTextHeight = configDiv.find('.configQuestionText')[0].scrollHeight;
            if (currentTextHeight > configDiv.outerHeight()) {
                expandQuestionHeight(currentTextHeight, prevTextHeight);
            }
        }
    }

    function expandQuestionHeight(currentTextHeight, prevTextHeight) {
        let textHeightChange = currentTextHeight - prevTextHeight;
        let selected = Configuration.getSelected()[0], configDiv = Configuration.getDiv(selected.id);
        g_expandQuestionHeight(configDiv, currentTextHeight);
    }

    function g_expandQuestionHeight(configDiv, currentTextHeight) {
        let xSize = configDiv.attr('data-sizex');
        let ySize = Math.ceil(currentTextHeight / Form.getGridCellHeight());
        Form.getGridster().resize_widget(configDiv, parseInt(xSize), parseInt(ySize), false);
    }

    function textAreaOnFocus() {
        let me = $(this);
        let tableCellColumnText = /^(Column )\d+/;
        let tableCellRowText = /^(Row )\d+/;
        if (me.val() === 'Question:' || me.val() === 'Label' || me.val().match(tableCellColumnText) || me.val().match(tableCellRowText)) {
            me.val('');
        }
    }

    function textAreaOnFocusOut() {
        let me = $(this), selected = Configuration.getSelected()[0];
        if (me.val().length === 0 && selected.question.text.length === 0) {
            if (selected && selected.question) {
                if (selected.question && selected.question.format === 'LABEL') {
                    me.val(selected.question.text = 'Label');
                } else {
                    me.val(selected.question.text = 'Question:');
                }
                Question.renderTo(selected, Configuration.getDiv(selected.id));
            }
        }
    }

    function appendStyleButton(configuration, style, value, text, module) {
        let styleButton = $('<div>').addClass('styleButtonWrapper').appendTo(module);
        styleButton = $('<div>').attr('id', value).addClass('styleButton ' + value).text(text).appendTo(styleButton);
        styleButton[Layout.hasStyle(configuration.layout.style, style) ? 'addClass' : 'removeClass']('selectedStyleButton');
        styleButton.on('click', createStyleButtonOnClick(style, value));
    }

    function createStyleButtonOnClick(style, value) {
        return function() {
            let me = $(this), selected = Configuration.getSelected()[0];
            me.toggleClass('selectedStyleButton');

            if (me.hasClass('selectedStyleButton')) {
                selected.layout.style = Layout.setStyle(selected.layout.style, style, value);
            } else {
                selected.layout.style = Layout.removeStyle(selected.layout.style, style);
            }

            Question.renderTo(selected, Configuration.getDiv(selected.id));
        };
    }

    function appendFont(configuration, module) {
        let font = $('<select>').attr('id', 'font').appendTo(module);
        $.each({
            'Georgia': 'Georgia, serif',
            'Arial': 'Arial, Helvetica, sans-serif',
            'Courier New': 'Courier New, Courier, monospace'
        }, function(key, value) {
            font.append($('<option>').val(value).text(key).css('font-family', value));
        });
        font.val(Layout.getStyle(configuration.layout.style, 'font-family'));
        font.on('change', fontOnChange);
    }

    function fontOnChange() {
        let selected = Configuration.getSelected()[0];
        selected.layout.style = Layout.setStyle(selected.layout.style, 'font-family', $('#font').val());
        Question.renderTo(selected, Configuration.getDiv(selected.id));
    }

    function appendFontSize(configuration, module) {
        let fontSize = $('<select>').attr('id', 'fontSize').appendTo(module);
        for (let size = 8; size <= 32; size += 2) {
            fontSize.append($('<option>').val(size + 'px').text(size));
        }
        fontSize.val(Layout.getStyle(configuration.layout.style, 'font-size'));
        fontSize.on('change', fontSizeOnChange);
    }

    function fontSizeOnChange() {
        let selected = Configuration.getSelected()[0];
        selected.layout.style = Layout.setStyle(selected.layout.style, 'font-size', $('#fontSize').val());
        Question.renderTo(selected, Configuration.getDiv(selected.id));
    }

})(pa.ns('QuestionTextModule'), pa.ns('Configuration'), pa.ns('Layout'), pa.ns('Question'), pa
    .ns('QuestionContainerType'), pa.ns('Form'), jQuery);