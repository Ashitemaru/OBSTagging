#encoding:utf-8
import json

f = open("feedback.json.htm","r")
content = f.read()
gg = json.loads(content)
f.close()
for i in gg:
	print i[0],"\t",i[1],"\t",
	print i[2]
