
# scomm
(**S**torage **Comm**unicator)
A cross browser window/tab messaging framework.

- one-to-one messages
- one-to-many messages
- VERY fast, low latency
- generic implementation- it doesn't care what commands & data is sent.
- Small footprint, lightweight
- Works with IE8+, FF, Chrome, Safari (any that support LocalStorage and PostMessage APIs)

I created this as a replacement for the slow and unreliable LocalConnection provided by Flash.
Under the hood it creates an iframe on the page and uses the LocalStorage and PostMessage apis to send messages across.

**Scomm will pollute the localStorage of the domain the iframe is hosted on!!** _(This by design)_

The default is to use the domain and protocol of the page. It is recommended that you change the origin to a special domain. (eg. scomm.example.com). If you need to communicate with secure AND insecure pages, simply hardcode the origin to point to https.

---

##scomm.hash
The unique id for the instance. Every window/tab will have one.

_
_

##scomm.debug
Setting this property to `true` sends debug information to the browser’s console.

###Optional

>By default, debug messages are sent to console.log. Set this property to a `function` to override the default debugging behavior.

_
_

##scomm.add(callback(cmd, data, sender))
Adds a callback to send messages to.

###Parameters

>`callback` : Function
>A callback to execute when a message is received.

###Return value:

>none

###Example

```javascript
scomm.add(function (cmd, data, sender) {
	if(cmd=="play"){
		audio.play();
	}
});
```

_
_

##scomm.remove(callback)
Stops a callback from being notified.

_
_

##scomm.ready(callback)
Adds a callback to be called after scomm is ready.

-
-

##scomm.send(cmd, data[, to, fail, ok])
Sends a command and data to one or many recipients.

The iframe must be finished loading before communication can start. When "ready", this function is added to the scomm object.

###Parameters

>`cmd` : String
>Any string you want. It should probably have something to do with the data.
>
>`data` : Object _(optional)_
>Anything you want to send. Although you should know that it will be JSON.stringify-ed so it has those limits.
>
>**Sending direct messages to other clients:**
>`to` : String
>The hash of a recipient. There is no built-in functionality for obtaining hashes from other clients.
>
>`fail` : Function _(optional)_
>A callback to execute when acknowledgement is not received within 2 seconds.
>
>`ok` : Function _(optional)_
>A callback to execute when a message is successfully acknowledged.

###Return value:

>none

###Example

See [example.html](https://github.com/williamwicks/scomm/blob/master/example.html)


License
=======

scomm is released under a **MIT License**:

Copyright (C) 2011 by William Wicks

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
