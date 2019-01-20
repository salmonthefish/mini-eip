(function(undefined) {

    var SortedList = pa.define('pa.object.SortedList', function(sort) {
        var me = this;

        me._list = [];
        me._sort = sort;
    });

    SortedList.prototype._list;
    SortedList.prototype._sort;

    SortedList.prototype.add = function(obj) {
        var index, me = this;

        for(index = 0; index <= me._list.length; index++) {
            if(index == me._list.length || me._sort(obj, me._list[index]) <= 0) {
                me._list.splice(index, 0, obj);
                break;
            }
        }
    };

    SortedList.prototype.clear = function() {
        var me = this;

        me._list = [];
    };

    SortedList.prototype.contains = function(obj) {
        var me = this;

        return me._list.indexOf(obj) > -1;
    };

    SortedList.prototype.forEach = function(fn, scope) {
        var index, me = this;

        for(index = 0; index < me._list.length; index++) {
            fn.call(scope, me._list[index], index, me);
        }
    };

    SortedList.prototype.get = function(index) {
        var me = this;

        return me._list[index];
    };

    SortedList.prototype.indexOf = function(obj) {
        var me = this;

        return me._list.indexOf(obj);
    };

    SortedList.prototype.isEmpty = function() {
        var me = this;

        return me._list.length === 0;
    };

    SortedList.prototype.remove = function(index) {
        var me = this;

        return me._list.splice(index, 1)[0];
    };

    SortedList.prototype.size = function() {
        var me = this;

        return me._list.length;
    };

})();