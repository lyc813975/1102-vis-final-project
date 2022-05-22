// 建立日曆 選擇要展現的圖表
//                     年    月   日                       年     月    日
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

//進階選項
$("#hidden_Option").change(function(){
    if($("#hidden_Option").is(":checked") == true){
        $("#hidden_Block").show()
    }else{
        $("#hidden_Block").hide()
    }
})
//進階選項裡的調整
$("#Max_Circle_Width").change(function(){
    $("#Max_Circle_Width_Text").html($("#Max_Circle_Width").val())
    if(the_date.value != ""){
        var Year = +the_date.value.split("-")[0]
        var Month = +the_date.value.split("-")[1]
        var Day = +the_date.value.split("-")[2]
        update_network(Year,Month,Day)
    }else{
        update_network(2017,1,1)
    }
})
$("#Min_Circle_Width").change(function(){
    $("#Min_Circle_Width_Text").html($("#Min_Circle_Width").val())
    if(the_date.value != ""){
        var Year = +the_date.value.split("-")[0]
        var Month = +the_date.value.split("-")[1]
        var Day = +the_date.value.split("-")[2]
        update_network(Year,Month,Day)
    }else{
        update_network(2017,1,1)
    }
})
$("#Max_Line_Width").change(function(){
    $("#Max_Line_Width_Text").html($("#Max_Line_Width").val())
    if(the_date.value != ""){
        var Year = +the_date.value.split("-")[0]
        var Month = +the_date.value.split("-")[1]
        var Day = +the_date.value.split("-")[2]
        update_network(Year,Month,Day)
    }else{
        update_network(2017,1,1)
    }
})
$("#Min_Line_Width").change(function(){
    $("#Min_Line_Width_Text").html($("#Min_Line_Width").val())
    if(the_date.value != ""){
        var Year = +the_date.value.split("-")[0]
        var Month = +the_date.value.split("-")[1]
        var Day = +the_date.value.split("-")[2]
        update_network(Year,Month,Day)
    }else{
        update_network(2017,1,1)
    }
})
