/* =====================================================================
 * tidy-multi-select.js v0.0.1
 * http://github.com/dphaener/tidy-multi-select
 * =====================================================================
 * Copyright (c) 2014 Darin Haener
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

  , updateSelected: function() {
      var $select = this.$el.parent();
      $select.trigger("change");
    }

  , value: function() {
      return this.$el.val();
    }

  , checked: function() {
      return this.$el.data("checked")
    }

  , title: function() {
      return this.$el.html();
    }

  , description: function() {
      return this.$el.data("description");
    }

  , render: function() {
      var self = this;
      var checked = typeof(this.checked()) == "undefined" ? "" : "checked";
      var input = "<input class='tms-input' type='checkbox' id='" + this.value() + "' " + checked + "/>";
      var title = "<span class='tms-title'>" + this.title() + "</span>";

      self.$option = $("<li data-value='" + this.value() + "'></li>");
      self.$label = $("<label for='" + this.value() + "'></label>");
      self.$label.append(input);
      self.$label.append(title);

      if (this.description()) {
        self.$label.append("<span class='tms-description'>" + this.description() + "</span>");
      }

      self.$option.append(self.$label[0].outerHTML);

      self.$checkbox = self.$option.find("input");
      self.$label = self.$option.find("label");

      self.$checkbox.on("change", function(e) {
        self.updateSelected();
      });

      return self.$option;
    }
  }

  var Control = function(el, options) {
    var self = this;

    self.$el = $(el);
    self.$control = $("<div class='tms-control'></div>");
    self.$dropdown = self.$control.find(".tms-dropdown");

    self.options = options || {};
    self.defaultText = self.options.defaultText || "Choose an item...";
    self.width = self.options.width || self.$el.data("width") || "auto";
    self.customMultiText = self.options.customMultiText || false;
    if (self.customMultiText) self.multiText = self.options.multiText || "Multiple selected...";
    self.customEvent = self.options.customEvent || "submit";
    self.selectedValues = [];

    self.render();

    $("html").on("click", function() {
      self.$control.removeClass("open");
      if (self.previousValues != self.selectedValues) self.$el.trigger(self.customEvent);
    });

    $("body").on("click", ".tms-control .tms-popover", function(e) {
      e.stopPropagation();
    });

    self.$el.on("change", function() {
      self.update();
    });

    self.$dropdown.on("click", function(e) {
      e.preventDefault();
      self.toggle();
      return false;
    });

    self.update();
    self.previousValues = self.selectedValues;
  }

  Control.prototype = {
    constructor: Control

  , close: function() {
      this.$control.removeClass("open");
      if (this.previousValues != this.selectedValues) this.$el.trigger(this.customEvent);
    }

  , open: function() {
      $(".tms-control").removeClass("open");
      this.$control.addClass("open");
    }

  , toggle: function() {
      this.$control.hasClass("open") ? this.close() : this.open();
    }

  , update: function() {
      var $checked = this.$options.find("input:checked").parents("li");
      console.log(this.$options);
      var selectedValues = [];
      var selectedTexts = [];

      $checked.each(function (i) {
        $el = $(this);
        value = $el.data("value");
        text = $el.find(".tms-title").html();
        selectedValues.push(value);
        selectedTexts.push(text);
      });

      this.previousValues = this.selectedValues;
      this.selectedValues = selectedValues;
      this.$el.data("values", selectedValues);

      var text = selectedTexts.join(", ");

      if (!text || text == "") {
        text = this.defaultText;
      }
      else if (this.customMultiText && selectedValues.length > 1) {
        text = this.multiText;
      }

      this.$dropdown.html(text);
    }

  , reset: function(options) {
      options || (options = []);
      var selected = this.$el.val();
      this.$el.html(""); // remove existing options
      this.$el.append("<option value='' selected='selected'>" + this.defaultText + "</option>");

      for (var i = 0; i < options.length; i++) {
        var option = options[i];
        $optionEl = $("<option></option>");

        if (option.value) {
          $optionEl.val(option.value);
        }
        
        if (option.title) {
          $optionEl.html(option.title);
        }

        if (option.description) {
          $optionEl.data("description", option.description);
        }

        this.$el.append($optionEl);
      }

      this.render();
      this.$el.val(selected);
    }

  , render: function() {
      var self = this;
      self.$control.html("");

      // Inherit class list from the original "select"
      self.$control.attr("class", "tms-control " + self.$el.attr("class"));

      self.$dropdown = $("<a href='#' class='tms-dropdown'></a>");
      self.$popover = $("<div class='tms-popover'></div>");
      self.$options = $("<ul class='tms-options'></ul>");

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

      self.$el.after(self.$control);

      if (self.width == "inherit") {
        self.$control.css("width", self.$el.width());
      } else if (self.width != "auto") {
        self.$control.css("width", self.width);
      }

      self.$el.css("display", "none");
      self.update();
    }
  }
  
  $.fn.tidyMultiSelect = function(options) {
    var args = Array.prototype.slice.call(arguments);

    return this.each(function() {
      var $this = $(this)
        , data = $this.data('tidyMultiSelect');
      if (!data) $this.data('tidyMultiSelect', (data = new Control(this, options)));
      if (typeof options == 'string') {
        return data[options].apply(data, args.slice(1));
      }
    });
  }
}(jQuery, window, document));