var svg_sdj = d3.select("#svg_sdj")
  .append("svg")
  .attr("width", 2000)
  .attr("height", 1200)
  .append("g")

var x = d3.scaleLinear()
    .domain([121.39, 121.62])
    .range([0, 1000])
var y = d3.scaleLinear()
    .domain([24.95, 25.17])
    .range([800, 100])

let path_num = 35
function color_scale(origin_num){
    let scale_num = d3.scaleLinear()
        .domain([0,path_num])
        .range([1,0])
    return d3.interpolateRdYlBu(scale_num(origin_num))
    return d3.interpolateRdGy(scale_num(origin_num))
    //return d3.interpolatePurples(scale_num(origin_num))
    //return d3.interpolateOranges(scale_num(origin_num))
}

// update 要修改成可以查詢range
function contour_update(date_from,date_to,data){
    let total = 0
    let density = []
    let densityData
    data[0].filter(function(item){
        // 處理 item.date
        let target_date = item.date.split('-').map(Number)
        let min_date = date_from.split('-').map(Number)
        let max_date = date_to.split('-').map(Number)
        if(date_to!=""){
            return date_judge(target_date,min_date,max_date)
        }
        return item.date.includes(date_from)
    })
    .forEach(function(one){
        data[1].forEach(function(two){
            if(one.station==two.station){
                let count = parseInt(one.in_sum) + parseInt(one.out_sum)
                total+=count
                let x = two.x
                let y = two.y
                let group = two.station
                let weight = count
                density.push({x,y,group,weight})  
            }
        })
    })
    densityData = d3.contourDensity()
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y); })
        .size([5000,5000])
        .weight(function(d){
            return d.weight
        })
        .thresholds(path_num)
        .bandwidth(15)
        (density)
    svg_sdj.selectAll("*")
        .remove()
    svg_sdj.selectAll("path")
        .data(densityData)
        .enter()
        .append("path")
        .attr("d", d3.geoPath())
        .attr("fill",function(d,i){
            return color_scale(i)
        })
        //"#69b3a2"
        .attr("stroke", "none")
        .attr("stroke-linejoin", "round")
        //console.log(total)
}
Promise.all([
    d3.csv("./單日同站進出/Node.csv"),
    d3.csv("經緯度.csv"),
]).then(function(data){
    contour_update("-","",data)
    let target_date_from
    let target_date_to
    $("#date").change(function (){
        target_date_from = document.getElementById("date").value
        target_date_to = document.getElementById("date2").value
        if(target_date_from != ""){
            contour_update(target_date_from,target_date_to,data)
        }
    })
    $("#date2").change(function (){
        target_date_from = document.getElementById("date").value
        target_date_to = document.getElementById("date2").value
        if(target_date_to != "" && target_date_from != ""){
            contour_update(target_date_from,target_date_to,data)
        }
    })
})



// function definition
// 判斷是否在範圍
function date_judge(target_date,min_date,max_date){
    if(target_date[0] > min_date[0] && target_date[0] < max_date[0]){
        return 1
    }
    else if(target_date[0] == min_date[0]){
        if(target_date[1] > min_date[1]){
            return 1
        }
        else if(target_date[1] == min_date[1]){
            if(target_date[2] >= min_date[2]){
                return 1
            }
        }
    }
    else if(target_date[0] == max_date[0]){
        if(target_date[1] < max_date[1]){
            return 1
        }
        else if(target_date[1] == max_date[1]){
            if(target_date[2] <= max_date[2]){
                return 1
            }
        }
    }
    return 0
}