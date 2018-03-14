define(function(require, exports, module){
	'require:nomunge,exports:nomunge,module:nomunge';

	require('./js/plugins/private/map/jquery.ol.map-cmd');

	(function($){
		function OlMapTest(options){
			this.options = options;
		}

		OlMapTest.prototype.init = function(){
			this.loadMap();
			this.initEvent();
		};

		OlMapTest.prototype.loadMap = function(){
			var scope = this;
			this.$map = $('#ol_map').olMap({
				centerPoint: [112.97601699829102, 28.195033121678538],
				tileUrl: 'http://localhost:8090/Gis/static_map/',
				pointsUrl: 'point.json',
				pointsSize: 3,
				minZoom: 3,
				maxZoom : 17,
				defaultZoom: 17,
				cluster: true
			});

			this.$map.olMap('getMap').on('singleclick', function(e){
				var saveLonAndLat = ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');

				console.log(saveLonAndLat);
				var data = Utils.lonAndLatFromNumberToString(saveLonAndLat);
				console.log(data);
				console.log(Utils.lonAndLatFromNumberToString({longitude: saveLonAndLat[0], latitude : saveLonAndLat[1]}));
				console.log(Utils.lonAndLatFromNumberToString(saveLonAndLat.join()));

				console.log(Utils.lonAndLatFromStringToNumber([data.longitude, data.latitude]));
				console.log(Utils.lonAndLatFromStringToNumber(data));
				console.log(Utils.lonAndLatFromStringToNumber(data.longitude+ ',' +data.latitude));

				saveLonAndLat[0] = -saveLonAndLat[0]; saveLonAndLat[1] = -saveLonAndLat[1];
				console.log(saveLonAndLat);
				var data = Utils.lonAndLatFromNumberToString(saveLonAndLat);
				console.log(data);
				console.log(Utils.lonAndLatFromNumberToString({longitude: saveLonAndLat[0], latitude : saveLonAndLat[1]}));
				console.log(Utils.lonAndLatFromNumberToString(saveLonAndLat.join()));

				console.log(Utils.lonAndLatFromStringToNumber([data.longitude, data.latitude]));
				console.log(Utils.lonAndLatFromStringToNumber(data));
				console.log(Utils.lonAndLatFromStringToNumber(data.longitude+ ',' +data.latitude));

				scope.$map.olMap('changePointStyle', {id: '40288189497d7be401497d8661f80004', type: 'selected'});
			});
		};

		OlMapTest.prototype.initEvent = function(){
			var scope = this;
			$('#add_point').on('click', function(e){
				var result = scope.$map.olMap('addPoint', {
					"id": "40288189497d7be401497d8661f80005",
					"name": "五一广场西南角?",
					"longitude": 112.97281699829102,
					"latitude": 28.192933121678538
				});

				var icon = result.success ? 1 : 5;
				layer.msg(result.msg, {icon: icon});
			});
		};

		OlMapTest.load = function(options){
			var olMapTest = new OlMapTest(options);

			olMapTest.init();
		};

		module.exports = OlMapTest;

	}(jQuery));
});