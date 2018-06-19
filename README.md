# BindJS
BindJS is an easy implementation for data binding either bidirectional or one-way binding. BindJS helps you to focus your app logic and forget about data binding with ui dom elements with easy markup declarations:
<ul>
  <li>BindJS supports bidirectional data binding and provides simple interface to access/update app data and ui preferences.</li>
  <li>BindJS supports one-way data binding with binding reference feature.</li>
  <li>BindJS has ability to specify the mapping between app data and dom element properties.</li>
  <li>BindJS has ability to create app contexts and sub contexts by using bind path.</li>
  <li>BindJS has ability to get app contexts data as json. with this, you can also update all view doms elements in app context by passing json input.</li>
</ul>

# BindJS Markups

BindJS has some predefined markups for dom elements. These markups are used for app context binding:

<table>
	<tr>
		<th>Markup</th>
		<th>Description</th>
	</tr>
	<tr>
		<td>bindjs-id</td>
		<td>
			the current bind id for dom element. Based on bind ids sequence (bind path), binding context will be determined.		</td>
	</tr>
	<tr>
		<td>bindjs-value</td>
		<td>
			the bind value for dom element, value will be either dom element property or attrbiute. This value will be bound 
			to app context and will be referenced by bind id path.
		</td>
	</tr>
	<tr>
		<td>bindjs-ref</td>
		<td>
			This is the support for one-way data binding. This is used to reference some bound dom element with app context,  			  if the referenced context is changed, this dom will be updated as well but not versa vice.
		</td>
	</tr>
</table>

# Examples
Note: More samples and descriptions will be attached.

<p>Please consider the basic example below:</p>

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

	// Get app context as json string.
	var appJson = app.val();
	console.log(appJson);
</script>
```
<b>HTML Result:</b>
<hr/>
<p>
	<div bindjs-id="app">
		<div>
			<span>App name and version:</span>
			<b><span bindjs-id="name">TestApp</span></b>
			<b><span bindjs-id="version">V1.1</span></b>
		</div>	
	</div>
	<br>
	<div>app json: <b><span bindjs-ref="app">{"name":"TestApp","version":"V1.1"}</span></b></div>
</p>
<hr/>

<p>
	In above example you can see that there is some dom elements with bindjs markups. <b>BindJS.context('app')</b> creates new 
	context for binding path 'app' (or dom element selector '[bindjs-id="app"]'). From html code above, you see that dom element with bindid 'app' has some descendants elements
	with bindjs-id, by this context 'app' will have the control for all descendants doms (name and version) so we have contexts:
	<b>app</b>, <b>app.name</b> and <b>app.version</b>.
</p>

<ul>
	<li>
		<b>app</b> is the parent context for app.name & app.value. For any context have sub contexts, the data from sub contexts will
		be serialized as json (also it accepts json string data).
	</li>	
	<li>
		Data for <b>app.name</b> or <b>app.version</b> will be some dom property/attribute for the bound element (by default it is 'this.innerText' for 
		non-input elements and 'this.value' for input elements). This is also applied for any single element context.
	</li>
	<li>
		The value for any single context (with no sub contexts) can be changed to some dom element property or attribute by 
		using <b>bindjs-value</b> markup. (will be described later)
	</li>
</ul>

<p> To get any context data, you can simple use 'val' method: </p>

```javascript
var nameVal = app.name.val() // Gets the context value for app.name, for above sample value will be el.innerText
			     // for the element with [bindjs-id='app'] [bindjs-id='name']
var versionVal = app.version.val() // Gets the context value for app.version, for above sample value will be el.innerText
				   // for the element with [bindjs-id='app'] [bindjs-id='version']
var appVal = app.val() // Gets the context value for app, for above sample value will be 
		    // {"name":app.name.val(),"version":app.version.val()}. Any context have sub contexts, its value will be
		    // serialized as a json object.
```
	
<p>Any context data can be changed also using val method:</p>

```javascript
app.name.val('MyApp') // Changes value of context app.name to 'MyApp'. element [bindjs-id='app'] [bindjs-id='name'] value will
		      // be also updated

app.val('{"name":"MyApp2","version":"V1.3"}') // Updates value for app context by json data. All sub contexts 
					     // (app.name and app.version) will be updated with data from json input.

```

# What is next?
<ul>
  <li>Adding support to bind array data.</li>
  <li>Adding support for runtime doms. (Currently binding contexts are just registered for static doms in the page) </li>
  <li>Adding ability to bind dom events with app context.</li>
</ul>

# Thank you!
