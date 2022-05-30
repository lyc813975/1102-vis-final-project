let OD_width = 600
let OD_height = 600
let OD_Pair_svg = d3.select("#Canvas1")
    .append("svg")
    .attr("viewBox", `${-OD_width / 2} ${-OD_height / 2} ${OD_width} ${OD_height}`)
    .attr('width', OD_width)
    .attr('height', OD_height)
    .style('background', 'white')
    .style('position', 'absolute')
    .style("left", 1000).style("top", 150).style("opacity", 1)
// 圖表名稱
let OD_Pair_title = OD_Pair_svg.append("text")
    .attr("x", 150)
    .attr("y", 250)
//Color
let OD_color = d3.scaleOrdinal()
    .domain(["transferring", "waiting", "orange", "yellow", "brown", "blue", "red", "green", "grey"])
    // .range(["#000000", "#ff00ff", "#ff8000", "ffff00", "#994c00", "#0080ff", "#ff0000", "#009900", "#a0a0a0"])
    .range(["gray", "black", "orange", "yellow", "brown", "blue", "red", "green", "#a0a0a0"])

// 0 ~ 23   給予角度
let x_angle = d3.scaleBand()
    .domain(d3.range(24))
    .range([0, 2 * Math.PI])
    .align(0)

//Data   Test
//OD_data[24小時][動作 , 花費時間]
//OD_data[x][y] = [第幾小時 (0 ~ 23) , 動作 , 前一個總共花費時間 , 總共花費時間]
let OD_data = [[["blue", 5], ["green", 1], ["red", 3]]
    , [["grey", 7], ["waiting", 2]]
    , [["transferring", 4]]
    , [["yellow", 5]]
    , [["orange", 9], ["brown", 1]]]

let OD_data2 = [[["brown", 5], ["waiting", 1], ["red", 3]]
    , [["grey", 7], ["waiting", 2], ["yellow", 3]]
    , [["transferring", 4], ["grey", 2]]
    , [["yellow", 5], ["blue", 7]]
    , [["orange", 9], ["brown", 1]]
    , [["waiting", 4]]]

let OD_data3 = [[["waiting", 3], ["orange", 2], ["transferring", 2], ["waiting", 3], ["yellow", 3], ["transferring", 7], ["waiting", 3], ["blue", 2]],
    [["waiting", 5], ["orange", 2], ["transferring", 2], ["waiting", 8], ["yellow", 3], ["transferring", 7], ["waiting", 5], ["blue", 2]]]

//OD_Pair_svg.append("g").attr("id","OD_Test")
// OD_Pair_Draw()

function OD_Pair_Draw(src, dest, year) {
    OD_Pair_title.text(src + "到" + dest)
    // 每次重畫一張圖 先把原有的清掉
    if (!OD_Pair_svg.select("#OD_Test").empty()) {
        OD_Pair_svg.select("#OD_Test").remove()
        //console.log("有id = OD_Test 的 g， 故 remove")
    }
    if (OD_Pair_svg.select("#OD_Test").empty()) {
        //console.log("沒有id = OD_Test 的 g")
    }
    // 起點與終點相同時 不畫圖
    // OD 全空時 dataset處理會出錯
    if (src === dest) return

    dataset = generate_OD_pair(src, dest, year)
    Dataset = JSON.parse(JSON.stringify(dataset))
    var OD_total = []
    Dataset.forEach(function (dd, index) {
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
    console.log("OD = ", Dataset)
    //OD_data[24小時][動作 , 花費時間]
    //                          0           1            2                   3                    4
    //OD_data[x][y] = [第幾小時 (0 ~ 23) , 動作 , 前一個總共花費時間 , 到這一個總共花費時間 , 這個時間段總共花費時間]
    console.log("total = ", d3.max(OD_total))
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
        .data(Dataset).join("g").attr("id", (d, i) => i.toString())
        .selectAll("path")
        .data((d) => d).join("path").attr("d", (d) => arc(d)).attr("fill", (d) => OD_color(d[1]))
}