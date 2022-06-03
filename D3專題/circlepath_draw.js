let OD_width = 600
let OD_height = 600
let OD_Pair_svg = d3.select("#Canvas1")
    .append("svg")
    .attr("viewBox", `${-OD_width / 2} ${-OD_height / 2} ${OD_width} ${OD_height}`)
    .attr('width', OD_width)
    .attr('height', OD_height)
    .style('background', 'white')
    .style('position', 'absolute')
    .style("left", 880).style("top", 1050).style("display", "none")

// 圖表名稱
let OD_pair_info_text = OD_Pair_svg.selectAll("text")
    .data(new Array(20))
    .enter()
    .append("text")
    .attr("x", 80)
    .attr("y", (d, i) => -280 + i * 20)
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
    OD_pair_info_text.data(new Array(20)).text((d) => d) // 清掉原本顯示資訊
    OD_pair_info_text.data(title).text((d) => d)
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

    current_OD_pair = generate_OD_pair(src, dest, year)
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
        .data((d) => d).join("path").attr("d", (d) => arc(d)).attr("fill", (d) => OD_color(d[1]))
        // 顯示路徑的詳細資訊
        .on("click", (d) => {
            var id = d.srcElement.parentNode.id
            var OD_pair = current_OD_pair[id]
            var context = [title, `${id}時`]
            context = context.concat(OD_pair_to_string(OD_pair))
            console.log(context)
            OD_pair_info_text.data(context).text((d) => d)
        })
    
    show_OD_pair_svg()
}

function OD_pair_to_string(pairs) {
    var res = []
    for (p of pairs) {
        switch(p[0]) {
            case "transferring":
                res.push(`轉乘: ${p[1]}分鐘`)
                break
            case "waiting":
                res.push(`等待: ${p[1]}分鐘`)
                break
            case "green":
            case "green2":
                res.push(`綠線: ${p[1]}分鐘`)
                break
            case "red":
            case "red2":
                res.push(`紅線: ${p[1]}分鐘`)
                break
            case "yellow":
                res.push(`黃線: ${p[1]}分鐘`)
                break
            case "blue":
                res.push(`藍線: ${p[1]}分鐘`)
                break
            case "orange":
            case "orange2":
                res.push(`橘線: ${p[1]}分鐘`)
                break
            case "brown":
                res.push(`棕線: ${p[1]}分鐘`)
                break
            default:
                console.log("Unexpected type")
        }
    }
    return res
}

function hide_OD_pair_svg() { OD_Pair_svg.style("display", "none")}

function show_OD_pair_svg() { OD_Pair_svg.style("display", "")}