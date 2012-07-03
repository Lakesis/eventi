/*	
	http://www.youtube.com/watch?v=kHML8pMfPGA
*/

if (typeof window.Event.prototype.preventDefault != 'function'){
	window.Event.prototype.preventDefault = function(){
		this.returnValue = false;
	};
}
if (typeof window.Event.prototype.stopPropagation != 'function'){
	window.Event.prototype.stopPropagation = function(){
		this.cancelBubble = true;
	};
}

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
	
	//	ATTACHING METHOD
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
	
	// FIRING METHOD
	Eventi.fire = function(event, element, data){
		if (typeof event == 'string'){
			event = {type: event};
		} 
		if (!event.target || !event.srcElement) event.target =  event.srcElement = element || this;
		
		if(isEventSupported(event.type)){
			// DOM events
			if ('dispatchEvent' in document.documentElement){	// Non IE
				var e =  document.createEvent('Event');
				e.initEvent(event.type, true, true);
				if(typeof element != 'undefined') element.dispatchEvent(e);
				else document.dispatchEvent(e);
			} else {											// IE
				var e =  document.createEventObject('Event');
				if(typeof element != 'undefined') element.fireEvent('on'+event.type, e);
				else document.fireEvent('on'+event.type, e);
			}
		}else{
			// Custom events
			var thisEventListeners = listeners[event.type],
			currentHandler
			;
			if('addEventListener' in document.documentElement){		// Event handler execution wrapping (Non IE)
				document.addEventListener('eventWrapper', function(e){
					currentHandler.call(event.target, event, data);
					this.removeEventListener('eventWrapper',arguments.callee, false);
				});		
				var fireWrapper = function(){
					var e =  document.createEvent('Event');
					e.initEvent('eventWrapper', false, false);
					document.dispatchEvent(e);
				};
				for (var i=0, length = thisEventListeners.length; i < length; i++){	// Handler iteration
					if (typeof element != 'undefined'){
						if (thisEventListeners[i].element === element){
							currentHandler = thisEventListeners[i].listener;
							fireWrapper();
						} else if(element.parentNode !== null ) Eventi.fire(event, element.parentNode, data);	// Event bubbling
					} else {
						currentHandler = thisEventListeners[i].listener;
						fireWrapper();
					}
				}
			}else{
			
			}
		}	
	};
	
	// REMOVING METHOD
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