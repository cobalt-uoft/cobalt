import requests, http.cookiejar
from bs4 import BeautifulSoup
from collections import OrderedDict
import time
import re
import json
import pymongo


class CourseTimetable:

    def __init__(self, season):
        self.host = 'http://www.artsandscience.utoronto.ca/ofr/timetable/%s' % season
        self.s = requests.Session()
        self.year = 2014
        self.sponsors = []

    def parse_sponsor(self, sponsor):
        with open('html/%s' % sponsor) as f:
            html = f.read()

        soup = BeautifulSoup(html)

        table = soup.table

        trs = table.find_all("tr")[3:]

        current_course = []

        current_section = None

        for tr in trs[:100]:

            if "Cancel" in tr.get_text():
                continue

            tds = tr.find_all("td")

            if len(tds) not in [9, 10]:
                continue

            course_code = tds[0].get_text().strip()

            if len(course_code) > 0:
                print(current_course)
                current_course = [
                    None, # course code
                    None, # name
                    {} # sections
                ]

                semester = tds[1].get_text().strip()
                current_course[0] = course_code + semester

                name = tds[2].get_text().strip()
                current_course[1] = name

            section = tds[3].get_text().strip()

            if len(section) > 0:
                current_section = section

            current_course[2][current_section] = {
                'time': tds[5].get_text().strip(),
                'location': tds[6].get_text().strip(),
                'instructors': tds[7].get_text().strip()
            }

    def save(self, name, data):
        with open(name, "wb") as file:
            file.write(data)

    def save_sponsors(self):
        for x in self.sponsors:
            html = self.s.get('%s/%s' % (self.host, x)).text
            self.save('html/%s' % x, html.encode('utf-8'))

    def get_sponsors(self):
        html = self.s.get('%s/sponsors.htm' % self.host).text
        self.save('html/sponsors.html', html.encode('utf-8'))

        soup = BeautifulSoup(html)

        self.year = int(re.search("([0-9]{4})-[0-9]{4}", soup.title.get_text()).group(1))

        for x in soup.find_all('a'):
            url = x.get('href')
            if ".htm" in url and "/" not in url:
                self.sponsors.append(url)



ct = CourseTimetable("winter")
ct.get_sponsors()
#ct.save_sponsors()
ct.parse_sponsor('csc.html')
