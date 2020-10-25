# 项目简介

目前项目为推文标注，展示一个推文，标注者要做8个选择题。

目前已做题目修改功能不可用，其余正常。

# 目录与文件结构


├── application.py\
├── dataprocess 数据预处理目录(从excel文件转为url encode的csv文件)\
│   ├── data.csv\
│   ├── data.xlsx\
│   ├── input.csv\
│   ├── pro.py 预处理程序\
│   ├── test.csv\
│   └── test.xlsx\
├── dbn.db 数据库文件\
├── handlers\
│   ├── __init__.py\
│   ├── data.py 业务层\
│   ├── db.py 数据库访问层，DAO层\
│   ├── main_handler.py Facade层(get post)\
├── import.sql csv导入数据库的sql脚本\
├── server.py 网站启动入口,可设置端口\
├── statics 网站静态文件目录\
│   ├── THUNLP 标注平台使用手册.pdf\
│   ├── css\
│   ├── faq.json\
│   ├── js\
│   │   ├── bootstrap.js\
│   │   ├── label.js 标注页js\
│   │   ├── md5.min.js\
│   │   ├── modify.js 修改答案页js\
│   │   └── test.js 练习题页js\
│   ├── robots.txt 禁止爬虫\
├── templates\
│   ├── index.html 首页\
│   ├── info.html 修改个人信息页面\
│   ├── label_sememe.html 正式标注页面\
│   ├── login.html 登录页面\
│   ├── md5.min.js\
│   ├── modify_sememe.html 修改题目\
│   ├── register.html 注册页面\
│   └── test_sememe.html 练习题页面\
├── url.py 路由控制\

# 网站使用

## 数据的预处理

需要将题目数据导入到dbn.db数据库文件中，注意题目数据应进行url encode，避免特殊字符影响json传输，前端接到题目后进行url decode

导入的sql脚本见import.sql。只需在根目录下运行以下命令。

```bash
sqlite3
> .read import.sql
> .quit
```

## 网站运行

python server.py

# 网站设计细节

## 题目分发

每个problem有state、times两个值。

state为做题锁，保证每一道题同时只能由一个人做，取题时加锁(=1)，提交答案后解除锁(=0)

times为已做题次数，提交一次答案数值加1

用户获取题目时，获取state=0且times<标注需求次数的题目

为降低服务器压力，用户以题组为单位获取题目和提交答案，以此减少前后端交互次数

### 处理用户取题后关闭网页的情况

zombie表记录此类题目，表记录取题时间和取题题目，若一小时内未提交答案，则自动释放题目。

注：若用户做题用时超过一小时，会出现锁失效的罕见情况，导致提交多余答案。

## 防范SQL注入攻击

目前发现有人进行网站的无差别自动攻击，为防范SQL注入攻击，采用传参的形式执行sql语句。

必须用 cursor.execute(cmd, params)，不可将参数拼接入cmd中

# 联系方式

该项目仅简单加了一些注释，如有不理解之处可联系

微信:Chl-wechat 邮箱:825832365@qq.com

可以为您详细讲解此网站设计逻辑