/* =====================================================================
 * tidy-select.js v0.0.1
 * http://github.com/djreimer/tidy-select
 * =====================================================================
 * Copyright (c) 2014 Derrick Reimer
 * 
 * MIT License
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ===================================================================== */

;(function($, window, document, undefined) {

  var Option = function(options) {
    this.options = options || {};
    this.$el = options.$el;
    this.control = options.control;
  }

  Option.prototype = {
    constructor: Option

  , select: function() {
      var $select = this.$el.parent();
      $select.val(this.$el.val());
      $select.trigger("change");
    }

  , value: function() {
      return this.$el.val();
    }

  , title: function() {
      return this.$el.html();
    }

  , description: function() {
      return this.$el.data("description");
    }

  , render: function() {
      var self = this;
      self.$option = $("<li data-value='" + this.value() + "'></li>");
      self.$option.append("<span class='ts-title'>" + this.title() + "</span>");

      if (this.description()) {
        self.$option.append("<span class='ts-description'>" + this.description() + "</span>");
      }

      self.$option.on("click", function(e) {
        e.preventDefault();
        self.select();
      });

      return self.$option;
    }
  }

  var Control = function(el, options) {
    var self = this;

    self.options = options || {};
    self.defaultText = self.options.defaultText || "Choose an item...";
    self.width = self.options.width || "inherit";

    self.$el = $(el);
    self.$control = $("<div class='ts-control'></div>");
    self.render();

    self.$el.on("change", function() {
      self.update();
    });

    self.update();
  }

  Control.prototype = {
    constructor: Control

  , close: function() {
      this.$control.removeClass("open");
    }

  , open: function() {
      this.$control.addClass("open");
    }

  , toggle: function() {
      this.$control.hasClass("open") ? this.close() : this.open();
    }

  , update: function() {
      var $option = this.$el.find("option:selected");
      var text = $option.text();
      var value = $option.val();
      if (!text || text == "") text = this.defaultText;

      this.$dropdown.html(text);
      this.$options.find("li").removeClass("selected");
      this.$options.find("li[data-value='" + value + "']").addClass("selected");
    }

  , render: function() {
      var self = this;
      self.$control.html("");

      self.$dropdown = $("<a href='#' class='ts-dropdown'></a>");
      self.$popover = $("<div class='ts-popover'></div>");
      self.$options = $("<ul class='ts-options'></ul>");

      self.$el.find("option").each(function() {
        var $option = $(this);

        if ($option.val() !== "") {
          var option = new Option({
            $el: $option,
            control: self
          });

          self.$options.append(option.render());
        }
      });

      self.$popover.append(self.$options);
      self.$control.append(self.$dropdown);
      self.$control.append(self.$popover);

      self.$control.on("click", function(e) {
        e.preventDefault();
        self.toggle();
        return false;
      });

      self.$el.after(self.$control);

      if (self.width == "inherit") {
        self.$control.css("width", self.$el.width());
      } else {
        self.$control.css("width", self.width);
      }

      self.$el.css("display", "none");
    }
  }
  
  $.fn.tidySelect = function(options) {
    return this.each(function() {
      var $this = $(this)
        , data = $this.data('tidySelect');
      if (!data) $this.data('tidySelect', (data = new Control(this, options)));
      if (typeof options == 'string') return data[options].call(data);
    });
  }
}(jQuery, window, document));