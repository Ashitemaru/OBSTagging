#!/usr/bin/env python3
#coding:utf-8
'''
	用于数据处理的过程
'''
import os
import json
import logging
import hashlib
import time

from handlers.db import DB
from tornado.options import options
import threading
import pandas as pd

class DataProvider:
	def __init__(self):
		#打开数据库
		self.db = DB(os.path.join(os.path.dirname(__file__), '../dbn.db'))

	def check_passed_test(self,user_id):
		res = self.db.select('users', keys = ['pass_test'], conditions = {'id':user_id})
		if res[0][0] == 1:
			return 1
		else:
			return 1

	def pass_test(self, user_id):
		self.db.update('users',{'pass_test' : 1}, {'id' : user_id})

	def get_pass_test(self, user_id):
		res = self.db.select('users', keys = ['pass_test'], conditions = {'id':user_id})[0][0]
		return res

	def  get_all_user(self):
		res = self.db.select('users', keys = ['name', 'pass', 'email', 'student_id', 'valid_name', 'wechat', 'alipay'])
		return res

	def inc_group_num(self, user_id):
		self.db.update('users',{'group_num' : self.get_group_num(user_id) + 1}, {'id' : user_id})

	def get_group_num(self, user_id):
		res = self.db.select('users', keys = ['group_num'], conditions = {'id':user_id})[0][0]
		return res

	def validate_user(self, name, passwd):
		res = self.db.select('users', keys=['pass', 'id'], conditions={'name': name})
		if len(res) == 0:
			return False, "用户名不存在", None
		elif not res[0][0] == passwd:
			return False, "密码错误.", None
		else:
			return True, None, res[0][1]

	def add_user(self, name, passwd, email, student_id, valid_name, wechat, alipay):
		self.db.insert('users', {'name': name, 'pass': passwd, 'email': email, 'student_id': student_id, 'valid_name':valid_name, 'wechat':wechat, 'alipay':alipay})

	def modify_user(self, user_id, email, student_id, wechat, alipay, valid_name):
		self.db.update('users', {'email': email, 'student_id': student_id, 'wechat':wechat, 'alipay':alipay, 'valid_name':valid_name}, conditions={'id': user_id})

	def get_user_info(self, user_id):
		res = self.db.select('users', keys=['id','name','email','student_id','wechat','alipay','valid_name'], conditions = {'id':user_id})[0]
		return res

	def check_name(self, name):
		res = self.db.select('users', conditions={'name': name})
		return len(res) == 0

	#get user's id using his name
	def get_id_by_name(self, name):
		return self.db.get_id_by_name(name)

	def get_progress(self, user_id):
		return self.db.get_user_progress(user_id)

	def get_problem(self,user_id):
		self.recoverzombie()

		# 获取该user可做题目的problem id list
		problem_list = self.db.get_problem(user_id)

		if problem_list == []:
			return None

		# group_id用于区分题目类型
		group_id, first_problem_id = problem_list[0][:2]

		post_data = {}
		post_data['group_id'] = group_id
		post_data['problem_list'] = []

		# 存储答案时验证题号是否被篡改
		hash_string = b'%d + %d'%(int(first_problem_id), user_id)
		post_data['hash_code'] = hashlib.md5(hash_string).hexdigest()
		hash_code = post_data['hash_code']

		for item in problem_list:
			group_id, problem_id, problem_content = item
			self.db.update('problem', updates = {'state' : 1}, conditions = {'problem_id' : problem_id})
			self.db.insert('zombie', {'problem_id':problem_id,'timestamp':int(time.time())})
			problem_content = json.loads(problem_content)
			problem = {'problem_id' : problem_id, 'problem_content': problem_content}
			post_data['problem_list'].append(problem)

		problem_json = json.dumps(post_data).encode('utf-8').decode('unicode_escape')
		return problem_json, hash_code

	def get_problem_root(self, user_id, target_id, isrange, begin, end, bnid):
		
		if(isrange):
			problem_list = self.db.get_problem_by_user(target_id, begin, end)
		else:
			problem_list = self.db.get_problem_by_user_and_bnid(target_id, bnid)

		problem_range = self.db.get_problem_num_by_user(target_id)

		if problem_list == []:
			return -1, 'None', None

		group_id = -1

		post_data = {}
		post_data['group_id'] = group_id
		post_data['problem_list'] = []

		hash_string = b'%d + %d'%(group_id, user_id)
		post_data['hash_code'] = hashlib.md5(hash_string).hexdigest()
		hash_code = post_data['hash_code']


		for item in problem_list:
			problem_id, problem_content = item
			answers = self.db.select('answer', keys=['answer_content'], conditions={'problem_id':problem_id,'user_id':user_id})
			problem_content = json.loads(problem_content)
			answers = answers[0][0].split(',')
			problem = {'problem_id' : problem_id, 'problem_content': problem_content,'answer':answers}
			post_data['problem_list'].append(problem)

		problem_json = json.dumps(post_data).encode('utf-8').decode('unicode_escape')
		return problem_json, hash_code, problem_range


	def get_problem_modify(self, user_id, isrange, begin, end, bnid):
		
		if(isrange):
			problem_list = self.db.get_problem_by_user(user_id, begin, end)
		else:
			problem_list = self.db.get_problem_by_user_and_bnid(user_id, bnid)

		problem_range = self.db.get_problem_num_by_user(user_id)

		if problem_list == []:
			return -1, 'None', None

		group_id = -1

		post_data = {}
		post_data['group_id'] = group_id
		post_data['problem_list'] = []

		hash_string = b'%d + %d'%(group_id, user_id)
		post_data['hash_code'] = hashlib.md5(hash_string).hexdigest()
		hash_code = post_data['hash_code']


		for item in problem_list:
			problem_id, problem_content = item
			answers = self.db.select('answer', keys=['answer_content'], conditions={'problem_id':problem_id,'user_id':user_id})
			problem_content = json.loads(problem_content)
			answers = answers[0][0].split(',')
			problem = {'problem_id' : problem_id, 'problem_content': problem_content,'answer':answers}
			post_data['problem_list'].append(problem)

		problem_json = json.dumps(post_data).encode('utf-8').decode('unicode_escape')
		return problem_json, hash_code, problem_range

	def get_test_problem(self,user_id):
		# get the problem group id
		group_id = -2

		problem_id_list = [9919 + x for x in range(12)]

		problem_list = []

		for problem_id in problem_id_list:
			problem = self.db.select('problem', keys=['problem_id', 'problem_content'], conditions={'problem_id':problem_id})
			problem_list.append(problem[0])
		
		post_data = {}
		post_data['group_id'] = group_id
		post_data['problem_list'] = []
		hash_string = b'%d + %d'%(group_id, user_id)
		post_data['hash_code'] = hashlib.md5(hash_string).hexdigest()

		hash_code = post_data['hash_code']

		for i,item in enumerate(problem_list):

			problem_id, problem_content = item
			problem = {'problem_id' : problem_id, 'problem_content': problem_content}
			post_data['problem_list'].append(problem)

		problem_json = json.dumps(post_data).encode('utf-8').decode('unicode_escape')
		return problem_json, hash_code

	# 查看已做题答题信息
	def get_problem_info(self, user_id, problem_id):
		problem = self.db.get_problem_by_problem_id(problem_id)
		problem_id, problem_content = problem[0]
		problem_content = json.loads(problem_content)
		answers = self.db.select('answer', keys=['answer_content'], conditions={'problem_id':problem_id,'user_id':user_id})
		answers = answers[0][0].split(',')
		problem = {'problem_id': problem_id, 'problem_content': problem_content, 'answer': answers}
		return problem

	def save_answer(self, user_id, answers, hash_code_session):
		'''
		retcode enum
		'''
		REPEAT_SENDING = 2
		SAVE_SUCCESS = 1

		assert user_id
		# record the answer
		group_id, problem, hash_code_post = answers[u'group_id'], answers[u'problem'], answers[u'hash_code']

		if hash_code_session != hash_code_post:
			return REPEAT_SENDING

		# save answers
		answer_pre_problem = []
		for item in problem:
			
			problem_id, answer_list, cost_time = item['actualId'], item['answer'], item['cost_time']
			
			# 增加题目已做次数
			self.db.inc_problem_times(problem_id)

			# 释放题目
			self.db.update('problem', updates = {'state' : 0}, conditions = {'problem_id' : problem_id})
			self.db.delete('zombie',conditions = {'problem_id' : problem_id})

			# answer序列化
			answer_list = map(str,answer_list)
			answer_content = ','.join(answer_list)

			# 插入序列化完毕的answer
			self.db.insert('answer', {'problem_id' : problem_id, 'answer_content' : answer_content, 'user_id': user_id, 'time_second':cost_time})
		
		# 用户做题数+1
		score = self.db.select('users', keys = ['group_num'], conditions = {'id' : user_id})[0][0]
		self.db.update('users', updates = {'group_num' : score + 1}, conditions = {'id' : user_id})
		

		return SAVE_SUCCESS

	def modify_answer(self, user_id, answers, hash_code_session):
		'''
		retcode enum
		'''
		REPEAT_SENDING = 2
		SAVE_SUCCESS = 1

		assert user_id
		# record the answer
		group_id, problem, hash_code_post = answers[u'group_id'], answers[u'problem'], answers[u'hash_code']

		if hash_code_session != hash_code_post:
			return REPEAT_SENDING

		# save answers
		answer_pre_problem = []
		for item in problem:
			
			problem_id, random_tree_id_list, cost_time = item['actualId'], item['answer'], item['cost_time']
			previous_answer = self.db.select('answer', keys=['answer_content'], conditions={'problem_id':problem_id,'user_id':user_id})

			answer_list = map(str, random_tree_id_list)
			answer_content = ','.join(answer_list)

			if(previous_answer[0][0] == answer_content):
				continue

			self.db.delete('answer',conditions={'problem_id':problem_id,'user_id':user_id})
			self.db.insert('answer', {'problem_id' : problem_id, 'answer_content' : answer_content, 'user_id': user_id, 'time_second':cost_time})

		return SAVE_SUCCESS


	def save_feedback(self, data):
		self.db.insert('feedback', {'user_id': data['user_id'], 'problem_id' : data[u'problem_id'], 'content' : data[u'content']})

	def get_user_problem(self, user_id):
		answer_table = self.db.select('answer',['group_id','problem_id','answer_content','time_second'],conditions={'user_id':user_id})
		return answer_table

	# 获得总进度
	def get_progress_all(self):
		progress = self.db.get_all_progress()
		# 总题目数量
		problem_num = 1000
		# 一个题目的标注次数
		need_per_problem = 2
		return round((progress) *100 / (problem_num * float(need_per_problem)),2)

	# 若题目已被标注者取得，但3600秒内没有提交答案，解除题目的zombie状态(锁)，释放题目
	def recoverzombie(self):
		zombie_list = self.db.select('zombie',['problem_id','timestamp'])
		timenow = int(time.time())
		for item in zombie_list:
			problem_id, timestamp = item
			if timenow > timestamp + 3600:
				self.db.update('problem',updates={'state':0},conditions={'problem_id':problem_id})
				self.db.delete('zombie',{'problem_id':problem_id})

	def get_feedback(self):
		feedback_table = self.db.select('feedback',['user_id','problem_id','content'])
		return feedback_table

	# 输出answer表结果到静态文件
	def outputfile(self):
		#将user_id转为name再输出
		answer_table = self.db.select('answer',['user_id','problem_id','answer_content','time_second'])
		users_table = self.db.select('users',['id','name'])
		id2user = {}
		for item in users_table:
			uid, name = item
			id2user[uid] = name

		pd_list = []

		for index in range(len(answer_table)):
			uid, pid, answer_content, time_second = answer_table[index]
			uname = id2user[uid]
			data = {}
			data['name'] = uname
			data['pid'] = pid
			data['time'] = time_second
			data['answer'] = answer_content
			pd_list.append(data)

		f = open("./statics/answers.json", "w")
		f.write(json.dumps(pd_list))
		f.close()
		# pd.DataFrame(pd_list).to_excel('./statics/answers.xlsx', header=False, index=False)


if __name__ == "__main__":
	pass
