# BindJS
BindJS is an easy implementation for data binding either bidirectional or one-way binding. BindJS helps you to focus your app logic and forget about data binding with ui dom elements with easy markup declarations:
<ul>
  <li>BindJS supports bidirectional data binding and provides simple interface to access/update app data and ui preferences.</li>
  <li>BindJS supports one-way data binding with binding reference feature.</li>
  <li>BindJS has ability to specify the mapping between app data and dom element properties.</li>
</ul>

# BindJS Markups
<ul>
  <li>
    <b>bindjs-id</b>: the current bind id for dom element. Based on bind ids sequence, binding context will be determine.
  </li>
  <li><b>bindjs-value</b>: the bind value for dom element, value will be either dom element property or attrbiute. This value will be bound to app context and will be referenced by bind id path</li>
    <li><b>bindjs-ref</b>: creates a reference to some bound dom element with app context. This is the support for one-way data binding, if the referenced bind context changed, this dom will be updated as well but not versa vice.</li>
</ul>

# Examples
More sample codes and descriptions will be attached.
```html
<script src="bind-js.js"></script>
<div bindjs-id="app">
	<div>
		<span>App name and version:</span>
		<b><span bindjs-id="name">test</span></b>
		<b><span bindjs-id="version">V1</span></b>
	</div>	
</div>
<br/>
<div>app json: <b><span bindjs-ref="app"></span></b></div>
<script>
	// Get bind context for app.
	var app = BindJS.context('app');

	// Update value for app.name
	app.name.val('TestApp');

	// Update value for app.version
	app.version.val('V1.1');

	// Gets app context as json string.
	var appJson = app.val();
	console.log(appJson);
</script>
```
```
<body><div bindjs-id="app">
	<div>
		<span>App name and version:</span>
		<b><span bindjs-id="name">TestApp</span></b>
		<b><span bindjs-id="version">V1.1</span></b>
	</div>	
</div>
<br>
<div>app json: <b><span bindjs-ref="app">{"name":"TestApp","version":"V1.1"}</span></b></div>
```
# What is next?
<ul>
  <li>Adding support to bind array data.</li>
  <li>Adding support for runtime doms. (Currently binding contexts are just registered for static doms in the page) </li>
  <li>Adding ability to bind dom events with app context.</li>
</ul>

# Thank you!
