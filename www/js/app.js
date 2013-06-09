
// This uses require.js to structure javascript:
// http://requirejs.org/docs/api.html#define

define(function(require) {
    // Receipt verification (https://github.com/mozilla/receiptverifier)
    require('receiptverifier');

    // Installation button
    require('./install-button');

    // Install the layouts
    require('layouts/layouts');

    // Write your app here.

    const DB_NAME = "MenuListDatabase";
    const MENULIST = "MenuList";
    const HISTORIC = "Historic";
    const DB_VERSION = 15;
    var db;

    function openDB() {
    	console.log("openDb ..." + new Date());
    	var request = window.indexedDB.open(DB_NAME, DB_VERSION);
    	request.onerror = function(event) {
    		alert("Why didn't you allow my web app to use IndexedDB?!\nDatabase error: " + event.target.error.name);
    	};
    	request.onsuccess = function(event) {
    		db = request.result;
    	    var objectStore = db.transaction(MENULIST).objectStore(MENULIST);
    	    var list = $('.list').get(0);
    	    objectStore.openCursor().onsuccess = function(event) {
    	    	  var cursor = event.target.result;
    	    	  if (cursor) {
    	    	    list.add({ id: cursor.value.id,
    	    	    	title: cursor.value.jour + ": " + cursor.value.plat,
     	               	jour: cursor.value.jour,
     	               	plat: cursor.value.plat,
     	               	desc: cursor.value.desc });
    	    	    cursor.continue();
    	    	  }
    	    	};
    	    	
    	};
    	request.onupgradeneeded = function(event) {
        	console.log("upgrade needed from " + event.oldVersion + " at " + new Date());
    		db = event.target.result;
        	console.log("Existing objectStores:");
        	for (var i=0; i<db.objectStoreNames.length; i++) {
        		console.log(db.objectStoreNames[i]);
        	}
    		// Create First ObjectStore if needed
    		if (!db.objectStoreNames.contains(MENULIST)) {
    			console.log("Creating " + MENULIST + " ObjectStore.")
				var objectStore = db.createObjectStore(MENULIST, { keyPath: "id" });
				objectStore.createIndex("jourIndex", "jour", { unique: false });
    		}
    		// Create Historic ObjectStore if needed
    		if (!db.objectStoreNames.contains(HISTORIC)) {
    			console.log("Creating " + HISTORIC + " ObjectStore.")
	    		var historicObjectStore = db.createObjectStore(HISTORIC, {keyPath: "meal"});
    		}
        	console.log("Existing objectStores after upgrade:");
        	for (var i=0; i<db.objectStoreNames.length; i++) {
        		console.log(db.objectStoreNames[i]);
        	}
    		alert('Upgrade complete');
    	};
    	request.onblocked = function(event) {
    		  // If some other tab is loaded with the database, then it needs to be closed
    		  // before we can proceed.
    		  alert("Please close all other tabs with this site open!");
    	};
    	
	}

    function store(id, day, meal, description) {
    	var transaction = db.transaction(MENULIST, "readwrite");
    	transaction.oncomplete = function(event) {
    		console.log("Object stored: " + day + ": " + meal);
    	};
     
    	transaction.onerror = function(event) {
    		console.error("Database error (meal store): " + event.target.error.name);
    	};
    	var objectStore = transaction.objectStore(MENULIST);
		var lunch = {
			"id" : id,
			"jour" : day,
			"plat" : meal,
			"desc" : description
		};
		var request = objectStore.put(lunch);
		request.onsuccess = function(event) {
			console.log("on vient de stocker dans la liste des menus: " + lunch.id);
		};
	}
    
    function storeHistoric(meal, description) {
    	var transaction = db.transaction(HISTORIC, "readwrite");
    	transaction.oncomplete = function(event) {
    		console.log("Historic stored: " + meal);
    	};

    	transaction.onerror = function(event) {
    		console.error("Database error (historic update): " + event.target.error.name);
    	};
    	for (var i=0; i<db.objectStoreNames.length; i++) {
    		console.log(db.objectStoreNames[i]);
    	}
    	var objectStore = transaction.objectStore(HISTORIC);
		var historic = {
			"meal" : meal,
			"desc" : description
		};
		console.log(objectStore.count);
		var request = objectStore.put(historic);
		console.log(objectStore.count);
		request.onsuccess = function(event) {
			console.log("On vient de stocker dans l'historique: " + historic.meal);
		};

    }

    console.log("Trying to open db ..." + new Date());
    openDB();
    	
    function formatDate(d) {
        return (d.getMonth()+1) + '/' +
            d.getDate() + '/' +
            d.getFullYear();
    }

    // List view

    var list = $('.list').get(0);

    // Detail view

    var detail = $('.detail').get(0);
    detail.render = function(item) {
        $('.title', this).html(item.get('jour'));
        $('.jour', this).html(item.get('jour'));
        $('.plat', this).html(item.get('plat'));
        $('.desc', this).html(item.get('desc'));
    };

    // Edit view

    var edit = $('.edit').get(0);
    edit.render = function(item) {
        item = item || { id: new Date(), get: function() { return ''; } };

        $('input[name=id]', this).val(item.id);
        $('select[id=jour]', this).val(item.get('jour'));
        $('input[name=plat]', this).val(item.get('plat'));
        $('input[name=desc]', this).val(item.get('desc'));
    };

    edit.getTitle = function() {
        var model = this.view.model;

        if(model) {
            return model.get('jour');
        }
        else {
            return 'New';
        }
    };

    $('button.add', edit).click(function() {
        var el = $(edit);
        var id = el.find('input[name=id]');
        var jour = el.find('select[id=jour]');
        var plat = el.find('input[name=plat]');
        var desc = el.find('input[name=desc]');
        var model = edit.model;

        if(model) {
            model.set({ id: id.val(),
            			title: jour.val() + ': ' + plat.val(),
                        jour: jour.val(),
                        plat: plat.val(),
                        desc: desc.val() });
        }
        else {
            list.add({ id: id.val(),
            		   title: jour.val() +': ' + plat.val(),
                       jour: jour.val(),
                       plat: plat.val(),
                       desc: desc.val() });
        }
        store(id.val(), jour.val(), plat.val(), desc.val());
        storeHistoric(plat.val(), desc.val());
        edit.close();
    });
});
