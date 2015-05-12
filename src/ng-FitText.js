/* ng-FitText.js v3.3.1
 * https://github.com/patrickmarabeas/ng-FitText.js
 *
 * Original jQuery project: https://github.com/davatron5000/FitText.js
 *
 * Copyright 2015, Patrick Marabeas http://marabeas.io
 * Released under the MIT license
 * http://opensource.org/licenses/mit-license.php
 *
 * Date: 12/04/2015
 */

(function(window, document, angular, undefined) {

  'use strict';

  angular.module('ngFitText', [])
    .value( 'config', {
      'debounce': false,
      'delay': 250,
      'loadDelay': 10,
      'min': undefined,
      'max': undefined
    })

    .directive('fittext', ['$timeout', 'config', 'fitTextConfig', function($timeout, config, fitTextConfig) {
      return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {
          angular.extend(config, fitTextConfig.config);

          element[0].style.display = 'inline-block';
          element[0].style.lineHeight = '1';

          var loadDelay    = attrs.fittextLoadDelay || config.loadDelay;
          var minFontSize  = parseFloat(attrs.fittextMin || config.min || Number.NEGATIVE_INFINITY);
          var maxFontSize  = parseFloat(attrs.fittextMax || config.max || Number.POSITIVE_INFINITY);
          var testFontSize = 10;

          var sortFn = function(first, last) {
            if (first > last){
              return 1;
            } else if (last > first) {
              return -1;
            } else {
              return 0;
            }
          };

          // Returns the number if is between the min and max, otherwise
          //  returns the min if the number is smaller than the min, or
          //  max if the number is greater than the max
          //
          // @param [Float] min the min to compare with the number
          // @param [Float] max the max to compare with the number
          // @param [Float] number the number to compare between the
          //  min and max.
          //
          // @return [Float]
          var numberInBounds = function(min, max, number) {
            var elements = [min, max, number].sort(sortFn);

            // Returns the second element of the array, when the collection is
            //  sort if the number is smaller than the min then the second
            //  element will be the min, if is greater then the second element
            //  will be the max, otherwise will be the number.
            return elements[1];
          };

          var calculateOptimalFontSize = function(target, targetParent, fontSize) {
            target.css('fontSize', fontSize);

            var elementWidth = $(target).width();
            var parentWidth  = $(targetParent).width();

            // widths are retrieved as integers so the precision could be removed, subtract 1px to
            // avoid precision issues.
            return numberInBounds(minFontSize, maxFontSize, (parentWidth * fontSize / elementWidth) - 5);
          };

          var resizer = function() {
            var parent = element.parent();

            var optimalFontSize = calculateOptimalFontSize(element, parent, testFontSize);

            element.css('fontSize', optimalFontSize);
          };

          $timeout(function() { resizer() }, loadDelay);

          scope.$watch(attrs.ngModel, function() { resizer() });

          config.debounce
            ? angular.element(window).bind('resize', config.debounce(function(){ scope.$apply(resizer)}, config.delay))
            : angular.element(window).bind('resize', function(){ scope.$apply(resizer)});
        }
      }
    }])

    .provider('fitTextConfig', function() {
      var self = this;
      this.config = {};
      this.$get = function() {
        var extend = {};
        extend.config = self.config;
        return extend;
      };
      return this;
    });

})(window, document, angular);
