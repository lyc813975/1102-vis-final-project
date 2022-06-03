let OD_width = 600
let OD_height = 600
let OD_Pair_svg = d3.select("#Canvas1")
    .append("svg")
    .attr("viewBox", `${-OD_width / 2} ${-OD_height / 2} ${OD_width} ${OD_height}`)
    .attr('width', OD_width)
    .attr('height', OD_height)
    .style('background', 'white')
    .style('position', 'absolute')
    .style("left", 880).style("top", 1050)

//let the second_Station = 
// 圖表名稱
let OD_pair_title = OD_Pair_svg.append("text")
    .attr("x", 80)
    .attr("y", -260)
    .style("font-size","22px")
//Color
let OD_color = d3.scaleOrdinal()
    .domain(["transferring", "waiting", "orange", "orange2", "yellow", "brown", "blue", "red", "green", "red2", "green2"])
    .range(["gray", "black", "#F8B61C", "#F8B61C", "#FDDB00", "#C48C31", "#0070BD", "#E3002C", "#008659", "#F3A5A8", "#DAE11F"])

// 0 ~ 23   給予角度
let x_angle = d3.scaleBand()
    .domain(d3.range(24))
    .range([0, 2 * Math.PI])
    .align(0)
// 座標軸
OD_Pair_svg.append("g")
    .attr("text-anchor", "middle")
    .selectAll("g")
    .data(Array.from(Array(24).keys()))
    .enter()
    .append("g")
    .attr("transform", (d, i) => `
        rotate(${((x_angle(i)) * 180 / Math.PI - 90)})
        translate(50 ,0)
    `)
    .call(g => g.append("line")
        .attr("x2", -5)
        .attr("stroke", "#000"))
    .call(g => g.append("text")
        .attr("transform", (d,i) => (x_angle(i) + x_angle.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
            ? "rotate(90)translate(0,20)"
            : "rotate(-90)translate(0,-10)")
        .text((d, i) => i % 3 == 0 ? i : "")
    )
let Find_Color2_option = $("#Find_Color2")
let Find_Station2_option = $("#Find_Station2")
Find_Color2_option.change(function(){
    $("#Find_Station2").empty();
    Test_Color = "." + $("#Find_Color2 option:selected").val()
    if (Test_Color === ".X") { // 處理空選項
        //unselect_object()
        return
    }
    Test_Circle = "#Circle " + Test_Color
    console.log("TTTT=" , Test_Circle)
    // 第一個為空選項 否則直接選第一個選項會不更新 
    $("#Find_Station2").append($('<option></option>').val("X").text(""))
    $(Test_Circle).each(function(i,d){
        $("#Find_Station2").append($('<option></option>').val(d.id).text(d.id))
    })
})
//選擇車站
Find_Station2_option.change(function(){
    // Test_Color = "#" + $("#Find_Station option:selected").val()
    // console.log(Test_Color)
    // d3.select("#Line").selectAll("line").style("opacity" , 0.3)
    // d3.select("#Circle").selectAll("circle").style("opacity" , 0.3)
    // d3.selectAll(Test_Color).style("opacity" , 1)
    var target_station = $("#Find_Station2 option:selected").val()
    // if (target_station === "X") return // 處理空選項
    // select_station(target_station)
})
let current_OD_pair = []

//Data   Test
//OD_data[24小時][動作 , 花費時間]
//OD_data[x][y] = [第幾小時 (0 ~ 23) , 動作 , 前一個總共花費時間 , 總共花費時間]
// let OD_data = [[["blue", 5], ["green", 1], ["red", 3]]
//     , [["grey", 7], ["waiting", 2]]
//     , [["transferring", 4]]
//     , [["yellow", 5]]
//     , [["orange", 9], ["brown", 1]]]

// let OD_data2 = [[["brown", 5], ["waiting", 1], ["red", 3]]
//     , [["grey", 7], ["waiting", 2], ["yellow", 3]]
//     , [["transferring", 4], ["grey", 2]]
//     , [["yellow", 5], ["blue", 7]]
//     , [["orange", 9], ["brown", 1]]
//     , [["waiting", 4]]]

// let OD_data3 = [[["waiting", 3], ["orange", 2], ["transferring", 2], ["waiting", 3], ["yellow", 3], ["transferring", 7], ["waiting", 3], ["blue", 2]],
//     [["waiting", 5], ["orange", 2], ["transferring", 2], ["waiting", 8], ["yellow", 3], ["transferring", 7], ["waiting", 5], ["blue", 2]]]

//OD_Pair_svg.append("g").attr("id","OD_Test")
// OD_Pair_Draw()

function OD_Pair_Draw(src, dest, year) {
    var title = [src + "到" + dest]
    OD_pair_title.text(title)
    // 每次重畫一張圖 先把原有的清掉
    if (!OD_Pair_svg.select("#OD_Test").empty()) {
        OD_Pair_svg.select("#OD_Test").remove()
        //console.log("有id = OD_Test 的 g， 故 remove")
    }
    if (OD_Pair_svg.select("#OD_Test").empty()) {
        //console.log("沒有id = OD_Test 的 g")
    }
    
    current_OD_pair = get_OD_pair(src, dest, year)
    // OD 全空時 dataset處理會出錯
    // 起點與終點相同時 不畫圖
    show_OD_pair_canvas()
    if (current_OD_pair.length === 0) return

    var dataset = JSON.parse(JSON.stringify(current_OD_pair))
    var OD_total = []
    dataset.forEach(function (dd, index) {
        var total = 0
        dd.forEach(function (d, i) {
            d.unshift(index)
            total += d[2]
            if (i === 0) {
                d.push(d[2])
                d[2] = 0
            } else {
                d.push(dd[i - 1][3] + d[2])
                d[2] = dd[i - 1][3]
            }
        })
        OD_total.push(total)
    })
    // console.log("OD = ", dataset)
    //OD_data[24小時][動作 , 花費時間]
    //                          0           1            2                   3                    4
    //OD_data[x][y] = [第幾小時 (0 ~ 23) , 動作 , 前一個總共花費時間 , 到這一個總共花費時間 , 這個時間段總共花費時間]
    // console.log("total = ", d3.max(OD_total))
    // 0 ~ total  給予半徑
    let y_radius = d3.scaleLinear()
        .domain([0, d3.max(OD_total)])
        .range([50, OD_width / 2])

    //實際arc使用
    let arc = d3.arc()
        .startAngle(d => x_angle(d[0]))
        .endAngle(d => x_angle(d[0]) + x_angle.bandwidth())
        .padAngle(0.01)
        .innerRadius((d) => y_radius(d[2]))
        .outerRadius(d => y_radius(d[3]))

    OD_Pair_svg.append("g").attr("id", "OD_Test")
        .selectAll("g")
        .data(dataset).join("g").attr("id", (d, i) => i.toString())
        .selectAll("path")
        .data((d) => d).join("path").attr("d", (d) => arc(d)).attr("fill", (d) => {
            var color = d[1]
            if (color[color.length - 1] == "2") color = color.substring(0, color.length - 1)  
            return OD_color(color)
        })
}

function hide_OD_pair_canvas() { d3.select("#Canvas1").style("display", "none")}

function show_OD_pair_canvas() { d3.select("#Canvas1").style("display", "")}