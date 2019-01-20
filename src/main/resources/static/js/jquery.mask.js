(function($) {

    var _textStyle = "position:absolute;top:50%;width:100%;text-align:center;";
    var _maskStyle = "position:absolute;top:0px;left 0px;height:100%;width:100%;background-color:#000000;color:#ffffff;opacity:0.25;-moz-opacity:0.25;filter:alpha(opacity=25);z-index:9999;";
    var _spinnerHtml = [
            '<div class="sk-fading-circle">',
            '   <div class="sk-circle1 sk-circle"></div>',
            '   <div class="sk-circle2 sk-circle"></div>',
            '   <div class="sk-circle3 sk-circle"></div>',
            '   <div class="sk-circle4 sk-circle"></div>',
            '   <div class="sk-circle5 sk-circle"></div>',
            '   <div class="sk-circle6 sk-circle"></div>',
            '   <div class="sk-circle7 sk-circle"></div>',
            '   <div class="sk-circle8 sk-circle"></div>',
            '   <div class="sk-circle9 sk-circle"></div>',
            '   <div class="sk-circle10 sk-circle"></div>',
            '   <div class="sk-circle11 sk-circle"></div>',
            '   <div class="sk-circle12 sk-circle"></div>',
            '</div>'
            ].join('\n');

    $.fn.mask = function(message, textCss, maskCss, animation) {
        var me = this;

        var textDiv = $('<div>').attr('style', _textStyle).text(message);
        if(textCss) {
            textDiv.css(textCss);
        }

        var maskDiv = $('<div class="-mask">').attr('style', _maskStyle).append(textDiv);
        if(maskCss) {
            maskDiv.css(maskCss);
        }

        // IE 11 freeze the animation when executing long javascript, only allow animation in chrome for now
        if(animation && (navigator.userAgent.indexOf("Chrome") !== -1)) {
            $(_spinnerHtml).appendTo(maskDiv);
        }

        return me.append(maskDiv);
    };

    $.fn.unmask = function() {
        var me = this;
        me.find('.-mask').remove();
        return me;
    };

    $.fn.toggleMask = function(message) {
        var me = this;

        if(me.isMasked()) {
            me.unmask();
        } else {
            me.mask(message);
        }

        return me;
    };

    $.fn.isMasked = function() {
        var me = this;
        return me.find('.-mask').length > 0;
    };

})(jQuery);
