(function(FormEventHandlerManager, Form, Configuration, QuestionType, Format, QuestionTemplate, Layout, AlertPopup, $) {

    let _prevConfigurationDiv = $('#form'), _prevCellDiv;
    let _prevInputElement = null;

    let dragStartInitialScrollTop;
    let dragStartInitialScrollLeft;

    let uiPositionVerticalOffset = 53;
    let uiPositionHorizontalOffset = 158;

    FormEventHandlerManager.addEventHandlers = function(div) {
        $('#formName').on('blur', FormEventHandlerManager.updateFormName);

        let $droppableDiv = $('#droppableDiv');

        $droppableDiv.droppable({
            tolerance: 'pointer'
        });

        $droppableDiv.on('drop', FormEventHandlerManager.handleDroppableDrop);

        div.selectable({
            filter: '.configuration:not(.not-selectee)',
            tolerance: 'fit'
        });
        div.on('selectablestart', handleSelectableStart);
        div.on('selectablestop', handleSelectableStop);

        addModeSpecificHandler(div);
    };

    FormEventHandlerManager.getContextMenu = function() {
        return {
            delegate: '#form',
            menu: [
                {title: 'Delete empty row', cmd: 'delete-row'}
            ],
            select: function(event, ui) {
                if (ui.cmd === 'delete-row') {
                    FormEventHandlerManager.deleteEmptyRow();
                }
            }
        };
    };

    FormEventHandlerManager.deleteEmptyRow = function() {
        Configuration.select([]);
        let contextMenu = $('.ui-contextmenu');
        let topOfContextMenu = parseInt(contextMenu.css('top'));
        let row = Math.ceil((topOfContextMenu - uiPositionVerticalOffset + $('#form').scrollTop()) / Form.getGridCellHeight());

        if (Form.getGridster().is_row_empty(row)) {
            Form.getGridster().move_all_widgets_up(row, 1);
            Form.getGridster().set_dom_grid_height();
        } else {
            let width = '600px';
            AlertPopup.open({
                top: 'calc(50% - 100px)',
                left: 'calc(50% - ' + parseInt(width)/2 +  'px)',
                height: '200px',
                width: width,
                color: '#7D93A8',
                title: 'Error',
                content: 'Cannot delete this row. Row is not empty.'
            });
        }
    };

    FormEventHandlerManager.updateFormName = function(event, ui) {
        Form.get().name = $('#formName').val();
    };

    FormEventHandlerManager.handleDroppableDrop = function(event, ui) {
         if(!event.originalEvent.cancelled) {
            event.originalEvent.cancelled = true;
            g_handleDroppableDrop(ui);
         }
    };

    FormEventHandlerManager.handleClick = function(event) {
        $('#formName').trigger('blur');

        let clickedDiv = $(event.currentTarget);
        let clickedConfiguration = Configuration.getFromDiv(clickedDiv);
        let currentInputElement = $(event.target);

        if (_prevInputElement && _prevInputElement.attr('id') !== currentInputElement.attr('id')) {
            _prevInputElement.trigger('hidedatepicker');
        }

        if (!currentInputElement.is('input,textarea,select')) {
           $(document.activeElement).blur();
        }

        if (event.ctrlKey && FormEventHandlerManager.multiSelectAllowable(clickedConfiguration)) {
            let copyOfSelectedConfs = Configuration.getSelected().slice(0);
            let clickedConfigurationAlreadySelected = copyOfSelectedConfs.indexOf(clickedConfiguration) >= 0;
            if(clickedConfigurationAlreadySelected) {
                copyOfSelectedConfs.splice(copyOfSelectedConfs.indexOf(clickedConfiguration), 1);
            } else {
                copyOfSelectedConfs.push(clickedConfiguration);
            }
            Configuration.select(copyOfSelectedConfs);
            event.stopPropagation();
        } else {
            Configuration.select([clickedConfiguration]);
            event.stopPropagation();
        }

        _prevConfigurationDiv = clickedDiv;
        _prevInputElement = currentInputElement;
    };

    FormEventHandlerManager.multiSelectAllowable = function(clickedConfiguration) {
        if (clickedConfiguration.questionContainer) {
            return false;
        } else if(clickedConfiguration.question) {
            let selected = Configuration.getSelected();
            for(n = 0; n < selected.length; n++) {
                if(selected[n].questionContainer) {
                    return false
                }
            }
        }

        return true;
    };

    FormEventHandlerManager.onDragStart = function(event, ui) {
        let $form = $('#form');
        dragStartInitialScrollTop = $form.scrollTop();
        dragStartInitialScrollLeft = $form.scrollLeft();
    };

    FormEventHandlerManager.fixScrollPosition = function(event, ui) {
        let $form = $('#form');
        let scrollTop = $form.scrollTop();
        let scrollLeft = $form.scrollLeft();

        let difference;
        if (dragStartInitialScrollTop !== scrollTop) {
            difference = scrollTop - dragStartInitialScrollTop;
            ui.position.top += difference;
        }

        if (dragStartInitialScrollLeft !== scrollLeft) {
            difference = scrollLeft - dragStartInitialScrollLeft;
            ui.position.left += difference;
        }
    };

    FormEventHandlerManager.dragAndScroll = function(dragPosition) {
        let $form = $('#form');
        let $gridsterContainer = $('#gridsterContainer');
        let scrollIncrement = 10;

        let translatedTopPosition = dragPosition.top - uiPositionVerticalOffset;
        let translatedLeftPosition = dragPosition.left - uiPositionHorizontalOffset;
        let verticalScrollArea = 60;
        let horizontalScrollArea = Form.getGridCellWidth() * 2;

        let bottomScrollBoundary = $form.height() - verticalScrollArea;
        let rightScrollBoundary = $form.width() - horizontalScrollArea;
        let leftScrollBoundary = 0;
        let topScrollBoundary = verticalScrollArea;

        if (translatedLeftPosition > rightScrollBoundary) {
            let currentWidth = $gridsterContainer.width();
            let newWidth = currentWidth + Form.getGridCellWidth();
            let maxScrollLeft = $form.width() >= $gridsterContainer.width() ? 0 : $gridsterContainer.width() - $form.width();

            if ($form.scrollLeft() >= maxScrollLeft) {
                let newCols = Math.ceil(newWidth / Form.getGridCellWidth());
                Form.getGridster().add_faux_cols(2);
                Form.getGridster().set_dom_grid_width(newCols);
            }

            $form.scrollLeft($form.scrollLeft() + scrollIncrement);
        }

        if (translatedLeftPosition  < leftScrollBoundary) {
            $form.scrollLeft($form.scrollLeft() - scrollIncrement);
        }

        if(translatedTopPosition > bottomScrollBoundary) {
            let currentHeight = $form.height() >= $gridsterContainer.height() ? $form.height() : $gridsterContainer.height();
            let newHeight = currentHeight + Form.getGridCellHeight();
            let maxScrollTop = $form.height() >= $gridsterContainer.height() ? 0 : $gridsterContainer.height() - $form.height();

            if ($form.scrollTop() >= maxScrollTop) {
                Form.getGridster().set_dom_grid_height(newHeight);
            }
            $form.scrollTop($form.scrollTop() + scrollIncrement);
        }

        if (translatedTopPosition < topScrollBoundary) {
            $form.scrollTop($form.scrollTop() - scrollIncrement);
        }
    };

    function addModeSpecificHandler(div) {
        g_addModeSpecificHandler(div);
    }

    function g_addModeSpecificHandler(div){
        $('#centerDiv').contextmenu(FormEventHandlerManager.getContextMenu());
        div.on('click', 'div.configuration:not(.table-cell[data-row="1"][data-col="1"])', FormEventHandlerManager.handleClick);

        $(window).on('keyup', keyupHandler);
        //add listener to top window, so that even if focus is in the base page, keyup always can be triggered
        $(window.top).on('keyup', function(event) {
            // prevent listener trigger when the popup window is closed
            if (window !== window.top){
                keyupHandler(event);
            }
        });

        div.on('mouseover', 'div.configuration.table-cell', g_handleMouseOver);
        div.on('mouseover', 'div.configuration.table-cell .ui-resizable-handle', function(event) {
            event.stopPropagation();
            Form.getGridster().disable();
        });

        div.on('mouseout', 'div.configuration.table-cell .ui-resizable-handle', function() {
            Form.getGridster().enable();
        });
    }

    function keyupHandler(event) {
        // tab key
        if (event.keyCode === 9) {
            Configuration.selectNextConfiguration();
        }
    }

    function g_handleMouseOver(event) {
        if (!event.buttons) {
            let currentCellDiv = $(event.currentTarget);
            if (_prevCellDiv) {
                Table.removeEventHandlersFromTableCell(_prevCellDiv);
            }
            Table.addEventHandlersToTableCell(currentCellDiv);
            _prevCellDiv = currentCellDiv;
        }
    }

    function g_handleDroppableDrop(ui) {
        let div = Form.getDiv(), configuration;
        if (ui.draggable.is('.questionContainerType') || ui.draggable.is('.questionType')) {
            let divId = ui.draggable.attr('id');
            let questionTemplate = ui.draggable.attr('questionTemplate');
            let type = divId ? divId : QuestionTemplate[questionTemplate].questionType;

            let isQuestionContainer = ui.draggable.is('.questionContainerType');
            let isQuestion = ui.draggable.is('.questionType');
            configuration = Configuration.create(isQuestionContainer, isQuestion, type);

            if (questionTemplate) {
                QuestionTemplate[questionTemplate].appendTemplate(configuration);
            }

            let coords = translateToFormCoordinates(ui.position.top, ui.position.left);
            let gridCoords = translateToGridCoordinates(coords.top, coords.left);

            configuration.layout.top = gridCoords.top;
            configuration.layout.left = gridCoords.left;

            Form.addConfigurationTo(configuration, div);
            Configuration.select([configuration]);
        }

    }

    function handleSelectableStart(event, ui) {
        $('#formName').trigger('blur');
    }

    function handleSelectableStop(event, ui) {                    
        let selectedConfs = [];

        let selectedDivs = $('.configuration.ui-selected');
        let multiSelected = selectedDivs.length > 1;

        selectedDivs.each(function(index, element) {
            let div = $(element);
            let conf = Configuration.getFromDiv(div);

            if (multiSelected && conf.questionContainer) {
                div.removeClass('ui-selected');
            } else {
                selectedConfs.push(conf);
            }
        });

        Configuration.select(selectedConfs);
    }

    function getDivToAddEventHandlersTo(div) {
        if (!div.hasClass('form') && !div.hasClass('configuration')) {
            return getDivToAddEventHandlersTo(div.parent());
        } else {
            return div;
        }
    }

    function removeEventHandlersFromConfigurationDiv(configurationDiv) {
        let configuration = Configuration.getFromDiv(configurationDiv);
        if (configuration) {
            if (configuration.questionContainer) {
                QuestionContainerType[configuration.questionContainer.formType].removeEventHandlers(configurationDiv);
            } else if (configuration.question) {
                if (Table.isTableCell(Configuration.getFromDiv(configurationDiv))) {
                    Table.removeEventHandlers(configurationDiv.parent());
                    Table.removeEventHandlersFromTableCell(configurationDiv);
                } else {
                    QuestionType[Format[configuration.question.format].questionType].removeEventHandlers(configurationDiv);
                }
            }
        }
    }

    function addEventHandlersToConfigurationDiv(configurationDiv) {
        let configuration = Configuration.getFromDiv(configurationDiv);
        if (configuration) {
            if (configuration.questionContainer) {
                QuestionContainerType[configuration.questionContainer.formType].addEventHandlers(configurationDiv);
            } else if (configuration.question) {
                if (Table.isTableCell(Configuration.getFromDiv(configurationDiv))) {
                    Table.addEventHandlers(configurationDiv.parent());
                    Table.addEventHandlersToTableCell(configurationDiv);
                } else {
                    QuestionType[Format[configuration.question.format].questionType].addEventHandlers(configurationDiv);
                }
            }
        }
    }

    function translateToFormCoordinates(top, left) {
        let div = Form.getDiv();
        top -= uiPositionVerticalOffset - div.scrollTop();
        left -= uiPositionHorizontalOffset - div.scrollLeft();
        return {
            top: top < 0 ? 0 : top,
            left: left < 0 ? 0 : left
        };
    }

    function translateToGridCoordinates(top, left) {
        return {
            top: Math.floor(top / Form.getGridCellHeight()) + 1,
            left: Math.floor(left / Form.getGridCellWidth()) + 1
        };
    }

})(pa.ns('FormEventHandlerManager'), pa.ns('Form'), pa.ns('Configuration'), pa.ns('QuestionType'),
    pa.ns('Format'), pa.ns('QuestionTemplate'), pa.ns('Layout'), pa.ns('AlertPopup'), jQuery);
