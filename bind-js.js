/**
 * Copyright (C) 2018 bind-js Haitham Mubarak 
 * 
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 * 
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 * 
 * @BindJS is an easy implementation for data binding either bidirectional or one-way direction.
 * 
 */
(function () {

    const BINDJS_DOM_ID = "bindjs-id";
    const BINDJS_DOM_VALUE = "bindjs-value";
    const BINDJS_DOM_MAP = "bindjs-map";
    const BINDJS_DOM_REF = "bindjs-ref";
    const BINDJS_TREE_SEPARATOR = ".";
    const BINDJS_REFERENCE_SEPARATOR = ":";
    const BINDJS_DOM_ATTRIBUTE = "@";
    const BINDJS_ID_REGEX = /^[\-_a-zA-Z0-9]+$/;

    /**
     * BindJS Interface variable.
     */
    var BindJS;

    /**
     * Bidirectional data changes (Two ways data change).
     */
    var DataBinds = {}

    /**
     * Data changes in one way.
     */
    var ReferenceBinds = {}

    /*
     * ================================
     * Utility function defintions.
     *================================
     */
    /**
     * @param {boolean} condition 
     * @param {string} failMessage 
     */
    function assert(condition, failMessage) {
        if (!condition) {
            throw new Error(failMessage);
        }
    }
    /**
     * 
     * @param {*} object 
     * @param {*} property 
     * @param {*} value 
     */
    function defineProtectedProperty(object, property, value) {
        //object[property] = value;
        //return;
        Object.defineProperty(object, property, {
            value: value,
            writable: false
        });
    }
    /**
     * 
     * @param {*} dom 
     * @param {*} property 
     * @param {*} newValue 
     * @param {*} bindType 
     */
    function updateDom(dom, property, newValue, bindType) {
        if (bindType == DataBind.TYPE.ATTRIBUTE) {
            dom.setAttribute(property, newValue);
        } else {
            var tokens = property.split(BINDJS_TREE_SEPARATOR);
            var obj = dom;
            for (var i = 0; i < tokens.length; i++) {
                var tokenKey = tokens[i];
                if (i == tokens.length - 1) {
                    if (typeof obj[tokenKey] == 'function') {
                        obj[tokenKey](newValue);
                    } else if (typeof obj[tokenKey] == 'object') {
                        Object.assign(obj[tokenKey], JSON.parse(newValue));
                    } else {
                        obj[tokenKey] = newValue;
                    }

                } else {
                    obj = obj[tokenKey];
                }
            }
        }
    }

    /**
     * 
     * @param {*} reference 
     * @param {*} value 
     * @param {*} bindType 
     */
    function updateDomByReference(reference,value){
        updateDom(reference.dom, reference.key, value, reference.bindType);    
    }

    /**
     * 
     */
    function changeHandler(updateReferencesOnly) {
        /**
         * Notify contexts
         */
        if(!updateReferencesOnly){
            var context = BindJS.context(this.bindPath);
            var stopEvent = false;
            var changeEvent = {
                name : 'contextchange',
                original : context,
                stopPropagation : function(){
                    stopEvent = true;
                }
            }
            while(context != null && !stopEvent){
                if(typeof context.onchange == 'function'){
                    context.onchange(changeEvent);
                }
                if(typeof context._parentContext == 'function'){
                    context = context._parentContext();
                }else{
                    context = null;
                }
                
            }
        }

        /**
         * Notify references
         */
        var references = ReferenceBinds[this.bindPath] || [];
        for (var i = 0; i < references.length; i++) {
            var reference = references[i];
            //console.log('notify',reference,this.getValue())
            updateDomByReference(reference, this.getValue());
        }
    }
    /**
     * 
     */
    function createEmptyBind() {
        var obj = {};
        obj[BINDJS_TREE_SEPARATOR] = null;
        return obj;
    }
    /**
     * 
     * @param {*} propertyKey 
     */
    function getBindType(propertyKey) {
        var bindType = DataBind.TYPE.PROPERTY;
        if (propertyKey.startsWith(BINDJS_DOM_ATTRIBUTE)) {
            propertyKey = propertyKey.substring(1);
            bindType = DataBind.TYPE.ATTRIBUTE;
        }
        return {
            key: propertyKey,
            type: bindType
        }
    }
    /**
     * Checks and returns bound dom property with app context.
     * @param {*} bindDom 
     * @param {*} val 
     */
    function getDomBindjsValue(bindDom, val) {
        var bindDomValue = val || bindDom.getAttribute(BINDJS_DOM_VALUE);

        if (!bindDomValue) {
            var tagName = bindDom.tagName.toLowerCase();
            if (tagName == 'input') {
                bindDomValue = 'value';
            } else {
                bindDomValue = 'innerText';
            }
        }

        return bindDomValue;
    }

    /**
     * Used as an internal implemention for dom data/events binding.
     * 
     * @param {*} element 
     * @param {*} bindType 
     * @param {*} dataBindKey 
     * @param {*} changeEventName 
     * @param {*} bindPath 
     */
    var DataBind = function (element, bindType, dataBindKey, changeEventName, bindPath) {

        var bindDomMap = element.getAttribute(BINDJS_DOM_MAP) || '';
        var uiToModelMap = {};
        var modelToUiMap = {};
        var maps = bindDomMap.split('|');
        for (var i = 0; i < maps.length; i++) {
            var map = maps[i];
            var index = map.indexOf(':');
            index = index == -1 ? map.indexOf('=') : index;
            if (index == -1) {
                continue;
            }
            var key = map.substring(0, index);
            var value = map.substring(index + 1);

            modelToUiMap[key] = value;
            uiToModelMap[value] = key;
        }
        var dataBindKeyTokens = dataBindKey.split(BINDJS_TREE_SEPARATOR);
        this.getValue = function () {
            var returnValue;
            if (bindType == DataBind.TYPE.PROPERTY) {
                var value = element;
                for (var i = 0; i < dataBindKeyTokens.length; i++) {
                    var tokenKey = dataBindKeyTokens[i];
                    value = value[tokenKey];
                }
                value = typeof value == 'function' ? value() : value;
                returnValue = value != element ? value : null;
            } else {
                returnValue = element.getAttribute(dataBindKey);
            }

            if (uiToModelMap.hasOwnProperty(returnValue)) {
                return uiToModelMap[returnValue];
            } else {
                return returnValue;
            }

        }

        this.setValue = function (newValue) {
            if (modelToUiMap.hasOwnProperty(newValue)) {
                newValue = modelToUiMap[newValue];
            }
            if (newValue != this.getValue()) {
                updateDom(element, dataBindKey, newValue, bindType);
                changeHandler.apply(_self, [true])
            }
        }

        var _self = this;
        element.addEventListener(changeEventName, function () {
            changeHandler.apply(_self, [])
        });

        changeHandler.apply(this, [true]);

        this.dom = element;
        this.bindId = dataBindKey;

        this.bindPath = bindPath;

    }
    DataBind.TYPE = {
        ATTRIBUTE: "attribute", PROPERTY: "property"
    }

    /**
     * Context events
     */
    var ContextEvents = [
        'onchange'
    ];
    /*
     * Context functions
     */
    var ContextFunctions = {
        _parentContext: function () {
            var context;
            var parentPath = this.bindPath().replace(/(.*)\..+$/,"$1");
            if(parentPath != this.bindPath()){
                context = BindJS.context(parentPath);
            }else{
                context = null;
            }
            return context;
        },
        _propertyNames: function () {
            return Object.keys(this._properties());
        },
        _properties: function () {
            var _properties = {};
            var names = Object.getOwnPropertyNames(this);
            for (var i = 0; i < names.length; i++) {
                var name = names[i];
                if (this._isProperty(name)) {
                    _properties[name] = true;
                }
            }
            return _properties;
        },
        _isObject: function () {
            return this._propertyNames().length > 0;
        },
        _isProperty: function (key) {
            return key && ContextEvents.indexOf(key) == -1 &&
                !key.startsWith(BINDJS_TREE_SEPARATOR) && typeof this[key] != 'function';
        },
        dom: function () {
            return this[BINDJS_TREE_SEPARATOR].dom;
        },
        bindPath: function () {
            return this[BINDJS_TREE_SEPARATOR].bindPath;
        },
        foreach: function () {
            handler.apply(this, [])
            for (var key in this._properties()) {
                if (this._isProperty(key)) {
                    this[key].foreach(handler);
                }
            }
        },
        val: function () {
            assert(arguments.length == 0 || arguments.length == 1,
                "Expected one or zero arguments.");
            if (arguments.length == 0) {
                if (!this._isObject()) {
                    return this[BINDJS_TREE_SEPARATOR].getValue();
                } else {
                    var obj = {};
                    function update(obj, context) {
                        for (var key in context._properties()) {
                            if (context._isProperty(key)) {
                                var contextObj = context[key];
                                if (contextObj._isObject()) {
                                    obj[key] = {};
                                    update(obj[key], contextObj)
                                } else {
                                    obj[key] = contextObj.val();
                                }
                            }
                        }
                    }
                    update(obj, this);
                    return JSON.stringify(obj);
                }
            } else {
                var value = arguments[0];
                if (!this._isObject()) {
                    this[BINDJS_TREE_SEPARATOR].setValue(value);
                } else {
                    var obj = typeof value == 'object' ? value : JSON.parse(arguments[0] + '');
                    function update(obj, context) {
                        for (var key in context._properties()) {
                            if (context._isProperty(key)) {
                                var contextObj = context[key];
                                if (!contextObj._isObject()) {
                                    contextObj.val(obj[key]);
                                } else {
                                    update(obj[key], contextObj)
                                }
                            }
                        }
                    }
                    update(obj, this);
                }

            }
        }
    }

    /**
     * BindJS Interface.
     */
    BindJS = {
        context: function (query) {
            var context = DataBinds;
            if (typeof query == 'string') {
                var tokens = query.split(BINDJS_TREE_SEPARATOR);

                for (var i = 0; i < tokens.length; i++) {
                    var token = tokens[i];
                    context = context[token];
                    if (!context) {
                        throw new Error('No context found for ' + query)
                    }
                }
            }

            return context;
        },
        registerBindReference: function (dom, reference) {

            reference = reference || dom.getAttribute(BINDJS_DOM_REF);
            if (reference) {
                var tokens = reference.split(BINDJS_REFERENCE_SEPARATOR);
                var propertyKey;
                var bindRef;
                if (tokens.length == 1) {
                    propertyKey = getDomBindjsValue(dom, propertyKey);
                    bindRef = tokens[0];
                } else if (tokens.length >= 2) {
                    propertyKey = tokens[0];
                    bindRef = tokens[1];
                }

                var bindTypeObj = getBindType(propertyKey);
                var bindType = bindTypeObj.type;
                propertyKey = bindTypeObj.key;

                ReferenceBinds[bindRef] = ReferenceBinds[bindRef] || [];
                var referenceObj = {
                    dom: dom,
                    key: propertyKey,
                    bindType: bindType
                };
                ReferenceBinds[bindRef].push(referenceObj);
                // Update reference
                updateDomByReference(referenceObj, this.context(bindRef).val());
            } else {
                throw new Error('BindJS Reference is not defined.');
            }
        },
        registerBind: function (bindDom, dataBindsObject, path) {

            var tagName = bindDom.tagName.toLowerCase();

            var changeEventName;
            if (tagName == 'input') {
                changeEventName = 'change';
            } else {
                changeEventName = 'DOMSubtreeModified';
            }

            var bindDomValue = getDomBindjsValue(bindDom);
            try {
                var bindKey = bindDom.getAttribute(BINDJS_DOM_ID) || '';
                if (!bindKey.match(BINDJS_ID_REGEX)) {
                    throw new Error(BINDJS_DOM_ID + ' value "' + bindKey + 
                        '" has wrong format. Values should match regex "' + BINDJS_ID_REGEX + '"');
                }
                if (!dataBindsObject) {

                    if (!bindKey) {
                        throw new Error('Unable to register bind with empty bind id.');
                    }
                    while (bindDomId.parentNode != document) {
                        var parentNode = bindDomId.parentNode;
                        if (parentNode.hasAttribute(BINDJS_DOM_ID)) {
                            bindKey = parentNode.getAttribute(BINDJS_DOM_ID) + BINDJS_TREE_SEPARATOR + bindKey;
                        }
                    }
                    path = bindKey;
                    var bindKeyTokens = bindKey.split(BINDJS_TREE_SEPARATOR);
                    dataBindsObject = DataBinds;
                    for (var i = 0; i < bindKeyTokens.length; i++) {
                        var token = bindKeyTokens[i];
                        if (!dataBindsObject[token]) {
                            dataBindsObject[token] = createEmptyBind();
                        }

                        dataBindsObject = dataBindsObject[token];
                    }
                }

                var bindTypeObj = getBindType(bindDomValue);
                var bindType = bindTypeObj.type;
                bindDomValue = bindTypeObj.key;

                /**
                 * Defines bind context
                 */
                for (var i = 0; i < ContextEvents.length; i++) {
                    dataBindsObject[ContextEvents[i]] = null;
                }
                for (var functionName in ContextFunctions) {
                    defineProtectedProperty(dataBindsObject, functionName, ContextFunctions[functionName]);
                }
                defineProtectedProperty(dataBindsObject, BINDJS_TREE_SEPARATOR,
                    new DataBind(bindDom, bindType, bindDomValue, changeEventName, path));

            } catch (error) {
                //console.error(error);
                throw error;
            }
        }

    }

    document.addEventListener('DOMContentLoaded', function () {
 
        /**
         * Registers bindjs elements
         */
        function findAndBindDoms(parentDom, dataBindsObject, path) {
            for (var i = 0; i < parentDom.children.length; i++) {
                var child = parentDom.children[i];
                if (child.hasAttribute(BINDJS_DOM_ID)) {
                    bindjsDomId = child.getAttribute(BINDJS_DOM_ID);
                    defineProtectedProperty(dataBindsObject, bindjsDomId, createEmptyBind())
                    var newPath = path ? (path + BINDJS_TREE_SEPARATOR + bindjsDomId) : bindjsDomId;
                    BindJS.registerBind(child, dataBindsObject[bindjsDomId], newPath);
                    findAndBindDoms(child, dataBindsObject[bindjsDomId], newPath);
                } else {
                    findAndBindDoms(child, dataBindsObject, path);
                }
            }

        }
        findAndBindDoms(document.body, DataBinds, '');

        /**
         * Registers bindjs references
         */
        var bindJsReferences = document.body.querySelectorAll('[' + BINDJS_DOM_REF + ']');
        for (var i = 0; i < bindJsReferences.length; i++) {
            var child = bindJsReferences[i];
            BindJS.registerBindReference(child, child.getAttribute(BINDJS_DOM_REF));
        }
    })
    window.BindJS = BindJS;
})();
