
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
    const DB_VERSION = 14;
    var db;

    function openDB() {
    	console.log("openDb ..." + new Date());
    	var request = window.indexedDB.open(DB_NAME, DB_VERSION);
    	request.onerror = function(event) {
    		alert("Why didn't you allow my web app to use IndexedDB?!\nDatabase error: " + event.target.error.name);
    	};
    	request.onsuccess = function(event) {
    		db = request.result;
    	    var objectStore = db.transaction(DB_NAME).objectStore(DB_NAME);
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
    		db = event.target.result;
    		var objectStore = db.createObjectStore(DB_NAME, { keyPath: "id" });
    		objectStore.createIndex("jourIndex", "jour", { unique: false });
    		alert('Upgrade complete');
    	};

    	
	}

    function store(id, day, meal, description) {
    	var transaction = db.transaction(DB_NAME, "readwrite");
    	transaction.oncomplete = function(event) {
    		console.log("Object stored: " + day + ": " + meal);
    	};
     
    	transaction.onerror = function(event) {
    		// FIXME : Don't forget to handle errors!
    	};
    	var objectStore = transaction.objectStore(DB_NAME);
		var lunch = {
			"id" : id,
			"jour" : day,
			"plat" : meal,
			"desc" : description
		};
		var request = objectStore.put(lunch);
		request.onsuccess = function(event) {
			console.log("on vient de stocker dans la DB: " + lunch.id);
		};
	}
    
    openDB();
    	
    function formatDate(d) {
        return (d.getMonth()+1) + '/' +
            d.getDate() + '/' +
            d.getFullYear();
    }

    function searchHistoric(meal) {
	console.log("recherche dans l'historique pour " + meal);
	return meal + " nada";	
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
    	$('input[name=plat]', this).addEventListener('compositionupdate', function(){alert('Hello world');}, false);
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

	// recherche dans l'historique
	//var platH = app.searchHistoric(plat.val);
	var platH = searchHistoric(plat.val());

        if(model) {
            model.set({ id: id.val(),
            			title: jour.val() + ': ' + platH,
                        jour: jour.val(),
                        plat: platH,
                        desc: desc.val() });
        }
        else {
            list.add({ id: id.val(),
            		   title: jour.val() +': ' + platH,
                       jour: jour.val(),
                       plat: platH,
                       desc: desc.val() });
        }
        store(id.val(), jour.val(), platH, desc.val());
        edit.close();
    });
});
