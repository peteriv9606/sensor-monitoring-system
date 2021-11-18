const sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "db.sqlite3"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message)
        throw err
    } else {
        console.log('Connected to the SQLite database.')
        const sensorsTable =
            `CREATE TABLE IF NOT EXISTS "sensors" (
            "sensor_id"	  TEXT UNIQUE,
            "name"	TEXT,
            "isActive"   INTEGER,
            "onSocket"   TEXT,
            PRIMARY KEY("sensor_id")            
        )`
        const dataTable =
            `CREATE TABLE IF NOT EXISTS "data" (
            "id"	INTEGER,
            "sensor_id"    TEXT,
            "temperature"	INTEGER,
            "humidity"	INTEGER,
            "created_at"    INTEGER,
            FOREIGN KEY (sensor_id)
                REFERENCES sensors (s_id) 
            PRIMARY KEY("id" AUTOINCREMENT)            
        )`
        db.run(sensorsTable);
        db.run(dataTable);
    }
});


module.exports = db


/*

INSERT INTO data (sensor_id, temperature, humidity)
VALUES (1, 22, 2);

*/