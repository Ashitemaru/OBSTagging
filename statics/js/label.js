var checkQues = []; //已做答的题的集合

//g global 变量
var g_group_id = 0;
var g_hash_code = '';
var g_activeQuestion_id = 0; //当前操作的考题编号
var g_activeTreeGroupId = 0;
var g_MaxTreeId = 0;
var g_MaxTreeGroupId = 0;

var DISPLAY_STATUS = {
    "DEFAULT": 0,
    "CONFIRM_SUBMIT": 1,
    "NEXT_OR_RETURN": 2
};

var g_is_error_state = false;

var status_now = DISPLAY_STATUS.DEFAULT;
var start_time_flag = 0;


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
                html_str = html_str + '<img id="button' + button_id + '" src="/static/'+img_url+'" width="8%" value = "0"/ onclick="changevalue(\'button'+ button_id + '\')"> &nbsp;';
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
                  <input id="unrealted" class="radio-button" type="radio" name="radio_0" value="0" /> \
                  <div class="radio-tile">\
                    <div class="icon unrealted-icon">\
                      \
                    </div>\
                    <label for="unrealted" class="radio-tile-label">未缺</label>\
                  </div>\
                </div>\
                <div class="input-container">\
                  <input id="negative" class="radio-button" type="radio" name="radio_0" value="1" />\
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
                html_str = html_str + '<img id="button' + button_id + '" src="/static/'+img_url+'" width="8%" value = "0"/ onclick="changevalue(\'button'+ button_id + '\')"> &nbsp;';
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
                  <input id="unrealted" class="radio-button" type="radio" name="radio_1" value="0" /> \
                  <div class="radio-tile">\
                    <div class="icon unrealted-icon">\
                      \
                    </div>\
                    <label for="unrealted" class="radio-tile-label">未缺</label>\
                  </div>\
                </div>\
                <div class="input-container">\
                  <input id="negative" class="radio-button" type="radio" name="radio_1" value="1" />\
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

function answer_pre(content) {
    var answer = [];
    var old_char_num = 0;
    var new_char_num = 0;
    answer.push('1');
    answer.push('1');
    for (let i = 0; i < content.old_char.length; i++) {
        old_char_num += content.old_char[i].length;
        for (let j = 0; j < content.old_char[i].length; j++) 
            answer.push('0');
    }
    for (let i = 0; i < content.new_char.length; i++) {
        new_char_num += content.new_char[i].length;
        for (let j = 0; j < content.new_char[i].length; j++) 
            answer.push('0');
    }
    answer.unshift(old_char_num, new_char_num);
    return answer;
}


//展示考卷信息
function showQuestion(id) {

    $(".questioned").text(id + 1); // 显示当前题号
    $("#problem_progress").css('width', (id + 1) * 10 + '%') //更新进度条

    if (g_activeQuestion_id != undefined) {
        $("#ques" + g_activeQuestion_id).removeClass("question_id").addClass("active_question_id");
    } // 把当前选中的题目的题号方框加上已经过选择过的类型
    g_activeQuestion_id = id;
    $(".question").find(".question_info").remove(); //移除所有选项

    let question_display = q_data.problem_list[id].problem_content;
    question_display = processProblemContent(question_display);

    // 显示题面
    $(".question_title").html(question_display); // 显示题目信息

    //显示树选项
    $(".question").attr("id", "question" + id); // 设置题目的id
    $("#ques" + id).removeClass("active_question_id").addClass("question_id"); // 设置把当前题目的答题卡题号方框
    
    $('polygon').attr('fill','gainsboro');

    let answer_temp = checkQues[g_activeQuestion_id].answer;
    for (let i = 2; i < 4; i++) {
        if(answer_temp[i]!=-1){
            $('input[name=\'radio_' + (i - 2) + '\'][value=' + answer_temp[i] + ']').attr("checked",true);
        }
    }
    for (let i = 4; i < answer_temp.length; i++)
        setvalue('button'+(i-4), answer_temp[i]);

}

function writeAnswer() {
    for (let i = 2; i < 4; i++) {
        let answer_id = $('input[name=\'radio_' + (i - 2) + '\']:checked').val();
        if(answer_id == undefined) {
            alert('请完成本题目,完成后可跳转。')
            return false;
        }
        checkQues[g_activeQuestion_id].answer[i] = answer_id;
    }
    for (let i = 4; i < checkQues[g_activeQuestion_id].answer.length; i++) {
        let answer_id = $("[id='button" + (i-4)+ "']").attr('value');
        if(answer_id == undefined) {
            alert('请完成本题目,完成后可跳转。')
            return false;
        }
        checkQues[g_activeQuestion_id].answer[i] = answer_id;
    }
    return true;
}

/*答题卡*/
function answerCard() {
    $(".question_sum").text(q_data.problem_list.length); // 
    for (let i = 0; i < q_data.problem_list.length; i++) {
        var questionId = "<li id='ques" + i + "'onclick='saveQuestionState(" + i + ")' class='questionId'>" + (i + 1) + "</li>";
        $("#answerCard ul").append(questionId); // 把题号方框放到答题卡这个div中
    }
}

/*设置进度条*/
function progress() {
    var prog = ($(".active_question_id").length + 1) / q_data.problem_list.length;
    var pro = $("#problem_progress").parent().width() * prog;
    //$(".progres").text((prog*100).toString().substr(0,5)+"%")
    $("#problem_progress").animate({
        width: pro,
        opacity: 0.5
    }, 1000);
    console.log($(".active_question_id").length);
}

/*保存考题状态 已做答的状态*/
function saveQuestionState(clickId) { // 在答题卡上点击某道题可以跳转
    writeAnswer();
    showQuestion(clickId);
}

function addTime() {
    checkQues[g_activeQuestion_id].cost_time += 0.1;
}

// 主函数：当 DOM（文档对象模型） 已经加载，并且页面（包括图像）已经完全呈现时，会发生 ready 事件
$(function() {
    //调整答题面板位置
    $(".middle-top-left").width($(".middle-top").width() - $(".middle-top-right").width())
    $(".problem_progress-left").width($(".middle-top-left").width() - 200);
    //标注结束
    if($('#q_data').attr('value') == 'END'){
        alert("感谢您的努力，您的标注任务已结束");    
        location.href = "/";
    }

    q_data = JSON.parse($('#q_data').attr('value'));
    // console.log(q_data);

    $('#q_data').remove();
    
    g_group_id = q_data.group_id;
    g_hash_code = q_data.hash_code;
    let problem_list = q_data.problem_list;

    // 初始化答案信息
    for (let i = 0; i < problem_list.length; i++) {
        var answerTMP = {};
        answerTMP.id = i; //获取当前考题的编号
        answerTMP.actualId = problem_list[i].problem_id;
        answerTMP.answer = answer_pre(problem_list[i].problem_content);
        answerTMP.cost_time = 0.0;
        checkQues.push(answerTMP);
    }
    progress(); // 设置进度条
    answerCard(); // 显示最下方的答题卡
    showQuestion(0); // 显示第一题
    
    /*答题卡的切换*/
    $("#openCard").click(function() {
        $("#closeCard").show();
        $("#answerCard").slideDown();
        $(this).hide();
    })
    $("#closeCard").click(function() {
        $("#openCard").show();
        $("#answerCard").slideUp();
        $(this).hide();
    })

    //展示状态的转换，
    $('#myModal').on('show.bs.modal', function () {
            //用户正在confirm submit
            status_now = DISPLAY_STATUS.CONFIRM_SUBMIT;
    });
    $('#myModal').on('hide.bs.modal', function () {
            //正在答题
            status_now = DISPLAY_STATUS.DEFAULT;
    });
    $('#myModal2').on('show.bs.modal', function () {
            //正在选择下一步还是返回
            status_now = DISPLAY_STATUS.NEXT_OR_RETURN;
    });
    $('#myModal2').on('hide.bs.modal', function () {
            status_now = DISPLAY_STATUS.DEFAULT;
    });

    //提交试卷
    $("#submitQuestions").click(function() {
        if(writeAnswer()==false){
            setTimeout(function(){
                $('#myModal').modal('hide');
            },10);
            return;
        }
        var problem_no_finish = false;
        for(let i = 0; i < checkQues.length; i++){
            // Why 7 ?
            if(checkQues[i].answer[7] == -1){
                alert("第" + (i + 1) +"题未作答");
                problem_no_finish = true;
                break;
            }
        }
        if(problem_no_finish){
            setTimeout(function(){
                $('#myModal').modal('hide');
            },10);
            return;
        }
        var data = JSON.stringify(checkQues);
        
        $("#submitTip").empty();
        $("#submitTip").append("是否确认提交？");
        
        
    });
    $("#cancleSubmit").click(function() {
        //展示模态框
        $('#myModal').modal('hide');
    });

    

    $("#confirmSubmit").click(function() {
        let post_data = {
            'group_id' : g_group_id,
            'hash_code' : g_hash_code,
            'problem' : checkQues,
        }
        let data = JSON.stringify(post_data);
        let post_url = '/answer';
        
        
        $.ajax({
            type: 'POST',
            url: post_url,
            data: data,
            dataType: 'text',
            async: false, // 注意这里改为异步才能成功赋值！
            success: function(data) {
                    //后端传回重复发送的状态码
                    if(data == '2'){
                        alert("请不要重复发送");
                    }

                    $("#myModal").modal("hide");
                    $("#myModal2").modal("show");
            },
            error: function(XMLResponse) {
                alert('提交失败，请重试');
            }
        });
        $("#refresh").click(function() {
            location.reload("GET");
        });
        $("#returnToIndex").click(function() {
            location.href = "/";
        })
    })
    $("#post_feedback").click(function() {
        var data = {}
        data['problem_id'] = checkQues[g_activeQuestion_id].actualId;
        data['content'] = $('#other_error')[0].value;
        var post_data = JSON.stringify(data);
        var post_url = '/feedback';
        $.ajax({
            type: 'POST',
            url: post_url,
            data: post_data,
            dataType: 'json',
            async: false, // 注意这里改为异步才能成功赋值！
            success: function(data) {
                alert('提交成功');
                $("#myModal3").modal("hide");
            },
            error: function(XMLResponse) {
                alert('提交失败，请重试')
            }
        });
        $("#refresh").click(function() {
            location.reload("GET");
        });
        $("#returnToIndex").click(function() {
            location.href = "/"
        })
    })
    //进入上一题
    $("#lastQuestion").click(function() {
        if(writeAnswer()==false){
            return;
        }
        if (g_activeQuestion_id < 1) {
            g_activeQuestion_id = 0;
            return;
        }
        showQuestion(g_activeQuestion_id - 1)
        
    });
    //进入下一题
    $("#nextQuestion").click(function() {
        if(writeAnswer()==false){
            return;
        }
        if ((g_activeQuestion_id + 1) != q_data.problem_list.length) setTimeout(showQuestion,200,g_activeQuestion_id + 1);
        else
        //最后一题，显示提交答案model
        {
            return;
            $("#submitQuestions").click();
            $('#myModal').modal('show');
        }
        //setTimeout(showQuestion,500,g_activeQuestion_id);
        showQuestion(g_activeQuestion_id)
        
    });
    
    $("#refresh_problem").click(function() {
        location.reload("GET");
    })

    window.setInterval(addTime, 100);
    
    $("#openCard").click();
    $(document).keydown(function(event) {
        switch (event.keyCode) {
            //右键
            case 0x27:
                if(status_now == DISPLAY_STATUS.DEFAULT)
                    {}
                break;
            //左键
            case 0x25:
                if(status_now == DISPLAY_STATUS.DEFAULT)
                    {}
                break;
            //y
            case 89:
                switch (status_now){
                    case DISPLAY_STATUS.DEFAULT:
                        $('#item0').click();
                        break;
                    case DISPLAY_STATUS.CONFIRM_SUBMIT:
                        $("#confirmSubmit").click();
                        break;
                    case DISPLAY_STATUS.NEXT_OR_RETURN:
                        $("#refresh").click()
                        break;
                }
                break;
                
            //n
            case 78:
                switch (status_now){
                    case DISPLAY_STATUS.DEFAULT:
                        $('#item1').click();
                        break;
                    case DISPLAY_STATUS.CONFIRM_SUBMIT:
                        $("#myModal").modal("hide");
                        break;
                    case DISPLAY_STATUS.NEXT_OR_RETURN:
                        $("#returnToIndex").click()
                        break;
                }
                break;
            
            
        }
    })
})