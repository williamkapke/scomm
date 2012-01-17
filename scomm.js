if(!window.scomm)
(function(location){
	var origin = location.protocol + location.host,
		path = "/scomm.html",
		keyCheck = /^scomm\d{13}|scomm\*|scomm_/,
		handlers = [],
		callbacks = {},
		oks = {},
		readyList = [],
		hash = sessionStorage.scomm = "scomm"+(+new Date),
		log = (window.console && console.log ? function (m,d) {
			if (scomm.debug){
				if(isFunction(scomm.debug))
					scomm.debug(m, d);
				else console.log(m,d);
			}
		} : function(){}),
		ready,
		iframe = document.createElement("iframe");

	iframe.id = "scomm";
	iframe.src = origin+path+"#"+hash;
	iframe.width=0;
	iframe.height=0;
	iframe.style.border=0;

	function isFunction(obj) {
		return obj && Object.prototype.toString.call(obj) == "[object Function]";
	}
	function evnt(obj, evt, cb){
		if(obj.addEventListener)
			obj.addEventListener(evt, cb, false);
		else obj.attachEvent("on"+evt,cb);
	}

	scomm = {
		hash:hash,
		debug: window.location.search.indexOf("scomm=")>-1,
		add: function (callback) {
			if(!isFunction(callback)) return;
			handlers.push(callback);
			log("listener added");
		},
		remove: function (callback) {
			if (!isFunction(callback)) return;
			for (var i = 0, l = handlers.length; i < l; i++)
				if (handlers[i] === callback)
					handlers.splice(i, 1);
			log("listener removed");
		},
		ready: function(callback){
			if (!isFunction(callback)) return;
			readyList.push(callback);
		}
	};

	log("adding iframe");

	evnt(window, "message", function(e){
		log("message received from iframe", e.data);
		if(!ready){
			onready(e.data);
			return;
		}
		if(e.origin!=origin) return;
		process(e.data);
	});

	function onready(data){
		if(data.length != 18 && !keyCheck.test(data)) return;
		ready=1;

		scomm = {
			hash:hash,
			debug:scomm.debug,
			add:scomm.add,
			remove: scomm.remove,
			send: function(cmd, data, to, fail, ok){
				if(to==hash)
					throw new Error("You cannot talk to yourself");
				to = to||"scomm*";
				var msg = {cmd:cmd, data:data, sender:hash, ts:+new Date, to:to};
				if(to!="scomm*"){
					msg.token = setTimeout(function(){
						log("failed to send", msg);
						fail && fail(cmd, data, to);
					},2000);
					if(ok) oks[msg.token] = ok;
				}
				msg = to + JSON.stringify(msg);
				log("postMessage to iframe", msg);
				iframe.contentWindow.postMessage(msg, origin);
			},
			ready: function(cb){cb()}
		};

		log("iframe ready");

		var cb;
		while (cb = readyList.shift())
			cb();
		readyList = undefined;
	}
	document.body.appendChild(iframe);

	function process(msg){
		var key;
		msg = msg.replace(keyCheck, function(k){
			key = k;
			return "";
		});
		if(!key || (key!=hash && key!="scomm*" && key!="scomm_")){
			return;
		}

		var val = JSON.parse(msg);
		if(key=="scomm_"){
			if(val.cmd=="clear")
				trigger(val.cmd, null, null);
			else callbacks[val.callback].apply(this, val.args);
			return;
		}
		if(val.sender==hash) {
			log("ignoring ourself");
			return;
		}
		log("processing message", msg);

		//wants confirmation
		if(val.token){
			if(val.cmd){
				var ack = val.sender+JSON.stringify({sender:hash, ts:+new Date, to:val.sender, token:val.token});
				log("posting acknowledgement to iframe", ack);
				iframe.contentWindow.postMessage(ack, origin);
			}
			else {
				clearTimeout(val.token|0);
				log("message confirmed");
				var ok = oks[val.token];
				ok && delete oks[val.token] && ok();
				return;
			}
		}
		trigger(val.cmd, val.data, val.sender);
	}
	function trigger(cmd, data, sender){
		log("triggering handlers")
		for (var i = 0, l = handlers.length; i < l; i++)
			if(handlers[i](cmd, data, sender) === true)
				scomm.remove(handlers[i]);
	}
})(window.location);
