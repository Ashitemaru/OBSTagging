
var timeState = true; //时间状态 默认为true 开启时间
var questions = [];
var questioned = 0; //
var checkQues = []; //已做答的题的集合
var g_group_id = 0;
var g_hash_code = '';
var g_activeQuestion_id = 0; //当前操作的考题编号
var g_activeTreeGroupId = 0;
var g_MaxTreeId = 0;
var g_MaxTreeGroupId = 0;
var g_test_type = 0;
var DISPLAY_STATUS = {
    "DEFAULT": 0,
    "CONFIRM_SUBMIT": 1,
    "NEXT_OR_RETURN": 2
};

var g_is_error_state = false;

var status_now = DISPLAY_STATUS.DEFAULT;
var start_time_flag = 0;

var g_tree_groups_list = [];

var tree_number_one_page = 300;

var g_is_multiple_choice = true;


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





//json of tree to svg html
function gen_tree(tree_json, tree_num) {
    
    // var svg_content = "<div class=\"treespan\" id=\"treespan_" + tree_num + "\"><span class=\"item_id\">" + (tree_num + 1) + ".</span><svg class=\"treesvg\" id=\"tree" + tree_num + "\" width=" + width + " height=" + height + "> <g transform='translate(0,10)'> <g class='links'></g><g class='nodes'></g> <g class='node_labels'></g> <g class='link_labels'></g></g></svg></div>"
    var svg_content = "<div class=\"col-md-6 treespan\" id=\"treespan_" + tree_num + "\"> \
                        <span class=\"item_id\">" + (tree_num + 1) + ".</span> \
                        <div class=\" treesvg\" id=\"tree" + tree_num + "\" ></div> \
                        </div>";
    return ['', svg_content, '', '']

    return [root, svg_content, height, width];
}



function processBabelInfo(babel_info_str) {
    console.log(babel_info_str);
    babel_info_str = babel_info_str.split('\'')[1];
    babel_info_str = window.atob(babel_info_str);
    babel_info_tuple = babel_info_str.split('@');
    wn = babel_info_tuple[0];
    bn = babel_info_tuple[1];
    POS = babel_info_tuple[2];
    englishWord = babel_info_tuple[3].replace(/-/g, ", ");
    chineseWord = babel_info_tuple[4].replace(/-/g, ", ");
    chineseWord = decodeURIComponent(window.escape(chineseWord));
    englishGloss = babel_info_tuple[5].replace(/-/g, " ");
    chineseGloss = babel_info_tuple[6].replace(/-/g, " ");
    chineseGloss = decodeURIComponent(window.escape(chineseGloss));
    
    englishGloss = englishGloss.split('\t');
    chineseGloss = chineseGloss.split('\t');

    englishWord = englishWord.slice(0,200);
    chineseWord = chineseWord.slice(0,200);

    POS2POS = {
        'n':'名词',
        'a':'形容词',
        'r':'副词',
        'v':'动词',
    }
    POS = POS2POS[POS];
    html_str = "<p id=\"synset_info\" class=\"affix\">" + 
                // "WordNetID:&nbsp;&nbsp;" + wn + "<br>" +
                "BabelNetID: <a href=https://babelnet.org/synset?word=" + bn + "&details=1&lang=EN target=\"_Blank\">" + bn + "</a><br>" + 
                "词性:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + POS + "<br>" + 
                "英文词:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + englishWord + "<br>" 
                // + 
                // "中文词:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + chineseWord + "<br>"
                ;

    if(englishGloss.length > 0){
        html_str += '英文定义:(定义出现不一致时，以第一句为准) <br>';
    }
    let MAXchar = 200;
    //the maximum number of display gloss is 3
    for(let i = 0, charcount = 0; i < 3 && i < englishGloss.length&&charcount<MAXchar; i++){
        html_str += '&nbsp;&nbsp;&nbsp;' + englishGloss[i] + '<br>';
        charcount += englishGloss[i].length;
    }

    // if(chineseGloss.length > 0){
    //     html_str += '中文定义: <br>';
    // }
    // //the maximum number of display gloss is 5
    // for(let i = 0, charcount = 0; i < 3 && i < chineseGloss.length&&charcount<MAXchar; i++){
    //     html_str += '&nbsp;&nbsp;&nbsp;' + chineseGloss[i] + '<br>';
    //     charcount += chineseGloss[i].length;
    // }
    html_str += '</p>';


    return html_str

}

function divTreeListPre3(tree_list) {
    let res = [];
    let count = 0;
    g_MaxTreeId = tree_list;
    while(count < tree_list.length){
        if(count % tree_number_one_page == 0){
            res.push([]);
        }
        let index = parseInt(count / tree_number_one_page); 
        res[index].push(tree_list[count]);
        
        count++;
    }
    g_MaxTreeGroupId = res.length - 1;
    return res;
}


function refreshTreeCss() {
    let nowAnswerId = checkQues[g_activeQuestion_id].answer;
    for(var i=0; i < tree_number_one_page; i++){
        if(nowAnswerId.indexOf(g_activeTreeGroupId * tree_number_one_page + i) != -1){
            $("#treespan_" + i).attr("class","active_tree_span");
            //$("#treespan_" + i).class("active_tree_span");
        }else{
            $("#treespan_" + i).attr("class","tree_span");
            //$("#treespan_" + i).class("tree_span");
        }
    }
    if(g_activeQuestion_id == 0){
        $('#lastQuestion').attr("class","btn disabled col-5");
    }else{
        $('#lastQuestion').attr("class","btn btn-primary col-5");
    }

    if(g_activeQuestion_id == 9){
        $('#nextQuestion').attr("class","btn disabled col-5");
    }else{
        $('#nextQuestion').attr("class","btn btn-danger col-5");
    }

}


function show3Tree(id) {
    g_activeTreeGroupId = id;
    let tree_json = g_tree_groups_list[id];
    tree_json = tree_json.splice(0,25);
    tree_json.push({
        tree_id : -1,
        tree_json: tree_json[0].tree_json,
    })
    var tree_html = ["",""];
    var root_array = [],
        height_array = [],
        width_array = [];
    for (let i = 0; i < tree_json.length; i++) {
        var res = gen_tree(tree_json[i].tree_json, i);
        root_array.push(res[0]);
        tree_html[i%2] += res[1];
        height_array.push(res[2]);
        width_array.push(res[3]);
    }
    
    $("#div_toop").remove();
    
    console.log(tree_html);
    $(".question_title").append("<div id=\"div_toop\"><p>共 <b>" + 
                                tree_json.length + "</b> 个选项</p><div class=\"row rowcss\"> " + "<div  class=\"col-md-6\"> "+
                                tree_html[0] + 
                                "</div> \
                                <div class=\"col-md-6\">  " +
                                tree_html[1] +
                                "</div></div></div>"); //将要显示的内容添加到 新建 div标签中 并追加到 body 中
    
    let synset_info_height = $('#synset_info').height() + 10;
    $("#div_toop").css("margin-top",synset_info_height+"px");
    for (let i = 0; i < root_array.length; i++) {
        if( i != root_array.length - 1){
            //draw_tree(root_array[i], height_array[i], width_array[i], i);
            console.log(decodeURIComponent(tree_json[i].tree_json));
            // d3.select('#treespan_' + i).attr('fill', 'gainsboro').graphviz()
            // .fade(false)
            // .renderDot(decodeURIComponent(tree_json[i].tree_json));   
            d3.select('#treespan_' + i).graphviz().tweenShapes(false).tweenPaths(false).zoom(false).width('450px').fit(true)
            .renderDot(decodeURIComponent(tree_json[i].tree_json));

        }else{
            //最后一个即没有答案
            $('#treespan_' + i).html('<span class=\"item_id\">' + (root_array.length) + '.</span><p class = \"no_answer\">没有答案</p>')    
        }
        
        
        checkQues[g_activeQuestion_id].item_num = tree_json.length;

        //dynamic element can only bind using ON method
        $('#tree' + i).unbind("click");
        $(document).off("click",'#treespan_' + i).on("click",'#treespan_' + i,function(){
            console.log($(this).attr('id'));
            itemId = $(this).attr('id').split("_")[1];
            if(g_is_multiple_choice==false||itemId==root_array.length - 1){
                checkQues[g_activeQuestion_id].answer = [];
            }
            //多选模式选择了答案，自动去掉没有答案选项
            if(g_is_multiple_choice==true&&checkQues[g_activeQuestion_id].answer.indexOf(root_array.length - 1)!=-1&&itemId!=root_array.length - 1){
                checkQues[g_activeQuestion_id].answer = [];   
            }
            //多选模式取消答案
            if(g_is_multiple_choice==true&&checkQues[g_activeQuestion_id].answer.indexOf(parseInt(itemId))!=-1){
                checkQues[g_activeQuestion_id].answer.splice(checkQues[g_activeQuestion_id].answer.indexOf(parseInt(itemId)),1);  
                refreshTreeCss();
                return;
            }
            checkQues[g_activeQuestion_id].answer.push(parseInt(g_activeTreeGroupId * tree_number_one_page + itemId));
            refreshTreeCss();
            //$("#nextQuestion").click();
        });
        $(document).off("mouseover",'#treespan_' + i).on("mouseover",'#treespan_' + i,function(){
            
            itemId = parseInt(g_activeTreeGroupId * tree_number_one_page + $(this).attr('id').split("_")[1]);
            $("#treespan_" + itemId).attr("class","mouse_over_tree");
            
        });
        $(document).off("mouseout",'#treespan_' + i).on("mouseout",'#treespan_' + i,function(){
           
            itemId = parseInt(g_activeTreeGroupId * tree_number_one_page + $(this).attr('id').split("_")[1]);
            $("#treespan_" + itemId).attr("class","tree_span");
            refreshTreeCss();
        });
        console.log('click tree ' + i);
        // //bind click event
        // $('#tree' + i).click(function(){
        //     checkQues[g_activeQuestion_id].answer = (id * 3 + i);
        //     refreshTreeCss();
        //     console.log('click tree' + i);
        // })
    }
    refreshTreeCss();

}

//展示考卷信息
function showQuestion(id) {

    //关闭多选模式
    g_is_multiple_choice = true;

    $(".questioned").text(id + 1); // 显示当前题号
    $("#problem_progress").css('width', (id + 1) * 10 + '%')
    questioned = (id + 1) / q_data.problem_list.length 
    if (g_activeQuestion_id != undefined) {
        $("#ques" + g_activeQuestion_id).removeClass("question_id").addClass("active_question_id");
    } // 把当前选中的题目的题号方框加上已经过选择过的类型
    g_activeQuestion_id = id;
    $(".question").find(".question_info").remove(); //移除所有选项
    let question_display = q_data.problem_list[id].babel_info;
    question_display = processBabelInfo(question_display);
    let question_tree_list = q_data.problem_list[id].tree_json_list;

    g_tree_groups_list = divTreeListPre3(question_tree_list);
    
    

    // 显示题面
    $(".question_title").html(question_display); // 显示题目信息

    show3Tree(0);

    //显示树选项

    $(".question").attr("id", "question" + id); // 设置题目的id
    $("#ques" + id).removeClass("active_question_id").addClass("question_id"); // 设置把当前题目的答题卡题号方框
    
    $('polygon').attr('fill','gainsboro');
}
/*答题卡*/
function answerCard() {
    $(".question_sum").text(q_data.problem_list.length); // 
    for (let i = 0; i < q_data.problem_list.length; i++) {
        var questionId = "<li id='ques" + i + "'onclick='saveQuestionState(" + i + ")' class='questionId'>" + (i + 1) + "</li>";
        $("#answerCard ul").append(questionId); // 把题号方框放到答题卡这个div中
    }
}
/*选中考题*/
var Question;

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
    showQuestion(clickId);
    $('.sememe').mouseenter();
}

function calTime() {
    checkQues[g_activeQuestion_id].cost_time += 0.1;
}

// 主函数：当 DOM（文档对象模型） 已经加载，并且页面（包括图像）已经完全呈现时，会发生 ready 事件
$(function() {
    $(".middle-top-left").width($(".middle-top").width() - $(".middle-top-right").width())
    $(".problem_progress-left").width($(".middle-top-left").width() - 200);
    g_test_type = $('#q_type').attr('value');
    //标注结束
    if($('#q_data').attr('value') == 'END'){
        if(g_test_type != 1)
            alert("感谢您的努力，您的标注任务已结束");
        else
            alert("您的测试已结束，请进行正式标注");
        location.href = "/";
    }
    q_data = JSON.parse($('#q_data').attr('value'));
    console.log(q_data);
    $('#q_data').remove();
    
    g_group_id = q_data.group_id;
    g_hash_code = q_data.hash_code;
    let problem_list = q_data.problem_list;

    // 初始化答案信息
    for (let i = 0; i < problem_list.length; i++) {
        var answerTMP = {};
        answerTMP.id = i; //获取当前考题的编号
        answerTMP.actualId = problem_list[i].problem_id;
        for (let j = 0; j < problem_list[i].answer.length; j++) {
            if(problem_list[i].answer[j] == -2){
                problem_list[i].answer[j] = problem_list[i].tree_json_list.length
            }
        }
        answerTMP.answer = problem_list[i].answer;
        answerTMP.cost_time = 0.0;
        checkQues.push(answerTMP);
    }
    progress(); // 设置进度条
    answerCard(); // 显示最下方的答题卡
    showQuestion(0); // 显示第一题
    
    /*实现进度条信息加载的动画*/
    var str = '';
    /*开启或者停止时间*/
    $(".time-stop").click(function() {
        timeState = false;
        $(this).hide();
        $(".time-start").show();
    });
    $(".time-start").click(function() {
        timeState = true;
        $(this).hide();
        $(".time-stop").show();
    });
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
        var problem_no_finish = false;
        for(let i = 0; i < checkQues.length; i++){
            
            for (let j = 0; j < checkQues[i].answer.length; j++) {
                if(checkQues[i].answer[j] == checkQues[i].item_num - 1){
                    checkQues[i].answer[j] = -2;
                }
                
            }
            if(checkQues[i].answer.length == 0){
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
        let post_url = '/modify';
        if (g_test_type == 1) post_url = '/test'
        
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
            $('#final_close').click();
        });
        $("#returnToIndex").click(function() {
            location.href = "/";
        })
    })
    //进入上一题
    $("#lastQuestion").click(function() {
        if (g_activeQuestion_id < 1) {
            g_activeQuestion_id = 0;
            return;
        }
        showQuestion(g_activeQuestion_id - 1)
        
    });
    //进入下一题
    $("#nextQuestion").click(function() {
        if ((g_activeQuestion_id + 1) != q_data.problem_list.length) setTimeout(showQuestion,500,g_activeQuestion_id + 1);
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
    //进入上一 tree group
    $("#lastTree").click(function() {
        let temp = g_activeTreeGroupId - 1;
        show3Tree(temp > -1 ? temp:0 )
        
    });
    //进入下一 tree group
    $("#nextTree").click(function() {
        let temp = g_activeTreeGroupId + 1;
        show3Tree(temp <= g_MaxTreeGroupId ? temp:g_MaxTreeGroupId )
    });

    $('#enter_begin_end').click(function(){
        start = parseInt($('#id_begin')[0].value);
        end = parseInt($('#id_end')[0].value);
        bnid = -1
        location.href = "/modify?begin=" + start + '&end=' + end + '&bnid=' + bnid;
    })

    $('#enter_bnid').click(function(){
        start = -1;
        end = -1;
        bnid = $('#id_bnid')[0].value;
        location.href = "/modify?begin=" + start + '&end=' + end + '&bnid=' + bnid;
    })

    $("#noAnswer").click(function() {
        checkQues[g_activeQuestion_id].answer = -2;
        $("#nextQuestion").click();
    });
    $("#refresh_problem").click(function() {
        location.reload("GET");
    })
    $("#turnOnMultiple").click(function() {
        g_is_multiple_choice = true;
    })

    $(window).scroll(function() {
        let scrollLen = $(window).scrollTop();
        let hei = 170 - scrollLen;
        if(hei<0){
            hei = 0;
        }
        $(".affix").css("top",hei+"px");
    });

    window.setInterval(calTime, 100);
    
    $("#openCard").click();
    $(document).keydown(function(event) {
        switch (event.keyCode) {
            //右键
            case 0x27:
                if(status_now == DISPLAY_STATUS.DEFAULT)
                    $('#nextTree').click();
                break;
            //左键
            case 0x25:
                if(status_now == DISPLAY_STATUS.DEFAULT)
                    $('#lastTree').click();
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