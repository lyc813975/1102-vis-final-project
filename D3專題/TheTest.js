//創建svg
let svg = d3.select("#Canvas")
    .append("svg")
    .attr('width' , 2000)
    .attr('height' ,2000)
//獲取提交按鈕
let Submit_btn = document.getElementById("submit_button")
//線性轉換
let yScale = d3.scaleLinear()
    .domain([24.95,25.2])
    .range([1500,0])
let xScale = d3.scaleLinear()
    .domain([121.4,121.7])
    .range([0,1500])
let Radius = d3.scaleLinear()
    .domain([100000,6000000])
    .range([5,15])
let Line_Width = d3.scaleLinear()
    .domain([0,800])
    .range([0,20]) 
var Every_Route = []
//讀取路線資料ˊ ˇ ˋ   到時候更改一下位子，框住
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
    
    
    //開始讀取車站類資料
    d3.csv("經緯度.csv").then((data)=>{
        //讀取車站名稱，位置
        let Station = data.map((d)=>{
            let color = d.station_color.split("-")
            return{ station : d.station , index : +d.index , Sum : +0 , x : +d.x , y : +d.y , colors : color}
        })
        //將起始點跟下一點車站位置   拿出來
        Every_Route.forEach(d=>{
            let the_start_station = Station.find(stations=>stations.station == d.start_station)
            let the_next_station = Station.find(stations=>stations.station == d.next_station)
            d.start_pos_x = the_start_station.x
            d.start_pos_y = the_start_station.y
            d.next_pos_x = the_next_station.x
            d.next_pos_y = the_next_station.y
        })
        //console.log( Station)
        //讀取真檔案
        d3.csv("2020_01.csv").then((Data)=>{
            d3.csv("Path_2020.csv").then((Path_Data)=>{
                Data.forEach( (d ,index) => {
                    //開始車站 跟 結束車站  判斷，路線的起終點，使用Index
                    var Start , End
                    //路線上所有車站
                    var All_Path
                    //尋找車站，進出站人數
                    for( var i=0 ; i<Station.length ; i++){
                        //先找進站
                        if(Station[i].station == d.in_station){
                            Station[i].Sum += +d.sum
                            Start = Station[i].index
                            //進出站一樣則跳出去
                            if(Station[i].station == d.out_station){
                                End = Station[i].index
                                break;
                            }
                        }
                        //出站人數
                        if(Station[i].station == d.out_station){
                            Station[i].Sum += +d.sum
                            End = Station[i].index
                        }
                    }
                    //如果出進站為同一站，則不跑這個
                    if(Start != End){
                        //如果Start > End   (86  > 22)
                        //則交換
                        if(Start > End){
                            let temp = Start
                            Start = End
                            End = temp
                        }
                        //console.log("Start = " , Start)
                        //console.log("End = " , End)
                        for(var count = 0 ; count<Path_Data.length ; count++){
                            if(Start == +Path_Data[count].src && End == +Path_Data[count].dest){
                                All_Path = Path_Data[count].path
                                break;
                            }
                        }
                        //console.log( " All_Path =" ,All_Path)
                        //先把資料分開
                        All_Paths = All_Path.split("_")
                        //console.log(All_Paths)
                        //開始找判斷相鄰車站，並且丟到sum
                        for(var count = 1 ; count < All_Paths.length ; count++){
                            //起始車站 終點車站
                            let ss = Station.find((stations)=>stations.index === +All_Paths[count - 1] )
                            let ds = Station.find((stations)=>stations.index === +All_Paths[count] )
                            //console.log("ss = " , ss)
                            //console.log("ds = " , ds)
                            //找路線
                            let The_Route = Every_Route.find(function(routes){
                                if(routes.start_station == ss.station || routes.next_station == ss.station){
                                    if(routes.next_station == ds.station || routes.start_station == ds.station){
                                        return this
                                    }
                                }
                            })
                            //加上去
                            //console.log("The_Route = " , The_Route)
                            The_Route.route_sum += +d.sum
                        }
                    }
                })
                //車站       名稱      代號   總數   經緯度     顏色
                //Station{ station  , index , Sum , x  , y  , colors }
                //路線圖
                //線            路線顏色       起始站(字)        終站(下一站)       位置 →                                              總數
                //Every_Route {route_color , start_station  , next_station  , start_pos_x ,start_pos_y  , next_pos_x , next_pos_y ,route_sum}
                svg.append("g")
                    .selectAll("line")
                    .data(Every_Route)
                    .enter()
                    .append("line")
                    .attr("x1" , (d)=>xScale(d.start_pos_x))
                    .attr("y1" , (d)=>yScale(d.start_pos_y))
                    .attr("x2" , (d)=>xScale(d.next_pos_x))
                    .attr("y2" , (d)=>yScale(d.next_pos_y))
                    .style("stroke-width" , 5)
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
                //現在Station能找出一天的車站總流量
                //底下是2020-01圓圈位置
                svg.append("g")
                    .selectAll("circle")
                    .data(Station)
                    .enter()
                    .append("circle")
                    .attr("cx" , (d)=>xScale(d.x))
                    .attr("cy" , (d)=>yScale(d.y))
                    .attr("r" , (d)=>Radius(d.Sum))
                    .style("fill" , function(d){
                        return d.colors[0]
                    })
                    .on("click" , function(d){
                        //d.srcElement.__data__這能讀取到原本的資料，要不然在這裡的d只會是click這個event
                        console.log("d = " , d.srcElement.__data__)
                        //這能將所有circle轉為原本的顏色
                        d3.selectAll('circle').style('fill' , function(data){
                            return data.colors[0]
                        })
                        //這能將所有circle轉為原本的顏色
                        d3.selectAll('line').style('stroke' , function(data){
                            return data.route_color
                        })
                        //將選取的轉為白色
                        d3.select(this).style('fill','white')
                    })
                
            })
        })//讀取最大檔案結尾
        //每當按下更新資料按鈕時
        Submit_btn.addEventListener("click",function(){
            //獲取天跟月的下拉選單
            let Day_selector = document.getElementById("day_choose")
            let Month_Selector = document.getElementById("month_choose")
            //獲得選取的value
            var Day = Day_selector.options[Day_selector.selectedIndex].value
            var Month = Month_Selector.options[Month_Selector.selectedIndex].value
            //雖說獲取了  但我還沒丟進去update 
            var YMD = "2017-01-" + Day
            update(Station ,"2017","01", YMD)
        })
    })//ALL Station結尾
    console.log("every in = " , Every_Route)
})//Route 結尾

function Check_Station_Index(){

}

//先複製 懶得改
function update( dataset , The_Year , The_Month , The_Day){
    dataset.forEach(d=>{
        d.Sum=0
    })
    d3.csv("test1.csv").then((Data)=>{
        Data.forEach( (d ,index) => {
            //先固定時間，減少檔案數量
            if(d.data_date === The_Day){
                //尋找車站，進出站人數
                for( var i=0 ; i<dataset.length ; i++){
                    //先找進站
                    if(dataset[i].station == d.in_station){
                        dataset[i].Sum += +d.sum
                        //進出站一樣則跳出去
                        if(dataset[i].station == d.out_station){
                            break;
                        }
                    }
                    //出站人數
                    if(dataset[i].station == d.out_station){
                        dataset[i].Sum += +d.sum
                    }
                }
            }
        })
        //現在Station能找出一天的車站總流量
        //底下是圓圈位置
        let Circle = svg.selectAll("circle")
                        .data(dataset)
        let New_Circle = svg.selectAll("circle")
                        .data(dataset)
                        .enter()
                        .filter((d)=>{
                            if(Number(The_Year) < 2020) return d.index < 108
                            else return d.index < 119;
                        })
        let Exit_Circle = svg.selectAll("circle")
                            .data(dataset)
                            .exit()
                            .remove()
        Circle.transition()
            .duration(100)
            .attr("cx" , (d)=>xScale(d.x)+10)
            .attr("cy" , (d)=>yScale(d.y))
            .attr("r" , (d)=>Radius(d.Sum))
            .style('fill' , function(data){
                return data.colors[0]
            })
        New_Circle.append("circle")
                    .attr("cx" , (d)=>xScale(d.x)+10)
                    .attr("cy" , (d)=>yScale(d.y))
                    .attr("r" , (d)=>Radius(d.Sum))
                    .on("click" , function(d){
                        //d.srcElement.__data__這能讀取到原本的資料，要不然在這裡的d只會是click這個event
                        console.log("d = " , d.srcElement.__data__)
                        //這能將所有circle轉為黑色
                        d3.selectAll('circle').style('fill' , function(data){
                            return data.colors[0]
                        })
                        //將選取的轉為紅色
                        d3.select(this).style('fill','white')
                    })        
    })
}
