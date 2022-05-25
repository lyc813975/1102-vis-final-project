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

// update 要修改成可以查詢range
function contour_update(target_date,data){
    let total = 0
    let density = []
    let densityData
    data[0].filter(function(item){
        return item.date.includes(target_date)
    })
    .forEach(function(one){
        data[1].forEach(function(two){
            if(one.station==two.station){
                let count = parseInt(one.in_sum) + parseInt(one.out_sum)
                total+=count
                //console.log(total)
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
        .thresholds(50)
        .bandwidth(15)
        (density)
    svg_sdj.selectAll("*")
        .remove()
    svg_sdj.selectAll("path")
        .data(densityData)
        .enter()
        .append("path")
        .attr("d", d3.geoPath())
        .attr("fill",'none')
        .attr("stroke", "#69b3a2")
        .attr("stroke-linejoin", "round")
        //console.log(total)
}
Promise.all([
    d3.csv("./單日同站進出/Node.csv"),
    d3.csv("經緯度.csv"),
]).then(function(data){
    let target_date
    contour_update("-",data)
    $("#date").change(function (){
        if(the_date.value != ""){
            target_date = document.getElementById("date").value
            contour_update(target_date,data)
        }
    })
    $
})