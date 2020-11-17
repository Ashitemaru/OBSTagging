let q_data
//g global 变量
var g_group_id = 0;
var g_hash_code = '';
var g_activeTreeGroupId = 0;
var g_MaxTreeId = 0;

var DISPLAY_STATUS = {
    "DEFAULT": 0,
    "CONFIRM_SUBMIT": 1,
    "NEXT_OR_RETURN": 2
};


function deepCopy(obj){
    if(typeof obj != 'object'){
        return obj;
    }
    var newobj = {};
    for ( var attr in obj) {
        newobj[attr] = deepCopy(obj[attr]);
    }
    return newobj;
}

function changevalue(content) {
    $("[id='" + content+ "']").attr('value')
    if ($("[id='" + content+ "']").attr('value') == '0') {
        $("[id='" + content+ "']").attr('value', '1');
        $("[id='" + content+ "']").attr('style', 'opacity:1.0;filter:sepia(500);filter:contrast(0.5);');
    } else {
        $("[id='" + content+ "']").attr('value', '0');
        $("[id='" + content+ "']").attr('style', '');
    }
}

function setvalue(content, value) {
    $("[id='" + content+ "']").attr('value', value);
    if (value == '1') {
        $("[id='" + content+ "']").attr('style', 'opacity:1.0;filter:sepia(500);filter:contrast(0.5);');
    } else {
        $("[id='" + content+ "']").attr('style', '');
    }
}

//convert data to html
function processProblemContent(content) {
    let html_str = "";
    let button_total = 0;

    html_str = html_str + '<div class="row">'  + "\n";
    html_str = html_str + '<div class="col-sm-12">' + "\n";
    for (let i = 0; i < content.image.length; i++) {
        let img_url = decodeURIComponent(content.image[i]);
        html_str = html_str + '<img src="/static'+img_url+'" width="30%"/>';
    }
    html_str = html_str + "</div>" + "\n";
    html_str = html_str + "</div>" + "\n";


    html_str = html_str + '<div class="row">'  + "\n";
    html_str = html_str + '<div class="col-sm-12">' + "\n";

        html_str = html_str + '<div class="col-sm-7" style="height:700px;overflow:scroll;">' + "\n";
        for (let i = 0; i < content.ref.length; i++) {
            let img_url = decodeURIComponent(content.ref[i]);
            html_str = html_str + '<img src="/static/'+img_url+'" width="100%"/>';
        }
        html_str = html_str + "</div>" + "\n";

        html_str = html_str + '<div class="col-sm-5" style="height:700px;overflow:scroll;">' + "\n";
        html_str = html_str + '<h2>甲骨文</h2>' + "\n";
        for (let i = 0; i < content.old_char.length; i++) {
            html_str = html_str + "<div>";
            for (let j = 0; j < content.old_char[i].length; j++) {
                let img_url = decodeURIComponent(content.old_char[i][j]);
                let button_id = button_total.toString();
                html_str = html_str + '<img id="button' + button_id + '" src="/static/'+img_url+'" width="8%" value = "0"> &nbsp;';// 若要求可写 onclick="changevalue(\'button'+ button_id + '\')"
                button_total = button_total + 1;
            }
            html_str = html_str + "</div><br/>" + "\n";
            html_str = html_str + "<hr/>" + "\n";
        }

        html_str = html_str + '<div>\
                <div class="radio-tile-group">\
                <div class="item-name"> 是否有缺列</div>\
                <div class="radio-tile-group">\
                <div class="input-container">\
                  <input id="unrealted" class="radio-button" type="radio" name="radio_0" value="0" readonly="readonly" disabled="disabled"/> \
                  <div class="radio-tile">\
                    <div class="icon unrealted-icon">\
                      \
                    </div>\
                    <label for="unrealted" class="radio-tile-label">未缺</label>\
                  </div>\
                </div>\
                <div class="input-container">\
                  <input id="negative" class="radio-button" type="radio" name="radio_0" value="1" readonly="readonly" disabled="disabled"/>\
                  <div class="radio-tile">\
                    <div class="icon negative-icon">\
                      \
                    </div>\
                    <label for="negative" class="radio-tile-label">缺列</label>\
                  </div>\
                </div>\
                </div>\
                </div>'

        html_str = html_str + '<h2>译文</h2>' + "\n"
        for (let i = 0; i < content.new_char.length; i++) {
            html_str = html_str + "<div>"
            for (let j = 0; j < content.new_char[i].length; j++) {
                let img_url = decodeURIComponent(content.new_char[i][j]);
                let button_id = button_total.toString();
                html_str = html_str + '<img id="button' + button_id + '" src="/static/'+img_url+'" width="8%" value = "0"> &nbsp;';// 若要求可写 onclick="changevalue(\'button'+ button_id + '\')"
                button_total = button_total + 1;
            }
            html_str = html_str + "</div><br/>" + "\n";
            html_str = html_str + "<hr/>" + "\n";
        }

        html_str = html_str + '<div>\
                <div class="radio-tile-group">\
                <div class="item-name"> 是否有缺列</div>\
                <div class="radio-tile-group">\
                <div class="input-container">\
                  <input id="unrealted" class="radio-button" type="radio" name="radio_1" value="0" readonly="readonly" disabled="disabled"/> \
                  <div class="radio-tile">\
                    <div class="icon unrealted-icon">\
                      \
                    </div>\
                    <label for="unrealted" class="radio-tile-label">未缺</label>\
                  </div>\
                </div>\
                <div class="input-container">\
                  <input id="negative" class="radio-button" type="radio" name="radio_1" value="1" readonly="readonly" disabled="disabled"/>\
                  <div class="radio-tile">\
                    <div class="icon negative-icon">\
                      \
                    </div>\
                    <label for="negative" class="radio-tile-label">缺列</label>\
                  </div>\
                </div>\
                </div>\
                </div>'

        html_str = html_str + "</div>" + "\n";

    html_str = html_str + "</div>" + "\n";
    html_str = html_str + "</div>" + "\n";
    return html_str
}


//展示考卷信息


function showQuestion(id) {
    $(".question").find(".question_info").remove(); //移除所有选项

    let question_display = q_data.problem_content;
    question_display = processProblemContent(question_display);

    // 显示题面
    $(".question_title").html(question_display); // 显示题目信息

    //显示树选项
    $(".question").attr("id", "question" + id); // 设置题目的id
    $("#ques" + id).removeClass("active_question_id").addClass("question_id"); // 设置把当前题目的答题卡题号方框

    $('polygon').attr('fill','gainsboro');

    let answer_temp = q_data.answer//checkQues[g_activeQuestion_id].answer;
    for (let i = 0; i < 2; i++) {
        if(answer_temp[i]!=-1){
            $('input[name=\'radio_' + i + '\'][value=' + answer_temp[i] + ']').attr("checked",true);
        }
    }
    for (let i = 2; i < answer_temp.length; i++)
        setvalue('button'+(i-2), answer_temp[i]);

}

// 主函数：当 DOM（文档对象模型） 已经加载，并且页面（包括图像）已经完全呈现时，会发生 ready 事件
$(function() {
    //调整答题面板位置
    $(".middle-top-left").width($(".middle-top").width() - $(".middle-top-right").width())
    $(".problem_progress-left").width($(".middle-top-left").width() - 200);
    //标注结束
    q_data = JSON.parse($('#q_data').attr('value'));
    // console.log(q_data);
    $('#q_data').remove();
    showQuestion(0); // 显示第一题
})