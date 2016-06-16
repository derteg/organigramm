$(document).ready(function(){
    var lmiOrganigramm = new Organigramm || {};

    function Organigramm () {
        var COLS_COUNT = 3;

        var self = this,
            workspace = document.getElementById('organigram'),
            canvas = workspace.querySelector('.organigram__canvas');

        this.config = {
            thatEl: '',
            cache: {}
        };

        this.initEvents = function () {
            $(canvas).on('click', '.organigram-depart__title', self.handleGrowTree);
        };

        this.handleGrowTree = function (event) {
            var target = event.currentTarget,
                id = target.getAttribute('data-leaf-id');

            self.getData('data/ExecuteMethodLeaf.json');

            return false;
        };

        this.getData = function (url) {
            $.ajax({
                url: url,
                success: self.handleTree
            });
        };

        this.handleTree = function (obj) {
            var childrenArr = [];

            self.config.cache = $.extend(true, self.config.cache, obj);

            for(var id in obj) {
                childrenArr = self.config.cache[id].children;
                if(!obj[id].parentId) {
                    // отрисовываем корневоей элемент
                    self.createRootColumn(id);

                    // отрисовываем второй уровень
                    self.createChildColumn(childrenArr);
                } else {
                    if(obj[id].level > COLS_COUNT) {
                        childrenArr = Object.keys(obj);
                        self.createChildColumn(childrenArr);
                        return;
                    }
                    self.createChildColumn(childrenArr);
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
                el, tmpl;

            ul.className = 'tree';

            for(var id in childrenArr) {
                thatEl = self.config.cache[childrenArr[id]].parentId;
                el = document.getElementById(thatEl);

                tmpl = new self.RenderTree({
                    data: self.config.cache[childrenArr[id]],
                    myId: childrenArr[id],
                    template: _.template(document.getElementById('organigram-template').innerHTML)
                });

                // el = document.getElementById(self.config.thatEl);

                ul.appendChild(tmpl.getElem());
                el.appendChild(ul);
            }
        };


        this.RenderTree = function (options) {
            var elem;

            function getElem () {
                render();
                return elem;
            }

            function render () {
                // ID текущего пользователя
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