import requests, http.cookiejar
import time
import re
import os
import json
import pprint
from bs4 import BeautifulSoup
from collections import OrderedDict

class CourseFinder:
    """A wrapper for utilizing UofT's Course Finder web service.

    Course Finder is located at http://coursefinder.utoronto.ca/.
    """

    def __init__(self):
        self.host = 'http://coursefinder.utoronto.ca/course-search/search'
        self.cookies = http.cookiejar.CookieJar()
        self.s = requests.Session()

    def parse_files_to_json(self):
      folder = "cache"
      for file in os.listdir(folder)[:1000]:
        """Create JSON files from the HTML pages downloaded."""
        # loop through all the files
        json_location = "json/%s.json" % file[:-5]
        q = open("cache/" + file, "r")
        read = q.read()
        soup = BeautifulSoup(read)

        #Things that appear on all courses
        title_name = soup.find(id = "u19").find_all(
          "span",
          class_= "uif-headerText-span"
        )[0].get_text()
        course_code = title_name[:8]
        course_name = title_name[10:]
        division = soup.find(id = "u23").find_all("span",
        id ="u23")[0].get_text().strip()
        description = soup.find(id = "u32").find_all("span",
        id ="u32")[0].get_text().strip()
        department = soup.find(id = "u41").find_all("span",
        id ="u41")[0].get_text().strip()
        course_level = soup.find(id = "u86").find_all("span",
        id ="u86")[0].get_text().strip()
        campus = soup.find(id = "u149").find_all("span",
        id ="u149")[0].get_text().strip()
        term = soup.find(id = "u158").find_all("span",
        id ="u158")[0].get_text().strip()


        #Things that don't appear on all courses
        as_breadth = soup.find(id= "u122")
        if not as_breadth == None:
          as_breadth = as_breadth.find_all("span", id ="u122")[0].get_text().strip()
          breadths = []
          for ch in as_breadth:
            if ch in "12345":
              breadths.append(int(ch))
        else:
          breadths = []

        exclusions = soup.find(id= "u68")
        if not exclusions == None:
          exclusions = exclusions.find_all("span", id ="u68")[0].get_text().strip()
        else:
          exclusions = ""

        prereq = soup.find(id= "u50")
        if not prereq == None:
          prereq = prereq.find_all("span", id ="u50")[0].get_text().strip()
        else:
          prereq = ""

        apsc_elec = soup.find(id= "u140")
        if not apsc_elec == None:
          apsc_elec = apsc_elec.find_all("span", id ="u140")[0].get_text().strip()
        else:
          apsc_elec = ""

        #Meeting Sections
        meeting_table = soup.find(id = "u172")
        if not meeting_table == None:
          meeting_table.find_all("tr")
          for tr in meeting_table:
            tds = tr.find_all("td")
            # Index stuff:
            # tds[0].get_text().strip() - name
            # 1 - times
            # 2 - instructor
            # 3 - locations
            # 4 - class size



        #Dictionary
        course = OrderedDict([
          ("code", course_code),
          ("name", course_name),
          ("description", description),
          ("division", division),
          ("department", department),
          ("prerequisite", prereq),
          ("exclusions", exclusions),
          ("course_level", course_level),
          ("breadth", breadths),
          ("campus", campus),
          ("term", term),
          ("APSC_elec", apsc_elec),
          ("meeting_sections",
            OrderedDict([

            ])
          )
        ])

        f = open(json_location, 'w')
        f.write(json.dumps(course))
        f.close()


    def update_cache(self):
        """Update the locally stored course pages."""

        info = self.search('')

        for x in info:
            course_id = re.search('offImg(.*)', x[0]).group(1)[:14]
            url = '%s/courseSearch/coursedetails/%s' % (self.host, course_id)
            course_dir = 'cache/%s' % course_id[-5:]
            file_path = '%s/%s.html' % (course_dir, course_id)
            os.makedirs(course_dir, exist_ok=True)

            if os.path.isfile(file_path):
                continue

            html = None
            while html is None:
                r = self.s.get(url, cookies=self.cookies)
                if r.status_code == 200:
                    html = r.text

            f = open(file_path, 'wb')
            f.write(html.encode('utf-8'))
            f.close()

    def search(self, query='', requirements=''):
        """Perform a search and return the data as a dict."""

        url = '%s/courseSearch/course/search' % self.host

        data = {
            'queryText': query,
            'requirements': requirements,
            'campusParam': 'St. George,Scarborough,Mississauga'
        }

        # Keep trying to get data until a proper response is given
        json = None
        while json is None:
            r = self.s.get(url, params=data, cookies=self.cookies)
            if r.status_code == 200:
                json = r.json()
            else:
                time.sleep(0.5)

        return json['aaData']

c = CourseFinder()
c.parse_files_to_json()
