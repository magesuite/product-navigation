/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

/**
 * @api
 */
define(['jquery', 'jquery-ui-modules/widget'], function($) {
    'use strict';

    var defaultOptions = {
        productLinkSelector: '.products-grid .cs-product-tile__name-link',
        storageKey: 'mgs-product-navigation',
    };

    return function(options) {
        var categoryInfo = {},
            currentUrl = window.location.href;

        options = $.extend({}, defaultOptions, options);

        categoryInfo = {
            url: currentUrl,
            products: $(options.productLinkSelector)
                .map(function() {
                    return $(this).attr('href');
                })
                .get(),
        };

        localStorage.setItem(options.storageKey, JSON.stringify(categoryInfo));
    };
});
