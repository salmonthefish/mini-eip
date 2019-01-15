(function(Form, Configuration, AlertPopup, LeftPanel, $) {

    let _productKey = URLParametersUtil.getParameter('productKey');
    let _copyId = URLParametersUtil.getParameter('copyId');
    let _id = URLParametersUtil.getParameter('id');
    let _scheduleId = URLParametersUtil.getParameter('scheduleId') || '';
    let _validity;

    $(document).ready(function() {
        $(document).tooltip();
        $(document).on('mouseup', removeQuestionInstructions);
        EventBusClient.sendEvent(GridEvents.IframeModalWindow.Maximize);

        if (_id) {
            fetchFormDataAndRender(_id, '#saveButton');
        } else if (_copyId) {
            fetchFormDataAndRender(_copyId, '#createButton');
        } else {
            Form.setMode(URLParametersUtil.getParentWindowParameter('freeFormMode') ? Form.FREEFORM : Form.GRIDFORM);
            Form.render();
            $('#createButton').show();
            LeftPanel.initialize();
        }
        $('#form').focus();
    });

    window.create = function() {
        callIfValid(function() {
            showMask('Saving...');
            $.ajax({
                type: 'POST',
                url: '/' + Products.URLPrefixes[_productKey] + '/commonModule/forms',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(Form.get()),
                dataType: 'json',
                success: onSuccess
            });
        });
    };

    window.save = function() {
        callIfValid(function() {
            showMask('Saving...');
            $.ajax({
                type: 'PUT',
                url: '/' + Products.URLPrefixes[_productKey] + '/commonModule/forms/' + _id + '?scheduleId=' + _scheduleId,
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(Form.get()),
                dataType: 'json',
                success: onSuccess
            });
        });
    };

    window.cancel = function() {
        EventBusClient.sendEvent(GridEvents.IframeModalWindow.Close);
    };

    function fetchFormDataAndRender(id, buttonSelector) {
        showMask('Loading...');
        $.get('/' + Products.URLPrefixes[_productKey] + '/commonModule/forms/' + id, function(data) {
            Form.setMode(data.formMode);
            Form.render(data);

            if(Form.getMode() === Form.FREEFORM) {
                ConvertToGridFormModule.init();
            }

            $(buttonSelector).show();
            $(document.body).unmask();
            LeftPanel.initialize();
        });
    }

    function removeQuestionInstructions(event) {
        let formDiv = $('#form');
        let formPos = formDiv.position();
        let centerDivPos = $('#centerDiv').position();
        let leftBoundary = formPos.left + centerDivPos.left;
        let rightBoundary = formPos.left + centerDivPos.left + formDiv.width();
        let topBoundary = formPos.top;
        let bottomBoundary = formPos.top + formDiv.height();

        let isClickWithinForm = event.pageX > leftBoundary && event.pageX < rightBoundary && event.pageY > topBoundary && event.pageY < bottomBoundary;

        if (isClickWithinForm) {
            $('#addQuestionInstruction').fadeOut(300, function() {
                $('#addQuestionInstruction').remove();
            });
            $(document).off('mouseup', removeQuestionInstructions);
        }
    }

    function callIfValid(func) {
        if (_validity !== 'validating') {
            showMask('Validating...');
            Configuration.select([]);
        }

        _validity = Form.validate(Form.get());
        if (_validity === 'invalid') {
            $(document.body).unmask();
            AlertPopup.open({
                top: 'calc(50% - 60px)',
                left: 'calc(50% - 275px)',
                height: '120px',
                width: '650px',
                title: 'Invalid Fields',
                content: 'One or more of the fields are invalid. Please fix them before saving the form.'
            });
        } else if (_validity === 'validating') {
            setTimeout(function() {
                callIfValid(func);
            }, 250);
        } else if (_validity === 'valid') {
            $(document.body).unmask();
            func();
        }
    }

    function onSuccess(data) {
        EventBusClient.sendEventToParent(FormEvents.Form.Save, data);
        EventBusClient.sendEvent(GridEvents.IframeModalWindow.Close);
    }

    function showMask(message) {
        $(document.body).mask(message, {'font-size': '15pt', 'font-weight': 'bold'}, null, true);
    }

})(pa.ns('Form'), pa.ns('Configuration'), pa.ns('pa.util.URLParametersUtil'),
    pa.ns('AlertPopup'), pa.ns('LeftPanel'), jQuery);