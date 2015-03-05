#!/usr/bin/env python
# -*- coding: utf8 -*-

import pytest
import urllib2
from owslib.wms import WebMapService
from owslib.wfs import WebFeatureService
from owslib.wms import ServiceException
import hashlib
from functools import partial
import os
import os.path

endpoints = [
    'http://sdi.georchestra.org/geoserver/ci/wms'
]

def md5(file, dump=False):
    d = hashlib.md5()
    bin = file.read()
    d.update(bin)
    if dump:
        f=open(os.path.join('tmp',d.hexdigest()), 'w')
        f.write(bin)
        f.close()
    return d.hexdigest()


@pytest.fixture(scope="module")
def proxy(request):
    """Sets an outgoing http proxy"""
    if os.getenv('HTTP_PROXY', None):
        proxyHandler = urllib2.ProxyHandler({
            "http": os.getenv('HTTP_PROXY'),
            "https": os.getenv('HTTP_PROXY')
        })
        opener = urllib2.build_opener(proxyHandler)
        urllib2.install_opener(opener)

@pytest.fixture(scope="module", params=endpoints)
def wms(request):
    return WebMapService(request.param, version='1.1.1')

@pytest.fixture(scope="module", params=endpoints)
def wfs(request):
    return WebFeatureService(request.param, version='1.0.0')

def test_wmscapabilities(wms):
    """anonymous WMS getcapabilities"""
    assert wms.contents.has_key('unprotectedVectorLayer')
    assert wms.contents.has_key('adminVectorLayer')
    assert wms.contents.has_key('editableVectorLayer')
    assert not(wms.contents.has_key('protectedVectorLayer'))

def test_getmap_vector_unprotected(wms):
    """anonymous getmap on unprotected vector layer"""
    img = wms.getmap(
        layers=['unprotectedVectorLayer'],
        srs='EPSG:4326',
        bbox=(-180, -90, 180, 90),
        size=(300, 150),
        format='image/png',
        transparent=True
    )
    assert md5(img, dump=True) == '0f4bde3831e3c116220bfd7e3ddab1cd'
    
def test_getmap_vector_protected(wms):
    """anonymous getmap on protected vector layer"""
    with pytest.raises(Exception) as exception:
        img = wms.getmap(
            layers=['protectedVectorLayer'],
            srs='EPSG:4326',
            bbox=(-180, -90, -180, 90),
            size=(300, 150),
            format='image/png',
            transparent=True
        )
    assert 'HTTP Status 401' in str(exception)


pytest.main()