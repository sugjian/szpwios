app.controller('monitorSubstationCtrl',function($scope, $http, $state,$q,$rootScope,$stateParams,$document,$timeout,$compile,toaster) {
	var windowH = $(window).height();
	var windowW= $(window).width();
	
	$(".overflow-auto").height(windowH-165);
	$scope.psysId = $stateParams.sysId;
	$scope.pbdzId = $stateParams.bdzId;
	$scope.regionId = overViewData[$scope.psysId].substationsMap[$scope.pbdzId].parentId;
	$scope.gdjName = overViewData[$scope.psysId].name;
	$scope.hasAlarm = false;
	//console.log($scope.psysId+"==" + $scope.pbdzId +"=="+$scope.regionId);
	$scope.dlxStatus = {};
	
	$scope.isBDZDataFinish = false;
	
	//得到所有变电站列表
	function getAllBDZList(psysId,regionId,pbdzId){
		$("#bdzs").html('');
		$("#bdzs").append("<option value='-1' align='center'>-请选择-</option>");
		if(!overViewData[psysId].regionsMap[regionId]) {
			$("#bdzs").html("<option value='-1' align='center'>(数据错误)</option>");
			return;
		}
		var substations = overViewData[psysId].regionsMap[regionId].substations;
		for(var j = 0;j<substations.length;j++){
			var ssid = substations[j].id;
			$("#bdzs").append("<option value='"+ ssid +"' align='center'>"+substations[j].name+"</option>");
		}
		//选中变电站
		$("#bdzs").val(pbdzId);
	}
	//getAllBDZList();
	
	//得到所有区域列表
	function getAllAreas(){
		for(var key in overViewData){
			var regions = overViewData[key].regions;
			if(regions && regions.length>0){
				for(var j = 0;j<regions.length;j++){
					var ssid = key + "_" + regions[j].id;
					$("#areas").append("<option value='"+ssid+"'>"+regions[j].name+"</option>");
				}
				
			}
		}
		
		$("#areas").val($scope.psysId + "_" + $scope.regionId);
	}
	getAllAreas();
	getAllBDZList($scope.psysId,$scope.regionId,$scope.pbdzId);
	
	var sysIdTemp = $scope.psysId;
	//切换区域
	$("#areas").on("change",function(e) {
		var ssid = $("#areas").val().split("_");
		console.log(overViewData[ssid[0]]);
		$scope.gdjName = overViewData[ssid[0]].name;
		$("#gdjNameId").html($scope.gdjName);
		//$scope.pbdzId = -1;
		//$scope.psysId = ssid[0];
		sysIdTemp = ssid[0];
		getAllBDZList(ssid[0],ssid[1],-1);
		//$scope.initSvgData(ssid[0],ssid[1]);
		//$scope.$broadcast('parentLineChange');
		
	});
	
	//切换变电站
	$("#bdzs").on("change",function(e) {
		
		var pbdzId = $("#bdzs").val();
		if(pbdzId != -1 && ($scope.psysId != sysIdTemp || pbdzId !=$scope.pbdzId) ){
			$scope.psysId = sysIdTemp;
			
			$scope.pbdzId = $("#bdzs").val();
			$scope.isBDZDataFinish = false;
			$("#svgDataSub").html("");
			$scope.initSvgData($scope.psysId,$scope.pbdzId);
			$scope.$broadcast('parentLineChange');
		}
		
	});
	//切换变电站完成
	$scope.hasZeroVData = true; 
	$scope.isZeroVdata =true;
	 $scope.$on('zeroVDataJudge', function(event, data) {
		 console.log(data.isZeroVData +"==" + data.hasZeroVData);
		 $scope.isZeroVdata = data.isZeroVData == 'yes';
		 $scope.hasZeroVData = true;
		 if($scope.isZeroVdata == true){
			 $scope.hasZeroVData = data.hasZeroVData == 'yes';
			 
		 }
     });
	
	var _getFirstDataPromise;
	$scope.getFirstData = function(sysId,bdzId){
		 _getFirstDataPromise = $q(function (resolve, reject) {
			var powerSupplysMap = JSON.parse(storage["powerSupplysMap"]);
			var address = powerSupplysMap[sysId].address;
			//获取状态数据
			$http({
				method : "GET",
				url : address+"/api/v1/dcu/substation/first_data",
				params : {
					'id':bdzId,
				},
				timeout : 20000
			}).success(function(msg) {
				if(!msg){
					msg = {"data":{},"code":"-1"};
				}
				//msg = {"data":{"6":{"3":null,"4":{"sgs_a":[159.1,12,2.98],"sgs_b":[165.9,12,2.85],"sgs_c":[157.6,11,2.62]},"5":{"sgs_a":[159.1,12,2.98],"sgs_b":[165.9,12,2.85],"sgs_c":[157.6,11,2.62]},"voltage":2},"8":{"7":null,"voltage":-1}},"code":"0","message":"ok"};
				resolve(msg); 
				
			}).error(function(msg) {
				var msg2 = {"data":{},"code":"-1"};
				resolve(msg2); 
				
			});
	     });
		 //
	     return _getFirstDataPromise;
	 }
	
	
	
	//$scope.getAlarmData($scope.psysId,$scope.pbdzId);
	
	 var _getAlarmDataPromise;
	 $scope.getAlarmData = function(sysId,bdzId){
		 _getAlarmDataPromise = $q(function (resolve, reject) {
			var powerSupplysMap = JSON.parse(storage["powerSupplysMap"]);
			var address = powerSupplysMap[sysId].address;
			var date = new Date();
			date.setDate(date.getDate()-30);
			$http({
				method : "GET",
				url : address+"api/v1/alarm/search_alarmlist",
				params : {
					'userId': powerSupplysMap[sysId].userId,
					'gdjId': powerSupplysMap[sysId].gdjId,
					'bdzId': bdzId,
					'startTime':date.format('yyyy-MM-dd HH:mm:ss'),
					'alarmType':'100,101',
					'status':0
				},
				timeout : 20000
			}).success(function(msg) {
				//msg = {"data":[{"id":857353,"position":1,"dcuId":30,"rtc":1,"time":"2016-11-02T13:05:30Z","address":"11","alarmType":100,"millis":10,"status":0,"result":"三相短路","remark":"实验室变-实验线#1杆和#10杆之间","modifier":null,"sample":4400,"modifyDate":"2016-08-12T16:37:49Z"},{"id":857353,"position":1,"dcuId":27,"rtc":1,"time":"2016-11-02T13:05:30Z","address":"11","alarmType":100,"millis":10,"status":0,"result":"三相短路","remark":"实验室变-实验线#1杆和#10杆之间","modifier":null,"sample":4400,"modifyDate":"2016-08-12T16:37:49Z"}],"start":0,"limit":20,"total":1,"code":"0","message":"ok"};
				//获取有故障的变电站数量
				$scope.dlxStatus ={};
				//获取该变电站下所有线路数量
				var allLineNum = overViewData[sysId].substationsMap[bdzId].powerLines.length;
				
				var dlAlarm = 0, jdAlarm = 0;
				if(msg.code == '0'){
					if(msg.data.length > 0){
						$scope.hasAlarm = true;
					}
					for(var k=0;k<msg.data.length;k++){
						if(!overViewData[sysId].nodesMap[msg.data[k].dcuId]) continue;
						var dlxId = overViewData[sysId].nodesMap[msg.data[k].dcuId].dlxId;
						var sysbdz = sysId +"_" + bdzId;
						//电力线报警数量
						if($scope.dlxStatus[dlxId]){
							$scope.dlxStatus[dlxId] = $scope.dlxStatus[dlxId]+1;
						}else{
							$scope.dlxStatus[dlxId] = 1;
						}
						//判断短路还是接地故障
						if(msg.data[k].alarmType == 100){
							dlAlarm++;
						}else if(msg.data[k].alarmType == 101){
							jdAlarm++;
						}
					}
				}
				$scope.dlAlarmNum = dlAlarm;
				$scope.jdAlarmNum = jdAlarm;
				
				$scope.alarmLineNum = Object.keys($scope.dlxStatus).length;
				$scope.normalLineNum = allLineNum - $scope.alarmLineNum;
				
				resolve(""); 
			}).error(function(msg) {
				resolve(""); 
				
			});
		 });
	     return _getAlarmDataPromise;
	}
	
	$scope.initSvgData = function(sysId , bdzId){
		
		$q.all([$scope.getAlarmData(sysId,bdzId), $scope.getFirstData(sysId,bdzId)]).then(function (results) {
			 
			var powerSupplysMap = JSON.parse(storage["powerSupplysMap"]);
			var address = powerSupplysMap[sysId].address;
			
			//获取静态数据
			var parentPowerLines = overViewData[sysId].substationsMap[bdzId].parentPowerLines;
			
			var realData = results[1];
			var parentPowerLinesNew = parentPowerLines.slice(0);
			var code = realData.code;
			for(var k=0;k<parentPowerLinesNew.length;k++){
				if(code == "0" && realData.data[parentPowerLinesNew[k].id]){
					var voltage = realData.data[parentPowerLinesNew[k].id].voltage;
					if(voltage != -1){
						parentPowerLinesNew[k]["n_zero"] = voltage;
					}
				}
				var powerLinesNew = overViewData[sysId].parentPowerLinesMap[parentPowerLinesNew[k].id].powerLines.slice(0);
				for(var j=0;j<powerLinesNew.length;j++){
					if($scope.dlxStatus[powerLinesNew[j].id]){
						powerLinesNew[j]["n_status"] = $scope.dlxStatus[powerLinesNew[j].id];
					}
					if(code == "0"){
						if(!realData.data[parentPowerLinesNew[k].id]) continue;
						var lineDa = realData.data[parentPowerLinesNew[k].id][powerLinesNew[j].id];
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
						
						powerLinesNew[j]["n_voltage"] = n_voltage;
					}
				}
				parentPowerLinesNew[k]["powerLines"] = powerLinesNew;
			}
			$scope.initSvg(parentPowerLinesNew);
			$scope.initSvgWH();
			$scope.isBDZDataFinish = true;
		 });
		
		
	}
	
	var suof = 1.0*0.9*0.9*0.9*0.9;
	var initWidth;
	var initHeight;
	$scope.goSmall = function(){
		var svg = d3.select("#mu-svg-show svg")
		suof = suof * 0.9;
		if(suof < 1){
			//放大图标显示
			$scope.largestFlag = false;
		}
		var w = initWidth*suof;
		var h = initHeight*suof;
		
		$("#test").attr("transform","scale("+suof+")");
		svg.attr("width",w);
		//$("#svgDataCircuit").css("height",h);;
		$("#mu-svg-show").css("width",w);
		svg.attr('viewBox', "0 0 "+w +" "+ h);
	}
	
	$scope.initSvgWH = function(){
		 var svg = d3.select("#mu-svg-show svg")
		 suof = 1*0.9*0.9*0.9*0.9;
         $scope.largestFlag = false;
         
         var w = initWidth*suof;
 		 var h = initHeight*suof;
 		
 		 $("#test").attr("transform","scale("+suof+")");
 		 svg.attr("width",w);
 		 //$("#svgDataCircuit").css("height",h);;
 		 $("#mu-svg-show").css("width",w);
 		 svg.attr('viewBox', "0 0 "+w +" "+ h);
	}
	$scope.goBig = function(){
		if(suof >= 1) return;
		var svg = d3.select("#mu-svg-show svg");
		suof = suof / 0.9;
		if(suof >= 1){
			//置灰放大图标
			$scope.largestFlag = true;
		}
		var w = initWidth*suof;
		var h = initHeight*suof;
		
		$("#test").attr("transform","scale("+suof+")");
		svg.attr("width",w);
		//$("#svgDataCircuit").css("height",h);;
		$("#mu-svg-show").css("width",w);
		svg.attr('viewBox', "0 0 "+w +" "+ h);
	}
	
	$scope.initSvgData($scope.psysId,$scope.pbdzId);
	
	$scope.initSvg = function(modelValue){
		$("#svgDataSub").html('<div id="mu-svg-show" mu-svg="parentId" ng-model="json2">'+
		    '<svg>'+
			    '<defs>'+
			        '<marker id="arrow1" markerWidth="10" markerHeight="10" refx="9" refy="3" orient="auto" markerUnits="strokeWidth">'+
			            '<path d="M0,0 L6,3 L0,6 L9,3 z"  class="sanjiao"/>'+
			            '<!--<path d="M0,0 L0,6 L9,3 z"  class="sanjiao"/>-->'+
			        '</marker>'+
			   ' </defs>'+
			'</svg>'+
	    '</div>')
        var switchSvg = function (g, start, yi) {
            var u=start;
            var y = 30;
            var yy = 33;
            var uy = 16;
            g.append('path')
                .attr({
                    "d":"M" + u + "," + yi +
                    " V" + (yi-yy) +
                    " H" + (u+y) +
                    " L" + (u+y+uy+9) + "," + (yi-y-uy) +
                    " L" + (u+y) + "," + (yi-yy) +
                    " H" + (u) +
                    " V" + (yi) +
                    " Z",
                    "class": "mu-switch"

                });

            g.append('path')
                .attr({
                    "d":"M" + (u+2*y) + "," + (yi-yy) +
                    " H" + (u+3*y) +
                    " V" + (yi) +
                    " V" + (yi-yy) +
                    " H" + (u+2*y) +
                    " Z",
                    "class": "mu-switch"

                });

        };
        if(modelValue && modelValue.length > 0){
            var json2 = modelValue;
            //console.log('json2',json2)

            var type = {
                '0': 'green-line',
                '1': 'red-line'
            };

            var electricType = {
                '0': 'electric_A',
                '1': 'electric_B',
                '2': 'electric_C'
            };

            var text = [
                {
                    "fill": "#957030",
                    "font-size": "14px",
                    "font-family": "Arial"
                }
            ]

            var value = 100,//分线间隔
                dLine = 64,//开关长度
                eLine = 50,//左右长度
            //height = 200,
                eLength = [0,0],
                yi = 80,
                ya = 286,
                svg,
                td = 28;//字的间隔

            var ed = 15;//a、b、c相距离

            //只有单电力线的母线数量
            var oneLineNum = 0;
            eLength[0] = json2.length;
            for(var i=0; i<eLength[0];i++){
                eLength[1] += json2[i].powerLines.length;
                if(json2[i].powerLines.length == 1){
                	oneLineNum++;
                }
            }
            var x = (eLength[1] - eLength[0])*value + eLength[0]*2*(eLine-30) + (eLength[0]-1)*dLine + oneLineNum * 50;
            //var x = $(window).width()*0.9 -150;
            var id = "mu-svg-show";
            var element = $("#mu-svg-show");
            
            initWidth = x+150;
            initHeight = ya;
           
            element.css({
                'width': x+150,
                'margin': '0 auto',
                'position': 'relative'
            });
            svg = d3.select('#'+id+' svg')
                .attr("width", x+150)
                .attr("height",ya)
                .attr('viewBox', "0 0 "+(x+150) +" "+ (ya));

            svg.select('g').remove();

            var g = svg.append('g')
            .attr({
                id: 'test'
            });
            //.call(zoom);

            var lx = 40;
            for(var i=0; i<eLength[0];i++){
            	
                var temp = eLine+ 23 + (json2[i].powerLines.length-1)*value + lx -30;

                //单电力线情况
                if(json2[i].powerLines.length == 1){
                	temp += 100;
            	}
                //g.append('text')
                //    .attr({
                //        "x": lx+td,
                //        "y": yi-td,
                //        "class": "mu-line-name",
                //        "parentId": json2[i].id,
                //        "lineId": json2[i].powerLines[0].id
                //    })
                //    .text(json2[i].name);
                //
                //g.append('text')
                //    .attr({
                //        "x": lx+td,
                //        "y": yi-6,
                //        "class": "mu-line-electric"
                //    })
                //    .text('零序电压：'+json2[i].zero + 'V');

                if(i<eLength[0]-1){
                    switchSvg(g, temp-10, yi);
                }

                var kx = lx + eLine -30;
                if(json2[i].powerLines.length==1){
                	kx += 50;
                }
                //生成电力线
                for(var k=0; k<json2[i].powerLines.length; k++){
                    var te = json2[i].powerLines[k];
                    var typeClass = type[te.n_status>0 ? 1: 0];
                    var g1 = g.append('g')
                        .attr({
                            "class": "ghover",
                            "parentId": json2[i].id,
                            "lineId": te.id
                        });
                    g1.append('line')
                        .attr({
                            "x1": kx-20,
                            "y1": yi,
                            "x2": kx-20,
                            "y2": ya,
                            "class": "line-fill"
                        });
                    g1.append('line')
                        .attr({
                            "x1": kx+"px",
                            "y1": yi+"px",
                            "x2": kx+"px",
                            "y2": ya+"px",
                            //"marker-end": "url(#arrow1)",
                            "class": typeClass,
                            "lineId": te.id
                        });

                    g1.append('line')
                        .attr({
                            "x1": kx,
                            "y1": ya,
                            "x2": kx-7,
                            "y2": ya-8,
                            "class": typeClass
                        })
                        .style({
                            "stroke-width": 2
                        });

                    g1.append('line')
                        .attr({
                            "x1": kx,
                            "y1": ya,
                            "x2": kx+7,
                            "y2": ya-8,
                            "class": typeClass
                        })
                        .style({
                            "stroke-width": 2
                        });

                    g1.append('text')
                        .attr({
                            'class': te.n_status>0 ? 'mu-warn-line-name': 'mu-fen-line-name',
                            "x": kx - 13,
                            "y": yi + 10
                        })
                        .text(te.name);

                    var electric = te.n_voltage;
                    if(electric){
                    	//根据显示的数据长度 进行位置偏移
                    	var py = 12;
                    	var maxL=0;
                    	for(var j=0;j<electric.length;j++){
                    		if((electric[j].current+"").length > maxL){
                    			maxL = (electric[j].current+"").length;
                    		}
                    	}
                    	if(maxL <= 3){
                    		py = 0;
                    	}
                    	console.log(py +"==py");
                        for(var j=0;j<electric.length;j++){
                            //console.log(j,electric[j],electric[j].current)
                        	
                            g1.append('text')
                                .attr({
                                    'class': electricType[j],
                                    "x": kx - 48 -py,
                                    "y": yi + 150 + j*ed
                                })
                                .text(electric[j].current + 'A');
                        }
                    }

                    kx += value;
                }
                //生成母线
                var g2 = g.append('g')
                    .attr({
                        "class": "mu-line-hover",
                        "parentId": json2[i].id,
                        //"lineId": json2[i].powerLines[0].id
                    });
                g2.append('line')
                    .attr({
                        "x1": lx+19,
                        "y1": yi-30,
                        "x2": temp-12,
                        "y2": yi-30,
                        "class": "line-mu-fill"
                    });
                g2.append('text')
                    .attr({
                        "x": lx+td ,
                        "y": yi-td ,
                        "class": "mu-line-name",
                        //"parentId": json2[i].id,
                        //"lineId": json2[i].powerLines[0].id
                    })
                    .text(json2[i].name);

                if(json2[i].n_zero){
                    g2.append('text')
                        .attr({
                            "x": lx+td+3,
                            "y": yi-11,
                            "class": "mu-line-electric"
                        })
                        .text('零序电压3U0:'+json2[i].n_zero + 'V');
                }

                g2.append('line')
                    .attr({
                        "x1": lx,
                        "y1": yi,
                        "x2": temp,
                        "y2": yi,
                        "class": 'mu-v-line'
                    });
                
                lx = temp + dLine;
            }
            //开关的个数
            //var muLength = $('.mu-switch').length * 40;
            //计算母线的长度
            //$('.mu-v-line').each(function (index){
            	//muLength = muLength + parseFloat($(this).attr("x2")) - parseFloat($(this).attr("x1"));
            //});
            
            //muLength += 84;
            //svg = svg.attr('viewBox', "0 0 "+muLength +" "+ (ya));

            var timer = null;

            var lineMouseenter = function (e) {
                var offset = $document.find(e.currentTarget).offset();
                //var leftDis = $('svg').offset().left - $('.power-svg-container').offset().left;
                var svgContainer = $document.find('.power-svg-container');
                var top = offset.top,
                    left = offset.left,
                    Left = 250,
                    bW = document.body.clientWidth,
                    bH = document.body.clientHeight,
                //cX = e.clientX,
                //cY = e.clientY,
                    w = 190,
                    h = 122,
                    L = 0,
                    T = 0;

                var cx = parseInt(e.currentTarget.firstChild.getAttribute('x1'));
                var width_stroke = 60;

                //var svgWidth = svgContainer.width() < x ? svgContainer.width() : x;
                var svgWidth = svgContainer.width();
                L =cx + 30;
                if( L + w  > svgContainer.scrollLeft() + svgWidth ){
                    L  = cx - w-30;
                }
                //if(left+w+50<bW){
                //    //right
                //    L = cx+50 +leftDis;
                //}else{
                //    L = cx - w-20 +leftDis;
                //}

                T = 163;

                var div = $document.find('#popup');
                //console.log(T,L)
                var index1 = _.findIndex(json2, {id: parseInt(e.currentTarget.getAttribute('parentId'))});
                var index2 = _.findIndex(json2[index1].powerLines, {id: parseInt(e.currentTarget.getAttribute('lineId'))});
                $scope.lineDate = json2[index1].powerLines[index2];
                //$scope.$apply();
                //console.log(scope.lineDate);
                var n_h = h;
                if($scope.lineDate.n_status == 0){
                    n_h = 100;
                }
                if(div.length == 0){
                    element.append(
                        '<div id="popup" style="width: '+w+'px;height: '+n_h+'px;top: '+T+'px;left: '+L+'px;'+'">' +
                        '<div class="popup-text-title">'+
                        '<span ng-bind="lineDate.name"></span>'+
                        '<span >:</span>'+
                        '<span ng-class="{true: \'warning-one-color\', false: \'normal-color\'}[lineDate.n_status>0]">{{lineDate.n_status | warningType}}</span>'+
                        '</div>'+
                        '<div class="popup-text-xiang">'+
                        '<span class="electric_A">A相：</span>'+
                        '<span ng-bind="lineDate.n_voltage[0].current"></span>'+
                        '<span>A/</span>'+
                        '<span ng-if="lineDate.n_voltage[0].temperature !== null"><span ng-bind="lineDate.n_voltage[0].temperature"></span>'+
                        '<span>°C/</span></span>'+
                        '<span ng-bind="lineDate.n_voltage[0].percent"></span>'+
                        '<span>%</span>'+
                        '</div>'+
                        '<div class="popup-text-xiang">'+
                        '<span class="electric_B">B相：</span>'+
                        '<span ng-bind="lineDate.n_voltage[1].current"></span>'+
                        '<span>A/</span>'+
                        '<span ng-if="lineDate.n_voltage[1].temperature !== null"><span ng-bind="lineDate.n_voltage[1].temperature"></span>'+
                        '<span>°C/</span></span>'+
                        '<span ng-bind="lineDate.n_voltage[1].percent"></span>'+
                        '<span>%</span>'+
                        '</div>'+
                        '<div class="popup-text-xiang">'+
                        '<span class="electric_C">C相：</span>'+
                        '<span ng-bind="lineDate.n_voltage[2].current"></span>'+
                        '<span>A/</span>'+
                        '<span ng-if="lineDate.n_voltage[2].temperature !== null"><span ng-bind="lineDate.n_voltage[2].temperature"></span>'+
                        '<span>°C/</span></span>'+
                        '<span ng-bind="lineDate.n_voltage[2].percent"></span>'+
                        '<span>%</span>'+
                        '</div>'+
                        '<div class="popup-warning" ng-if="lineDate.n_status>0">'+
                        '<span>报警数量：</span>'+
                        '<span ng-bind="lineDate.n_status" class="warning-one-color"></span>'+
                        '</div>'+
                        '</div>');
                    $compile($document.find('#popup').contents())($scope);
                }else{
                    div.css({
                        "top": T ,
                        "left": L ,
                        "height": n_h
                    })
                }

                $timeout.cancel(timer);
                timer = $timeout(function () {
                    $document.find('#popup').show();
                },500)

            }
            
            var moveToChart = function () {
                $('.power-body-content-right').animate({
                    scrollTop: 354 }, 500);
            }

            var lineMouseleave = function (e) {
                $timeout.cancel(timer);
                timer = $timeout(function () {
                    var div = $document.find('#popup');
                    div.hide();

                },500);
            }

            var mouseAction = function () {
                element.on('mouseenter', '.ghover', function (e) {
                    //lineMouseenter(e);
                });

                element.on('mouseleave', '.ghover', function (e) {
                    //lineMouseleave(e);
                });
                
            }

            mouseAction();
            var e1 = null;
            var e3 = element.find('.mu-line-hover[parentId='+ 1 +']').children();
            //console.log('e3',e3)

            var addColor = function (ec, type, color) {
                //ec = $(e.currentTarget).children();
                color = color || ec.eq(type).css('stroke');
                if(type == 1){
                    ec.eq(1).css('stroke', color);
                    ec.eq(2).css('stroke', color);
                    ec.eq(3).css('stroke', color);
                    ec.eq(4).css('fill', color);
                }
                if(type == 3){
                    ec.eq(1).css('fill', color);
                    ec.eq(3).css('stroke', color);
                }

            }
            addColor(e3, 3, '#0F66CD');

            $scope.$on('highLine', function(event, data) {

                if(_.isNumber(data.lineId)){
                    e1 = element.find('.ghover[lineId='+ data.lineId +']').children();
                    removeColor(e3, 3);
                    var color = '#018952';
                    if(e1.eq(1).attr('class') == 'red-line'){
                        color = '#BF1A2E';
                    }
                    addColor(e1, 1, color);
                }
                //console.log('line-data',data)
                $scope.$broadcast('lineEnd', null);
            });

            var removeColor = function (ec, type) {
                if(type == 1){
                    ec.eq(1).css('stroke', '');
                    ec.eq(2).css('stroke', '');
                    ec.eq(3).css('stroke', '');
                    ec.eq(4).css('fill', '');
                }

                if(type == 3){
                    ec.eq(1).css('fill', '');
                    ec.eq(3).css('stroke', '');
                }

            }

            var clickAction = function () {
                element.on('click', '.ghover', function (e) {
                    //console.log(e)
                    if(!!e1){
                        removeColor(e1, 1)
                    }
                    if(!!e3){
                        removeColor(e3, 3)
                    }
                    e1 = $(e.currentTarget).children();
                    addColor(e1, 1);
                    //element.unbind('mouseenter mouseleave');
                    var parentId = parseInt(e.currentTarget.getAttribute('parentId')),
                        lindId = parseInt(e.currentTarget.getAttribute('lineId'));
                    //overviewService.setParent(json2[ _.findIndex(json2, {id: parentId})]);
                    //overviewService.setChild(scope.lineDate);
                    //var index = index = _.findIndex(json2, {id: parentId});
                    console.log(parentId +"==" + lindId);
                    $state.go('app.circuit', {
                    	sysId:$scope.psysId,
                        bdzId: $scope.pbdzId,
                        parentId: parentId,
                        lineId: lindId
                    });
                    //moveToChart();

                });
            }
            clickAction();



            element.on('click', '.mu-line-hover', function (e) {
                $document.find('#popup').hide();
                //mouseAction();
                //clickAction();
                if(!!e1){
                    removeColor(e1, 1)
                }
                if(!!e3){
                    removeColor(e3, 3)
                }
                e3 = $(e.currentTarget).children();
                //ec = $(e.currentTarget.children[e.currentTarget.children.length-1]);
                addColor(e3, 3);
                var parentId = parseInt(e.currentTarget.getAttribute('parentId'));
                var index = _.findIndex(json2, {id: parentId});
                //overviewService.setParent(json2[index]);
//                $state.go('overview.station.parent', {
//                    stationId: json2[index].parentId,
//                    parentId: parentId
//                });
                //moveToChart();
            })

            //element.on('click', '.ghover', function (e) {
            //    var parentId = parseInt(e.currentTarget.getAttribute('parentId')),
            //        lindId = parseInt(e.currentTarget.getAttribute('lineId'));
            //    overviewService.setParent(json2[ _.findIndex(json2, {id: parentId})]);
            //    overviewService.setChild(scope.lineDate);
            //    $state.go('overview.station.child', {
            //        parentId: parentId,
            //        lineId: lindId
            //    });
            //})
        }

    
	}
	
});
