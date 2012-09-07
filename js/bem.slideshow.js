(function () {
/** 
 * @author David Flanagan. 
 * getElements(classname, tagname, root):
 * Возвращает массив DOMэлементов, которые являются членами заданного класса,
 * соответствуют тегам с определенным именем и вложены в элемент root.
 *
 * Если аргумент classname не определен, отбор элементов производится
 * без учета принадлежности к какомуто определенному классу.
 * Если аргумент tagname не определен, отбор элементов производится без учета имени тега.
 * Если аргумент root не определен, поиск производится в объекте document.
 * Если аргумент root является строкой, он воспринимается как идентификатор
 * элемента и поиск производится методом getElementsById()
 * @description getElements from the book JavaScript: The Definitive Guide, 5th Edition.
 * Copyright 2006 O'Reilly Media, Inc. (ISBN: 0596101996) 
 */
var getElements = function (classname, tagname, root) {
	if (!root) root = document;
	else if (typeof root == "string") root = document.getElementById(root);
	if (!tagname) tagname = "*";
	var all = root.getElementsByTagName(tagname);
	if (!classname) return all;
	var elements = []; 
	for(var i = 0; i < all.length; i++) {
		if (isMember(all[i], classname)) 
			elements.push(all[i]);
	}
	return elements;
	function isMember(element, classname) {
		if (!element.className) return false; 
		if (element.className == classname) return true; 
		if (!(/\s+/.test(element.className))) return false;
		var c = element.className.split(/\s+/); 
		for(var i = 0; i < c.length; i++) { 
			if (c[i] == classname) return true; 
		}
		return false; 
	}
},
/**
 * Объект имеет метод загрузки сценария из внешнего источника
 * и свойство, где сохранен адрес библиотеки jQuery последней версии
 * на хосте googleapis.com
 * @type {!Object}
 */
	loadingScriptOut = {
		/**
		 * @author <a href=" http://stevesouders.com/efws/script-onload.php">Стив Соудерс</a>
		 * @param {String} src - адрес скрипта, который должен быть загружен
		 * @param {Function} callback - функция будет вызвана после успешной загрузки внешнего скрипта
		 * @param {Element} appendTo - html-элемент, куда будет загружен внешний скрипт, default: head.
		 */
		init : function(src, callback, callback_obj, appendTo) {
			/**
			 * сценарий, загружаемый на страницу из внешнего источника
			 * @type {Element} 
			 */
			var script = document.createElement('script');
	
			if (script.readyState && !script.onload) {
				script.onreadystatechange = function() {
					if ((script.readyState === "loaded" || script.readyState === "complete")
							&& !script.onloadDone) {
						script.onloadDone = true;
						if (typeof callback === 'function'){
							callback.call(callback_obj);
						}
					}
				};
			} else {
				script.onload = function() {
					if (!script.onloadDone) {
						script.onloadDone = true;
						if (typeof callback === 'function'){
							callback.call(callback_obj);
						}
					}
				};
			}
			script.type = 'text/javascript';
			script.src = src;
			if (!appendTo) {
				appendTo = document.documentElement.children[0];
			}
			appendTo.appendChild(script);
		},
		jQ : "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"
	},
/**
 * Функция-обертка для многократной установки обработчиков событий
 * @param {Element} el - элемент, на котором запускается событие
 * @param {String} type - тип события
 * @param {Function} fn - функция - обработчик события
 */
	addEvent = function (el, type, fn) {
					if ( typeof window.addEventListener === 'function'){el.addEventListener(type, fn, false)}
					else if (typeof document.attachEvent === 'function'){el.attachEvent("on" + type, fn)}
	},
/**
 * @author <a href="http://elkonina.ru">Konina Yelena</a>
 * Пространство имен для этого сайта
 * @namespace
 * @type {Object}
 */	
	BEM = BEM || {};
	
	// плавная смена фона для блока партнерских ссылок в центре страницы. это вариант для всех браузеров:
	/**
	 * Модуль слайдшоу на главной странице сайта:
	 * кликабельный логотип располагается на соответствующем 
	 * фоне (b-illustration). Принцип работы слайдшоу: внутри 
	 * div.b-illustration дополнительно создаются 2 элемента:
	 * div.b-illustration__front и div.b-illustration__behind и
	 * фон по очереди будет меняться в этих элементах, чтобы 
	 * обеспечить эффект растворения изображений.
	 * @type {{init: function, provideBy$: function}} 
	 */
BEM.slideshow = (function () {
	return {
		/**
		 * Реализация слайдшоу нативным образом для агентов,
		 * поддерживающих Transition
		 * @method slideshow
		 */
		init : function () {			
					/**
					 * локальная ссылка на глобальную функцию подключения обработчика события
					 * @type {Function} 
					 */
				var	addEvt = addEvent,								
					/**
					 * локальная ссылка на глобальную функцию загрузки скрипта из внешнего источника
					 * @type {Function} 
					 */
					loadjQ = loadingScriptOut,
					/**
					 * родительский элемент всего блока слайдшоу div.b-illustration
					 * @type {Element}
					 */
					illustration,
					/**
					 * Адрес изображения фона родительского элемента блока слайдшоу div.b-illustration,
					 * потом будет текущим адресом очередного фона
					 * @type {String}
					 */
					bgImg,
					/**
					 * Коллекция элементов ссылок логотипов, которые располагаются справа блока слайдшоу.
					 * В классе каждой ссылки задается "идентификатор" пути до изображения, которое будет для нее фоном
					 * @type {Element[]}
					 */
					logos,
					lng = 0,
					/**
					 * Массив строковых значений - "идентификаторов" путей до изображений на сервере,
					 * которые должны будут выступать фоном для кликабельных логотипов слайдшоу.
					 * @type {Array.<string>}
					 */
					src = [],
					i = 0, 					
					max = 0,
					/**
					 * один из двух элементов, чей фон будет обеспечивать "растворяющееся" слайдшоу,
					 * в коде стоит впереди. Cоответствующие css-правила описывают представление этих 
					 * элементов на странице
					 * @type {Element}
					 */
					front = document.createElement('div'),
					/**
					 * один из двух элементов, чей фон будет обеспечивать "растворяющееся" слайдшоу
					 * в коде стоит позади. Cоответствующие css-правила описывают представление этих 
					 * элементов на странице
					 * @type {Element}
					 */
					behind = document.createElement('div');
			if (typeof document.querySelector === "function") {	
				illustration = document.querySelector('.b-illustration');
				logos = document.querySelectorAll('.b-illustration__link');	
			} else {
				//поддержка IE7
				illustration = getElements('b-illustration')[0];
				logos = getElements('b-illustration__link');	
			}
				lng = logos.length;			
				front.className = 'b-illustration__front';
				behind.className = 'b-illustration__behind';					
				illustration.insertBefore(behind, illustration.children[0]);
				illustration.insertBefore(front, illustration.children[0]);			
				while (lng--) {
					if (lng!==0) src.unshift(logos[lng].className.replace(/(?:.+_)(.+)$/,"$1"));
					else src.push(logos[lng].className.replace(/(?:.+_)(.+)$/,"$1"));
				}
				max = src.length - 1;			
				if ( window.getComputedStyle ){
					bgImg = getComputedStyle(illustration, null).backgroundImage;
				} else if ( document.body.currentStyle ){
					bgImg = illustration.currentStyle.backgroundImage;
				}	
				front.style.backgroundImage = bgImg;
				illustration.style.backgroundImage = 'none';	
			//for agents supported Transition
			if ( (window.getComputedStyle &&
					(getComputedStyle(document.body, null)['webkitTransitionProperty']
					|| getComputedStyle(document.body, null)['MozTransitionProperty']
					|| getComputedStyle(document.body, null)['OTransitionProperty']))
				|| 		
				(document.body.currentStyle 
				&& document.body.currentStyle['msTransitionProperty'])) {
				/**
				 * Меняет фон и логотип слайдшоу, запускается с интервалом 5сек.
				 */
				var	changeViewNative = function() {
							if ((window.getComputedStyle && getComputedStyle(front, null).opacity == 1) || (document.body.currentStyle && front.currentStyle.opacity == 1)){
								front.style.opacity = 0;	
								behind.style.backgroundImage = bgImg.replace(/(_.{4}_)(.+)(\..{3})/,'$1'+src[i]+'$3');
								behind.style.opacity = 1;
							}
							else {
								front.style.backgroundImage = bgImg.replace(/(_.{4}_)(.+)(\..{3})/,'$1'+src[i]+'$3');
								front.style.opacity = 1;
								behind.style.opacity = 0;
							}
							logos[i].style.opacity = 0;	
							
							if ( i === max) i = 0;
							else i++;
							logos[i].style.opacity = 1;	
						};
				setInterval(changeViewNative, 5000);
				
			} else {
				/**
				 * Группа данных, передаваемых в метод с поддержкой jQuery
				 * @enum {(string|object|number|Element)}
				 */
				var data = {
					p1: bgImg, 
					p2: logos,
					p3: src, 
					p4: max, 
					p5: front, 
					p6: behind
				},
				byjQ = this.provideByjQuery;
			//for agents don't supported Transition
				loadjQ.init(loadjQ.jQ, function () {												
											 byjQ(data);
										}, document.body);
			}
		},
		/**
		 * Реализация слайдшоу с помощью библиотеки jQuery для агентов,
		 * не поддерживающих Transition
		 * @method slideshow
		 * @param {data} данные, определенные при инициации слайдшоу
		 * и переданные в объекте
		 */
		provideByjQuery : function () {
			var bgImage, logos, src, max, front, behind, i = 0;
			if (arguments.length !== 0) {
				bgImage = arguments[0]['p1'],
				logos = arguments[0]['p2'],
				src = arguments[0]['p3'],
				max = arguments[0]['p4'],					
				front = arguments[0]['p5'],
				behind = arguments[0]['p6'];
			} 
			if (typeof jQuery === 'function') {	
				// для IE7 & IE8 эмуляцмя белого фона для логотипов
				if ($('html').hasClass('ie7') || $('html').hasClass('ie8')) {	
					$('<div>').addClass('b-illustration__link-shadow').insertBefore($(logos[0]));
				}
				
				$(logos).each(function (i) {
					if (i !== 0) {
						$(this).css('opacity','0')
					}
				})
				var	changeView$ = function() {
					if ($(front).css('opacity') !== '0') {
							behind.style.backgroundImage = bgImage.replace(/(_.{4}_)(.+)(\..{3})/,'$1'+src[i]+'$3');
							$(behind).fadeTo(3000, 1);
							$(front).fadeTo(3000, 0);
						}
						else {
							front.style.backgroundImage = bgImage.replace(/(_.{4}_)(.+)(\..{3})/,'$1'+src[i]+'$3');
							$(front).fadeTo(3000, 1);
							$(behind).fadeTo(3000, 0);
						}
						$(logos[i]).fadeTo(3000, 0);			
						if ( i == max) i = 0;
						else i++;
						$(logos[i]).fadeTo(3000, 1);		
					};
				setInterval(changeView$, 5000);
			};
		}
	};
}());
/**
 * плавная смена фона для блока партнерских ссылок в центре страницы
 * работает только в chrome последней версии - chrome поддерживает
 * Transition фона элемента (backgroundImage).
 */
var slideshowChrome = function () {
	var illustration = document.querySelector('.b-illustration'),
		logos = document.querySelectorAll('.b-illustration__link'),
		lng = logos.length,
		bgImage = getComputedStyle(illustration, null).backgroundImage,
		i = 0, 
		src = [],
		max = 0;
	while (lng--) {
		if (lng!==0) src.unshift(logos[lng].className.replace(/(?:.+_)(.+)$/,"$1"));
		else src.push(logos[lng].className.replace(/(?:.+_)(.+)$/,"$1"));
	}
	max = src.length - 1;		
	//for agents supported Transition
	if ( (window.getComputedStyle &&
			(getComputedStyle(document.body, null)['webkitTransitionProperty']
			|| getComputedStyle(document.body, null)['MozTransitionProperty']
			|| getComputedStyle(document.body, null)['OTransitionProperty']))
		|| 		
		(document.body.currentStyle 
		&& document.body.currentStyle['msTransitionProperty'])) {		
		var	changeView = function() {
			illustration.style.backgroundImage = bgImage.replace(/(_.{4}_)(.+)(\..{3})/,'$1'+src[i]+'$3');
			logos[i].style.opacity = 0;			
			if ( i == max) i = 0;
			else i++;
			logos[i].style.opacity = 1;				
		};			
		setInterval(changeView, 5000);
	}
};

addEvent(window,'load', BEM.slideshow.init.call(BEM.slideshow))
}());

























