define(['jquery', 'jquery-ui-modules/widget'], function($) {
    'use strict';

    $.widget('magesuite.linksCollector', {
        options: {
            productLinkSelector: '.cs-product-tile__name-link',
            storageKey: 'mgs-product-navigation',
        },
        _create: function() {
            var currentUrl = window.location.href;

            this._saveCategoryInfo({
                url: currentUrl,
                products: this._collectLinks(),
            });
        },
        _collectLinks: function() {
            return this.element
                .find(this.options.productLinkSelector)
                .map(function() {
                    return $(this).attr('href');
                })
                .get();
        },
        _saveCategoryInfo: function(categoryInfo) {
            localStorage.setItem(
                this.options.storageKey,
                JSON.stringify(categoryInfo)
            );
        },
    });

    return $.magesuite.linksCollector;
});
