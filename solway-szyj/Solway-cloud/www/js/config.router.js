
/**
 * Config for the router
 */

var welComeUrl = "/login?deviceToken=" + deviceToken;;
angular.module('app')
  .run(['$rootScope', '$state', '$stateParams',
      function ($rootScope,   $state,   $stateParams) {
          $rootScope.$state = $state;
          $rootScope.$stateParams = $stateParams;        
      }
    ]
  )
  .config([ '$stateProvider', '$urlRouterProvider',
      function ($stateProvider,   $urlRouterProvider) {
          $urlRouterProvider .otherwise(welComeUrl);
          $stateProvider
              .state('app', {
                  abstract: true,
                  url: '/app',
                  templateUrl: 'tpl/app.html',
						resolve : {
							deps : ['$ocLazyLoad',
								function(
										$ocLazyLoad) {
									return $ocLazyLoad
											.load('toaster')
								}]
						}
              })
              //登录
               .state('login', {
            	  url: '/login',
            	  templateUrl: 'tpl/login.html',
            	  resolve: {
                      deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                          return $ocLazyLoad.load
                          (['js/controllers/toaster.js']);
                      }]
                    }
              })
              //实时数据
              .state('app.realStatistics', {
                  url: '/realStatistics',
                  templateUrl: "tpl/realStatistics/realStatisticsAll.html"
                })
                //变电站监控详情页
                .state('app.monitorSubstation', {
                  url: '/monitorSubstation/:sysId/:bdzId',
                  templateUrl: "tpl/realStatistics/monitorSubstation.html"
                })
                //线路详情曲线
                .state('app.circuit', {
                  url: '/circuit:sysId/:bdzId/:parentId/:lineId/:nodeId/:stype/:stime',
                  templateUrl: "tpl/realStatistics/circuit.html"
                })
                //历史开始
                .state('app.historySta', {
                  url: '/historySta:sysId/:bdzId/:lineId/:nodeId/:stype/:stime',
                  templateUrl: "tpl/statistics/statisticsAll.html"
                })
                
             
              .state('faultList', {
            	  url: '/faultList?comId&stationId',
            	  templateUrl: 'tpl/faultList.html',
            	  resolve: {
                      deps: ['$ocLazyLoad',
                             function( $ocLazyLoad){
                               return $ocLazyLoad.load('toaster').then(
                                   function(){
                                      return $ocLazyLoad.load('ui.select','js/controllers/toaster.js');
                                   }
                               );
                           }]
                  }
              })
              //个人中心
              .state('userList', {
            	  url: '/userList?message&status',
            	  templateUrl: 'tpl/userInfo/userList.html',
            	  resolve: {
                      deps: ['$ocLazyLoad',
                             function( $ocLazyLoad){
                               return $ocLazyLoad.load('toaster').then(
                                   function(){
                                      return $ocLazyLoad.load('js/controllers/toaster.js');
                                   }
                               );
                           }]
                  }
              })
              .state('stationConf', {
            	  url: '/stationConf',
            	  templateUrl: 'tpl/userInfo/stationConf.html'
              })
               .state('stationGroup', {
            	  url: '/stationGroup',
            	  templateUrl: 'tpl/userInfo/stationGroup.html',
            	  resolve: {
                      deps: ['$ocLazyLoad',
                             function( $ocLazyLoad){
                               return $ocLazyLoad.load('toaster').then(
                                   function(){
                                      return $ocLazyLoad.load('js/controllers/toaster.js');
                                   }
                               );
                           }]
                  }
              })
               .state('stationGroupDetail', {
            	  url: '/stationGroupDetail?staId&stateName',
            	  templateUrl: 'tpl/userInfo/stationGroupDetail.html'
              })
               .state('addstationDetail', {
            	  url: '/addstationDetail?staId&stateName',
            	  templateUrl: 'tpl/userInfo/addstationDetail.html',
            	  resolve: {
                      deps: ['$ocLazyLoad',
                             function( $ocLazyLoad){
                               return $ocLazyLoad.load('toaster').then(
                                   function(){
                                      return $ocLazyLoad.load('js/controllers/toaster.js');
                                   }
                               );
                           }]
                  }
              })
               .state('removeStation', {
            	  url: '/removeStation?staId&stateName',
            	  templateUrl: 'tpl/userInfo/removeStation.html',
            	  resolve: {
                      deps: ['$ocLazyLoad',
                             function( $ocLazyLoad){
                               return $ocLazyLoad.load('toaster').then(
                                   function(){
                                      return $ocLazyLoad.load('js/controllers/toaster.js');
                                   }
                               );
                           }]
                  }
              })
              .state('removeStationGroup', {
            	  url: '/removeStationGroup?staId&stateName',
            	  templateUrl: 'tpl/userInfo/removeStationGroup.html',
            	  resolve: {
            		  deps: ['$ocLazyLoad',
            		         function( $ocLazyLoad){
            			  return $ocLazyLoad.load('toaster').then(
            					  function(){
            						  return $ocLazyLoad.load('js/controllers/toaster.js');
            					  }
            			  );
            		  }]
            	  }
              })
              .state('resNoteSet', {
            	  url: '/resNoteSet',
            	  templateUrl: 'tpl/userInfo/resNoteSet.html',
            	  resolve: {
                      deps: ['$ocLazyLoad',
                             function( $ocLazyLoad){
                               return $ocLazyLoad.load('toaster').then(
                                   function(){
                                      return $ocLazyLoad.load('js/controllers/toaster.js');
                                   }
                               );
                           }]
                       }
              })
              .state('upPpassword', {
            	  url: '/upPpassword',
            	  templateUrl: 'tpl/userInfo/upPpassword.html',
            	  resolve: {
                      deps: ['$ocLazyLoad',
                             function( $ocLazyLoad){
                               return $ocLazyLoad.load('toaster').then(
                                   function(){
                                      return $ocLazyLoad.load('js/controllers/toaster.js');
                                   }
                               );
                           }]
                       }
              })
              .state('aboutNecloud', {
            	  url: '/aboutNecloud',
            	  templateUrl: 'tpl/userInfo/aboutNecloud.html'
              })
              .state('stationDetail', {
            	  url: '/stationDetail',
            	  templateUrl: 'tpl/userInfo/stationDetail.html'
              })
              .state('userInfo', {
            	  url: '/userInfo',
            	  templateUrl: 'tpl/userInfo/userInfo.html',
            	  resolve: {
                      deps: ['$ocLazyLoad',
                             function( $ocLazyLoad){
                               return $ocLazyLoad.load('toaster').then(
                                   function(){
                                      return $ocLazyLoad.load('js/controllers/toaster.js');
                                   }
                               );
                           }]
                       }
                   })
              //报警列表
               .state('noteList', {
            	  url: '/noteList/:sysId/:alarmId',
            	  templateUrl: 'tpl/message/noteList.html',
            	  resolve: {
                      deps: ['$ocLazyLoad',
                             function( $ocLazyLoad){
                               return $ocLazyLoad.load('toaster').then(
                                   function(){
                                      return $ocLazyLoad.load('js/controllers/toaster.js');
                                   }
                               );
                           }]
                  }
              })
                //报警查询
               /*.state('noteSearch', {
            	  url: '/noteSearch/:sysId',
            	  templateUrl: 'tpl/message/noteSearch.html'
              })*/
             
      }
    ]
  );
var deviceToken = getParameter("deviceToken");//定义一个token