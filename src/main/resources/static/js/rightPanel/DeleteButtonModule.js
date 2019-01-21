(function(DeleteButtonModule, Configuration, Form, QuestionContainerType, AlertPopup, RightPanel, $) {

    DeleteButtonModule.create = function() {
        let module = $('<div>').attr('id', 'deleteButton').addClass('button rightPanelButton').text('DELETE FIELD');

        module.on('click', onClick);

        return module;
    };

    function onClick() {
        g_onClick();
    }

    function g_onClick() {
        deleteSelected();
    }

    function deleteSelected() {
        Configuration.getSelected().forEach(Form.removeConfiguration);
        Form.validate(Form.get());
        UndoDeleteButtonModule.snapshot();
        Configuration.select([]);
        RightPanel.addButton('UndoDeleteButton', UndoDeleteButtonModule.create());
    }

})(pa.ns('DeleteButtonModule'), pa.ns('Configuration'), pa.ns('Form'),
    pa.ns('QuestionContainerType'), pa.ns('AlertPopup'), pa.ns('RightPanel'), jQuery);