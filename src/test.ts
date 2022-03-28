import Client from ".";

const db = new Client();

db.set('test', 'test');
db.get('nonexistant');
db.delete('nonexistant');
db.list();
db.empty();
db.getAll();
db.setAll({test: 'test'});
db.deleteMultiple('test', 'test');