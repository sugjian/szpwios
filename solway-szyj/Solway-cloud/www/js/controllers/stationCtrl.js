/**
 * Created by pansongsong02 on 2016/6/23.
 */
angular.module('iotApp')
    .controller('overview.briefCtrl', ['$scope', '$stateParams', '$document','$state', 'overviewService', '$filter',
        function ($scope, $stateParams, $document, $state, overviewService, $filter) {

        }])
    .controller('overview.stationCtrl', ['$scope', '$interval', '$document', '$stateParams', '$state','apiService','$q', 'overviewService', '$filter', '$log',
        function ($scope, $interval, $document, $stateParams, $state, apiService, $q, overviewService, $filter, $log) {
            $document.find('.power-body-content-right').scrollTop(0);
            var stationId = parseInt($stateParams.stationId);
            var parentId = $scope.parentId = parseInt($stateParams.parentId);
            var lineId = null;
            var initMark = true;
            $scope.$on('highLine', function(event, data) {
                if(_.isNumber(data.lineId)){
                    lineId = data.lineId;
                }
            });
            
            var svgInit = function (substation, alarms, stationId, noType) {
                var powerLineAlarms = alarms.powerLineAlarms;
                var parentPowerLines = substation.parentPowerLines;
                console.log(parentPowerLines)
                for(var i=0; i<parentPowerLines.length; i++){
                    var t = parentPowerLines[i];
                    var tv = t.powerLines;
                    for(var j=0; j<tv.length; j++){
                        if(powerLineAlarms[tv[j].id]){
                            tv[j].n_status = powerLineAlarms[tv[j].id].alarmAmount;
                        }else{
                            tv[j].n_status = 0;
                        }
                    }
                }
                $scope.json2 = parentPowerLines;
                var timer;
                var firstData = [];
                apiService.getSubstationFirstData(stationId).success(function (res) {
                    $log.log('station first data', res.data)
                    firstData = res.data;
                    for(var i=0; i<parentPowerLines.length; i++){
                        var t = parentPowerLines[i];
                        var tv = t.powerLines;
                        if(firstData[t.id] && firstData[t.id].voltage !=undefined && firstData[t.id].voltage>=0){
                            t.n_zero = firstData[t.id].voltage;
                        }
                        for(var j=0; j<tv.length; j++){
                            var dataItem = firstData[t.id][tv[j].id];
                            if(dataItem != undefined){
                                tv[j].n_voltage = [];
                                _.forEach(dataItem, function(value, key) {
                                    tv[j].n_voltage.push({
                                        current: value[0],
                                        temperature: noType !== 2 ? value[1] : null,
                                        percent: value[2]
                                    })
                                });
                            }
                        }
                    }
                    if(lineId != null){
                        timer = $interval(function () {
                            $scope.$emit('highLine', {
                                parentId: parentId,
                                lineId: lineId,
                                type:3
                            });
                        }, 500);

                        $scope.$on('lineEnd', function(event, data) {
                            console.log('stop station timer')
                            lineId = null;
                            $interval.cancel(timer);
                        });
                    }

                }).error(function (err) {
                    $log.error('substation First Data', err);

                });
                console.log('new parentPowerLines',parentPowerLines);
            }
            
            var init = function (powerAuthorityId) {
                $q.all([apiService.getAreaAllFormated(powerAuthorityId),
                    apiService.getAlarmTodayFormated(powerAuthorityId)
                ]).then(function (results) {
                    console.log(results)
                    var all = results[0];
                    var alarms = results[1];
                    //var firstData = results[2];
                    //var firstData = [];
                    //$log.log("ALL stationCtrl", all);
                    //$log.log("ALARMS stationCtrl", alarms);
                    //$log.log("data", firstData);

                    var substation = all.substationIndex[stationId];
                    var no_type = parseInt(substation.no) || 1;
                    if(initMark){
                        var _link = $scope._link;
                        _link[0] = {
                            name: all.data.powerAuthority.name,
                            href: '#/overview/map'
                        };

                        _link[1] = {
                            name: all.substationIndex[stationId].name,
                            href: '#/overview/'+ stationId +'/station/' + all.substationIndex[stationId].parentPowerLines[0].id +
                            '/' +all.substationIndex[stationId].parentPowerLines[0].powerLines[0].id
                        };
                        if(_link.length == 3){
                            _link.pop();
                        }

                        $document.find('head title').text(substation.name+'总览-银蕨配网监测系统');
                        initMark = false;
                    }

                    svgInit(substation, alarms, stationId, no_type);
                });
            }

            $scope.$watch(apiService.getUpdateTime, function () {
                console.log('station getUpdateTime', apiService.getUpdateTime());
                init(userinfos.powerAuthorityId);
            })
                


        }])
    .controller('overview.station.parentCtrl', ['$scope','$state', '$stateParams', 'apiService','$q', 'overviewService', '$filter', '$log',
        function ($scope, $state, $stateParams, apiService, $q, overviewService, $filter, $log) {
            var stationId = parseInt($stateParams.stationId);
            var parentId = parseInt($stateParams.parentId);

            $scope.configParent = {
                title: '零序电压有效值',
                yTitle: '电压(V)',
                yUnit: '',
                xType: 'datetime',
                xUnit: '',
                marker: false,
                historyButton: false,
                legend: [{
                    name: '零序电压',
                    color: 'color: #FFBB1D',
                    enabled: true
                }]
            }

            var chart = $scope.chartDataParent = {
                zoom: {
                    min: null,
                        max: null
                },
                loading: true,
                    //hasData: false,
                    //error: 0,
                series: [{
                    name: '零序电压',
                    color: '#FFBB1D',
                    data: []
                }]
            }

            $q.all([apiService.getAreaAllFormated(userinfos.powerAuthorityId)]).then(function (results) {

                var all = results[0];
                var _parent = $scope._parent = all.parentPowerLineIndex[parentId];


                var time = {
                    startTime: moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
                    endTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                    type: 'current'
                }

                var powerLines = all.parentPowerLineIndex[parentId].powerLines;
                $scope.goToMonitor = function (url) {
                    var ids = [];
                    for(var i=0; i<powerLines.length; i++){
                        ids.push(overviewService.getFirstNode(all, powerLines[i].id, 3));
                    }

                    var goUrl = url + ids.join(',');
                    console.log('goUrl',goUrl);
                    window.open(goUrl);

                }

                var deviceId = $scope.nodeId = overviewService.getFirstNode(all, _parent.powerLines[0].id, 2);
                if(deviceId != -1){
                    apiService.getDcuCurrent(deviceId, time).success(function (res) {
                        var unbalance = [];
                        var t;
                        var d;
                        for(var i=0; i<res.data.length; i++){
                            d = res.data[i];
                            t = +moment.utc(d.time);
                            unbalance.push([t, d.current[1]]);
                        }

                        chart.error = 0;
                        if(unbalance.length > 0){
                            chart.series[0].data = unbalance;
                            var length = chart.series[0].data.length;
                            chart.zoom = {
                                min: chart.series[0].data[0][0],
                                max: chart.series[0].data[length-1][0]
                            };
                            chart.hasData = true;
                        }else{
                            chart.hasData = false;
                        }
                        chart.loading = false;
                        console.log('$scope.chartDataParent',chart)
                    }).error(function (error) {
                        $log.log(error);
                        chart.error = 2;
                        chart.hasData = false;
                        chart.loading = false;
                    })
                }

            });

        }])
    .controller('overview.station.childCtrl', ['$scope','$state', '$interval', '$stateParams', 'apiService','$q', 'overviewService', '$filter', '$log',
        function ($scope, $state, $interval, $stateParams, apiService, $q, overviewService, $filter, $log) {
            var stationId = $scope.substationId =  parseInt($stateParams.stationId);
            var parentId = parseInt($stateParams.parentId);
            var lineId = $scope.lineId = parseInt($stateParams.lineId);
            $scope.OConfig = overviewService.getOConfig();

            console.time('scope.$watch')

            //$scope.config = overviewService.getSConfig();
            //$scope.chartData = overviewService.getSChartData();

            var timer;
            $q.all([apiService.getAreaAllFormated(userinfos.powerAuthorityId)]).then(function (results) {
                var all = results[0];
                var _line = $scope._line = all.powerLineIndex[lineId];
                var no_type = $scope.noType = parseInt(all.substationIndex[stationId].no) || null;

                var deviceId = $scope.deviceId = overviewService.getFirstNode(all, lineId, 3);
                timer = $interval(function () {
                    $scope.$emit('highLine', {
                        parentId: parentId,
                        lineId: lineId,
                        type:3
                    });
                }, 500);

                $scope.$on('lineEnd', function(event, data) {
                    console.log('stop timer')
                    $interval.cancel(timer);
                });

                var chartParam = overviewService.getOChartList(no_type);

                $scope.OChartList = chartParam[0];
                $scope.watchList = chartParam[1];

                overviewService.getLineChartNew(deviceId, $scope.OChartList, $scope.watchList, no_type);
                $scope.goToNode = function (id) {
                    var deviceId = overviewService.getFirstNode(all, lineId, 3);
                    $state.go('overview.line.node', {
                        stationId:stationId,
                        parentId: parentId,
                        lineId: lineId,
                        deviceId: deviceId
                    })
                }
            });

        }]);