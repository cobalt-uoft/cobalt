import requests, http.cookiejar
import time
import re
import os
import pprint

class CourseFinder:
    """A wrapper for utilizing UofT's Course Finder web service.

    Course Finder is located at http://coursefinder.utoronto.ca/.
    """

    def __init__(self):
        self.host = 'http://coursefinder.utoronto.ca/course-search/search/courseSearch'
        self.cookies = http.cookiejar.CookieJar()
        self.s = requests.Session()

    def update_cache(self):
        """Update the locally stored course pages."""

        info = self.search('')

        for x in info:
            course_id = re.search('offImg(.*)', x[0]).group(1)[:14]
            url = '%s/coursedetails/%s' % (self.host, course_id)
            course_dir = 'cache/%s' % course_id[-5:]
            os.makedirs(course_dir, exist_ok=True)

            r = self.s.get(url, cookies=self.cookies)

            html = None
            while html is None:
                r = self.s.get(url, cookies=self.cookies)
                if r.status_code == 200:
                    html = r.text

            f = open('%s/%s.html' % (course_dir, course_id), 'wb')
            f.write(html.encode('utf-8'))
            f.close()

    def search(self, query='', requirements=''):
        """Perform a search and return the data as a dict."""

        url = '%s/course/search' % self.host

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
c.update_cache()
