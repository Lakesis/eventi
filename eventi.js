/*	
	http://www.youtube.com/watch?v=kHML8pMfPGA
*/

var Eventi = (function(Eventi, window, document, undefined){
	
	var listeners = [],
	TAGNAMES = {
		'select':'input','change':'input',
		'submit':'form','reset':'form',
		'error':'img','load':'img','abort':'img'
	}
	;

	// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
	function isEventSupported(eventName) {
		var el = document.createElement(TAGNAMES[eventName] || 'div');
		eventName = 'on' + eventName;
		var isSupported = (eventName in el);
		if (!isSupported) {
			el.setAttribute(eventName, 'return;');
			isSupported = typeof el[eventName] == 'function';
		}
		el = null;
		return isSupported;
	}
	
	Eventi.add = function(eventType, element, listener){
		if(isEventSupported(eventType)){
			// DOM events
			if (typeof element != 'undefined'){
				if ('addEventListener' in document.documentElement) element.addEventListener(eventType, listener, false);
				else element.attachEvent('on' + eventType, listener, false);
			}else console.log('Trying to attatch ' + eventType + ' to an undefined element');
		}
		// Custom events
		if (typeof listeners[eventType] == "undefined"){
			listeners[eventType] = [];
		}
		listeners[eventType].push({'element':element,'listener':listener});
	};
	
	Eventi.fire = function(event, element, data){
		if (typeof event == 'string'){
			event = {type: event};
		} 
		if (!event.target) event.target = element || this;
		else if (!event.srcElement) event.srcElement = element || this;
		
		if(isEventSupported(event.type)){
			// DOM events
		}else{
			// Custom events
			var thisEventListeners = listeners[event.type];
			for (var i=0, length = thisEventListeners.length; i < length; i++){
				if (typeof element != 'undefined'){
					if (thisEventListeners[i].element === element) thisEventListeners[i].listener.call(element, event, data);
					else if(element.parentNode !== null ) Eventi.fire(event, element.parentNode, data);	// Event bubbling
				} else {
					thisEventListeners[i].listener.call(this, event, data);
				}
			}
		}	
	};
	
	Eventi.del = function(eventType, element){
		if(isEventSupported(eventType)){
			// DOM events
			if(typeof element != 'undefined'){
				var thisEventListeners = listeners[eventType];
				for (var i=0, length = thisEventListeners.length; i < length; i++){
					if (thisEventListeners[i].element === element){
						if ('addEventListener' in document.documentElement) element.removeEventListener(eventType,thisEventListeners[i].listener);
						else element.detachEvent(eventType,thisEventListeners[i].listener);
					}
				}
			}
		}else{		
			// Custom events
			var thisEventListeners = listeners[eventType];
			if(typeof element == 'undefined'){
				thisEventListeners.splice(0, thisEventListeners.length);
			} else {
				for (var i=0, length = thisEventListeners.length; i < length; i++){
					if (thisEventListeners[i].element === element) thisEventListeners.splice(i,1);				
				}
			}
		}
	};
		
	return Eventi;
	
})(Eventi || {}, window, document);