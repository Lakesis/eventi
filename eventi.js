/*	
	http://www.youtube.com/watch?v=kHML8pMfPGA
*/

var Eventi = (function(Eventi, window, document, undefined){
	
	var listeners = [],
	ieDom = ('addEventListener' in document.documentElement)
	;
	
	Eventi.add = function(evenType, element, listener){
		if(eventType in document.documentElement){
			if (typeof element !== 'undefined'){
				if(!ieDom) element.addEventListener(eventType, listener, false);
				else element.attachEvent('on' + eventType, listener, false);
			}else console.log('Trying to attatch ' + eventType + ' to an undefined element');
		}else {
			if (typeof listeners[evenType] == "undefined"){
				listeners[evenType] = [];
			}
			listeners[evenType].push({'element':element,'listener':listener});
		}
	};
	
	Eventi.fire = function(event, element, data){
		if (typeof event == 'string'){
			event = {type: event};
		} 
		if (ieDom){
			if (!event.srcElement) event.srcElement = element || this;
		} else if (!event.target) event.target = element || this;
		
		var thisEventListeners = listeners[event.type];
		for (var i=0, length = thisEventListeners.length; i < length; i++){
			if (element !== undefined){
				if (thisEventListeners[i].element === element) thisEventListeners[i].listener.call(element, event, data);
				else Eventi.fire(event, element.parentNode, data);
			} else {
				thisEventListeners[i].listener.call(element, event, data);
			}
		}
	};
		
	return Eventi;
	
})(Eventi || {}, window, document);