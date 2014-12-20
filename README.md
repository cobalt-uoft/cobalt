uoft-course-api
===============

UofT course database API. Auto-updating, keeps track of current previous years.


DB
course code
name
division (faculty)
description
department
prerequisites
exclusion
course level (100, 200, 300, 400)
breadths
campus (st.goerge, UTM, etc.)
term (fall 2014, winter 2015, sumer 2015)
meeting sections (this is a subdocument)
Meeting section subdocument:
section name (ex. L0101)
Day/time (ex. MWF2)
Instructor
Location
Class size
