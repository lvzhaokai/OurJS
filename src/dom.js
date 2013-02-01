/**
 * @fileOverview DOM 对象补缺及扩展。
 * @author sundongguo@gmail.com
 * @version 20111115
 */

(function() {
  // 内部变量。
  var window = this;
  var document = window.document;
  var html = document.documentElement;

  // 参数分隔符。
  var separator = /\s*,\s*/;

//==================================================[DOM 对象补缺及扩展 - 为 IE6 IE7 提供的解决方案]
  /*
   * 仅为元素扩展新特性，而不是所有的节点类型。
   *
   * 提供屏蔽浏览器差异的，针对元素操作的方法有以下三种方案：
   * 一、静态方法
   *   方式：
   *     提供一组静态方法，将元素以参数（一般是第一个参数）的形式传入并进行处理。
   *   优点：
   *     可以随意为方法命名。
   *     不修改原生对象，可以跨 frame 操作，可与其他脚本库共存。
   *   缺点：
   *     静态方法的调用从字面上看是以方法为主体（先出现），代码冗长，语法不如以目标对象为主体的 . 操作自然。
   *     有时需要使用静态方法，有时又要使用原生方法，缺乏一致性。
   * 二、包装对象
   *   方式：
   *     创建一个对象包装目标元素，在这个包装对象的原型（链）中添加方法。
   *   优点：
   *     语法以目标对象为主体，可以链式调用，语法自然。
   *     可以随意为方法命名。
   *     不修改原生对象，可以跨 frame 操作，可与其他脚本库共存。
   *   缺点：
   *     访问元素的属性时需要使用 getter 和 setter 方法（包装对象没有“属性”的概念），操作元素未被包装的的一些生僻方法或属性时，需要解包，一致性不够好。
   *     由于对包装对象上方法的调用与对原生对象上方法的调用方式是相同的（使用 . 操作符调用），特殊情况下有将原生对象当作包装对象误用的可能。
   *     必须以约定的方式获取元素以便对其包装。
   * 三、原型扩展
   *   方式：
   *     直接在 Element.prototype 上添加方法。对于不支持 Element 构造函数的浏览器（IE6 IE7），将对应特性直接附加在元素上。
   *   优点：
   *     不引入新的对象类型或命名空间，只在已有的对象类型上添加方法，一致性最好。
   *     方法调用时操作主体就是目标元素本身，可以链式调用，语法自然。
   *   缺点：
   *     为方法命名时，不能使用 DOM 元素已有的和将来可能会有的特性名。
   *     修改了原生对象，跨 frame 操作前需要预先修改目标 frame 中的原生对象，不能与其他基于原型扩展的脚本库共存。
   *     必须以约定的方式获取元素以便兼容 IE6 IE7 的扩展方式，另外对 IE6 IE7 的修补方案有性能损耗。
   *
   * 为达到“化繁为简”的目标，这里使用第三种实现方式，以使 API 有最好的一致性和最自然语法。
   * 同时不予提供跨 frame 的操作。实际上跨 frame 操作并不常见，通常也不建议这样做。必须这样做时，应在 frame 内也引入本脚本库。
   * 要处理的元素必须由本脚本库提供的 document.$ 方法来获取，或通过已获取的元素上提供的方法（如 find、getNextSibling 等）来获取。使用其他途径如元素本身的 parentNode 特性来获取的元素，在 IE6 IE7 中将丢失这些附加特性。
   */

//--------------------------------------------------[Element]
  /**
   * 为无 Element 构造函数的浏览器创建 Element 对象，以确保在各浏览器中都可以通过 Element.prototype 为元素扩展新特性。
   * @name Element
   * @namespace
   */
  var Element = window.Element || (window.Element = {prototype: {}});

//--------------------------------------------------[HTMLFormElement]
  /**
   * 为无 HTMLFormElement 构造函数的浏览器创建 HTMLFormElement 对象，以确保在各浏览器中都可以通过 HTMLFormElement.prototype 为表单元素扩展新特性。
   * @name HTMLFormElement
   * @namespace
   */
  var HTMLFormElement = window.HTMLFormElement || (window.HTMLFormElement = {prototype: {}});

//--------------------------------------------------[$ <内部方法>]
  /**
   * 为一个元素扩展新特性，对于无 Element 构造函数的浏览器 (IE6 IE7) 将在该元素上直接附加这些新特性。
   * @name $
   * @function
   * @private
   * @param {Element} element 要扩展的元素，只能传入 Element、document（事件对象的 target 属性）或 null。
   * @returns {Element} 扩展后的元素。
   * @description
   *   注意：不能获取并扩展其他页面的 DOM 元素！
   */
  // 唯一识别码，元素上有 uid 属性表示该元素已被扩展，uid 属性的值将作为该元素的 key 使用。
  var uid = 0;
  var prototypeOfElement = Element.prototype;
  var prototypeOfHTMLFormElement = HTMLFormElement.prototype;
  var $ = navigator.isIElt8 ? function(element) {
    if (element && !element.uid) {
      element.uid = ++uid;
      // Object.mixin(element, prototypeOfElement);
      // 使用以下方式附加新属性以降低开销。此处不必判断 hasOwnProperty，也无需考虑 hasDontEnumBug 的问题。
      var property;
      for (property in prototypeOfElement) {
        element[property] = prototypeOfElement[property];
      }
      switch (element.nodeName) {
        case 'FORM':
          for (property in prototypeOfHTMLFormElement) {
            element[property] = prototypeOfHTMLFormElement[property];
          }
          break;
      }
    }
    return element;
  } : function(element) {
    if (element && !element.uid) {
      element.uid = ++uid;
    }
    return element;
  };

//==================================================[DOM 补缺]
  /*
   * 为不支持某些特性的浏览器添加这些特性。
   *
   * 补缺属性：
   *   document.head
   *   HTMLElement.prototype.outerHTML
   *   HTMLElement.prototype.innerText
   *   HTMLElement.prototype.outerText
   *
   * 补缺方法：
   *   HTMLElement.prototype.insertAdjacentText
   *   HTMLElement.prototype.insertAdjacentElement
   *   Element.prototype.compareDocumentPosition
   *   Element.prototype.contains
   */

//--------------------------------------------------[document.head]
  // 为 IE6 IE7 IE8 添加 document.head 属性。
  /**
   * 获取文档的 HEAD 元素。
   * @name head
   * @memberOf document
   * @type Element
   * @description
   *   与 document.documentElement 和 document.body 的作用一样，document.head 是获取文档的 HEAD 元素的快捷方式。
   * @example
   *   document.documentElement === document.getElementsByTagName('html')[0];
   *   // true
   *   document.head === document.getElementsByTagName('head')[0];
   *   // true
   *   document.body === document.getElementsByTagName('body')[0];
   *   // true
   */
  if (!document.head) {
    document.head = html.firstChild;
  }

//--------------------------------------------------[HTMLElement.prototype.outerHTML]
  // 为 Firefox 添加 HTMLElement.prototype.outerHTML 属性。
  // Firefox 11.0 开始支持 outerHTML 了。
  /*
   * 获取/设置本元素（包含后代节点在内）的序列化字符串。
   * @name Element.prototype.outerHTML
   * @type string
   * @description
   *   注意：getter 在处理空标签及特殊字符时，各浏览器的行为不一致。
   */
//  if (!('outerHTML' in html)) {
//    var emptyElementPattern = /^(area|base|br|col|embed|hr|img|input|link|meta|param|command|keygen|source|track|wbr)$/;
//    var isEmptyElement = function(nodeName) {
//      return emptyElementPattern.test(nodeName);
//    };
//
//    HTMLElement.prototype.__defineGetter__('outerHTML', function() {
//      var nodeName = this.nodeName.toLowerCase();
//      var html = '<' + nodeName;
//      var attributes = this.attributes;
//      var attribute;
//      var i = 0;
//      while (attribute = attributes[i++]) {
//        if (attribute.specified) {
//          html += ' ' + attribute.name + '="' + attribute.value + '"';
//        }
//        i++;
//      }
//      if (isEmptyElement(nodeName)) {
//        html += '>';
//      } else {
//        html += '>' + this.innerHTML + '</' + nodeName + '>';
//      }
//      return html;
//    });
//    HTMLElement.prototype.__defineSetter__('outerHTML', function(html) {
//      var range = document.createRange();
//      range.setStartBefore(this);
//      this.parentNode.replaceChild(range.createContextualFragment(html), this);
//      return html;
//    });
//  }

//--------------------------------------------------[HTMLElement.prototype.innerText]
  // 为 Firefox 添加 HTMLElement.prototype.innerText 属性。
  /**
   * 获取/设置本元素内的文本信息。
   * @name Element.prototype.innerText
   * @type string
   * @description
   *   注意：getter 在处理 BR 元素或换行符时，各浏览器的行为不一致。
   */
  if (!('innerText' in html)) {
    HTMLElement.prototype.__defineGetter__('innerText', function() {
      return this.textContent;
    });
    HTMLElement.prototype.__defineSetter__('innerText', function(text) {
      this.textContent = text;
      return text;
    });
  }

//--------------------------------------------------[HTMLElement.prototype.outerText]
  // 为 Firefox 添加 HTMLElement.prototype.outerText 属性。
  /**
   * 获取本元素内的文本信息，或使用文本信息替换本元素。
   * @name Element.prototype.outerText
   * @type string
   * @description
   *   与 innerText 不同，如果设置一个元素的 outerText，那么设置的字符串将作为文本节点替换本元素在文档树中的位置。
   *   注意：getter 在处理 BR 元素或换行符时，各浏览器的行为不一致。
   */
  if (!('outerText' in html)) {
    HTMLElement.prototype.__defineGetter__('outerText', function() {
      return this.textContent;
    });
    HTMLElement.prototype.__defineSetter__('outerText', function(text) {
      var textNode = document.createTextNode(text);
      this.parentNode.replaceChild(textNode, this);
      return text;
    });
  }

//--------------------------------------------------[HTMLElement.prototype.insertAdjacentText]
  // 为 Firefox 添加 HTMLElement.prototype.insertAdjacentText 属性。
  /**
   * 在本元素的指定位置插入文本。
   * @name Element.prototype.insertAdjacentText
   * @function
   * @param {string} position 要插入的位置，可选值请参考下表。
   *   <table>
   *     <tr><th>可选值</th><th>含义</th></tr>
   *     <tr><td><dfn>beforeBegin</dfn></td><td>将文本插入到本元素之前。</td></tr>
   *     <tr><td><dfn>afterBegin</dfn></td><td>将文本插入到本元素的第一个子元素之前。</td></tr>
   *     <tr><td><dfn>beforeEnd</dfn></td><td>将文本插入到本元素的最后一个子元素之后。</td></tr>
   *     <tr><td><dfn>afterEnd</dfn></td><td>将文本插入到本元素之后。</td></tr>
   *   </table>
   * @param {Element} text 文本。
   */
  if (!('insertAdjacentText' in html)) {
    HTMLElement.prototype.insertAdjacentText = function(position, text) {
      switch (position.toLowerCase()) {
        case 'beforebegin':
        case 'afterbegin':
        case 'beforeend':
        case 'afterend':
          this.insertAdjacentElement(position, document.createTextNode(text));
          break;
        default:
          throw new Error('Invalid position "' + position + '"');
      }
    };
  }

//--------------------------------------------------[HTMLElement.prototype.insertAdjacentElement]
  // 为 Firefox 添加 HTMLElement.prototype.insertAdjacentElement 属性。
  /**
   * 在本元素的指定位置插入目标元素。
   * @name Element.prototype.insertAdjacentElement
   * @function
   * @param {string} position 要插入的位置，可选值请参考下表。
   *   <table>
   *     <tr><th>可选值</th><th>含义</th></tr>
   *     <tr><td><dfn>beforeBegin</dfn></td><td>将目标元素插入到本元素之前。</td></tr>
   *     <tr><td><dfn>afterBegin</dfn></td><td>将目标元素插入到本元素的第一个子元素之前。</td></tr>
   *     <tr><td><dfn>beforeEnd</dfn></td><td>将目标元素插入到本元素的最后一个子元素之后。</td></tr>
   *     <tr><td><dfn>afterEnd</dfn></td><td>将目标元素插入到本元素之后。</td></tr>
   *   </table>
   * @param {Element} target 目标元素。
   * @returns {Element} 目标元素。
   */
  if (!('insertAdjacentElement' in html)) {
    HTMLElement.prototype.insertAdjacentElement = function(position, target) {
      var parent;
      switch (position.toLowerCase()) {
        case 'beforebegin':
          if (parent = this.parentNode) {
            parent.insertBefore(target, this);
          }
          break;
        case 'afterbegin':
          this.insertBefore(target, this.firstChild);
          break;
        case 'beforeend':
          this.appendChild(target);
          break;
        case 'afterend':
          if (parent = this.parentNode) {
            parent.insertBefore(target, this.nextSibling);
          }
          break;
        default:
          throw new Error('Invalid position "' + position + '"');
      }
      return target;
    };
  }

//--------------------------------------------------[Element.prototype.compareDocumentPosition]
  // 为 IE6 IE7 IE8 添加 Element.prototype.compareDocumentPosition 方法。
  /**
   * 比较本元素和目标元素在文档树中的位置关系。
   * @name Element.prototype.compareDocumentPosition
   * @function
   * @param {Element} target 目标元素。
   * @returns {number} 比较结果。
   * @description
   *   调用本方法后返回的 number 值的含义：
   *   <table>
   *     <tr><th>Bits</th><th>Number</th><th>Meaning</th></tr>
   *     <tr><td>000000</td><td>0</td><td>节点 A 与节点 B 相等</td></tr>
   *     <tr><td>000001</td><td>1</td><td>节点 A 与节点 B 在不同的文档（或者一个在文档之外）</td></tr>
   *     <tr><td>000010</td><td>2</td><td>节点 B 在节点 A 之前</td></tr>
   *     <tr><td>000100</td><td>4</td><td>节点 A 在节点 B 之前</td></tr>
   *     <tr><td>001000</td><td>8</td><td>节点 B 包含节点 A</td></tr>
   *     <tr><td>010000</td><td>16</td><td>节点 A 包含节点 B</td></tr>
   *     <tr><td>100000</td><td>32</td><td>浏览器的私有使用</td></tr>
   *   </table>
   * @see http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition
   * @see http://ejohn.org/blog/comparing-document-position/
   */
  if (!('compareDocumentPosition' in html)) {
    Element.prototype.compareDocumentPosition = function(target) {
      return (this !== target && this.contains(target) && 16) +
          (this !== target && target.contains(this) && 8) +
          (this.sourceIndex >= 0 && target.sourceIndex >= 0 ?
              (this.sourceIndex < target.sourceIndex && 4) + (this.sourceIndex > target.sourceIndex && 2) :
              1) +
          0;
    };
  }

//--------------------------------------------------[Element.prototype.contains]
  // 现在都支持此方法。
  /**
   * 判断本元素是否包含目标元素。
   * @name Element.prototype.contains
   * @function
   * @param {Element} target 目标元素。
   * @returns {boolean} 判断结果。
   * @description
   *   注意，如果本元素和目标元素一致，本方法也将返回 true。
   */
//  if (!('contains' in html)) {
//    Element.prototype.contains = function(target) {
//      return (this === target || !!(this.compareDocumentPosition(target) & 16));
//    };
//  }

//==================================================[DOM 扩展 - 处理类]
  /*
   * 针对元素的类的操作。
   *
   * 扩展方法：
   *   Element.prototype.hasClass
   *   Element.prototype.addClass
   *   Element.prototype.removeClass
   *   Element.prototype.toggleClass
   */

//--------------------------------------------------[Element.prototype.hasClass]
  /**
   * 检查本元素是否有指定的类名。
   * @name Element.prototype.hasClass
   * @function
   * @param {string} className 类名，如果要同时指定多个类名，使用逗号将它们分开即可。
   * @returns {boolean} 检查结果。
   */
  Element.prototype.hasClass = function(className) {
    var elementClassName = ' ' + this.className.clean() + ' ';
    return className.split(separator).every(function(className) {
      return elementClassName.contains(' ' + className.trim() + ' ');
    });
  };

//--------------------------------------------------[Element.prototype.addClass]
  /**
   * 为本元素添加指定的类名。
   * @name Element.prototype.addClass
   * @function
   * @param {string} className 类名，如果要同时指定多个类名，使用逗号将它们分开即可。
   * @returns {Element} 本元素。
   */
  Element.prototype.addClass = function(className) {
    var $element = this;
    className.split(separator).forEach(function(className) {
      if (!$element.hasClass(className)) {
        $element.className = ($element.className + ' ' + className).clean();
      }
    });
    return $element;
  };

//--------------------------------------------------[Element.prototype.removeClass]
  /**
   * 为本元素删除指定的类名。
   * @name Element.prototype.removeClass
   * @function
   * @param {string} className 类名，如果要同时指定多个类名，使用逗号将它们分开即可。
   * @returns {Element} 本元素。
   */
  Element.prototype.removeClass = function(className) {
    var $element = this;
    var elementClassName = ' ' + $element.className.clean() + ' ';
    className.split(separator).forEach(function(className) {
      elementClassName = elementClassName.replace(' ' + className.trim() + ' ', ' ');
    });
    $element.className = elementClassName.trim();
    return $element;
  };

//--------------------------------------------------[Element.prototype.toggleClass]
  /**
   * 如果本元素没有指定的类名，则添加指定的类名，否则删除指定的类名。
   * @name Element.prototype.toggleClass
   * @function
   * @param {string} className 类名，如果要同时指定多个类名，使用逗号将它们分开即可。
   * @returns {Element} 本元素。
   */
  Element.prototype.toggleClass = function(className) {
    var $element = this;
    className.split(separator).forEach(function(className) {
      $element[$element.hasClass(className) ? 'removeClass' : 'addClass'](className);
    });
    return $element;
  };

//==================================================[DOM 扩展 - 处理样式]
  /*
   * 获取/修改元素的样式。
   *
   * 扩展方法：
   *   Element.prototype.getStyle
   *   Element.prototype.getStyles
   *   Element.prototype.setStyle
   *   Element.prototype.setStyles
   */

  // 单位为数字时不自动添加 'px' 的 CSS 特性。
  var numericValues = {
    fillOpacity: true,
    fontWeight: true,
    lineHeight: true,
    opacity: true,
    orphans: true,
    widows: true,
    zIndex: true,
    zoom: true
  };

  // 获取特殊 CSS 特性的值，只有 IE6 IE7 IE8 需要。
  var specialCSSPropertyGetter = {
    'float': function($element) {
      return $element.currentStyle.styleFloat;
    },
    'opacity': function($element) {
      return $element.filters['alpha'] ? String($element.filters['alpha'].opacity / 100) : '1';
    }
  };

  // 设置特殊 CSS 特性的值。
  var specialCSSPropertySetter = 'getComputedStyle' in window ? {
    'float': function($element, propertyValue) {
      $element.style.cssFloat = propertyValue;
    }
  } : {
    'float': function($element, propertyValue) {
      $element.style.styleFloat = propertyValue;
    },
    'opacity': function($element, propertyValue) {
      if ($element.filters.alpha) {
        // 这样更直接，缺点是不会更改 style.filter 或 style.cssText 中的文字。
        $element.filters.alpha.opacity = propertyValue * 100;
      } else {
        if ($element.style.filter) {
          // 可以不加空格。
          $element.style.filter += ' ';
        }
        $element.style.filter += 'alpha(opacity=' + (propertyValue * 100) + ')';
      }
    }
  };

//--------------------------------------------------[Element.prototype.getStyle]
  /**
   * 获取本元素的“计算后的样式”中某个特性的值。
   * @name Element.prototype.getStyle
   * @function
   * @param {string} propertyName 特性名（不支持复合特性），应使用 camel case 格式。
   * @returns {string} 对应的特性值，如果获取的是长度值，其单位未必是 px，可能是其定义时的单位。
   * @description
   *   注意：不要尝试获取未插入文档树的元素的“计算后的样式”，它们存在兼容性问题。
   */
  Element.prototype.getStyle = 'getComputedStyle' in window ? function(propertyName) {
    return window.getComputedStyle(this, null).getPropertyValue(propertyName.dasherize()) || '';
  } : function(propertyName) {
    var getSpecialCSSProperty = specialCSSPropertyGetter[propertyName];
    return (getSpecialCSSProperty ? getSpecialCSSProperty(this) : this.currentStyle[propertyName]) || '';
  };

//--------------------------------------------------[Element.prototype.getStyles]
  /**
   * 获取本元素的“计算后的样式”中一组特性的值。
   * @name Element.prototype.getStyles
   * @function
   * @param {Array} propertyNames 指定要获取的特性名，可以为任意个。
   * @returns {Object} 包含一组特性值的，格式为 {propertyName: propertyValue, ...} 的对象。
   */
  Element.prototype.getStyles = function(propertyNames) {
    var element = this;
    var styles = {};
    propertyNames.forEach(function(propertyName) {
      styles[propertyName] = element.getStyle(propertyName);
    });
    return styles;
  };

//--------------------------------------------------[Element.prototype.setStyle]
  /**
   * 为本元素设置一条行内样式声明。
   * @name Element.prototype.setStyle
   * @function
   * @param {string} propertyName 特性名（支持复合特性），应使用 camel case 格式。
   * @param {number|string} propertyValue 特性值，若为数字，则为期望长度单位的特性值自动添加长度单位 'px'。
   * @returns {Element} 本元素。
   * @description
   *   注意：如果设置的是长度值，若长度单位不是 'px' 则不能省略长度单位。
   */
  Element.prototype.setStyle = function(propertyName, propertyValue) {
    if (Number.isFinite(propertyValue) && !numericValues[propertyName]) {
      propertyValue = Math.floor(propertyValue) + 'px';
    }
    var setSpecialCSSProperty = specialCSSPropertySetter[propertyName];
    if (setSpecialCSSProperty) {
      setSpecialCSSProperty(this, propertyValue);
    } else {
      this.style[propertyName] = propertyValue;
    }
    return this;
  };

//--------------------------------------------------[Element.prototype.setStyles]
  /**
   * 为本元素设置一组行内样式声明。
   * @name Element.prototype.setStyles
   * @function
   * @param {Object} declarations 包含一条或多条要设置的样式声明，格式为 {propertyName: propertyValue, ...} 的对象。
   * @returns {Element} 本元素。
   */
  Element.prototype.setStyles = function(declarations) {
    for (var propertyName in declarations) {
      this.setStyle(propertyName, declarations[propertyName]);
    }
    return this;
  };

//==================================================[DOM 扩展 - 处理自定义数据]
  /*
   * 获取/添加/删除元素的自定义数据。
   *
   * 扩展方法：
   *   Element.prototype.getData
   *   Element.prototype.setData
   *   Element.prototype.removeData
   */

  var validNamePattern = /^[a-z][a-zA-Z]*$/;
  var parseDataKey = function(key) {
    return validNamePattern.test(key) ? 'data-' + key.dasherize() : '';
  };

//--------------------------------------------------[Element.prototype.getData]
  /**
   * 从本元素中读取一条自定义数据。
   * @name Element.prototype.getData
   * @function
   * @param {string} key 数据名。
   * @returns {string} 数据值。
   *   如果指定的数据名不存在，返回 undefined。
   * @see http://www.w3.org/TR/html5/global-attributes.html#embedding-custom-non-visible-data-with-the-data-attributes
   */
  Element.prototype.getData = 'dataset' in html ? function(key) {
    return this.dataset[key];
  } : function(key) {
    key = parseDataKey(key);
    var value = this.getAttribute(key);
    return typeof value === 'string' ? value : undefined;
  };

//--------------------------------------------------[Element.prototype.setData]
  /**
   * 向本元素中保存一条自定义数据。
   * @name Element.prototype.setData
   * @function
   * @param {string} key 数据名，必须为 camel case 形式，并且只能包含英文字母。
   * @param {string} value 数据值，必须为字符串。
   * @returns {Element} 本元素。
   */
  Element.prototype.setData = function(key, value) {
    key = parseDataKey(key);
    if (key) {
      this.setAttribute(key, value);
    }
    return this;
  };

//--------------------------------------------------[Element.prototype.removeData]
  /**
   * 从本元素中删除一条自定义数据。
   * @name Element.prototype.removeData
   * @function
   * @param {string} key 数据名。
   * @returns {Element} 本元素。
   * @description
   *   注意：IE6 IE7 在 removeAttribute 时，key 参数是大小写敏感的。
   */
  Element.prototype.removeData = function(key) {
    key = parseDataKey(key);
    if (key) {
      this.removeAttribute(key);
    }
    return this;
  };

//==================================================[DOM 扩展 - 获取坐标信息]
  /*
   * 获取元素在视口中的坐标信息。
   *
   * 扩展方法：
   *   Element.prototype.getClientRect
   */

//--------------------------------------------------[Element.prototype.getClientRect]
  /*
   * [2009 年的测试结果 (body's direction = ltr)]
   * 测试浏览器：IE6 IE7 IE8 FF3 Safari4 Chrome2 Opera9。
   *
   * 浏览器        compatMode  [+html.border,+body.border]  [+html.border,-body.border]  [-html.border,+body.border]  [-html.border,-body.border]
   * IE6 IE7 IE8  BackCompat        +body.clientLeft             +body.clientLeft             +body.clientLeft             +body.clientLeft
   * Others       BackCompat              准确
   * IE6 IE7      CSS1Compat        +html.clientLeft             +html.clientLeft             +html.clientLeft             +html.clientLeft
   * Others       CSS1Compat              准确
   *
   * 根据上表可知，只有 IE8 以下会出现问题。
   * 混杂模式下，IE6 IE7 IE8 减去 body.clientLeft 的值即可得到准确结果。
   * body.clientLeft 的值取决于 BODY 的 border 属性，如果未设置 BODY 的 border 属性，则 BODY 会继承 HTML 的 border 属性。如果 HTML 的 border 也未设置，则 HTML 的 border 默认值为 medium，计算出来是 2px。
   * 标准模式下，IE6 IE7 减去 html.clientLeft 的值即可得到准确结果。
   * html.clientLeft 在 IE6 中取决于 HTML 的 border 属性，而在 IE7 中的值则始终为 2px。
   *
   * [特殊情况]
   * IE7(IE9 模拟) 的 BODY 的计算样式 direction: rtl 时，如果 HTML 设置了边框，则横向坐标获取仍不准确。由于极少出现这种情况，此处未作处理。
   */
  /**
   * 获取本元素的 border-box 在视口中的坐标信息。
   * @name Element.prototype.getClientRect
   * @function
   * @returns {Object} 包含位置（left、right、top、bottom）及尺寸（width、height）的对象，所有属性值均为 number 类型，单位为像素。
   */
  Element.prototype.getClientRect = navigator.isIElt8 ? function() {
    var clientRect = this.getBoundingClientRect();
    var left = clientRect.left - html.clientLeft;
    var top = clientRect.top - html.clientTop;
    var width = this.offsetWidth;
    var height = this.offsetHeight;
    return {
      left: left,
      right: left + width,
      top: top,
      bottom: top + height,
      width: width,
      height: height
    };
  } : function() {
    var clientRect = this.getBoundingClientRect();
    if ('width' in clientRect) {
      return clientRect;
    } else {
      return {
        left: clientRect.left,
        right: clientRect.right,
        top: clientRect.top,
        bottom: clientRect.bottom,
        width: this.offsetWidth,
        height: this.offsetHeight
      };
    }
  };

//==================================================[DOM 扩展 - 获取相关元素]
  /*
   * 获取相关的元素。
   *
   * 扩展方法：
   *   Element.prototype.getParent
   *   Element.prototype.getPreviousSibling
   *   Element.prototype.getNextSibling
   *   Element.prototype.getFirstChild
   *   Element.prototype.getLastChild
   *   Element.prototype.getChildren
   *   Element.prototype.getChildCount
   *
   * 参考：
   *   http://www.w3.org/TR/ElementTraversal/#interface-elementTraversal
   *   http://www.quirksmode.org/dom/w3c_core.html
   *   http://w3help.org/zh-cn/causes/SD9003
   */

//--------------------------------------------------[Element.prototype.getParent]
  /**
   * 获取本元素的父元素。
   * @name Element.prototype.getParent
   * @function
   * @returns {Element} 本元素的父元素。
   */
  Element.prototype.getParent = 'parentElement' in html ? function() {
    return $(this.parentElement);
  } : function() {
    var element = this.parentNode;
    // parentNode 可能是 DOCUMENT_NODE(9) 或 DOCUMENT_FRAGMENT_NODE(11)。
    if (element.nodeType !== 1) {
      element = null;
    }
    return $(element);
  };

//--------------------------------------------------[Element.prototype.getPreviousSibling]
  /**
   * 获取与本元素相邻的上一个元素。
   * @name Element.prototype.getPreviousSibling
   * @function
   * @returns {Element} 与本元素相邻的上一个元素。
   */
  Element.prototype.getPreviousSibling = 'previousElementSibling' in html ? function() {
    return $(this.previousElementSibling);
  } : function() {
    var element = this;
    while ((element = element.previousSibling) && element.nodeType !== 1) {
    }
    return $(element);
  };

//--------------------------------------------------[Element.prototype.getNextSibling]
  /**
   * 获取与本元素相邻的下一个元素。
   * @name Element.prototype.getNextSibling
   * @function
   * @returns {Element} 与本元素相邻的下一个元素。
   */
  Element.prototype.getNextSibling = 'nextElementSibling' in html ? function() {
    return $(this.nextElementSibling);
  } : function() {
    var element = this;
    while ((element = element.nextSibling) && element.nodeType !== 1) {
    }
    return $(element);
  };

//--------------------------------------------------[Element.prototype.getFirstChild]
  /**
   * 获取本元素的第一个子元素。
   * @name Element.prototype.getFirstChild
   * @function
   * @returns {Element} 本元素的第一个子元素。
   */
  Element.prototype.getFirstChild = 'firstElementChild' in html ? function() {
    return $(this.firstElementChild);
  } : function() {
    var element = this.firstChild;
    while (element && element.nodeType !== 1 && (element = element.nextSibling)) {
    }
    return $(element);
  };

//--------------------------------------------------[Element.prototype.getLastChild]
  /**
   * 获取本元素的最后一个子元素。
   * @name Element.prototype.getLastChild
   * @function
   * @returns {Element} 本元素的最后一个子元素。
   */
  Element.prototype.getLastChild = 'lastElementChild' in html ? function() {
    return $(this.lastElementChild);
  } : function() {
    var element = this.lastChild;
    while (element && element.nodeType !== 1 && (element = element.previousSibling)) {
    }
    return $(element);
  };

//--------------------------------------------------[Element.prototype.getChildren]
  /**
   * 获取本元素的所有子元素。
   * @name Element.prototype.getChildren
   * @function
   * @returns {Array} 包含本元素的所有子元素的数组，数组内各元素的顺序为调用本方法时各元素在文档树中的顺序。
   */
  Element.prototype.getChildren = function() {
    var children = [];
    var $element = this.getFirstChild();
    while ($element) {
      children.push($element);
      $element = $element.getNextSibling();
    }
    return children;
  };

//--------------------------------------------------[Element.prototype.getChildCount]
  /**
   * 获取本元素的子元素的总数。
   * @name Element.prototype.getChildCount
   * @function
   * @returns {number} 本元素的子元素的总数。
   */
  Element.prototype.getChildCount = 'childElementCount' in html ? function() {
    return this.childElementCount;
  } : function() {
    var count = 0;
    var node = this.firstChild;
    while (node) {
      if (node.nodeType === 1) {
        count++;
      }
      node = node.nextSibling;
    }
    return count;
  };

//==================================================[DOM 扩展 - 克隆元素]
  /*
   * 克隆本元素。
   *
   * 扩展方法：
   *   Element.prototype.clone
   */

//--------------------------------------------------[Element.prototype.clone]
  /**
   * 克隆本元素。
   * @name Element.prototype.clone
   * @function
   * @param {boolean} [recursively] 是否进行深克隆。
   * @param {boolean} [keepListeners] 是否保留本元素及后代元素上的所有事件监听器。
   * @returns {Element} 克隆后的元素。
   * @description
   *   如果本元素有 id 属性，需注意克隆元素的 id 属性将与之有相同的值，必要时应进一步处理。
   *   不要克隆包含脚本的元素，以免出现兼容性问题。
   *   不要克隆包含样式表的元素，以免最终样式不符合预期。
   * @see http://jquery.com/
   * @see http://mootools.net/
   * @see http://w3help.org/zh-cn/causes/SD9029
   */
  Element.prototype.clone = function(recursively, keepListeners) {
    var clonedElement = this.cloneNode(recursively);
    var originalElements = [this];
    var clonedElements = [clonedElement];
    if (recursively) {
      originalElements = originalElements.concat(Array.from(this.getElementsByTagName('*')));
      clonedElements = clonedElements.concat(Array.from(clonedElement.getElementsByTagName('*')));
    }
    originalElements.forEach(function(original, index) {
      var cloned = clonedElements[index];
      // http://bugs.jquery.com/ticket/9587
      if (cloned) {
        // 在 IE6 IE7 IE8 中使用 cloneNode 克隆的节点，会将本元素上使用 attachEvent 添加的事件监听器也一并克隆。
        // 并且在克隆元素上调用 detachEvent 删除这些监听器时，本元素上的监听器也将被一并删除。
        // 使用以下方法为 IE6 IE7 IE8 清除已添加的事件监听器，并清除可能存在的 uid 属性。
        if (navigator.isIElt9) {
          cloned.clearAttributes();
          cloned.mergeAttributes(original);
          cloned.removeAttribute('uid');
        }
        // 针对特定元素的处理。
        switch (cloned.nodeName) {
          case 'OBJECT':
            // IE6 IE7 IE8 无法克隆使用 classid 来标识内容类型的 OBJECT 元素的子元素。IE9 还有另外的问题：
            // http://bugs.jquery.com/ticket/10324
            cloned.outerHTML = original.outerHTML;
            break;
          case 'INPUT':
          case 'TEXTAREA':
            // 一些表单元素的状态可能未被正确克隆，克隆的表单元素将以这些元素的默认状态为当前状态。
            if (cloned.type === 'radio' || cloned.type === 'checkbox') {
              cloned.checked = cloned.defaultChecked = original.defaultChecked;
            }
            cloned.value = cloned.defaultValue = original.defaultValue;
            break;
          case 'OPTION':
            cloned.selected = cloned.defaultSelected = original.defaultSelected;
            break;
        }
        // 处理事件。
        if (keepListeners) {
          var item = eventPool[original.uid];
          if (item) {
            var $cloned = $(cloned);
            Object.forEach(item, function(handlers) {
              handlers.forEach(function(handler) {
                $cloned.on(handler.name, handler.listener);
              });
            });
          }
        }
      }
    });
    return $(clonedElement);
  };

//==================================================[DOM 扩展 - 修改位置或内容]
  /*
   * 修改元素的位置或内容。
   *
   * 扩展方法：
   *   Element.prototype.insertTo
   *   Element.prototype.replace
   *   Element.prototype.remove
   *   Element.prototype.empty
   */

//--------------------------------------------------[Element.prototype.insertTo]
  /**
   * 将本元素插入到目标元素的指定位置。
   * @name Element.prototype.insertTo
   * @function
   * @param {Element} target 目标元素。
   * @param {string} [position] 要插入的位置，可选值请参考下表。
   *   <table>
   *     <tr><th>可选值</th><th>含义</th></tr>
   *     <tr><td><dfn>before</dfn></td><td>将本元素插入到目标元素之前。</td></tr>
   *     <tr><td><dfn>top</dfn></td><td>将本元素插入到目标元素的第一个子元素之前。</td></tr>
   *     <tr><td><dfn>bottom</dfn></td><td>将本元素插入到目标元素的最后一个子元素之后。</td></tr>
   *     <tr><td><dfn>after</dfn></td><td>将本元素插入到目标元素之后。</td></tr>
   *   </table>
   *   如果该参数被省略，则使用 <dfn>bottom</dfn> 作为默认值。
   * @returns {Element} 本元素。
   */
  Element.prototype.insertTo = function(target, position) {
    position = position || 'bottom';
    switch (position.toLowerCase()) {
      case 'before':
        position = 'beforebegin';
        break;
      case 'top':
        position = 'afterbegin';
        break;
      case 'bottom':
        position = 'beforeend';
        break;
      case 'after':
        position = 'afterend';
        break;
      default:
        throw new Error('Invalid position "' + position + '"');
    }
    return target.insertAdjacentElement(position, this);
  };

//--------------------------------------------------[Element.prototype.swap]
  /**
   * 交换本元素目标元素的位置。
   * @name Element.prototype.swap
   * @function
   * @param {Element} target 目标元素。
   * @returns {Element} 本元素。
   */
  Element.prototype.swap = 'swapNode' in html ? function(target) {
    return this.swapNode(target);
  } : function(target) {
    var targetParent = target.parentNode;
    var thisParent = this.parentNode;
    var thisNextSibling = this.nextSibling;
    if (targetParent) {
      targetParent.replaceChild(this, target);
    } else {
      this.remove(true);
    }
    if (thisParent) {
      thisParent.insertBefore(target, thisNextSibling);
    }
    return this;
  };

//--------------------------------------------------[Element.prototype.replace]
  /**
   * 使用本元素替换目标元素。
   * @name Element.prototype.replace
   * @function
   * @param {Element} target 目标元素。
   * @param {boolean} [keepListeners] 是否保留目标元素及后代元素上的所有事件监听器。
   * @returns {Element} 本元素。
   */
  Element.prototype.replace = function(target, keepListeners) {
    var $target = $(target);
    var $parent = $target.getParent();
    if ($parent) {
      if (!keepListeners) {
        Array.from(removeAllListeners($target).getElementsByTagName('*')).forEach(removeAllListeners);
      }
      $parent.replaceChild(this, $target);
    }
    return this;
  };

//--------------------------------------------------[Element.prototype.remove]
  /**
   * 将本元素从文档树中删除。
   * @name Element.prototype.remove
   * @function
   * @param {boolean} [keepListeners] 是否保留本元素及后代元素上的所有事件监听器。
   * @returns {Element} 本元素。
   */
  Element.prototype.remove = function(keepListeners) {
    var $parent = this.getParent();
    if ($parent) {
      if (!keepListeners) {
        Array.from(removeAllListeners(this).getElementsByTagName('*')).forEach(removeAllListeners);
      }
      $parent.removeChild(this);
    }
    return this;
  };

//--------------------------------------------------[Element.prototype.empty]
  /**
   * 将本元素的内容清空，并删除本元素及后代元素上的所有事件监听器。
   * @name Element.prototype.empty
   * @function
   * @returns {Element} 本元素。
   */
  Element.prototype.empty = function() {
    Array.from(this.getElementsByTagName('*')).forEach(removeAllListeners);
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }
    return this;
  };

//==================================================[DOM 扩展 - 处理事件]
  /*
   * 事件的兼容性处理。
   *
   * 这里提供了一套完整的事件模型，其中相关名词的简称与解释如下：
   *   原生事件对象 (e)：
   *     原生的 DOM 事件对象。
   *   事件对象 (event)：
   *     本事件模型提供的对象，包含与此事件有关的信息，是 Event 的实例。
   *     大多数内置事件的 event 都是对 e 的封装（不直接扩展 e 是因为 e 的一些属性是只读的），可以通过访问 event.originalEvent 得到 e。
   *     自定义事件和少数内置事件产生的 event 不是对 e 的封装，也有一些特殊类型的事件并不产生 event。
   *   派发 (dispatch)：
   *     使用指定的类型和参数创建事件对象，并使其在 DOM 树中传播。
   *   触发器 (trigger)：
   *     作为原生事件的监听器存在的一个或多个函数，在确定一个事件发生时，触发器会调用 fire 方法派发并在相应的节点上分发 event。
   *   分发器 (distributor)：
   *     作为原生事件的监听器存在的一个函数，在确定一个事件发生时，分发器会在其所属的节点上创建并分发 event。
   *   监听器 (listener)：
   *     监听事件的函数，有普通和代理两种类型，在对应的 event 分发到 listener 时被调用，并传入这个 event 作为其唯一的参数。
   *     在 listener 中可以调用 event 的方法来阻止其继续传播，或取消其默认行为。
   *     如果一个 listener 返回了 false，则该 event 将停止传播并取消默认行为。
   *   事件名称 (name)：
   *     由 type、可选的 label 和 selector 组成的、描述特定的事件的字符串。
   *   事件类型 (type)：
   *     事件的类型，分为“内置”和“自定义”两种。
   *   事件标签 (labal)：
   *     用于标记事件的不同应用场景。
   *     当使用 on 方法为同一个类型的事件添加多个 listener 时，可以通过指定不同的 label 来将标记这类事件各自的应用场景，以便使用 off 方法时能够明确的删除该场景下的 listener 而不会误删其它的 listener。
   *   代理元素选择符 (selector)：
   *     通过在 name 中加入 :relay(selector) 来指定为符合条件的后代元素代理事件监听。
   *     指定了代理元素选择符的 listener 即代理 listener。
   *
   * 本事件模型提供了两种模式来派发与分发事件对象：
   *   “独立”模式
   *     将 trigger 作为原生事件的监听器添加到某个节点，当确定事件发生时，trigger 会调用 fire 方法派发并在相应的节点上分发 event。
   *     这种情况下，event 将使用本模型提供的传播机制在 DOM 树中传播（不依赖任何 e），并且 event 会自动分发给相应的 listener。
   *     在本次事件的生命周期内，只会有一个 event 被创建。
   *     不使用原生事件模型是因为 IE6 IE7 IE8 通过 document.createEventObject 方法创建的 e 无法执行默认行为，也不能通过 e 来传递自定义参数属性。另外 window 对象也没有提供 fireEvent 方法。
   *     要避免以上问题，现阶段较好的方式是不使用原生事件模型。
   *   “协同”模式
   *     将 distributor 作为原生事件的监听器添加到某个节点，当确定事件发生时，distributor 会自动在其所属的节点上根据 e 来创建并分发 event。
   *     这种 event 不会在 DOM 树中传播，真正传播的是 e，但 event 的一些方法中有对 e 的相应方法的引用，因此调用这些方法时也会影响 e 的行为。
   *     在本次事件的生命周期内，可能会有多个 event 被创建，每个 event 只在创建它的节点上被重用。
   *     这样处理是因为 IE6 IE7 IE8 中，原生事件模型分发给每个监听器的 e 都是不同的，因此无法实现封装一次多处调用。
   *     其他浏览器虽然没有上述问题，但为了保持一致并简化代码逻辑，也不做处理。事实上同一事件被不同节点监听的情况相对来说并不常见。
   *   两种模式的流程：
   *     “独立”模式 = trigger 调用 fire 方法派发 event -> event 传播到相应的节点后自动调用 distributeEvent 分发事件 -> 根据情况调用相应的 listener
   *     “协同”模式 = 浏览器派发 e -> e 传播到相应的节点 -> 分发器 distributor 根据 e 创建 event 后调用 distributeEvent 分发事件 -> 根据情况调用相应的 listener
   *   两种模式的应用场景：
   *     1. 自定义事件使用“独立”模式来处理。
   *     2. 对于没有明显兼容性问题（只考虑 e 的冒泡阶段）的内置事件，使用“协同”模式来处理。
   *     3. 对于有兼容性问题的事件，根据解决方案的不同，有以下两种情况：
   *        3.1 能够以一个其他原生事件来模拟，并且可以依赖 e 的传播机制的，使用“独立”模式来处理。
   *            如 mousewheel/mouseenter/mouseleave 事件的解决方案。
   *        3.2 以一个或多个原生事件来模拟，但是不能依赖 e 的传播机制的（在确认事件发生时 e 可能已经传播到文档树的顶层了），则使用“协同”模式来处理。
   *            如 mousedragstart/mousedrag/mousedragend/focusin/focusout/change 等事件的处理方式。
   *            在一些特殊的情况下，如果 e 被意外的阻止传播，可能会导致结果与预期的不符。
   *
   * 添加或删除 listener：
   *   通过调用 on 或 off 方法来添加或删除指定的 listener。
   *
   * 触发事件：
   *   有两种方式触发一个事件：
   *   1. 使用 fire 方法来触发一个事件。
   *      通过这种方式触发的事件，将使用“独立”模式来处理。
   *      这种方式不会触发任何原生事件，也不会执行此类事件的默认行为。
   *   2. 对于一些内置事件，可以在相应的元素上调用与要触发的 type 同名的方法（如果有）来触发。
   *      通过这种方式触发的事件，将使用“协同”模式来处理。
   *      这种方式会同时触发原生事件，并且会执行其默认行为。
   *   两种方式的应用场景：
   *     当只希望调用某类事件的监听器时，应使用方式 1。
   *     除了调用某类事件的监听器，还希望该事件的默认行为生效时，应使用方式 2。
   *
   * 扩展方法：
   *   Element.prototype.on
   *   Element.prototype.off
   *   Element.prototype.fire
   *
   * 参考：
   *   http://jquery.com/
   *   http://www.quirksmode.org/dom/w3c_events.html
   *   http://www.w3.org/TR/DOM-Level-3-Events/#events-module
   */

  // 监听器对象池。
  /*
   * <Object eventPool> {
   *   <string uid>: <Object item> {
   *     <string type>: <Array handlers> [
   *       <Object handler> {
   *         name: <string name>,
   *         listener: <Function listener>,
   *         selector: <string selector>,
   *         simpleSelector: <Object simpleSelector> {
   *           tagName: <string tagName>,
   *           className: <string className>
   *         }
   *       }
   *     ]
   *      .distributor: <Function distributor>
   *                                        .type: <string type>
   *      .distributor: null
   *      .delegateCount: <number delegateCount>
   *   }
   * }
   */
  var eventPool = {};

  // 供内部调用的标记值。
  var INTERNAL_IDENTIFIER_EVENT = {};

  var EVENT_CODES = {'mousedown': 5, 'mouseup': 5, 'click': 5, 'dblclick': 5, 'contextmenu': 5, 'mousemove': 5, 'mouseover': 5, 'mouseout': 5, 'mousewheel': 5, 'mouseenter': 5, 'mouseleave': 5, 'mousedragstart': 5, 'mousedrag': 5, 'mousedragend': 5, 'keydown': 6, 'keyup': 6, 'keypress': 6, 'focus': 0, 'blur': 0, 'focusin': 4, 'focusout': 4, 'input': 4, 'change': 4, 'select': 0, 'submit': 0, 'reset': 0, 'scroll': 0, 'load': 0, 'unload': 0, 'beforeunload': 0, 'resize': 0, 'error': 0, 'domready': 0};
  var returnTrue = function() {
    return true;
  };
  var returnFalse = function() {
    return false;
  };

  /**
   * 事件包装对象。
   * @name Event
   * @constructor
   * @param {string} type 事件类型。
   * @param {Object} e 原生事件对象。
   * @description
   *   如果事件对象是通过调用 Element/document/window 的 fire 方法产生的，其除了 originalEvent、type 和 target 之外的其他属性值均可能会被重写。
   */
  function Event(type, e) {
    if (!e) {
      e = window.event;
    }
    // 事件代码包含三个二进制位，分别是 鼠标事件 键盘事件 可以冒泡。默认为 100 (4)，即可以冒泡。
    var code = EVENT_CODES[type] || 4;
    // 保存原生事件对象。
    this.originalEvent = e;
    // 事件类型，这时候的 type 就是调用 on 时使用的事件类型。
    this.type = type;
    // 是否可冒泡。
    this.bubbles = !!(code & 4);
    // 目标元素。
    var target = 'target' in e ? e.target : e.srcElement || document;
    if (target.nodeType === 3) {
      target = target.parentNode;
    }
    this.target = $(target);
    // 发生时间。
    this.timeStamp = e.timeStamp || Date.now();
    // 鼠标和键盘事件，由 fire 方法产生的事件对象可能没有以下信息。
    if (code & 3) {
      this.ctrlKey = e.ctrlKey;
      this.altKey = e.altKey;
      this.shiftKey = e.shiftKey;
      this.metaKey = e.metaKey;
      if (code & 1) {
        // 坐标。
        this.clientX = e.clientX || 0;
        this.clientY = e.clientY || 0;
        this.screenX = e.screenX || 0;
        this.screenY = e.screenY || 0;
        if ('pageX' in e) {
          this.pageX = e.pageX;
          this.pageY = e.pageY;
        } else {
          var pageOffset = window.getPageOffset();
          this.pageX = this.clientX + pageOffset.x;
          this.pageY = this.clientY + pageOffset.y;
        }
        // 按键。非按键类事件（以及 contextmenu 事件）的按键值在各浏览器中有差异。
        if ('which' in e) {
          var which = e.which;
          this.leftButton = which === 1;
          this.middleButton = which === 2;
          this.rightButton = which === 3;
          this.which = which;
        } else {
          var button = e.button;
          this.leftButton = !!(button & 1);
          this.middleButton = !!(button & 4);
          this.rightButton = !!(button & 2);
          this.which = this.leftButton ? 1 : this.middleButton ? 2 : this.rightButton ? 3 : 0;
        }
        // 相关元素。
        this.relatedTarget = $('relatedTarget' in e ? e.relatedTarget : ('fromElement' in e ? (e.fromElement === target ? e.toElement : e.fromElement) : null));
      } else {
        this.which = e.which || e.charCode || e.keyCode || 0;
      }
    }
  }

  /**
   * 原生事件对象。
   * @name Event#originalEvent
   * @type Object
   * @description
   *   使用 fire 方法创建的事件对象的 originalEvent.type 为空字符串。
   */

  /**
   * 事件类型。
   * @name Event#type
   * @type string
   */

  /**
   * 是否可以冒泡，不冒泡的事件不能使用代理事件监听。
   * @name Event#bubbles
   * @type boolean
   */

  /**
   * 触发事件的对象。
   * @name Event#target
   * @type Element
   */

  /**
   * 事件发生的时间。
   * @name Event#timeStamp
   * @type number
   */

  /**
   * 事件发生时，ctrl 键是否被按下。
   * @name Event#ctrlKey
   * @type boolean
   */

  /**
   * 事件发生时，alt 键是否被按下。
   * @name Event#altKey
   * @type boolean
   */

  /**
   * 事件发生时，shift 键是否被按下。
   * @name Event#shiftKey
   * @type boolean
   */

  /**
   * 事件发生时，meta 键是否被按下。
   * @name Event#metaKey
   * @type boolean
   */

  /**
   * 事件发生时鼠标在视口中的 X 坐标，仅在鼠标事件对象上有效。
   * @name Event#clientX
   * @type number
   */

  /**
   * 事件发生时鼠标在视口中的 Y 坐标，仅在鼠标事件对象上有效。
   * @name Event#clientY
   * @type number
   */

  /**
   * 事件发生时鼠标在屏幕上的 X 坐标，仅在鼠标事件对象上有效。
   * @name Event#screenX
   * @type number
   */

  /**
   * 事件发生时鼠标在屏幕上的 Y 坐标，仅在鼠标事件对象上有效。
   * @name Event#screenY
   * @type number
   */

  /**
   * 事件发生时鼠标在页面中的 X 坐标，仅在鼠标事件对象上有效。
   * @name Event#pageX
   * @type number
   */

  /**
   * 事件发生时鼠标在页面中的 Y 坐标，仅在鼠标事件对象上有效。
   * @name Event#pageY
   * @type number
   */

  /**
   * 事件发生时鼠标在横向移动的偏移量，仅在 mousedragstart/mousedrag/mousedragend 类型的事件对象上有效。
   * @name Event#offsetX
   * @type number
   */

  /**
   * 事件发生时鼠标在纵向移动的偏移量，仅在 mousedragstart/mousedrag/mousedragend 类型的事件对象上有效。
   * @name Event#offsetY
   * @type number
   */

  /**
   * 事件发生时，鼠标左键是否被按下，仅在鼠标事件对象上有效。
   * @name Event#leftButton
   * @type boolean
   */

  /**
   * 事件发生时，鼠标中键是否被按下，仅在鼠标事件对象上有效。
   * @name Event#middleButton
   * @type boolean
   */

  /**
   * 事件发生时，鼠标右键是否被按下，仅在鼠标事件对象上有效。
   * @name Event#rightButton
   * @type boolean
   */

  /**
   * 事件被触发时的相关对象，仅在 mouseover/mouseout 类型的事件对象上有效。
   * @name Event#relatedTarget
   * @type Element
   */

  /**
   * 事件发生时鼠标滚轮是否正在向上滚动，仅在 mousewheel 类型的事件对象上有效。
   * @name Event#wheelUp
   * @type boolean
   */

  /**
   * 事件发生时鼠标滚轮是否正在向下滚动，仅在 mousewheel 类型的事件对象上有效。
   * @name Event#wheelDown
   * @type boolean
   */

  /**
   * 当一个设备触发事件时的相关代码。在键盘事件中为按下的键的代码。
   * @name Event#which
   * @type number
   */

  Object.mixin(Event.prototype, {
    /**
     * 阻止事件的传播，被阻止传播的事件将不会向其他元素传播。
     * @name Event.prototype.stopPropagation
     * @function
     */
    stopPropagation: function() {
      var e = this.originalEvent;
      if (e) {
        e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
      }
      this.isPropagationStopped = returnTrue;
    },

    /**
     * 查询事件的传播是否已被阻止。
     * @name Event.prototype.isPropagationStopped
     * @function
     * @returns {boolean} 查询结果。
     */
    isPropagationStopped: returnFalse,

    /**
     * 阻止事件的默认行为。
     * @name Event.prototype.preventDefault
     * @function
     */
    preventDefault: function() {
      var e = this.originalEvent;
      if (e) {
        e.preventDefault ? e.preventDefault() : e.returnValue = false;
      }
      this.isDefaultPrevented = returnTrue;
    },

    /**
     * 查询事件的默认行为是否已被阻止。
     * @name Event.prototype.isDefaultPrevented
     * @function
     * @returns {boolean} 查询结果。
     */
    isDefaultPrevented: returnFalse,

    /**
     * 立即阻止事件的传播，被立即阻止传播的事件不仅不会向其他元素传播，也不会在当前元素上被分发到其他的监听器。
     * @name Event.prototype.stopImmediatePropagation
     * @function
     */
    stopImmediatePropagation: function() {
      this.stopPropagation();
      this.isImmediatePropagationStopped = returnTrue;
    },

    /**
     * 查询事件的传播是否已被立即阻止。
     * @name Event.prototype.isImmediatePropagationStopped
     * @function
     * @returns {boolean} 查询结果。
     */
    isImmediatePropagationStopped: returnFalse

  });

  // 解析事件名称，取出相关的属性。
  var eventNamePattern = /^(\w+)(\.\w+)?(?::relay\(([^\)]+)\))?$/;
  var parseEventName = function(eventName) {
    var attributes = {};
    var match;
    if (eventName && (match = eventName.match(eventNamePattern))) {
      attributes.type = match[1];
      attributes.label = match[2] || '';
      attributes.selector = match[3] || '';
    }
    if (attributes.type + attributes.label + (attributes.selector ? ':relay(' + attributes.selector + ')' : '') !== eventName) {
      throw new Error('Invalid listener name "' + eventName + '"');
    }
    return attributes;
  };

  // 添加和删除原生事件监听器。
  var addEventListener = 'addEventListener' in window ? function($element, eventType, eventListener, useCapture) {
    $element.addEventListener(eventType, eventListener, useCapture);
  } : function($element, eventType, eventListener) {
    $element.attachEvent('on' + eventType, eventListener);
  };
  var removeEventListener = 'removeEventListener' in window ? function($element, eventType, eventListener, useCapture) {
    $element.removeEventListener(eventType, eventListener, useCapture);
  } : function($element, eventType, eventListener) {
    $element.detachEvent('on' + eventType, eventListener);
  };

  // 将事件对象分发给目标元素上添加的此类型事件的监听器（仅分发给使用 on 方法添加的监听器）。
  var distributeEvent = function($element, handlers, event, isTriggered) {
    // 分发时对 handlers 的副本（仅复制了 handlers 的数组部分）操作，以避免在监听器内添加或删除目标元素同类型的监听器时会影响本次分发过程。
    var handlersCopy = handlers.slice(0);
    var delegateCount = handlers.delegateCount;
    var $target = delegateCount ? event.target : $element;
    var filters = {};
    var handler;
    var selector;
    var i;
    var total;
    // 开始分发。
    do {
      if ($target === $element) {
        // 普通监听器。
        i = delegateCount;
        total = handlersCopy.length;
      } else {
        // 代理监听器。
        i = 0;
        total = delegateCount;
      }
      while (i < total) {
        handler = handlersCopy[i++];
        selector = handler.selector;
        // 如果是代理事件监听，则过滤出符合条件的元素。
        if (!selector || (filters[selector] || (filters[selector] = function(simpleSelector) {
          if (simpleSelector) {
            return function($target) {
              var tagName = simpleSelector.tagName;
              var className = simpleSelector.className;
              return (tagName ? $target.nodeName === tagName : true) && (className ? $target.hasClass(className) : true);
            };
          } else {
            var elements = $element.find(selector);
            return function($target) {
              return elements.contains($target);
            }
          }
        }(handler.simpleSelector)))($target)) {
          if (!isTriggered || isTriggered.call($target, event)) {
            // 监听器被调用时 this 的值为监听到本次事件的元素。
            if (handler.listener.call($target, event) === false) {
              event.stopPropagation();
              event.preventDefault();
            }
            if (event.isImmediatePropagationStopped()) {
              break;
            }
          }
        }
      }
      // 如果监听到本次事件的元素不是捕获到本次事件的元素（正在调用代理监听器），且事件可以继续传播时，向上一级元素（到 document 为止）传播事件。
    } while (!($target === $element || event.isPropagationStopped()) && ($target = $target.getParent() || $target === html && $element));
  };

  // 触发器。
  var triggers = {};

  // 拖动相关事件，为避免覆盖 HTML5 草案中引入的同名事件，加入前缀 mouse。
  // 只支持鼠标左键的拖拽，拖拽过程中松开左键、按下其他键、或当前窗口失去焦点都将导致拖拽事件结束。
  // 应避免在拖拽进行时删除本组事件的监听器，否则可能导致拖拽动作无法正常完成。
  triggers.mousedragstart = triggers.mousedrag = triggers.mousedragend = function() {
    var dragState;
    var relatedTypes = ['mousedragstart', 'mousedrag', 'mousedragend'];
    var mouseDragStartTrigger = function(e) {
      if (!dragState) {
        var event = new Event('mousedragstart', e);
        if (event.leftButton) {
          event.offsetX = event.offsetY = 0;
          var $target = event.target;
          if ($target.setCapture) {
            $target.setCapture();
          }
          event.preventDefault();
          dragState = {target: $target, startX: event.pageX, startY: event.pageY};
          dragState.lastEvent = event;
          $target.fire(INTERNAL_IDENTIFIER_EVENT, event);
          setTimeout(function() {
            addEventListener(document, 'mousemove', mouseDragTrigger);
            addEventListener(document, 'mousedown', mouseDragEndTrigger);
            addEventListener(document, 'mouseup', mouseDragEndTrigger);
            addEventListener(window, 'blur', mouseDragEndTrigger);
          }, 0);
        }
      }
    };
    var mouseDragTrigger = function(e) {
      var event = new Event('mousedrag', e);
      event.target = dragState.target;
      event.offsetX = event.pageX - dragState.startX;
      event.offsetY = event.pageY - dragState.startY;
      dragState.lastEvent = event;
      dragState.target.fire(INTERNAL_IDENTIFIER_EVENT, event);
    };
    var mouseDragEndTrigger = function() {
      var $target = dragState.target;
      if ($target.releaseCapture) {
        $target.releaseCapture();
      }
      // 使用上一个拖拽相关事件作为 mousedragend 的事件对象，以确保任何情况下都有鼠标坐标相关信息。
      var event = dragState.lastEvent;
      // 避免上一个拖拽相关事件的传播或默认行为被阻止。
      event.isPropagationStopped = event.isDefaultPrevented = event.isImmediatePropagationStopped = returnFalse;
      event.type = 'mousedragend';
      dragState.target.fire(INTERNAL_IDENTIFIER_EVENT, event);
      dragState = null;
      removeEventListener(document, 'mousemove', mouseDragTrigger);
      removeEventListener(document, 'mousedown', mouseDragEndTrigger);
      removeEventListener(document, 'mouseup', mouseDragEndTrigger);
      removeEventListener(window, 'blur', mouseDragEndTrigger);
    };
    return {
      add: function($element) {
        // 向这三个关联事件中添加第一个监听器时，即创建 mousedragstart 触发器，该触发器会动态添加/删除另外两个事件的触发器。
        addEventListener($element, 'mousedown', mouseDragStartTrigger);
        // 创建另外两个事件的处理器组。
        var item = eventPool[$element.uid];
        relatedTypes.forEach(function(relatedType) {
          if (!item[relatedType]) {
            var handlers = [];
            handlers.delegateCount = 0;
            item[relatedType] = handlers;
          }
        });
      },
      remove: function($element) {
        // 在这三个关联事件中删除最后一个监听器后，才删除他们的触发器。
        var item = eventPool[$element.uid];
        var handlerCount = 0;
        relatedTypes.forEach(function(relatedType) {
          handlerCount += item[relatedType].length;
        });
        if (handlerCount === 0) {
          removeEventListener($element, 'mousedown', mouseDragStartTrigger);
          // 删除三个关联事件的处理器组。
          relatedTypes.forEach(function(type) {
            delete item[type];
          });
        }
        return false;
      }
    };
  }();

  // 使 Firefox 支持 focusin/focusout 事件，使用 focus/blur 事件的捕获阶段模拟。
  if (navigator.isFirefox) {
    Object.forEach({focusin: 'focus', focusout: 'blur'}, function(originalType, type) {
      var count = 0;
      var trigger = function(e) {
        e.target.fire(type);
      };
      triggers[type] = {
        add: function() {
          // 在当前文档内第一次添加本类型事件的监听器时，启用模拟。
          if (++count === 1) {
            addEventListener(document, originalType, trigger, true);
          }
        },
        remove: function() {
          // 在当前文档内添加的本类型事件的监听器全部被删除时，停用模拟。
          if (--count === 0) {
            removeEventListener(document, originalType, trigger, true);
          }
        }
      };
    });
  }

  // 修复 IE6 IE7 IE8 IE9 的 input 和 change 事件，以及 Firefox 的 change 事件。
  if (navigator.isIElt10 || navigator.isFirefox) {
    // 判断一个元素是否为可输入元素。
    var isInputElement = function(element) {
      var nodeName = element.nodeName;
      var controlType = element.type;
      return nodeName === 'TEXTAREA' || nodeName === 'INPUT' && (controlType === 'text' || controlType === 'password');
    };

    if (navigator.isIElt10) {
      // 使 IE6 IE7 IE8 支持 input 事件，并修复 IE9 的 input 事件的 bug。
      // IE6 IE7 IE8 不支持此事件，其他浏览器支持（需使用 addEventListener 添加监听器）。
      // 但 IE9 的可输入元素在删除文本内容时（按键 Backspace 和 Delete、菜单删除/剪切、拖拽内容出去）不触发 input 事件。
      // 为使代码更简洁，此处对上述浏览器使用同一套解决方案来模拟 input 事件，而不为 IE9 单独做修复。
      // 不能使用 propertychange 事件模拟，因为控件值有可能是脚本修改的，而 input 事件仅应在用户进行修改动作时触发。
      // 在本模拟方式依赖的事件中，如果阻止 beforeactivate、beforedeactivate 和 dragend 事件的传播，将导致事件模拟失败。
      // 修复后，唯一与标准 input 事件不同的行为是：当用户的焦点在一个可输入元素中时，该元素的值被脚本更改，之后用户的焦点没有离开本元素，并更改了光标的位置，此时会不正确的触发 input 事件。
      // 如果上述问题出现了，避免的方式是在使用脚本赋值前或赋值后调用控件的 blur 方法。
      // 另外，当使用表单自动完成功能时，IE6 IE7 IE8 IE9 Safari 5.1.7 (自动模式) Opera 12.02 (非第一次) 不触发 input 事件。
      // 考虑到大多数 input 事件是应用到 password 和 textarea 类型的控件，上述自动完成的问题影响并不大，目前未处理。
      // Opera 12.02 拖拽出去后，源控件不触发 input 事件，目标控件如果是 textarea 也不会触发 input 事件，目前未处理。
      triggers.input = function() {
        var count = 0;
        var $active;
        // 触发器。
        var checkValue = function($element) {
          if ($element._valueBeforeInput_ !== $element.value) {
            $element._valueBeforeInput_ = $element.value;
            $element.fire('input');
          }
        };
        // 获取活动的可输入元素。
        var setActiveInputElement = function(e) {
          var element = e.srcElement;
          if (isInputElement(element)) {
            var $element = $(element);
            // 如果是拖拽内容进来，本监听器会被连续调用两次，触发 drop 事件时值仍是原始值，赋新值之后才触发 beforeactivate 事件。
            if (e.type === 'drop') {
              $element._dropForInput_ = true;
            }
            if (e.type === 'beforeactivate' && $element._dropForInput_) {
              $element._dropForInput_ = false;
              checkValue($element);
            } else {
              $element._valueBeforeInput_ = $element.value;
            }
            $active = $element;
          }
        };
        // 清除活动的可输入元素。
        var clearActiveInputElement = function(e) {
          if (e.srcElement === $active) {
            $active = null;
          }
        };
        // 按键触发器，针对按下按键的情况进行检查。
        var onKeyDown = function(e) {
          if (e.srcElement === $active) {
            var $element = $active;
            setTimeout(function() {
              checkValue($element);
            }, 0);
          }
        };
        // 拖拽触发器，针对拖拽内容出去的情况进行检查。
        var onDragEnd = function(e) {
          var element = e.srcElement;
          if ('_valueBeforeInput_' in element) {
            setTimeout(function() {
              checkValue(element);
            }, 0);
          }
        };
        // 选区改变触发器，针对快捷键和菜单修改内容的情况进行检查。
        var onSelectionChange = function() {
          if ($active) {
            checkValue($active);
          }
        };
        // 发布接口。
        return {
          add: function() {
            // 在当前文档内第一次添加 input 事件的监听器时，对全文档内所有可输入元素进行事件模拟及修复。
            if (++count === 1) {
              addEventListener(html, 'drop', setActiveInputElement);
              addEventListener(document, 'beforeactivate', setActiveInputElement);
              addEventListener(document, 'beforedeactivate', clearActiveInputElement);
              addEventListener(document, 'selectionchange', onSelectionChange);
              addEventListener(document, 'keydown', onKeyDown);
              addEventListener(html, 'dragend', onDragEnd);
            }
          },
          remove: function() {
            // 在当前文档内添加的 input 事件的监听器全部被删除时，停用事件模拟及修复。已添加过触发器的可输入元素不作处理。
            if (--count === 0) {
              removeEventListener(html, 'drop', setActiveInputElement);
              removeEventListener(document, 'beforeactivate', setActiveInputElement);
              removeEventListener(document, 'beforedeactivate', clearActiveInputElement);
              removeEventListener(document, 'selectionchange', onSelectionChange);
              removeEventListener(document, 'keydown', onKeyDown);
              removeEventListener(html, 'dragend', onDragEnd);
            }
          }
        };
      }();

      // 修复 IE6 IE7 IE8 IE9 的 change 事件。
      // IE6 IE7 IE8 的 change 事件不会冒泡，并且 INPUT[type=radio|checkbox] 上的 change 事件在失去焦点后才触发。
      // IE6 IE7 IE8 IE9 的可输入元素使用表单自动完成和拖拽内容出去后不会触发 change 事件。
      // 修复后，唯一与标准 change 事件不同的行为是：当用户的焦点在一个可输入元素中时，该元素的值被脚本更改，之后用户未做任何修改，焦点即离开本元素，此时会不正确的触发 change 事件。
      // 如果上述问题出现了，避免的方式是在使用脚本赋值前或赋值后调用控件的 blur 方法。
      // 另外，当使用表单自动完成功能时，Safari 5.1.7 (自动模式) 不触发 change 事件，目前未处理。
      triggers.change = function() {
        // 修复 IE6 IE7 IE8 的 radio、checkbox 类型的控件上的 change 事件在失去焦点后才触发以及 select-one、select-multiple 类型的控件上的 change 事件不冒泡的问题。
        // 对于 IE9 的这些类型的控件，与 IE6 IE7 IE8 的 select-one、select-multiple 类型的控件的处理方式保持一致。
        // 虽然 IE9 的 change 事件可以冒泡，但为简化代码，不再对其做分支处理。
        var fixChangeEvent = function(e) {
          var element = e.srcElement;
          var nodeName = element.nodeName;
          var type = element.type;
          if (!element._changeEventFixed_ && (nodeName === 'INPUT' && (type === 'radio' || type === 'checkbox') || nodeName === 'SELECT')) {
            var $element = $(element);
            if (navigator.isIElt9 && nodeName === 'INPUT') {
              addEventListener($element, 'propertychange', function(e) {
                if (e.propertyName === 'checked') {
                  e.srcElement._checkedStateChanged_ = true;
                }
              });
              addEventListener($element, 'click', function(e) {
                var $element = e.srcElement;
                if ($element._checkedStateChanged_) {
                  $element._checkedStateChanged_ = false;
                  $element.fire('change');
                }
              });
            } else {
              addEventListener($element, 'change', function(e) {
                e.srcElement.fire('change');
              });
            }
            $element._changeEventFixed_ = true;
          }
        };
        // 修复 IE6 IE7 IE8 IE9 的 text、password、textarea 类型的控件使用表单自动完成和拖拽内容出去后不会触发 change 事件的问题以及 IE6 IE7 IE8 这些类型的控件上的 change 事件不冒泡的问题。
        // 虽然这些情况下 IE9 的 change 事件可以冒泡，但为简化代码，不再对其做分支处理。
        var count = 0;
        var saveOldValue = function(e) {
          var element = e.srcElement;
          if (isInputElement(element)) {
            // 如果是拖拽内容进来，本监听器会被连续调用两次，触发 drop 事件时值仍是原始值，赋新值之后才触发 beforeactivate 事件。
            if (element._dropForChange_) {
              element._dropForChange_ = false;
            } else {
              element._valueBeforeChange_ = element.value;
            }
            if (e.type === 'drop') {
              element._dropForChange_ = true;
            }
          }
        };
        var checkNewValue = function(e) {
          var element = e.srcElement;
          if (isInputElement(element)) {
            var $element = $(element);
            setTimeout(function() {
              if ($element._valueBeforeChange_ !== $element.value) {
                $element._valueBeforeChange_ = $element.value;
                $element.fire('change');
              }
            }, 0);
          }
        };
        return {
          add: function($element) {
            addEventListener($element, 'beforeactivate', fixChangeEvent);
            // 在当前文档内第一次添加 change 事件的监听器时，对全文档内所有可输入元素进行修复（这种修复不会在目标元素上添加新监听器）。
            if (++count === 1) {
              addEventListener(html, 'drop', saveOldValue);
              addEventListener(document, 'beforeactivate', saveOldValue);
              addEventListener(document, 'beforedeactivate', checkNewValue);
            }
          },
          remove: function($element) {
            removeEventListener($element, 'beforeactivate', fixChangeEvent);
            // 在当前文档内添加的 change 事件的监听器全部被删除时，停用可输入元素的修复。
            if (--count === 0) {
              removeEventListener(html, 'drop', saveOldValue);
              removeEventListener(document, 'beforeactivate', saveOldValue);
              removeEventListener(document, 'beforedeactivate', checkNewValue);
            }
          }
        };
      }();

    }

    // 修复 Firefox 拖拽内容到控件内不触发 change 事件的问题。
    // 修复依赖的事件触发并不频繁，因此直接修复，不使用触发器。
    if (navigator.isFirefox) {
      // Firefox 的拖动方式为复制一份而不是移动，并且如果不是控件内拖拽，焦点不会移动到 drop 的控件内，因此可以直接触发 change 事件。
      addEventListener(document, 'drop', function(e) {
        var $element = e.target;
        if (isInputElement($element) && $element !== document.activeElement) {
          setTimeout(function() {
            $element.fire('change');
          }, 0);
        }
      });
    }

  }

  // 删除目标元素上的所有事件监听器。
  var removeAllListeners = function(element) {
    var item = eventPool[element.uid];
    if (item) {
      var types = Object.keys(item);
      var handlers;
      while (types.length) {
        handlers = item[types.shift()];
        while (handlers.length) {
          element.off(handlers[0].name);
        }
      }
    }
    return element;
  };

//--------------------------------------------------[Element.prototype.on]
  /**
   * 为本元素添加事件监听器。
   * @name Element.prototype.on
   * @function
   * @param {string} name 事件名称，格式为 <dfn><var>type</var>.<var>label</var>:relay(<var>selector</var>)</dfn>，详细信息请参考下表。
   *   使用逗号分割多个事件名称，即可使用一个监听器监听该元素上的多个事件。
   *   对于为不保证所有浏览器均可以冒泡的事件类型指定了代理监听的情况，会给出警告信息。
   *   <table>
   *     <tr><th>组成部分</th><th>是否必选</th><th>详细描述</th></tr>
   *     <tr><td><dfn><var>type</var></dfn></td><td>必选</td><td>要监听的事件类型。</td></tr>
   *     <tr><td><dfn>.<var>label</var></dfn></td><td>可选</td><td>指定事件应用的场景，以便调用 off 方法时精确匹配要删除的监听器。<br>不打算删除的监听器没有必要指定标签。</td></tr>
   *     <tr><td><dfn>:relay(<var>selector</var>)</dfn></td><td>可选</td><td>用于指定对本元素的后代元素中符合 selector 要求的元素代理事件监听。<br>这种情况下，在事件发生时，将认为事件是由被代理的元素监听到的，而不是本元素。</td></tr>
   *   </table>
   * @param {Function} listener 监听器。
   *   该函数将在对应的事件发生时被调用，传入事件对象作为参数。
   *   该函数被调用时 this 的值为监听到本次事件的元素，即：
   *   <ul>
   *     <li>如果是普通监听器，则 this 的值为本元素。</li>
   *     <li>如果是代理监听器，则 this 的值为被代理的元素。</li>
   *   </ul>
   *   如果该函数返回 false，则相当于调用了传入的事件对象的 stopPropagation 和 preventDefault 方法。
   * @returns {Element} 本元素。
   * @example
   *   $('#test').on('click', onClick);
   *   // 为 id 为 test 的元素添加 click 事件的监听器。
   * @example
   *   $('#test').on('click.temp', onClick);
   *   // 为 id 为 test 的元素添加 click 事件的监听器，并为其指定一个标签 temp。
   * @example
   *   $('#test').on('click:relay(a)', onClick);
   *   // 为 id 为 test 的元素添加一个代理监听器，为该元素所有的后代 A 元素代理 click 事件的监听。
   * @see http://mootools.net/
   * @see http://www.quirksmode.org/dom/events/index.html
   */
  var simpleSelectorPattern = /^(\w*)(?:\.([\w\-]+))?$/;
  Element.prototype.on = function(name, listener) {
    // 自动扩展本元素，以便于在控制台进行调试。
    var $element = $(this);
    var uid = $element.uid;
    var item = eventPool[uid] || (eventPool[uid] = {});
    // 使用一个监听器监听该元素上的多个事件。
    name.split(separator).forEach(function(name) {
      // 取出事件类型和选择符。
      var attributes = parseEventName(name);
      var type = attributes.type;
      var selector = attributes.selector;
      // 获取对应的处理器组，以添加处理器。
      var handlers = item[type] || (item[type] = []);
      // 首次注册此类型的事件。
      if (!('delegateCount' in handlers)) {
        // 为兼容事件列表中的事件类型添加触发器或分发器。
        if (EVENT_CODES.hasOwnProperty(type)) {
          if (triggers[type]) {
            // 添加触发器。
            triggers[type].add($element);
          } else {
            // 添加分发器。
            var distributor;
            switch (type) {
              case 'mousewheel':
                // 鼠标滚轮事件，Firefox 的事件类型为 DOMMouseScroll。
                distributor = function(e) {
                  var event = new Event(type, e);
                  var originalEvent = event.originalEvent;
                  var wheel = 'wheelDelta' in originalEvent ? -originalEvent.wheelDelta : originalEvent.detail || 0;
                  event.wheelUp = wheel < 0;
                  event.wheelDown = wheel > 0;
                  distributeEvent($element, handlers, event);
                };
                distributor.type = navigator.isFirefox ? 'DOMMouseScroll' : 'mousewheel';
                break;
              case 'mouseenter':
              case 'mouseleave':
                // 鼠标进入/离开事件，目前仅 IE 支持，但不能冒泡。此处使用 mouseover/mouseout 模拟。
                distributor = function(e) {
                  distributeEvent($element, handlers, new Event(type, e), function(event) {
                    var $relatedTarget = event.relatedTarget;
                    // 加入 this.contains 的判断，避免 window 和一些浏览器的 document 对象调用出错。
                    return !$relatedTarget || this.contains && !this.contains($relatedTarget);
                  });
                };
                distributor.type = type === 'mouseenter' ? 'mouseover' : 'mouseout';
                break;
              default:
                // 通用分发器。
                distributor = function(e) {
                  distributeEvent($element, handlers, new Event(type, e));
                };
                distributor.type = type;
            }
            // 将分发器作为指定类型的原生事件的监听器。
            addEventListener($element, distributor.type, distributor);
            handlers.distributor = distributor;
          }
        }
        // 初始化代理计数器。
        handlers.delegateCount = 0;
      }
      // 添加处理器（允许重复添加同一个监听器 - W3C 的事件模型不允许多次添加同一个监听器）。
      var handler = {name: name, listener: listener};
      if (selector) {
        // 代理监听器。
        handler.selector = selector;
        var match;
        if (match = selector.match(simpleSelectorPattern)) {
          // 保存简单选择器以在执行过滤时使用效率更高的方式。
          handler.simpleSelector = {
            // tagName 必为字符串，className 可能为 undefined。
            tagName: match[1].toUpperCase(),
            className: match[2] || ''
          };
        }
        handlers.splice(handlers.delegateCount++, 0, handler);
        // 为不保证所有浏览器均可以冒泡的事件类型指定代理监听时，给出警告信息。
        if (!(EVENT_CODES[type] & 4)) {
          navigator.warn('Incompatible event delegation type "' + name + '".');
        }
      } else {
        // 普通监听器。
        handlers.push(handler);
      }
    });
    return $element;
  };

//--------------------------------------------------[Element.prototype.off]
  /**
   * 删除本元素上已添加的事件监听器。
   * @name Element.prototype.off
   * @function
   * @param {string} name 事件名称。本元素上添加的所有名称与 name 匹配的监听器都将被删除。
   *   使用逗号分割多个事件名称，即可同时删除该元素上的多个监听器。
   * @returns {Element} 本元素。
   * @example
   *   $('#test').off('click');
   *   // 为 id 为 test 的元素删除名为 click 的监听器。
   * @example
   *   $('#test').off('click.temp');
   *   // 为 id 为 test 的元素删除名为 click.temp 的监听器。
   * @example
   *   $('#test').off('click:relay(a)');
   *   // 为 id 为 test 的元素删除名为 click:relay(a) 的监听器。
   */
  Element.prototype.off = function(name) {
    var $element = this;
    var uid = $element.uid;
    var item = eventPool[uid];
    if (!item) {
      return $element;
    }
    // 同时删除该元素上的多个监听器。
    name.split(separator).forEach(function(name) {
      // 取出事件类型。
      var type = parseEventName(name).type;
      // 尝试获取对应的处理器组，以删除处理器。
      var handlers = item[type];
      if (!handlers) {
        return;
      }
      // 删除处理器。
      var i = 0;
      var handler;
      while (i < handlers.length) {
        handler = handlers[i];
        if (handler.name === name) {
          handlers.splice(i, 1);
          if (handler.selector) {
            handlers.delegateCount--;
          }
        } else {
          i++;
        }
      }
      // 处理器组为空。
      if (handlers.length === 0) {
        // 为兼容事件列表中的事件类型删除触发器或分发器的注册。
        if (EVENT_CODES.hasOwnProperty(type)) {
          if (triggers[type]) {
            // 删除触发器。
            if (triggers[type].remove($element) === false) {
              // 拖拽的三个关联事件的触发器会自己管理它们的处理器组，返回 false 避免其中某个事件的处理器组被删除。
              return;
            }
          } else {
            // 删除分发器。
            var distributor = handlers.distributor;
            removeEventListener($element, distributor.type, distributor);
          }
        }
        // 删除处理器组。
        delete item[type];
      }
    });
    // 若该项再无其他处理器组，删除该项。
    if (Object.keys(item).length === 0) {
      delete eventPool[uid];
    }
    return $element;
  };

//--------------------------------------------------[Element.prototype.fire]
  /**
   * 触发本元素的某类事件。
   * @name Element.prototype.fire
   * @function
   * @param {string} type 事件类型。
   * @param {Object} [data] 在事件对象上附加的数据。
   *   data 的属性会被追加到事件对象中，但名称为 originalEvent、type、target 的属性除外。如果不希望事件在 DOM 树中传播，指定其 bubbles 属性为 false 即可。
   * @returns {Object} 事件对象。
   * @description
   *   调用本方法时，仅会调用使用 on 方法添加的监听器，并且其默认行为也将被阻止（因为这个事件并不是由用户的操作触发的）。
   *   如果需要执行此类事件的默认行为，可以直接在目标元素上调用对应的方法（如 click、select、submit 等），这种情况下除了会调用使用 on 方法添加的监听器之外，使用其他方式添加的监听器也可能被调用。
   */
  Element.prototype.fire = function(type, data) {
    // 仅供内部使用的另一种调用方式：data 是一个事件对象。
    var event = type === INTERNAL_IDENTIFIER_EVENT ? data : Object.mixin(new Event(type, {type: '', target: this}), data || {}, {blackList: ['originalEvent', 'type', 'target']});
    // 传播事件并返回传播后的事件对象。
    var $element = this;
    var item;
    var handlers;
    while ($element) {
      if (handlers = (item = eventPool[$element.uid]) && item[event.type]) {
        distributeEvent($element, handlers, event);
      }
      // IE6 中即便 $element 就是 window，表达式 $element == window 也返回 false。
      if (!event.bubbles || event.isPropagationStopped() || $element.uid === 'window') {
        break;
      }
      $element = $element === document ? window : $element.getParent() || $element === html && document || null;
    }
    return event;
  };

//==================================================[DOM 扩展 - 表单]
  /*
   * 为表单元素扩展新特性。
   *
   * 扩展方法：
   *   HTMLFormElement.prototype.getFieldValue
   *   HTMLFormElement.prototype.serialize  // TODO
   */

//--------------------------------------------------[HTMLFormElement.prototype.getFieldValue]
  /*
   * 获取一个或一组控件的当前值，并对下列不一致的情况（*）作统一化处理。
   * 如果为 select-one 类型：
   *   取最后一个设置了 selected 的 option 值。
   *   若该 option 设置了 disabled 则认为本控件无有效值（虽然此时可以取到该控件的 selectedIndex 和 value 值）。
   *     * IE6 IE7 不支持 OPTION 和 OPTGROUP 元素的 disabled 属性（http://w3help.org/zh-cn/causes/HF3013）。
   *   若没有设置了 selected 的 option，则取第一个未设置 disabled 的 option 值。
   *     * Safari 5.1.7 在上述情况发生时，其 selectedIndex 仍为 0，并且认为本控件无有效值。
   *     ! IE6 IE7 不支持 option 的 disabled 属性，所以其 selectedIndex 将为 0，并且不支持 hasAttribute 方法，因此无法修复本差异。
   *   若所有的 option 都设置了 disabled，则其 selectedIndex 为 -1，并且认为本控件无有效值。
   *     * 仅 Firefox 14.0.1 和 Opera 12.02 在上述情况发生时会将其 selectedIndex 设置为 -1，但后者会将第一个 OPTION 元素的 value 作为有效值提交。
   *     * 其他浏览器则将其 selectedIndex 设置为 0，但认为本控件无有效值。
   * 如果为 select-multiple 类型：
   *   若没有设置了 selected 的 option，则认为没有默认选中项，selectedIndex 为 -1，本控件无有效值（多选情况下的 selectedIndex 和 value 无实际意义）。
   *   所有设置了 selected 的 option 认为有效。
   *   所有设置了 disabled 的 option 认为无效。
   */
  /**
   * 获取本表单内某个域的当前值。
   * @name HTMLFormElement.prototype.getFieldValue
   * @function
   * @param {string} name 域的名称。
   * @returns {string|Array} 域的当前值。
   * @description
   *   当该域只包含一个非 select-multiple 类型的控件时，如果具备有效值则返回该值，否则返回空字符串（将无效值与空字符串等同处理是为了降低后续处理的复杂度）。
   *   其他情况（该域只包含一个 select-multiple 类型的控件或者多个任意类型的控件时）返回数组，值为空字符串的项不会被加入数组。
   * @see http://www.w3.org/TR/REC-html40/interact/forms.html#successful-controls
   */
  var getCurrentValue = function(control) {
    var value = '';
    if (control.nodeType) {
      switch (control.type) {
        case 'radio':
        case 'checkbox':
          if (control.checked && !control.disabled) {
            value = control.value;
          }
          break;
        case 'select-one':
        case 'select-multiple':
          if (!control.disabled) {
            // 不能使用 Array.from(control.options).forEach(...)，原因见 typeOf 的注释。
            var options = control.options;
            var option;
            var i = 0;
            if (control.type === 'select-one') {
              var selectedIndex = control.selectedIndex;
              if (navigator.isSafari && selectedIndex === 0 && !options[0].hasAttribute('selected')) {
                while (option = options[++i]) {
                  if (!option.disabled && !option.parentNode.disabled) {
                    selectedIndex = i;
                    break;
                  }
                }
              }
              if (selectedIndex > 0 && !options[selectedIndex].disabled) {
                value = options[selectedIndex].value;
              }
            } else {
              value = [];
              while (option = options[i++]) {
                if (option.selected && !option.disabled && !option.parentNode.disabled) {
                  value.push(option.value);
                }
              }
            }
          }
          break;
        default:
          if (!control.disabled) {
            value = control.value;
          }
      }
    } else {
      value = [];
      Array.from(control).forEach(function(control) {
        var v = getCurrentValue(control);
        if (v) {
          value = value.concat(v);
        }
      });
    }
    return value;
  };

  HTMLFormElement.prototype.getFieldValue = function(name) {
    var control = this.elements[name];
    if (!control) {
      throw new Error('Invalid field name "' + name + '"');
    }
    return getCurrentValue(control);
  };

//==================================================[DOM 扩展 - document]
  /*
   * 为 document 扩展新特性，提供与 Element 类似的事件机制。
   *
   * 扩展方法：
   *   document.$
   *   document.addStyleRules
   *   document.loadScript
   *   document.preloadImages
   *   document.on
   *   document.off
   *   document.fire
   */

  /**
   * 扩展 document 对象。
   * @name document
   * @namespace
   */

  document.uid = 'document';

//--------------------------------------------------[document.$]
  /**
   * 根据指定的参数获取/创建一个元素，并对其进行扩展。
   * @name document.$
   * @function
   * @param {string|Element} e 不同类型的元素表示。
   * @returns {Element} 扩展后的元素。
   * @description
   *   当参数为一个元素的序列化之后的字符串（它可以包含子元素）时，会返回扩展后的、根据这个字符串反序列化的元素。
   *   这里与其他实现相比有以下几点差异：
   *   <ul>
   *     <li>忽略“IE 丢失源代码前的空格”的问题，通过脚本修复这个问题无实际意义（需要深度遍历）。</li>
   *     <li>修改“IE 添加多余的 TBODY 元素”的问题的解决方案，在 wrappers 里预置一个 TBODY 即可。</li>
   *     <li>忽略“脚本不会在动态创建并插入文档树后自动执行”的问题，因为这个处理需要封装追加元素的相关方法，并且还需要考虑脚本的 defer 属性在各浏览器的差异（IE 中添加 defer 属性的脚本在插入文档树后会执行），对于动态载入外部脚本文件的需求，应使用 document.loadScript 方法，而不应该使用本方法。</li>
   *   </ul>
   *   在创建元素时，如果包含 table，建议写上 tbody。举例如下：
   *   document.$('&lt;table&gt;&lt;tbody id="ranking"&gt;&lt;/tbody&gt;&lt;/table&gt;');
   *   当参数为一个元素的 id 时，会返回扩展后的、与指定 id 相匹配的元素。
   *   当参数本身即为一个元素时，会返回扩展后的该元素。
   *   当参数为其他情况时（包括 document 和 window）均返回 null。
   * @see http://jquery.com/
   * @see http://mootools.net/
   * @see http://w3help.org/zh-cn/causes/SD9003
   */
  var tagNamePattern = /(?!<)\w*/;

  var wrappers = {
    area: [1, '<map>', '</map>'],
    legend: [1, '<fieldset>', '</fieldset>'],
    optgroup: [1, '<select>', '</select>'],
    colgroup: [1, '<table><tbody></tbody>', '</table>'],
    col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
    tr: [2, '<table><tbody>', '</tbody></table>'],
    th: [3, '<table><tbody><tr>', '</tr></tbody></table>']
  };
  wrappers.option = wrappers.optgroup;
  wrappers.caption = wrappers.thead = wrappers.tfoot = wrappers.tbody = wrappers.colgroup;
  wrappers.td = wrappers.th;
  if (navigator.isIElt9) {
    // IE6 IE7 IE8 对 LINK STYLE SCRIPT 元素的特殊处理。
    wrappers.link = wrappers.style = wrappers.script = [0, '#', ''];
  }

  var defaultWrapper = [0, '', ''];

  document.$ = function(e) {
    var element = null;
    switch (typeof e) {
      case 'string':
        if (e.charAt(0) === '#') {
          element = document.getElementById(e.slice(1));
        } else if (e.charAt(0) === '<' && e.charAt(e.length - 1) === '>') {
          var wrapper = wrappers[tagNamePattern.exec(e)[0].toLowerCase()] || defaultWrapper;
          var depth = wrapper[0] + 1;
          var div = document.createElement('div');
          element = div;
          div.innerHTML = wrapper[1] + e + wrapper[2];
          while (depth--) {
            element = element.lastChild;
          }
          element = element && element.nodeType === 1 ? element : div;
        }
        break;
      case 'object':
        if (e.nodeType === 1) {
          element = e;
        }
        break;
    }
    return $(element);
  };

//--------------------------------------------------[document.addStyleRules]
  /**
   * 添加样式规则。
   * @name document.addStyleRules
   * @function
   * @param {Array} rules 包含样式规则的数组，其中每一项为一条规则。
   */
  var dynamicStyleSheet;
  document.addStyleRules = function(rules) {
    if (!dynamicStyleSheet) {
      document.head.appendChild(document.createElement('style'));
      var styleSheets = document.styleSheets;
      dynamicStyleSheet = styleSheets[styleSheets.length - 1];
    }
    rules.forEach(function(rule) {
      if (dynamicStyleSheet.insertRule) {
        dynamicStyleSheet.insertRule(rule, dynamicStyleSheet.cssRules.length);
      } else {
        var lBraceIndex = rule.indexOf('{');
        var rBraceIndex = rule.indexOf('}');
        var selectors = rule.slice(0, lBraceIndex);
        var declarations = rule.slice(lBraceIndex + 1, rBraceIndex);
        selectors.split(separator).forEach(function(selector) {
          dynamicStyleSheet.addRule(selector, declarations);
        });
      }
    });
  };

//--------------------------------------------------[document.loadScript]
  /**
   * 加载脚本。
   * @name document.loadScript
   * @function
   * @param {string} url 脚本文件的路径。
   * @param {Object} [options] 可选参数。
   * @param {string} options.charset 脚本文件的字符集。
   * @param {Function} options.onLoad 加载完毕后的回调。
   *   该函数被调用时 this 的值为加载本脚本时创建的 SCRIPT 元素。
   */
  document.loadScript = function(url, options) {
    options = options || {};
    var head = document.head;
    var script = document.createElement('script');
    if (options.charset) {
      script.charset = options.charset;
    }
    script.src = url;
    script.onload = script.onreadystatechange = function() {
      if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
        this.onload = this.onreadystatechange = null;
        head.removeChild(script);
        if (options.onLoad) {
          options.onLoad.call(this);
        }
      }
    };
    // http://bugs.jquery.com/ticket/2709
    head.insertBefore(script, head.firstChild);
  };

//--------------------------------------------------[document.preloadImages]
  /**
   * 预加载图片。
   * @name document.preloadImages
   * @function
   * @param {Array} urlArray 包含需预加载的图片路径的数组。
   * @param {Function} [onLoad] 每个图片加载完毕后的回调。
   *   该函数被调用时 this 的值为已完成加载的 IMG 元素。
   */
  document.preloadImages = function(urlArray, onLoad) {
    urlArray.forEach(function(url) {
      var img = new Image();
      if (onLoad) {
        img.onload = function() {
          img.onload = null;
          onLoad.call(img);
        };
      }
      img.src = url;
    });
  };

//--------------------------------------------------[document.on]
  /**
   * 为 document 添加事件监听器。
   * @name document.on
   * @function
   * @param {string} name 事件名称，细节请参考 Element.prototype.on 的同名参数。
   * @param {Function} listener 监听器，细节请参考 Element.prototype.on 的同名参数。
   * @returns {Object} document 对象。
   * @description
   *   特殊事件：domready
   *   <ul>
   *     <li>在文档可用时触发，只能添加监听器，不能删除监听器，因此不能使用标签。</li>
   *     <li>不会有事件对象作为参数传入监听器。</li>
   *     <li>如果在此事件触发后添加此类型的监听器，这个新添加的监听器将立即被调用。</li>
   *   </ul>
   */
  var domready = function() {
    // 保存 domready 事件的监听器。
    var listeners = [];

    // 调用监听器。
    var callListener = function(listener) {
      // 将 listener 的 this 设置为 document。
      // 不会传入事件对象。
      setTimeout(function() {
        listener.call(document);
      }, 0);
    };

    // 分发 domready 事件，监听器在调用后会被删除。
    var distributeEvent = function() {
      // IE6 IE7 IE8 可能调用两次。
      if (listeners) {
        // http://bugs.jquery.com/ticket/5443
        if (document.body) {
          listeners.forEach(callListener);
          listeners = null;
        } else {
          setTimeout(distributeEvent, 10);
        }
      }
    };

    // 视情况绑定及清理分发器。
    var distributor;
    if ('addEventListener' in document) {
      distributor = function() {
        document.removeEventListener('DOMContentLoaded', distributor, false);
        window.removeEventListener('load', distributor, false);
        distributeEvent();
      };
      document.addEventListener('DOMContentLoaded', distributor, false);
      window.addEventListener('load', distributor, false);
    } else {
      // 第二个参数在 doScrollCheck 成功时使用。
      distributor = function(_, domIsReady) {
        if (domIsReady || document.readyState === 'complete') {
          document.detachEvent('onreadystatechange', distributor);
          window.detachEvent('onload', distributor);
          distributeEvent();
        }
      };
      document.attachEvent('onreadystatechange', distributor);
      window.attachEvent('onload', distributor);
      // http://javascript.nwbox.com/IEContentLoaded/
      if (window == top && html.doScroll) {
        (function doScrollCheck() {
          try {
            html.doScroll('left');
          } catch (e) {
            setTimeout(doScrollCheck, 10);
            return;
          }
          distributor(null, true);
        })();
      }
    }

    return {
      addListener: function(listener) {
        listeners ? listeners.push(listener) : callListener(listener);
      }
    };

  }();

  document.on = function(name, listener) {
    var filteredName = name.split(separator)
        .filter(function(name) {
          if (name === 'domready') {
            domready.addListener(listener);
            return false;
          }
          return true;
        })
        .join(', ');
    if (filteredName) {
      Element.prototype.on.call(document, filteredName, listener);
    }
    return this;
  };

//--------------------------------------------------[document.off]
  /**
   * 删除 document 上已添加的事件监听器。
   * @name document.off
   * @function
   * @param {string} name 事件名称，细节请参考 Element.prototype.off 的同名参数。
   * @returns {Object} document 对象。
   */
  document.off = Element.prototype.off;

//--------------------------------------------------[document.fire]
  /**
   * 触发 document 的某类事件。
   * @name document.fire
   * @function
   * @param {string} type 事件类型。
   * @param {Object} [data] 在事件对象上附加的数据。
   * @returns {Object} document 对象。
   */
  document.fire = Element.prototype.fire;

//==================================================[DOM 扩展 - window]
  /*
   * 为 window 扩展新特性，除与视口相关的方法外，还提供与 Element 类似的事件机制。
   * 与视口相关的方法（getXXX）在 document.body 解析后方可使用。
   *
   * 扩展方法：
   *   window.$
   *   window.getClientSize
   *   window.getScrollSize
   *   window.getPageOffset
   *   window.on
   *   window.off
   *   window.fire
   */

  /**
   * 扩展 DOMWindow 对象。
   * @name window
   * @namespace
   */

  window.uid = 'window';

//--------------------------------------------------[window.$]
  /**
   * 对 document.$ 的引用。
   * @name window.$
   * @function
   * @description
   *   在编写应用代码时，可以使用 $ 来代替 document.$。
   */
  window.$ = document.$;

//--------------------------------------------------[window.getClientSize]
  /**
   * 获取视口可视区域的尺寸。
   * @name window.getClientSize
   * @function
   * @returns {Object} 尺寸，包含 width 和 height 两个数字类型的属性，单位为像素。
   * @description
   *   IE9 Firefox Chrome Safari Opera 有 window.innerWidth 和 window.innerHeight 属性，但这个值是包含了滚动条宽度的值。
   *   为保持一致性，不使用这两个属性来获取文档可视区域尺寸。
   * @see http://www.w3.org/TR/cssom-view/#dom-window-innerwidth
   * @see http://www.w3.org/TR/cssom-view/#dom-window-innerheight
   */
  window.getClientSize = function() {
    return {
      width: html.clientWidth,
      height: html.clientHeight
    };
  };

//--------------------------------------------------[window.getScrollSize]
  /**
   * 获取视口滚动区域的尺寸。当内容不足以充满视口可视区域时，返回视口可视区域的尺寸。
   * @name window.getScrollSize
   * @function
   * @returns {Object} 尺寸，包含 width 和 height 两个数字类型的属性，单位为像素。
   */
  window.getScrollSize = function() {
    var body = document.body;
    return {
      width: Math.max(html.scrollWidth, body.scrollWidth, html.clientWidth),
      height: Math.max(html.scrollHeight, body.scrollHeight, html.clientHeight)
    };
  };

//--------------------------------------------------[window.getPageOffset]
  /**
   * 获取视口的滚动偏移量。
   * @name window.getPageOffset
   * @function
   * @returns {Object} 坐标，包含 x 和 y 两个数字类型的属性，单位为像素。
   * @description
   *   一些浏览器支持 window.scrollX/window.scrollY 或 window.pageXOffset/window.pageYOffset 直接获取视口的滚动偏移量。
   *   这里使用通用性更强的方法实现。
   * @see http://w3help.org/zh-cn/causes/BX9008
   */
  window.getPageOffset = function() {
    var body = document.body;
    return {
      x: html.scrollLeft || body.scrollLeft,
      y: html.scrollTop || body.scrollTop
    };
  };

//--------------------------------------------------[window.on]
  /**
   * 为 window 添加事件监听器。
   * @name window.on
   * @function
   * @param {string} name 事件名称，细节请参考 Element.prototype.on 的同名参数。
   * @param {Function} listener 监听器，细节请参考 Element.prototype.on 的同名参数。
   * @returns {Object} window 对象。
   * @description
   *   特殊事件：beforeunload
   *   <ul>
   *     <li>该事件只能存在一个监听器，因此不能使用标签。</li>
   *     <li>不会有事件对象作为参数传入监听器。</li>
   *     <li>如果添加了多个监听器，则只有最后添加的生效。</li>
   *     <li>可以删除当前生效的监听器。</li>
   *   </ul>
   * @see http://w3help.org/zh-cn/causes/BX2047
   */
  window.on = function(name, listener) {
    var filteredName = name.split(separator)
        .filter(function(name) {
          if (name === 'beforeunload') {
            window.onbeforeunload = function() {
              // 将 listener 的 this 设置为 window（不调用 call 也是 window）。
              // 不会传入事件对象。
              return listener.call(window);
            };
            return false;
          }
          return true;
        })
        .join(', ');
    if (filteredName) {
      Element.prototype.on.call(window, filteredName, listener);
    }
    return this;
  };

//--------------------------------------------------[window.off]
  /**
   * 删除 window 上已添加的事件监听器。
   * @name window.off
   * @function
   * @param {string} name 事件名称，细节请参考 Element.prototype.off 的同名参数。
   * @returns {Object} window 对象。
   */
  window.off = function(name) {
    var filteredName = name.split(separator)
        .filter(function(name) {
          if (name === 'beforeunload') {
            window.onbeforeunload = null;
            return false;
          }
          return true;
        })
        .join(', ');
    if (filteredName) {
      Element.prototype.off.call(window, filteredName);
    }
    return this;
  };

//--------------------------------------------------[window.fire]
  /**
   * 触发 window 的某类事件。
   * @name window.fire
   * @function
   * @param {string} type 事件类型。
   * @param {Object} [data] 在事件对象上附加的数据。
   * @returns {Object} window 对象。
   */
  window.fire = Element.prototype.fire;

//==================================================[DOM 扩展 - IE6 固定定位]
  /*
   * 修复 IE6 不支持 position: fixed 的问题。
   *
   * 注意：
   *   目前仅考虑 direction: ltr 的情况，并且不支持嵌套使用 position: fixed。事实上这两点不会影响现有的绝大部分需求。
   *   目前仅支持在 left right top bottom 上使用像素长度来设置偏移量。修复后，目标元素的样式中有 left 则 right 失效，有 top 则 bottom 失效。
   *   因此要保证兼容，在应用中设置 position: fixed 的元素应有明确的尺寸设定，并只使用（left right top bottom）的（像素长度）来定位，否则在 IE6 中的表现会有差异。
   *
   * 处理流程：
   *   position 的修改 = 启用/禁用修复，如果已启用修复，并且 display 不是 none，则同时启用表达式。
   *   display 的修改 = 如果已启用修复，则启用/禁用表达式。
   *   left/right/top/bottom 的修改 = 如果已启用修复，则调整 specifiedValue。如果已启用表达式，则更新表达式。
   *   由于 IE6 设置为 position: absolute 的元素的 right bottom 定位与 BODY 元素的 position 有关，并且表现怪异，因此设置表达式时仍使用 left top 实现。
   *   这样处理的附加好处是不必在每次更新表达式时启用/禁用设置在 right bottom 上的表达式。
   *
   * 参考：
   *   http://www.qianduan.net/fix-ie6-dont-support-position-fixed-bug.html
   *
   * 实测结果：
   *   X = 页面背景图片固定，背景图直接放在 HTML 上即可，若要放在 BODY 上，还要加上 background-attachment: fixed。
   *   A = 为元素添加 CSS 表达式。
   *   B = 为元素添加事件监听器，在监听器中修改元素的位置。
   *   X + A 可行，X + B 不可行。
   */
  if (navigator.isIE6) {
    // 保存已修复的元素的偏移量及是否启用的数据。
    /*
     * <Object fixedData> {
     *   left: <Object> {
     *     specifiedValue: <string specifiedValue>,
     *     usedValue: <number usedValue>
     *   },
     *   right: <Object> {
     *     specifiedValue: <string specifiedValue>,
     *     usedValue: <number usedValue>
     *   },
     *   top: <Object> {
     *     specifiedValue: <string specifiedValue>,
     *     usedValue: <number usedValue>
     *   },
     *   bottom: <Object> {
     *     specifiedValue: <string specifiedValue>,
     *     usedValue: <number usedValue>
     *   },
     *   enabled: <boolean enabled>
     * }
     */

    // 设置页面背景。
    html.style.backgroundImage = 'url(about:blank)';

    // 添加 CSS 表达式。
    var setExpressions = function($element, fixedData) {
      var left = fixedData.left.usedValue;
      var top = fixedData.top.usedValue;
      var right = fixedData.right.usedValue;
      var bottom = fixedData.bottom.usedValue;
      if (isFinite(left)) {
        $element.style.setExpression('left', '(document && document.documentElement.scrollLeft + ' + left + ') + "px"');
      } else {
        $element.style.setExpression('left', '(document && (document.documentElement.scrollLeft + document.documentElement.clientWidth - this.offsetWidth - (parseInt(this.currentStyle.marginLeft, 10) || 0) - (parseInt(this.currentStyle.marginRight, 10) || 0)) - ' + right + ') + "px"');
      }
      if (isFinite(top)) {
        $element.style.setExpression('top', '(document && document.documentElement.scrollTop + ' + top + ') + "px"');
      } else {
        $element.style.setExpression('top', '(document && (document.documentElement.scrollTop + document.documentElement.clientHeight - this.offsetHeight - (parseInt(this.currentStyle.marginTop, 10) || 0) - (parseInt(this.currentStyle.marginBottom, 10) || 0)) - ' + bottom + ') + "px"');
      }
    };

    // 删除 CSS 表达式。
    var removeExpressions = function($element) {
      $element.style.removeExpression('left');
      $element.style.removeExpression('top');
    };

    // IE6 获取 position 特性时的特殊处理。
    specialCSSPropertyGetter.position = function($element) {
      return $element._fixedData_ ? 'fixed' : $element.currentStyle.position;
    };

    // IE6 设置 position 特性时的特殊处理。
    specialCSSPropertySetter.position = function($element, propertyValue) {
      // 本元素的偏移量数据，如果未启用修复则不存在。
      var fixedData = $element._fixedData_;
      if (propertyValue.toLowerCase() === 'fixed') {
        // 设置固定定位。
        if (!fixedData) {
          // 启用修复。
          fixedData = $element._fixedData_ = {left: {}, right: {}, top: {}, bottom: {}, enabled: false};
          var offset = {};
          var currentStyle = $element.currentStyle;
          fixedData.left.specifiedValue = offset.left = currentStyle.left;
          fixedData.right.specifiedValue = offset.right = currentStyle.right;
          fixedData.top.specifiedValue = offset.top = currentStyle.top;
          fixedData.bottom.specifiedValue = offset.bottom = currentStyle.bottom;
          Object.forEach(offset, function(length, side, offset) {
            fixedData[side].usedValue = offset[side] = length.endsWith('px') ? parseInt(length, 10) : NaN;
          });
          // 如果 usedValue 中横向或纵向的两个值均为 NaN，则给 left 或 top 赋值为当前该元素相对于页面的偏移量。
          if (isNaN(fixedData.left.usedValue) && isNaN(fixedData.right.usedValue)) {
            fixedData.left.usedValue = html.scrollLeft + $element.getClientRect().left - (parseInt($element.currentStyle.marginLeft, 10) || 0);
          }
          if (isNaN(fixedData.top.usedValue) && isNaN(fixedData.bottom.usedValue)) {
            fixedData.top.usedValue = html.scrollTop + $element.getClientRect().top - (parseInt($element.currentStyle.marginTop, 10) || 0);
          }
          // 如果元素已被渲染（暂不考虑祖先级元素未被渲染的情况），启用表达式。
          if ($element.currentStyle.display !== 'none') {
            fixedData.enabled = true;
            setExpressions($element, fixedData);
          }
        }
        propertyValue = 'absolute';
      } else {
        // 设置非固定定位。
        if (fixedData) {
          // 禁用修复。
          removeExpressions($element);
          $element.style.left = fixedData.left.specifiedValue;
          $element.style.right = fixedData.right.specifiedValue;
          $element.style.top = fixedData.top.specifiedValue;
          $element.style.bottom = fixedData.bottom.specifiedValue;
          $element.removeAttribute('fixedData');
        }
      }
      // 设置样式。
      $element.style.position = propertyValue;
    };

    // IE6 设置 display 特性时的特殊处理。
    specialCSSPropertySetter.display = function($element, propertyValue) {
      var fixedData = $element._fixedData_;
      // 仅在本元素已启用修复的情况下需要进行的处理。
      if (fixedData) {
        if (propertyValue.toLowerCase() === 'none') {
          // 不渲染元素，禁用表达式。
          if (fixedData.enabled) {
            fixedData.enabled = false;
            removeExpressions($element);
          }
        } else {
          // 渲染元素，启用表达式。
          if (!fixedData.enabled) {
            fixedData.enabled = true;
            setExpressions($element, fixedData);
          }
        }
      }
      // 设置样式。
      $element.style.display = propertyValue;
    };

    // IE6 获取 left/right/top/bottom 特性时的特殊处理。
    var getOffset = function($element, propertyName) {
      var fixedData = $element._fixedData_;
      return fixedData ? fixedData[propertyName].specifiedValue : $element.currentStyle[propertyName];
    };

    // IE6 设置 left/right/top/bottom 特性时的特殊处理。
    var setOffset = function($element, propertyName, propertyValue) {
      var fixedData = $element._fixedData_;
      // 仅在本元素已启用修复的情况下需要进行的处理。
      if (fixedData) {
        fixedData[propertyName].specifiedValue = propertyValue;
        // 如果值可用，更新使用值。
        if (propertyValue.endsWith('px')) {
          var usedValue = parseInt(propertyValue, 10);
          if (fixedData[propertyName].usedValue !== usedValue) {
            fixedData[propertyName].usedValue = usedValue;
            // 如果表达式已启用，更新表达式。
            if (fixedData.enabled) {
              setExpressions($element, fixedData);
            }
          }
        }
      } else {
        // 设置样式。
        $element.style[propertyName] = propertyValue;
      }
    };

    ['left', 'right', 'top', 'bottom'].forEach(function(side) {
      specialCSSPropertyGetter[side] = function($element) {
        return getOffset($element, side);
      };
      specialCSSPropertySetter[side] = function($element, propertyValue) {
        setOffset($element, side, propertyValue);
      };
    });

    // 在 IE6 中使用 CSS Expression 自动处理固定定位。
    document.addStyleRules(['* { behavior: expression(document.fixIE6Styles(this)); }']);
//    window.fixCount = 0;
    document.fixIE6Styles = function(element) {
//      window.fixCount++;
      if (element.currentStyle.position === 'fixed') {
        element.currentStyleDisplayValue = element.currentStyle.display;
        element.style.display = 'none';
        setTimeout(function() {
          element.style.display = element.currentStyleDisplayValue;
          $(element).setStyle('position', 'fixed');
        }, 0);
      }
      element.style.behavior = 'none';
    };

  }

})();
