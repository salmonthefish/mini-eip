(function(CopyButtonModule, Configuration, Form, Layout, $) {

    let _offsetTop = 10;
    let _offsetLeft = 10;

    CopyButtonModule.create = function() {
        let module = $('<div>').attr('id', 'copyButton').addClass('button rightPanelButton').text('COPY FIELD');
        module.on('click', onClick);
        return module;
    };

    function onClick() {
        let copiedConfigurations = [];

        Configuration.getSelected().forEach(function(selectedConfiguration) {
            copiedConfigurations.push(copyConfiguration(selectedConfiguration));
        });

        Configuration.select(copiedConfigurations);
    }

    function copyConfiguration(configurationToCopy) {
        return g_copyConfiguration(configurationToCopy);
    }

    function g_copyConfiguration(configurationToCopy) {
        let copiedConfiguration = Configuration.copy(configurationToCopy);
        let $configurationToCopy = Configuration.getDiv(configurationToCopy.id);

        if ($configurationToCopy.hasClass('table-cell') || $configurationToCopy.hasClass('block-child')) {
            let tableTop = parseInt($configurationToCopy.parent().attr('data-row'));
            let tableHeight = parseInt($configurationToCopy.parent().attr('data-sizey'));
            let tableLeft = parseInt($configurationToCopy.parent().attr('data-col'));
            let cellHeight = parseInt($configurationToCopy.attr('data-sizey'));
            let cellWidth = parseInt($configurationToCopy.attr('data-sizex'));
            let cellLeft = parseInt($configurationToCopy.attr('data-col'));
            copiedConfiguration.layout.top = tableTop + tableHeight;
            copiedConfiguration.layout.left = cellLeft + tableLeft - 1;
            copiedConfiguration.layout.width = cellWidth;
            copiedConfiguration.layout.height = cellHeight;
        }
        else {
            copiedConfiguration.layout.top = parseInt($configurationToCopy.attr('data-row')) + parseInt($configurationToCopy.attr('data-sizey'));
            copiedConfiguration.layout.left = parseInt($configurationToCopy.attr('data-col'));
            copiedConfiguration.layout.width = parseInt($configurationToCopy.attr('data-sizex'));
            copiedConfiguration.layout.height = parseInt($configurationToCopy.attr('data-sizey'));
        }

        Form.addConfigurationTo(copiedConfiguration, Form.getDiv());
        Configuration.validate(copiedConfiguration, true);

        return copiedConfiguration;
    }

})(pa.ns('CopyButtonModule'), pa.ns('Configuration'), pa.ns('Form'), pa.ns('Layout'), jQuery);