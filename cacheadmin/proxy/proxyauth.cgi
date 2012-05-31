#!/usr/bin/env python


"""This is a blind proxy that we use to get around browser
restrictions that prevent the Javascript from loading pages not on the
same server as the Javascript.  This has several problems: it's less
efficient, it might break some sites, and it's a security risk because
people can use this proxy to browse the web and possibly do bad stuff
with it.  It only loads pages via http and https, but it can load any
content type. It supports GET and POST requests."""

import urllib2
import cgi
import sys, os

user =""
pwd=""

# Designed to prevent Open Proxy type stuff.

allowedHosts = ['www.openlayers.org', 'openlayers.org', 
                'labs.metacarta.com', 'world.freemap.in', 
                'prototype.openmnnd.org', 'geo.openplans.org',
                'sigma.openplans.org', 'demo.opengeo.org',
                'www.openstreetmap.org', 'sample.azavea.com',
                'v2.suite.opengeo.org', 'v-swe.uni-muenster.de:8080', 
                'vmap0.tiles.osgeo.org', 'www.openrouteservice.org',
		'geobretagne.fr', 'test.geobretagne.fr',
		'tile.geobretagne.fr', 'osm.geobretagne.fr']

method = os.environ["REQUEST_METHOD"]
# ajouts sp
#user='sebastien.pelhate'
#pwd='sebseb'
password_mgr = urllib2.HTTPPasswordMgrWithDefaultRealm()
top_level_url = ""
password_mgr.add_password(None, top_level_url, user, pwd)

opener = urllib2.build_opener(
urllib2.HTTPHandler(),
urllib2.HTTPSHandler(),
urllib2.HTTPBasicAuthHandler(password_mgr))
urllib2.install_opener(opener)
#fin ajout sp



if method == "POST":
    qs = os.environ["QUERY_STRING"]
    d = cgi.parse_qs(qs)
    if d.has_key("url"):
        params = d["url"][0].split("@")
        url = params[0]
        if len(params)>1:
            user = params[1]
            pwd = params[2]
    else:
        url = "http://www.openlayers.org"
else:
    fs = cgi.FieldStorage()    
    tmp = fs.getvalue('url', "http://www.openlayers.org")
    params = tmp.split("@")
    url = params[0]
    if len(params)>1:
            user = params[1]
            pwd = params[2]

try:
    # ajouts sp
    tmp = url.split("/")
    password_mgr = urllib2.HTTPPasswordMgrWithDefaultRealm()
    top_level_url = "http://" + tmp[2] + "/"
    password_mgr.add_password(None, top_level_url, user, pwd)
    opener = urllib2.build_opener(
    urllib2.HTTPHandler(),
    urllib2.HTTPSHandler(),
    #urllib2.ProxyHandler({'http': 'http://192.168.1.13:8080'}),
    urllib2.HTTPBasicAuthHandler(password_mgr))
    urllib2.install_opener(opener)
    #fin ajout sp    
    host = url.split("/")[2]
    if allowedHosts and not host in allowedHosts:
        print "Status: 502 Bad Gateway"
        print "Content-Type: text/plain"
        print
        print "This proxy does not allow you to access that location (%s)." % (host,)
        print
        print os.environ
  
    elif url.startswith("http://") or url.startswith("https://"):
    
        if method == "POST":
            length = int(os.environ["CONTENT_LENGTH"])
            headers = {"Content-Type": os.environ["CONTENT_TYPE"]}
            body = sys.stdin.read(length)
            r = urllib2.Request(url, body, headers)			
            y = urllib2.urlopen(r)
        else:
            y = urllib2.urlopen(url)
        
        # print content type header
        i = y.info()
        if i.has_key("Content-Type"):
            print "Content-Type: %s" % (i["Content-Type"])
        else:
            print "Content-Type: text/plain"
        print
        
        print y.read()
        
        y.close()
    else:
        print "Content-Type: text/plain"
        print
        print "Illegal request."

except Exception, E:
    print "Status: 500 Unexpected Error"
    print "Content-Type: text/plain"
    print 
    print "Erreur:", E
