const DB_NAME = "MenuListDatabase";
const DB_VERSION = 0;
const lunchDatas = [
	{ id: "", day: "", meal: "", description: "" }
];

// This uses require.js to structure javascript:
// http://requirejs.org/docs/api.html#define

define(function(require) {
    // Receipt verification (https://github.com/mozilla/receiptverifier)
    //require('receiptverifier');

    // Write your app here.
	funtion hello() {
		alert("Hello World !");
	}

    function openDB() {
	console.log("openDb ...");
	var request = window.indexedDB.open(DB_NAME, DB_VERSION);
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

    function searchHistoric(meal) {
	console.log("recherche dans l'historique pour " + meal);

    }
    return {searchHistoric:searchHistoric}; 
});
