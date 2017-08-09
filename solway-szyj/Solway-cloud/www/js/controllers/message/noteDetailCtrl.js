app.controller('noteDetailCtrl',function($scope, $http,$q, $state, $stateParams,$document,$timeout,$compile,$parse,toaster) {
		var powerSupplys = JSON.parse(storage["powerSupplysMap"]);
		$scope.$on("showNoteDetail",
		    function (event, msg) {
				
				$scope.currentAddress = powerSupplys[$scope.sysId].address;
				$scope.alarmId = msg.id;
				
				//将消息置为已读
				$http({
					method : "GET",
					url : ctx+"solway/updateMessageStatus",
					params : {
						'alarmId':msg.id,
						'url':$scope.currentAddress,
						'userName':storage["userName"]
					},
					timeout : 20000
				})
				.success(function (msg) {
					//清空list页面的未读状态
					for(var i=0;i<$scope.basemessage.length;i++){
						if($scope.basemessage[i].id == $scope.alarmId){
							$scope.basemessage[i].readStatus = "1";
						}
					}
				});
				
				//$scope.sysId = msg.sysId;
				$scope.dcuId = msg.dcuId;
				init();
		 	}
		);
		
		
		var windowH = $(window).height();
		$(".overflow-auto").height(windowH-170);
		
		//获取警报运维信息
		function getAlarmMaintenance(){
			$http({
				method : "GET",
				url :  $scope.currentAddress+"api/v1/alarm/records",
				params : {
					'alarmId':$scope.alarmId
				},
				timeout : 20000
			}).success(function(result) {
				if(result.code == "0" && result.message == "ok"){
					$scope.maintenanceData = result.data;
				}
			}).error(function() {
				
			});
		}
		
		//切换故障信息，和故障波形
		$scope.changeTab= function(tabType){
			if(tabType == 'graph'){
				$scope.isActive = 'graph';
				if(!$scope.dcu_ids){
					$scope.dcu_ids = $scope.dcuId +""; 
				}
				//扰动报警需要查找该节点的相邻节点，type=3
				if($scope.alarmType == 12){
					var node = overViewData[$scope.sysId].nodesMap[$scope.dcuId];
					var nodeList = overViewData[$scope.sysId].powerLinesMap[node.dlxId].nodes;
					var nodeMap = {};
					for(var i=0;i<nodeList.length;i++){
						nodeMap[nodeList[i].nodeNo] = [nodeList[i].type,nodeList[i].deviceId];
					}
					var nodes = [$scope.dcuId]; 
					//显示自身和下节点的数据
					if(node && node.nextNodes){
						var ns = node.nextNodes.split(",");
						for(var k =0;k<ns.length;k++){
							 var tp = nodeMap[ns[k]];
							 if(tp && tp[0] == 3){
								 nodes.push(tp[1]);
							 }
						}
					}
					
					if(nodes.length > 0){
						$scope.dcu_ids = nodes.join(",");
					}
				}
				var param = {dcu_ids:$scope.dcu_ids,address:$scope.currentAddress,time:$scope.time,sample:$scope.sample,alarmId:$scope.alarmId,sysId:$scope.sysId,dcuId:$scope.dcuId,result:$scope.result};
				$scope.$broadcast("currentAlarm",param);
			}else{
				$scope.isActive = 'info';
			}
		}
		$scope.getNewAlarmStatus = function(){
			
			$http({
				method : "GET",
				url :  $scope.currentAddress+"api/v1/alarm",
				params : {
					'alarmId':$scope.alarmId
				},
				timeout : 20000
			}).success(function(result) {
				if(result.code == "0" && result.message == "ok"){
					$scope.infoData.status = result.data.status;
					
					//解除警报后,将list页面的状态更新
					for(var i=0;i<$scope.basemessage.length;i++){
						if($scope.basemessage[i].id == $scope.alarmId){
							$scope.basemessage[i].status = result.data.status;
						}
					}
				}
			});
		}
		
		$scope.resolveAlarmFun = function(){
			if($scope.maintenanceData.length==0){
				return false;
			}
			$(".confirm-ctrl").show();
	        $scope.$broadcast('childConfirm', 'resolveAlarm','double','确定解除警报？');
		}
		
		$scope.$on('confirmEvent', function(event,data) {
			if(data == "resolveAlarm"){
				$scope.resolveAlarm();
			}
	    });
		
		
		//解除警报
		$scope.resolveAlarm = function(){
			if($scope.maintenanceData.length==0){
				return false;
			}
			$http({
				method : "POST",
				url :  $scope.currentAddress+"api/v1/alarm/status/processed",
				params : {
					'alarmId':$scope.alarmId
				},
				timeout : 20000
			}).success(function(result) {
				if(result.code == "0" && result.message == "ok"){
					$http({
						method : "PUT",
						url :  $scope.currentAddress+"api/v1/alarm/record",
						data : {
							'alarmId':$scope.alarmId,
							'comment':"解除警报",
							'creator':storage["userName"],
							'status':1
						},
						timeout : 20000
					}).success(function(result) {
						$scope.getNewAlarmStatus();
						getAlarmMaintenance();
						if(result.code == "0" && result.message == "ok"){
							toaster.pop('success', '', '解除成功');
						}else{
							//TODO
							toaster.pop('error', '', '解除失败');
						}
					})
				}else{
					toaster.pop('error', '', '解除失败');
				}
				
			}).error(function() {
				//TODO
				toaster.pop('error', '', '解除失败');
			});
		}
		
		function getByteLen(val) {
			var len = 0;
			for (var i = 0; i < val.length; i++) {
			var a = val.charAt(i);
			if (a.match(/[^\x00-\xff]/ig) != null) 
			{len += 2;}
			else{len += 1;}
			}
			return len;
		}
	    
		//显示警报位置的地图
		$scope.showAlarmPosition = function(){
			$("#alarmPosMap").height(windowH-250);
			$(".alert-pos-con").show();
			var map = new BMap.Map("alarmPosMap");
			
			var points = [];
			//替换经纬度
			/*var bdz = overViewData[$scope.sysId].substationsMap[$scope.pbdzId];
			
			var longitude = bdz.longitude;
			var latitude = bdz.latitude;
			var point = new BMap.Point(longitude,latitude);
			//map.centerAndZoom(point, 12); 
			var marker = new BMap.Marker(point);// 创建标注
			map.addOverlay(marker);*/
			
			var nodeList=[];
			
			var istype2 = false;
			for(var i=0;i<$scope.svgNode.length;i++){
				var node = overViewData[$scope.sysId].nodesMap[$scope.svgNode[i]];
				if(node.type==2) istype2 =true;
			}
			//当有type=2节点时，不再标注电站
			if(!istype2){
				var bdz = overViewData[$scope.sysId].substationsMap[$scope.pbdzId];
				var bd = {};
				bd["nodeName"] = bdz.name;
				bd["latitude"] = bdz.latitude;
				bd["longitude"] = bdz.longitude;
				nodeList.push(bd);
			}
			
			for(var i=0;i<$scope.svgNode.length;i++){
				var m = {};
				var node = overViewData[$scope.sysId].nodesMap[$scope.svgNode[i]];
				if(node.type==2 || node.type==3){
					m["nodeName"] = node.dxgNo;
					m["latitude"] = node.latitude;
					m["longitude"] = node.longitude;
					nodeList.push(m);
				}
				
			}
			for(var i = 0;i<nodeList.length;i++){
				
				var point = new BMap.Point(nodeList[i].longitude,nodeList[i].latitude);
				points.push(point);
				var marker = new BMap.Marker(point);  // 创建标注
				
				map.addOverlay(marker);              // 将标注添加到地图中
				var x= 20,y=-10;
				if(i%2==1 ){
					x = 0-getByteLen(nodeList[i].nodeName)*7;
				}
				var label = new BMap.Label(nodeList[i].nodeName,{offset:new BMap.Size(x,y)});
				label.setStyle({
					 color : "red",
					 border : "0"
				 });
				marker.setLabel(label);
			}
			
			map.setViewport(points);
			
		}
		
		//提交处理记录
		$scope.commitRecord = function(){
			if($scope.fillRecords == "" || $scope.fillRecords == null || $scope.fillRecords == undefined){
				$(".confirm-ctrl").show();
            	$scope.$broadcast('childConfirm', '','single','请输入处理记录');
				return false;
			}
			$scope.userName = storage["userName"];
			$http({
				method : "PUT",
				url :  $scope.currentAddress+"api/v1/alarm/record",
				data : {
					'alarmId':$scope.alarmId,
					'comment':$scope.fillRecords,
					'creator':$scope.userName,
					'status':'0'
				},
				timeout : 20000
			}).success(function(result) {
				$(".alert-con").hide();
				$(".alert-pos-con").hide();
				getAlarmMaintenance();
				$scope.getNewAlarmStatus();
				if(result.code == "0" && result.message == "ok"){
					//TODO alert
					toaster.pop('success', '', '保存成功！');
				}else{
					//TODO
					toaster.pop('error', '', '保存失败！');
				}
				
			}).error(function() {
				//TODO
				toaster.pop('error', '', '保存失败！');
			});
		}
		var suof = 1.0;
		var initWidth;
		var initHeight;
		$scope.goSmall = function(){
			var svg = d3.select("#line-svg-show svg")
			suof = suof * 0.9;
			if(suof < 1){
				//放大图标显示
				$scope.largestFlag = false;
			}
			var w = initWidth*suof;
			var h = initHeight*suof;
			
			$("#test1").attr("transform","scale("+suof+")");
			svg.attr("width",w);
			//$("#svgDataCircuit").css("height",h);;
			$("#line-svg-show").css("width",w);
			svg.attr('viewBox', "0 0 "+w +" "+ h);
		}
		$scope.goBig = function(){
			if(suof >= 1) return;
			var svg = d3.select("#line-svg-show svg");
			suof = suof / 0.9;
			if(suof >= 1){
				//置灰放大图标
				$scope.largestFlag = true;
			}
			var w = initWidth*suof;
			var h = initHeight*suof;
			
			$("#test1").attr("transform","scale("+suof+")");
			svg.attr("width",w);
			//$("#svgDataCircuit").css("height",h);;
			$("#line-svg-show").css("width",w);
			svg.attr('viewBox', "0 0 "+w +" "+ h);
		}
		
		$scope.initSvgWH = function(){
			var svg = d3.select("#line-svg-show svg");
			suof = 1*0.9*0.9*0.9*0.9;
	        $scope.largestFlag = false;
	        
	        var w = initWidth*suof;
			var h = initHeight*suof;
			
			$("#test1").attr("transform","scale("+suof+")");
			svg.attr("width",w);
			//$("#svgDataCircuit").css("height",h);;
			$("#line-svg-show").css("width",w);
			svg.attr('viewBox', "0 0 "+w +" "+ h);
		}
		
		$scope.goBackNoteList=function(){
			$(".noteDetailPage").hide();
			//$scope.messageView = "noteList";
			//$state.go("noteList");
		}
		
		//点击填写处理记录
		$scope.fillRecord = function(){
			$(".alert-con").show();
		}
		
		//关闭弹框
		$scope.closeAlert = function(){
			$(".alert-con").hide();
			$(".alert-pos-con").hide();
		}
		 var _getAlarmDataPromise;
		 $scope.getAlarmData = function(sysId,bdzId,dlxId){
			 _getAlarmDataPromise = $q(function (resolve, reject) {
				var powerSupplysMap = JSON.parse(storage["powerSupplysMap"]);
				var address = powerSupplysMap[sysId].address;
				var date = new Date();
				date.setDate(date.getDate()-30);
				$http({
					method : "GET",
					url :  $scope.currentAddress+"api/v1/alarm",
					params : {
						'alarmId':$scope.alarmId
					},
					timeout : 20000
				}).success(function(result) {
					if(result.code == "0" && result.message == "ok"){
						$scope.infoData = result.data;
						
						$scope.alarmType = result.data.alarmType;
						var ac = alarmConfigMap[$scope.alarmType];
						var node = overViewData[$scope.sysId].nodesMap[$scope.dcuId];
						var dlxnode = overViewData[$scope.sysId].powerLinesMap[node.dlxId];
						var bdzName = overViewData[$scope.sysId].substationsMap[node.bdzId].name;
						if(ac && ac.alarmLevel == 2){
							$scope.infoData.result = ac.alarmDetail;
							$scope.infoData.remark = bdzName + dlxnode.name + '，杆塔' + node.dxgNo;
						}
						
						//特殊处理  20170316
						if($scope.alarmType == 12 && node.type == 2){
							var mxName = overViewData[$scope.sysId].parentPowerLinesMap[dlxnode.mxId].name;
							$scope.infoData.remark = bdzName + mxName + '，  ' + node.dxgNo;
						}
						//测试
						//$scope.alarmType = 12;
						if($scope.alarmType == 100){
							$scope.alarmTypeImg="theme/default/img/message/warn-35-100.png";
							$scope.alarmTypeCurve = 'tpl/message/model/alarmType100.html';
							$scope.timeUs = true;
						}else if($scope.alarmType == 101){
							$scope.alarmTypeImg="theme/default/img/message/warn-35-101.png";
							$scope.alarmTypeCurve = 'tpl/message/model/alarmType101.html';
							$scope.timeUs = true;
						}else if($scope.alarmType == 2 || $scope.alarmType == 3){
							$scope.alarmTypeImg="theme/default/img/message/warn-60-3.png";
							$scope.alarmTypeCurve = 'tpl/message/model/alarmTypeCurrent.html';
							$scope.timeUs = false;
						}else if($scope.alarmType == 4 || $scope.alarmType == 5){
							$scope.alarmTypeImg="theme/default/img/message/warn-60-5.png";
							$scope.alarmTypeCurve = 'tpl/message/model/alarmTypeTemp.html';
							$scope.timeUs = false;
						}else if($scope.alarmType == 12){
							$scope.alarmTypeImg="theme/default/img/message/warn-60-12.png";
							$scope.alarmTypeCurve = 'tpl/message/model/alarmType12.html';
							$scope.timeUs = false;
						}
						var time = result.data.time;
						//$scope.time = time.substring(0,10)+" "+time.substring(11,19);
						$scope.time =  replaceTimeTZ(time);
						//如果故障为一级故障，时间加上Us
						if($scope.timeUs){
							var us =  Math.floor((result.data.sample)*78.125);
							var usLength = us.toString().length;
							if(usLength < 6){
								for(var i = 0;i<6-usLength;i++){
									us = "0"+us;
								}
							}
							$scope.time = $scope.time+"."+us;
						}
						$scope.dcu_ids = result.data.dcu_ids;
						$scope.result = result.data.result;
						$scope.sample = result.data.sample;
						
						//得到报警处理意见
						$scope.alarmSuggestion = alarmConfigMap[$scope.alarmType+""].disposalIdea;
					}
					$scope.nodeStatus ={};
					//需要变红的故障节点
					$scope.svgNode = [];
					if(result.code == '0'){
						if($scope.dcu_ids){
							var dcuIds = $scope.dcu_ids.split(",");
							//节点报警数量
							if($scope.alarmType == 100){
								for(var j=0;j<dcuIds.length;j++){
									var dcuId = parseInt(dcuIds[j]);
									$scope.nodeStatus[dcuId] = 1;
									if(overViewData[$scope.sysId].nodesMap[dcuId].type == '3'){
										$scope.svgNode.push(dcuId);
									}
								}
							//mod 2017-04-28 101故障特殊处理
							//对于101的报警，第一个节点是零序电压节点，从第二个节点开始判断 ,判断后面的那个节点，是不是该节点的next_device_id，若不是，那就是辅助接点不在svg和地图上显示
							}else if($scope.alarmType == 101){
								if(dcuIds.length > 1){
									var nodeindex = 2;
									var dcuId2 = parseInt(dcuIds[1]);
									var nextNode = overViewData[$scope.sysId].nodesMap[dcuId2].nextDcuId;
									for(var j=2;j<dcuIds.length;j++){
										if(nextNode && nextNode == dcuIds[j]){
											nodeindex++;
											var dcuId = parseInt(dcuIds[j]);
											nextNode = overViewData[$scope.sysId].nodesMap[dcuId].nextDcuId;
										}else{
											break;
										}
									}
									
									for(var j=0;j<nodeindex;j++){
										var dcuId = parseInt(dcuIds[j]);
										$scope.nodeStatus[dcuId] = 1;
										if(overViewData[$scope.sysId].nodesMap[dcuId].type == '3'){
											$scope.svgNode.push(dcuId);
										}
									}
								}
								
							}
							
						}else{
							$scope.nodeStatus[result.data.dcuId] = 1;
							$scope.svgNode.push(result.data.dcuId);
						}
					}
					
					resolve(""); 
				});
			 });
		     return _getAlarmDataPromise;
		}
		
		
		///////////////////////////////线路图处理
		var _getFirstDataPromise;
		$scope.getFirstData = function(sysId,dlxId){
			 _getFirstDataPromise = $q(function (resolve, reject) {
				/*var powerSupplysMap = JSON.parse(storage["powerSupplysMap"]);
				var address = powerSupplysMap[sysId].address;
				//获取状态数据
				$http({
					method : "GET",
					url : address+"/api/v1/dcu/power_line/first_data",
					params : {
						'id':dlxId,
					},
					timeout : 20000
				}).success(function(msg) {
					resolve(msg); 
					
				});*/
				var msg = {"data":{},"code":"-1"};
				resolve(msg);
		     });
			 //
		     return _getFirstDataPromise;
		 }
		
		$scope.initSvgData = function(sysId , bdzId , dlxId){
			$q.all([$scope.getAlarmData(sysId,bdzId,dlxId), $scope.getFirstData(sysId,dlxId)]).then(function (results) {
				 
				var powerSupplysMap = JSON.parse(storage["powerSupplysMap"]);
				var address = powerSupplysMap[sysId].address;
				
				//获取静态数据
				var nodes = overViewData[sysId].powerLinesMap[dlxId].nodes;
				
				var realData = results[1];
				var nodesNew = [];
				var lineName = overViewData[sysId].powerLinesMap[dlxId].name;
				var nodeNoAndType = {};
				for(var i=0;i< nodes.length;i++){
					var nd = overViewData[sysId].nodesIdMap[nodes[i].id];
					nodeNoAndType[nd.nodeNo] = nd.type;
				}
				for(var i=0;i< nodes.length;i++){
					var nodesmap  = overViewData[sysId].nodesIdMap[nodes[i].id];
					//不处理电压测量节点
					if(nodesmap.type == 2) continue;
					var node2 = {};
					node2["deviceId"] = nodesmap.deviceId;
					node2["type"] = nodesmap.type;
					node2["dxgNo"] = nodesmap.dxgNo;
					node2["id"] = nodesmap.nodeNo;
					if(nodesmap.type == 1){
						node2["name"] = overViewData[sysId].parentPowerLinesMap[nodesmap.mxId].name;
					}else{
						node2["name"] = lineName +"-" + nodesmap.dxgNo;
					}
					
					node2["x"] = nodesmap.positionX;
					node2["y"] = nodesmap.positionY;
					
					var lineTo = [];
					if(nodesmap.nextNodes != null){
						var nextNodes = (nodesmap.nextNodes +"").split(",");
						for(var j=0;j<nextNodes.length;j++){
							if(nextNodes[j] && nodeNoAndType[nextNodes[j]] != 2){
								lineTo.push(nextNodes[j]);
							}
						}
					}
					
					if(lineTo.length > 0){
						node2["lineTo"] = lineTo;
					}
					
					nodesNew.push(node2);
				}
				if(realData){
					var code = realData.code;
					for(var k=0;k<nodesNew.length;k++){
						if($scope.nodeStatus[nodesNew[k].deviceId]){
							if($scope.nodeStatus[nodesNew[k].deviceId]){
								//nodesNew[k]["type"] = 0;
								nodesNew[k]["number"] = $scope.nodeStatus[nodesNew[k].deviceId];
							}
						}
						if(code == "0"){
							if(!realData.data[nodesNew[k].deviceId]) continue;
							var lineDa = realData.data[nodesNew[k].deviceId];
							var n_voltage = [];
							if(lineDa){
								if(lineDa.sgs_a){
									var v = {"current" : lineDa.sgs_a[0],"temperature" : lineDa.sgs_a[1],"percent" : lineDa.sgs_a[2]};
									n_voltage.push(v);
								}else{
									n_voltage.push({"current" : null,"temperature" : null,"percent" : null});
								}
								if(lineDa.sgs_b){
									var v = {"current" : lineDa.sgs_b[0],"temperature" : lineDa.sgs_b[1],"percent" : lineDa.sgs_b[2]};
									n_voltage.push(v);
								}else{
									n_voltage.push({"current" : null,"temperature" : null,"percent" : null});
								}
								if(lineDa.sgs_c){
									var v = {"current" : lineDa.sgs_c[0],"temperature" : lineDa.sgs_c[1],"percent" : lineDa.sgs_c[2]};
									n_voltage.push(v);
								}else{
									n_voltage.push({"current" : null,"temperature" : null,"percent" : null});
								}
							}
							
							nodesNew[k]["voltage"] = n_voltage;
						}
					}
				}
				if($scope.svgNode && $scope.svgNode.length == 0){
					$scope.svgNode = null;
				}
				var attr = {svgType : $scope.alarmType,svgNode : $scope.svgNode};
				$scope.initSvg(nodesNew,attr);
				$scope.initSvgWH();
				$scope.loading = false;
				$scope.isDLXDataFinish = true;
			 });
			
			
		}
		
		var type = {
	        '0': 'node-red',
	        '3': 'node-green',
	        '1': 'node-blue',
	        '4': 'node-xuni'

	    };
	    
	    var getType = function (code) {
	        return code == 100 || code == 101;
	    }
		
		$scope.initSvg = function(modelValue,attr){
			var json = modelValue;
		    if(!modelValue || modelValue.length == 0) return;
		    
			$("#svgDataCircuit").html('<div id="line-svg-show" line-svg ng-model="json" line-click="showChart"><svg>'+
			   '<defs>'+
			        '<marker id="arrow4" markerWidth="10" markerHeight="10" refx="4" refy="4" orient="auto" markerUnits="strokeWidth">'+
			            '<path d="M0,0 L0,1 L3,4 L0,7 L0,8 L4,4 L0,0 z" class="sanjiao-line-node"/>'+
			        '</marker>'+
			        '<marker id="arrow5" markerWidth="10" markerHeight="10" refx="4" refy="4" orient="auto" markerUnits="strokeWidth">'+
			            '<path d="M0,0 L0,1 L3,4 L0,7 L0,8 L4,4 L0,0 z" class="sanjiao-line-node-red"/>'+
			        '</marker>'+
			    '</defs>'+
			'</svg></div>');

	        var svgNode = null;
	        if(angular.isDefined(attr.svgNode)){
	            //svgNode = $parse(attr.svgNode)(scope);
	            //console.log('svgNode',svgNode)
	        	svgNode = attr.svgNode;
	        }
	        var svgType = null;
	        if(angular.isDefined(attr.svgType)){
	            //svgType = $parse(attr.svgType)(scope);
	            //svgType = getType(svgType);
	        	svgType = getType(attr.svgType);
	        }
	        var m_y = json[0].y;
	        var wrapper = 0.5;
	        for(var i=0; i<json.length; i++){
	            json[i].y -= m_y;
	            json[i].y = json[i].y * 11 / 19;

	        }
	        var location = [];
	        location.push(_.minBy(json, 'x').x-wrapper);
	        location.push(_.minBy(json, 'y').y-0.3);
	        location.push(_.maxBy(json, 'x').x+wrapper);
	        location.push(_.maxBy(json, 'y').y);
	        var view = [];
	        view.push(location[2]-location[0]);
	        view.push(location[3]-location[1]);
	        //线的间隔
	        var value = 76,
	            r = 7,
	            xlelf = location[0];
	        var muId = json[0].id;
	        
	        //动态计算线的长度
	        //var winwidth = $(window).width()*0.9
	        //value = winwidth / json.length;
	        //value = value > 60?60:value;

	        var lineSvg = _.keyBy(json, 'id');
	        var view_h = 300;
	        var ceter;
	        if(view[1]*value>view_h){
	            view_h = view[1]*value;
	            ceter = 0;
	        }else{
	            ceter = (view_h-(location[3]-location[1])*value)/2;
	        }
	        //ceter = 30;
	       
	        for(var k in lineSvg){
	            lineSvg[k].x = (lineSvg[k].x - xlelf)*value;
	            lineSvg[k].y =  (location[3] -lineSvg[k].y)*value + ceter;
	        }
	        //console.log(lineSvg);
	       
	        
	        var id = "line-svg-show";
	        var element = $("#line-svg-show");
	        
	        initWidth = view[0]*value;
	        initHeight = view_h;
	        element.css({
	            'width': view[0]*value,
	            //'width': winwidth,
	            'margin': '0 auto',
	            //'position': 'relative'
	        });

	        //$("#svgDataCircuit").height(view_h);
	        var svg = d3.select("#line-svg-show svg")
	            .attr("width",view[0]*value)
	            .attr("height",view_h)
	            .attr('viewBox', "0 0 "+view[0]*value +" "+ view_h);
	        svg.select('g').remove()
	        var gAll = svg.append('g')
	            .attr({
	                id: 'test1'
	            })
	        //.call(zoom);

	        var textSet = function(node) {
	            var zbx = 10;
	            var zby = 20;
	            var ry = 4;
	            switch(node.textPosition){
	                case '1':
	                    return {
	                        "x": node.x-zbx,
	                        "y": node.y-zbx,
	                        "class": "node-ling-left"
	                    };
	                case '2':
	                    return {
	                        "x": node.x,
	                        "y": node.y-zbx,
	                        "class": "node-ling-text1"
	                    };
	                case '3':
	                    return {
	                        "x": node.x+zbx,
	                        "y": lineSvg[k].y-zbx,
	                        "class": "node-ling-text4"
	                    };
	                case '4':
	                    return {
	                        "x": node.x-zbx,
	                        "y": node.y+5,
	                        "class": "node-ling-left"
	                    };
	                case '5':
	                    return {
	                        "x": node.x,
	                        "y": node.y+5,
	                        "class": "node-ling-text1"
	                    };
	                case '6':
	                    return {
	                        "x": node.x+zbx,
	                        "y": lineSvg[k].y+5,
	                        "class": "node-ling-text4"
	                    };
	                case '7':
	                    return {
	                        "x": node.x-zbx,
	                        "y": node.y+zby,
	                        "class": "node-ling-left"
	                    };
	                case '8':
	                    return {
	                        "x": node.x,
	                        "y": node.y+zby,
	                        "class": "node-ling-text1"
	                    };
	                case '9':
	                    return {
	                        "x": node.x+zbx,
	                        "y": lineSvg[k].y+zby,
	                        "class": "node-ling-text4"
	                    };

	                case '10':
	                    return {
	                        "x": node.x-15,
	                        "y": lineSvg[k].y+5,
	                        "class": "node-ling-base node-ling-text10"
	                    };

	                case '11':
	                    return {
	                        "x": node.x-15,
	                        "y": lineSvg[k].y+5,
	                        "class": "node-ling-base node-ling-text11"
	                    };

	                case '12':
	                    return {
	                        "x": node.x-15,
	                        "y": lineSvg[k].y+5,
	                        "class": "node-ling-base node-ling-text12"
	                    };

	                default:
	                    return {
	                        "x": node.x+zbx,
	                        "y": lineSvg[k].y+zby,
	                        "class": "node-ling-text4"
	                    }
	            }

	        }

	        for(var k in lineSvg){
	            var g = gAll.append('g');
	            if(lineSvg[k].type == 1){
	                g.append('line')
	                    .attr({
	                        "x1": lineSvg[k].x,
	                        "y1": lineSvg[k].y-85,
	                        "x2": lineSvg[k].x,
	                        "y2": lineSvg[k].y+85,
	                        "class": "node-line-svg-v"
	                    });
	                g.append('text')
	                    .attr({
	                        "x": lineSvg[k].x-20,
	                        "y": lineSvg[k].y-20,
	                        "class": "node-mu-line-name"
	                    })
	                    .text(lineSvg[k].name);
	            }

	            var className='';
	            if(!svgNode){
	                className += type[lineSvg[k].type];
	            }else{
	                if(svgNode.indexOf(lineSvg[k].deviceId) != -1){
	                    className += type[0];
	                }
	                //else{
	                //    className += type[lineSvg[k].type];
	                //    if(lineSvg[k].type != 1){
	                //        className += ' opacity-circle ';
	                //    }
	                //}
	                else{
	                    if(lineSvg[k].type == 0){
	                        className += type[3] +' opacity-circle ';
	                    }else if(lineSvg[k].type == 1){
	                        className += type[1];
	                    }else{
	                        className += type[lineSvg[k].type] + ' opacity-circle ';
	                    }
	                }

	            }
	            //if(lineSvg[k].type !=1 && lineSvg[k].type !=4 && (!svgNode || (svgNode.length >0 && svgNode.indexOf(lineSvg[k].deviceId) != -1))){
	            //    className += ' node-circle-click ';
	            //}
	            if(lineSvg[k].type != 5){
	                g.append('circle')
	                    .attr({
	                        "cx": lineSvg[k].x,
	                        "cy": lineSvg[k].y,
	                        "r": r,
	                        "lineId": lineSvg[k].id,
	                        "class": className,
	                        "deviceId": lineSvg[k].deviceId
	                        //"fill":"url(#f1)"
	                    });
	            }


	            if(lineSvg[k].lineTo){
	                var line = lineSvg[k].lineTo;
	                var x1,x2,y1,y2;
	                var nr = r;
	                for(var i = 0; i< line.length; i++){
	                    x1 = lineSvg[k].x;
	                    y1 = lineSvg[k].y;
	                    x2 = lineSvg[line[i]].x;
	                    y2 = lineSvg[line[i]].y;

	                    if(lineSvg[k].type != 5) {
	                        if (y1 != y2 && x1 != x2) {
	                            nr = 4.5;
	                        } else {
	                            nr = r;
	                        }
	                        if (y1 != y2) {
	                            if (y1 > y2) {
	                                y1 -= nr;
	                                y2 += nr;
	                            } else {
	                                y1 += nr;
	                                y2 -= nr;
	                            }
	                        }
	                        if (x1 != x2) {
	                            if (x1 > x2) {
	                                x1 -= nr;
	                                x2 += nr;
	                            } else {
	                                x1 += nr;
	                                x2 -= nr;
	                            }
	                        }
	                    }
	                    //console.log(svgType + "=" + svgNode.length + "==" + svgNode[0]+"====" + lineSvg[k].deviceId);
	                    if(svgType && svgNode && svgNode.length>0 && svgNode[0] === lineSvg[k].deviceId){
	                    	g.append('line')
	                            .attr({
	                                "x1": x1,
	                                "y1": y1,
	                                "x2": x2,
	                                "y2": y2,
	                                "class": "node-line-to-red",
	                                "marker-end": "url(#arrow5)"
	                            })
	                    }else{
	                        g.append('line')
	                            .attr({
	                                "x1": x1,
	                                "y1": y1,
	                                "x2": x2,
	                                "y2": y2,
	                                "class": "node-line-to",
	                                "marker-end": "url(#arrow4)"
	                            })
	                    }


	                }
	            }


	            if(k!=muId && lineSvg[k].type!=4){
	                var c = '';
	                if(lineSvg[k].type == 0 || (svgNode && svgNode.length>0)){
	                    c = 'node-ling-red';
	                }else if(lineSvg[k].type == 3){
	                    c = 'node-ling-green';
	                }
	                if(lineSvg[k].y == lineSvg[muId].y){
	                	
	                    g.append('text')
	                        .attr(textSet(lineSvg[k]))
	                        .text(lineSvg[k].dxgNo);
	                    //g.append('text')
	                    //    .attr({
	                    //        "x": lineSvg[k].x,
	                    //        "y": lineSvg[k].y-zby +r,
	                    //        "class": "node-ling-text2 " +c
	                    //    })
	                    //    .text(lineSvg[k].name);
	                }else{
	                    g.append('text')
	                        .attr(textSet(lineSvg[k]))
	                        .text(lineSvg[k].dxgNo);
	                    //g.append('text')
	                    //    .attr({
	                    //        "x": lineSvg[k].x-5*zbx,
	                    //        "y": lineSvg[k].y+ry,
	                    //        "class": "node-ling-text3 "+c
	                    //    })
	                    //    .text(lineSvg[k].name);

	                }
	            }

	            var lineClass = 'circle-wrapper-line';
	            if(lineSvg[k].type !=1 && lineSvg[k].type !=4 && (!svgNode || (svgNode.length >0 && svgNode.indexOf(lineSvg[k].deviceId) != -1))){
	                lineClass += ' node-circle-click ';
	            }

	            if(lineSvg[k].type != 5) {
	                g.append('line')
	                    .attr({
	                        "x1": lineSvg[k].x,
	                        "y1": lineSvg[k].y - 16,
	                        "x2": lineSvg[k].x,
	                        "y2": lineSvg[k].y + 16,
	                        "class": lineClass
	                    });
	            }else{
	                g.append('line')
	                    .attr({
	                        "x1": lineSvg[k].x-3,
	                        "y1": lineSvg[k].y-35,
	                        "x2": lineSvg[k].x-3,
	                        "y2": lineSvg[k].y+35,
	                        "class": "node-line-svg-v1"
	                    });
	            }

	        }

	        var timer = null;
	        var getTextNode = function (e) {
	            var childList = e.parentElement.childNodes;
	            return childList[childList.length-2];
	        }
	        var circleMouseenter = function (e) {
	            var _e = $document.find(e);
	            _e.addClass('hover-node-tip');

	            //getTextNode(e).className.baseVal += ' hover-node-tip';

	            var offset = _e.offset();
	            var hide_top = $document.find('.power-scrollbar-hide').offset().top;
	            var svgContainer = $document.find('.power-svg-container');
	            var
	                top = offset.top,
	                left = offset.left,
	                bW = document.body.clientWidth,
	                bH = document.body.clientHeight,
	                w = 190,
	                h = 135,
	                L = 0,
	                T = 0;
	            bH = bH < hide_top ? bH : hide_top;
	            var cx = parseInt(e.getAttribute('cx'));
	            var cy = parseInt(e.getAttribute('cy'));


	            var svgWidth = svgContainer.width();
	            var svgSelf = element.width();
	            var dSvg = svgWidth>svgSelf ? (svgWidth-svgSelf)/2 : 0;
	            L = cx + 30;
	            if( L + w + dSvg > svgContainer.scrollLeft() + svgWidth ){
	                L  = cx - w-30;
	            }
	            if(top< bH - h){
	                //top
	                T = cy+10;
	            }else{
	                T = cy - h -10 ;
	            }
	            //console.log('hou:',T,L)
	            var div = $document.find('#popup');

	            var index1 = findArrayMapIndex(json, {id: parseInt(e.getAttribute('lineId'))});
	            $scope.lineDate = json[index1];
	            $scope.$apply();

	            var n_h = h;
	            if($scope.lineDate.type == 3){
	                n_h = 113;
	            }
	            if(div.length == 0){
	                var typeStr = '<span ng-class="{true: \'warning-one-color\', false: \'normal-color\'}[lineDate.type==0]">{{lineDate.type | lineType}}</span>';
	                if(svgNode&&svgNode.length!=0){
	                    typeStr = '<span ng-class="{true: \'warning-one-color\', false: \'normal-color\'}[0==0]">{{0| lineType}}</span>';
	                }
	                element.append(
	                    '<div id="popup" style="width: '+w+'px;height: '+n_h+'px;top: '+T+'px;left: '+L+'px;'+'">' +
	                    '<div class="popup-text-title">'+
	                    '<span ng-bind="lineDate.name"></span>'+
	                    '<span >:</span>'+typeStr+
	                    '</div>'+
	                    '<div class="popup-text-xiang">'+
	                    '<span class="electric_A">A相：</span>'+
	                    '<span ng-bind="lineDate.voltage[0].current"></span>'+
	                    '<span>A/</span>'+
	                    '<span ng-if="lineDate.voltage[0].temperature !== null"><span ng-bind="lineDate.voltage[0].temperature"></span>'+
	                    '<span>°C/</span></span>'+
	                    '<span ng-bind="lineDate.voltage[0].percent"></span>'+
	                    '<span>%</span>'+
	                    '</div>'+
	                    '<div class="popup-text-xiang">'+
	                    '<span class="electric_B">B相：</span>'+
	                    '<span ng-bind="lineDate.voltage[1].current"></span>'+
	                    '<span>A/</span>'+
	                    '<span ng-if="lineDate.voltage[1].temperature !== null"><span ng-bind="lineDate.voltage[1].temperature"></span>'+
	                    '<span>°C/</span></span>'+
	                    '<span ng-bind="lineDate.voltage[1].percent"></span>'+
	                    '<span>%</span>'+
	                    '</div>'+
	                    '<div class="popup-text-xiang">'+
	                    '<span class="electric_C">C相：</span>'+
	                    '<span ng-bind="lineDate.voltage[2].current"></span>'+
	                    '<span>A/</span>'+
	                    '<span ng-if="lineDate.voltage[2].temperature !== null"><span ng-bind="lineDate.voltage[2].temperature"></span>'+
	                    '<span>°C/</span></span>'+
	                    '<span ng-bind="lineDate.voltage[2].percent"></span>'+
	                    '<span>%</span>'+
	                    '</div>'+
	                    '<div class="popup-warning" ng-if="lineDate.type==0">'+
	                    '<span>报警数量：</span>'+
	                    '<span ng-bind="lineDate.number" class="warning-one-color"></span>'+
	                    '</div>'+
	                    '</div>');
	                $compile($document.find('#popup').contents())($scope);
	            }else{
	                div.css({
	                    "top": T,
	                    "left": L,
	                    "height": n_h
	                })
	            }

	            $timeout.cancel(timer);
	            timer = $timeout(function () {
	                $document.find('#popup').show();
	            },500)

	        }

	        var circleMouseleave = function (e) {
	            e.className.baseVal = e.classList[0];
	            //$(getTextNode(e)).removeClass('hover-node-tip');

	            $timeout.cancel(timer);
	            timer = $timeout(function () {
	                var div = $document.find('#popup');
	                div.hide();

	            },500);
	        }

	        var mouseAction = function () {
	            element.on('mouseenter', '.node-circle-click', function (e) {
	                //circleMouseenter(e.currentTarget.parentElement.childNodes[0]);
	            });

	            element.on('mouseleave', '.node-circle-click', function (e) {
	                //circleMouseleave(e.currentTarget.parentElement.childNodes[0]);
	            });
	        }

	        mouseAction();

	        var ec = null;
	        var callBack = null;
//	        if (angular.isDefined(attr.lineClick)) {
//	            callBack = $parse(scope[attr.lineClick]);//scope.$eval(attr.lineClick);
//	        }
	        callBack = $parse($scope["showChart"]);//scope.$eval(attr.lineClick);

	        var moveToChart = function () {
	            $('.power-body-content-right').animate({
	                scrollTop: 560 }, 500);
	        }

	        $scope.$on('highCircle', function(event, data) {

	            if(_.isNumber(data.deviceId)){
	                ec = element.find('circle[deviceId='+ data.deviceId +']')[0];
	                var color = '#018952';
	                if(ec.className.baseVal == 'node-red'){
	                    color = '#BF1A2E';
	                }
	                ec.style.fill = color;
	                //getTextNode(ec).style.fill = color;
	            }

	            $scope.$broadcast('circleEnd', null);
	        });

	        var clickAction = function (callback) {
	        }
	        if(!svgNode){
	            clickAction(callBack);
	        }
	    
		}
		
		function init(){
			
			$scope.loading = true;
			$scope.isActive = "info";
			$(".alert-pos-con").hide();
			$("#svgDataCircuit").html("");
			getAlarmMaintenance();
			if($scope.dcuId){
				$scope.pbdzId = overViewData[$scope.sysId].nodesMap[$scope.dcuId].bdzId;
				$scope.lineId = overViewData[$scope.sysId].nodesMap[$scope.dcuId].dlxId;
			}
			$scope.psysId = $scope.sysId;
			$scope.initSvgData($scope.psysId,$scope.pbdzId,$scope.lineId);
		}
		
		function replaceTimeTZ(time){
			if(time){
				return time.replace("T"," ").replace("Z","");
			}
		}
	})