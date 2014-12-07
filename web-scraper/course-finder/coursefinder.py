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
        """Create JSON files from the HTML pages downloaded."""

        # loop through all the files
        for file in os.listdir("cache"):
            if ".html" not in file:
                continue

            file_name = file[:-5]
            json_location = "json/%s.json" % file_name
            q = open("cache/" + file, "rb")
            read = q.read()
            soup = BeautifulSoup(read)

            # Things that appear on all courses
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
            if campus == "St.George":
                campus = "UTSG"
            elif campus == "Mississauga":
                campus = "UTM"
            elif campus == "Scarborough":
                campus = "UTSC"

            term = soup.find(id = "u158").find_all("span",
            id ="u158")[0].get_text().strip()

            # Things that don't appear on all courses
            as_breadth = soup.find(id= "u122")
            breadths = []
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

            trs = []
            if not meeting_table is None:
                trs = meeting_table.find_all("tr")

            lectures = []
            tutorials = []
            practicals = []

            for tr in trs:
                tds = tr.find_all("td")
                if len(tds) > 0:
                    code = tds[0].get_text().strip()

                    raw_times = tds[1].get_text().replace('Alternate week', '').strip().split(" ")
                    times = []
                    for i in range(0, len(raw_times) - 1, 2):
                        times.append(raw_times[i] + " " + raw_times[i + 1])

                    instructor = tds[2].get_text().strip()

                    raw_locations = tds[3].get_text().strip().split(" ")
                    locations = []
                    for i in range(0, len(raw_locations) - 1, 2):
                        locations.append(raw_locations[i] + " " + raw_locations[i + 1])

                    class_size = tds[4].get_text().strip()
                    print(course_code)
                    time_data = []
                    for i in range(len(times)):
                        info = times[i].split(" ")
                        day = info[0]
                        hours = info[1].split("-")

                        location = ""
                        try:
                            location = locations[i].replace(" ", "")
                        except IndexError:
                            location = ""

                        time_data.append(OrderedDict([
                            ("day", day),
                            ("start", hours[0]),
                            ("end", hours[1]),
                            ("location", location)
                        ]))

                    code = code.split(" ")
                    code = code[0][0] + code[1]

                    data = OrderedDict([
                        ("code", code),
                        ("instructor", instructor),
                        ("times", time_data),
                        ("class_size", int(class_size))
                    ])

                    if "L" in code:
                        lectures.append(data)
                    elif "T" in code:
                        tutorials.append(data)
                    elif "P" in code:
                        practicals.append(data)

            # Dictionary creation
            course = OrderedDict([
                ("course_id", file_name)
                ("code", course_code),
                ("name", course_name),
                ("description", description),
                ("division", division),
                ("department", department),
                ("prerequisites", prereq),
                ("exclusions", exclusions),
                ("course_level", int(course_level[:3]),
                ("breadth", breadths),
                ("campus", campus),
                ("term", term),
                ("apsc_elec", apsc_elec),
                ("meeting_sections",
                    OrderedDict([
                        ("lectures", lectures),
                        ("tutorials", tutorials),
                        ("practicals", practicals)
                    ])
                )
            ])

            # to JSON file
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
