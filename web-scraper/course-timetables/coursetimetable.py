import requests, http.cookiejar
from bs4 import BeautifulSoup
from collections import OrderedDict
#from secrets import *
import time
import re
import json
#import pymongo

LENGTH_COURSE_CODE = 8
COURSE_START_OFFSET = 3
COURSE_CODE_INDEX = 0

class CourseTimetable:
	"""A wrapper for fetching U of T's Course Timetable data

	located at http://www.artsandscience.utoronto.ca/ofr/timetable/"""
	def __init__(self):
		self.host = 'http://www.artsandscience.utoronto.ca'
		self.urls = None
		self.cookies = http.cookiejar.CookieJar()
		#self.client = pymongo.MongoClient(MONGO_URL)
		#self.db = self.client[MONGO_DB]
		#self.courses = self.db.courses
		self.count = 0
		self.total = 0

	"""A wrapper for retrieving the html files of each program."""
	def get_timetables(self):
		main = self.get_html("%s/ofr/timetable/winter/sponsors.htm" % self.host)
		file = open("sponsors.htm", "w")
		file.write(str(main))
		file.close()
		programs = self.get_program_code(main)
		for program in programs:
			program_file = open("timetables/"+program, "w")
			program_html = self.get_html("%s/ofr/timetable/winter/%s" % (self.host, program))
			program_file.write(str(program_html))
			program_file.close()

	"""Retrieve the program names."""
	def get_program_code(self, html):
		file = open("sponsors.htm", "r")
		soup = BeautifulSoup(html)
		prefixes = []
		links = soup.find_all("a")
		for link in links:
			href = link.get("href")
			if ".html" in href:
				prefixes.append(href)
		return prefixes

	"""Return the html file at the url."""
	def get_html(self, url):
		html = None
		while html is None:
			try:
				r = requests.get(url, cookies=self.cookies)
				if r.status_code == 200:
					html = r.text
			except requests.exceptions.Timeout:
				continue

		return html.encode('utf-8')

	def parse_html(self, html):
		soup = BeautifulSoup(html)
		table = soup.find("table")
		table_rows = table.find_all("tr")
		c = 0
		for i in range(COURSE_START_OFFSET, len(table_rows)):
			current = table_rows[i].find_all("td")
			course = current[COURSE_CODE_INDEX = 0].get_text().strip()
			if course == "":
				c += 1
			elif len(course) == LENGTH_COURSE_CODE:
				print(course)
				print("Number of sections: " + str(c))
				c = 0




ct = CourseTimetable()
#ct.get_timetables()
html = ct.get_html("%s/ofr/timetable/winter/%s" % (ct.host, "csc.html"))
ct.parse_html(html)
