import requests, http.cookiejar
from bs4 import BeautifulSoup
from collections import OrderedDict
from secrets import *
import time
import re
import json
import pymongo


class CourseTimetable:
	"""A wrapper for fetching U of T's Course Timetable data

	located at http://www.artsandscience.utoronto.ca/ofr/timetable/"""
	def __init__(self):
		self.host = 'http://www.artsandscience.utoronto.ca/ofr/timetable'
		self.urls = None
		self.cookies = http.cookiejar.CookieJar()
		self.s = requests.Session()
		self.client = pymongo.MongoClient(MONGO_URL)
		self.db = self.client[MONGO_DB]
		self.courses = self.db.courses
		self.count = 0
		self.total = 0

	def get_course_html(self, url):
		"""Update the locally stored program pages."""

		html = None
		while html is None:
			try:
				r = self.s.get(url, cookies=self.cookies)
				if r.status_code == 200:
					html = r.text
			except requests.exceptions.Timeout:
				continue

		return html.encode('utf-8')
