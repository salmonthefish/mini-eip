// This is a fix for the following bugs:
//  - jquery selectable plugin interferes with scrolling of the selectable component
//  - jquery draggable plugin makes selectable plugin's click event not fire
//      - Only selectablestart and selectablestop events are fired.
//      - Does not fire selectableselecting, selectableunselecting, selectableselected, and selectableunselected events. Please add them if needed.

(function($, undefined) {

    var _selectableWidget = $.fn.selectable;
    var _selectable = null;
    var _selectee = null;

    $.fn.selectable = function() {
        var me = this;

        if(!me.hasClass('ui-selectable')) {
            me.on('mousedown', onMousedown);
            me.on('mousemove', onMousemove);
        }

        var result = _selectableWidget.apply(me, arguments);

        if(arguments[0] == 'destroy') {
            me.off('mousedown', onMousedown);
            me.off('mousemove', onMousemove);
        }

        return result;
    };

    function onMousedown(event) {
        var me = $(event.target);
        var parent = $(event.currentTarget);

        var meDraggableOrParentDraggable = me.is('.ui-selectee.ui-draggable') || me.parents('.ui-selectee.ui-draggable').first().length == 1;
        var selectableEnabled = !parent.selectable('option', 'disabled');

        if(meDraggableOrParentDraggable && selectableEnabled) {
            _selectable = parent.data('ui-selectable');
            _selectee = me.is('.ui-selectee') ? me : me.parents('.ui-selectee').first();

            if(!event.ctrlKey) {
                parent.find('.ui-selected').removeClass('ui-selected');
            }

            _selectable._trigger('start', event);
            $(document).on('mouseup', onMouseup);
        }
    }

    function onMousemove(event) {
        var me = $(this);

        var overVerticalScrollBar = event.pageX > me[0].clientWidth + me.offset().left;
        var overHorizontalScrollBar = event.pageY > me[0].clientHeight + me.offset().top;
        var disabled = me.selectable('option', 'disabled');
        var mouseButtonNotHeld = event.buttons == 0;

        if(!disabled && mouseButtonNotHeld && (overVerticalScrollBar || overHorizontalScrollBar)) {
            me.selectable('disable');
        } else if(disabled && mouseButtonNotHeld && !overVerticalScrollBar && !overHorizontalScrollBar) {
            me.selectable('enable');
            $(document).trigger('mouseup', event); // Prevents bug in IE11
        }
    }

    function onMouseup(event) {
        $(document).off('mouseup', onMouseup);

        if(event.ctrlKey) {
            _selectee.toggleClass('ui-selected');
        } else {
            _selectee.addClass('ui-selected');
        }

        _selectable._trigger('stop', event);
        _selectable = null;
        _selectee = null;
    }

})(jQuery);