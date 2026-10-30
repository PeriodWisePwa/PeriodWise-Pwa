const PeriodWiseDB = {

databaseName: "PeriodWiseDatabase",
version: 1,
database: null,

// Open or create the database
open: function () {

return new Promise((resolve, reject) => {

  if (!window.indexedDB) {
    reject(new Error("IndexedDB is not supported by this browser."));
    return;
  }

  const request = indexedDB.open(
    this.databaseName,
    this.version
  );

  request.onupgradeneeded = function (event) {

    const db = event.target.result;

    const stores = [
      "cycleRecords",
      "bbtRecords",
      "lhRecords",
      "symptomRecords",
      "pregnancyTests",
      "ttcNotes",
      "appointments"
    ];

    stores.forEach(function (storeName) {

      if (!db.objectStoreNames.contains(storeName)) {

        db.createObjectStore(storeName, {
          keyPath: "id",
          autoIncrement: true
        });

      }

    });

  };

  request.onsuccess = () => {

    this.database = request.result;

    this.database.onversionchange = () => {
      this.database.close();
      this.database = null;
    };

    resolve(this.database);

  };

  request.onerror = () => {
    reject(request.error);
  };

});

},

// Save a record
save: function (storeName, record) {

return new Promise((resolve, reject) => {

  if (!this.database) {
    reject(new Error("Database is not open."));
    return;
  }

  if (!this.database.objectStoreNames.contains(storeName)) {
    reject(new Error("Unknown database store: " + storeName));
    return;
  }

  const transaction = this.database.transaction(
    storeName,
    "readwrite"
  );

  const store = transaction.objectStore(storeName);

  const request = store.put(record);

  request.onsuccess = () => {
    resolve(request.result);
  };

  request.onerror = () => {
    reject(request.error);
  };

  transaction.onabort = () => {
    reject(transaction.error || new Error("Saving failed."));
  };

});

},

// Retrieve all records from a store
getAll: function (storeName) {

return new Promise((resolve, reject) => {

  if (!this.database) {
    reject(new Error("Database is not open."));
    return;
  }

  if (!this.database.objectStoreNames.contains(storeName)) {
    reject(new Error("Unknown database store: " + storeName));
    return;
  }

  const transaction = this.database.transaction(
    storeName,
    "readonly"
  );

  const store = transaction.objectStore(storeName);

  const request = store.getAll();

  request.onsuccess = () => {
    resolve(request.result);
  };

  request.onerror = () => {
    reject(request.error);
  };

});

},

// Retrieve one record
get: function (storeName, id) {

return new Promise((resolve, reject) => {

  if (!this.database) {
    reject(new Error("Database is not open."));
    return;
  }

  const transaction = this.database.transaction(
    storeName,
    "readonly"
  );

  const request = transaction.objectStore(storeName).get(id);

  request.onsuccess = () => {
    resolve(request.result);
  };

  request.onerror = () => {
    reject(request.error);
  };

});

},

// Delete one record
delete: function (storeName, id) {

return new Promise((resolve, reject) => {

  if (!this.database) {
    reject(new Error("Database is not open."));
    return;
  }

  const transaction = this.database.transaction(
    storeName,
    "readwrite"
  );

  const request = transaction.objectStore(storeName).delete(id);

  request.onsuccess = () => {
    resolve(true);
  };

  request.onerror = () => {
    reject(request.error);
  };

});

},

// Count records in a store
count: function (storeName) {

return new Promise((resolve, reject) => {

  if (!this.database) {
    reject(new Error("Database is not open."));
    return;
  }

  const transaction = this.database.transaction(
    storeName,
    "readonly"
  );

  const request = transaction.objectStore(storeName).count();

  request.onsuccess = () => {
    resolve(request.result);
  };

  request.onerror = () => {
    reject(request.error);
  };

});

}

};
