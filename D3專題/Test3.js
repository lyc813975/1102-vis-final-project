//                                          年     月   日                       年      月    日
$( "#date" ).datepicker({minDate : new Date(2017, 1 - 1, 1) , maxDate : new Date(2021, 12 - 1, 31) ,changeMonth : true
 , changeYear : true});
 $( "#date" ).datepicker("option" , "dateFormat" , "yy-mm-dd")
let the_date = document.getElementById("date")
$("#date").change(function(d){
    var Year = +the_date.value.split("-")[0]
    var Month = +the_date.value.split("-")[1]
    var Day = +the_date.value.split("-")[2]
    var first_index = (Year-2017) * 12 + Month - 1 
    //       資料及   年月   日
    update( Time_and_All_Data , first_index , Day - 1 )
})
//創建svg
let svg = d3.select("#Canvas")
    .append("svg")
    .attr('width' , 2000)
    .attr('height' ,2000)

//創建tooltips  的svg
let tooltip = d3.select("#Canvas")
    .append("svg")
    .attr('width' , 120)
    .attr('height' ,50)
    .style('display', 'none')
    .style('background', 'blue')
    .style('position', 'absolute')
d3.select("#Canvas").on("mousemove",function(e){
    tooltip.style("left" ,e.layerX+20).style("top",e.layerY +35)
})
tooltip.append("text")
    .attr("x" , "50%")
    .attr("y" , "50%")
    .style("text-anchor" , "middle")
    .style("fill" , "white")
    .style("font-size" , "20px")
//線性轉換
let yScale = d3.scaleLinear()
    .domain([24.95,25.2])
    .range([1000,0])
let xScale = d3.scaleLinear()
    .domain([121.4,121.7])
    .range([0,1500])
//圓半徑 跟  線寬度  可能要再想想，  因為根據Range的不同，可能上下限不同
var Every_Route = []
let Time_and_All_Data = []
var Station = []
//讀取路線資料ˊ ˇ ˋ  
d3.csv("路線.csv").then((data)=>{
    let Route_data = data.map((d)=>{
        route_path = d.path.split("_")
        return{Route_color : d.color , Route_station : route_path}
    })
    
    var count = 0
    Route_data.forEach((d)=>{
        for(var i = 0 ; i < d.Route_station.length-1 ; i++){
            start = d.Route_station[i]
            next = d.Route_station[i+1]
            Every_Route.push({route_color : d.Route_color , start_station : start , next_station : next ,
                start_pos_x : 0 ,start_pos_y : 0 , next_pos_x : 0, next_pos_y : 0 , route_sum : 0}) 
            count=count + 1;
        }
    })
    //結束跑路線     開始跑Station
    return d3.csv("經緯度.csv")
}).then((Station_Data)  =>{
    //額外做一個Station 儲存Data
    Station_Data.forEach((d)=>{
        let color = d.station_color.split("-")
        Station.push({ station : d.station , index : +d.index , Sum : +0 , x : +d.x , y : +d.y , colors : color})
    })
    //這邊去更動所有路線上的xy值
    Every_Route.forEach(d=>{
        let the_start_station = Station.find(stations=>stations.station == d.start_station)
        let the_next_station = Station.find(stations=>stations.station == d.next_station)
        d.start_pos_x = the_start_station.x
        d.start_pos_y = the_start_station.y
        d.next_pos_x = the_next_station.x
        d.next_pos_y = the_next_station.y
    }) 
    return d3.csv("out/Link.csv")
}).then((All_Path_Data)=>{
//有Station{ station , index , Sum = 0 , x , y , colors}
//有Every_Route{ route_color , start_station  , next_station  , start_pos_x , start_pos_y ,
//               next_pos_x , next_pos_y }
//這裡我想跑所有路線的資料，車站進出流量先不要
    //目前
    var year ,month , Day
    //判斷
    var Y = 0,M = 0,D = 0
    //暫時放置
    let Temp_Data = []
    //這放日期的
    let Temp_Route = []
    All_Path_Data.forEach((element,index)=>{
        //獲取時間
        month = element.date.split("-")[1]
        Day = element.date.split("-")[2]
        //天 變動
        if(Day != D){
            if(D!=0){
                
                //反正之後都要  先放到時候直接取代就好(station)
                //console.log("Every =" , Every_Route)
                Temp_Data.push({station : JSON.parse(JSON.stringify(Station)) , route : JSON.parse(JSON.stringify(Every_Route))})
            }
            D = Day
            //Temp_Route.splice(0,Temp_Route.length)
            Every_Route.forEach((e)=>{
                e.route_sum = 0
            })
            //歸0   
        }
        //年 或 月 變動
        if(month != M){
            if(M!=0){
                Time_and_All_Data.push(JSON.parse(JSON.stringify(Temp_Data)))
                //Time_and_All_Data.push(Temp_Data)
            }
            M = month
            Temp_Data.splice(0,Temp_Data.length)
            //歸0   
        }
        //獲取符合的路線
        for(var c =0 ; c<Every_Route.length ; c++){
            if(Every_Route[c].start_station == element.from || Every_Route[c].next_station == element.from){
                if(Every_Route[c].next_station == element.to || Every_Route[c].start_station == element.to){
                    Every_Route[c].route_sum = +element.count
                    break
                }
            }
        }
//有Every_Route{ route_color , start_station  , next_station  , start_pos_x , start_pos_y ,
//               next_pos_x , next_pos_y , route_sum}
        //Temp_Route.push(JSON.parse(JSON.stringify(Every_Route)))
        if(index === All_Path_Data.length-1){   
            Temp_Data.push({station : JSON.parse(JSON.stringify(Station)) , route : JSON.parse(JSON.stringify(Every_Route))})
            Time_and_All_Data.push(JSON.parse(JSON.stringify(Temp_Data)))
            //Time_and_All_Data.push(Temp_Data)
            //歸0   
            Every_Route.forEach((e)=>{
                e.route_sum = 0
            })
        }
    })
    //這裡到時候return 整理好的Station資料
    return d3.csv("單日同站進出/Node.csv")
}).then((All_Station_Data)=>{
    //console.log("Time_and_ALL =" , Time_and_All_Data)
    //console.log("2017 5月 Time_and_ALL =" , Time_and_All_Data[4])
//這裡可能要做處理車站的資料
//Station{ station , index , Sum = 0 , x , y , colors}目前
//Time_and_All_Data[年月][日].station  { station , index , Sum = 0 , x , y , colors}    //colors可能有多個
    //console.log("All_Station_Data =" , All_Station_Data)
    All_Station_Data.forEach((d)=>{
        //給予日期
        var The_Date = d.date.split("-")
        var year = +The_Date[0]
        var month = +The_Date[1]
        var day = +The_Date[2]
        var first = (year - 2017) * 12 + month - 1 
        var second = day - 1
        //找車站，並且改值
        for( var sta = 0 ; sta < Station.length ; sta++){
            if(Time_and_All_Data[first][second].station[sta].station == d.station){
                var sum_in = +d.in_sum 
                var sum_out = +d.out_sum
                Time_and_All_Data[first][second].station[sta].Sum = sum_in + sum_out
            }
        }
        
    })
    //還不知道return啥  可能不用吧
    return undefined
}).then(()=>{
    //console.log("Time_and_ALL =" , Time_and_All_Data)
    //這裡開始畫圖
    //目前這裡是畫線的
    //Time_and_All_Data . route =>{ route_color , start_station  , next_station  , start_pos_x , start_pos_y ,
    //                               next_pos_x , next_pos_y , route_sum}
    let Min_Line_width = d3.min(Time_and_All_Data[0][0].route , d => {
        if(d.route_sum!=0){
            return d.route_sum
        }
    }) 
    let Max_Line_width = d3.max(Time_and_All_Data[0][0].route , d => d.route_sum) 
    //console.log("Max =" , Max_Line_width)
    //console.log("Min = ",Min_Line_width)
    let Min_Circle_radius = d3.min(Time_and_All_Data[0][0].station , d=>{
        if(d.Sum!=0){
            return d.Sum
        }
    })
    let Max_Circle_radius = d3.max(Time_and_All_Data[0][0].station , d => d.Sum) 
    //console.log("MAx = " , Max_Circle_radius)
    //console.log("Min = " , Min_Circle_radius)
    //控制線的寬度
    let Line_Width = d3.scaleLinear()
                        .domain([Min_Line_width,Max_Line_width])
                        .range([2,10]) 
    //控制圓的大小
    let Radius = d3.scaleLinear()
                    .domain([Min_Circle_radius,Max_Circle_radius])
                    .range([5,15])
    svg.append("g").attr("class" , "Not_Yellow_Line")
        .selectAll("line")
        .data(Time_and_All_Data[0][0].route)//先給2017 01 01 的資料， 因為一開始還是要一張圖
        .enter().filter((d)=>d.route_sum!=0)
        .append("line")
        .attr("x1" , (d)=>xScale(d.start_pos_x))
        .attr("y1" , (d)=>yScale(d.start_pos_y))
        .attr("x2" , (d)=>xScale(d.next_pos_x))
        .attr("y2" , (d)=>yScale(d.next_pos_y))
        .style("stroke-width" ,(d)=>Line_Width(d.route_sum))
        .style("stroke" , (d)=>d.route_color)
        .on("click" , function(d){
            //d.srcElement.__data__這能讀取到原本的資料，要不然在這裡的d只會是click這個event
            console.log("d = " , d.srcElement.__data__)
            //這能將所有circle轉為原本的顏色
            d3.selectAll('line').style('stroke' , function(data){
                return data.route_color
            })
            //這能將所有circle轉為原本的顏色
            d3.selectAll('circle').style('fill' , function(data){
                return data.colors[0]
            })
            //將選取的轉為白色
            d3.select(this).style('stroke','white')
        })
    svg.append("g").attr("class" , "Yellow_Line")
        .selectAll("line")
        .data(Time_and_All_Data[0][0].route)//先給2017 01 01 的資料， 因為一開始還是要一張圖
        .enter().filter((d,index)=>index>=116)
        .append("line")
        .attr("x1" , (d)=>xScale(d.start_pos_x))
        .attr("y1" , (d)=>yScale(d.start_pos_y))
        .attr("x2" , (d)=>xScale(d.next_pos_x))
        .attr("y2" , (d)=>yScale(d.next_pos_y))
        .style("stroke-width" ,(d)=>0)
        .style("stroke" , (d)=>d.route_color)
        .on("click" , function(d){
            //d.srcElement.__data__這能讀取到原本的資料，要不然在這裡的d只會是click這個event
            console.log("d = " , d.srcElement.__data__)
            //這能將所有circle轉為原本的顏色
            d3.selectAll('line').style('stroke' , function(data){
                return data.route_color
            })
            //這能將所有circle轉為原本的顏色
            d3.selectAll('circle').style('fill' , function(data){
                return data.colors[0]
            })
            //將選取的轉為白色
            d3.select(this).style('stroke','white')
        })
    svg.append("g").attr("class" , "Not_Yellow_Circle")
        .selectAll("circle")
        .data(Time_and_All_Data[0][0].station)//先給2017 01 01 的資料， 因為一開始還是要一張圖
        .enter().filter((d)=>d.Sum!=0)
        .append("circle")
        .attr("cx" , (d)=>xScale(d.x))
        .attr("cy" , (d)=>yScale(d.y))
        .style("r" ,(d)=>Radius(d.Sum))
        .style("fill" , (d)=>d.colors[0])
        .style("stroke" , "black")
        .on("click" , function(d){
            //d.srcElement.__data__這能讀取到原本的資料，要不然在這裡的d只會是click這個event
            console.log("d = " , d.srcElement.__data__)
            //這能將所有circle轉為原本的顏色
            d3.selectAll('line').style('stroke' , function(data){
                return data.route_color
            })
            //這能將所有circle轉為原本的顏色
            d3.selectAll('circle').style('fill' , function(data){
                return data.colors[0]
            })
            //將選取的轉為白色
            d3.select(this).style('fill','white')
        })
        .on("mousemove",(d)=>{
            tooltip.select('text').html(d.srcElement.__data__.station)
            tooltip.style("display","block")
        })
        .on("mouseleave",(d)=>{
            tooltip.style("display","none")
        })
    svg.append("g").attr("class" , "Yellow_Circle")
        .selectAll("circle")
        .data(Time_and_All_Data[0][0].station)//先給2017 01 01 的資料， 因為一開始還是要一張圖
        .enter().filter((d)=>d.Sum==0)
        .append("circle")
        .attr("cx" , (d)=>xScale(d.x))
        .attr("cy" , (d)=>yScale(d.y))
        .style("r" , 0 )
        .style("fill" , (d)=>d.colors[0])
        .style("stroke" , "black")
        .on("click" , function(d){
            //d.srcElement.__data__這能讀取到原本的資料，要不然在這裡的d只會是click這個event
            console.log("d = " , d.srcElement.__data__)
            //這能將所有circle轉為原本的顏色
            d3.selectAll('line').style('stroke' , function(data){
                return data.route_color
            })
            //這能將所有circle轉為原本的顏色
            d3.selectAll('circle').style('fill' , function(data){
                return data.colors[0]
            })
            //將選取的轉為白色
            d3.select(this).style('fill','white')
        })
})

//實驗1  成功  只是做為return一個資料讓then接收
//順便當作寫Promise ?
function Exp1(Exp_Data){
    return new Promise(function(resolve,reject){
        resolve(Exp_Data)
    })
}

//         這邊的update是先算當日的   一個range之後再想ˊ ˇ ˋ  要不然怕range沒做出來 浪費時間
//         資料集Time那個   年月份計算後的      日期-1過後的
function update( dataset , First_Index   , Second_Index){
    let Min_Line_width = d3.min(dataset[First_Index][Second_Index].route , d => {
        if(d.route_sum!=0){
            return d.route_sum
        }
    }) 
    let Max_Line_width = d3.max(dataset[First_Index][Second_Index].route , d => d.route_sum) 
    var Here_Line_Width = d3.scaleLinear()
                        .domain([Min_Line_width,Max_Line_width])
                        .range([2,10]) 
    var Min_Circle_radius = d3.min(dataset[First_Index][Second_Index].station , d=>{
        if(d.Sum!=0){
            return d.Sum
        }
    })
    var Max_Circle_radius = d3.max(dataset[First_Index][Second_Index].station , d => d.Sum) 
    let Here_Radius = d3.scaleLinear()
                    .domain([Min_Circle_radius,Max_Circle_radius])
                    .range([5,15])
//這邊開始做更改
//這邊是線的
    var Yellow_Data = []
    dataset[First_Index][Second_Index].route.forEach((d,index)=>{
        if(index>=116){
            Yellow_Data.push(d)
        }
    })
    let Yellow_Line = svg.select(".Yellow_Line")
                        .selectAll("line")
                        .data(Yellow_Data)
    Yellow_Line.transition().duration(500)
            .style("stroke" , (d)=>d.route_color)
            .style("stroke-width" ,function(d){
                if(d.route_sum!=0){
                    return Here_Line_Width(d.route_sum)
                }
                return 0
            })
    let Not_Yellow_Line = svg.select(".Not_Yellow_Line")
                        .selectAll("line")
                        .data(dataset[First_Index][Second_Index].route)
                        .filter((d,index)=>index<116)                 
    Not_Yellow_Line.transition().duration(500)
                .style("stroke-width" ,(d)=>Here_Line_Width(d.route_sum))
                .style("stroke" , (d)=>d.route_color)
//這邊是圓的
    var Yellow_Station_Data = []
    dataset[First_Index][Second_Index].station.forEach((d,index)=>{
        if(index>=108){
            Yellow_Station_Data.push(d)
        }
    })
    console.log("data=" , Yellow_Station_Data)
    let Yellow_Circle = svg.select(".Yellow_Circle")
                    .selectAll("circle")
                    .data(Yellow_Station_Data)
    Yellow_Circle.transition().duration(500)
        .style("fill" , (d)=>d.colors[0])
        .style("r" ,function(d){
            if(d.Sum!=0){
                console.log("data =" , Here_Radius(d.Sum))
                return Here_Radius(d.Sum) + "px"
            }
            return 0 + "px"

        })
    let Not_Yellow_Circle = svg.select(".Not_Yellow_Circle")
                    .selectAll("circle")
                    .data(dataset[First_Index][Second_Index].station)
                    .filter((d,index)=>index<108)
    Not_Yellow_Circle.transition().duration(500)
            .style("r" ,(d)=>Here_Radius(d.Sum))
            .style("fill" , (d)=>d.colors[0])
}
