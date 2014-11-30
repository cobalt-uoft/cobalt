import requests
import http.cookiejar
import time

def download_raw_data():
    url = 'http://coursefinder.utoronto.ca/course-search/search/courseSearch/course/search'

    data = {
        'queryText': '',
        'requirements': '',
        'campusParam': 'St. George,Scarborough,Mississauga'
    }

    cookies = http.cookiejar.CookieJar()
    s = requests.Session()

    # Keep trying to get data until a proper response is given
    json = None
    while json is None:
        r = s.get(url, params=data, cookies=cookies)
        if r.status_code == 200:
            json = r.text
        else:
            time.sleep(0.5)

    # Output to file
    f = open('raw_data.json', 'wb')
    f.write(json.encode('utf-8'))
    f.close()
