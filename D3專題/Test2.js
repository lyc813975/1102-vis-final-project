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
    .range([1000,0])
let xScale = d3.scaleLinear()
    .domain([121.4,121.7])
    .range([0,1500])
//圓半徑 跟  線寬度  可能要再想想，  因為根據Range的不同，可能上下限不同
let Radius = d3.scaleLinear()
    .domain([100000,6000000])
    .range([5,15])
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
    return d3.csv("out/all.csv")
}).then((All_Path_Data)=>{
//有Station{ station , index , Sum = 0 , x , y , colors}
//有Every_Route{ route_color , start_station  , next_station  , start_pos_x , start_pos_y ,
//               next_pos_x , next_pos_y , route_sum, route_sum}
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
                console.log("length = " , Temp_Data.length)
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
            //Time_and_All_Data.push(JSON.parse(JSON.stringify(Temp_Data)))
            Time_and_All_Data.push(Temp_Data)
            //歸0   
            Every_Route.forEach((e)=>{
                e.route_sum = 0
            })
        }
    })
    console.log("End")
    //這裡到時候return 整理好的Station資料的csv
    return undefined
}).then(()=>{
    console.log("Time_and_ALL =" , Time_and_All_Data)
    //console.log("2017 5月 Time_and_ALL =" , Time_and_All_Data[4])
//這裡可能要做處理車站的資料
//Station{ station , index , Sum = 0 , x , y , colors}目前


    //還不知道return啥  可能不用吧
    return undefined
}).then(()=>{
    //這裡開始畫圖
    //目前這裡是畫線的
    //Time_and_All_Data . route => {station_from , station_to , sum , from_x  , from_y , to_x , to_x , Color}
    // let Min_Line_width = d3.min(Time_and_All_Data[0][0].route , d => d.sum) 
    // let Max_Line_width = d3.max(Time_and_All_Data[0][0].route , d => d.sum) 
    // let Line_Width = d3.scaleLinear()
    //                     .domain([Min_Line_width,Max_Line_width])
    //                     .range([2,10]) 
    // svg.append("g")
    //     .selectAll("line")
    //     .data(Time_and_All_Data[0][0].route)//先給2017 01 01 的資料， 因為一開始還是要一張圖
    //     .enter()
    //     .append("line")
    //     .attr("x1" , (d)=>xScale(d.from_x))
    //     .attr("y1" , (d)=>yScale(d.from_y))
    //     .attr("x2" , (d)=>xScale(d.to_x))
    //     .attr("y2" , (d)=>yScale(d.to_y))
    //     .style("stroke-width" , (d)=>Line_Width(d.sum))
    //     .style("stroke" , (d)=>d.Color)
    //     .on("click" , function(d){
    //         //d.srcElement.__data__這能讀取到原本的資料，要不然在這裡的d只會是click這個event
    //         console.log("d = " , d.srcElement.__data__)
    //         //這能將所有circle轉為原本的顏色
    //         // d3.selectAll('line').style('stroke' , function(data){
    //         //     return data.route_color
    //         // })
    //         // //這能將所有circle轉為原本的顏色
    //         // d3.selectAll('circle').style('fill' , function(data){
    //         //     return data.colors[0]
    //         // })
    //         // //將選取的轉為白色
    //         // d3.select(this).style('stroke','white')
    //     })
})

//實驗1  成功  只是做為return一個資料讓then接收
function Exp1(Exp_Data){
    return new Promise(function(resolve,reject){
        resolve(Exp_Data)
    })
}
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
