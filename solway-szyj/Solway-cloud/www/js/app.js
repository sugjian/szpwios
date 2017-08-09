'use strict';
var svnRevision = 10150;
//var ctx = "http://netest.solway.cn:8282/";
//var ctx = "http://127.0.0.1:8080/solway_szyj/";
var ctx = "http://cloud.silverfernpower.com:8282/";
//var phoneType = 'android';//手机类型；ios；android
var oldVersion = '1.3.4';//当前版本
var isLocalFlag = false;
var initLogin = -1;
var hasMessage = false;
var overViewData = {};
var alarmConfig = [];
var alarmConfigMap = {};
var newVersion;//最新版本
angular.module('app',
		[ 'ngAnimate', 'ngCookies', 'ngResource', 'ngSanitize', 'ngTouch','ngStorage', 'ui.router', 'ui.bootstrap', 'ui.load', 'ui.jq',
		  'ui.validate', 'oc.lazyLoad', 'pascalprecht.translate' ]).directive('repeatDone',
		function() {
			return {
				link : function(scope, element, attrs) {
					if (scope.$last) { // 这个判断意味着最后一个 OK
						scope.$eval(attrs.repeatDone) // 执行绑定的表达式
					}
				}
			}
		}).filter("dataNullFilter",function(){//判断为空
		    return function(data){
		    	var dataIsNull="-";
		    	if(data || (data == 0)){
		    		dataIsNull=data
		    	}
				return dataIsNull;
		    }
		}).filter("warningType",function(){//判断为故障类型
		    return function(data){
		    	var reData = "正常";
		    	if(data && data == 1){
		    		reData="警告";
		    	}
				return reData;
		    }
		}).filter("dateFilter",function(){
            return function(data){
            	var countDate;
        		var date2= (new Date).getTime();  //开始时间
        		var date1=data;    //结束时间
        		var date3=date2-date1  //时间差的毫秒数
        		 
        		//计算出相差天数
        		var days=Math.floor(date3/(24*3600*1000))
        		 
        		//计算出小时数
        		var leave1=date3%(24*3600*1000)   
        		
        		//计算天数后剩余的毫秒数
        		var hours=Math.floor(leave1/(3600*1000))
        		
        		//计算相差分钟数
        		var leave2=leave1%(3600*1000)        
        		
        		//计算小时数后剩余的毫秒数
        		var minutes=Math.floor(leave2/(60*1000))
        		 
        		//计算相差秒数
        		var leave3=leave2%(60*1000)      
        		
        		//计算分钟数后剩余的毫秒数
        		var seconds=Math.round(leave3/1000);
        		
        		
        		if(date3<=60*1000){
        			countDate="刚刚";
        		}else if(days>=1){
        			countDate=FormatDate(date1)		
        			//countDate=days+"天 "+hours+"小时 "+minutes+"分钟前"
        		}else {
        			if(hours>0&&hours<=24){
        				countDate=hours+"小时 "+minutes+"分钟前"
        			}else{
        				if(minutes>=1&&minutes<=60){
        					countDate=minutes+"分钟前";
        				}
        			}
        		}
        		return countDate;
            }
        }).filter("cleanTimeTZ",function(){//时间处理
		    return function(data){
				return replaceTimeTZ(data);
		    }
		}).filter("cleanTimeTZYMD",function(){//时间处理
		    return function(data){
				return replaceTimeTZ(data).substring(0,10);
		    }
		});
			function FormatDate (strTime) {
			    var date = new Date(strTime);
			    return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
			}
		
		// 数组加indexOf方法
		Array.prototype.indexOf = function(e) {
			for (var i = 0, j; j = this[i]; i++) {
				if (j == e) {
					return i;
				}
			}
			return -1;
		}
		
		// 增加map
		function Map() {
			// 初始化map_，给map_对象增加方法，使map_像个Map
			var map_ = new Object();
			// 属性加个特殊字符，以区别方法名，统一加下划线_
			map_.put = function(key, value) {
				map_[key] = value;
			}
			map_.get = function(key) {
				return map_[key];
			}
			map_.remove = function(key) {
				delete map_[key];
			}
			map_.keyset = function() {
				var ret = "";
				for ( var p in map_) {
					if (typeof p == 'string' && p.substring(p.length - 1) == "_") {
						ret += ",";
						ret += p;
					}
				}
				if (ret == "") {
					return ret.split(","); // empty array
				} else {
					return ret.substring(1).split(",");
				}
			}
			return map_;
		}

		// 定义本地存储
		var storage = window.localStorage; 
		//定义设备类型
		var u = navigator.userAgent, app = navigator.appVersion;
		/*
		 * function isAndroid(){ return u.indexOf('Android') > -1 || u.indexOf('Linux') >
		 * -1|| u.indexOf('com.solway.agent') < 0; //android终端或者uc浏览器或者ios 浏览器 }
		 */
		
		var isAndroid = false;
		function distPhone() { // 判断手机类型
			if (isAndroid) { // 判断用户类型改变class
				$("body").css("padding-top", "0px");
			}
		}

		// 安卓系统得到token值
		function getParameter(propertyName) {
			var url = window.location.href;
		
			var res = "";
			var index = url.indexOf(propertyName + "=");
			if (index > -1)
				res = url.substring(index + propertyName.length + 1, url.length);
			if ("null" == res || "undefined" == res) {
				res = "";
			}
			return res;
		}
		
		//登录
		function toLogin(url) {
			if (url != null) {
				//storage["goToUrl"] = url
				window.location.href = url;
			}
			window.location.href = "./index.html#/Login?deviceToken=" + deviceToken;
		}

		// 判断缓存 是否失效
		function checkStorage() {
			if (storage["email"] == "" || typeof (storage["email"]) == "undefined"
				|| storage["password"] == ""
				|| typeof (storage["password"]) == "undefined") {
			window.location.href = "./index.html#/login?deviceToken=" + deviceToken;
			}
		}

		var deviceToken = getParameter("deviceToken"); // 定义一个token
		
		function saveDeviceId(){
			$state.go("app.realStatistics");
		}
		
		// 检查用户是否登录状态（自动登陆）
		function autoLogin(url) { 
			if (storage["userName"] == "" || typeof (storage["userName"]) == "undefined"
					|| storage["password"] == ""|| typeof (storage["password"]) == "undefined") {
				window.location.href = "./index.html#/login?deviceToken=" + deviceToken;
				//storage["goToUrl"] = url; // 跳转到消息详情链接 */
			} else {
				var username, password;
				username = storage["userName"];
				password = storage["password"];
				cleanStorageNotUserName();
				overViewData = {};
				var powerSupplys = null;
				$http({
					method : "GET",
					url : ctx+"solway/getUserInfoForSolway",
					params : {
						'userName':username
					},
					timeout : 20000
				})
				.success(function (msg) {
					console.log("中间数据库中获取权限列表")
					console.log(msg)
					var data = msg.data;
					if(data && data.length>0){
						var arr = [];
						for(var i=0;i<data.length;i++){
							arr.push({'gdjId':data[i].gdjId,'address':data[i].dataRequestAddress,'systemId':data[i].id})
						}
						powerSupplys = arr;
					}
					/* 
					console.log("powerSupplys");
					console.log(powerSupplys) */
					if(powerSupplys && powerSupplys.length>0){
						//登录接口（1个或者多个）
						var loginSuccessResults = [];//存储登录接口返回值
						var num=0;
						for(var i=0;i<powerSupplys.length;i++){
							(function(i){
								$http({
									method : "POST",
									url : powerSupplys[i].address + "api/v1/user/login",
									data :{
										"username":username,
										"password": password
									},
									dataType: "json"
								}).success(function (msg) {
									loginSuccessResults[i] = msg;
									num++;
									if(num == powerSupplys.length){//几个权限全部登录完之后，再操作
										loginData(loginSuccessResults,username,password,powerSupplys);
									}
										
								}).error(function(msg){
									loginSuccessResults[i] = msg;
									num++;
									if(num == powerSupplys.length){//几个权限全部登录完之后，再操作
										loginData(loginSuccessResults,username,password,powerSupplys);
									}
								});
							})(i);
						}  
					}else{
						$("#loginMessage").html("用户名不存在!");
						$("#loginMessage").show();
						$(".login-btn").button('reset');
					}
						
				}).error(function(msg){
					$("#loginMessage").html("连接超时，请重试!");
					$("#loginMessage").show();
					$(".login-btn").button('reset');
				});
			}
		}
		
		function loginData(loginSuccessResults,username,password,powerSupplys){
				var hasSuccessedFlag = false; //登录接口中是否有一个成功的标志位，>= 1,则置为true
				for(var j = 0;j<loginSuccessResults.length;j++){
					if(loginSuccessResults[j] && loginSuccessResults[j].code == '0'){
						hasSuccessedFlag = true;
						powerSupplys[j]['userId'] = loginSuccessResults[j].data.userId;
					}
				}
				var tempPowerSupplys = [];
				var powerSupplysMap = {};
				for(var j = 0;j<powerSupplys.length;j++){
					if(powerSupplys[j].userId != undefined && powerSupplys[j].userId != null){
						tempPowerSupplys.push(powerSupplys[j]);
						powerSupplysMap[powerSupplys[j].systemId] = powerSupplys[j];
					}
				}
				//存储供电局信息
				if(tempPowerSupplys && tempPowerSupplys.length>0){
					var jsonObj = JSON.stringify(tempPowerSupplys);  //将JSON对象转化成字符串
					storage["powerSupplys"] = jsonObj;   //用localStorage保存转化好的的字符串
					storage["powerSupplysMap"] = JSON.stringify(powerSupplysMap);   //用localStorage保存转化好的的字符串
				}
				//若有一个供电站登录成功，则存储用户名，密码，并更新设备ID到中间数据库
				if(hasSuccessedFlag){
					storage["userName"]=username;//存储用户名
					storage["password"]=password;//存储密码
					storage["isLogin"]=1;//是否登录成功
					saveDeviceId(url);
					
				}else{
					$("#loginMessage").html("用户名或密码有误!");
					$("#loginMessage").show();
					$(".login-btn").button('reset');
				}
		}
		
		function saveDeviceId(url){
			$http({
				method : "GET",
				url : ctx+ "solway/updateDeviceIdForSolway",
				params : {
					"userName":storage["userName"],
					"deviceId": deviceToken
				}
			}).success(function (msg) {
			})
			if (url != null) {
				//storage["goToUrl"] = url
				window.location.href = url;
			}else{
				$state.go("app.realStatistics");
			}
		}
		
		function cleanStorageNotUserName() { 
			localStorage.removeItem("isLogin");
			localStorage.removeItem("active");
			localStorage.removeItem("powerSupplys");
			localStorage.removeItem("powerSupplysMap");
			localStorage.removeItem("stationName");
		}
		
		// 对Date的扩展，将 Date 转化为指定格式的String   
		// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，   
		// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
		// 例子：   
		// (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
		// (new Date()).format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
		Date.prototype.format = function(fmt) { //author: meizz   
		  var o = {   
		    "M+" : this.getMonth()+1,                 //月份   
		    "d+" : this.getDate(),                    //日   
		    "H+" : this.getHours(),                   //小时   
		    "m+" : this.getMinutes(),                 //分   
		    "s+" : this.getSeconds(),                 //秒   
		    "q+" : Math.floor((this.getMonth()+3)/3), //季度   
		    "S"  : this.getMilliseconds()             //毫秒   
		  };   
		  if(/(y+)/.test(fmt))   
		    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
		  for(var k in o)   
		    if(new RegExp("("+ k +")").test(fmt))   
		  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
		  return fmt;   
		}
		
		
		function replaceTimeTZ(time){
			if(time){
				return time.replace("T"," ").replace("Z"," ");
			}
		}
		
		function findArrayMapIndex(arrayData,map){
			
			for(var i=0;i<arrayData.length;i++){
				if(arrayData[i].id == map.id) return i;
			}
			return -1;
		}
		
		var sortBy = function(name){
			return function(o, p){
				var a, b;
				if (typeof o === "object" && typeof p === "object" && o && p) {
					a = o[name];
					b = p[name];
					if (a === b) {
						return 0;
					}
					if (typeof a === typeof b) {
						return a < b ? 1 : -1;
					}
					return typeof a < typeof b ? 1 : -1;
				}
				else {
					throw ("error");
				}
			}
		}
		
		function getDateForStringDate(strDate){
			//切割年月日与时分秒称为数组
			var s = strDate.split(" ");
			var s1 = s[0].split("-");
			var s2 = s[1].split(":");
			if(s2.length==2){
				s2.push("00");
			}
			return new Date(s1[0],s1[1]-1,s1[2],s2[0],s2[1],s2[2]);
		}	
