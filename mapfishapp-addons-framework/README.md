mapfishapp-addons
=================

georchestra's mapfishapp extension to allow addons/plugins with custom configuration and lazy modules load
Framework structure.
---------------
---------------

**1- Original georchestra files modified**


  - GEOR_config.js,
  - GEOR_customs.js,
  - GEOR_toolbar.js


**2- Folder, files created**

 - GEOR_addonsmenu.js
 - app/addons
  

Each addon has a special folder ex. app/addons/model, containing css, js, image files and respects the addon framework structure (a public method create() wich returns an element menu). See [model example].



How it works ?
---------------
---------------

**1- Requirements :**

 - Compile mapfish.js with the GEOR-config.js and the new GEOR-toolbar.js
 - Edit the GEOR-custom.js ADDON-LIST []. See [model config example]

**2- Process :**

> For each ADDONS_LIST item in GEOR-custom.js, a new menu item is created on the fly in the mapfishapp addon menu. 
  
  [model example]: https://raw.github.com/georchestra/contribs/master/mapfishapp-addons-framework/src/main/webapp/app/addons/model/GEOB_addonmodel.js
  [model config example]: https://github.com/georchestra/contribs/blob/master/mapfishapp-addons-framework/src/main/webapp/app/js/GEOR_custom.js