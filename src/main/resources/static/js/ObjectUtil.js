(function() {
    objectUtil = window.objectUtil || {};

    objectUtil.extend = function(object, superObject) {
        for(let attribute in superObject) {
            let value = superObject[attribute];
            if(value !== null && value instanceof Function) {
                object[attribute] = objectUtil.extend(value.bind(object), value);
            } else if(value !== null && value instanceof Array) {
                object[attribute] = [];
                value.forEach(function(element) {
                    object[attribute].push(objectUtil.copy(element));
                });
            } else if(value !== null && value instanceof Object) {
                object[attribute] = objectUtil.copy(value);
            } else {
                object[attribute] = value;
            }
        }
        return object;
    };

    objectUtil.copy = function(object) {
        if (object instanceof Array) {
            return objectUtil.extend([], object);
        } else {
            return objectUtil.extend({}, object);
        }
    };

})();