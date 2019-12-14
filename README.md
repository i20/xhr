1. [About](#about)
2. [Use it](#use-it)
    1. [Load the libraries](#load-the-libraries)
    2. [Make a request](#make-a-request)
3. [API Reference](#api-reference)
4. [In the pipe](#in-the-pipe)
5. [References](#references)

# About

**XHR.js** is a simple and lightweight AJAX request library. It integrates with [**Promise.js**](https://github.com/i20/promise) to allow you handling asynchronous requests as promises.

# Use it

## Load the libraries

To start using **XHR.js** just include the file with a traditionnal `<script>` tag without forgetting to load **Promise.js** first and you're good to go !

```html
<script type="text/javascript" src="Promise.js"></script>
<script type="text/javascript" src="XHR.js"></script>
```

## Make a request

You can then make a request by simply using the `XHR` function like this :

```javascript
var promise = XHR({
    method: 'GET',
    url: 'http://www.example.com/'
});
```

The `XHR` function takes an object of parameters as described in the [Request params section](#request-params).

Note that `XHR` returns a **Promise.js** promise, see [https://github.com/i20/promise]() for more information about dealing with promises.

## API Reference

`XHR.defaultParams = { ... }` is the default `XHR` configuration to use, it will be overloaded by any configuration set as argument of the `XHR` call. Available settings are :

- `url` : (mandatory) The URL to call via AJAX 
- `method` : (optionnal, defaults to `'GET'`) HTTP verb to use (GET, POST, PUT, DELETE, ...)
- `user` : (optionnal) Username when making requests with credentials
- `password` : (optionnal) Password when making requests with credentials
- `responseType` : (optionnal, defaults to `'auto'`) Type of response expected from the server, can be one of :
    - `'auto'` : Response type will be determined automatically by inspecting the `Content-Type` response header and result in one of the following
    - `'text'` : Response will not be transformed
    - `'json'` : Response will be parsed as a JSON string and the JSON object will be passed down the chain
    - `'xml'`: Response will be parsed as a DOM string and the DOM object will be passed down the chain
- `async` : (optionnal, defaults to `true`) Whether the call must be done asynchronously or not. There's really a few chances that you need to set it to `false` but if so, you can do it. Remember that synchronous requests are blocking and that the browser will freeze until the server has responded.
- `contentType` : (optionnal, defaults to `'application/x-www-form-urlencoded; charset=UTF-8'`) `Content-Type` request header sent to the server
- `headers` : (optionnal) Additionnal request headers to send to the server in the form `{ '<Header-Name>': 'header-value' }`. Notice that setting `Content-Type` here prevents `contentType` from being applied. 
- `data` : (optionnal) Data to send to the server when doing non GET requests.
- `cache` : (optionnal, defaults to `true`) Set to `false` if cache must be bypassed. It works by adding a random parameter to the URL.  


