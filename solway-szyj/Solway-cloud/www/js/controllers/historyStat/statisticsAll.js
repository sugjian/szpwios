function addAnimete(){
	$("#statcontent").removeClass("animated slideInLeft slideInRight")
}

app.controller('staAllCtrl', function($scope, $http, $state, $rootScope,$stateParams, toaster) {
	
	$scope.gdjIdSP = $stateParams.sysId;
	$scope.bdzIdSP = $stateParams.bdzId;
	$scope.lineIdSP = $stateParams.lineId;
	$scope.nodeIdSP = $stateParams.nodeId;
	$scope.stypeSP = $stateParams.stype;
	$scope.stimeSP = $stateParams.stime;
	
	$scope.showBack = false;//默认第一次不显示返回箭头
	//从实时监控切换过来时
	if($scope.gdjIdSP && $scope.bdzIdSP && $scope.lineIdSP && $scope.nodeIdSP){
		$scope.searchPage = false;
	}else{
		$scope.searchPage = true;
	}
	
	//定义左右动画
	//替换左右动画
	$scope.swipeRight=function(event){

		//$scope.dateLeft();
		//$("#statcontent").addClass("animated slideInLeft")
		//setTimeout("addAnimete()", 500);
		$scope.$broadcast("toDateHeader","right");
	}
	$scope.swipeLeft=function(){//往左滑动
		//$scope.dateRight();
		//$("#statcontent").addClass("animated slideInRight")
		//setTimeout("addAnimete()", 500); 
		$scope.$broadcast("toDateHeader","left");
	}
	
	$scope.$on("includes",function(e,data){
		if(data){
			$scope.showBack = true;
			$scope.searchPage = false;
			$scope.$broadcast("toStaAll",data);
		}
		
	});
	
	$scope.$on("time",function(e,data){
		$scope.$broadcast("toSearchPage",data);
		if(!$scope.searchPage){
			$scope.$broadcast("toStaAllTime",data);
		}
	});
	
	$scope.$on("beback",function(){
		$scope.showBack = true;
		$scope.searchPage = true;
	});
	
	
	$("#stataTitle").text("历史统计");
	//不显示刷新按钮
	$rootScope.refreshShow = false;
	
	//监听刷新事件
//	if(!storage["stationName"]){
//			storage["stationName"]="全部";
//			$("#stataTitle").text(storage["stationName"])
//		}
//	$("#stataTitle").text(storage["stationName"])
	//公用模态框
	$rootScope.statDataPage = ""
	$rootScope.statDataPage2 = ""
	$scope.changeTimeId = 1;
	if(storage["powerStationId"]){
		$scope.rootStationId=JSON.parse(storage["powerStationId"])
	}else{
	}

	//返回到查询结果页
	$scope.goBack = function(){
		$scope.searchPage = false;
	}
	//关闭模态框
	$scope.closeStatModal = function() {
		$("#statModal").animate({
			left: window.screen.width + 'px'
		}, 300, function() {
			$rootScope.statDataPage = ""
			$('#statModal').modal("hide");
		});
	}
	//打开模态框
	$scope.openStatModal = function() {
		$('#statModal').modal({backdrop: 'static', keyboard: false});
		$("#statModal").animate({
			left: '0px'
		}, 300, function() {
		});
	}
	//打开模态框2
	$scope.openStatModal2 = function() {
		$('#statModal2').modal({backdrop: 'static', keyboard: false});
		$("#statModal2").animate({
			left: '0px'
		}, 300, function() {
		});
	}
	//关闭模态框
	$scope.closeStatModal2 = function() {
		$("#statModal2").animate({
			left: window.screen.width + 'px'
		}, 300, function() {
			$rootScope.statDataPage2 = ""
			$('#statModal2').modal("hide");
		});
	}
	
	//监听刷新事件
	$scope.$on('loadData', function(event, data) {
		$scope.changeDate($scope.changeTimeId)
	});
	
});


Date.prototype.Format = function(fmt) { //author: meizz 
	var o = {
		"M+": this.getMonth() + 1, //月份 
		"d+": this.getDate(), //日 
		"h+": this.getHours(), //小时 
		"m+": this.getMinutes(), //分 
		"s+": this.getSeconds(), //秒 
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
		"S": this.getMilliseconds() //毫秒 
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}
function countTime(opt) {
    var now = new Date().getTime();
    var defaultOpt = {
        st: now, //开始时间,时间戳
        et: now, //结束时间,时间戳
        sdom: null,
        mdom: null,
        hdom: null,
        ddom: null,
        Mdom: null,
        ydom: null
    };
    this.opt = $.extend({}, defaultOpt, opt);
    this.h = 0;
    this.m = 0;
    this.s = 0;
    this.d = 0;
    this.M = 0;
    this.y = 0;
    this.init = function() {
        if (now >= this.st) {
            this.interCount();
        } else {
            this.interCount();
        }
    };
    this.interCount = function() {
        var _this = this;
        var bTime = _this.bTime();
        if (bTime > 0) {
            _this.interSwitch = setInterval(function() {
                bTime--;
                if (bTime < 0) {
                    clearInterval(_this.interSwitch);
                } else {
                    _this.renderTime(bTime);
                }
            }, 1000);
        } else {

        }
    };
    this.bTime = function() { //距离的时间(单位s)
        return Math.round(this.opt.et / 1000 - now / 1000);
    };
    this.renderTime = function(t) {
        this.s = t % 60;
        this.m = Math.floor(t / 60) % 60;
        this.h = (Math.floor(t / 3600) % 60) % 24;
        this.d = Math.floor(t / 86400) % 30;
        this.M = Math.floor(t / 2592000) % 12;
        this.y = Math.floor(t / 31104000);
        this.opt.ydom.innerHTML = this.y < 10 ? "0" + this.y : this.y;
        this.opt.Mdom.innerHTML = this.M < 10 ? "0" + this.M : this.M;
        this.opt.ddom.innerHTML = this.d < 10 ? "0" + this.d : this.d;
        this.opt.hdom.innerHTML = this.h < 10 ? "0" + this.h : this.h;
        this.opt.mdom.innerHTML = this.m < 10 ? "0" + this.m : this.m;
        this.opt.sdom.innerHTML = this.s < 10 ? "0" + this.s : this.s;

    }

};
var two = new countTime({
    et: new Date('2015-4-7').getTime(),
    ydom: document.getElementById('y'),
    Mdom: document.getElementById('M'),
    ddom: document.getElementById('d'),
    hdom: document.getElementById('h')/* ,
    mdom: document.getElementById('m'),
    sdom: document.getElementById('s') */
});
two.init();
