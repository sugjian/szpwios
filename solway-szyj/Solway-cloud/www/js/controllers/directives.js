/**
 * Created by pansongsong02 on 2016/6/23.
 */
angular.module('iotApp')
    .directive('powerCircle', ['$document', function ($document) {
        return {
            restrict: 'AE',
            require: '?ngModel',
            link: function (scope, element, attr, model) {
                scope.$watch(function () {
                    return model.$viewValue;
                }, function (data) {
                    if(data){
                        var outerRadius = attr.powerOuterRadius || 80,
                            innerRadius = attr.powerInnerRadius || 0,
                            id = attr.id;
                        //console.log(data);
                        if(data.length == 2){
                            var svg = d3.select("#"+id)
                                .append("svg")
                                .attr("width", outerRadius*2)
                                .attr("height", outerRadius*2);
                            var pie = d3.layout.pie();
                            var pieData = pie(data[0]);
                            var arc = d3.svg.arc()	//弧生成器
                                .innerRadius(innerRadius)	//设置内半径
                                .outerRadius(outerRadius);	//设置外半径

                            var arcs = svg.selectAll("g")
                                .data(pieData)
                                .enter()
                                .append("g");
                            if(data[0][0]>data[0][1]){
                                arcs.attr("transform","translate("+ outerRadius +","+ outerRadius +") rotate("+ 360*(data[0][1]/(data[0][0]+data[0][1])) +")");
                            }else{
                                arcs.attr("transform","translate("+ outerRadius +","+ outerRadius +")");

                            }

                            arcs.append("path")
                                .attr("fill",function(d,i){
                                    return data[1][i];
                                })
                                .attr("d",function(d){
                                    return arc(d);
                                });

                            //arcs.append("text")
                            //    .attr("transform",function(d){
                            //        return "translate(" + arc.centroid(d) + ")";
                            //    })
                            //    .attr("text-anchor","middle")
                            //    .text(function(d){
                            //        return d.data;
                            //    });
                        }
                    }

                })
            }
        }
    }])
    .directive('powerWrapper', ['$document', '$sce', function ($document, $sce) {
        return {
            restrict: 'AE',
            require: '?ngModel',
            //transclude: true,
            //scope: {
            //    powerData: '=',
            //    powerTitle: '@'
            //    //,
            //    //powerUrl: '@'
            //},
            templateUrl: 'app/common/directives/view/powerWrapper.html',
            link: function (scope, element, attr, model) {
                //console.log(element);
                //scope.menuTooltip = $sce.trustAsHtml('<span>基本信息</span>');//uib-tooltip-html="menuTooltip"
                scope.show = true;
                scope.resizeWidth = 1;
                scope.changeBrief = function () {
                    scope.show = !scope.show;
                    var left =  $document.find('.power-body-content-left');
                    var right =  $document.find('.power-body-content-right');
                    var time = 200;
                    if(scope.show){
                        left.animate({
                            left: 0
                        }, time);

                        right.animate({
                            left: 300
                        }, time, function () {
                            scope.resizeWidth = 1;
                            scope.$apply();
                        })

                    }else{
                        left.animate({
                            left: -300
                        }, time);

                        right.animate({
                            left: 0
                        }, time, function () {
                            scope.resizeWidth = 2;
                            scope.$apply();
                        })

                    }
                }
                scope.$watch(function(){
                    return model.$modelValue;
                }, function (modelValue) {
                    scope.powerData = modelValue;
                })

            }
        }
    }])
    .directive('muSvg', ['$document', '$compile', '$timeout', '$state', 'overviewService', function ($document, $compile, $timeout, $state, overviewService) {
        return {
            restrict: 'AE',
            //scope: true,
            require: '?ngModel',
            templateUrl: 'app/common/directives/view/svgWrapper.html',
            link: function (scope, element, attr, model) {
                //console.log(model)
                scope.$watch(function(){
                    return model.$modelValue;
                }, function (modelValue) {
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


                        eLength[0] = json2.length;
                        for(var i=0; i<eLength[0];i++){
                            eLength[1] += json2[i].powerLines.length;
                        }
                        var x = (eLength[1] - eLength[0])*value + eLength[0]*2*(eLine-30) + (eLength[0]-1)*dLine;
                        var id = attr.id;
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

                        var g = svg.append('g');
                        //.attr({
                        //    id: 'test'
                        //})
                        //.call(zoom);

                        var lx = 40;
                        for(var i=0; i<eLength[0];i++){
                            var temp = eLine+ 23 + (json2[i].powerLines.length-1)*value + lx -30;

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
                                    for(var j=0;j<electric.length;j++){
                                        //console.log(j,electric[j],electric[j].current)
                                        g1.append('text')
                                            .attr({
                                                'class': electricType[j],
                                                "x": kx - 48,
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
                                    "x": lx+td,
                                    "y": yi-td,
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
                                    .text('零序电压：'+json2[i].n_zero + 'V');
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
                            scope.lineDate = json2[index1].powerLines[index2];
                            scope.$apply();
                            //console.log(scope.lineDate);
                            var n_h = h;
                            if(scope.lineDate.n_status == 0){
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
                                $compile($document.find('#popup').contents())(scope);
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
                                lineMouseenter(e);
                            });

                            element.on('mouseleave', '.ghover', function (e) {
                                lineMouseleave(e);
                            });
                        }

                        mouseAction();
                        var e1 = null;
                        var e3 = element.find('.mu-line-hover[parentId='+ scope[attr.muSvg] +']').children();
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

                        scope.$on('highLine', function(event, data) {

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
                            scope.$broadcast('lineEnd', null);
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
                                var index = index = _.findIndex(json2, {id: parentId});
                                $state.go('overview.station.child', {
                                    stationId: json2[index].parentId,
                                    parentId: parentId,
                                    lineId: lindId
                                });
                                moveToChart();

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
                            $state.go('overview.station.parent', {
                                stationId: json2[index].parentId,
                                parentId: parentId
                            });
                            moveToChart();
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

                }, true)


            }
        }
    }])
    .directive('lineSvgOrigin', ['$document', '$compile', '$timeout', '$state', 'overviewService', '$parse', function ($document, $compile, $timeout, $state, overviewService, $parse) {
        return {
            restrict: 'AE',
            require: '?ngModel',
            templateUrl: 'app/common/directives/view/lineSvgWrapper.html',
            link: function (scope, element, attr, model) {
                var type = {
                    '0': 'node-red',
                    '3': 'node-green',
                    '1': 'node-blue',
                    '4': 'node-xuni'

                };
                scope.$watch(function(){
                    return model.$modelValue;
                }, function (modelValue) {
                    if(modelValue && modelValue.length>0){
                        var json = modelValue;
                        var svgNode = null;
                        if(angular.isDefined(attr.svgNode)){
                            svgNode = $parse(attr.svgNode)(scope);
                            //console.log('svgNode',svgNode)
                        }
                        var m_y = json[0].y;
                        var wrapper = 0.5;
                        for(var i=0; i<json.length; i++){
                            json[i].y -= m_y;
                            //json[i].y /= 2;
                            json[i].y = json[i].y * 11 / 19;
                            //json[i].voltage = [
                            //    {
                            //        current: 82.5,
                            //        temperature: 121,
                            //        percent: 28.9
                            //    },
                            //    {
                            //        current: 688.5,
                            //        temperature: 621,
                            //        percent: 68.9
                            //    },
                            //    {
                            //        current:488.5,
                            //        temperature: 21,
                            //        percent: 8.9
                            //    }
                            //];
                        }
                        var location = [];
                        location.push(_.minBy(json, 'x').x-wrapper);
                        location.push(_.minBy(json, 'y').y-0.3);
                        location.push(_.maxBy(json, 'x').x+wrapper);
                        location.push(_.maxBy(json, 'y').y+wrapper);
                        var view = [];
                        view.push(location[2]-location[0]);
                        view.push(location[3]-location[1]);

                        var miy = view[1];
                        var value = 76,
                            r = 7,
                            ym = location[1],
                            xlelf = location[0];
                        var muId = json[0].id;

                        var lineSvg = _.keyBy(json, 'id');
                        //console.log(lineSvg);

                        var view_h = 500;
                        var piancha = 210;
                        var juzhong =  (location[3]+location[1])*value;
                        if(view[1]*value>view_h){
                            view_h = view[1]*value;
                            piancha = 0
                            juzhong = 0;
                        }

                        for(var k in lineSvg){
                            lineSvg[k].x = (lineSvg[k].x - xlelf)*value;
                            lineSvg[k].y =  (miy -lineSvg[k].y + ym)*value + piancha - juzhong;
                        }
                        //console.log(lineSvg);

                        var id = attr.id;
                        element.css({
                            'width': view[0]*value,
                            'margin': '0 auto',
                            'position': 'relative'
                        });


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

                        //g.append('rect')
                        //    .attr({
                        //        "x": 0,
                        //        "y": 0,
                        //        "width": view[0]*value,
                        //        "height": view[1]*value
                        //
                        //    })
                        //    .style({
                        //        //rect边框颜色：red
                        //        //"stroke": "red",
                        //        //rect边框粗细：4
                        //        //"stroke-width": 4,
                        //        //rect虚线边框虚线宽10px，空白宽5px
                        //        //"stroke-dasharray": "10 5",
                        //        //rect填充：yellow
                        //        "fill": "#fff"
                        //    });

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
                                }else{
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
                            //var lineClass = 'circle-wrapper-line';
                            //if(lineSvg[k].type !=1 && lineSvg[k].type !=4 && (!svgNode || (svgNode.length >0 && svgNode.indexOf(lineSvg[k].deviceId) != -1))){
                            //    lineClass += ' node-circle-click ';
                            //}
                            //g.append('line')
                            //    .attr({
                            //        "x1": lineSvg[k].x,
                            //        "y1": lineSvg[k].y-16,
                            //        "x2": lineSvg[k].x,
                            //        "y2": lineSvg[k].y+16,
                            //        "class": lineClass
                            //    });

                            if(lineSvg[k].lineTo){
                                var line = lineSvg[k].lineTo;
                                var x1,x2,y1,y2;
                                for(var i = 0; i< line.length; i++){
                                    x1 = lineSvg[k].x;
                                    y1 = lineSvg[k].y;
                                    x2 = lineSvg[line[i]].x;
                                    y2 = lineSvg[line[i]].y;
                                    if(x1 == x2 && y1!=y2){
                                        if(y1>y2){
                                            y1 -= r;
                                            y2 += r;
                                        }else{
                                            y1 += r;
                                            y2 -= r;
                                        }
                                    }else if(y1 == y2 && x1!=x2){
                                        if(x1>x2){
                                            x1 -= r;
                                            x2 += r;
                                        }else{
                                            x1 += r;
                                            x2 -= r;
                                        }
                                    }
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

                            var zbx = 10;
                            var zby = 20;
                            var ry = 4;
                            if(k!=muId && lineSvg[k].type!=4){
                                var c = '';
                                if(lineSvg[k].type == 0 || (svgNode && svgNode.length>0)){
                                    c = 'node-ling-red';
                                }else if(lineSvg[k].type == 3){
                                    c = 'node-ling-green';
                                }
                                if(lineSvg[k].y == lineSvg[muId].y){
                                    g.append('text')
                                        .attr({
                                            "x": lineSvg[k].x,
                                            "y": lineSvg[k].y+zby,
                                            "class": "node-ling-text1"
                                        })
                                        .text(lineSvg[k].dxgNo+'#');
                                    g.append('text')
                                        .attr({
                                            "x": lineSvg[k].x,
                                            "y": lineSvg[k].y-zby +r,
                                            "class": "node-ling-text2 " +c
                                        })
                                        .text(lineSvg[k].name);
                                }else{
                                    g.append('text')
                                        .attr({
                                            "x": lineSvg[k].x+zbx,
                                            "y": lineSvg[k].y+ry,
                                            "class": "node-ling-text4"
                                        })
                                        .text(lineSvg[k].dxgNo+'#');
                                    g.append('text')
                                        .attr({
                                            "x": lineSvg[k].x-5*zbx,
                                            "y": lineSvg[k].y+ry,
                                            "class": "node-ling-text3 "+c
                                        })
                                        .text(lineSvg[k].name);

                                }
                            }

                            var lineClass = 'circle-wrapper-line';
                            if(lineSvg[k].type !=1 && lineSvg[k].type !=4 && (!svgNode || (svgNode.length >0 && svgNode.indexOf(lineSvg[k].deviceId) != -1))){
                                lineClass += ' node-circle-click ';
                            }
                            g.append('line')
                                .attr({
                                    "x1": lineSvg[k].x,
                                    "y1": lineSvg[k].y-16,
                                    "x2": lineSvg[k].x,
                                    "y2": lineSvg[k].y+16,
                                    "class": lineClass
                                });

                        }

                        var timer = null;
                        var getTextNode = function (e) {
                            var childList = e.parentElement.childNodes;
                            return childList[childList.length-2];
                        }
                        var circleMouseenter = function (e) {
                            var _e = $document.find(e);
                            _e.addClass('hover-node-tip');

                            getTextNode(e).className.baseVal += ' hover-node-tip';
                            //e.parentElement.lastChild.className.baseVal += ' hover-node-tip';

                            var offset = _e.offset();
                            var hide_top = $document.find('.power-scrollbar-hide').offset().top;
                            //var leftDis = $('svg').offset().left - $('.power-svg-container').offset().left;
                            var svgContainer = $document.find('.power-svg-container');
                            var
                                top = offset.top,
                                left = offset.left,
                                bW = document.body.clientWidth,
                                bH = document.body.clientHeight,
                                w = 190,
                                h = 122,
                                L = 0,
                                T = 0;
                            bH = bH < hide_top ? bH : hide_top;
                            var cx = parseInt(e.getAttribute('cx'));
                            var cy = parseInt(e.getAttribute('cy'));
                            //console.log('yuan:',top,left,cx,cy);
                            //console.log('offset',$document.find(e.currentTarget).offset());
                            //console.log('position',$document.find(e.currentTarget).position());
                            //if(left+w+50<bW){
                            //    //right
                            //    L = cx+50 +leftDis;
                            //}else{
                            //    L = cx - w-50 +leftDis;
                            //}
                            //var svgWidth = svgContainer.width() < view[0]*value ? svgContainer.width() : view[0]*value;
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

                            var index1 = _.findIndex(json, {id: parseInt(e.getAttribute('lineId'))});
                            scope.lineDate = json[index1];
                            scope.$apply();

                            var n_h = h;
                            if(scope.lineDate.type == 3){
                                n_h = 100;
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
                                    '<span ng-bind="lineDate.voltage[0].temperature"></span>'+
                                    '<span>°C/</span>'+
                                    '<span ng-bind="lineDate.voltage[0].percent"></span>'+
                                    '<span>%</span>'+
                                    '</div>'+
                                    '<div class="popup-text-xiang">'+
                                    '<span class="electric_B">B相：</span>'+
                                    '<span ng-bind="lineDate.voltage[1].current"></span>'+
                                    '<span>A/</span>'+
                                    '<span ng-bind="lineDate.voltage[1].temperature"></span>'+
                                    '<span>°C/</span>'+
                                    '<span ng-bind="lineDate.voltage[1].percent"></span>'+
                                    '<span>%</span>'+
                                    '</div>'+
                                    '<div class="popup-text-xiang">'+
                                    '<span class="electric_C">C相：</span>'+
                                    '<span ng-bind="lineDate.voltage[2].current"></span>'+
                                    '<span>A/</span>'+
                                    '<span ng-bind="lineDate.voltage[2].temperature"></span>'+
                                    '<span>°C/</span>'+
                                    '<span ng-bind="lineDate.voltage[2].percent"></span>'+
                                    '<span>%</span>'+
                                    '</div>'+
                                    '<div class="popup-warning" ng-if="lineDate.type==0">'+
                                    '<span>报警数量：</span>'+
                                    '<span ng-bind="lineDate.number" class="warning-one-color"></span>'+
                                    '</div>'+
                                    '</div>');
                                $compile($document.find('#popup').contents())(scope);
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
                            $(getTextNode(e)).removeClass('hover-node-tip');
                            //$(e.parentElement.lastChild).removeClass('hover-node-tip');
                            $timeout.cancel(timer);
                            timer = $timeout(function () {
                                var div = $document.find('#popup');
                                div.hide();

                            },500);
                        }

                        var mouseAction = function () {
                            element.on('mouseenter', '.node-circle-click', function (e) {
                                circleMouseenter(e.currentTarget.parentElement.childNodes[0]);
                            });

                            element.on('mouseleave', '.node-circle-click', function (e) {
                                circleMouseleave(e.currentTarget.parentElement.childNodes[0]);
                            });
                        }

                        mouseAction();

                        var ec = null;
                        var callBack = null;
                        if (angular.isDefined(attr.lineClick)) {
                            callBack = $parse(scope[attr.lineClick]);//scope.$eval(attr.lineClick);
                        }

                        var moveToChart = function () {
                            $('.power-body-content-right').animate({
                                scrollTop: 560 }, 500);
                        }

                        scope.$on('highCircle', function(event, data) {

                            if(_.isNumber(data.deviceId)){
                                ec = element.find('circle[deviceId='+ data.deviceId +']')[0];
                                var color = '#018952';
                                if(ec.className.baseVal == 'node-red'){
                                    color = '#BF1A2E';
                                }
                                ec.style.fill = color;
                                getTextNode(ec).style.fill = color;
                            }

                            scope.$broadcast('circleEnd', null);
                        });

                        var clickAction = function (callback) {
                            element.on('click', '.node-circle-click', function (e) {
                                if(ec){
                                    ec.style.fill = '';
                                    getTextNode(ec).style.fill = '';
                                }
                                ec = e.currentTarget.parentElement.childNodes[0];
                                var color = $(ec).css('fill');
                                ec.style.fill = color;
                                getTextNode(ec).style.fill = color;
                                moveToChart();
                                if(callback){
                                    callback(parseInt(ec.getAttribute('deviceId')));
                                }
                            });
                        }
                        if(!svgNode){
                            clickAction(callBack);
                        }
                    }
                });


            }
        }
    }])
    .directive('powerMap', ['$document', '$state', 'overviewService', function ($document, $state, overviewService) {
        return {
            restrict: 'AE',
            require: '?ngModel',
            link: function (scope, element, attr, model) {
                scope.$watch(function () {
                        return model.$viewValue;
                    }, function (data) {
                    if(data){
                        var dataList = data;
                        var map = new BMap.Map(attr.id);
                        var bottom_right_navigation = new BMap.NavigationControl({
                            anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
                            type: BMAP_NAVIGATION_CONTROL_ZOOM
                        });
                        var bottom_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_BOTTOM_LEFT});
                        map.addControl(bottom_right_navigation);
                        map.addControl(bottom_left_control);
                        map.enableScrollWheelZoom();
                        var points = [];
                        var cachePoints = {};
                        for(var i=0;i<dataList.length; i++){
                            var s = dataList[i];
                            var img = 'normal-circle-img';
                            var bk = 'normal-circle-b';
                            if(dataList[i].n_warn){
                                img = 'warn-circle-img';
                                bk = 'warn-circle-b';
                            }
                            var point = new BMap.Point(s.longitude, s.latitude);
                            //var marker = new BMap.Marker(point);
                            cachePoints[s.id] = point;
                            points.push(point);
                            var opts = {
                                position : point,    // 指定文本标注所在的地理位置
                                offset   : new BMap.Size(30, -30)    //设置文本偏移量
                            };
                            if (!s.parentPowerLines[0]) {
                                continue;
                            }
                            var label = new BMap.Label("<a class='label-map' href='#/overview/"+ s.id+"/station/"+
                                s.parentPowerLines[0].id +"/"+ s.parentPowerLines[0].powerLines[0].id +"'>" +
                                "<div class='label-text " + bk +
                                "'>" +
                                "<div class='label-circle " + img + "'></div>" +
                                "<div class='power-mark-map' stationId='"+ s.id +"'></div>" +
                                "<span class='laberl-name-1'>"+ s.name+"</span>" +
                                "<div class='label-breadcrumbs' ></div>" +
                                "</div></a>", opts);

                            var opt = {
                                //color : "red",
                                fontSize : "12px",
                                //height : "20px",
                                //lineHeight : "20px",
                                //fontFamily:"微软雅黑",
                                border: "none",
                                background: "none"
                            }

                            label.setStyle(opt);
                            map.addOverlay(label);
                        }
                        overviewService.setMapCache(map, cachePoints);
                        map.setViewport(points);
                        if(points.length < 2){
                            map.setZoom(14);
                        }

                    }

                }, true);


            }
        }
    }])
    .directive('lineSvg', ['$document', '$compile', '$timeout', '$state', 'overviewService', '$parse', function ($document, $compile, $timeout, $state, overviewService, $parse) {
        return {
            restrict: 'AE',
            require: '?ngModel',
            templateUrl: 'app/common/directives/view/lineSvgWrapper.html',
            link: function (scope, element, attr, model) {
                var type = {
                    '0': 'node-red',
                    '3': 'node-green',
                    '1': 'node-blue',
                    '4': 'node-xuni'

                };
                
                var getType = function (code) {
                    return code == 100 || code == 101;
                }

                scope.$watch(function(){
                    return model.$modelValue;
                }, function (modelValue) {
                    if(modelValue && modelValue.length>0){
                        var json = modelValue;
                        var svgNode = null;
                        if(angular.isDefined(attr.svgNode)){
                            svgNode = $parse(attr.svgNode)(scope);
                            console.log('svgNode',svgNode)
                        }
                        var svgType = null;
                        if(angular.isDefined(attr.svgType)){
                            svgType = $parse(attr.svgType)(scope);
                            svgType = getType(svgType);
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
                        location.push(_.maxBy(json, 'y').y+wrapper);
                        var view = [];
                        view.push(location[2]-location[0]);
                        view.push(location[3]-location[1]);

                        var value = 76,
                            r = 7,
                            xlelf = location[0];
                        var muId = json[0].id;

                        var lineSvg = _.keyBy(json, 'id');
                        //console.log(lineSvg);

                        var view_h = 500;
                        var ceter;
                        if(view[1]*value>view_h){
                            view_h = view[1]*value;
                            ceter = 0;
                        }else{
                            ceter = (view_h-(location[3]-location[1])*value)/2;
                        }

                        for(var k in lineSvg){
                            lineSvg[k].x = (lineSvg[k].x - xlelf)*value;
                            lineSvg[k].y =  (location[3] -lineSvg[k].y)*value + ceter;
                        }
                        //console.log(lineSvg);

                        var id = attr.id;
                        element.css({
                            'width': view[0]*value,
                            'margin': '0 auto',
                            'position': 'relative'
                        });


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

                            var index1 = _.findIndex(json, {id: parseInt(e.getAttribute('lineId'))});
                            scope.lineDate = json[index1];
                            scope.$apply();

                            var n_h = h;
                            if(scope.lineDate.type == 3){
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
                                $compile($document.find('#popup').contents())(scope);
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
                                circleMouseenter(e.currentTarget.parentElement.childNodes[0]);
                            });

                            element.on('mouseleave', '.node-circle-click', function (e) {
                                circleMouseleave(e.currentTarget.parentElement.childNodes[0]);
                            });
                        }

                        mouseAction();

                        var ec = null;
                        var callBack = null;
                        if (angular.isDefined(attr.lineClick)) {
                            callBack = $parse(scope[attr.lineClick]);//scope.$eval(attr.lineClick);
                        }

                        var moveToChart = function () {
                            $('.power-body-content-right').animate({
                                scrollTop: 560 }, 500);
                        }

                        scope.$on('highCircle', function(event, data) {

                            if(_.isNumber(data.deviceId)){
                                ec = element.find('circle[deviceId='+ data.deviceId +']')[0];
                                var color = '#018952';
                                if(ec.className.baseVal == 'node-red'){
                                    color = '#BF1A2E';
                                }
                                ec.style.fill = color;
                                //getTextNode(ec).style.fill = color;
                            }

                            scope.$broadcast('circleEnd', null);
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
                                moveToChart();
                                if(callback){
                                    callback(parseInt(ec.getAttribute('deviceId')));
                                }
                            });
                        }
                        if(!svgNode){
                            clickAction(callBack);
                        }
                    }
                });


            }
        }
    }])

