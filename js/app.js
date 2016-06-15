$(document).ready(function(){
    var lmiOrganigramm = new Organigramm || {};

    // Organigramm.namespace = function () {
    //
    // }

    function Organigramm () {
        var self = this,
            workspace = document.getElementById('organigram'),
            canvas = $('.organigram__canvas');

        this.config = {
            thatEl: '',
            cache: {}
        };

        this.initEvents = function () {
            self.getData();

            
        };

        this.handleGrowTree = function (event) {
            console.log(event.type);
        };

        this.getData = function () {
            $.ajax({
                url: 'data/ExecuteMethod.json',
                success: self.handleTree
            });
        };

        this.handleTree = function (obj) {
            var rootID,
                childrenArr;
            self.config.cache = obj;

            for(var id in obj) {
                if(!obj[id].parentId) {
                    // отрисовываем корневоей элемент
                    self.createRootColumn(id);

                    childrenArr = self.config.cache[id].children;
                    // отрисовываем второй уровень
                    self.createChildColumn(childrenArr);
                } else {
                    childrenArr = self.config.cache[id].children;
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

            self.config.thatEl = self.config.cache[id].parentId;

            canvas.append(tmpl.getElem());
        };

        this.createChildColumn = function (ids) {
            var ul = $('<ul class="tree"></ul>'),
                el, tmpl, thatEl;

            for(var id in ids) {
                var thatId = ids[id];
                thatEl = self.config.cache[thatId].parentId;
                el = $('#' + thatEl);

                tmpl = new self.RenderTree({
                    data: self.config.cache[ids[id]],
                    myId: ids[id],
                    template: _.template(document.getElementById('organigram-template').innerHTML)
                });


                ul.append(tmpl.getElem());
                el.append(ul);
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

    lmiOrganigramm.initEvents();
});