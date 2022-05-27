//首先當可以跑這函式時
//Time_And_All_Data已經計算完畢
//所以可以直接使用
//但如果用import 還是建議加Time_And_All_Data的參數

let Line_svg = d3.select("#Canvas")
    .append("svg")
    .attr('width', 800)
    .attr('height', 400)
    .style('background', 'white')
    .style('position', 'absolute')
    .style("left" , 1000).style("top",700).style("opacity" , 0 )

Line_svg.append("g").attr("class","Spr_Test")//.style("opacity" , 0)
    .append("path").attr("class" , "Special_path")
let Line_X_Scale= d3.scaleLinear()
    .domain([0,59])
    .range([50,750])
let Line_Y_Scale= d3.scaleLinear()
    .domain([0,10])
    .range([350,50])
let Y_axis = d3.axisLeft(Line_Y_Scale).tickValues([])
Line_svg.append("g")
    .attr("class" , "Line_Y_axis")
    .attr("transform" , "translate(50,0)")
    .call(Y_axis)
let X_axis = d3.axisBottom(Line_X_Scale)
    .tickFormat(function(d){
        switch(d){
            case 0:
                return "2017年1月"
            case 6:
                return "7月"
            case 12:
                return "2018年1月"
            case 18:
                return "7月"
            case 24:
                return "2019年1月"
            case 30:
                return "7月"
            case 36:
                return "2020年1月"
            case 42:
                return "7月"
            case 48:
                return "2021年1月"
            case 54:
                return "7月"
        }
        return d-1})
    .tickValues([0,6,12,18,24,30,36,42,48,54])
Line_svg.append("g")
    .attr("class" , "Line_X_axis")
    .attr("transform" , "translate(0,350)")
    .call(X_axis)
//x = (50 ~ 750) 
//y = (350 50)
var tempdata = d3.range(60)
Line_svg.append("g").attr("id","Line_Grid")
        .selectAll("line")
        .data(tempdata).enter()
        .append("line")
        .attr("x1" , (d)=>Line_X_Scale(d)).attr("y1" , 350 )
        .attr("x2" , (d)=>Line_X_Scale(d)).attr("y2" , 50 )
        .style("stroke-width","1px")
        .style("stroke","rgb(0,0,0)")
        .style("opacity",0.3)

Line_svg.append("text").attr("id","Line_Text")
        .attr("y", 50).style("font-size","40px").style("text-align","center")
//根據選擇的車站 畫出折線圖的函式
function Station_All_Year_Line(the_station){
    Line_svg.style("opacity" , 1 )
    Line_svg.select("#Line_Text").text(the_station).attr("x",250)
    let the_data = []
    //如果有勾選詳細
    if($("#Alone_Option").is(":checked") == true){
        for(var i = 0 ; i < 60 ; i++){
            for(var j = 0; j < Time_and_All_Data[i].length ; j++){
                var temp = Time_and_All_Data[i][j].station.find((sta)=>sta.station === the_station)
                the_data.push(temp.Sum)
            }
        }
    }else{//如果沒勾選詳細
        for(var i = 0 ; i < 60 ; i++){
            var temp = Time_and_All_Data[i][0].station.find((sta)=>sta.station === the_station)
            the_data.push(temp.Sum)
        }
    }
    let Line_Y_Scale= d3.scaleLinear()
        .domain([d3.min(the_data),d3.max(the_data)])
        .range([350,50])
    let L_X_Scale= d3.scaleLinear()
     .domain([0,the_data.length])
     .range([50,750])
    let l = d3.line().x(function(d,i){
        return L_X_Scale(i)
    }).y((d,i)=>Line_Y_Scale(d))

    Line_svg.select(".Special_path").attr("d",l(the_data))
    .attr("stroke","black")
    .attr("stroke-width" , 2)
    .attr("fill","none")
}
function Route_All_Year_Line(sta_sta , end_sta){
    Line_svg.select(".Line_axis").style("opacity" , 1)
    Line_svg.select(".Spr_Test").style("opacity", 1)
    lt = sta_sta + "→" + end_sta
    Line_svg.select("#Line_Text").text(lt).attr("x" ,200)
    let the_data = []
    //如果有勾選詳細
    if($("#Alone_Option").is(":checked") == true){
        for(var i = 0 ; i < 60 ; i++){
            for(var j = 0; j < Time_and_All_Data[i].length ; j++){
                var temp = Time_and_All_Data[i][j].route.find(function(rou){
                    if(rou.start_station === sta_sta){
                        if(rou.next_station === end_sta)
                            return this
                    }
                })
                the_data.push(temp.route_sum)
            }
        }
    }else{//如果沒勾選詳細
        for(var i = 0 ; i < 60 ; i++){
            var temp = Time_and_All_Data[i][0].route.find(function(rou){
                if(rou.start_station === sta_sta){
                    if(rou.next_station === end_sta)
                        return this
                }
            })
            the_data.push(temp.route_sum)
        }
    }
    
    let Line_Y_Scale= d3.scaleLinear()
        .domain([d3.min(the_data),d3.max(the_data)])
        .range([350,50])
    let L_X_Scale= d3.scaleLinear()
     .domain([0,the_data.length])
     .range([50,750])
    let l = d3.line().x(function(d,i){
        return L_X_Scale(i)
    }).y((d,i)=>Line_Y_Scale(d))

    Line_svg.select(".Special_path").attr("d",l(the_data))
    .attr("stroke","black")
    .attr("stroke-width" , 2)
    .attr("fill","none")
}