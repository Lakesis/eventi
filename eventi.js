/*	
	http://www.youtube.com/watch?v=kHML8pMfPGA
*/

if (typeof window.Event.prototype.preventDefault != 'function'){	// IE
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
	},
	currentHandler
	;

	// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
	var isEventSupported = function(eventName) {
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
		var ieListener;
		if(isEventSupported(eventType)){
			// DOM events
			if (typeof element != 'undefined'){
				if ('addEventListener' in document.documentElement) element.addEventListener(eventType, listener, false);
				else{
					ieListener = function(){listener.call(element);}; 
					element.attachEvent('on' + eventType, ieListener, false);
				}
			}else console.log('Trying to attatch ' + eventType + ' to an undefined element');
		}
		// Custom events
		if (typeof listeners[eventType] == "undefined"){
			listeners[eventType] = [];
		}
		listeners[eventType].push({'element':element,'listener': ieListener || listener});
	};
	
	// FIRING METHOD
	
	var fireWrapper = function(event, data) {
		if('addEventListener' in document.documentElement){		// Event handler execution wrapping (Non IE)
			document.addEventListener('eventWrapper', function(e){ 
				currentHandler.call(event.currentTarget, event, data);
				document.removeEventListener('eventWrapper',arguments.callee, false);
			});		
			var e =  document.createEvent('Event');
			e.initEvent('eventWrapper', false, false);
			document.dispatchEvent(e);
		} else{													// Event handler execution wrapping (IE)
			document.documentElement.eventWrapper = 0; 
			document.documentElement.attachEvent("onpropertychange", function(e) {
				if (e.propertyName == "eventWrapper") {
					currentHandler.call(event.currentTarget, event, data);
					document.documentElement.detachEvent("onpropertychange",arguments.callee);
				}
			});
			document.documentElement.eventWrapper++;
		}
	};
	
	Eventi.fire = function(event, element, data){
		if (typeof event == 'string'){
			event = {type: event};
			event.target =  event.srcElement = element || document;
			event.currentTarget = event.target;
			event.bubbling = true;
			event.preventDefault = function(){}; // TODO?
			event.stopPropagation = function(){ this.bubbling = false}; // Turn into a class?
		} 
		var thisEventListeners = listeners[event.type];
		for (var i=0, length = thisEventListeners.length; i < length; i++){	// Handler iteration 
			if (typeof element != 'undefined'){
				if (thisEventListeners[i].element === event.currentTarget){
					currentHandler = thisEventListeners[i].listener;
					fireWrapper(event, data);
				} 
				if (element.parentNode !== null && event.bubbling){ // Event bubbling 
					event.currentTarget = element.parentNode;
					if (event.currentTarget === document.body) event.stopPropagation();
					Eventi.fire(event, element.parentNode, data);	
				}
			} else {
				currentHandler = thisEventListeners[i].listener;
				fireWrapper(event, data);
			}
		}
	};
	
	// REMOVING METHOD
	Eventi.del = function(eventType, element){
		var thisEventListeners = listeners[eventType];
		if(isEventSupported(eventType)){
		// DOM events
			for (var i=0, length = thisEventListeners.length; i < length; i++){
				if(typeof element != 'undefined'){
					if (thisEventListeners[i].element === element){
						if ('removeEventListener' in document.documentElement) element.removeEventListener(eventType,thisEventListeners[i].listener);
						else element.detachEvent('on' + eventType,thisEventListeners[i].listener);
					}
				} else {
					if ('removeEventListener' in document.documentElement) thisEventListeners[i].element.removeEventListener(eventType,thisEventListeners[i].listener);
					else thisEventListeners[i].element.detachEvent('on' + eventType,thisEventListeners[i].listener);
				}
			}
		}		
		// Custom events
		if(typeof element == 'undefined'){					// No target element removes all events attached to the type
			thisEventListeners = []; 
		} else {
			for (var i=0, length = thisEventListeners.length; i < length; i++){
				if (thisEventListeners[i].element === element) thisEventListeners.splice(i,1);				
			}
		}
	};
		
	return Eventi;
	
})(Eventi || {}, window, document);