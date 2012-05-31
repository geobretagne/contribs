

Ext.namespace("GEOR");
		
	GEOR.addonsmenu = (function() {
	
	/*
	 * Private
	 */
	 
		/**
		 * Property: map
		 * {OpenLayers.Map} The map instance.
		 */
		var map = null;	
		
		var addonsListItems = null;
		
		var initialized = false;
		/**
		 * Property: config
		 *{Object} Hash of options, with keys: pas, referentiel.
		 */
		
		var config = null;		
		
		/**
		 * Property: colors
		 *[Array] Hash of colors.
		 */
		var lazyLoad = function(){
			if (initialized == false){			
				var libs = [];	
				for (var i=0; i<addonsListItems.length; i++){	
					var files = addonsListItems[i].files;
						for (var j=0; j<files.length; j++){	
							libs.push(files[j]);
						}
					if (addonsListItems[i].css){
						loadcssfile(addonsListItems[i].css);
					}
						
				}			
					Ext.Loader.load(libs,function(test){					
						var menuaddons	=Ext.getCmp('menuaddons');	
						for (var i=0; i<addonsListItems.length; i++){
							var module = addonsListItems[i].module;
							var addonModule = eval(module);
							if (addonModule && checkRoles(addonsListItems[i].roles)){					
								menuaddons.menu.addItem(addonModule.create(map,addonsListItems[i]));
							}
						}
					});	
				initialized=true;					
			}
		};
		
		var loadcssfile = function(filename){
				
		  var fileref=document.createElement("link");
		  fileref.setAttribute("rel", "stylesheet");
		  fileref.setAttribute("type", "text/css");
		  fileref.setAttribute("href", filename);		 
		  document.getElementsByTagName("head")[0].appendChild(fileref);
		};
		
		var checkRoles = function(okRoles) {
	        // module is available for everyone if okRoles is empty:
	        var ok = (okRoles.length == 0);
	        // else, check existence of required role to activate module:
	        for (var i=0, l=okRoles.length; i<l; i++) {
	            if (GEOR.config.ROLES.indexOf(okRoles[i]) >= 0) {
	                ok = true;
	                break;
	            }
	        }
			return ok;
       
		};
		
		return {
	/*
	 * Public
	 */	
        
      
		 /**
         * APIMethod: create
         * 
		 * Retourne true si une sélection est effectuée dans le Panel Results
         * Parameters:
         * m - {OpenLayers.Map} The map instance.
         */		
		
		create:function(m){
			map = m;			
			addonsListItems = GEOR.config.ADDONS_LIST;
			var menuitems = null;
			if (addonsListItems.length > 0) {			
				menuitems =	new Ext.Action(
					{text: "Géotraitements",
						//toggleGroup: "map",
						id:'menuaddons',						
						handler:lazyLoad,					
						menu: new Ext.menu.Menu({items:[]})
						});						
		}			
			
				
			
			return menuitems;
		}
	}	
})();