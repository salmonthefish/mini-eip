(function(DeleteButtonModule, Configuration, Form, QuestionContainerType, AlertPopup, RightPanel, $) {

    DeleteButtonModule.CANNOT_DELETE_TABLE_CELL_MESSAGE = 'Cannot delete cells within a table. To delete a table please select it at the top left corner and press "Delete Field".';
    DeleteButtonModule.CANNOT_DELETE_BLOCK_CHILD_MESSAGE = 'Unable to delete questions within a block. Please ungroup the block and try again.';
    DeleteButtonModule.BLOCK_DELETE_WARNING = 'All questions inside the block will be deleted. Are you sure?';

    DeleteButtonModule.create = function() {
        let module = $('<div>').attr('id', 'deleteButton').addClass('button rightPanelButton').text('DELETE FIELD');

        module.on('click', onClick);

        return module;
    };

    function onClick() {
        if (Form.getMode() === Form.FREEFORM) {
            f_onClick();
        } else if (Form.getMode() === Form.GRIDFORM) {
            g_onClick();
        }
    }

    DeleteButtonModule.getUserMessages = function() {
        if (Form.getMode() === Form.FREEFORM) {
            return f_getUserMessages();
        } else if (Form.getMode() === Form.GRIDFORM) {
            return g_getUserMessages();
        }
    };

    function f_onClick() {
        let messages = DeleteButtonModule.getUserMessages();
        if (messages.errorMessage) {
            displayAlertPopup(messages.errorMessage);
        } else {
            deleteSelected();
        }
    }

    function g_onClick() {
        let messages = DeleteButtonModule.getUserMessages();
        if (messages.errorMessage) {
            displayAlertPopup(messages.errorMessage);
        } else if(messages.warningMessage) {
            let buttons = [{
                  label: 'DELETE',
                  handler: deleteSelected
              }, {
                  label: 'CANCEL'
              }];
            displayAlertPopup(messages.warningMessage, buttons);
        } else {
            deleteSelected();
        }
    }

    function displayAlertPopup(message, buttons) {
        AlertPopup.open({
            top: 'calc(50% - 100px)',
            left: 'calc(50% - 450px)',
            height: '200px',
            width: '900px',
            color: '#7D93A8',
            title: 'Error',
            content: message,
            buttons: buttons
        });
    }

    function deleteSelected() {
        Configuration.getSelected().forEach(Form.removeConfiguration);
        Form.validate(Form.get());
        UndoDeleteButtonModule.snapshot();
        Configuration.select([]);
        RightPanel.addButton('UndoDeleteButton', UndoDeleteButtonModule.create());
    }

    function g_getUserMessages() {
        let errorMessage, warningMessage;

        $.each(Configuration.getSelected(), function(index, currentConfiguration) {
            if (QuestionContainerType.TABLE.isTableCell(currentConfiguration)) {
                errorMessage = DeleteButtonModule.CANNOT_DELETE_TABLE_CELL_MESSAGE;
                return false;
            }
            if (QuestionContainerType.SECTION.isInsideSection(currentConfiguration)) {
                errorMessage = DeleteButtonModule.CANNOT_DELETE_BLOCK_CHILD_MESSAGE;
                return false;
            }
            if (currentConfiguration.questionContainer && currentConfiguration.questionContainer.formType === 'SECTION') {
                warningMessage = DeleteButtonModule.BLOCK_DELETE_WARNING;
                return false;
            }
        });

        return {
            errorMessage: errorMessage,
            warningMessage: warningMessage
        };
    }

    function f_getUserMessages() {
        let errorMessage;
        $.each(Configuration.getSelected(), function(index, currentConfiguration) {
            if (QuestionContainerType.TABLE.isTableCell(currentConfiguration)) {
                errorMessage = DeleteButtonModule.CANNOT_DELETE_TABLE_CELL_MESSAGE;
                return false;
            }
        });

        return {errorMessage: errorMessage};
    }

})(pa.ns('DeleteButtonModule'), pa.ns('Configuration'), pa.ns('Form'),
    pa.ns('QuestionContainerType'), pa.ns('AlertPopup'), pa.ns('RightPanel'), jQuery);