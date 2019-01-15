(function(Option) {

    let _nextId = -1;

    Option.getNextId = function() {
        return _nextId--;
    };

    Option.create = function(text) {
        return {
            id: Option.getNextId(),
            text: text ? text : undefined
        };
    };

})(pa.ns('Option'));