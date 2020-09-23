define(['jquery', 'underscore', 'jquery-ui-modules/widget'], function ($, _) {
    'use strict';

    $.widget('magesuite.linksCollector', {
        options: {
            productLinkSelector: '.cs-product-tile__name-link',
            storageKey: 'mgs-product-navigation',
        },
        _create: function () {
            var currentUrl = window.location.href;
            this._saveCategoryInfo({
                url: currentUrl,
                products: this._collectLinks(),
            });
        },
        _collectLinks: function () {
            return _.toArray(
                this.element[0].querySelectorAll(
                    this.options.productLinkSelector
                )
            ).map(function (productLink) {
                return productLink.getAttribute('href');
            });
        },
        _saveCategoryInfo: function (categoryInfo) {
            localStorage.setItem(
                this.options.storageKey,
                JSON.stringify(categoryInfo)
            );
        },
    });

    return $.magesuite.linksCollector;
});
