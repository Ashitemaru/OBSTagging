#!/usr/bin/env python3
# coding:utf8
'''
    负责前端展示逻辑，处理get，post请求。
    路由请查看url.py


    业务逻辑为 三层
    main_handler.py 前端展示逻辑 
    data.py 数据处理相关函数
    db.py 数据库增删改查
'''
import tornado
from tornado.web import RequestHandler
from tornado.options import options
import logging
import time
import json
import os.path

from hashlib import md5
import threading
from handlers.data import DataProvider



data_provider = DataProvider()

#基类，提供通用method
class BaseHandler(RequestHandler):
    def get_current_user(self):
        #从session中获取username
        return self.get_secure_cookie("username")

#首页
class MainHandler(BaseHandler):
    #未登录无法执行下列方法，自动跳转到login页面
    @tornado.web.authenticated
    def get(self):
        feed_dict = {}
        username = tornado.escape.xhtml_escape(self.current_user)
        user_id = int(self.get_secure_cookie("user_id").decode())
        feed_dict['username'] = username
        feed_dict['num_group'] = data_provider.get_group_num(user_id)
        feed_dict['pass_test'] = data_provider.get_pass_test(user_id)
        feed_dict['can_start'] = data_provider.check_passed_test(user_id)
        #print(feed_dict)
        feed_dict['faq'] = json.load(open(os.path.join(os.path.dirname(__file__), '../statics/faq.json')))
        feed_dict['progress'] = data_provider.get_progress_all()
        #页面展示
        self.render("index.html", **feed_dict)

#登录页
class LoginHandler(RequestHandler):
    def get(self):
        action = self.get_argument("action", None)
        if action == "logout":
            #清楚session信息
            self.clear_cookie("username")
            self.clear_cookie("user_id")
            self.render("login.html", info_msg="注销成功!")
        elif action == "regsuccess":
            self.render("login.html", info_msg="注册成功!")
        else:
            self.render("login.html")

    #发送登录请求
    def post(self):
        try:
            name = self.get_argument("name")
            passwd = self.get_argument("pass")
        except tornado.web.MissingArgumentError:
            self.render("login.html", alert_msg="参数错误")
            return
        res = True

        res, error_msg, user_id = data_provider.validate_user(name, passwd)
        if res is True:
            self.set_secure_cookie("username", name)
            self.set_secure_cookie("user_id", str(user_id))
            self.redirect("/")
        else:
            self.render("login.html", alert_msg=error_msg)

#修改信息页
class InfoHandler(RequestHandler):
    def get(self):
        action = self.get_argument("action", None)
        if action == "info":
            user_id = int(self.get_secure_cookie("user_id").decode())
            user_info = data_provider.get_user_info(user_id)
            #print('aaaa',user_info)
            u_id, u_name, u_email, u_studentid, u_wechat, u_alipay, u_valid_name = user_info
            feed_dict = {}
            feed_dict['u_name'] = u_name
            feed_dict['u_email'] = u_email
            feed_dict['u_studentid'] = u_studentid if u_studentid != None else ''
            feed_dict['u_valid_name'] = u_valid_name if u_wechat != None else ''
            feed_dict['u_wechat'] = u_wechat if u_wechat != None else ''
            feed_dict['u_alipay'] = u_alipay if u_alipay != None else ''
            self.render("info.html", **feed_dict)

    #发送修改请求
    def post(self):
        user_id = int(self.get_secure_cookie("user_id").decode())
        try:
            #name = self.get_argument("username")
            # passwd = self.get_argument("password")
            email = self.get_argument("email")
            student_id = self.get_argument("student_id")
            wechat = self.get_argument("wechat")
            alipay = self.get_argument("alipay")
            valid_name = self.get_argument("valid_name")
        except tornado.web.MissingArgumentError:
            self.render("info.html", alert_msg="参数错误!")
            return

        data_provider.modify_user(user_id, email, student_id, wechat, alipay, valid_name)
        self.redirect("/")

class RegisterHandler(RequestHandler):
    def get(self):
        self.render("register.html")

    #发送注册请求
    def post(self):
        try:
            name = self.get_argument("username")
            passwd = self.get_argument("password")
            email = self.get_argument("email")
            student_id = self.get_argument("student_id")
            wechat = self.get_argument("wechat")
            alipay = self.get_argument("alipay")
            valid_name = self.get_argument("valid_name")
        except tornado.web.MissingArgumentError:
            self.render("register.html", alert_msg="参数错误!")
            return

        data_provider.add_user(name, passwd, email, student_id, valid_name, wechat, alipay)
        self.redirect("/login?action=regsuccess")


#用于查询用户名是否已注册
class CheckNameHandler(RequestHandler):
    def post(self):
        name = self.get_argument("username")
        res = data_provider.check_name(name)
        self.write('{"status": "%s"}' % ("success" if res else "failed"))


class LabelHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):

        # get user_id
        username = tornado.escape.xhtml_escape(self.current_user)
        user_id = int(self.get_secure_cookie("user_id").decode())

        feed_dict = {}
        feed_dict['username'] = username

        #problem_content为题面内容的json
        feed_dict['problem_content'], hash_code = data_provider.get_problem(user_id)
        print (feed_dict)

        self.set_secure_cookie("hash_code", hash_code)

        #没有符合条件的题返回None
        if feed_dict['problem_content'] == None:
            feed_dict['problem_content'] = 'END'
        for i in feed_dict:
            print (i)
        self.render("label_sememe.html", **feed_dict)

class TestHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):

        # get user_id
        username = tornado.escape.xhtml_escape(self.current_user)
        user_id = int(self.get_secure_cookie("user_id").decode())

        feed_dict = {}
        feed_dict['username'] = username

        #1表示不是测试题
        feed_dict['test_type'] = 1

        #problem_content为题面内容的json
        feed_dict['problem_content'], hash_code = data_provider.get_test_problem(user_id)

        self.set_secure_cookie("hash_code", hash_code)

        #没有符合条件的题返回None
        if feed_dict['problem_content'] == None:
            feed_dict['problem_content'] = 'END'
        self.render("test_sememe.html", **feed_dict)

    @tornado.web.authenticated
    def post(self):
        user_id = int(self.get_secure_cookie("user_id").decode())
        data = json.loads(self.request.body.decode('utf-8'))
        answers = data

        if self.get_secure_cookie("hash_code") == None:
            self.write("2")
            return

        hash_code = self.get_secure_cookie("hash_code").decode()

        data_provider.pass_test(user_id)
        self.clear_cookie("hash_code")




#接受答案
# format:
# {
#     'group_id': 0,
#     'problem':[
#         {
#             'problem_id' : 0,
#             'answer' : 3
#         },
#         {
#             'problem_id' : 1,
#             'answer' : 2
#         }
#     ]
# }

class ChangeAnswerHandler(BaseHandler):
    @tornado.web.authenticated
    def post(self):
        user_id = int(self.get_secure_cookie("user_id").decode())
        data = json.loads(self.request.body.decode('utf-8'))
        answers = data

        if self.get_secure_cookie("hash_code") == None:
            self.write("2")
            return

        hash_code = self.get_secure_cookie("hash_code").decode()

        print (answers)

        #保存答案并更新进度
        retcode = data_provider.modify_answer(user_id, answers, hash_code)
        self.clear_cookie("hash_code")

        #成功
        if retcode == 1:
            #data_provider.inc_group_num(user_id)
            self.write("1")
        #user repent sending
        elif retcode == 2:
            self.write("2")
        else:
            #失败
            self.write("0")

class SaveAnswerHandler(BaseHandler):
    @tornado.web.authenticated
    def post(self):
        user_id = int(self.get_secure_cookie("user_id").decode())
        data = json.loads(self.request.body.decode('utf-8'))
        answers = data

        if self.get_secure_cookie("hash_code") == None:
            self.write("2")
            return

        hash_code = self.get_secure_cookie("hash_code").decode()

        #保存答案并更新进度
        retcode = data_provider.save_answer(user_id, answers, hash_code)
        self.clear_cookie("hash_code")

        #成功
        if retcode == 1:
            #data_provider.inc_group_num(user_id)
            self.write("1")
        #user repent sending
        elif retcode == 2:
            self.write("2")
        else:
            #失败
            self.write("0")


#接受反馈
class FeedBackHandler(BaseHandler):
    @tornado.web.authenticated
    def post(self):
        user_id = int(self.get_secure_cookie("user_id").decode())
        data = json.loads(self.request.body.decode('utf-8'))
        data['user_id'] = user_id
        data_provider.save_feedback(data)
        self.write('1')




#接受反馈
class AdminHandler(BaseHandler):


    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    #@tornado.web.authenticated
    def get(self):
        # user_id = int(self.get_secure_cookie("user_id").decode())
        # if user_id not in [101]:
        #     self.write('1')
        #     return
        users_info = data_provider.get_user_info(101)
        users_info_json = json.dumps(users_info).encode('utf-8').decode('unicode_escape')

        self.write(users_info_json)

    def post(self):
        data = json.loads(self.request.body)
        action = data['action']
        if action == "get_user_answer":
            pass

        self.write(users_info_json)

#接受反馈
class OutPutHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        user_id = int(self.get_secure_cookie("user_id").decode())
        print(user_id)
        '''
        if user_id not in [1,2]:
            self.write('权限错误')
            return
        '''
        data_provider.outputfile()
        # self.write('输出完成,点击下载文件:<a href=\"/static/answers.json\">结果文件</a>')
        with open("statics/answers.json") as answer_file:
            answer_dicts = json.loads(answer_file.read())
        
        data_dict = {'answer_data': answer_dicts, 'total_num': len(answer_dicts)}
        self.render("ans_output.html", **data_dict)


class GetAllUserHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        user_id = int(self.get_secure_cookie("user_id").decode())
        res = data_provider.get_all_user()
        self.write(json.dumps(res))

class OutFeedbackHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        user_id = int(self.get_secure_cookie("user_id").decode())
        print (user_id)
        '''
        if user_id not in [1,2]:
            self.write('权限错误')
            return
        '''
        res = data_provider.get_feedback()
        res.sort(key=lambda item: item[1])
        with open("./statics/feedback.json", "w") as f:
            f.write(json.dumps(res))
        feed_dict = {'feedbacks': res, 'total_num': len(res)}
        self.render("feedback.html", **feed_dict)

class GetAnswerHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self, *args):
        user_id = int(self.get_argument("user_id"))
        problem_id = int(self.get_argument("problem_id"))
        problem_answer = data_provider.get_problem_info(user_id, problem_id)
        problem_answer =json.dumps(problem_answer)
        feed_dict={'problem_content': problem_answer, 'problem_id': problem_id, 'user_id': user_id}
        # feed_dict = {'problem_id': problem_id, 'problem_content': problem_answer['problem_content'], 'answer': problem_answer['answer'], 'user_id': user_id}
        return self.render("answer.html", **feed_dict)



class RootHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        # get user_id
        username = tornado.escape.xhtml_escape(self.current_user)
        user_id = int(self.get_secure_cookie("user_id").decode())

        userid = int(self.get_argument("userid"))
        begin = int(self.get_argument("begin"))
        end = int(self.get_argument("end"))

        feed_dict = {}
        feed_dict['username'] = username
        feed_dict['test_type'] = 0

        isrange = True
        if(end<=begin):
            self.write("参数错误")
            return

        #problem_content为题面内容的json
        feed_dict['problem_content'], hash_code, feed_dict['problem_range'] = data_provider.get_problem_root(user_id, target_id, isrange, begin, end - begin, bnid)

        self.set_secure_cookie("hash_code", hash_code)

        #没有符合条件的题返回None
        if feed_dict['problem_content'] == -1:
            self.write("没有合适的题目")
            return

        self.render("modify_sememe.html", **feed_dict)


class ModifyHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):

        # get user_id
        username = tornado.escape.xhtml_escape(self.current_user)
        user_id = int(self.get_secure_cookie("user_id").decode())

        begin = int(self.get_argument("begin"))
        end = int(self.get_argument("end"))
        bnid = self.get_argument("bnid")

        feed_dict = {}
        feed_dict['username'] = username
        #0表示不是测试题
        feed_dict['test_type'] = 0

        if(bnid=='-1'):
            isrange = True
            if(end<=begin):
                self.write("参数错误")
                return
        elif(begin<0 or end<0):
            isrange = False
        else:
            self.write("参数错误")
            return

        #problem_content为题面内容的json
        feed_dict['problem_content'], hash_code, feed_dict['problem_range'] = data_provider.get_problem_modify(user_id, isrange, begin, end-begin, bnid)


        self.set_secure_cookie("hash_code", hash_code)

        #没有符合条件的题返回None
        if feed_dict['problem_content'] == -1:
            self.write("没有合适的题目")
            return

        self.render("modify_sememe.html", **feed_dict)

    @tornado.web.authenticated
    def post(self):
        user_id = int(self.get_secure_cookie("user_id").decode())
        data = json.loads(self.request.body.decode('utf-8'))
        answers = data

        if self.get_secure_cookie("hash_code") == None:
            self.write("2")
            return

        hash_code = self.get_secure_cookie("hash_code").decode()

        #保存答案并更新进度
        retcode = data_provider.modify_answer(user_id, answers, hash_code)
        self.clear_cookie("hash_code")

        #成功
        if retcode == 1:
            #data_provider.inc_group_num(user_id)
            self.write("1")
        #user repent sending
        elif retcode == 2:
            self.write("2")
        else:
            #失败
            self.write("0")