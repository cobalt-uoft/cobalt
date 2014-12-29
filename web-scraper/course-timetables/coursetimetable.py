import requests, http.cookiejar
from bs4 import BeautifulSoup
from collections import OrderedDict
#from secrets import *
import time
import re
import json
#import pymongo


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

ct = CourseTimetable()
ct.get_timetables()
