app.controller('circuitCtrl',function($scope, $http, $state,$q,$rootScope,$stateParams,$document,$timeout,$compile,$parse,toaster) {
	
	$scope.psysId = $stateParams.sysId;
	$scope.pbdzId = $stateParams.bdzId;
	$scope.parentId = $stateParams.parentId;
	$scope.gdjName = overViewData[$scope.psysId].name;
	$scope.bdzName = overViewData[$scope.psysId].substationsMap[$scope.pbdzId].name;
	$scope.bdzNo = overViewData[$scope.psysId].substationsMap[$scope.pbdzId].no;
	$scope.lineId = $stateParams.lineId;
	$scope.nodeId = $stateParams.nodeId;
	$scope.stype = $stateParams.stype;
	$scope.stime = $stateParams.stime;
	$scope.isDLXDataFinish = false;
	console.log($scope.psysId +"=" +$scope.pbdzId +"=" + $scope.lineId + "=" + $scope.nodeId +"="+ $scope.stype + "=" + $scope.stime);
	
	$scope.goHistorySta = function(){
		 $scope.$emit('refreshView', {
             view: 'historySta'
         });
		$state.go("app.historySta",
				{'sysId':$scope.psysId,
				 'bdzId':$scope.pbdzId,
				 'lineId':$scope.lineId,
				 'nodeId':$scope.nodeId,
				 'stype':$scope.stype,
				 'stime':$scope.stime,
				 }
		);
	}
	var suof = 1.0;
	var initWidth;
	var initHeight;
	$scope.goSmall = function(){
		/*var svg = d3.select("#line-svg-show svg")
		suof = suof * 1.05;
		var h = svg.attr("height")*suof;
		var w = svg.attr("width")*suof;
		console.log(h +"==" + w);
        svg.attr('viewBox', "0 0 "+w +" "+ h);*/
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
	
	$('#axiang').on('click', function (e) {
		if($(this).hasClass("a")){
			$scope.$broadcast('current',null,null,{x:0,ctype:'none'});
			if($scope.bdzNo != '2'){
				$scope.$broadcast('temperature',null,null,{x:0,ctype:'none'});
			 }
			
			$scope.$broadcast('THD',null,null,{x:0,ctype:'none'});
			$(this).removeClass("a").addClass("n");
		}else{
			$scope.$broadcast('current',null,null,{x:0,ctype:'line'});
			if($scope.bdzNo != '2'){
				$scope.$broadcast('temperature',null,null,{x:0,ctype:'line'});
			}
			
			$scope.$broadcast('THD',null,null,{x:0,ctype:'line'});
			$(this).removeClass("n").addClass("a");
		}
	});
	
	$('#bxiang').on('click', function (e) {
		if($(this).hasClass("b")){
			$scope.$broadcast('current',null,null,{x:1,ctype:'none'});
			if($scope.bdzNo != '2'){
				$scope.$broadcast('temperature',null,null,{x:1,ctype:'none'});
			}
			$scope.$broadcast('THD',null,null,{x:1,ctype:'none'});
			$(this).removeClass("b").addClass("n");
		}else{
			$scope.$broadcast('current',null,null,{x:1,ctype:'line'});
			if($scope.bdzNo != '2'){
				$scope.$broadcast('temperature',null,null,{x:1,ctype:'line'});
			}
			$scope.$broadcast('THD',null,null,{x:1,ctype:'line'});
			$(this).removeClass("n").addClass("b");
		}
	});
	
	$('#cxiang').on('click', function (e) {
		if($(this).hasClass("c")){
			$scope.$broadcast('current',null,null,{x:2,ctype:'none'});
			if($scope.bdzNo != '2'){
				$scope.$broadcast('temperature',null,null,{x:2,ctype:'none'});
			}
			$scope.$broadcast('THD',null,null,{x:2,ctype:'none'});
			$(this).removeClass("c").addClass("n");
		}else{
			$scope.$broadcast('current',null,null,{x:2,ctype:'line'});
			if($scope.bdzNo != '2'){
				$scope.$broadcast('temperature',null,null,{x:2,ctype:'line'});
			}
			$scope.$broadcast('THD',null,null,{x:2,ctype:'line'});
			$(this).removeClass("n").addClass("c");
		}
	});
	
	$scope.getFirstNode = function(sysId,dlxId){
		var allNodes = overViewData[sysId].powerLinesMap[dlxId].nodes
		for(var i=0;i<allNodes.length;i++){
			if(allNodes[i].type == 3) {
				$scope.nodeId = allNodes[i].deviceId;
				$scope.nodeName = allNodes[i].name;
				return;
			}
		}
	}
	
	//$("body").css("width", $(window).width()+10); 
	if($scope.nodeId){
		$scope.nodeName = overViewData[$scope.psysId].nodesMap[$scope.nodeId].name;
	}else{
		//得到第一个类型为3的节点的id
		$scope.getFirstNode($scope.psysId,$scope.lineId);
	}
	
	
	$scope.hasAlarm = false;
	$scope.nodeStatus = {};
	
	var windowH = $(window).height();
	var windowW= $(window).width();
	
	$(".overflow-auto").height(windowH-165);
	function init(sysId,nodeId){
		$("#axiang").removeClass("n").addClass("a");
		$("#bxiang").removeClass("n").addClass("b");
		$("#cxiang").removeClass("n").addClass("c");
		var powerSupplysMap = JSON.parse(storage["powerSupplysMap"]);
		var address = powerSupplysMap[sysId].address;
		var date = new Date();
		var currentD = date.getDate()-1;
		$http({
			type: "GET",
			url: address+"api/v1/dcu/current",
			timeout : 20000,
			params : {
				'dcu_id':nodeId,
				'startTime':(new Date(date.setDate(currentD))).format("yyyy-MM-dd HH:mm:ss"),
				'endTime':(new Date()).format("yyyy-MM-dd HH:mm:ss")
			}
		})
		.success(function (result) {
			 if(result.code == "0" && result.total >0){
				 var current = [];
				 var temp = [];
				 var thd = [];
				 var xTime = [];
				 var data = result.data;
				 for(var i = 0;i<data.length;i++){
					 current.push(data[i].current);
					 temp.push(data[i].temp);
					 thd.push(data[i].thd);
					 xTime.push(data[i].time);
				 }
				 $scope.$broadcast('current',current,xTime);
				 if($scope.bdzNo != '2'){
					 $scope.$broadcast('temperature',temp,xTime);
				 }
				 $scope.$broadcast('THD',thd,xTime);
			 }else{
				 var current = [];
				 var temp = [];
				 var thd = [];
				 var xTime = [];
				 $scope.$broadcast('current',current,xTime);
				 if($scope.bdzNo != '2'){
					 $scope.$broadcast('temperature',temp,xTime);
				 }
				 $scope.$broadcast('THD',thd,xTime);
			 }
		})
		.error(function (result) {
			 var current = [];
			 var temp = [];
			 var thd = [];
			 var xTime = [];
			 $scope.$broadcast('current',current,xTime);
			 if($scope.bdzNo != '2'){
				 $scope.$broadcast('temperature',temp,xTime);
			 }
			 $scope.$broadcast('THD',thd,xTime);

		})
	}
	init($scope.psysId,$scope.nodeId);
	
	
	//得到所有电力线列表
	function getAllDLXList(sysId,bdzId){
		var powerLinesList = overViewData[sysId].substationsMap[bdzId].powerLines;
		for(var i=0;i<powerLinesList.length;i++){
			$("#dlxs").append("<option value='"+ powerLinesList[i].id +"'>"+powerLinesList[i].name+"</option>");
		}
		//选中电力线
		$("#dlxs").val($scope.lineId);
		
		var nodes = overViewData[sysId].powerLinesMap[$scope.lineId].nodes;
		for(var i =0 ;i<nodes.length;i++){
			if(nodes[i].type == 3){
				$("#nodes").append("<option value='"+nodes[i].deviceId+"'>"+nodes[i].name+"</option>");
			}
		}
		//选中节点
		$("#nodes").val($scope.nodeId);
	}
	getAllDLXList($scope.psysId,$scope.pbdzId);
	
	//切换电力线
	$("#dlxs").on("change",function(e) {
		$("#svgDataCircuit").html("");
		$scope.isDLXDataFinish = false;
		$scope.lineId = $("#dlxs").val();
		$scope.getFirstNode($scope.psysId,$scope.lineId);
		var allNodes = overViewData[$scope.psysId].powerLinesMap[$scope.lineId].nodes
 		for(var i=0;i<allNodes.length;i++){
 			if(allNodes[i].deviceId == $scope.nodeId) {
 				$scope.nodeName = allNodes[i].name;
 				break;
 			}
 		}
		$("#nodes").html("");
		var nodes = overViewData[$scope.psysId].powerLinesMap[$scope.lineId].nodes;
		var nodeIds = [];
		for(var i =0 ;i<nodes.length;i++){
			if(nodes[i].type == 3){
				$("#nodes").append("<option value='"+nodes[i].deviceId+"'>"+nodes[i].name+"</option>");
				nodeIds.push(nodes[i].deviceId);
			}
		}
		if(nodeIds.length > 0){
			$scope.nodeId = nodeIds[0];
		}else{
			$scope.nodeId = null;
		}
		$scope.initSvgData($scope.psysId,$scope.pbdzId,$scope.lineId);
		init($scope.psysId,$scope.nodeId);
		//$scope.initSvgData(ssid[0],ssid[1]);
		
		
	});
	
	
	//切换节点
	$("#nodes").on("change",function(e) {
		
		$("#axiang").removeClass("n").addClass("a");
		$("#bxiang").removeClass("n").addClass("b");
		$("#cxiang").removeClass("n").addClass("c");
		
		$scope.nodeId = $("#nodes").val();
		$scope.nodeName = overViewData[$scope.psysId].nodesMap[$scope.nodeId].name;
		
		init($scope.psysId,$scope.nodeId);
	});
	
	
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
				if(!msg){
					msg = {"data":{},"code":"-1"};
				}
				//msg = {"code":"0","data":{"19":{"sgs_b":[472.5,29,70.24]},"2":{"sgs_a":[325.2,28,2.28],"sgs_b":[0,24,0],"sgs_c":[325.2,27,2.28]},"3":{"sgs_a":[326.4,23,2.19],"sgs_b":[0,24,0],"sgs_c":[327,24,2.19]},"4":{"sgs_a":[0,20,0],"sgs_b":[0,20,0],"sgs_c":[0,20,0]},"6":{"sgs_a":[0,22,0],"sgs_b":[0,23,0],"sgs_c":[0.1,23,0]},"7":{"sgs_a":[0,19,0],"sgs_b":[0.1,22,0],"sgs_c":[0,21,0]}},"message":"ok"};
				resolve(msg); 
			}).error(function(msg) {
				var msg2 = {"data":{},"code":"-1"};
				resolve(msg2); 
			});*/
			var msg2 = {"data":{},"code":"-1"};
			resolve(msg2); 
	     });
		 //
	     return _getFirstDataPromise;
	 }
	
	
	//返回按钮
	$scope.beback = function(){
		$state.go("app.monitorSubstation",{sysId:$scope.psysId,bdzId:$scope.pbdzId});
	}
	//$scope.getAlarmData($scope.psysId,$scope.pbdzId);
	
	 var _getAlarmDataPromise;
	 $scope.getAlarmData = function(sysId,bdzId,dlxId){
		 _getAlarmDataPromise = $q(function (resolve, reject) {
			var powerSupplysMap = JSON.parse(storage["powerSupplysMap"]);
			var address = powerSupplysMap[sysId].address;
			var date = new Date();
			date.setDate(date.getDate()-30);
			$http({
				method : "GET",
				url : address+"api/v1/alarm/search_alarmlist_ForApp",
				params : {
					'userId': powerSupplysMap[sysId].userId,
					'gdjId': powerSupplysMap[sysId].gdjId,
					'bdzId': bdzId,
					'dlxId' : dlxId,
					'startTime':date.format('yyyy-MM-dd HH:mm:ss'),
					'alarmType':'100,101',
					'status':0
				},
				timeout : 20000
			}).success(function(msg) {
				//msg = {"code":"0","data":[{"address":"2","alarmType":100,"dcuId":5,"dcu_ids":"5","id":7778,"millis":1,"modifier":null,"modifyDate":"2017-01-17T12:21:50Z","position":0,"remark":"故障位于智能电网传感装置覆盖区域之外","result":"接地","rtc":1,"sample":8053,"status":0,"time":"2017-01-17T12:21:21Z"}],"limit":20,"message":"ok","start":0,"total":1};
				$scope.nodeStatus ={};
				//获取该电力线下所有节点数量
				var allNodesNum = overViewData[sysId].powerLinesMap[dlxId].nodes.length;
				var dlAlarm = 0, jdAlarm = 0;
				if(msg.code == '0'){
					if(msg.data.length > 0){
						$scope.hasAlarm = true;
					}
					for(var k=0;k<msg.data.length;k++){
						var dcuId = msg.data[k].dcuId;
						//节点报警数量
						if($scope.nodeStatus[dcuId]){
							$scope.nodeStatus[dcuId] = $scope.nodeStatus[dcuId]+1;
						}else{
							$scope.nodeStatus[dcuId] = 1;
						}
						//判断短路还是接地故障
						if(msg.data[k].alarmType == 100){
							dlAlarm++;
						}else if(msg.data[k].alarmType == 101){
							jdAlarm++;
						}
						
						$scope.dcu_ids = msg.data[k].dcu_ids;
						$scope.alarmType = msg.data[k].alarmType;
						$scope.dcuId = dcuId;
						
						//需要变红的故障节点
						$scope.svgNode = [];
						if($scope.dcu_ids){
							var dcuIds = $scope.dcu_ids.split(",");
							//节点报警数量
							if($scope.alarmType == 100 || $scope.alarmType == 101){
								for(var j=0;j<dcuIds.length;j++){
									var dcuId = parseInt(dcuIds[j]);
									if(overViewData[sysId].nodesMap[dcuId].type == '3'){
										$scope.svgNode.push(dcuId);
									}
								}
							}
							
						}else{
							$scope.svgNode.push(dcuId);
						}
						//扰动报警需要查找该节点的相邻节点，type=3
						if($scope.alarmType == 12){
							var node = overViewData[sysId].nodesMap[$scope.dcuId];
							var nodeList = overViewData[sysId].powerLinesMap[node.dlxId].nodes;
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
								$scope.svgNode = nodes.join(",");
							}
						}
					}
					
					
				}
				
				
				$scope.dlAlarmNum = dlAlarm;
				$scope.jdAlarmNum = jdAlarm;
				
				$scope.alarmNodeNum = Object.keys($scope.nodeStatus).length;
				$scope.normalNodeNum = allNodesNum - $scope.alarmNodeNum;
				
				resolve(""); 
			}).error(function(msg) {
				resolve(""); 
				
			});
		 });
	     return _getAlarmDataPromise;
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
				node2["textPosition"] = nodesmap.textPosition;
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
			if($scope.svgNode && $scope.svgNode.length == 0){
				$scope.svgNode = null;
			}
			var attr = {svgType : $scope.alarmType,svgNode : $scope.svgNode};
			$scope.initSvg(nodesNew,attr);
			$scope.initSvgWH();
			$scope.isDLXDataFinish = true;
		 });
		
		
	}
	$scope.initSvgData($scope.psysId,$scope.pbdzId,$scope.lineId);
	
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
//            svgNode = $parse(attr.svgNode)(scope);
//            console.log('svgNode',svgNode)
        	svgNode = attr.svgNode;
        }
        var svgType = null;
        if(angular.isDefined(attr.svgType)){
//            svgType = $parse(attr.svgType)(scope);
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
        //console.log(lineSvg);
        
        var view_h = 300;
        var ceter;
        if(view[1]*value>view_h){
            view_h = view[1]*value;
            ceter = 0;
        }else{
            ceter = (view_h-(location[3]-location[1])*value)/2;
        }
        //console.log(ceter +"=====ceter");
        //ceter = 30;
       
        for(var k in lineSvg){
            lineSvg[k].x = (lineSvg[k].x - xlelf)*value;
            lineSvg[k].y =  (location[3] -lineSvg[k].y)*value + ceter;
            //console.log(lineSvg[k].y +"==y")
            //console.log(lineSvg[k].x +"==x")
        }
        //console.log(lineSvg);
       
        
        var id = "line-svg-show";
        var element = $("#line-svg-show");
        
        element.css({
            'width': view[0]*value,
            //'width': winwidth,
            'margin': '0 auto',
            //'position': 'relative'
        });
        initWidth = view[0]*value;
        initHeight = view_h;
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
                    //console.log(svgType + "=" + svgNode.length+"=="+svgNode[0]+"=="+lineSvg[k].deviceId);
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
            
           /** if(lineSvg[k].type !=1 && lineSvg[k].type !=4 && (!svgNode || (svgNode.length >0 && svgNode.indexOf(lineSvg[k].deviceId) != -1))){
                lineClass += ' node-circle-click ';
            }*/
            
            if(lineSvg[k].type !=1 && lineSvg[k].type !=4 ){
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
//        if (angular.isDefined(attr.lineClick)) {
//            callBack = $parse(scope[attr.lineClick]);//scope.$eval(attr.lineClick);
//        }
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
            element.on('click', '.node-circle-click', function (e) {
                if(ec){
                    ec.style.fill = '';
                    //getTextNode(ec).style.fill = '';
                }
                ec = e.currentTarget.parentElement.childNodes[0];
                var color = $(ec).css('fill');
                ec.style.fill = color;
                //getTextNode(ec).style.fill = color;
                //moveToChart();
                
                $scope.nodeId = parseInt(ec.getAttribute('deviceId'));
                var allNodes = overViewData[$scope.psysId].powerLinesMap[$scope.lineId].nodes
        		for(var i=0;i<allNodes.length;i++){
        			if(allNodes[i].deviceId == $scope.nodeId) {
        				$scope.nodeName = allNodes[i].name;
        				break;
        			}
        		}
                
                //更改节点下拉
                $("#nodes").val($scope.nodeId);
                
                init($scope.psysId,$scope.nodeId);
//                if(callback){
//                    callback(parseInt(ec.getAttribute('deviceId')));
//                }
            });
        }
        //if(!svgNode){
            clickAction(callBack);
        //}
    
	}
});


function replaceTime(time){
	return time.replace("T"," ").replace("Z","");
}