// config
var app =  angular.module('app') .config(
    [        '$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
    function ($controllerProvider,   $compileProvider,   $filterProvider,   $provide) {
        
        // lazy controller, directive and service
        app.controller = $controllerProvider.register;
        app.directive  = $compileProvider.directive;
        app.filter     = $filterProvider.register;
        app.factory    = $provide.factory;
        app.service    = $provide.service;
        app.constant   = $provide.constant;
        app.value      = $provide.value;
    }
  ]);
app.factory('timestampMarker', [function() {
    var timestampMarker = {
        request: function(config) {
        	//console.log(config)
        	if(isLocalFlag){
        		if(config.url.indexOf(ctx) <= -1 && config.url.indexOf("http://") >= 0){
        			var bin = config.url.indexOf("/", 7);
        			var confurl = config.url.substring(0,bin);
        			config.url = config.url.replace(confurl,"http://127.0.0.1:8080/solway_szyj/");
    				if(!config.params){
    					config.params = {};
    				}
					config.params["urlChange"] = confurl;
        			
        		}
        		
        	}
        	if(config.url.indexOf("solway/getUserInfoForSolway") < 0 && config.url.indexOf("api/v1/user/login") < 0){
        		if (storage["userName"] == ""|| typeof (storage["userName"]) == "undefined"||storage["password"]==""||typeof (storage["password"]) == "undefined") {
            		//autoLogin('./index.html')
            		window.location.href = "./index.html#/login";
    				}
        	}
        	
            return config;
        },
        requestError: function(rejection) {
        	//console.log("开始请"+rejection.status)
        	console.log("开始请"+JSON.stringify(rejection))
        	/*if (storage["email"] == ""|| typeof (storage["email"]) == "undefined"||storage["password"]==""||typeof (storage["password"]) == "undefined") {
        		autoLogin('./index.html')
        	}*/
        	return config;
        },
        response: function(response) {
        	if (storage["userName"] == ""|| typeof (storage["userName"]) == "undefined"||storage["password"]==""||typeof (storage["password"]) == "undefined") {
				
			}else{
				if(JSON.stringify(response.status)=="405"){
	        		 $('#sessionModal').modal({backdrop: 'static', keyboard: false});
	        	}
			}
            return response;
        },
        responseError:function(response) {
        	
        	if (storage["userName"] == ""|| typeof (storage["userName"]) == "undefined"||storage["password"]==""||typeof (storage["password"]) == "undefined") {
				
			}else{
				if(JSON.stringify(response.status)=="405"){
	        		 $('#sessionModal').modal({backdrop: 'static', keyboard: false});
	        	}
			}
            return response;
        }
       };
    return timestampMarker;
}]);
app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('timestampMarker'); 
}]);
angular.module('app')
    /**
   * jQuery plugin config use ui-jq directive , config the js and css files that required
   * key: function name of the jQuery plugin
   * value: array of the css js file located
   */
  .constant('JQ_CONFIG', {
      slimScroll:     ['vendor/jquery/slimscroll/jquery.slimscroll.min.js'],
      sortable:       ['vendor/jquery/sortable/jquery.sortable.js'],
      nestable:       ['vendor/jquery/nestable/jquery.nestable.js',
                          'vendor/jquery/nestable/nestable.css'],
      filestyle:      ['vendor/jquery/file/bootstrap-filestyle.min.js'],
      slider:         ['vendor/jquery/slider/bootstrap-slider.js',
                          'vendor/jquery/slider/slider.css'],
      chosen:         ['vendor/jquery/chosen/chosen.jquery.min.js',
                          'vendor/jquery/chosen/chosen.css'],
      TouchSpin:      ['vendor/jquery/spinner/jquery.bootstrap-touchspin.min.js',
                          'vendor/jquery/spinner/jquery.bootstrap-touchspin.css'],
    footable:       ['vendor/jquery/footable/footable.all.min.js',
                          'vendor/jquery/footable/footable.core.css']
      }
  )
/*  .config(['$httpProvider', function($httpProvider) {
	  $httpProvider.interceptors.push('requestRejector');
	  // Removing 'requestRecoverer' will result to failed requesr 
	  $httpProvider.interceptors.push('requestRecoverer'); 
	}])*/
	
  .config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
      // We configure ocLazyLoad to use the lib script.js as the async loader
      $ocLazyLoadProvider.config({
          debug:  false,
          events: true,
          modules: [
              {
                  name: 'ngGrid',
                  files: [
                      'vendor/modules/ng-grid/ng-grid.min.js',
                      'vendor/modules/ng-grid/ng-grid.min.css',
                      'vendor/modules/ng-grid/theme.css'
                  ]
              },
              {
                  name: 'ui.select',
                  files: [
                      'vendor/modules/angular-ui-select/select.min.js',
                      'vendor/modules/angular-ui-select/select.min.css'
                  ]
              },
              {
                  name:'angularFileUpload',
                  files: [
                    'vendor/modules/angular-file-upload/angular-file-upload.min.js'
                  ]
              },
              {
                  name:'ui.calendar',
                  files: ['vendor/modules/angular-ui-calendar/calendar.js']
              },
              {
                  name: 'ngImgCrop',
                  files: [
                      'vendor/modules/ngImgCrop/ng-img-crop.js',
                      'vendor/modules/ngImgCrop/ng-img-crop.css'
                  ]
              },
              {
                  name: 'angularBootstrapNavTree',
                  files: [
                      'vendor/modules/angular-bootstrap-nav-tree/abn_tree_directive.js',
                      'vendor/modules/angular-bootstrap-nav-tree/abn_tree.css'
                  ]
              },
              {
                  name: 'toaster',
                  files: [
                      'vendor/modules/angularjs-toaster/toaster.js',
                      'vendor/modules/angularjs-toaster/toaster.css'
                  ]
              },
              {
                  name: 'textAngular',
                  files: [
                      'vendor/modules/textAngular/textAngular-sanitize.min.js',
                      'vendor/modules/textAngular/textAngular.min.js'
                  ]
              },
              {
                  name: 'vr.directives.slider',
                  files: [
                      'vendor/modules/angular-slider/angular-slider.min.js',
                      'vendor/modules/angular-slider/angular-slider.css'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular',
                  files: [
                      'vendor/modules/videogular/videogular.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.controls',
                  files: [
                      'vendor/modules/videogular/plugins/controls.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.buffering',
                  files: [
                      'vendor/modules/videogular/plugins/buffering.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.overlayplay',
                  files: [
                      'vendor/modules/videogular/plugins/overlay-play.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.poster',
                  files: [
                      'vendor/modules/videogular/plugins/poster.min.js'
                  ]
              },
              {
                  name: 'com.2fdevs.videogular.plugins.imaads',
                  files: [
                      'vendor/modules/videogular/plugins/ima-ads.min.js'
                  ]
              }
          ]
      });
  }])
;