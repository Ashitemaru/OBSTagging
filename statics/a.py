import os
import json

lists = os.listdir("./context/")

hash = {}

def add(lef, rig, url):
	for i in range(lef,rig+1):
		if not i in hash:
			hash[i] = []
		hash[i].append(url)

for i in lists:
	if i.find(".png") != -1 or i.find(".jpg") != -1:
		title = i.split(".")[0]
		if title.find("-") != -1:
			lef,rig = title.split("-")
			lef = (int)(lef)
			rig = (int)(rig)
			add(lef, rig, i.replace(".png",""))
		else:
			lef = (int)(title)
			add(lef, lef, i.replace(".png",""))

for i in hash:
	hash[i] = sorted(hash[i])
	hash[i] = ["context/"+j+".png" for j in hash[i]]

def hx_sort(lists):
	if (lists == []):
		return lists
	first = lists[0].split("-")[0]
	last = lists[0].split("-")[-1]
	lists = [(int)(i.split("-")[1]) for i in lists]
	lists = sorted(lists)
	lists = [first+"-"+str(i)+"-"+last for i in lists]
	return lists

def operate(char_list, path):
	lists = {}
	for i in char_list:
		if i.find('.png')!=-1:
			nam = i.split('.')[0]
			nam = nam.split("-")
			uid = "-".join(nam[:-1])
			if not uid in lists:
				lists[uid] = []
			lists[uid].append(nam[-1])
	res = []
	key=hx_sort(lists.keys())
	for i in key:
		lists[i] = [(int)(j) for j in lists[i]]
		lists[i] = sorted(lists[i])
		lists[i] = [path+i+"-"+str(j)+'.png' for j in lists[i]]
		res.append(lists[i])
	return res

def work(num):
	uid = num
	part_name = "oracle/"+uid
	part_list = os.listdir(part_name)
	image_dir = []
	for j in part_list:
		if j.find('.jpg')!=-1:
			image_dir.append("/oracle/"+uid+"/"+j)
	if image_dir == []:
		return False, None
	if '1' in part_list:
		old_char = os.listdir(part_name+"/1/")
	else:
		return False, None
	old_char = operate(old_char, part_name+"/1/")
	if old_char == []:
		return False, None


	if '2' in part_list:
		new_char = os.listdir(part_name+"/2/")
	else:
		return False, None
	new_char = operate(new_char, part_name+"/2/")
	if new_char == []:
		return False, None

	data = {}
	data['uid'] = uid
	data['image'] = image_dir
	data['old_char'] = old_char
	data['new_char'] = new_char
	return True, data

lists = os.listdir("oracle/")
final = {}
for i in lists:
	if i.find(".")!=-1 or i.find("..")!=-1:
		continue
	# if (int)(i)!=23:
	# 	continue
	flag, content = work(i)
	if not flag:
		continue
	content['ref'] = hash[(int)(i)]
	final[(int)(i)] = json.dumps(content)

for i in final:
	print ('0'+"\t"+str(i)+"\t"+final[i]+"\t0\t0")
