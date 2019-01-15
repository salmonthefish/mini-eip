(function(OptionsPositionModule, Configuration, Layout, Question, $) {

    OptionsPositionModule.create = function(configuration) {
        let module = $('<select>').attr('id', 'optionPosition');
        let horizontal = $('<option>').val('horizontal').text('Horizontal Layout').appendTo(module);
        let vertical = $('<option>').val('vertical').text('Vertical Layout').appendTo(module);
        
        if (Layout.hasStyle(configuration.layout.style, 'option-layout')) {
            vertical.prop('selected', 'selected');
        } else {
            horizontal.prop('selected', 'selected');
        }
        module.on('change', onChange);

        return module;
    };

    function onChange() {
        var selected = Configuration.getSelected()[0];
        if ($('#optionPosition').val() === 'horizontal') {
            selected.layout.style = Layout.removeStyle(selected.layout.style, 'option-layout');
        } else if($('#optionPosition').val() === 'vertical') {
            selected.layout.style = Layout.setStyle(selected.layout.style, 'option-layout', 'vertical');
        }
        Question.renderTo(selected, Configuration.getDiv(selected.id));
    }

})(pa.ns('OptionsPositionModule'), pa.ns('Configuration'), pa.ns('Layout'), pa.ns('Question'), jQuery);