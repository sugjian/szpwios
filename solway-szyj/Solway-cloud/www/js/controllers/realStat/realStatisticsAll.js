if (isAndroid) { //判断安卓，修改顶部样式
	$("#distUserNav").addClass("m-t-none");
}

function addAnimete(){
	$("#statcontent").removeClass("animated bounceInLeft bounceInRight")
}
//定义加载样式
var loadDiv = "<div class='loader'>" +
	"<div class='loader-inner ball-beat'>" +
	"<div></div><div></div> <div></div>" +
	"</div>" +
	"</div>"
$.showLoading = function(obj) {
	$(obj).html(loadDiv)
}

$.hideLoading = function(obj) {
	$(obj).html("")
}

app.controller('realStaAllCtrl', function($scope, $http, $state, $rootScope, toaster) {

	if(!storage["stationName"]){
			storage["stationName"]="全部";
			$("#stataTitle").text(storage["stationName"])
		}
	$("#stataTitle").text(storage["stationName"])
	
	//初始化
	//$scope.isActive = 'overview';//默认
	$scope.isActive = 'overview';
	showPage();
	
	$scope.changeTab = function(tab){
		if(Object.keys(overViewData).length == 0) return;
		$scope.isActive = tab;
		showPage();
	}
	//显示总览还是导航
	function showPage(){
		if($scope.isActive == "overview"){
			$scope.realView = 'tpl/realStatistics/model/overviewModel.html';
		}else if($scope.isActive == "navi"){
			$scope.realView = 'tpl/realStatistics/model/naviModel.html'
		}
	}
});
