// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
    Object.keys = (function () {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function (obj) {
            if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());
}

// Source: https://github.com/Alhadis/Snippets/blob/master/js/polyfills/IE8-child-elements.js
if (!("firstElementChild" in document.documentElement)) {
    Object.defineProperty(Element.prototype, "firstElementChild", {
        get: function () {
            for (var nodes = this.children, n, i = 0, l = nodes.length; i < l; ++i)
                if (n = nodes[i], 1 === n.nodeType) return n;
            return null;
        }
    });
}

// Source: https://github.com/Alhadis/Snippets/blob/master/js/polyfills/IE8-child-elements.js
if (!("nextElementSibling" in document.documentElement)) {
    Object.defineProperty(Element.prototype, "nextElementSibling", {
        get: function () {
            var e = this.nextSibling;
            while (e && 1 !== e.nodeType)
                e = e.nextSibling;
            return e;
        }
    });
}

// https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#Polyfill
if (!Array.prototype.filter) {
    Array.prototype.filter = function (fun/*, thisArg*/) {
        'use strict';

        if (this === void 0 || this === null) {
            throw new TypeError();
        }

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function') {
            throw new TypeError();
        }

        var res = [];
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i];

                // ПРИМЕЧАНИЕ: Технически, здесь должен быть Object.defineProperty на
                //             следующий индекс, поскольку push может зависеть от
                //             свойств на Object.prototype и Array.prototype.
                //             Но этот метод новый и коллизии должны быть редкими,
                //             так что используем более совместимую альтернативу.
                if (fun.call(thisArg, val, i, t)) {
                    res.push(val);
                }
            }
        }

        return res;
    };
}


var LMI = LMI || {};
LMI.Organigram = LMI.Organigram || {};


(function ($, organigram) {
    function hasClass(el, className) {
        return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
    }

    function formatData(data)
    {
        var result = {},
            current = null;
        for (var i = 0; i < data.length; i++) {
            current = data[i];
            result[current.treePath] = current;
            current.children = $.map($.grep(data, function (d) { return d.parentId == current.treePath && d.level == current.level + 1; }), function (d) { return d.treePath; });
            current.haveData = current.level < 3;
            if (current.level == 1)
                current.breadcrumbs = 'Руководители';
            if (current.level == 2)
                current.breadcrumbs = 'Заместители';
            if (current.level == 3)
                current.breadcrumbs = 'Подразделения и регионы';
            if (current.level > 3)
                current.breadcrumbs = (current.breadcrumbs || '').split(' – ').pop();
            delete current.treePath;
        }
        return result;
    }

    function executeMethod(methodName, params) {
        var deferred = $.Deferred();
        $.post('/_vti_bin/Anonymous.svc/ExecuteMethod', JSON.stringify({ methodName: methodName, data: JSON.stringify(params || {}) })).
        done(function (response) {
            var responseObj = JSON.parse(response);
            if (responseObj && responseObj.error) {
                console.log(responseObj.error);
            }
            deferred.resolve(responseObj);
        });

        return deferred.then(formatData);
    };

    organigram.getRoot = function () {
        return executeMethod('GetTopLevelUnits', { organigramType: '01' });
    };

    organigram.getChilds = function (parentId, level) {
        return executeMethod('GetChildUnits', { parentPath: parentId, nextLevel: level });
    };

    $(function () {
        organigram.getRoot().done(function (orgData) {
            console.log(orgData);
        });
        organigram.getChilds('01001273001274u00023', 4).done(function (orgData) {
            console.log(orgData);
        });
    });

})(jQuery, LMI.Organigram)