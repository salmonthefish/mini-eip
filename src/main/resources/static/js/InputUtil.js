(function(InputUtil, $, undefined) {

    InputUtil.getNewValueFromKeypressEvent = function(event) {
        return InputUtil.getValueFromEvent(event, String.fromCharCode(event.which));
    };

    InputUtil.getNewValueFromPasteEvent = function(event) {
        var clipboardData = event.originalEvent.clipboardData || window.clipboardData;
        return InputUtil.getValueFromEvent(event, clipboardData.getData('text'));
    };

    InputUtil.getValueFromEvent = function(event, value) {
        var oldValue = event.target.value, range, rangeCopy;

        if(event.target.selectionStart === undefined) {
            range = document.selection.createRange();
            rangeCopy = range.duplicate();
            rangeCopy.expand('textedit');
            rangeCopy.setEndPoint('EndToEnd', range);
            event.target.selectionStart = rangeCopy.text.length - range.text.length;
            event.target.selectionEnd = event.target.selectionStart + range.text.length;
        }

        return oldValue.substring(0, event.target.selectionStart) + value + oldValue.substring(event.target.selectionEnd);
    };

    InputUtil.htmlEncode = function(value){
        return $('<div/>').text(value).html();
    };
    
})(pa.ns('pa.util.InputUtil'), jQuery);