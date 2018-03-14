/**
 * ol4 地图封装插件
 * 
 *	@author chenpeng 2018-01-25
 */
define(function(require, exports, module){
	'require:nomunge, exports: nomunge,module:nomunge';

	require('../../third_parties/ol4/ol.css');
	require('../../third_parties/ol4/ol-debug');

	(function($){
		$.olMap = function(){};

		$.extend($.olMap, {
			map: null, //当前地图对象

			mapView : null, //地图的视图

			baseLayer : null, //地图瓦片图层

			featureLayer: null, //地图点位图层

			featureSource: null,

			clusterSource: null,

			normalIconStyle: null, //正常点位样式

			selectedIconStyle: null, //选中点位样式

			/**
			 * 初始化点位正常样式
			 * 
			 * @argument iconURL 点位icon路径
			 */
			initNormalIconStyle : function(iconURL){
				$.olMap.normalIconStyle = new ol.style.Style({
		            image: new ol.style.Icon({
		                anchor: [0.5, 0.5],
		                anchorXUnits: 'fraction',
		                anchorYUnits: 'fraction',
		                src: iconURL
		            })
		        });
			},

			/**
			 * 初始化选中点位样式
			 * 
			 * @argument selectedIconURL 选中点位icon路径
			 */
			initSelectedIconStyle : function(selectedIconURL){
				$.olMap.selectedIconStyle = new ol.style.Style({
		            image: new ol.style.Icon({
		                anchor: [0.5, 0.5],
		                anchorXUnits: 'fraction',
		                anchorYUnits: 'fraction',
		                src: selectedIconURL
		            })
		        });
			},

			/**
			 * 改变点位样式
			 * 
			 * @argument data Object:{id, type}  type的值为normal或者selected 聚合模式下不能改变点位样式
			 */
			changePointStyle: function(data){
				var featureSource = $.olMap.featureSource, id = data.id, type = data.type;

				if(featureSource && id && !$.olMap.clusterSource){ 
	    			var feature = featureSource.getFeatureById(id);

	    			if(null != feature){
	    				if(!type || type == 'normal'){
	    					feature.setStyle($.olMap.initNormalIconStyle);
	    				}else if(type == 'selected'){
	    					feature.setStyle($.olMap.selectedIconStyle);
	    				}
	    			}
	    		}  
			},

			/**
			 * 设置获取显示地图的视图
			 *
			 * @argument centerPoint 地图中心点位(必填)
			 */
			initView : function(centerPoint, minZoom, maxZoom, defaultZoom){
				$.olMap.mapView = new ol.View({
	         	    minZoom: minZoom,
	         	    maxZoom: maxZoom,
	                zoom: defaultZoom,
	                center: ol.proj.transform(centerPoint, "EPSG:4326", "EPSG:3857")
		        });
			},

			/**
			 * 获取显示地图的视图
			 *
			 */
			getView: function(){
				return $.olMap.mapView;
			},

			/**
			 * 设置地图图层(对内)
			 *
			 * @argument tileUrl 瓦片地址URL必填
			 */
			initBaseLayer : function(tileUrl){
				$.olMap.baseLayer = new ol.layer.Tile({
		            useInterimTilesOnError: false,
		            source : new ol.source.XYZ({
		                tileUrlFunction: function(tileCoord, pixelRatio, projection){
			               	var template = tileUrl + "/{z}/{y}-{x}.png";
			               	var zRegEx = /\{z\}/g;
			               	var xRegEx = /\{x\}/g;
			               	var yRegEx = /\{y\}/g;

			               	if (!tileCoord) {
			                    return undefined;
			                } else {
			                	//前置0补全
			                    return template.replace(zRegEx, tileCoord[0].toString())
			                            .replace(xRegEx, function(){
			                           	var curSize = Math.pow(2, tileCoord[0]);
			                           	var x = Utils.leftPad((tileCoord[1] % curSize), 6, '0');
			                           	return x.toString();
			                        }).replace(yRegEx, function() {
			                            var curSize = Math.pow(2, tileCoord[0]);
			                            var y = Utils.leftPad(((-tileCoord[2] - 1) % curSize), 6, '0');
			                            return y.toString();
			                        });
			                }
		                }
	            	})
	        	});

	        	$.olMap.baseLayer.set('layerName', 'baseLayer');
			},

			/**
			 * 初始化地图图层(点位Feature在此图层上)
			 *
			 *	
			 */
			initFeatureLayer: function(){
				$.olMap.featureLayer = new ol.layer.Vector({
					 source: new ol.source.Vector({wrapX: false}),		
				});
				$.olMap.featureSource = $.olMap.featureLayer.getSource();
				$.olMap.featureSource.set('sourceName', 'featureSource');
				$.olMap.featureLayer.set('layerName', 'featureLayer');
			},

			/**
			 * 获取图层featureLayer
			 *
			 */
			getFeatureLayer: function(){
				return $.olMap.featureLayer;
			},

			/**
			 * 获取图层数据源
			 *
			 */
			getFeatureSource: function(){
				return $.olMap.featureSource;
			},

			/**
			 * 获取聚合图层数据源
			 *
			 */
			getClusterSource: function(){
				return $.olMap.clusterSource
			},

			/**
			 * 获取key值为value的layer
			 * 
			 * @argument key: layer的key值
			 * @argument value: key值对应的value
			 */
			getLayerByName : function(key, value){
				var layers = $.olMap.map.getLayers(), resultLayer = null;

				layers.forEach(function(layer, index, array){
		        	var findValue = layer.get(key);
		        	if(findValue == value){
		        		resultLayer = layer;

		        		return;
		        	}
		        }, this);

		        return resultLayer;
			},

			/**
			 * 创建地图
			 *
			 *
			 */
			createOlMap : function(showZoom){
				var $this = this.eq(0);
				var id = $this.attr('id');

				$.olMap.map = new ol.Map({
					/*controls: ol.control.defaults({
		            	zoom:  showZoom
		        	}),*/ //不生成缩放按钮
					layers : [$.olMap.baseLayer, $.olMap.featureLayer],
					target : id,
					view : $.olMap.mapView
				});

				showZoom ? '' : $this.find('.ol-zoom').hide(); //生成缩放按钮 是否隐藏缩放按钮

				$this = null;
			},

			//获取地图对象
			getMap : function(){
				return $.olMap.map;
			},

			//获取地图Controls
			getControls: function(){
				return $.olMap.map.getControls();
			},
			/**
			 * 获取聚合圆大小
			 * 
			 */
			calculateClusterInfo: function(resolution) {
		        $.olMap.maxFeatureCount = 0;
		        var features = $.olMap.clusterSource.getFeatures();
		        var feature, radius;
		        for (var i = features.length - 1; i >= 0; --i) {
		            feature = features[i];
		            var originalFeatures = feature.get('features');
			        var extent = ol.extent.createEmpty();
			        var j, jj;
			        for (j = 0, jj = originalFeatures.length; j < jj; ++j) {
			          ol.extent.extend(extent, originalFeatures[j].getGeometry().getExtent());
			        }
			        $.olMap.maxFeatureCount = Math.max($.olMap.maxFeatureCount, jj);
			        radius = 0.3 * (ol.extent.getWidth(extent) + ol.extent.getHeight(extent)) / resolution;
			        feature.set('radius', radius);
			    }
		    },

		    /**
			 * 获取聚合样式
			 */
			getLayerVectorStyle: function(feature, resolution){
				var size = feature.get('features').length;
            	if (resolution != $.olMap.currentResolution) {
			        $.olMap.calculateClusterInfo(resolution);
			        $.olMap.currentResolution = resolution;
			    }
		        if (size > 1) {
		            style = new ol.style.Style({
				        image: new ol.style.Circle({
				            radius: feature.get('radius'),
				            fill: new ol.style.Fill({
				            	//color: '#3399CC' 
				                color: [255, 153, 0, Math.min(0.8, 0.4 + (size / $.olMap.maxFeatureCount))]
				            })
				        }),
				        text: new ol.style.Text({
				            text: size.toString(),
				            fill: new ol.style.Fill({
						        color: '#fff'
						    }),
				            stroke: new ol.style.Stroke({
						        color: 'rgba(0, 0, 0, 0.6)',
						        width: 3
						    })
				        })
				    });
		            
		        }else{
		        	style = $.olMap.normalIconStyle;
		        }
		        return style;  
			},

			/**
			 * 获取点位features
			 *
			 * @argument datas Array 点位数据
			 */
			getPointsFeatures: function(datas){
				var features = [];
				var featureLayer = $.olMap.featureLayer;

				for(var i = 0; i < datas.length; i++){
					var data = datas[i];
					if(!featureLayer.getSource().getFeatureById(data.id)){
						var point = ol.proj.transform([parseFloat(data.longitude),parseFloat(data.latitude)], 'EPSG:4326', 'EPSG:3857'); 
						var popupStr = '';
		    			var iconFeature = new ol.Feature({
		    		        geometry: new ol.geom.Point(point),
		    		        popupContent: popupStr,
		    		        name: data.name
		    		    });  		
		    			iconFeature.setId(data.id);
		    			iconFeature.setStyle($.olMap.normalIconStyle);

		    			//featureLayer.getSource().addFeature(iconFeature);
					}

					features.push(iconFeature);
				}

				return features;
			},

			/**
			 * 添加单个点位
			 *
			 * @argument data Object: 点位数据
			 * @argument options Object: 参数对象
			 */
			addPoint: function(data){
				var $this = this.eq(0), result;
				var featureLayer = $.olMap.featureLayer, iconFeature;
				if(!$.olMap.featureSource.getFeatureById(data.id)){
					var point = ol.proj.transform([parseFloat(data.longitude),parseFloat(data.latitude)], 'EPSG:4326', 'EPSG:3857'); 
					var popupStr = '';
					
	    			iconFeature = new ol.Feature({
	    		        geometry: new ol.geom.Point(point),
	    		        popupContent: popupStr,
	    		        name: data.name
	    		    });  		
	    			iconFeature.setId(data.id);
	    			iconFeature.setStyle($.olMap.normalIconStyle);
	    			$.olMap.featureSource.addFeature(iconFeature);

	    			if($this.attr('data-cluster') == 'true' && $.olMap.clusterSource){
	    				$.olMap.clusterSource.refresh();
	    			}

	    			result = {success: true, msg: '点位添加成功!'};
				}else{
					result = {success: false, msg: '该点位已存在，请勿再次添加!'};
				}
				
				$this = null;
				return result;
			},

			/**
			 * 删除点位
			 *
			 * @argument id 点位ID
			 */
			removePoint: function(id){
				var featureLayer = $.olMap.featureLayer;
				if(featureLayer){
	    			var feature=featureLayer.getSource().getFeatureById(id);
	    			if(feature){
						featureLayer.getSource().removeFeature(feature);
	    				return true;
	    			} else {
	    				return false;
	    			}
	    		}
	    		return false;
			},

			/**
			 * 地图点击事件
			 *
			 */
			onMapClick: function(e, id){
				$.olMap.map.triggerHandler('singleclick', [id]);
			}
		});


		$.extend($.fn, {
			/**
			 * olMap
			 *	
			 * @argument options{} 1)centerPoint Array：地图中心点位[]， 2)tileUrl String: 瓦片地址URL，
			 *           3)pointsUrl String: 请求远程点位数据的URL，4)data Array: 本地数据点位数据，
			 *           5)minZoom Number：地图显示的最小层级(默认1)，6)maxZoom：地图显示的最大层级(默认17)，
			 *			 7)defaultZoom: 地图初始化显示的层级(默认14)，8)pointsSize Number：初始化显示的点位数量，
			 *           9)bgColor String: 地图背景色， 10)showZoom boolean: 是否显示缩放按钮，
			 *           11)iconURL String: 正常点位icon路径，12)selectedIconURL String：选中或当前点位icon路径，
			 *           13)cluster boolean 是否聚合显示(默认false)，14)clusterDistance Number:群集之间的像素距离(默认40)，
			 *           15) 
			 *         
			 */
			olMap : function(options){
				// 与国际化接轨，所有插件应保持此风格，确保唯一接口。
				if(options && Utils.isString(options)){
					var methodStr = options, method = $.olMap[methodStr];
					if(method && $.isFunction(method)){
						options = arguments[1];
						return method.call(this, options);
					}
				}

				//init 
				options = options || {}; //避免undefined

				var $this = this.eq(0);
				var rendered = 'data-olMapRendered';

				//地图已渲染
				if($this.attr(rendered) || $this.attr(rendered) == 'false'){
					$this = null;
					return this;
				}

				//地图显示层级设置
				var zoom = options.defaultZoom;
				var minZoom = options.minZoom;
				var maxZoom = options.maxZoom;
				minZoom = minZoom ? minZoom : 1;
				maxZoom = options.maxZoom ? options.maxZoom : 17;
				defaultZoom = zoom ? ((zoom < 1 || zoom > 17) ? 14 : zoom) : 14; //超出显示层级范围时默认层级14

				//地图中心点位设置
				var centerPoint = options.centerPoint;
				if(!Utils.isArray(centerPoint) || centerPoint.length < 2){
					centerPoint = [116.4247222222, 39.9055555556];// 设置北京为中心点位
				}

				//初始化图层、视图
				$.olMap.initView(centerPoint, minZoom, maxZoom, defaultZoom);
				$.olMap.initFeatureLayer();
				$.olMap.initBaseLayer(options.tileUrl);

				var showZoom = options.showZoom;
				showZoom = (showZoom != null && showZoom != undefined) ? showZoom : true;


				//地图点位样式
				var iconURL = options.iconURL, selectedIconURL = options.selectedIconURL;
				iconURL = iconURL ? iconURL : 'js/plugins/private/map/resource/images/marker.png';
				selectedIconURL = selectedIconURL ? selectedIconURL : 'js/plugins/private/map/resource/images/marker-blue.png';
				$.olMap.initNormalIconStyle(iconURL);
				$.olMap.initSelectedIconStyle(selectedIconURL);

				//创建地图
				$.olMap.createOlMap.call($this, showZoom);

				var pointsUrl = options.pointsUrl, pointsSize = options.pointsSize;
				var data = options.data, pointsData = [], ajaxData = {};

				if(pointsSize && pointsSize > 0){
					ajaxData = {pointsSize : pointsSize};
				}

				//获取远程点位数据
				if(!Utils.isEmpty(pointsUrl) && Utils.isString(pointsUrl)){
					$.ajax({
						url: pointsUrl,
						method : 'POST',
						data: ajaxData,
						dataType: 'JSON',
						async : false,
						success: function(data, textStatus, jqXhr){
							if(textStatus == 'success'){
								pointsData = data.datas;
							}
						},
						error: function (jqXhr) {
							layer.msg('加载远程点位数据失败!', {icon: 5});
						}
					});
				//本地点位数据
				}else if(!Utils.isEmpty(data) && Utils.isArray(data)){
					pointsData = data;
				}

				var len = pointsData.length;

				if(len > 0){
					//获取点位features
					var pointsFeatures = $.olMap.getPointsFeatures(pointsData), clusterDistance = options.clusterDistance;
					var featureLayer = $.olMap.getFeatureLayer(), source = $.olMap.featureSource;
					source.addFeatures(pointsFeatures);
					$this.attr('data-cluster', false);

					//是否聚合
					if(options.cluster){
						var clusterDistance = clusterDistance ? clusterDistance : 40; //群集之间的像素距离
						$this.attr('data-cluster', true);
						$.olMap.clusterSource = new ol.source.Cluster({  
						 	projection: ol.proj.get("EPSG:4326"),
					        distance: clusterDistance,
					        source: source
					    });
						featureLayer.setSource($.olMap.clusterSource);
						featureLayer.setStyle($.olMap.getLayerVectorStyle);
					}
				}
				
				//标记已渲染
				$this.attr(rendered, true);
				$this = null;

				return this;
			}
		});
	}(jQuery));
});