
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
const DB_VERSION = 0;
const lunchDatas = [
	{ id: "", day: "", meal: "", description: "" }
];

    function openDB() {
	alert(window.indexedDB);
	console.log("openDb ...");
	//var request = window.indexedDB.open(DB_NAME, DB_VERSION);
	var request = window.indexedDB.open('MenuListDatabase', DB_VERSION);
	request.onerror = function(event) {
		alert("Why didn't you allow my web app to use IndexedDB?!\nDatabase error: " + event.target.errorCode);
	};
	request.onsuccess = function(event) {
		db = request.result;
	};
	request.onupgradeneeded = function(event) {
		// Update object stores and indices ....
	};

	// Create an objectStore to hold information about our customers. We're
	// going to use "ssn" as our key path because it's guaranteed to be
	// unique.
	var objectStore = db.createObjectStore(DB_NAME, { keyPath: "id" });
 
	// Create an index to search customers by name. We may have duplicates
	// so we can't use a unique index.
	objectStore.createIndex("day", "day", { unique: false });

	// Create an index to search customers by email. We want to ensure that
	// no two customers have the same email, so use a unique index.
	objectStore.createIndex("id", "id", { unique: true });
	
	var transaction = db.transaction([DB_NAME], "readwrite");
	transaction.oncomplete = function(event) {
		alert("All done!");
	};
 
	transaction.onerror = function(event) {
		// FIXME : Don't forget to handle errors!
	};
 
    }

    function store(id, day, meal, description) {
	// TODO : récupérer les données de l'IHM
	// Store values in the newly created objectStore.
	var lunch = {
		"id": id,
		"day": day,
		"meal": meal,
		"description": description
	};
	objectStore.add(lunch);
	request.onsuccess = function(event) {
    		event.target.result == lunch.id
		// TODO : il faudrait peut-être exploiter ça
		console.log("on vient de stocker dans la DB: " + lunch.id);
	};
    }

    function formatDate(d) {
        return (d.getMonth()+1) + '/' +
            d.getDate() + '/' +
            d.getFullYear();
    }

    openDB();

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
        $('input[name=jour]', this).val(item.get('jour'));
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
        var jour = el.find('input[name=jour]');
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
	storeDB(el.id, jour, plat, desc);
        edit.close();
    });
});
