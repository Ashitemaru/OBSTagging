#coding:utf-8
import urllib2
import json
import BeautifulSoup
import time

f = open("res.txt", "a")
for i in range(336, 5001):
	while True:
		try:
			print (i)
			url = 'http://www.guoxuedashi.com/jgwhj/?bhfl=1&bh='+str(i)
			html = urllib2.urlopen(url, timeout = 5)
			html = BeautifulSoup.BeautifulSoup(html.read())
			f.write(str(i))
			break
		except Exception, err:
			pass

	table = html.findAll("table", {"id":"table2"})[0]
	for j in table:
		if isinstance(j, BeautifulSoup.Tag):
			for index, k in enumerate(j):
				if index == 2:
					_content = unicode(k.string).strip()
					if _content != "":
						f.write("\t"+_content.encode("utf-8"))
	f.write("\n")
	time.sleep(1)
f.close()

