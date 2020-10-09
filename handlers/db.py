#coding:utf-8
#/usr/bin/env python3
#处理数据库增删改查
import sqlite3
import logging

class DB:
    # consts
    ALL_KEYS = 0

    def __init__(self, path):
        self.path = path
        try:
            conn = sqlite3.connect(path)
            conn.close()
        except sqlite3.Error:
            raise ValueError("Invalid database at %s" % path)
        logging.info("Connected to database.")

        # initialize db
        tables = self._execute('SELECT tbl_name FROM sqlite_master WHERE type=?', ['table'], True)
        tables = set([x[0] for x in tables])

    def _create_table(self, name, keys):
        cmd = 'create table %s (id integer primary key not null, %s);' % (name, ','.join(keys))
        self._execute(cmd)

    def _unpack_params_dict(self, params_dict, delimeter=' and '):
        cmd = delimeter.join(['%s=?' % k for k in params_dict])
        return cmd, params_dict.values()

    def _execute(self, cmd, params=None, is_select=False):
        if params is None: params = []
        if not isinstance(params, list): params = list(params)
        conn = sqlite3.connect(self.path)
        cursor = conn.cursor()
        logging.debug('execute sql:' + cmd + ' ' + str(params))
        cursor.execute(cmd, params)
        if is_select:
            ret = cursor.fetchall()
        else:
            ret = cursor.rowcount
            conn.commit()
        cursor.close()
        conn.close()
        return ret

    def select(self, table, keys=ALL_KEYS, conditions=None, orderby=None, asc_desc='asc'):
        params = []
        if keys == DB.ALL_KEYS:
            keys_cmd = '*'
        else:
            keys_cmd = ','.join(keys)
        cmd = 'select %s from %s' % (keys_cmd, table)
        if conditions:
            cond_cmd, cond_params = self._unpack_params_dict(conditions)
            cmd += ' where %s' % cond_cmd
            params = cond_params
        if orderby:
            cmd += ' order by %s %s' % (','.join(orderby), asc_desc)
        return self._execute(cmd, params, True)

    def update(self, table, updates, conditions):
        updates_cmd, updates_params = self._unpack_params_dict(updates, delimeter=', ')
        cond_cmd, cond_params = self._unpack_params_dict(conditions)
        cmd = 'update %s set %s where %s' % (table, updates_cmd, cond_cmd)
        params = list(updates_params) + list(cond_params)
        self._execute(cmd, params)

    def insert(self, table, params):
        keys = ','.join(params.keys())
        placeholder = ','.join(['?'] * len(params))
        cmd = 'insert into %s (%s) values (%s)' % (table, keys, placeholder)
        self._execute(cmd, params.values())

    def delete(self, table, conditions):
        cond_cmd, cond_params = self._unpack_params_dict(conditions)
        cmd = 'delete from %s where %s' % (table, cond_cmd)
        self._execute(cmd, cond_params)

    #以上为增删改查标准函数，以下为完成特殊功能的特殊函数

    # 查询该用户没有标注过的amount个题目
    def get_problem(self, user_id, amount=10):
        cmd = 'select group_id, problem_id, problem_content from problem where state = 0 and times < 2 and not exists ( \
                select problem_id from answer where problem.problem_id = answer.problem_id and user_id = ?) limit ' + str(amount)
        res = self._execute(cmd, [user_id], is_select=True)
        logging.debug("get problem:" + str(res))
        return res

    # 查询该用户第begin到第end个题目
    def get_problem_by_user(self, user_id, begin, end):
        cmd = 'SELECT distinct problem.problem_id, problem_content FROM answer join problem on answer.problem_id = problem.problem_id where user_id = ? order by problem.problem_id limit ?,?'
        res = self._execute(cmd, [user_id, begin, end], is_select=True)
        return res

    # 查询用户标注的题目数量
    def get_problem_num_by_user(self, user_id):
        cmd = 'SELECT count(distinct problem.problem_id) FROM answer join problem on answer.problem_id = problem.problem_id where user_id = ?'
        res = self._execute(cmd, [user_id], is_select=True)
        return res[0][0]

    # 按照题号查询题目
    def get_problem_by_problem_id(self, problem_id):
        cmd = 'SELECT distinct problem.problem_id, problem_content FROM problem where problem_id=?'
        res = self._execute(cmd, [problem_id], is_select=True)
        return res

    # 题目已做次数加一
    def inc_problem_times(self, problem_id):
        cmd = 'update problem set times = times + 1 where problem_id = ?'
        res = self._execute(cmd, [problem_id])
        logging.debug("inc problem times:" + str(res))

    # 从user表中查询已做题数
    def get_user_progress(self, user_id):     
        cmd = 'select progress from users WHERE id = %d'%(user_id)
        user_progress = int(self._execute(cmd, [], True)[0][0])

        return user_progress

    # 查询用户id
    def get_id_by_name(self, name):
        conditions = {}
        conditions['name'] = '= %s'%(name)
        return self.select('users', ['id'], conditions)

    # 查询总进度
    def get_all_progress(self):
        cmd = 'SELECT sum(times) FROM problem'
        all_progress = self._execute(cmd, [], True)[0][0]
        return all_progress

