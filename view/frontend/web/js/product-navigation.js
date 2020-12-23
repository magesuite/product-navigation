define(['jquery', 'jquery-ui-modules/widget'], function($) {
    'use strict';

    $.widget('magesuite.productNavigation', {
        options: {
            breadcrumbLinkSelector: '.cs-breadcrumbs__link',
            categoryLinkSelector: '.cs-product-navigation__link--category',
            searchLinkSelector: '.cs-product-navigation__link--search',
            prevLinkSelector: '.cs-product-navigation__link--prev',
            nextLinkSelector: '.cs-product-navigation__link--next',
            activeLinkClass: 'cs-product-navigation__link--active',
            readyClass: 'cs-product-navigation--initialized',
            showNavigation: true,
            storageKey: 'mgs-product-navigation',
            productLinkRegexp: /<a href="([^"]+)" class="cs-product-tile__name-link/g,
        },

        _create: function() {
            var showNavigation = this.options.showNavigation,
                categoryInfo,
                previousProducts,
                nextProducts,
                backUrl;

            this._currentUrl = window.location.href;

            categoryInfo = this._getCategoryInfo(this._currentUrl);
            previousProducts = this._getPreviousProducts(categoryInfo);
            nextProducts = this._getNextProducts(categoryInfo);

            if (showNavigation && previousProducts.length) {
                this._enablePrevious(previousProducts.pop());
            } else {
                backUrl = this._getBackUrl(
                    categoryInfo,
                    previousProducts,
                    nextProducts
                );

                if (backUrl !== undefined) {
                    this._enableBack(backUrl);
                }
            }

            if (showNavigation && nextProducts.length) {
                this._enableNext(nextProducts.shift());
            }

            this._makeReady();
        },

        _getCategoryInfo: function(currentUrl) {
            var stringified,
                parsed,
                empty = { url: '', products: [] };

            try {
                stringified = localStorage.getItem(this.options.storageKey);
                parsed = stringified ? JSON.parse(stringified) : empty;

                if (parsed.products.indexOf(currentUrl) !== -1) {
                    return parsed;
                }
            } catch (error) {
                /* Access to localStorage or JSON parsing error. */
            }

            return empty;
        },

        _getPreviousProducts: function(categoryInfo) {
            var products = categoryInfo.products,
                currentIndex = products.indexOf(this._currentUrl);

            return products.slice(0, Math.max(currentIndex, 0));
        },

        _getNextProducts: function(categoryInfo) {
            var products = categoryInfo.products,
                currentIndex = products.indexOf(this._currentUrl),
                categoryHasProduct = currentIndex !== -1,
                nextProducts = categoryHasProduct
                    ? products.slice(currentIndex + 1)
                    : [];

            if (categoryHasProduct && nextProducts.length <= 1) {
                this._fetchNextProducts(categoryInfo);
            }

            return nextProducts;
        },

        _fetchNextProducts: function(categoryInfo) {
            var categoryUrl = categoryInfo.url,
                nextPageUrl = categoryUrl,
                currentPageMatch;

            currentPageMatch = nextPageUrl.match(/[\?&]p=([0-9]+)/);
            if (currentPageMatch) {
                nextPageUrl = nextPageUrl.replace(
                    /([\?&])p=[0-9]+/,
                    '$1p=' + (parseInt(currentPageMatch[1], 10) + 1)
                );
            } else {
                nextPageUrl += categoryUrl.indexOf('?') > -1 ? '&p=2' : '?p=2';
            }

            return $.get(nextPageUrl).then(
                function(html) {
                    var products = [],
                        regexp = this.options.productLinkRegexp,
                        match;

                    while ((match = regexp.exec(html)) !== null) {
                        products.push(match[1]);
                    }

                    if (!products.length) {
                        return;
                    }

                    this._saveCategoryInfo({
                        url: nextPageUrl,
                        products: categoryInfo.products.concat(products),
                    });
                }.bind(this)
            );
        },

        _getBackUrl: function(categoryInfo, previousProducts, nextProducts) {
            if (previousProducts.length || nextProducts.length) {
                return categoryInfo.url;
            }
            // Otherwise get the value from breadcrumbs.
            return $(this.options.breadcrumbLinkSelector)
                .last()
                .attr('href');
        },

        _saveCategoryInfo: function(categoryInfo) {
            localStorage.setItem(
                this.options.storageKey,
                JSON.stringify(categoryInfo)
            );
        },

        _enableBack: function(url) {
            var selector =
                url.indexOf('catalogsearch') !== -1
                    ? this.options.searchLinkSelector
                    : this.options.categoryLinkSelector;

            this._enableLink($(selector), url);
        },

        _enablePrevious: function(url) {
            this._enableLink($(this.options.prevLinkSelector), url);
        },

        _enableNext: function(url) {
            var $link = $(this.options.nextLinkSelector),
                prefetcher = function() {
                    this._prefetchLink(url);
                }.bind(this);

            this._enableLink($link, url);

            $(window).one('load', prefetcher);

            $link.one('mouseover touchstart', prefetcher);
        },

        _enableLink: function($link, url) {
            $link.attr('href', url).addClass(this.options.activeLinkClass);
        },

        _prefetchLink: function(url) {
            $.get({ url: url, cache: true }, function() {});
        },

        _makeReady: function() {
            this.element.addClass(this.options.readyClass);
        },
    });

    return $.magesuite.productNavigation;
});
