# BindJS
BindJS is an easy implementation for data binding either bidirectional or one-way binding. BindJS helps you to focus your app logic and forget about data binding with ui dom elements with easy markup declarations:
<ul>
  <li>BindJS supports bidirectional data binding and provides simple interface to access/update app data and ui preferences.</li>
  <li>BindJS supports one-way data binding with binding reference feature.</li>
  <li>BindJS has ability to specify the mapping between app data and dome element properties.</li>
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
Sample codes will be attached in a couple of days.

# What is next?
<ul>
  <li>Adding support to bind array data.</li>
  <li>Adding support for runtime doms. (Currently binding contexts are just registered for static doms in the page) </li>
  <li>Adding ability to bind dom events with app context.</li>
</ul>

# Thank you!
