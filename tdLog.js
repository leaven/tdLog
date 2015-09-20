/**
 
 * @file 基于talking data的事件统计系统
 
 * @author 李炜
 
 * @date 2015/09/18
 
 * @refer  https://www.talkingdata.com/app/document_web/index.jsp?statistics
 
 * @usage 
 	***************************************************
 	*
 	* 1、在dom上标记data-log作为打点占位符
 	*
 	* 2、参数约定 
 	* * {EventId} 标记主事件
 	* * {Label} 标记子事件
 	* * {MapKv} 事件的参数信息，描绘发生事件时的属性和场景
 	* 
 	* 3、越接近事件源的dom优先级越高，可以覆盖上层的log属性
 	*
 	* 4、PV作为页面pv统计，在进入页面的时候触发，传入page参数
 	*
 	***************************************************
 * 
 */

	
	DDBus.Log = {
		
		root: 'BODY',

		pv: function(page) {
			var _pvPid;

			if(typeof page === 'undefined') {
				return;
			}
			
			if(typeof TDAPP !== 'undefined') {
				TDAPP.onEvent(page);
			}else {
				//不确定何时TDAPP能加载进来
				_pvPid = setInterval(function() {
					
					if(typeof TDAPP !== 'undefined') {
						TDAPP.onEvent(page);
						clearInterval(_pvPid);
					}
				}, 1000);
			}
		},
		
		init: function() {
			var logParams = {},
				me = this;

			function deepLook(e) {
				var $se = $(e),
					data = $se.data('log');

				//递归出口
				if($se[0].nodeName == me.root || data && data.lookup == false) {
					return false;
				
				}else if(data) {
					logParams = $.extend({}, data, logParams);
					deepLook($se.parent());
				
				}else {
					deepLook($se.parent());
				}
			}
			
			$('body').on('click', '[data-log]', function(e) {
				logParams = {};

				deepLook(e.target);

				var EventId = logParams.EventId,
					Label = logParams.Label,
					MapKv = logParams.MapKv;

				if(typeof TDAPP !== 'undefined') {
					
					if(typeof EventId !== 'undefined' && typeof Label !== 'undefined' && typeof MapKv !== 'undefined') {
						TDAPP.onEvent(EventId, Label, MapKv);
						return;
					}

					if(typeof EventId !== 'undefined' && typeof Label !== 'undefined') {
						TDAPP.onEvent(EventId, Label);
						return;
					}

					if(typeof EventId !== 'undefined') {
						TDAPP.onEvent(EventId);
						return;
					}
				}
			});
		}
	}