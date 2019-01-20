(function() {

    /**
     * Array shims
     */

    if(!Array.prototype.find) {
        if(window.self === window.top) {
            Array.prototype.find = function(fn, scope, start, end) {
                var i, me;

                me = this;
                start = start || 0;
                end = end || me.length;

                for(i = start || 0; i < end && i < me.length; i++) {
                    if(fn.call(scope, me[i], i, me)) {
                        return me[i];
                    }
                }

                return null;
            }
        } else if(window.top.Array.prototype.find) {
            Array.prototype.find = window.top.Array.prototype.find;
        } else {
            throw Error('You must include shim.js in window.top as well as your widget');
        }
    }

    if(!Array.prototype.findAll) {
        if(window.self === window.top) {
            Array.prototype.findAll = function(fn, scope, start, end) {
                console.log('Please consider using Array.prototype.filter');

                var i, matches, me;

                me = this;
                matches = [];
                start = start || 0;
                end = end || me.length;

                for(i = start || 0; i < end && i < me.length; i++) {
                    if(fn.call(scope, me[i], i, me)) {
                        matches.push(me[i]);
                    }
                }

                return matches;
            }
        } else if(window.top.Array.prototype.findAll) {
            Array.prototype.findAll = window.top.Array.prototype.findAll;
        }
    }

    if(!Array.prototype.forEach) {
        if(window.self === window.top) {
            Array.prototype.forEach = function(fn, scope) {
                var i, me;
                me = this;

                for(i = 0; i < me.length; i++) {
                    fn.call(scope, me[i], i, me);
                }
            };
        } else if(window.top.Array.prototype.forEach) {
            Array.prototype.forEach = window.top.Array.prototype.forEach;
        } else {
            throw Error('You must include shim.js in window.top as well as your widget');
        }
    }

    // Make indexOf work in IEs
    if(!Array.prototype.indexOf) {
        if(window.self === window.top) {
            Array.prototype.indexOf = function(searchElement, fromIndex) {
                var i, me, pivot;

                me = this;
                pivot = fromIndex || 0;

                if(!me) {
                    throw new TypeError();
                }

                if(me.length === 0 || pivot >= me.length) {
                    return -1;
                }

                if(pivot < 0) {
                    pivot = me.length - Math.abs(pivot);
                }

                for(i = pivot; i < me.length; i++) {
                    if(me[i] === searchElement) {
                        return i;
                    }
                }

                return -1;
            };
        } else if(window.top.Array.prototype.indexOf) {
            Array.prototype.indexOf = window.top.Array.prototype.indexOf;
        } else {
            throw Error('You must include shim.js in window.top as well as your widget');
        }
    }

    if(!Array.prototype.reduce) {
        if(window.self === window.top) {
            // Production steps of ECMA-262, Edition 5, 15.4.4.21
            // Reference: http://es5.github.io/#x15.4.4.21
            Array.prototype.reduce = function(callback /* , initialValue */) {
                'use strict';
                if(this === null) {
                    throw new TypeError('Array.prototype.reduce called on null or undefined');
                }
                if(typeof callback !== 'function') {
                    throw new TypeError(callback + ' is not a function');
                }
                var t = Object(this), len = t.length >>> 0, k = 0, value;
                if(arguments.length == 2) {
                    value = arguments[1];
                } else {
                    while(k < len && !(k in t)) {
                        k++;
                    }
                    if(k >= len) {
                        throw new TypeError('Reduce of empty array with no initial value');
                    }
                    value = t[k++];
                }
                for(; k < len; k++) {
                    if(k in t) {
                        value = callback(value, t[k], k, t);
                    }
                }
                return value;
            };
        } else if(window.top.Array.prototype.reduce) {
            Array.prototype.reduce = window.top.Array.prototype.reduce;
        } else {
            throw Error('You must include shim.js in window.top as well as your widget');
        }
    }

    if (!Array.prototype.findIndex) {

        if(window.self === window.top) {
            Object.defineProperty(Array.prototype, 'findIndex', {
                value: function(predicate) {
                  'use strict';
                  if (this == null) {
                      throw new TypeError('Array.prototype.findIndex called on null or undefined');
                  }
                  if (typeof predicate !== 'function') {
                      throw new TypeError('predicate must be a function');
                  }
                  var list = Object(this);
                  var length = list.length >>> 0;
                  var thisArg = arguments[1];
                  var value;

                  for (var i = 0; i < length; i++) {
                      value = list[i];
                      if (predicate.call(thisArg, value, i, list)) {
                          return i;
                      }
                  }
                  return -1;
                },
            enumerable: false,
            configurable: false,
            writable: false
            });
        }else if(window.top.Array.prototype.findIndex) {
            Array.prototype.findIndex = window.top.Array.prototype.findIndex;
        } else {
            throw Error('You must include shim.js in window.top as well as your widget');
        }
    }

    /**
     * Object shims
     */

    // Polyshims for IE < 9 compatibility
    if(!Object.create) {
        if(window.self === window.top) {
            Object.create = (function() {
                function F() {
                }
                return function(o) {
                    if(arguments.length != 1) {
                        throw new Error('Object.create implementation only accepts one parameter.');
                    }
                    F.prototype = o;
                    return new F();
                };
            })();
        } else if(window.top.Object.create) {
            Object.create = window.top.Object.create;
        } else {
            throw Error('You must include shim.js in window.top as well as your widget');
        }
    }

    if(!Object.freeze) {
        // Can't polyshim. Object.preventExtension would be needed and is not
        // available in browsers that don't support freeze.
        if(window.self === window.top) {
            Object.freeze = function(obj) {
                function F() {
                }
                return obj;
            };
        } else if(window.top.Object.freeze) {
            Object.freeze = window.top.Object.freeze;
        } else {
            throw Error('You must include shim.js in window.top as well as your widget');
        }
    }

    if(!Object.getOwnPropertyNames) {
        if(window.self === window.top) {
            Object.getOwnPropertyNames = function(obj) {
                var keys, x;

                keys = [];

                if(typeof obj === 'object' && obj !== null) {
                    for(x in obj) {
                        if(obj.hasOwnProperty(x)) {
                            keys.push(x);
                        }
                    }
                }

                return keys;
            };
        } else if(window.top.Object.getOwnPropertyNames) {
            Object.getOwnPropertyNames = window.top.Object.getOwnPropertyNames;
        } else {
            throw Error('You must include shim.js in window.top as well as your widget');
        }
    }

    /**
     * String shims
     */

    if(!String.prototype.replaceAll) {
        if(window.self === window.top) {
            String.prototype.replaceAll = function replaceAll(find, replace) {
                console.log('Please consider using String.prototype.replace(/find/g, replace)');

                var me = this;
                if(find != null) {
                    return me.replace(new RegExp(find, 'g'), replace);
                } else {
                    return find;
                }
            };
        } else if(window.top.String.prototype.replaceAll) {
            String.prototype.replaceAll = window.top.String.prototype.replaceAll;
        }
    }

    if (!String.prototype.trim) {
        if(window.self === window.top) {
            String.prototype.trim = function () {
                return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
            };
        } else if(window.top.String.prototype.trim) {
            String.prototype.trim = window.top.String.prototype.trim;
        } else {
            throw Error('You must include shim.js in window.top as well as your widget');
        }
    }

    /**
     * Function shims
     */

    if (!Function.prototype.bind) {
    	  Function.prototype.bind = function(oThis) {
    	    if (typeof this !== 'function') {
    	      // closest thing possible to the ECMAScript 5
    	      // internal IsCallable function
    	      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    	    }

    	    var aArgs   = Array.prototype.slice.call(arguments, 1),
    	        fToBind = this,
    	        fNOP    = function() {},
    	        fBound  = function() {
    	          return fToBind.apply(this instanceof fNOP
    	                 ? this
    	                 : oThis,
    	                 aArgs.concat(Array.prototype.slice.call(arguments)));
    	        };

    	    if (this.prototype) {
    	      // native functions don't have a prototype
    	      fNOP.prototype = this.prototype;
    	    }
    	    fBound.prototype = new fNOP();

    	    return fBound;
    	  };
    	}

    /**
     * Misc. shims
     */

    // Make console not blow up in IEs
    window.console = window.console || {
        log: function() {},
        warn: function() {},
        error: function() {}
    };

})();