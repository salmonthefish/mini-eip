(function(URLParametersUtil, undefined) {

    URLParametersUtil.getParameter = function(parameter) {
        let parameters = _parseParameters(window.location.search);
        return parameters[parameter];
    };

    URLParametersUtil.getQueryParamObject = function() {
        return _parseParameters(window.location.search);
    };

    URLParametersUtil.getParentWindowParameter = function(parameter) {
        let parameters = _parseParameters(window.top.location.search);
        return parameters[parameter];
    };

    URLParametersUtil.getParentWindowQueryParamObject = function() {
        return _parseParameters(window.top.location.search);
    };

    URLParametersUtil.generateQueryParamString = function(params) {
        let paramKey, queryParamString = '';

        if(Array.isArray(params) || (typeof params !== 'object')) {
            throw new Error('Unsupported data type!')
        }

        for(paramKey in params) {
            if(params.hasOwnProperty(paramKey)) {
                if(Array.isArray(params[paramKey])) {
                    params[paramKey].forEach(function(paramValue) {
                        queryParamString += '&' + paramKey + '=' + encodeURIComponent(paramValue);
                    });
                } else {
                    queryParamString += '&' + paramKey + '=' + encodeURIComponent(params[paramKey]);
                }
            }
        }

        return queryParamString.replace('&', '?');
    };

    function _parseParameters(queryString) {
        let match, key, value;

        let parameters = {};
        let regex = /[?&;](.+?)=([^&]*)/g;

        while(queryString && (match = regex.exec(queryString))) {
            key = match[1];
            value = decodeURIComponent(match[2]);

            if(parameters.hasOwnProperty(key)) {
                if(!Array.isArray(parameters[key])) {
                    parameters[key] = [parameters[key]];
                }
                parameters[key].push(value);
            } else {
                parameters[key] = value;
            }
        }

        return parameters;
    }

})(pa.ns('pa.util.URLParametersUtil'));
