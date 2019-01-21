(function(RightPanel, $) {

    let _accordionPanelMap = {};
    let _accordionPanelModuleMap = {};
    let _buttonMap = {};

    $(document).ready(function() {
        $('#rightPanelAccordion').accordion({
            heightStyle: 'fill',
            animate: false
        });
        $(window).on('resize', RightPanel.refreshAccordion);
    });

    RightPanel.addAccordionPanel = function(name) {
        let accordion = $('#rightPanelAccordion');
        $('<h1>').text(name).appendTo(accordion);
        _accordionPanelMap[name] = $('<div>').addClass('accordionPanel').appendTo(accordion);
        _accordionPanelModuleMap[name] = {};

        RightPanel.refreshAccordion();
    };

    RightPanel.removeAccordionPanel = function(name) {
        let accordion = $('#rightPanelAccordion');
        accordion.find('h1:contains("' + name + '")').remove();
        _accordionPanelMap[name].remove();

        RightPanel.refreshAccordion();
    };

    RightPanel.appendModuleToAccordionPanel = function(accordionPanelName, moduleName, module) {
        module.css('overflow', 'hidden');
        _accordionPanelMap[accordionPanelName].append(module);
        _accordionPanelModuleMap[accordionPanelName][moduleName] = module;
    };

    RightPanel.removeModuleFromAccordionPanel = function(accordionPanelName, moduleName) {
        let module = _accordionPanelModuleMap[accordionPanelName][moduleName];
        // remove once modules clean up after themselves in field deselect step
        module.find('input, textarea').trigger('blur');
        module.remove();
    };

    RightPanel.refreshAccordion = function() {
        let rightPanelButtonsParent = $('#rightPanelButtonsParent');
        $('#rightPanelAccordionParent').css({
            'bottom': (rightPanelButtonsParent.height() + 4) + 'px'
        });
        $('#rightPanelAccordion').accordion('refresh');
    };

    RightPanel.addButton = function(buttonName, button) {
        let rightPanelButtonsParent = $('#rightPanelButtonsParent');

        if (rightPanelButtonsParent.children().length === 0) {
            rightPanelButtonsParent.append($('<div>').addClass('horizontalLine'));
        }

        rightPanelButtonsParent.append(button);
        _buttonMap[buttonName] = button;
    };

    RightPanel.removeButton = function(buttonName) {
        if (_buttonMap[buttonName]) {
            _buttonMap[buttonName].remove();
        }
        let rightPanelButtonsParent = $('#rightPanelButtonsParent');
        if (rightPanelButtonsParent.children().length === 1) {
            rightPanelButtonsParent.find('.horizontalLine').remove();
        }
    };

})(pa.ns('RightPanel'), jQuery);