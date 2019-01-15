(function(AbstractField, Configuration, RightPanel, CopyButtonModule, DeleteButtonModule, $) {

    AbstractField.defaultAnswers = [];

    AbstractField.createMissingDefaultStyles = function(styleString) {
        return styleString;
    };

    AbstractField.addEventHandlers = function(fieldDiv) {
        fieldDiv.draggable({
            appendTo: '#form',
            helper: 'clone',
            grid: [10, 10],
            distance: 10
        });
        fieldDiv.on('dragstart', handleDraggableStart);
        fieldDiv.on('dragstop', handleDraggableStop);

        fieldDiv.resizable({
            grid: 10
        });
        fieldDiv.on('resizestart', handleResizableStart);
        fieldDiv.on('resizestop', handleResizableStop);
    };

    AbstractField.removeEventHandlers = function(fieldDiv) {
        if (fieldDiv.is('.ui-draggable')) {
            fieldDiv.draggable('destroy');
        }
        fieldDiv.off('dragstart');
        fieldDiv.off('dragstop');

        if (fieldDiv.is('.ui-resizable')) {
            fieldDiv.resizable('destroy');
        }
        fieldDiv.off('resizestart');
        fieldDiv.off('resizestop');
    };

    AbstractField.select = function(configurationToSelect) {
        Configuration.getDiv(configurationToSelect.id).addClass('selectedConfiguration').addClass('ui-selected');
        RightPanel.addButton('CopyButton', CopyButtonModule.create());
        RightPanel.addButton('DeleteButton', DeleteButtonModule.create());
    };

    AbstractField.selectMulti = function(configurationsToSelect) {
        configurationsToSelect.forEach(function(configuration) {
            Configuration.getDiv(configuration.id).addClass('selectedConfiguration').addClass('ui-selected');
        });
        RightPanel.addButton('CopyButton', CopyButtonModule.create());
        RightPanel.addButton('DeleteButton', DeleteButtonModule.create());
    };

    AbstractField.deselect = function(configurationToDeselect) {
        RightPanel.removeButton('DeleteButton');
        RightPanel.removeButton('CopyButton');
        Configuration.getDiv(configurationToDeselect.id).removeClass('selectedConfiguration').removeClass('ui-selected');
    };

    AbstractField.deselectMulti = function(configurationsToDeselect) {
        RightPanel.removeButton('DeleteButton');
        RightPanel.removeButton('CopyButton');
        configurationsToDeselect.forEach(function(configuration) {
            Configuration.getDiv(configuration.id).removeClass('selectedConfiguration').removeClass('ui-selected');
        });
    };

    AbstractField.validate = function(configuration, asyncValidation) {
        return 'valid';
    };

    function handleDraggableStart(event) {
        let me = $(this);
        event.stopPropagation();
        me.hide();
    }

    function handleDraggableStop(event, ui) {
        var me = $(this);
        var configuration = Configuration.getFromDiv(me);

        event.stopPropagation();
        if (configuration) {
            configuration.layout.top = ui.position.top < 0 ? 0 : ui.position.top;
            configuration.layout.left = ui.position.left < 0 ? 0 : ui.position.left;

            me.css('top', configuration.layout.top);
            me.css('left', configuration.layout.left);
        }
        
        me.show();
    }

    function handleResizableStart(event) {
        let me = $(this);
        event.stopPropagation();
    }

    function handleResizableStop(event, ui) {
        let me = $(this);
        let configuration = Configuration.getFromDiv(me);

        event.stopPropagation();
        if (configuration) {
            configuration.layout.height = parseInt(ui.helper.css('height'));
            configuration.layout.width = parseInt(ui.helper.css('width'));
        }
    }

})(pa.ns('AbstractField'), pa.ns('Configuration'), pa.ns('RightPanel'), pa.ns('CopyButtonModule'),
    pa.ns('DeleteButtonModule'), jQuery);