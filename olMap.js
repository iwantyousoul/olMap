define(function(require, exports, module){
	'require:nomunge,exports:nomunge,module:nomunge';

	require('./js/plugins/private/map/jquery.ol.map-cmd');

	var pointId = 1;
	(function($){
		function OlMapTest(options){
			this.options = options;
		}

		OlMapTest.prototype.init = function(){
			this.loadMap();
		};

		OlMapTest.prototype.loadMap = function(){
			var scope = this;
			this.$map = $('#ol_map').olMap({
				centerPoint: [112.97601699829102, 28.195033121678538],
				tileUrl: 'http://localhost:8091/Gis/static_map/',
				pointsUrl: './point.json',
				pointsSize: 3,
				method: 'POST',
				minZoom: 3,
				maxZoom : 17,
				defaultZoom: 17,
				cluster: false
			}).on('map.rightClick', function(e, coordinate){
				var result = scope.$map.olMap('addPoint', {
					"id": pointId,
					"name": "点位" + pointId,
					"longitude": coordinate[0],
					"latitude": coordinate[1]
				});

				pointId++

				var icon = result.success ? 1 : 5;
				layer.msg(result.msg, {icon: icon, time: 1000});
			}).on('map.click', function(e, d, a){
				console.log(d);
			});

			/*this.$map.olMap('getMap').on('singleclick', function(e){
				console.log(e);
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
			});*/
		};

		OlMapTest.load = function(options){
			var olMapTest = new OlMapTest(options);

			olMapTest.init();
		};

		module.exports = OlMapTest;

	}(jQuery));
});