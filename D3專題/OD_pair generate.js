class Node {
    constructor(data, cost) {
        this.dest = data;
        this.cost = cost;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    append(data, cost) {
        const newNode = new Node(data, cost);
        if (this.isEmpty()) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode;
            this.tail = newNode;
        }
        this.length += 1;
    }

    getCost(dest) {
        let currNode = this.head;
        while (currNode.dest) {
            if (currNode.dest === dest) return currNode.cost
            currNode = currNode.next;
        }
        return -1
    }

    isEmpty() {
        return this.length === 0;
    }

    clear() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    size() {
        return this.length;
    }
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

var path_table = new Array(108)
for (var i = 0; i < path_table.length; ++i) path_table[i] = Array(108).fill("")
var path_table_2020 = new Array(119)
for (var i = 0; i < path_table_2020.length; ++i) path_table_2020[i] = Array(119).fill("")
var riding_cost = Array(119) // 不能用fill 會指向同個位置
var station_to_code = {
    "動物園": 0,
    "木柵": 1,
    "萬芳社區": 2,
    "萬芳醫院": 3,
    "辛亥": 4,
    "麟光": 5,
    "六張犁": 6,
    "科技大樓": 7,
    "大安": 8,
    "忠孝復興": 9,
    "南京復興": 10,
    "中山國中": 11,
    "松山機場": 12,
    "大直": 13,
    "劍南路": 14,
    "西湖": 15,
    "港墘": 16,
    "文德": 17,
    "內湖": 18,
    "大湖公園": 19,
    "葫洲": 20,
    "東湖": 21,
    "南港軟體園區": 22,
    "南港展覽館": 23,
    "象山": 24,
    "台北101/世貿": 25,
    "信義安和": 26,
    "大安森林公園": 27,
    "東門": 28,
    "中正紀念堂": 29,
    "台大醫院": 30,
    "台北車站": 31,
    "中山": 32,
    "雙連": 33,
    "民權西路": 34,
    "圓山": 35,
    "劍潭": 36,
    "士林": 37,
    "芝山": 38,
    "明德": 39,
    "石牌": 40,
    "唭哩岸": 41,
    "奇岩": 42,
    "北投": 43,
    "新北投": 44,
    "復興崗": 45,
    "忠義": 46,
    "關渡": 47,
    "竹圍": 48,
    "紅樹林": 49,
    "淡水": 50,
    "新店": 51,
    "新店區公所": 52,
    "七張": 53,
    "小碧潭": 54,
    "大坪林": 55,
    "景美": 56,
    "萬隆": 57,
    "公館": 58,
    "台電大樓": 59,
    "古亭": 60,
    "小南門": 61,
    "西門": 62,
    "北門": 63,
    "松江南京": 64,
    "台北小巨蛋": 65,
    "南京三民": 66,
    "松山": 67,
    "南勢角": 68,
    "景安": 69,
    "永安市場": 70,
    "頂溪": 71,
    "忠孝新生": 72,
    "行天宮": 73,
    "中山國小": 74,
    "大橋頭站": 75,
    "台北橋": 76,
    "菜寮": 77,
    "三重": 78,
    "先嗇宮": 79,
    "頭前庄": 80,
    "新莊": 81,
    "輔大": 82,
    "丹鳳": 83,
    "迴龍": 84,
    "三重國小": 85,
    "三和國中": 86,
    "徐匯中學": 87,
    "三民高中": 88,
    "蘆洲": 89,
    "頂埔": 90,
    "永寧": 91,
    "土城": 92,
    "海山": 93,
    "亞東醫院": 94,
    "府中": 95,
    "BL板橋": 96,
    "新埔": 97,
    "江子翠": 98,
    "龍山寺": 99,
    "善導寺": 100,
    "忠孝敦化": 101,
    "國父紀念館": 102,
    "市政府": 103,
    "永春": 104,
    "後山埤": 105,
    "昆陽": 106,
    "南港": 107,
    "十四張": 108,
    "秀朗橋": 109,
    "景平": 110,
    "中和": 111,
    "橋和": 112,
    "中原": 113,
    "板新": 114,
    "Y板橋": 115,
    "新埔民生": 116,
    "幸福": 117,
    "新北產業園區": 118,
}

var current_OD_pairs = new Array(119)
var current_OD_pairs_source = ""

function get_available_during_time(time) {
    res = []
    for (var i = 0; i < current_OD_pairs.length; ++i) {
        if (current_OD_pairs[i]["cost"] < time) res.push(getKeyByValue(station_to_code, i))
    }
    return res
}

function generate_OD_pair(source, year) {
    current_OD_pairs_source = src
    current_OD_pairs_year = year
    var node_number = (year < 2020) ? 108 : 119
    var path = (year < 2020) ? path_table : path_table_2020
    var source = station_to_code[source]
    for (var index = 0; index < node_number; ++index) {
        var dest = index
        var src =source
        if (src === dest) {
            current_OD_pairs[index] = {"pair": new Array(), "cost": 0}
            continue
        }
        var reverse = false
        // path必須由編號小的站到編號大的站獲得
        if (src > dest) {
            var temp = src
            src = dest
            dest = temp
            reverse = true
        }
        var riding_time = []
        var cost = 0
        var nodes = path[src][dest].split(',')
        if (reverse) nodes = nodes.reverse()
        // console.log(nodes)
        var now_line = is_the_same_line(Number(nodes[0]), Number(nodes[1]))
        // 搭乘和轉乘時間
        for (var i = 0; i < nodes.length - 1; ++i) {
            var next_line = is_the_same_line(Number(nodes[i]), Number(nodes[i + 1]))
            if (now_line != next_line) {
                if (now_line === undefined) {
                    console.log(riding_time)
                    riding_time.pop()
                    riding_time.push(["transferring", 7])
                } else {
                    riding_time.push([now_line, cost])
                    riding_time.push(["transferring", 2])
                }
                cost = 0
            }
            cost += riding_cost[Number(nodes[i])].getCost(Number(nodes[i + 1]))
            now_line = next_line
        }
        riding_time.push([now_line, cost])
        if (now_line === undefined) {
            riding_time.pop()
            riding_time.push(["transferring", 7])
        }
        var waiting_time = {
            'brown': [-1, -1, -1, -1, -1, -1, 3, 3, 3, 3, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 5, 5, 5, 5],
            'red': [-1, -1, -1, -1, -1, -1, 3, 3, 3, 5, 5, 5, 5, 4, 5, 5, 3, 3, 3, 5, 4, 5, 5, 8],
            'red2': [-1, -1, -1, -1, -1, -1, 4, 4, 3, 5, 5, 5, 5, 5, 5, 5, 4, 3, 4, 4, 5, 5, 5, 6],
            'green': [-1, -1, -1, -1, -1, -1, 3, 2, 2, 3, 4, 3, 4, 4, 3, 4, 3, 3, 2, 2, 3, 3, 4, 6],
            'green2': [-1, -1, -1, -1, -1, -1, 8, 6, 6, 8, 10, 10, 8, 10, 10, 8, 10, 6, 6, 10, 8, 10, 8, 8],
            'orange': [-1, -1, -1, -1, -1, -1, 4, 3, 3, 4, 5, 4, 5, 5, 5, 5, 3, 3, 3, 5, 4, 5, 5, 6],
            'orange2': [-1, -1, -1, -1, -1, -1, 4, 3, 3, 4, 5, 4, 5, 5, 5, 5, 3, 3, 3, 5, 4, 5, 5, 6],
            'blue': [-1, -1, -1, -1, -1, -1, 3, 3, 3, 3, 4, 5, 5, 5, 4, 4, 4, 3, 3, 3, 4, 4, 5, 4],
            'yellow': [-1, -1, -1, -1, -1, -1, 3, 3, 3, 3, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 5, 5, 5, 5]
        }
        var total_time = new Array(24)
        // 加入等車時間
        for (var i = 0; i < total_time.length; ++i) {
            total_time[i] = []
            if (i < 6) continue
            for (const [type, cost] of riding_time) {
                // console.log(type, cost)
                // if(type[type.length - 1] === "2") type = type.substring(0, type.length - 1)
                if (type !== "transferring") total_time[i].push(["waiting", waiting_time[type][i]])
                total_time[i].push([type, cost])
            }
        }

        var sum = 0
        for (const [type, cost] of total_time[19]) {
            sum += cost
        }
        current_OD_pairs[index] = {"pair": total_time, "cost": sum}
    }
    if (year < 2020) {
        for (var i = 108; i < 119; ++i)
            current_OD_pairs[i] = {"pair": new Array(), "cost": 0}
    }
}

function get_OD_pair(src, dest, year) {
    if (src != current_OD_pairs_source || year != current_OD_pairs_year) {
        generate_OD_pair(src, year)
    }
    dest = station_to_code[dest]
    return current_OD_pairs[dest]["pair"]
    // src = station_to_code[src]
    // dest = station_to_code[dest]
    // var reverse = false
    // // path必須由編號小的站到編號大的站獲得
    // if (src > dest) {
    //     var temp = src
    //     src = dest
    //     dest = temp
    //     reverse = true
    // }
    // var riding_time = []
    // var cost = 0
    // var path = (year < 2020) ? path_table[src][dest] : path_table_2020[src][dest]
    // var nodes = path.split(',')
    // if (reverse) nodes = nodes.reverse()
    // // console.log(nodes)
    // var now_line = is_the_same_line(Number(nodes[0]), Number(nodes[1]))
    // // 搭乘和轉乘時間
    // for (var i = 0; i < nodes.length - 1; ++i) {
    //     var next_line = is_the_same_line(Number(nodes[i]), Number(nodes[i + 1]))
    //     if (now_line != next_line) {
    //         if (now_line === undefined) {
    //             riding_time.pop()
    //             riding_time.push(["transferring", 7])
    //         } else {
    //             riding_time.push([now_line, cost])
    //             riding_time.push(["transferring", 2])
    //         }
    //         cost = 0
    //     }
    //     cost += riding_cost[Number(nodes[i])].getCost(Number(nodes[i + 1]))
    //     now_line = next_line
    // }
    // riding_time.push([now_line, cost])
    // var waiting_time = {
    //     'brown': [-1, -1, -1, -1, -1, -1, 3, 3, 3, 3, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 5, 5, 5, 5],
    //     'red': [-1, -1, -1, -1, -1, -1, 3, 3, 3, 5, 5, 5, 5, 4, 5, 5, 3, 3, 3, 5, 4, 5, 5, 8],
    //     'red2': [-1, -1, -1, -1, -1, -1, 4, 4, 3, 5, 5, 5, 5, 5, 5, 5, 4, 3, 4, 4, 5, 5, 5, 6],
    //     'green': [-1, -1, -1, -1, -1, -1, 3, 2, 2, 3, 4, 3, 4, 4, 3, 4, 3, 3, 2, 2, 3, 3, 4, 6],
    //     'green2': [-1, -1, -1, -1, -1, -1, 8, 6, 6, 8, 10, 10, 8, 10, 10, 8, 10, 6, 6, 10, 8, 10, 8, 8],
    //     'orange': [-1, -1, -1, -1, -1, -1, 4, 3, 3, 4, 5, 4, 5, 5, 5, 5, 3, 3, 3, 5, 4, 5, 5, 6],
    //     'orange2': [-1, -1, -1, -1, -1, -1, 4, 3, 3, 4, 5, 4, 5, 5, 5, 5, 3, 3, 3, 5, 4, 5, 5, 6],
    //     'blue': [-1, -1, -1, -1, -1, -1, 3, 3, 3, 3, 4, 5, 5, 5, 4, 4, 4, 3, 3, 3, 4, 4, 5, 4],
    //     'yellow': [-1, -1, -1, -1, -1, -1, 3, 3, 3, 3, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 5, 5, 5, 5]
    // }

    // var total_time = new Array(24)
    // // 加入等車時間
    // for (var i = 0; i < total_time.length; ++i) {
    //     total_time[i] = []
    //     if (i < 6) continue
    //     for ([type, cost] of riding_time) {
    //         // if(type[type.length - 1] === "2") type = type.substring(0, type.length - 1)
    //         if (type !== "transferring") total_time[i].push(["waiting", waiting_time[type][i]])
    //         total_time[i].push([type, cost])
    //     }
    // }
    // return total_time
}

function is_the_same_line(station1, station2) {
    var line1 = get_line_of_station(station1)
    var line2 = get_line_of_station(station2)
    var intersection = line1.filter(element => line2.includes(element))
    return intersection[0]
}

function get_line_of_station(station) {
    if (typeof station === "string") {
        station = station_to_code[station]
    }
    var lines = {
        'brown': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        'red': [24, 25, 26, 8, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 45, 46, 47, 48, 49, 50],
        'red2': [43, 44],
        'green': [51, 52, 53, 55, 56, 57, 58, 59, 60, 29, 61, 62, 63, 32, 64, 10, 65, 66, 67],
        'green2': [53, 54],
        'orange': [68, 69, 70, 71, 60, 28, 72, 64, 73, 74, 34, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84],
        'orange2': [68, 69, 70, 71, 60, 28, 72, 64, 73, 74, 34, 75, 85, 86, 87, 88, 89],
        'blue': [90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 62, 31, 100, 72, 9, 101, 102, 103, 104, 105, 106, 107, 23],
        'yellow': [55, 108, 109, 110, 69, 111, 112, 113, 114, 115, 116, 80, 117, 118]
    }
    var res = []
    for (const [key, value] of Object.entries(lines))
        if (value.find(element => element == station) !== undefined) res.push(key)
    return res
}

Promise.all([
    d3.csv("path.csv"),
    d3.csv("path-2020.csv"),
    d3.csv("riding time.csv")
]).then(function (data) {
    for (d of data[0])
        path_table[+d.src][d.dest] = d.route
    for (d of data[1])
        path_table_2020[+d.src][+d.dest] = d.route

    for (d of data[2]) {
        if (riding_cost[+d.from] === undefined)
            riding_cost[+d.from] = new LinkedList()
        riding_cost[+d.from].append(+d.to, +d.cost)
        if (riding_cost[+d.to] === undefined)
            riding_cost[+d.to] = new LinkedList()
        riding_cost[+d.to].append(+d.from, +d.cost)
    }
})