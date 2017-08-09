'use strict';

/* Controllers */

angular.module('app')
  .controller('AppCtrl', ['$scope', '$translate', '$localStorage', '$window','$state','$timeout',
    function(              $scope,   $translate,   $localStorage,   $window,$state,$timeout ) {
      // add 'ie' classes to html
      var isIE = !!navigator.userAgent.match(/MSIE/i);
      isIE && angular.element($window.document.body).addClass('ie');
      isSmartDevice( $window ) && angular.element($window.document.body).addClass('smart');

      // config
      $scope.app = {
        name: 'Angulr',
        version: '1.3.3',
        // for chart colors
        color: {
          primary: '#7266ba',
          info:    '#23b7e5',
          success: '#27c24c',
          warning: '#fad733',
          danger:  '#f05050',
          light:   '#e8eff0',
          dark:    '#3a3f51',
          black:   '#1c2b36'
        },
        settings: {
          themeID: 1,
          navbarHeaderColor: 'bg-black',
          navbarCollapseColor: 'bg-white-only',
          asideColor: 'bg-black',
          headerFixed: true,
          asideFixed: false,
          asideFolded: false,
          asideDock: false,
          container: false
        }
      }

      // save settings to local storage
      if ( angular.isDefined($localStorage.settings) ) {
        $scope.app.settings = $localStorage.settings;
      } else {
        $localStorage.settings = $scope.app.settings;
      }
      $scope.$watch('app.settings', function(){
        if( $scope.app.settings.asideDock  &&  $scope.app.settings.asideFixed ){
          // aside dock and fixed must set the header fixed.
          $scope.app.settings.headerFixed = true;
        }
        // save to local storage
        $localStorage.settings = $scope.app.settings;
      }, true);

      // angular translate
      $scope.lang = { isopen: false };
      $scope.langs = {en:'English', de_DE:'German', it_IT:'Italian'};
      $scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "English";
      $scope.setLang = function(langKey, $event) {
        // set the current lang
        $scope.selectLang = $scope.langs[langKey];
        // You can change the language during runtime
        $translate.use(langKey);
        $scope.lang.isopen = !$scope.lang.isopen;
      };

      $scope.showNoteByConfirm_index = function(){//弹出层点击确定执行的方法
			//noteid = '856269' +"-" + 'http://58.240.214.122:49929/';
			if(noteid){
				var fi = noteid.indexOf("-");
				if(fi == -1) {
					$("#confimModal").modal("hide");
					return;
				}
				var ids = [noteid.substring(0,fi),noteid.substring(fi+1)];
				if(ids && ids.length > 1){
					var powerSupplys = JSON.parse(storage["powerSupplys"]);
					console.log(powerSupplys);
					var sysId;
					for(var i=0;i<powerSupplys.length;i++){
						if(powerSupplys[i].address == ids[1]){
							sysId = powerSupplys[i].systemId;
						}
					}
					if(sysId){
						storage["active"] = "alarm";
						//window.location.href = "./index.html#/noteList/"+sysId +"/" + ids[0];
						//autoLogin("./index.html#/noteDetail/"+ids[0] +"/" + sysId);
						$state.go("noteList",{sysId:sysId,alarmId:ids[0]});
						$("#confimModal").modal("hide");
					}else{
						$("#confimModal").modal("hide");
					}
					
				}
			}
			
		}
      
      function isSmartDevice( $window )
      {
          // Adapted from http://www.detectmobilebrowsers.com
          var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
          // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
          return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
      }

  }]);