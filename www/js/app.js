
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
    const DB_VERSION = 13;
    var db;

    function openDB() {
    	console.log("openDb ..." + new Date());
    	var request = window.indexedDB.open(DB_NAME, DB_VERSION);
    	request.onerror = function(event) {
    		alert("Why didn't you allow my web app to use IndexedDB?!\nDatabase error: " + event.target.errorCode);
    	};
    	request.onsuccess = function(event) {
    		db = request.result;
    	};
    	request.onupgradeneeded = function(event) {
    		var db = event.target.result;
    		db.deleteObjectStore(DB_NAME);
    		var objectStore = db.createObjectStore(DB_NAME, { keyPath: "id" });
    		objectStore.createIndex("jourIndex", "jour", { unique: false });
    		alert('Upgrade complete');
    	};

    	
	}

    function store(id, day, meal, description) {
    	var transaction = db.transaction(DB_NAME, "readwrite");
    	transaction.oncomplete = function(event) {
    		alert("All done!");
    	};
     
    	transaction.onerror = function(event) {
    		// FIXME : Don't forget to handle errors!
    	};
    	var objectStore = transaction.objectStore(DB_NAME);
		var lunch = {
			"id" : new Date(),
			"jour" : day,
			"plat" : meal,
			"desc" : description
		};
		var request = objectStore.add(lunch);
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

    // List view

    var list = $('.list').get(0);
    list.add({ title: 'Lundi: Cr&ecirc;pes',
               jour: 'Lundi',
               plat: 'Cr&ecirc;pes',
               desc: 'Des bonnes cr&ecirc;pes au nutella' });
    list.add({ title: 'Mardi: Soupe',
               jour: 'Mardi',
               plat: 'Soupe',
               desc: 'Une soupe de l&eacute;gume maison' });

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
        item = item || { id: '', get: function() { return ''; } };

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
        var jour = el.find('select[id=jour]');
        var plat = el.find('input[name=plat]');
        var desc = el.find('input[name=desc]');
        var model = edit.model;

        if(model) {
            model.set({ title: jour.val() + ': ' + plat.val(),
                        jour: jour.val(),
                        plat: plat.val(),
                        desc: desc.val() });
        }
        else {
            list.add({ title: jour.val() +': ' + plat.val(),
                       jour: jour.val(),
                       plat: plat.val(),
                       desc: desc.val() });
        }
        store(el.id, jour.val(), plat.val(), desc.val());
        edit.close();
    });
});
