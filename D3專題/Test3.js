// 建立日曆 選擇要展現的圖表
//                                          年     月   日                       年      月    日
$("#date").datepicker({
    minDate: new Date(2017, 1 - 1, 1), maxDate: new Date(2021, 12 - 1, 31), changeMonth: true
    , changeYear: true , onClose:function(selectedDate){
        if(selectedDate != ""){
            $( "#date2" ).datepicker( "option", "minDate", selectedDate );
        }else{
            $( "#date2" ).datepicker( "option", "minDate", new Date(2017, 1 - 1, 1) );
        }
            
    }
});

$("#date2").datepicker({
    minDate: new Date(2017, 1 - 1, 1), maxDate: new Date(2021, 12 - 1, 31), changeMonth: true
    , changeYear: true , onClose:function(selectedDate){
        if(selectedDate != ""){
            $( "#date" ).datepicker( "option", "maxDate", selectedDate );
        }else{
            $( "#date" ).datepicker( "option", "maxDate", new Date(2021, 12 - 1, 31) );
        }
        
    }
});

$("#date2").datepicker("option", "dateFormat", "yy-mm-dd")
$("#date").datepicker("option", "dateFormat", "yy-mm-dd")

let the_date = document.getElementById("date")
$("#date").change(function (d) {
    if(the_date.value != ""){
        console.log("theDate" , the_date.value)
        var Year = +the_date.value.split("-")[0]
        var Month = +the_date.value.split("-")[1]
        var Day = +the_date.value.split("-")[2]
        update_network(Year, Month, Day)
    }
})
let Find_Station_System = document.getElementById("Find_Station")
let Name = []
//尋車站機制
Find_Station_System.addEventListener("input",function(d){
    let ID_Name = "#" + d.data
    let Station_Be_Find = svg.selectAll(ID_Name)
    if(!Station_Be_Find.empty()){
        console.log("Station = " , Station_Be_Find)
        svg.selectAll("line").style("opacity" , 0.3)
        svg.selectAll("circle").style("opacity" , 0.3)
        Station_Be_Find.style("opacity" , 1)
    }
})
//創建svg
let svg = d3.select("#Canvas")
    .append("svg")
    .attr('width', 2000)
    .attr('height', 2000)
let date_box = svg.append("text").attr("x", 900).attr("y",100).style("font-size" , "50px")
//創建tooltips  的svg
let tooltip = d3.select("#Canvas")
    .append("svg")
    .attr('width', 120)
    .attr('height', 50)
    .style('display', 'none')
    .style('background', 'blue')
    .style('position', 'absolute')
d3.select("#Canvas").on("mousemove", function (e) {
    tooltip.style("left", e.layerX + 20).style("top", e.layerY + 35)
})
d3.select("#Canvas").on("click", function () {
    svg.selectAll("line").transition().duration(500).style("opacity" , 1)
    svg.selectAll("circle").transition().duration(500).style("opacity" , 1)
})
tooltip.append("text")
    .attr("x", "50%")
    .attr("y", "50%")
    .style("text-anchor", "middle")
    .style("fill", "white")
    .style("font-size", "20px")
//線性轉換
let yScale = d3.scaleLinear()
    .domain([24.95, 25.17])
    .range([1250, 50])
let xScale = d3.scaleLinear()
    .domain([121.39, 121.62])
    .range([0, 1400])
let Bar_yScale = d3.scaleLinear()
    .domain([0,10])
    .range([150,1000])
//圓半徑 跟  線寬度  可能要再想想，  因為根據Range的不同，可能上下限不同
var Every_Route = []
let Time_and_All_Data = []
var Station = []
var Station_Test = []
var start_time = new Date().getTime()
var end_time = 0
//讀取路線資料ˊ ˇ ˋ  
d3.csv("路線.csv").then((data) => {
    let Route_data = data.map((d) => {
        route_path = d.path.split("_")
        return { Route_color: d.color, Route_station: route_path }
    })

    var count = 0
    Route_data.forEach((d) => {
        for (var i = 0; i < d.Route_station.length - 1; i++) {
            start = d.Route_station[i]
            next = d.Route_station[i + 1]
            Every_Route.push({
                route_color: d.Route_color, start_station: start, next_station: next , route_sum: 0
            })
            count = count + 1;
        }
    })
    //結束跑路線     開始跑Station
    return d3.csv("經緯度.csv")
}).then((Station_Data) => {
    //額外做一個Station 儲存Data
    Station_Data.forEach((d) => {
        let color = d.station_color.split("-")
        Station.push({ station: d.station, index: +d.index, Sum: +0, x: +d.x, y: +d.y, colors: color })
        Station_Test.push({station: d.station, Sum: +0})    
    })
    //這邊去更動所有路線上的xy值
    return d3.csv("out/Link.csv")
}).then((All_Path_Data) => {
    //有Station{ station , index , Sum = 0 , x , y , colors}
    //有Every_Route{ route_color , start_station  , next_station  , start_pos_x , start_pos_y ,
    //               next_pos_x , next_pos_y }
    //這裡我想跑所有路線的資料，車站進出流量先不要
    //目前
    var year, month, Day
    //判斷
    var Y = 0, M = 0, D = 0
    //暫時放置
    let Temp_Data = []
    //這放日期的
    let Temp_Route = []
    All_Path_Data.forEach((element, index) => {
        //獲取時間
        month = element.date.split("-")[1]
        Day = element.date.split("-")[2]
        //天 變動
        if (Day != D) {
            if (D != 0) {

                //反正之後都要  先放到時候直接取代就好(station)
                //console.log("Every =" , Every_Route)
                Temp_Data.push({ station: JSON.parse(JSON.stringify(Station_Test)) , route: JSON.parse(JSON.stringify(Every_Route)) })
            }
            D = Day
            //Temp_Route.splice(0,Temp_Route.length)
            Every_Route.forEach((e) => {
                e.route_sum = 0
            })
            //歸0   
        }
        //年 或 月 變動
        if (month != M) {
            if (M != 0) {
                Time_and_All_Data.push(JSON.parse(JSON.stringify(Temp_Data)))
                //Time_and_All_Data.push(Temp_Data)
            }
            M = month
            Temp_Data.splice(0, Temp_Data.length)
            //歸0   
        }
        //獲取符合的路線
        for (var c = 0; c < Every_Route.length; c++) {
            if (Every_Route[c].start_station == element.from || Every_Route[c].next_station == element.from) {
                if (Every_Route[c].next_station == element.to || Every_Route[c].start_station == element.to) {
                    Every_Route[c].route_sum = +element.count
                    break
                }
            }
        }
        //有Every_Route{ route_color , start_station  , next_station  , start_pos_x , start_pos_y ,
        //               next_pos_x , next_pos_y , route_sum}
        //Temp_Route.push(JSON.parse(JSON.stringify(Every_Route)))
        if (index === All_Path_Data.length - 1) {
            Temp_Data.push({ station: JSON.parse(JSON.stringify(Station)), route: JSON.parse(JSON.stringify(Every_Route)) })
            Time_and_All_Data.push(JSON.parse(JSON.stringify(Temp_Data)))
            //Time_and_All_Data.push(Temp_Data)
            //歸0   
            Every_Route.forEach((e) => {
                e.route_sum = 0
            })
        }
    })
    //這裡到時候return 整理好的Station資料
    return d3.csv("單日同站進出/Node.csv")
}).then((All_Station_Data) => {
    //console.log("Time_and_ALL =" , Time_and_All_Data)
    //console.log("2017 5月 Time_and_ALL =" , Time_and_All_Data[4])
    //這裡可能要做處理車站的資料
    //Station{ station , index , Sum = 0 , x , y , colors}目前
    //Time_and_All_Data[年月][日].station  { station , index , Sum = 0 }    //colors可能有多個
    //console.log("All_Station_Data =" , All_Station_Data)
    All_Station_Data.forEach((d) => {
        //給予日期
        var The_Date = d.date.split("-")
        var year = +The_Date[0]
        var month = +The_Date[1]
        var day = +The_Date[2]
        var first = (year - 2017) * 12 + month - 1
        var second = day - 1
        //找車站，並且改值
        for (var sta = 0; sta < Station.length; sta++) {
            if (Time_and_All_Data[first][second].station[sta].station == d.station) {
                var sum_in = +d.in_sum
                var sum_out = +d.out_sum
                Time_and_All_Data[first][second].station[sta].Sum = sum_in + sum_out
            }
        }

    })
    //還不知道return啥  可能不用吧
    return undefined
}).then(() => {
    //console.log("Time_and_ALL =" , Time_and_All_Data)
    //Time_and_All_Data . route =>{ route_color , start_station  , next_station , route_sum}
    svg.append("g").attr("id", "Line")
        .selectAll("line")
        .data(Time_and_All_Data[0][0].route) // 從2017-01-01拿資料初始link
        .enter()
        .append("line")
        .attr("class", (d) => d.route_color)
        .attr("x1", (d) => xScale(Check_Station_Pos_x(d.start_station)))
        .attr("y1", (d) => yScale(Check_Station_Pos_y(d.start_station)))
        .attr("x2", (d) => xScale(Check_Station_Pos_x(d.next_station)))
        .attr("y2", (d) => yScale(Check_Station_Pos_y(d.next_station)))
        .style("stroke-width", 0) // 先給空值避免顯示錯誤
        .style("stroke", (d) => d.route_color)
        .on("click", function (d) {
            //d.srcElement.__data__這能讀取到原本的資料，要不然在這裡的d只會是click這個event
            console.log("d = ", d.srcElement.__data__)
            //這能將所有circle轉為原本的顏色
            d3.selectAll('line').style('stroke', function (data) {
                return data.route_color
            })
            //這能將所有circle轉為原本的顏色
            d3.selectAll('circle').style('fill', function (data) {
                return Check_Station_color(data.station)[0]
            })
            //將選取的轉為白色
            d3.select(this).style('stroke', 'white')
        })
    svg.append("g").attr("id", "Circle")
        .selectAll("circle")
        .data(Time_and_All_Data[0][0].station) // 從2017-01-01拿資料初始化node
        .enter()
        .append("circle")
        .attr("id", function (d) {
            if(d.station === "BL板橋" || d.station === "Y板橋")
                return "板橋"
            return d.station
        })
        .attr("class", function (d) {
            let All_color
            Check_Station_color(d.station).forEach((color, index) => {
                if (index === 0)
                    All_color = color
                else
                    All_color += " " + color
            })
            return All_color
        })
        .attr("cx", (d) => xScale(Check_Station_Pos_x(d.station)))
        .attr("cy", (d) => yScale(Check_Station_Pos_y(d.station)))
        .style("r", 0) // 先給空值避免顯示錯誤
        .style("fill", (d) => Check_Station_color(d.station)[0])
        .style("stroke", "black")
        .style("opacity" , 0.8)
        .on("click", function (d) {
            //d.srcElement.__data__這能讀取到原本的資料，要不然在這裡的d只會是click這個event
            console.log("d = ", d.srcElement.__data__)
            //這能將所有circle轉為原本的顏色
            d3.selectAll('line').style('stroke', function (data) {
                return data.route_color
            })
            //這能將所有circle轉為原本的顏色
            d3.selectAll('circle').style('fill', function (data) {
                return Check_Station_color(data.station)[0]
            })
            //將選取的轉為白色
            d3.select(this).style('fill', 'white')
        })
        .on("mousemove", (d) => {
            tooltip.select('text').html(d.srcElement.__data__.station)
            tooltip.style("display", "block")
        })
        .on("mouseleave", (d) => {
            tooltip.style("display", "none")
        })
    // let Bar_xScale = d3.scaleLinear()
    //     .domain([])
    //     .range([1400,1900])
    // let Bar_yScale = d3.scaleLinear()
    //     .domain([0,10])
    //     .range([50,1000])
        svg.append("g").attr("class" , "Top_Ten_Bar")
            .selectAll("rect")
            .data(Time_and_All_Data[0][0].station)
            .enter().filter(function(d,i){
                return i < 10
            })
            .append("rect")
            .attr("x" , 1500)
            .attr("y" , (d,i)=>Bar_yScale(i))
            .attr("width" , 250)
            .attr("height" , 50)
        svg.append("g").attr("class","Top_Ten_Text")
            .selectAll("text")
            .data(Time_and_All_Data[0][0].station)
            .enter().filter(function(d,i){
                return i < 10
            })
            .append("text")
            .attr("x" , 1500)
            .attr("y" , (d,i)=>Bar_yScale(i)-5)
            .attr("font-size" , "30px")
        //let xAxis = d3.axisBottom(Bar_xScale);
        let yAxis = d3.axisLeft(Bar_yScale);
            //svg.append("g")
            //  .attr("class" , "axis")
            //    .attr("transform" , "translate(50,430)")
            //    .call(xAxis)
            svg.append("g")
                .attr("class" , "axis")
                .attr("transform" , "translate(1500,-60)")
                .call(yAxis)
        update_network(2017, 1, 1)
        end_time = new Date().getTime()
        console.log("Time = " , end_time - start_time)
})


function Check_Station_Pos_x(Station_Name){
    let return_station = Station.find((sta)=>sta.station === Station_Name)
    return return_station.x
}
function Check_Station_Pos_y(Station_Name){
    let return_station = Station.find((sta)=>sta.station === Station_Name)
    return return_station.y
}
function Check_Station_color(Station_Name){
    let return_station = Station.find((sta)=>sta.station === Station_Name)
    return return_station.colors
}
function Check_Station_index(Station_Name){
    let return_station = Station.find((sta)=>sta.station === Station_Name)
    return return_station.index
}
//實驗1  成功  只是做為return一個資料讓then接收
//順便當作寫Promise ?
function Exp1(Exp_Data) {
    return new Promise(function (resolve, reject) {
        resolve(Exp_Data)
    })
}

// args: 年月日
// func: 回傳Time_and_All_Data對應的第一個索引
function get_first_index(year, month, day) { return (year - 2017) * 12 + month - 1 }
// args: 年月日
// func: 回傳Time_and_All_Data對應的第二個索引
function get_second_index(year, month, day) { return day - 1 }

// 這邊的update_nextwork是先算當日的   一個range之後再想ˊ ˇ ˋ  要不然怕range沒做出來 浪費時間
// args: 年月日
// func: 根據給定日期更新nextwork
function update_network(year, month, day) {
    i = get_first_index(year, month, day)
    j = get_second_index(year, month, day)
    update_date(year, month, day)
    update_node(Time_and_All_Data[i][j])
    update_link(Time_and_All_Data[i][j])
    update_bar(Time_and_All_Data[i][j].station)
}

function update_date(year, month, day) {
    s = String(year) + "/" + String(month) + "/" + String(day)
    date_box.text(s)
}

function update_node(source_data) {
    var min_node_throughput = d3.min(source_data.station, d => {
        if (d.Sum != 0) {
            return d.Sum
        }
    })
    var max_node_throughput = d3.max(source_data.station, d => d.Sum)
    var radius_scale = d3.scaleLinear()
        .domain([min_node_throughput, max_node_throughput])
        .range([5, 20])
    svg.selectAll("circle")
        .data(source_data.station)
        .transition().duration(500)
        .style("r", function (d) {
            radius = (d.Sum == 0) ? 0 : radius_scale(d.Sum)
            return radius + "px"
        })
}

function update_link(source_data) {
    var min_link_flow = d3.min(source_data.route, d => {
        if (d.route_sum != 0) return d.route_sum
    })
    var max_link_flow = d3.max(source_data.route, d => d.route_sum)
    var width_scale = d3.scaleLinear()
        .domain([min_link_flow, max_link_flow])
        .range([2, 15])
    svg.selectAll("line")
        .data(source_data.route)
        .transition().duration(500)
        .style("stroke-width", (d) => (d.route_sum == 0) ? 0 : width_scale(d.route_sum))
}
function update_bar(source_data){
    let Top_Ten = source_data
    //d3.sort(Top_Ten , (a,b) => d3.descending(a.Sum , b.Sum))
    Top_Ten.sort((a,b) => d3.descending(a.Sum , b.Sum))
    //因為只要前十名 所以只看前十個
    let Bar_Width_Scale = d3.scaleLinear()
        .domain([Top_Ten[9].Sum,Top_Ten[0].Sum])
        .range([100,300])
    svg.selectAll("rect")
        .data(Top_Ten).transition().duration(500)
        .attr("width" , (d)=>{
            return Bar_Width_Scale(d.Sum)
        })
        .style("fill",(d)=>Check_Station_color(d.station)[0])
    update_Text(Top_Ten)
}
function update_Text(Source){
    svg.select(".Top_Ten_Text").selectAll("text")
        .data(Source)
        .text(function(d){
            return d.station + "  " + d.Sum.toString() + "人"
        })
}
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
// args: 給定開始,結束兩日期 *注意: 開始日期要早於結束日期
// func: 將圖從開始日期以天為單位增加直到結束日期 *注意: 還沒結束時就另外改變圖不知道會怎樣
async function display_in_time_interval(
        y1 = 2017, m1 = 1, d1 = 1,
        y2 = 2021, m2 = 12, d2 = 31) {
    day_of_month = [-1, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    for (year = y1; year <= y2; ++year) {
        var min_month = (year == y1) ? m1 : 1
        var max_month = (year == y2) ? m2 : 12
        for (month = min_month; month <= max_month; ++month) {
            var min_day = (year == y1 && month == m1) ? d1 : 1
            if (year == y2 && month == m2)
                var max_day = d2
            else if (year == 2020 && month == 2)
                var max_day = 29
            else
                var max_day = day_of_month[month]
            for (day = min_day; day <= max_day; ++day) {
                //console.log(year, month, day)
                update_network(year, month, day)
                await sleep(750)
            }
        }
    }
}
