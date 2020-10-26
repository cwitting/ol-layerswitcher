var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import Control from 'ol/control/Control';
import { unByKey } from 'ol/Observable';
var CSS_PREFIX = 'layer-switcher-';
/**
 * OpenLayers Layer Switcher Control.
 * See [the examples](./examples) for usage.
 * @constructor
 * @extends {ol/control/Control~Control}
 * @param {Object} opt_options Control options, extends ol/control/Control~Control#options adding:
 * @param {boolean} opt_options.startActive Whether panel is open when created. Defaults to false.
 * @param {String} opt_options.activationMode Event to use on the button to collapse or expand the panel.
 *   `'mouseover'` (default) the layerswitcher panel stays expanded while button or panel are hovered.
 *   `'click'` a click on the button toggles the layerswitcher visibility.
 * @param {String} opt_options.collapseLabel Text label to use for the expanded layerswitcher button. E.g.:
 *   `'»'` (default) or `'\u00BB'`, `'-'` or `'\u2212'`. Not visible if activation mode is `'mouseover'`
 * @param {String} opt_options.label Text label to use for the collapsed layerswitcher button. E.g.:
 *   `''` (default), `'«'` or `'\u00AB'`, `'+'`.
 * @param {String} opt_options.tipLabel the button tooltip.
 * @param {String} opt_options.collapseTipLabel the button tooltip when the panel is open.
 * @param {String} opt_options.groupSelectStyle either `'none'` - groups don't get a checkbox,
 *   `'children'` (default) groups have a checkbox and affect child visibility or
 *   `'group'` groups have a checkbox but do not alter child visibility (like QGIS).
 * @param {boolean} opt_options.reverse Reverse the layer order. Defaults to true.
 */
var LayerSwitcher = /** @class */ (function (_super) {
    __extends(LayerSwitcher, _super);
    function LayerSwitcher(opt_options) {
        var _this = this;
        var options = opt_options || {};
        // TODO Next: Rename to showButtonTitle
        var tipLabel = options.tipLabel ? options.tipLabel : 'Legend';
        // TODO Next: Rename to hideButtonTitle
        var collapseTipLabel = options.collapseTipLabel
            ? options.collapseTipLabel
            : 'Collapse legend';
        var element = document.createElement('div');
        _this = _super.call(this, { element: element, target: options.target }) || this;
        _this.activationMode = options.activationMode || 'mouseover';
        _this.startActive = options.startActive === true;
        // TODO Next: Rename to showButtonContent
        var label = options.label !== undefined ? options.label : '';
        // TODO Next: Rename to hideButtonContent
        var collapseLabel = options.collapseLabel !== undefined ? options.collapseLabel : '\u00BB';
        _this.groupSelectStyle = LayerSwitcher.getGroupSelectStyle(options.groupSelectStyle);
        _this.reverse = options.reverse !== false;
        _this.mapListeners = [];
        _this.hiddenClassName = 'ol-unselectable ol-control layer-switcher';
        if (LayerSwitcher.isTouchDevice_()) {
            _this.hiddenClassName += ' touch';
        }
        _this.shownClassName = 'shown';
        element.className = _this.hiddenClassName;
        var button = document.createElement('button');
        button.setAttribute('title', tipLabel);
        button.setAttribute('aria-label', tipLabel);
        element.appendChild(button);
        _this.panel = document.createElement('div');
        _this.panel.className = 'panel';
        element.appendChild(_this.panel);
        LayerSwitcher.enableTouchScroll_(_this.panel);
        var this_ = _this;
        button.textContent = label;
        element.classList.add(CSS_PREFIX + 'group-select-style-' + _this.groupSelectStyle);
        element.classList.add(CSS_PREFIX + 'activation-mode-' + _this.activationMode);
        if (_this.activationMode === 'click') {
            // TODO Next: Remove in favour of layer-switcher-activation-mode-click
            element.classList.add('activationModeClick');
            if (_this.startActive) {
                button.textContent = collapseLabel;
                button.setAttribute('title', collapseTipLabel);
                button.setAttribute('aria-label', collapseTipLabel);
            }
            button.onclick = function (e) {
                var evt = e || window.event;
                if (this_.element.classList.contains(this_.shownClassName)) {
                    this_.hidePanel();
                    button.textContent = label;
                    button.setAttribute('title', tipLabel);
                    button.setAttribute('aria-label', tipLabel);
                }
                else {
                    this_.showPanel();
                    button.textContent = collapseLabel;
                    button.setAttribute('title', collapseTipLabel);
                    button.setAttribute('aria-label', collapseTipLabel);
                }
                evt.preventDefault();
            };
        }
        else {
            button.onmouseover = function (e) {
                this_.showPanel();
            };
            button.onclick = function (e) {
                var evt = e || window.event;
                this_.showPanel();
                evt.preventDefault();
            };
            this_.panel.onmouseout = function (e) {
                var evt = e || window.event;
                if (!this_.panel.contains(evt.toElement || evt.relatedTarget)) {
                    this_.hidePanel();
                }
            };
        }
        return _this;
    }
    /**
     * Set the map instance the control is associated with.
     * @param {ol/Map~Map} map The map instance.
     */
    LayerSwitcher.prototype.setMap = function (map) {
        // Clean up listeners associated with the previous map
        for (var i = 0; i < this.mapListeners.length; i++) {
            unByKey(this.mapListeners[i]);
        }
        this.mapListeners.length = 0;
        // Wire up listeners etc. and store reference to new map
        _super.prototype.setMap.call(this, map);
        if (map) {
            if (this.startActive) {
                this.showPanel();
            }
            else {
                this.renderPanel();
            }
            if (this.activationMode !== 'click') {
                var this_ = this;
                this.mapListeners.push(map.on('pointerdown', function () {
                    this_.hidePanel();
                }));
            }
        }
    };
    /**
     * Show the layer panel.
     */
    LayerSwitcher.prototype.showPanel = function () {
        if (!this.element.classList.contains(this.shownClassName)) {
            this.element.classList.add(this.shownClassName);
            this.renderPanel();
        }
    };
    /**
     * Hide the layer panel.
     */
    LayerSwitcher.prototype.hidePanel = function () {
        if (this.element.classList.contains(this.shownClassName)) {
            this.element.classList.remove(this.shownClassName);
        }
    };
    /**
     * Re-draw the layer panel to represent the current state of the layers.
     */
    LayerSwitcher.prototype.renderPanel = function () {
        this.dispatchEvent('render');
        LayerSwitcher.renderPanel(this.getMap(), this.panel, {
            groupSelectStyle: this.groupSelectStyle,
            reverse: this.reverse
        });
        this.dispatchEvent('rendercomplete');
    };
    /**
     * **Static** Re-draw the layer panel to represent the current state of the layers.
     * @param {ol/Map~Map} map The OpenLayers Map instance to render layers for
     * @param {Element} panel The DOM Element into which the layer tree will be rendered
     * @param {Object} options Options for panel, group, and layers
     * @param {String} options.groupSelectStyle either `'none'` - groups don't get a checkbox,
     *   `'children'` (default) groups have a checkbox and affect child visibility or
     *   `'group'` groups have a checkbox but do not alter child visibility (like QGIS).
     * @param {boolean} options.reverse Reverse the layer order. Defaults to true.
     */
    LayerSwitcher.renderPanel = function (map, panel, options) {
        // Create the event.
        var render_event = new Event('render');
        // Dispatch the event.
        panel.dispatchEvent(render_event);
        options = options || {};
        options.groupSelectStyle = LayerSwitcher.getGroupSelectStyle(options.groupSelectStyle);
        LayerSwitcher.ensureTopVisibleBaseLayerShown_(map, options.groupSelectStyle);
        while (panel.firstChild) {
            panel.removeChild(panel.firstChild);
        }
        // Reset indeterminate state for all layers and groups before
        // applying based on groupSelectStyle
        LayerSwitcher.forEachRecursive(map, function (l, idx, a) {
            l.set('indeterminate', false);
        });
        if (options.groupSelectStyle === 'children' ||
            options.groupSelectStyle === 'none') {
            // Set visibile and indeterminate state of groups based on
            // their children's visibility
            LayerSwitcher.setGroupVisibility(map);
        }
        else if (options.groupSelectStyle === 'group') {
            // Set child indetermiate state based on their parent's visibility
            LayerSwitcher.setChildVisibility(map);
        }
        var ul = document.createElement('ul');
        panel.appendChild(ul);
        // passing two map arguments instead of lyr as we're passing the map as the root of the layers tree
        LayerSwitcher.renderLayers_(map, map, ul, options, function render(changedLyr) {
            // console.log('render');
            LayerSwitcher.renderPanel(map, panel, options);
        });
        // Create the event.
        var rendercomplete_event = new Event('rendercomplete');
        // Dispatch the event.
        panel.dispatchEvent(rendercomplete_event);
    };
    LayerSwitcher.isBaseGroup = function (lyr) {
        var lyrs = lyr.getLayers ? lyr.getLayers().getArray() : [];
        return lyrs.length && lyrs[0].get('type') === 'base';
    };
    LayerSwitcher.setGroupVisibility = function (map) {
        // Get a list of groups, with the deepest first
        var groups = LayerSwitcher.getGroupsAndLayers(map, function (l) {
            return l.getLayers && !l.get('combine') && !LayerSwitcher.isBaseGroup(l);
        }).reverse();
        // console.log(groups.map(g => g.get('title')));
        groups.forEach(function (group) {
            // TODO Can we use getLayersArray, is it public in the esm build?
            var descendantVisibility = group.getLayersArray().map(function (l) {
                var state = l.getVisible();
                // console.log('>', l.get('title'), state);
                return state;
            });
            // console.log(descendantVisibility);
            if (descendantVisibility.every(function (v) {
                return v === true;
            })) {
                group.setVisible(true);
                group.set('indeterminate', false);
            }
            else if (descendantVisibility.every(function (v) {
                return v === false;
            })) {
                group.setVisible(false);
                group.set('indeterminate', false);
            }
            else {
                group.setVisible(true);
                group.set('indeterminate', true);
            }
        });
    };
    LayerSwitcher.setChildVisibility = function (map) {
        // console.log('setChildVisibility');
        var groups = LayerSwitcher.getGroupsAndLayers(map, function (l) {
            return l.getLayers && !l.get('combine') && !LayerSwitcher.isBaseGroup(l);
        });
        groups.forEach(function (group) {
            // console.log(group.get('title'));
            var groupVisible = group.getVisible();
            var groupIndeterminate = group.get('indeterminate');
            group
                .getLayers()
                .getArray()
                .forEach(function (l) {
                // console.log('>', l.get('title'));
                l.set('indeterminate', false);
                if ((!groupVisible || groupIndeterminate) && l.getVisible()) {
                    l.set('indeterminate', true);
                }
            });
        });
    };
    /**
     * **Static** Ensure only the top-most base layer is visible if more than one is visible.
     * @param {ol/Map~Map} map The map instance.
     * @private
     */
    LayerSwitcher.ensureTopVisibleBaseLayerShown_ = function (map, groupSelectStyle) {
        var lastVisibleBaseLyr;
        LayerSwitcher.forEachRecursive(map, function (l, idx, a) {
            if (l.get('type') === 'base' && l.getVisible()) {
                lastVisibleBaseLyr = l;
            }
        });
        if (lastVisibleBaseLyr)
            LayerSwitcher.setVisible_(map, lastVisibleBaseLyr, true, groupSelectStyle);
    };
    LayerSwitcher.getGroupsAndLayers = function (lyr, filterFn) {
        var layers = [];
        filterFn =
            filterFn ||
                function (l, idx, a) {
                    return true;
                };
        LayerSwitcher.forEachRecursive(lyr, function (l, idx, a) {
            if (l.get('title')) {
                if (filterFn(l, idx, a)) {
                    layers.push(l);
                }
            }
        });
        return layers;
    };
    /**
     * **Static** Toggle the visible state of a layer.
     * Takes care of hiding other layers in the same exclusive group if the layer
     * is toggle to visible.
     * @private
     * @param {ol/Map~Map} map The map instance.
     * @param {ol/layer/Base~BaseLayer} lyr layer whose visibility will be toggled.
     * @param {Boolean} visible Set whether the layer is shown
     * @param {String} groupSelectStyle either:
     *   `'none'` - groups don't get a checkbox,
     *   `'children'` (default) groups have a checkbox and affect child visibility or
     *   `'group'` groups have a checkbox but do not alter child visibility (like QGIS).
     */
    LayerSwitcher.setVisible_ = function (map, lyr, visible, groupSelectStyle) {
        // console.log(lyr.get('title'), visible, groupSelectStyle);
        lyr.setVisible(visible);
        if (visible && lyr.get('type') === 'base') {
            // Hide all other base layers regardless of grouping
            LayerSwitcher.forEachRecursive(map, function (l, idx, a) {
                if (l != lyr && l.get('type') === 'base') {
                    l.setVisible(false);
                }
            });
        }
        if (lyr.getLayers &&
            !lyr.get('combine') &&
            groupSelectStyle === 'children') {
            lyr.getLayers().forEach(function (l) {
                LayerSwitcher.setVisible_(map, l, lyr.getVisible(), groupSelectStyle);
            });
        }
    };
    /**
     * **Static** Render all layers that are children of a group.
     * @private
     * @param {ol/Map~Map} map The map instance.
     * @param {ol/layer/Base~BaseLayer} lyr Layer to be rendered (should have a title property).
     * @param {Number} idx Position in parent group list.
     * @param {Object} options Options for groups and layers
     * @param {String} options.groupSelectStyle either `'none'` - groups don't get a checkbox,
     *   `'children'` (default) groups have a checkbox and affect child visibility or
     *   `'group'` groups have a checkbox but do not alter child visibility (like QGIS).
     * @param {boolean} options.reverse Reverse the layer order. Defaults to true.
     * @param {Function} render Callback for change event on layer
     * @returns {HTMLElement} List item containing layer control markup
     */
    LayerSwitcher.renderLayer_ = function (map, lyr, idx, options, render) {
        var li = document.createElement('li');
        var lyrTitle = lyr.get('title');
        var checkboxId = LayerSwitcher.uuid();
        var label = document.createElement('label');
        if (lyr.getLayers && !lyr.get('combine')) {
            var isBaseGroup = LayerSwitcher.isBaseGroup(lyr);
            li.classList.add('group');
            if (isBaseGroup) {
                li.classList.add(CSS_PREFIX + 'base-group');
            }
            // Group folding
            if (lyr.get('fold')) {
                li.classList.add(CSS_PREFIX + 'fold');
                li.classList.add(CSS_PREFIX + lyr.get('fold'));
                var btn = document.createElement('button');
                btn.onclick = function (e) {
                    var evt = e || window.event;
                    LayerSwitcher.toggleFold_(lyr, li);
                    evt.preventDefault();
                };
                li.appendChild(btn);
            }
            if (!isBaseGroup && options.groupSelectStyle != 'none') {
                var input_1 = document.createElement('input');
                input_1.type = 'checkbox';
                input_1.id = checkboxId;
                input_1.checked = lyr.getVisible();
                input_1.indeterminate = lyr.get('indeterminate');
                input_1.onchange = function (e) {
                    var target = e.target;
                    LayerSwitcher.setVisible_(map, lyr, target.checked, options.groupSelectStyle);
                    render(lyr);
                };
                li.appendChild(input_1);
                label.htmlFor = checkboxId;
            }
            label.innerHTML = lyrTitle;
            li.appendChild(label);
            var ul = document.createElement('ul');
            li.appendChild(ul);
            LayerSwitcher.renderLayers_(map, lyr, ul, options, render);
        }
        else {
            li.className = 'layer';
            var input = document.createElement('input');
            if (lyr.get('type') === 'base') {
                input.type = 'radio';
                input.name = 'base';
            }
            else {
                input.type = 'checkbox';
            }
            input.id = checkboxId;
            input.checked = lyr.get('visible');
            input.indeterminate = lyr.get('indeterminate');
            input.onchange = function (e) {
                var target = e.target;
                LayerSwitcher.setVisible_(map, lyr, target.checked, options.groupSelectStyle);
                render(lyr);
            };
            li.appendChild(input);
            label.htmlFor = checkboxId;
            label.innerHTML = lyrTitle;
            var rsl = map.getView().getResolution();
            if (rsl > lyr.getMaxResolution() || rsl < lyr.getMinResolution()) {
                label.className += ' disabled';
            }
            li.appendChild(label);
        }
        return li;
    };
    /**
     * **Static** Render all layers that are children of a group.
     * @private
     * @param {ol/Map~Map} map The map instance.
     * @param {ol/layer/Group~LayerGroup} lyr Group layer whose children will be rendered.
     * @param {Element} elm DOM element that children will be appended to.
     * @param {Object} options Options for groups and layers
     * @param {String} options.groupSelectStyle either `'none'` - groups don't get a checkbox,
     *   `'children'` (default) groups have a checkbox and affect child visibility or
     *   `'group'` groups have a checkbox but do not alter child visibility (like QGIS).
     * @param {boolean} options.reverse Reverse the layer order. Defaults to true.
     * @param {Function} render Callback for change event on layer
     */
    LayerSwitcher.renderLayers_ = function (map, lyr, elm, options, render) {
        var lyrs = lyr.getLayers().getArray().slice();
        if (options.reverse)
            lyrs = lyrs.reverse();
        for (var i = 0, l; i < lyrs.length; i++) {
            l = lyrs[i];
            if (l.get('title')) {
                elm.appendChild(LayerSwitcher.renderLayer_(map, l, i, options, render));
            }
        }
    };
    /**
     * **Static** Call the supplied function for each layer in the passed layer group
     * recursing nested groups.
     * @param {ol/layer/Group~LayerGroup} lyr The layer group to start iterating from.
     * @param {Function} fn Callback which will be called for each `ol/layer/Base~BaseLayer`
     * found under `lyr`. The signature for `fn` is the same as `ol/Collection~Collection#forEach`
     */
    LayerSwitcher.forEachRecursive = function (lyr, fn) {
        lyr.getLayers().forEach(function (lyr, idx, a) {
            fn(lyr, idx, a);
            if (lyr.getLayers) {
                LayerSwitcher.forEachRecursive(lyr, fn);
            }
        });
    };
    /**
     * **Static** Generate a UUID
     * Adapted from http://stackoverflow.com/a/2117523/526860
     * @returns {String} UUID
     */
    LayerSwitcher.uuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0, v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    };
    /**
     * @private
     * @desc Apply workaround to enable scrolling of overflowing content within an
     * element. Adapted from https://gist.github.com/chrismbarr/4107472
     * @param {HTMLElement} elm Element on which to enable touch scrolling
     */
    LayerSwitcher.enableTouchScroll_ = function (elm) {
        if (LayerSwitcher.isTouchDevice_()) {
            var scrollStartPos = 0;
            elm.addEventListener('touchstart', function (event) {
                scrollStartPos = this.scrollTop + event.touches[0].pageY;
            }, false);
            elm.addEventListener('touchmove', function (event) {
                this.scrollTop = scrollStartPos - event.touches[0].pageY;
            }, false);
        }
    };
    /**
     * @private
     * @desc Determine if the current browser supports touch events. Adapted from
     * https://gist.github.com/chrismbarr/4107472
     * @returns {Boolean} True if client can have 'TouchEvent' event
     */
    LayerSwitcher.isTouchDevice_ = function () {
        try {
            document.createEvent('TouchEvent');
            return true;
        }
        catch (e) {
            return false;
        }
    };
    /**
     * Fold/unfold layer group
     * @private
     * @param {ol/layer/Group~LayerGroup} lyr Layer group to fold/unfold
     * @param {HTMLElement} li List item containing layer group
     */
    LayerSwitcher.toggleFold_ = function (lyr, li) {
        li.classList.remove(CSS_PREFIX + lyr.get('fold'));
        lyr.set('fold', lyr.get('fold') === 'open' ? 'close' : 'open');
        li.classList.add(CSS_PREFIX + lyr.get('fold'));
    };
    /**
     * If a valid groupSelectStyle value is not provided then return the default
     * @private
     * @param {String} groupSelectStyle The string to check for validity
     * @returns {String} The value groupSelectStyle, if valid, the default otherwise
     */
    LayerSwitcher.getGroupSelectStyle = function (groupSelectStyle) {
        return ['none', 'children', 'group'].indexOf(groupSelectStyle) >= 0
            ? groupSelectStyle
            : 'children';
    };
    return LayerSwitcher;
}(Control));
export default LayerSwitcher;
// Expose LayerSwitcher as ol.control.LayerSwitcher if using a full build of
// OpenLayers
if (window.ol && window.ol.control) {
    window['ol']['control']['LayerSwitcher'] = LayerSwitcher;
}