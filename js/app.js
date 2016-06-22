// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
    Object.keys = (function() {
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

        return function(obj) {
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
if(!("firstElementChild" in document.documentElement)){
    Object.defineProperty(Element.prototype, "firstElementChild", {
        get: function(){
            for(var nodes = this.children, n, i = 0, l = nodes.length; i < l; ++i)
                if(n = nodes[i], 1 === n.nodeType) return n;
            return null;
        }
    });
}

// Source: https://github.com/Alhadis/Snippets/blob/master/js/polyfills/IE8-child-elements.js
if(!("nextElementSibling" in document.documentElement)){
    Object.defineProperty(Element.prototype, "nextElementSibling", {
        get: function(){
            var e = this.nextSibling;
            while(e && 1 !== e.nodeType)
                e = e.nextSibling;
            return e;
        }
    });
}

// https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#Polyfill
if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun/*, thisArg*/) {
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

$(document).ready(function(){
    "use strict";

    function hasClass(el, className) {
        return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
    }

    function removeClass(block, rClassName) {
        if (block.classList)
            block.classList.remove(rClassName);
        else
            block.className = block.className.replace(new RegExp('(^|\\b)' + rClassName.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }

    var lmiOrganigramm = new Organigramm || {};

    function Organigramm () {
        var COLS_COUNT = 3;

        var self = this,
            workspace = document.getElementById('organigram'),
            canvas = workspace.querySelector('.organigram__canvas'),
            breadcrumbsNode = workspace.querySelector('.organigram-breacrumbs'),
            backBtn = workspace.querySelector('.organigram__back_mode_back');

        this.config = {
            thatEl: '',
            cache: {},
            cardBox: '',
            lastId: '',
            backLevel: '',
            breadcrumbs: {}
        };

        this.initEvents = function () {
            $(canvas).on('click', '.organigram-depart__title', self.handleGrowTree);
            $(workspace).on('click', '.organigram__back_mode_back', self.backSteper);
            $(breadcrumbsNode).on('click', '.organigram-breacrumbs__item', self.breadcrumbsSteper);
        };

        this.handleGrowTree = function (event) { // transform pos columns
            var target = event.currentTarget,
                thatId = target.parentNode.id,
                thatLevel = target.parentNode.getAttribute('data-that-level');

            //cahce currentBox and currentLevel
            self.config.cardBox = target.parentNode;
            self.config.lastId = self.config.cardBox.id;

            self.showChildren();

            // set level on backBtn
            backBtn.setAttribute('data-that-level', +thatLevel + 1);
            backBtn.style.display = 'block';

            self.buildBreadcrumbs(thatLevel, thatId);

            return false; // stop-prevent
        };

        this.buildBreadcrumbs = function(thatLevel, thatId) {
            var li = document.createElement('li'),
                title = document.createElement('div'),
                subTitle = document.createElement('div'),
                breadcrumbs = self.config.breadcrumbs,
                parentBread1 = breadcrumbs[thatId].parentId,
                parentBread2 = breadcrumbs[parentBread1].parentId, // stand up on two level top
                breadLevel,
                i, size;

            li.className = 'organigram-breacrumbs__item';
            li.setAttribute('data-that-level',  breadcrumbs[parentBread2].level.toString());
            li.setAttribute('data-that-id', parentBread2);
            li.innerText = '';
            title.className = 'organigram-breacrumbs__title';
            subTitle.className = 'organigram-breacrumbs__sub-title';

            var breadcrumbsAllLi = breadcrumbsNode.getElementsByTagName('li');

            // add no more one item
            if (breadcrumbsAllLi.length == 0) {
                setBreadcrumsTitles();
            } else {
                for(i = 0, size = breadcrumbsAllLi.length; i < size; i++) {
                    breadLevel = breadcrumbsAllLi[i].getAttribute('data-that-level');

                    if(breadLevel != breadcrumbs[parentBread2].level) {
                        setBreadcrumsTitles();
                    }
                }
            }

            function setBreadcrumsTitles() {
                title.innerText = breadcrumbs[parentBread2].breadcrumb;
                subTitle.innerText = breadcrumbs[parentBread2].userName;

                li.appendChild(title);
                li.appendChild(subTitle);
                breadcrumbsNode.appendChild(li);
            }
        };

        this.breadcrumbsSteper = function(event) {
            event.stopPropagation();
            var target = event.currentTarget,
                breadId = target.getAttribute('data-that-id');

            self.hideChildren(breadId);
        };

        this.backSteper = function(event) {
            var target = event.currentTarget,
                cardLevel = self.config.cardBox.getAttribute('data-that-level'),
                thatLevel = target.getAttribute('data-that-level');

            thatLevel -= 1;
            target.setAttribute('data-that-level', thatLevel);
            self.hideChildren();

            // hide backBtn if 3
            if(thatLevel == COLS_COUNT) {
                backBtn.style.display = 'none';
            }
        };

        this.showChildren = function() {
            var cardBox = self.config.cardBox,
                childTree = self.config.cardBox.querySelector('.tree'),
                canvasPosL = parseFloat(canvas.style.left) || 0;

            if (!hasClass(cardBox, 'tree__node_is_opened')) {
                // if hasn't child data, download JSON
                if (!childTree) {
                    self.getData('data/ExecuteMethodLeaf.json')
                } else {
                    cardBox.className += ' tree__node_is_opened';
                    childTree.style.display = 'inline-block';
                }
                canvas.style.left = canvasPosL - parseFloat(33.3) + '%';
            }
        };

        this.hideChildren = function(firstId) {
            var canvasPosL = parseFloat(canvas.style.left) || 0,
                lastId = self.config.lastId,
                obj = self.config.cache,
                hideArr = [lastId];

            function createHideList() {
                var current = obj[lastId];
                var parentId;

                do {
                    parentId = current.parentId;
                    hideArr.push(parentId);
                    current = obj[parentId];
                } while(parentId != firstId);
            }

            createHideList();


            for(var i = 0; i < hideArr.length; i++) {
                if(obj[hideArr[i]].level >= COLS_COUNT) {
                    var tree = document.getElementById(hideArr[i]),
                        treeChild = $(tree).find('.tree');

                    treeChild.removeClass('tree__node_is_opened');
                    treeChild.hide();

                    canvas.style.left = (obj[hideArr[i]].level - COLS_COUNT) * parseFloat(33.3) + '%';
                }
            }

            // if (hasClass(cardBox, 'tree__node_is_opened')) {
            //     removeClass(cardBox, openClassName);
            //     childTree.style.display = 'none';
            //     canvas.style.left = canvasPosL + parseFloat(33.3) + '%';
            //
            //     // re-define last current box
            //     self.config.cardBox = $(cardBox).closest('.tree__node_is_opened').get(0);
            // }
        };

        this.getData = function (url) {
            $.ajax({
                url: url,
                success: self.handleTree
            });
        };

        this.handleTree = function (obj) {
            var childrenArr,
                id;

            self.config.cache = $.extend(true, self.config.cache, obj);

            for(id in obj) {
                if(!obj.hasOwnProperty(id)) continue;

                // cache breadcrumbs obj
                self.config.breadcrumbs[id] = {};
                self.config.breadcrumbs[id]['breadcrumb'] = obj[id].breadcrumbs;
                self.config.breadcrumbs[id]['parentId'] = obj[id].parentId;
                self.config.breadcrumbs[id]['userName'] = obj[id].userName;
                self.config.breadcrumbs[id]['level'] = obj[id].level;

                // save current children
                childrenArr = self.config.cache[id].children;
                if(!obj[id].parentId) {
                    // first column
                    self.createRootColumn(id);

                    // second column
                    if(!!childrenArr.length) {
                        self.createChildColumn(childrenArr);
                    }
                } else {
                    if(obj[id].level > COLS_COUNT) {
                        childrenArr = Object.keys(obj);

                        self.createChildColumn(childrenArr);
                        return false;
                    }
                    if(!!childrenArr.length) {
                        self.createChildColumn(childrenArr);
                    }
                }
            }
        };

        this.createRootColumn = function (id) {
            var tmpl = new self.RenderTree({
                data: self.config.cache[id],
                myId: id,
                template: _.template(document.getElementById('organigram-template').innerHTML)
            });

            canvas.appendChild(tmpl.getElem());
        };

        this.createChildColumn = function (childrenArr) {
            var ul = document.createElement('ul'),
                id, thatEl, el, tmpl, key;

            ul.className = 'tree';

            for(id = 0; id < childrenArr.length; id++) {
                key = childrenArr[id];
                thatEl = self.config.cache[key].parentId;
                el = document.getElementById(thatEl);

                tmpl = new self.RenderTree({
                    data: self.config.cache[key],
                    myId: key,
                    template: _.template(document.getElementById('organigram-template').innerHTML)
                });

                ul.appendChild(tmpl.getElem());

                if (!$(el).hasClass('tree__node_is_opened')) {
                    $(el).addClass('tree__node_is_opened');
                }

                el.appendChild(ul);
            }
        };

        this.RenderTree = function (options) {
            var elem;

            function getElem () {
                if (!elem) render();
                return elem;
            }

            function render () {
                // добавляем ID текущего пользователя
                options.data.myId = options.myId;

                var html = options.template(options.data);

                elem = document.createElement('div');
                elem.className = 'tree';
                elem.innerHTML = html;
                elem = elem.firstElementChild;
            }

            this.getElem = getElem;
        }
    }

    lmiOrganigramm.getData('data/ExecuteMethod.json');
    lmiOrganigramm.initEvents();
});