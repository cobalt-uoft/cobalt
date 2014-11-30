import requests
import http.cookiejar
import time

def get_raw_data():
    url = 'http://coursefinder.utoronto.ca/course-search/search/courseSearch/course/search'
    data = {
        'queryText': '',
        'requirements': '',
        'campusParam': 'St. George,Scarborough,Mississauga'
    }

    cookies = http.cookiejar.CookieJar()
    s = requests.Session()

    json = ''
    good = False
    while not good:
        r = s.get(url, params=data, cookies=cookies)
        if r.status_code == 200:
            good = True
            json = r.text
        else:
            time.sleep(0.5)

    f = open('raw_data.json', 'wb')
    f.write(json.encode('utf-8'))
    f.close()
