#!/usr/bin/env Python
# coding=utf-8
"""
the url structure of website
"""

import sys     #utf-8，兼容汉字
import tornado
from tornado.options import define, options

from handlers.main_handler import *

import imp
imp.reload(sys)

url = [
            (r'/', MainHandler),
            (r'/label', LabelHandler),
            (r'/login', LoginHandler),
            (r'/info', InfoHandler),
            (r'/register', RegisterHandler),
            (r'/check_name', CheckNameHandler),
            (r'/answer', SaveAnswerHandler),
            (r'/change', ChangeAnswerHandler),

            #(r'/tree', GetTreeHandler),
            (r'/outputt', OutPutHandler), # 下载answer表，查看答题信息
            (r'/outputf', OutFeedbackHandler), # 查看反馈
            (r'/feedback', FeedBackHandler),
            (r'/admin', AdminHandler),
            # (r'/test', TestHandler),
            (r'/modify', ModifyHandler),
            (r'/rootall', RootHandler),
            (r'/outputu', GetAllUserHandler),
            #(r'/resettest', ResetTestHandler)

            (r'/getanswer(.*)', GetAnswerHandler), # 查看答题页面 /(?P<problem_id>\d+)/(?P<user_id>\d+)
            
            #(r'/statics/(.*)', tornado.web.StaticFileHandler, {'path': './statics/'}),

]