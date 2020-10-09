import pandas as pd
import urllib

data_main = pd.read_excel('data.xlsx')
print(data_main.head())

data_main['text'] = data_main['text'].str.replace('\n','\\n')

data_main.to_csv('data.csv',header=False,sep='~')

data_test = pd.read_excel('test.xlsx')
print(data_test.head())

data_test['text'] = data_test['text'].str.replace('\n','\\n')

data_test.to_csv('test.csv',header=False,sep='~')

count = 0

# 测试题目接到正式题目的后面
with open('input.csv','w') as outputfile:
	with open('data.csv','r') as file:
		for line in file:
			line = urllib.parse.quote(line)
			print('0',count,line,'0','0',sep=',',file=outputfile)
			count += 1
	with open('test.csv','r') as file:
		for line in file:
			line = urllib.parse.quote(line)
			print('0',count,line,'0','0',sep=',',file=outputfile)
			count += 1
