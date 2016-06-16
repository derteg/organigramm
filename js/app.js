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
            var parentID,
                childrenArr = [];

            self.config.cache = obj;

            for(var id in obj) {
                parentID = obj[id].parentId;
                if(!obj[id].parentId) {
                    self.createRootColumn(id);
                } else {
                    childrenArr = self.getOwnChildren(parentID);
                    self.createChildColumn(childrenArr);
                }
            }
        };

        this.getOwnChildren = function(parentID) {
            var obj = self.config.cache,
                childrenArr = [];

            for (var key in obj) {
                if (obj[key].parentId == parentID) {
                    childrenArr.push(key);
                }
            }

            console.log(childrenArr);
            return childrenArr;
        };

        this.createRootColumn = function (id) {
            var tmpl = new self.RenderTree({
                data: self.config.cache[id],
                myId: id,
                template: _.template(document.getElementById('organigram-template').innerHTML)
            });

            canvas.append(tmpl.getElem());
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

    lmiOrganigramm.initEvents();
});