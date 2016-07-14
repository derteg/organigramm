var LMI = LMI || {};
LMI.Organigram = LMI.Organigram || {};


(function ($, organigram) {
    var COLS_COUNT = 3;
    var MAGIC_PADDING = 300;

    var $workspace = $('#organigram'),
        $canvas = $('.organigram__canvas', $workspace),
        $breadcrumbsList = $('.organigram-breacrumbs', $workspace),
        $backBtn = $('.organigram__back_mode_back', $workspace),
        $titlesList = $('.organigram-titles', $workspace);

    organigram.config = {
        cache: {},
        lastId: '',
        open: false,
        breadcrumbs: {}
    };

    initEvents = function () {
        $canvas.on('click', '.organigram-depart__title', organigram.handleCard);
        $workspace.on('click', '.organigram__back_mode_back', organigram.handleId);
        $breadcrumbsList.on('click', '.organigram-breacrumbs__item', organigram.handleId);
    };

    organigram.handleCard = function (event) {
        var target = event.currentTarget,
            thatId = target.parentNode.id,
            openBool = organigram.config.open;

        organigram.hideSiblingsChildren(thatId);
        organigram.hideChildren(thatId);

        if (!$('#' + thatId).hasClass('tree__node_is_opened')) {
            organigram.showChildren(thatId);
            organigram.handleStep(thatId, true);
            organigram.buildBreadcrumbs(thatId, true);
        } else {
            organigram.handleStep(thatId, false);
            organigram.buildBreadcrumbs(thatId, false);
        }
    };

    organigram.buildTitles = function (thatId, thatLevel) {
        var titlesHTML = "",
            i,
            titlesArr = ['Руководители', 'Заместители', 'Подразделения и регионы', 'Магазины'];

        for (i = 0; i < titlesArr.length; i++) {
            titlesHTML += '<div class="organigram-titles__item">' + titlesArr[i] + '</div>';
        }

        $titlesList.html(titlesHTML);
    };


    organigram.buildBreadcrumbs = function (thatId, direction) {
        // direction up/down

        var obj = organigram.config.cache,
            ids = organigram.config.breadcrumbs,
            level = obj[thatId].level;

        if (!ids.hasOwnProperty(thatId) && !!direction) {
            if (!Object.keys(ids).length) {
                ids[thatId] = {};
                ids[thatId].level = level;
            }

            for (var i in ids) {
                if (level <= ids[i].level) {
                    delete ids[i];
                }

                ids[thatId] = {};
                ids[thatId].level = level;
            }
        } else if(!direction) {
            for (var i in ids) {
                if (level <= ids[i].level) {
                    delete ids[i];
                }
            }
        }

        $breadcrumbsList.empty();

        if (Object.keys(ids).length) {
            create(ids);
        }

        function create(ids) {
            var ul = document.createElement('ul');

            ul.className = 'organigram-breacrumbs__list';

            for (var key in ids) {
                build(key);
            }

            function build(id) {
                var li = document.createElement('li'),
                    title = document.createElement('div'),
                    subTitle = document.createElement('div'),
                    obj1, obj2;

                obj1 = obj[id].parentId;
                obj2 = obj[obj1].parentId;

                li.className = 'organigram-breacrumbs__item';
                li.setAttribute('data-that-id', id);

                title.className = 'organigram-breacrumbs__title';
                title.innerText = (typeof obj[obj2].jobTitle != 'object') ? obj[obj2].jobTitle : obj[obj2].unitName;

                subTitle.className = 'organigram-breacrumbs__sub-title';
                subTitle.innerText = (typeof obj[obj2].userName != 'object') ? obj[obj2].userName : "";

                li.appendChild(title);
                li.appendChild(subTitle);

                ul.appendChild(li);
            }

            $breadcrumbsList.append(ul);
        }
    };

    organigram.handleId = function (event) {
        var obj = organigram.config.cache,
            target = event.currentTarget,
            thatId = target.getAttribute('data-that-id');
        parentId = obj[thatId].parentId;

        organigram.hideChildren(thatId);
        organigram.handleStep(thatId, false);
        organigram.setPosition(thatId, false);
        organigram.buildBreadcrumbs(thatId, false);
    };

    organigram.handleStep = function (thatId, direction) {
        // direction up/down

        var obj = organigram.config.cache,
            parentId = obj[thatId].parentId,
            level = (direction) ? +obj[parentId].level + 1 : +obj[parentId].level;

        $backBtn.attr('data-that-id', (direction) ? thatId : parentId);

        if (level < COLS_COUNT) {
            $backBtn.css('display', 'none');

            return;
        }

        $backBtn.css('display', 'inline-block');
    };


    organigram.showChildren = function (thatId) {
        var obj = organigram.config.cache,
            $cardBox = $('#' + thatId),
            $childTree = $cardBox.find('.tree');

        if (!$cardBox.hasClass('tree__node_is_opened')) {
            organigram.getChilds(thatId).done(function (data) {
                organigram.handleData(data);
                organigram.setPosition(thatId, true);
            });
        } else {
            organigram.setPosition(thatId, false);
        }
    };

    organigram.hideChildren = function (thatId) {
        var obj = organigram.config.cache,
            hideArr = [],
            newId = obj[thatId].parentId;

        function createhideChildren() {
            var currentObj = obj[thatId];
            var parentId = thatId;

            do {
                hideArr.push(parentId);
                parentId = currentObj.parentId;
                currentObj = obj[parentId];
            } while (parentId != newId);
        }

        createhideChildren();

        for (var i = 0; i < hideArr.length; i++) {
            if (obj[hideArr[i]].level >= COLS_COUNT) {
                var $tree = $('#' + hideArr[i]),
                    $treeChild = $tree.find('.tree');

                $tree.removeClass('tree__node_is_opened');
                $treeChild.remove();
            }
        }
    };

    organigram.hideSiblingsChildren = function (thatId) {
        var level = organigram.config.cache[thatId].level,
            $cardBoxes = $('.tree__node_is_opened[data-that-level=' + level + ']:not(#' + thatId + ')', $workspace),
            $cardBox = $('#' + thatId),
            $siblings = $cardBox.siblings('.tree__node_is_opened');

        if (!$cardBoxes.length) {
            return;
        }
        $cardBoxes.each(function (el, index) {
            $(this).removeClass('tree__node_is_opened').find('.tree').remove();
        });
    };

    organigram.setPosition = function (thatId, direction) {
        // direction up/down
        var obj = organigram.config.cache,
            $cardBox = $('#' + thatId),
            level = (direction) ? +obj[thatId].level + 1 : obj[thatId].level;

        if (level >= COLS_COUNT) {
            $canvas.get(0).style.left = -(+level - +COLS_COUNT) * parseFloat(33.3) + '%';
            $cardBox.find('ul').css('position', 'absolute');
        } else {
            $canvas.get(0).style.left = 0;
        }

        function calcPosition() {
            var canvasT = $canvas.offset().top,
                canvasH = $canvas.height(),
                cardT = $cardBox.offset().top,
                childH = $cardBox.find('ul').height(),
                treeH = $canvas.find('.tree:first-child'),
                distance = Math.abs(canvasT - cardT);

            console.log('height', childH);
            console.log('distance', distance);
            console.log('canvaH', canvasH);

            if (childH < distance + MAGIC_PADDING) {
                $cardBox.find('ul').css('top', -distance + (distance - childH) + MAGIC_PADDING);
            } else {
                $cardBox.find('ul').css('top', -distance);
            }

            if (canvasH < childH + distance) {
                $canvas.height(distance + childH + -MAGIC_PADDING);
            } else {
                $canvas.height(treeH);
            }
        }

        calcPosition();
    };


    organigram.handleData = function (obj) {
        var children,
            id;

        organigram.config.cache = $.extend(true, organigram.config.cache, obj);

        for (id in obj) {
            // save current children
            children = organigram.config.cache[id].children;
            if (!obj[id].parentId) {
                // first column
                organigram.createRootColumn(id);

                // second column
                if (!!children.length) {
                    organigram.createChildColumn(children);
                }
            } else {
                if (obj[id].level > COLS_COUNT) {
                    children = Object.keys(obj);

                    organigram.createChildColumn(children);
                    return false;
                }
                if (!!children.length) {
                    organigram.createChildColumn(children);
                }
            }
        }
    };

    organigram.createRootColumn = function (id) {
        var tmpl = new organigram.RenderTree({
            data: organigram.config.cache[id],
            myId: id,
            template: _.template(document.getElementById('organigram-template').innerHTML)
        });

        $canvas.find('.tree').append(tmpl.getElem());
    };

    organigram.createChildColumn = function (ids) {
        var obj = organigram.config.cache,
            ul = document.createElement('ul'),
            thatEl, el, tmpl;

        ul.className = 'tree';

        for (var id = 0; id < ids.length; id++) {
            key = ids[id];
            thatId = obj[key].parentId;
            el = document.getElementById(thatId);

            if (thatId == null) {
                continue;
            }

            tmpl = new organigram.RenderTree({
                data: obj[key],
                myId: key,
                template: _.template(document.getElementById('organigram-template').innerHTML)
            });

            $(ul).append(tmpl.getElem());
        }

        $(el).append(ul);
        $(el).addClass('tree__node_is_opened').find('li:last-child').addClass('_last');
    };

    organigram.RenderTree = function (options) {
        var elem;

        function getElem() {
            if (!elem) render();
            return elem;
        }

        function render() {
            // current uzor ID
            options.data.myId = options.myId;
            options.data.userPic = (!!options.data.avatar) ? options.data.avatar : '/_layouts/15/LMI.SN.Site/img/avatar.placeholder.100.jpg';

            var html = options.template(options.data);

            elem = document.createElement('div');
            elem.className = 'tree';
            elem.innerHTML = html;
            elem = elem.firstElementChild;
        }

        this.getElem = getElem;
    };

    function formatData(data) {
        var result = {},
            current = null;
        for (var i = 0; i < data.length; i++) {
            current = data[i];
            result[current.treePath] = current;

            current.children = $.map($.grep(data, function (d) {
                return d.parentId == current.treePath && d.level == current.level + 1;
            }), function (d) {
                return d.treePath;
            });

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

    organigram.getChilds = function (parentId) {
        var level = organigram.config.cache[parentId].level;

        return executeMethod('GetChildUnits', { parentPath: parentId, nextLevel: level });
    };

    $(function () {
        organigram.getRoot().done(function (data) {
            organigram.handleData(data);

            organigram.buildTitles();
        });
    });

    initEvents();

})(jQuery, LMI.Organigram);