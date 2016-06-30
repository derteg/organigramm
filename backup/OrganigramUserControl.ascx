<%@ Assembly Name="LMI.Portal.Organigram, Version=1.0.0.0, Culture=neutral, PublicKeyToken=f02f8321402098c3" %>
<%@ Assembly Name="Microsoft.Web.CommandUI, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="asp" Namespace="System.Web.UI" Assembly="System.Web.Extensions, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35" %>
<%@ Import Namespace="Microsoft.SharePoint" %>
<%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="OrganigramUserControl.ascx.cs" Inherits="LMI.Portal.Organigram.WebParts.OrganigramView.OrganigramViewUserControl" %>
<%@ Register TagPrefix="leroy" Namespace="LMI.Portal.Common.UI.Controls" Assembly="LMI.Portal.Common, Version=1.0.0.0, Culture=neutral, PublicKeyToken=f02f8321402098c3" %>


<script>
    LMI.MySiteUrl = '<%= MySiteUrl %>';
    LMI.StructureUnits = JSON.parse('<%= StructureUnits %>');
</script>

<script type="text/javascript">

    (function($) {
        $(function () {
            //$('.organigram__canvas').draggable();


            $('#searchBtn').click(function (e) {
                e.preventDefault();
                var q = $('#searchTbx').val();
                window.location.href = "/Pages/OrganigramSearch.aspx?q=" + encodeURI(q);

            });

            // Убираем возможность случайного выделения частей органиграммы в IE8+
            $('.organigram__canvas').on('selectstart', function (e) {
                e.preventDefault();

                return false;
            });
        });
    })(jQuery);


</script>

<leroy:CssJsRegistrationControl Type="css" Url="/_layouts/15/LMI.Portal.Organigram/css/organigram.css" runat="server" />
<leroy:CssJsRegistrationControl Type="js" Url="/_layouts/15/LMI.Portal.RootWeb/js/knockout.js" runat="server" />
<leroy:CssJsRegistrationControl Type="js" Url="/_layouts/15/LMI.Portal.RootWeb/js/knockout.mapping.js" runat="server" />
<leroy:CssJsRegistrationControl Type="js" Url="/_layouts/15/LMI.Portal.RootWeb/js/jquery-ui.js" runat="server" />
<leroy:CssJsRegistrationControl Type="js" Url="/_layouts/15/LMI.SN.Site/js/LMI.SN.js" runat="server" />
<leroy:CssJsRegistrationControl Type="js" Url="/_layouts/15/LMI.Portal.Organigram/js/LMI.Organigram.js" runat="server" />
<leroy:CssJsRegistrationControl Type="js" Url="/_layouts/15/LMI.Portal.Organigram/js/LMI.Organigram.Render.js" runat="server" />

<div id="ogPopup">
    <div class="organigram-overlay"></div>
    <div class="organigram-popup">
        <div class="organigram-popup__image"></div>
        <div class="organigram-popup__text">
            Для навигации по органиграмме двигайте мышь, удерживая нажатой левую кнопку 11
        </div>
        <div class="organigram-popup__actions">
            <a id="ogPopupBtnOk" href="javascript:void(0);" class="organigram-popup__btn button-ok">OK</a>
        </div>
    </div>
</div>

<link rel="stylesheet" type="text/css" media="print" href="/_layouts/15/LMI.Portal.Organigram/css/organigram_print.css" />
<div id="organigram" class="organigram"  data-bind="css: { '_filter_enabled': $root.isUnitTabSelected }" >
    <div class="organigram-panel">
        <div class="organigram-panel__wrapper">
            <div class="organigram-nav">
                <a class="organigram-nav__link _active" href="javascript:void(0);" data-bind="click: $root.switchTab.bind(null, '#company'), css: { '_active': $root.tabName() === '#company' }">Компания</a>
                <a class="organigram-nav__link" href="javascript:void(0);" data-bind="click: $root.switchTab.bind(null, '#directorsBoard'), css: { '_active': $root.tabName() === '#directorsBoard' }">Совет директоров</a>
                <a class="organigram-nav__link" href="javascript:void(0);" data-bind="click: $root.switchTab.bind(null, '#centralOffice'), css: { '_active': $root.tabName() === '#centralOffice' }">Центральный офис</a>
                <a class="organigram-nav__link _last" href="javascript:void(0);" data-bind="click: $root.openUnitsPopup, css: { '_active': $root.isUnitTabSelected }">Подразделение</a>
            </div>

            <div class="organigram-search">
                <div class="user-search _fullwidth">
                    <input type="text" id="searchTbx" class="user-search _wide" value="" placeholder="Поиск по органиграмме">
                    <input id="searchBtn" type="submit" value="" >
                </div>
            </div>

            <div class="organigram-actions">
                <a class="organigram-actions__link _print _last" href="javascript:window.print();">Печать</a>
                <!--<a class="organigram-actions__link _pdf _last" href="javascript:void(0);">Скачать pdf</a>-->
            </div>
        </div>
    </div>

    <div class="organigram__content">
            <div class="organigram__canvas">
            <ul class="tree" data-bind="foreach: $data.trees">
                <li class="tree__node _root" data-bind="template: { 'name': $root.getTemplateName($data) }, 'organigramNode': $data, css: { '_opened': $data.isExpanded }"></li>
            </ul>
        </div>
    </div>

    <div class="organigram__sidebar" data-bind="visible: $root.isUnitTabSelected(), css: { '_expanded': $root.shopsFilter.expanded, '_two_cols': $root.shopsFilter.children().length > 12 }" style="display: none;">
        <div class="lc-block lc-positions _padded_links">

            <h3 data-bind="visible: $root.shopsFilter.selected(), text: $root.shopsFilter.selected() ? $root.shopsFilter.selected().name : ''"></h3>

            <a href="javascript:void(0);" class="lc-block__back-link" data-bind="visible: $root.shopsFilter.selected(), click: $root.goBack.bind(null, ($root.shopsFilter.selected() ? $root.shopsFilter.selected().id : null))">Назад</a>

            <!--<span class="lc-block__subtitle">Название подразделения</span>-->
            <div data-bind="'if': $root.shopsFilter.selectedChildren()">
                <span class="lc-block__title" data-bind="text: $root.shopsFilter.selectedChildren().name"></span>
            </div>

            <div class="lc-block__row">
                <div class="lc-block__col">
                    <ul class="lc-links" data-bind="foreach: $root.shopsFilter.children">
                        <li data-bind="css: { '_hidden_el': $index() > 13 }">
                            <a href="javascript:void(0);"
                                data-bind="text: $data.unit.name,
                                           click: $data.unit.type === 'CentralOffice' ? $root.initUnitsFilter.bind(null, $data.unit.id) : $root.selectUnit.bind(null, $data.unit),
                                           css: {'_hidden_el': $index() > 13, 'lc-all':$data.selected }"></a>
                        </li>
                    </ul>
                </div>
                <div class="lc-block__col">
                    <ul class="lc-links" data-bind="foreach: $root.shopsFilter.children">
                        <li data-bind="css: { '_hidden_el': $index() <= 13 }">
                            <a href="javascript:void(0);"
                                data-bind="text: $data.unit.name,
    click: $data.unit.type === 'CentralOffice' ? $root.initUnitsFilter.bind(null, $data.unit.id) : $root.selectUnit.bind(null, $data.unit)"></a>

                        </li>
                    </ul>
                </div>
            </div>
            <a href="javascript:void(0);" class="lc-block__more-link" data-bind="click: $root.unitsFilterShowAll, visible: $root.shopsFilter.children().length > 13">Показать все</a>
            <a href="javascript:void(0);" class="lc-block__more-link _collapse" data-bind="click: $root.unitsFilterHideAll">Скрыть</a>
        </div>
    </div>

    <div class="organigram__footer">
        <a class="organigram__footer-link _collapse" href="#" data-bind="click: $root.collapseAll, visible: !$root.isAllCollapsed()">Свернуть все</a>
    </div>
    <div class="structure-units-popup" style="display: none;">
        <h3 class="structure-units-popup__title">Выбери подразделение</h3>
        <div class="close" onclick="$('.overlay').hide();$('.vacancy-frame-wrap').hide();"></div>
        <div class="structure-units-popup__content">
            <ul class="structure-units-popup__col" data-bind="foreach: $data.unitsFirtsCol">
                <li class="structure-units-popup__item"><a class="structure-units-popup__link" href="javascript:void(0);" data-bind="text: $data.name, click: $root.selectUnit.bind(null, $data)"></a></li>
            </ul>
            <ul class="structure-units-popup__col" data-bind="foreach: $data.unitsSecondCol" >
                <li class="structure-units-popup__item"><a class="structure-units-popup__link" href="javascript:void(0);" data-bind="text: $data.name, click: $root.selectUnit.bind(null, $data)"></a></li>
            </ul>
            <ul class="structure-units-popup__col" data-bind="foreach: $data.unitsThirdCol" >
                <li class="structure-units-popup__item"><a class="structure-units-popup__link" href="javascript:void(0);" data-bind="text: $data.name, click: $root.selectUnit.bind(null, $data)"></a></li>
            </ul>
        </div>
    </div>
</div>

<script id="fake-template" type="text/html">
    <ul class="tree" data-bind="foreach: $data.children, visible: $data.isExpanded, css: { '_one_child': $data.children().length == 1 }" >
        <li class="tree__node" data-bind="template: { 'name': $root.getTemplateName($data) }, 'organigramNode': $data, css: { '_last': ($index() + 1) == $parent.children().length }">        </li>
    </ul>

    <!-- ko if: !$data.isFake && $data.unit.unitId > 0  && $data.isExpandable-->
    <a class="tree__collapse-link" href="javascript:void(0);" data-bind="text: $root.getCollapseTitle($data), click: $root.collapse.bind(null, $data) "></a>
    <!-- /ko -->
</script>

<script id="userNode-template" type="text/html">
    <!-- ko if:  $data.unit.userId > 0 -->
        <!-- ko if:  $data.directors == null -->
        <div class="organigram-user"  data-bind="template: { 'name': 'organigram-user' }">  </div>
        <!-- /ko -->
        <!-- ko if: $data.directors != null -->
        <div class="organigram__directors-list" data-bind="foreach: $data.directors ">
            <div class="organigram-user _director clearfix" data-bind="template: { 'name': 'organigram-user' }, css: { '_first': $index() === 0 }"></div>
        </div>
        <!-- /ko -->
    <!-- /ko -->

    <!-- ko if:  $data.unit.userId === 0 -->
    <div class="organigram-user _vacancy"  data-bind="template: { 'name': 'organigram-vacancy' }">  </div>
    <!-- /ko -->

    <ul class="tree" data-bind="foreach: $data.children, visible: $data.isExpanded, css: { '_one_child': $data.children().length == 1, '_user-only_child': $data.unit.unitId === 0}, updateTreeNode: true" >
        <li class="tree__node" data-bind="template: { 'name': $root.getTemplateName($data) }, 'organigramNode': $data, css: { '_last': ($index() + 1) == $parent.children().length }">        </li>
    </ul>

    <!-- ko if: !$data.isFake && $data.unit.unitId > 0  && $data.isExpandable-->
    <a class="tree__collapse-link" href="javascript:void(0);" data-bind="text: $root.getCollapseTitle($data), click: $root.collapse.bind(null, $data) "></a>
    <!-- /ko -->
</script>


<script id="unitNode-template" type="text/html">
    <div class="tree__node-inner">
        <!-- ko if: $data.unit.unitId > 0  -->
        <div class="organigram-depart" data-bind="css: { '_opened': $data.isExpanded }">
            <div class="organigram-depart__title">
                <!-- ko if: $data.isExpandable -->
                <a class="organigram-depart__name" href="#" data-bind="text: $data.unit.unitName, click: $root.nodeClick.bind(null, $data, $element)"></a>&nbsp;&nbsp;<i class="organigram-depart__icon" data-bind="    click: $root.nodeClick.bind(null, $data, $element)"></i>
                <!-- /ko -->

                <!-- ko if: !$data.isExpandable -->
                <span class="organigram-depart__name" data-bind="text: $data.unit.unitName"></span>
                <!-- /ko -->
            </div>
            <a class="organigram-depart__link" href="#" data-bind="click: $root.switchTab.bind(null, '#unit-' + $data.unit.unitId), text: $root.getGoToUnitTitle($data), visible: !$data.isExpanded()">Перейти к структуре</a>
            <div class="organigram-depart__director" data-bind="visible: $data.unit.unitType == 2 || $data.unit.unitType == 1 || $data.isExpanded">
                <!-- ko if:  $data.unit.userId > 0 && $data.directors == null -->
                <div class="organigram-user" data-bind="template: { 'name': 'organigram-user' }"></div>
                <!-- /ko -->

                <!-- ko if:  $data.unit.userId === 0 && $data.directors == null -->
                <div class="organigram-user _vacancy" data-bind="template: { 'name': 'organigram-vacancy' }"></div>
                <!-- /ko -->

                <!-- ko if: $data.directors != null -->
                <div class="organigram-depart__director" data-bind="foreach: $data.directors ">
                    <div class="organigram-user _director clearfix" data-bind="template: { 'name': 'organigram-user' }, css: { '_first': $index() === 0 }"></div>
                </div>
                <!-- /ko -->
            </div>
        </div>
        <!-- /ko -->

        <ul class="tree" data-bind="foreach: $data.children, visible: $data.isExpanded, css: { '_one_child': $data.children().length == 1 }">
            <li class="tree__node" data-bind="template: { 'name': $root.getTemplateName($data) }, 'organigramNode': $data, css: { '_last': ($index() + 1) == $parent.children().length }"></li>
        </ul>

        <!-- ko if: !$data.isFake && $data.unit.unitId > 0  && $data.isExpandable-->
        <a class="tree__collapse-link" href="javascript:void(0);" data-bind="text: $root.getCollapseTitle($data), click: $root.collapse.bind(null, $data) "></a>
        <!-- /ko -->
    </div>
</script>

<script id="organigram-user" type="text/html">
    <div class="organigram-user__photo">
        <img data-bind="attr: { 'src': LMI.MySiteUrl + $data.unit.avatar }" width="70" height="70" alt="photo" />
        </div>
    <div class="organigram-user__info">
        <div class="organigram-user__title">
             <a class="organigram-user__name" data-bind="text: $data.unit.userName, attr: { 'href': LMI.MySiteUrl + '/view_profile.aspx?user_id=' + $data.unit.userId }"></a>

            <!-- ko if: $data.unit.info -->
            <div class="organigram-user__details">
                <i class="organigram-user__icon"></i>
                <div class="tooltip" style="margin-top: -29px;" data-bind="text: $data.unit.info"></div>
            </div>
        <!-- /ko -->
        </div>
        <span class="organigram-user__position" data-bind="text: $data.unit.jobTitle"></span>
        <span class="organigram-user__phone" data-bind="text: 'Тел.: ' + $data.unit.phone, visible: $data.unit.phone"></span>
        <a class="organigram-user__email" data-bind="text: $data.unit.email, attr: { 'href': 'mailto:' + $data.unit.email }"></a>
    </div>
</script>

<script id="organigram-vacancy" type="text/html">
    <div class="organigram-user__photo">
        <img src="/_layouts/15/LMI.Portal.RootWeb/images/vacancy_stub.png" width="70" height="70" alt="photo" />
        </div>
    <div class="organigram-user__info">
        <div class="organigram-user__title">
            <!-- ko if: $data.unit.vacancyId === 0  -->
            <span class="organigram-user__name" data-bind="text: $root.getVacancyTitle($data)"></span>
            <!-- /ko -->

            <!-- ko if: $data.unit.vacancyId > 0 -->
            <a class="organigram-user__name" href="#" target="_blank"
               data-bind="text: $data.unit.vacancyTitle, attr: { href: '/Portal/Staff/Vacancy/All/View?vacancyId=' + $data.unit.vacancyId }"></a>
            <!-- /ko -->
        </div>
        <span class="organigram-user__position">Вакансия</span>
    </div>
</script>