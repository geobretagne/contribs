var mapPanel;
var gridListeCartes;
var tmsurl;
var formSelectedCarte;
var storetasks2;
var gridTasks;
var activeUrl;
var styleMap;



Ext.onReady(function () {
    /* paramétrage de la carte */
    Ext.QuickTips.init();

    var prox = 'proxy/proxy.cgi?url=';
    OpenLayers.ProxyHost = 'proxy/proxyauth.cgi?url=';

    var mp = new OpenLayers.Control.MousePosition();
    mp.displayProjection = new OpenLayers.Projection("EPSG:2154");

    var options = {
        projection: new OpenLayers.Projection("EPSG:2154"),
        displayProjection: new OpenLayers.Projection("EPSG:2154"),
        units: 'm',
        maxExtent: new OpenLayers.Bounds(-357823.2365, 6037008.6939, 2146865.3059, 8541697.2363),
        numZoomLevels: 21,
        maxResolution: 156543.0339

    };

    var tmsLayer = new OpenLayers.Layer.TMS("osm:google", "http://osm.geobretagne.fr/gwc01/service/tms/", {
        layername: "osm:google@EPSG:2154@png",
        type: "png"
    });

    styleMap = new OpenLayers.StyleMap({
        "default": new OpenLayers.Style({
            //fillColor: "#ffcc66",
            strokeColor: "#ff0000",
            fillOpacity: 0,
            strokeWidth: 2

        }),
        "select": new OpenLayers.Style({
            fillColor: "#66ccff",
            fillOpacity: 0,
            strokeColor: "#3399ff"
        })
    });

    var map = new OpenLayers.Map({
        projection: new OpenLayers.Projection("EPSG:2154"),
        displayProjection: new OpenLayers.Projection("EPSG:2154"),
        units: "m",
        numZoomLevels: 21,
        maxResolution: 156543.0339,
        maxExtent: new OpenLayers.Bounds(-357823.2365, 6037008.6939, 2146865.3059, 8541697.2363),
        allOverlays: false,
        theme: null,
        controls: [
        new OpenLayers.Control.Navigation(), new OpenLayers.Control.PanPanel(), new OpenLayers.Control.ZoomPanel(),
            mp, new OpenLayers.Control.OverviewMap({
                mapOptions: options
        }, {
            layers: tmsLayer
        })]
    });
    var extentLayer = new OpenLayers.Layer.Vector("Extent Layer", {
        styleMap: styleMap
    });
    map.addLayers([tmsLayer, extentLayer]);

    //map.events.register("moveend", map, updateExtent);

    var zSlider = new GeoExt.ZoomSlider({
        vertical: true,
        height: 110,
        x: 18,
        y: 85,
        map: mapPanel,
        plugins: new GeoExt.ZoomSliderTip({
            template: '<div>Niveau de zoom: <b>{zoom}</b></div>'
        })
    });

    var boxctrl = new OpenLayers.Control();
    OpenLayers.Util.extend(boxctrl, {
        draw: function () {
            // this Handler.Box will intercept the shift-mousedown
            // before Control.MouseDefault gets to see it
            this.box = new OpenLayers.Handler.Box(boxctrl, {
                "done": this.notice
            });
            //,{keyMask: OpenLayers.Handler.MOD_SHIFT});
            this.box.activate();
        },
        notice: function (bounds) {
            extentLayer.removeAllFeatures();
            var ll = map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.left, bounds.bottom));
            var ur = map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.right, bounds.top));
            formExtent.getForm().findField('cbproj').setValue('EPSG:2154');
            mp.displayProjection = new OpenLayers.Projection("EPSG:2154");
            bounds2 = new OpenLayers.Bounds();
            bounds2.extend(new OpenLayers.LonLat(ll.lon.toFixed(4), ll.lat.toFixed(4)));
            bounds2.extend(new OpenLayers.LonLat(ur.lon.toFixed(4), ur.lat.toFixed(4)));

            var feature = new OpenLayers.Feature.Vector(bounds2.toGeometry());
            feature.bounds = bounds2;
            extentLayer.addFeatures(feature);
            updateExtent();
        }
    });







    var createTbarItems = function (map) {
            var actions = [];
            actions.push(new GeoExt.Action({
                iconCls: "pan",
                map: map,
                pressed: true,
                toggleGroup: "tools",
                allowDepress: false,
                tooltip: "Glisser - déplacer la carte",
                control: new OpenLayers.Control.Navigation()
            }));
            actions.push(new GeoExt.Action({
                iconCls: "zoomin",
                map: map,
                toggleGroup: "tools",
                allowDepress: false,
                tooltip: "Zoom sur l'emprise",
                control: new OpenLayers.Control.ZoomBox({
                    out: false
                })
            }));
            actions.push(new GeoExt.Action({
                iconCls: "red_square",
                map: map,
                toggleGroup: "tools",
                allowDepress: false,
                tooltip: "Tracer extent",
                control: boxctrl
            }));
            return actions;
        };

    // create map panel
    mapPanel = new GeoExt.MapPanel({
        title: "Carte",
        region: "center",
        map: map,
        center: new OpenLayers.LonLat(352047, 6788957),
        zoom: 8,
        items: [zSlider],
        tbar: createTbarItems(map)
    });

    var projections = [
        ['EPSG:2154', '2154'],
        ['EPSG:3948', '3948'],
        ['EPSG:4326', '4326'],
        ['EPSG:900913', '900913']
    ];

    var seedoperations = [
        ['seed', 'seed'],
        ['reseed', 'reseed'],
        ['truncate', 'truncate']
    ];

    var zoomlevels = [];
    for (var i = 0; i <= 16; i++) {
        zoomlevels.push(['niveau ' + i, i]);
    }

    var threadscount = [];
    for (var i = 1; i <= 4; i++) {
        threadscount.push([i + ' thread(s)', i]);
    }
    var storeproj = new Ext.data.SimpleStore({
        fields: ['code', 'projection'],
        data: projections
    });

    var storezooms = new Ext.data.SimpleStore({
        fields: ['label', 'code'],
        data: zoomlevels
    });
    var storethreadscount = new Ext.data.SimpleStore({
        fields: ['label', 'code'],
        data: threadscount
    });

    var storeoperations = new Ext.data.SimpleStore({
        fields: ['operation', 'code'],
        data: seedoperations
    });

    var storeservices = new Ext.data.Store({
        url: 'tms.xml',
        autoLoad: true,
        reader: new Ext.data.XmlReader({
            record: 'service',
            fields: ['label', 'url', 'rest']
        })
    });

    var storecartes = new Ext.data.Store({
        url: prox,
        autoLoad: false,
        reader: new Ext.data.XmlReader({
            record: 'TileMap',
            fields: [{
                name: 'title',
                mapping: '@title'
            }, {
                name: 'srs',
                mapping: '@srs'
            }, {
                name: 'href',
                mapping: '@href'
            }]
        })
    });



    var storetasks = new Ext.data.Store({
        reader: new Ext.data.ArrayReader({}, [{
            name: 'done'
        }, {
            name: 'total'
        }, {
            name: 'todo'
        }, {
            name: 'url'
        }])

    });

    var formExtent = new GeoExt.form.FormPanel({
        title: "Etendue courante :",
        bodyStyle: 'padding: 10px',
        items: [{
            xtype: "combo",
            fieldLabel: "Projection",
            name: 'cbproj',
            id: 'cbproj1',
            store: storeproj,
            displayField: "projection",
            valueField: "code",
            typeAhead: true,
            mode: 'local',
            triggerAction: 'all',
            emptyText: 'Choisir une projection...',
            selectOnFocus: true,
            listeners: {
                scope: formExtent,
                'select': updateExtent
            }
        }, {
            xtype: "textfield",
            name: "xmin",
            fieldLabel: "xmin"
        }, {
            xtype: "textfield",
            name: "ymin",
            fieldLabel: "ymin"
        }, {
            xtype: "textfield",
            name: "xmax",
            fieldLabel: "xmax"
        }, {
            xtype: "textfield",
            name: "ymax",
            fieldLabel: "ymax"
        }, {
            xtype: "textfield",
            name: "level",
            fieldLabel: "zoom level"
        }]
    });

    formExtent.getForm().findField('cbproj').setValue('EPSG:2154');


    formSelectedCarte = new GeoExt.form.FormPanel({
        title: "Carte s�lectionn�e :",
        //monitorValid:true,
        bodyStyle: 'padding: 10px',
        items: [{
            xtype: "combo",
            fieldLabel: "services",
            name: 'listeservices',
            store: storeservices,
            displayField: "label",
            valueField: "url",
            typeAhead: true,
            mode: 'local',
            triggerAction: 'all',
            emptyText: 'Choisir un service...',
            selectOnFocus: true,
            allowBlank: false,
            listeners: {
                scope: formSelectedCarte,
                'select': function (combo, record, index) {
                    var frm = formSelectedCarte.getForm();
                    frm.findField('selcarte').setValue("");
                    frm.findField('selproj').setValue("");
                    frm.findField('selformat').setValue("");
                    Ext.getCmp('testsel').setValue(false);
                    Ext.getCmp('ddd').disable();
                    tmsurl = record.data.url;
                    storecartes.proxy.conn.url = prox + tmsurl;
                    storecartes.reload();
                    Ext.getCmp('aaa').expand();
                }
            }
        }, {
            xtype: "textfield",
            name: "selcarte",
            fieldLabel: "nom",
            //allowBlank:false,
            disabled: true
        }, {
            xtype: "textfield",
            name: "selproj",
            id: "textproj",
            //allowBlank:false,
            disabled: true,
            fieldLabel: "projection"
        }, {
            xtype: "textfield",
            name: "selformat",
            fieldLabel: "format",
            //allowBlank:false,
            disabled: true
        }, {
            xtype: "textfield",
            id: "testsel",
            hidden: true
        }],
        buttons: [{
            id: 'ddd',
            text: 'Afficher',
            tooltip: 'Visualiser le tms sélectionné',
            disabled: true,
            //formBind:true,
            iconCls: 'add',
            handler: function () {
                addtms();
            }
        }]
    });

    var formAdmin = new GeoExt.form.FormPanel({
        monitorValid: true,
        title: "Administration :",
        bodyStyle: 'padding: 10px',
        items: [{
            xtype: "textfield",
            name: "user",
            fieldLabel: "login",
            allowBlank: false
        }, {
            xtype: "textfield",
            name: "pwd",
            inputType: 'password',
            fieldLabel: "mot de passe",
            allowBlank: false
        },
        // test
        {
            xtype: 'checkbox',
            //defining the type of component  
            fieldLabel: 'Utiliser Etendue courante',
            //assigning a label  
            name: 'useext',
            //and a "name" so we can retrieve it in the server...  
            id: 'ccc' // ...when the form is sent  
        },
        //fin test
        {
            xtype: "combo",
            width: 150,
            fieldLabel: "Opération",
            name: 'cboperation',
            store: storeoperations,
            displayField: "operation",
            valueField: "code",
            typeAhead: true,
            mode: 'local',
            triggerAction: 'all',
            emptyText: 'op�ration...',
            allowBlank: false,
            selectOnFocus: true
        }, {
            xtype: "combo",
            width: 150,
            fieldLabel: "Zoom début",
            name: 'cbzoom1',
            store: storezooms,
            displayField: "label",
            valueField: "code",
            typeAhead: true,
            mode: 'local',
            triggerAction: 'all',
            emptyText: 'zoom...',
            allowBlank: false,
            selectOnFocus: true
        }, {
            xtype: "combo",
            width: 150,
            fieldLabel: "Zoom fin",
            name: 'cbzoom2',
            store: storezooms,
            displayField: "label",
            valueField: "code",
            typeAhead: true,
            mode: 'local',
            triggerAction: 'all',
            emptyText: 'zoom...',
            allowBlank: false,
            selectOnFocus: true
        }, {
            xtype: "combo",
            width: 150,
            fieldLabel: "threads",
            name: 'cbthreads',
            store: storethreadscount,
            displayField: "label",
            valueField: "code",
            typeAhead: true,
            mode: 'local',
            triggerAction: 'all',
            emptyText: 'threads...',
            allowBlank: false,
            selectOnFocus: true
        }],
        buttons: [{
            text: 'Exécuter',
            formBind: true,
            handler: function () {
                submitform();
            }
        }]

    });

    gridListeCartes = new Ext.grid.GridPanel({
        id: "aaa",
        title: "liste des cartes",
        region: "east",
        store: storecartes,
        //height: 250,
        //width: 320,
        columns: [{
            header: "title",
            width: 180,
            dataIndex: "title",
            sortable: true
        }, {
            header: "proj",
            width: 100,
            dataIndex: "srs",
            sortable: true
        }],
        autoSizeColumns: true,
        sm: new Ext.grid.RowSelectionModel({
            singleSelect: true,
            listeners: {
                rowselect: function (smObj, rowIndex, record) {
                    var tmp = record.data.href;
                    var protocole = 'tms/1.0.0/';
                    var baseUrl = tmp.slice(0, tmp.indexOf(protocole)) + protocole;
                    tmp = tmp.substr(baseUrl.length);
                    tmp = tmp.replace(/%3A/g, ":");
                    var prop = tmp.split('@');
                    var frm = formSelectedCarte.getForm();
                    frm.findField('selcarte').setValue(prop[0]);
                    frm.findField('selproj').setValue(prop[1]);
                    frm.findField('selformat').setValue(prop[2]);
                    Ext.getCmp('testsel').setValue(true);
                    Ext.getCmp('ddd').enable();
                }
            }
        })
    });

    gridTasks = new Ext.grid.GridPanel({
        id: "gtasks",
        title: "Tasks",
        region: "east",
        tbar: [{
            text: 'Rafraichir',
            tooltip: 'Rafraichir',
            handler: function () {
                gettasks();
            },
            iconCls: 'refresh'
        }, '-',
        {
            text: 'Kill tasks',
            tooltip: 'Kill de tous les tasks (bientôt)',
            iconCls: 'remove',
            disabled: true
        }],
        store: storetasks,
        columns: [{
            header: "fait",
            width: 80,
            dataIndex: "done"
        }, {
            header: "total",
            width: 80,
            dataIndex: "total"
        }, {
            header: "restant",
            width: 80,
            dataIndex: "todo"
        }],
        autoSizeColumns: true
    });

    var panExtent = new Ext.Panel({
        region: "west",
        items: [formExtent, formSelectedCarte],
        width: 320,
        minWidth: 175,
        maxWidth: 400,
        collapsible: true,
        animCollapse: true,
        split: true
    });


    var panTms = new Ext.Panel({
        region: "east",
        split: true,
        width: 320,
        minWidth: 320,
        maxWidth: 400,
        collapsible: true,
        animCollapse: true,
        margins: '0 0 0 5',
        layout: 'accordion',
        items: [gridListeCartes, formAdmin, gridTasks]
    });


    var panTasks = new Ext.Panel({
        region: 'south',
        split: true,
        height: 100,
        minSize: 100,
        maxSize: 200,
        collapsible: true,
        collapsed: true,
        title: 'Tasks'
    });

    var mainPanel = new Ext.Viewport({
        renderTo: "mainpanel",
        layout: "border",
        items: [panExtent, panTms, mapPanel]
    });



    function updateExtent() {
        var form = formExtent.getForm();
        var projextent;
        var selectproj = form.findField('cbproj').getValue();
        var result = form.findField('resultat');

        //var extent =map.getExtent();
        if (extentLayer.features.length == 1) {
            var extent = extentLayer.features[0].bounds;
            projextent = extent.transform(mp.displayProjection,
                new OpenLayers.Projection(selectproj));
            form.findField('xmin').setValue(projextent.toArray()[0]);
            form.findField('ymin').setValue(projextent.toArray()[1]);
            form.findField('xmax').setValue(projextent.toArray()[2]);
            form.findField('ymax').setValue(projextent.toArray()[3]);
            form.findField('level').setValue(map.getZoom());
            mp.displayProjection = new OpenLayers.Projection(selectproj);
        }
    };

    function addtms() {
        var frm = formSelectedCarte.getForm();
        tmsLayer.destroy();
        tmsLayer = new OpenLayers.Layer.TMS(
        frm.findField('selcarte').getValue(), tmsurl.substr(0, tmsurl.length - 5), {
            layername: frm.findField('selcarte').getValue() + 
                '@' + frm.findField('selproj').getValue() + 
                '@' + frm.findField('selformat').getValue(),
            type: frm.findField('selformat').getValue()
        }, {
            isBaseLayer: true
        });
        map.addLayers([tmsLayer]);

    };

    function submitform() {
        var cb = formSelectedCarte.getForm().findField('listeservices');
        var v = cb.getValue();
        var record = cb.findRecord(cb.valueField, v);
        var resturl = record.data.rest;
        var frm2 = formSelectedCarte.getForm();
        var frm1 = formExtent.getForm();
        var frm3 = formAdmin.getForm();
        var myextent = ""

        if (Ext.getCmp('ccc').getValue() == true) {
            if (Ext.getCmp('cbproj1').getValue() == Ext.getCmp('textproj').getValue()) {
                var myextent = '<bounds>' + '<coords>' +
                    '<double>' + frm1.findField('xmin').getValue() + '</double>' + 
                    '<double>' + frm1.findField('ymin').getValue() + '</double>' +
                    '<double>' + frm1.findField('xmax').getValue() + '</double>' +
                    '<double>' + frm1.findField('ymax').getValue() + '</double>' +
                    '</coords>' + '</bounds>';
            } else {
                alert("les projection de l'étendue courante et du service sélectionné ne sont pas en cohérence !");
                return;
            }
        }

        var seedrequest = '<seedRequest>' + '<name>' + frm2.findField('selcarte').getValue() +
                '</name>' + myextent + '<gridSetId>' + frm2.findField('selproj').getValue() +
                '</gridSetId><zoomStart>' + frm3.findField('cbzoom1').getValue() +
                '</zoomStart><zoomStop>' + frm3.findField('cbzoom2').getValue() +
                '</zoomStop><format>image/' + frm2.findField('selformat').getValue() +
                '</format><type>' + frm3.findField('cboperation').getValue() +
                '</type><threadCount>' + frm3.findField('cbthreads').getValue() +
                '</threadCount></seedRequest>';

        var request = OpenLayers.Request.issue({
            method: 'POST',
            headers: {
                "Content-Type": "text/xml"
            },
            url: resturl + frm2.findField('selcarte').getValue() +
                '.xml@' + formAdmin.getForm().findField('user').getValue() +
                '@' + formAdmin.getForm().findField('pwd').getValue(),
            data: seedrequest,
            failure: requestFailure,
            success: requestSuccess            
        });
    }

    function requestSuccess(response) {

        if (response.responseText.length == 1) {
            gettasks();
        } else {
            alert('zut :' + response.responseText);
        }

    }

    function requestFailure(response) {
        alert(response.responseText);
    }

    function gettasks() {

        var cb = formSelectedCarte.getForm().findField('listeservices');
        var v = cb.getValue();
        var record = cb.findRecord(cb.valueField, v);
        var resturl = record.data.rest;
        var frm2 = formSelectedCarte.getForm();
        activeUrl = resturl + frm2.findField('selcarte').getValue() +
            '.xml@' + formAdmin.getForm().findField('user').getValue() +
            '@' + formAdmin.getForm().findField('pwd').getValue();


        var request = OpenLayers.Request.issue({
            method: 'GET',
            url: activeUrl,
            failure: requestFailure,
            success: getTaskSuccess
        });
    }

    function getTaskSuccess(response) {
        var obj = JSON.parse(response.responseText);
        var mdata = obj['long-array-array'];
        var taskdata = [];
        for (var i = 0; i < mdata.length; i++) {
            if (mdata[i][2] != 0) {
                taskdata.push([mdata[i][0], mdata[i][1], mdata[i][2], activeUrl]);
            }
        }
        storetasks.removeAll();
        storetasks.loadData(taskdata);
        Ext.getCmp('gtasks').expand();

    }


});