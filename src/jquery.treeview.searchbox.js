/*!
 * Searchbox - extension for jQuery.Treeview by http://bassistance.de
 * https://github.com/alanrsoares/jquery.treeview.searchbox
 *
 * Requires: jquery.treview.js, jquery.treview.css, bootstrap >= 3
 * $author: Alan R. Soares - alanrsoars@gmail.com
 * http://jquery.bassistance.de/treeview/jquery.treeview.zip *
 */
(function ($) {

    var SearchBox = (function () {

        function SearchBox(configuration) {
            this.currentSearchTerm = "";
            this.currentResult = 0;
            this.searchResults = [];
            this.selector = configuration.searchBoxSelector;
            this.searchSelector = (configuration.outerConfiguration.searchSelector === "undefined") ? "ul.treeview li span" : configuration.outerConfiguration.searchSelector;
            this.matchedItemClass = (typeof configuration.outerConfiguration.matchedItemClass === "undefined") ? "label-success" : configuration.outerConfiguration.matchedItemClass;
        }

        SearchBox.prototype.search = function (searchTerm) {
            this.resetResults();

            this.currentSearchTerm = searchTerm;

            if (searchTerm === "") {
                $(this.selector + " #searchSummary").hide();
                return false;
            }

            this.searchResults = $(this.searchSelector).filter(function () {
                return new RegExp(eval("/" + searchTerm + "/i")).test($(this).text());
            });

            this.updateResult();

            if (this.searchResults.length > 0) {
                var result = this.searchResults[0];
                this.moveToResult(result.id);
            }

            return false;
        };

        SearchBox.prototype.getSearchTerm = function () {
            return $(this.selector + " #searchTerm").val();
        };

        SearchBox.prototype.moveToResult = function (resultId) {
            document.location.hash = "#" + resultId;
        };

        SearchBox.prototype.nextResult = function () {

            if (this.searchResults.length > 0) {

                this.currentResult = (this.currentResult === (this.searchResults.length - 1))
                    ? 0 : this.currentResult + 1;

                var result = this.searchResults[this.currentResult];

                this.moveToResult(result.id);

                this.updateResult();
            }
        };

        SearchBox.prototype.prevResult = function () {

            if (this.searchResults.length > 0) {

                this.currentResult = (this.currentResult === 0)
                    ? (this.searchResults.length - 1) : this.currentResult - 1;

                var result = this.searchResults[this.currentResult];

                this.moveToResult(result.id);

                this.updateResult();
            }
        };

        SearchBox.prototype.updateResult = function () {

            if (this.searchResults.length > 0) {

                this.expandMatchedNodes(this.searchResults);

                $(this.selector + " #searchSummary")
                    .removeClass("alert-error")
                    .addClass("alert-info")
                    .html($('<strong />', { text: (this.currentResult + 1) + ' de ' + (this.searchResults.length) }))
                    .show();
            } else {
                $(this.selector + " #searchSummary")
                    .removeClass("alert-info")
                    .addClass("alert-error")
                    .html('<strong>0 de 0</strong>')
                    .show();
            }
        };

        SearchBox.prototype.resetResults = function () {
            this.collapseMatchedNodes($(this.searchResults));
            this.searchTerm = "";
            this.currentResult = 0;
            this.searchResults = [];
        };

        SearchBox.prototype.expandMatchedNodes = function (matched) {

            matched.addClass(this.matchedItemClass);

            matched.each(function () {

                var currentNode = $(this);

                var currentLI = function () { return $(currentNode).parent(); };
                var currentUL = function () { return $(currentLI()).parent(); };
                var currentULParent = function () { return $(currentUL()).parent(); };
                var hitarea = function () { return $(currentULParent().find(".hitarea:first-child")[0]); };

                var parentNode = function () { return hitarea().next(); };

                //check if node has expandable parent
                while (currentULParent().hasClass("expandable")) {
                    currentUL().show();
                    currentULParent().removeClass("expandable").addClass("collapsable");
                    hitarea().removeClass("expandable-hitarea").addClass("collapsable-hitarea");

                    currentNode = parentNode();
                }
            });
        };

        SearchBox.prototype.collapseMatchedNodes = function (matched) {

            matched.removeClass(this.matchedItemClass);

            matched.each(function () {

                var currentNode = $(this);

                var currentLI = function () { return $(currentNode).parent(); };
                var currentUL = function () { return $(currentLI()).parent(); };
                var currentULParent = function () { return $(currentUL()).parent(); };
                var hitarea = function () { return $(currentULParent().find(".hitarea:first-child")[0]); };

                var parentNode = function () { return hitarea().next(); };

                //check if node has collapsable parent
                while (currentULParent().hasClass("collapsable")) {
                    currentUL().hide();
                    currentULParent().removeClass("collapsable").addClass("expandable");
                    hitarea().removeClass("collapsable-hitarea").addClass("expandable-hitarea");

                    currentNode = parentNode();
                }
            });
        };

        return SearchBox;

    })();

    $.fn.extend({
        searchBox: function (configuration) {

            var innerConfiguration = {
                searchBoxSelector: this.selector,
                outerConfiguration: configuration
            };

            var searchBox = new SearchBox(innerConfiguration);

            $(this.selector)
                .addClass("well")
                .html(' <fieldset> \
                            <div class="input-group input-group-sm"> \
                                <input type="text" class="form-control" id="searchTerm" placeholder="' + configuration.searchPlaceholder + '"> \
                                <span id="searchSummary" class="input-group-addon alert-info" style="display: none"></span> \
                                <span id="movePrev" class="input-group-addon btn btn-default"> \
                                    <i class="fa fa-chevron-up"></i> \
                                </span> \
                                <span id="moveNext" class="input-group-addon btn btn-default"> \
                                    <i class="fa fa-chevron-down"></i> \
                                </span> \
                                <span id="searchButton" class="input-group-addon btn btn-default"> \
                                    <i class="fa fa-search"></i> \
                                </span> \
                            </div> \
                        </fieldset>');

            $(this.selector + " #searchButton").click(function (e) {
                e.preventDefault();
                searchBox.search(searchBox.getSearchTerm());
            });

            $(this.selector + " #searchTerm").keyup(function () {
                var searchTerm = searchBox.getSearchTerm();
                if (searchTerm !== "" && searchTerm.length >= 3 && searchTerm !== searchBox.currentSearchTerm) {
                    $(searchBox.selector + " #searchButton").click();
                }
            });

            $(this.selector + " #searchTerm").keypress(function (e) {
                if (e.which === 13) {
                    if (searchBox.getSearchTerm() === searchBox.currentSearchTerm && searchBox.searchResults.length > 0) {
                        searchBox.nextResult();
                    } else {
                        $(searchBox.selector + " #searchButton").click();
                    }
                }
            });

            $(this.selector + " #movePrev").click(function () {
                searchBox.prevResult();
            });

            $(this.selector + " #moveNext").click(function () {
                searchBox.nextResult();
            });
        }
    });

})(jQuery);