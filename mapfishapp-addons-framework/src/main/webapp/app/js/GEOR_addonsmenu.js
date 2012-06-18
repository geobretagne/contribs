/*
 * Copyright (C) Camptocamp
 *
 * This file is NOT part of geOrchestra (well, not yet)
 *
 * geOrchestra is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with geOrchestra.  If not, see <http://www.gnu.org/licenses/>.
 */


Ext.namespace("GEOR");

GEOR.addonsmenu = (function () {
    /*
     * Private
     */

    /**
     * Property: map
     * {OpenLayers.Map} The map instance.
     */
    var map = null;

    /**
     * Property: addonsListItems
     * Array of {addons} configured in GEOR_custom.js ADDONS_LIST
     */
    var addonsListItems = null;

    /**
     * Property: initializes
     * boolean.
     */
    var initialized = false;

    /**
     *Method : getGroupItem
     * this method returns menuItem index corresponding at the label group passed in parameter
     * Parameter: menuaddons : {Ext.Action}, group: string.
     *
    */
    var getGroupItem = function (menuaddons, group) {
        var index = -1;
        var i = 0;
        for (i = 0; i < menuaddons.menu.items.items.length; i += 1) {
            if (menuaddons.menu.items.items[i].text === group) {
                index = i;
                break;
            }
        }
        return index;
    };

    /**
     *Method : loadCssFile
     * this method loads dynamically the css file passed in parameter
     * this method is used because Ext.Loader does not works with css files
     * Parameter:
     * filename - css file.
     */
    var loadCssFile = function (filename) {
        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
        document.getElementsByTagName("head")[0].appendChild(fileref);
    };

    /**
     *Method : checkRoles
     * this method checks the addon permissions
     * Parameter: okRoles {addonItems.roles}.
     *
     */
    var checkRoles = function (okRoles) {
        // module is available for everyone if okRoles is empty:
        var ok = (okRoles.length === 0);
        var i = 0;
        // else, check existence of required role to activate module:
        for (i = 0; i < okRoles.length; i += 1) {
            if (GEOR.config.ROLES.indexOf(okRoles[i]) >= 0) {
                ok = true;
                break;
            }
        }
        return ok;
    };

    /**
     *Method : lazyLoad
     * this method loads dynamically all js and css files registered in
     * addonsListItems.js and addonsListItems.css using Ext.Loader.
     */
    var lazyLoad = function () {
        if (initialized === false) {
            var libs, i, j;
            libs = [];
            i = 0;
            j = 0;
            for (i = 0; i < addonsListItems.length; i += 1) {
                var files = addonsListItems[i].files;
                for (j = 0; j < files.length; j += 1) {
                    libs.push(files[j]);
                }
                if (addonsListItems[i].css) {
                    loadCssFile(addonsListItems[i].css);
                }

            }
            Ext.Loader.load(libs, function (test) {
                var i = 0;
                var menuaddons = Ext.getCmp('menuaddons');
                for (i = 0; i < addonsListItems.length; i += 1) {
                    var module = addonsListItems[i].module;
                    // FIXME : eval is evil
                    var addonModule = eval(module);
                    if (addonModule && checkRoles(addonsListItems[i].roles)) {
                        if (addonsListItems[i].group) {
                            var menuGroup = getGroupItem(menuaddons, addonsListItems[i].group);
                            menuaddons.menu.items.items[menuGroup].menu.addItem(
                                addonModule.create(map, addonsListItems[i])
                            );
                        } else {
                            menuaddons.menu.addItem(addonModule.create(map, addonsListItems[i]));
                        }
                    }
                }
                menuaddons.menu.remove(menuaddons.menu.items.items[0]);
            });
            initialized = true;
        }
    };





    return {
        /*
         * Public
         */

        /**
         * APIMethod: create
         *
         * This API method returns items menu from each addon loaded
         * Parameters:
         * m - {OpenLayers.Map} The map instance.
         */

        create: function (m) {
            map = m;
            addonsListItems = GEOR.config.ADDONS_LIST;
            var menuitems = null;
            if (addonsListItems.length > 0) {
                var groups = [];
                var i = 0;
                var j = 0;
                for (i = 0; i < addonsListItems.length; i += 1) {
                    if (addonsListItems[i].group && groups.indexOf(addonsListItems[i].group) === -1) {
                        groups.push(addonsListItems[i].group);
                    }
                }
                menuitems = new Ext.Action(
                    {
                        text: OpenLayers.i18n("Tools"),
                        id: 'menuaddons',
                        handler: lazyLoad,
                        menu: new Ext.menu.Menu({
                            items: [{text: "loading..."}]
                        })
                    }
                );
                for (j = 0; j < groups.length; j += 1) {
                    menuitems.initialConfig.menu.addItem({
                        text: groups[j],
                        iconCls: 'geor-save-map',
                        menu: new Ext.menu.Menu({
                            items: []
                        })
                    });
                }
            }
            return menuitems;
        }
    };
})();
