const PeriodWiseDB = {

  databaseName: "PeriodWiseDatabase",

  version: 1,

  database: null,

  open: function() {

    return new Promise((resolve, reject) => {

      const request = indexedDB.open(
        this.databaseName,
        this.version
      );

      request.onupgradeneeded = function(event) {

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

        stores.forEach(storeName => {

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

        resolve(this.database);

      };

      request.onerror = () => {

        reject(request.error);

      };

    });

  },

  save: function(storeName, record) {

    return new Promise((resolve, reject) => {

      const transaction =
        this.database.transaction(storeName, "readwrite");

      const store = transaction.objectStore(storeName);

      const request = store.put(record);

      request.onsuccess = () => resolve(request.result);

      request.onerror = () => reject(request.error);

    });

  },

  getAll: function(storeName) {

    return new Promise((resolve, reject) => {

      const transaction =
        this.database.transaction(storeName, "readonly");

      const store = transaction.objectStore(storeName);

      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);

      request.onerror = () => reject(request.error);

    });

  }

};
