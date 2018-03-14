/**
 * 工具
 * 
 */
define(function(require) {
	'require:nomunge,exports:nomunge,module:nomunge';

	var Utils = {};

	/**
	 * 1.JavaScript基本对象类
	 */
	/**
	 * 类型判断
	 */
	(function(u) {
		function type(v) {
			var ts = Object.prototype.toString.call(v);// '[object Xx]'
			return ts.substring(8, ts.length - 1).toLowerCase();
		}

		function isArray(v) {
			return type(v) === 'array';
		}

		function isBoolean(v) {
			return type(v) === 'boolean';
		}

		function isDate(v) {
			return type(v) === 'date';
		}

		function isFunction(v) {
			return type(v) === 'function';
		}

		function isNumber(v) {
			return type(v) === 'number';
		}

		function isObject(v) {
			return type(v) === 'object';
		}

		function isRegexp(v) {
			return type(v) === 'regexp';
		}

		function isString(v) {
			return type(v) === 'string';
		}

		u.isArray = isArray;
		u.isBoolean = isBoolean;
		u.isDate = isDate;
		u.isFunction = isFunction;
		u.isNumber = isNumber;
		u.isObject = isObject;
		u.isRegexp = isRegexp;
		u.isString = isString;
	}(Utils));

	/**
	 * 判断一个对象是否为空（undefine、null、空字符串）
	 */
	(function(u) {
		function isEmpty(v, allowEmptyString) {
			return v === undefined || v === null
					|| (!allowEmptyString ? v === '' : false)
					|| (u.isArray(v) && v.length === 0);
		}

		u.isEmpty = isEmpty;
	}(Utils));

	/**
	 * 判断一个对象是否是原始类型
	 */
	(function(u) {
		function isPrimitive(v) {
			return u.isString(v) || u.isNumber(v) || u.isBoolean(v);
		}

		u.isPrimitive = isPrimitive;
	}(Utils));

	/**
	 * 除去字符串开头和末尾的空格
	 */
	(function(u) {
		var trimRe = /^\s+|\s+$/g;

		function trim(v) {
			if (u.isString(v)) {
				return v.replace(trimRe, '');
			}
			return v;
		}

		u.trim = trim;
	}(Utils));

	/**
	 * 字符串首字母大写
	 */
	(function(u) {
		function firstLetterToUpperCase(str) {
			if (!u.isString(str)) {
				return '';
			}

			return str.charAt(0).toUpperCase() + str.substring(1);
		}

		u.firstLetterToUpperCase = firstLetterToUpperCase;
	}(Utils));

	/**
	 * 如果一个字符串的长度小于指定的值，则在字符串的左侧（也就是前面）用指定的字符填充，直到字符串长度达到最小值
	 */
	(function(u) {
		function leftPad(string, size, character) {
			var result = String(string);
			character = character || ' ';
			while (result.length < size) {
				result = character + result;
			}
			return result;
		}

		u.leftPad = leftPad;
	}(Utils));

	/**
	 * 2.DOM类
	 */
	/**
	 * 浏览器判断
	 */
	(function(u) {
		// I think window.ActiveXObject would be in IE for a long time
		var isIE = window.ActiveXObject !== undefined;

		u.isIE = isIE;
		// window.XMLHttpRequest IE7+
		u.isIE6 = isIE && !!(document.compatMode && !window.XMLHttpRequest);
		// document.documentMode IE8+
		u.isIE7 = isIE && !!(window.XMLHttpRequest && !document.documentMode);
		// window.performance IE9+
		u.isIE8 = isIE && !!(document.documentMode && !window.performance);
		// window.applicationCache IE10+
		u.isIE9 = isIE && !!(window.performance && !window.applicationCache);
		// window.msCrypto IE11+
		u.isIE10 = isIE && !!(window.applicationCache && !window.msCrypto);
		u.isIE11 = isIE && !!window.msCrypto;
		u.isFirefox = !!(window.sidebar && (window.sidebar.addPanel || window.sidebar.addSearchEngine));
		u.isChrome = !!window.chrome;
		u.isSafari = /Constructor/.test(window.HTMLElement);

	}(Utils));

	/**
	 * id 产生器
	 */
	(function(u) {
		var AUTO_ID = 0, PREFIX = 'qst';

		function id(prefix) {
			return (prefix || PREFIX) + '_' + (AUTO_ID++);
		}

		u.id = id;
	}(Utils));

	/**
	 * 像素字符串中与Number的转化
	 */
	(function(u) {
		var pxRe = /px\s*$/, pxStr = 'px';

		function getNumberOfPixelString(pixelString) {
			if (u.isString(pixelString)) {
				return parseFloat(u.trim(pixelString.replace(pxRe, '')));
			}
			return undefined;
		}

		function parseNumberToPixelString(number) {
			if (u.isNumber(number)) {
				return '' + number + pxStr;
			}
			return undefined;
		}

		u.getNumberOfPixelString = getNumberOfPixelString;
		u.parseNumberToPixelString = parseNumberToPixelString;
	}(Utils));

	/**
	 * 层次控制
	 */
	(function(u) {
		try {
			globalIndex = globalIndex;
		} catch (e) {
			globalIndex = 1040;
		}

		function getZIndex() {
			return globalIndex++;
		}

		u.getZIndex = getZIndex;
	}(Utils));

	/**
	 * 获取应用上下文 - 相对于WebRoot的路径（结尾没有"/"）
	 */
	(function(u) {
		function getContext() {
			// NOTE: ctxPath is a global variable
			var href = window.location.href;
			var links = href.replace('//', '@').split('/');
			return ctxPath !== undefined ? ctxPath : links[0].replace('@', '//') + '/' + links[1];
		}

		u.getContext = getContext;
	}(Utils));

	/**
	 *
	 * 日期时间格式化
	 */
	(function(u){
		var DATETIME_PATTERN = 'yyyy-MM-dd HH:mm:ss';

		var dateRe = /-/g;

		function dateFormat(date, pattern){
			var format = pattern || DATETIME_PATTERN;

			if (u.isDate(date)) {
				var $1, o = {
					'M+' : date.getMonth() + 1, // 月份，从0开始算
					'(D|d)+' : date.getDate(), // 日期
					'(H|h)+' : date.getHours(), // 小时
					'm+' : date.getMinutes(), // 分钟
					'(S|s)+' : date.getSeconds() // 秒钟
				};

				if (/((Y|y)+)/.test(format)) {
					$1 = RegExp.$1, format = format.replace($1, String(date.getFullYear()).substr(4 - $1));
				}

				var key, value;
				for (key in o) { // 如果没有指定该参数，则子字符串将延续到 stringvar 的最后。
					if (new RegExp('(' + key + ')').test(format)) {
						$1 = RegExp.$1;
						value = String(o[key]);
						value = $1.length == 1 ? value : ('00' + value).substr(value.length);
						format = format.replace($1, value);
					}
				}
				return format;
			} else {
				return undefined;
			}
		}

		/**
		 * 格式化
		 * 
		 * @argument date Date/String 日期或日期字符串 精确到秒
		 * 
		 */
		function toMilliseconds(date) {
			if (u.isString(date)) {
				return Date.parse(date.replace(dateRe, '/'));
			} else if (u.isDate(date)) {
				return date.getTime() - date.getMilliseconds();
			} else {
				return undefined;
			}
		}

		u.dateFormat = dateFormat;
		u.toMilliseconds = toMilliseconds;
	}(Utils));

	/**
	 * 经纬度格式转换
	 *
	 * 两个方法不要互相转换，存在误差
	 */
	(function(u){
		/**
		 * 经纬度20.392777777777777 格式装换成S20°23'34"
		 *
		 * @argument data:可为数字，对象，字符串, 经度在前、纬度在后
		 */
		function lonAndLatFromNumberToString(data){
			var longitude, latitude;
			var lonStr = 'E', latStr = 'N';

			if(u.isArray(data)){
				longitude = data[0];
				latitude = data[1];
			} else if (u.isObject(data)){
				longitude = parseFloat(data.longitude);
				latitude = parseFloat(data.latitude);
			} else if (u.isString(data)){
				data = data.split(',');
				longitude = parseFloat(data[0]);
				latitude = parseFloat(data[1]);
			} else{
				return data;
			}

			lonStr = longitude < 0 ? 'W' : lonStr;
			latStr = latitude < 0 ? 'S' : latStr;
			longitude = Math.abs(longitude), latitude = Math.abs(latitude);

			var h = parseInt(longitude), m = parseInt((longitude - h) * 60), s = parseInt(((longitude - h) * 60 - m) * 60);
			longitude = lonStr + h + '°' + m + '\'' + s + '"';

			h = parseInt(latitude), m = parseInt((latitude - h) * 60), s = parseInt(((latitude - h) * 60 - m) * 60);
			latitude = latStr + h + '°' + m + '\'' + s + '"';

			return {longitude: longitude, latitude: latitude};
		}

		/**
		 * 经纬度S20°23'34" 格式装换成20.392777777777777
		 * 
		 * @argument data:可为数字，对象，字符串, 经度在前、纬度在后
		 */
		function lonAndLatFromStringToNumber(data){
			var longitude, latitude;

			if(u.isArray(data)){
				longitude = data[0];
				latitude = data[1];
			} else if (u.isObject(data)){
				longitude = data.longitude;
				latitude = data.latitude;
			} else if (u.isString(data)){
				data = data.split(',');
				longitude = data[0];
				latitude = data[1];
			} else{
				return data;
			}
			
			var isNegative = longitude.indexOf('W') > -1 ? true : false;
			longitude = getLonOrLat(longitude, isNegative);

			isNegative = latitude.indexOf('S') > -1 ? true : false;
			latitude = getLonOrLat(latitude, isNegative);

			return {longitude: longitude, latitude: latitude};
		}

		function getLonOrLat(data, isNegative){
			var index = data.indexOf('°'), h = parseInt(data.substring(1, index)), 
				m = parseFloat((data.substring(index + 1, data.indexOf('\''))/ 60).toFixed(10)),
				s = parseFloat((data.substring(data.indexOf('\'') + 1, data.length - 1)/ 3600).toFixed(10));
			data = h + m + s;

			return isNegative ? -data : data;
		}

		u.lonAndLatFromNumberToString = lonAndLatFromNumberToString;
		u.lonAndLatFromStringToNumber = lonAndLatFromStringToNumber;
	}(Utils));

	// 
	return Utils;
});