import * as SQLite from 'expo-sqlite';



//DB.TS to warstwa infrastruktury bazy danych

// Funkcja otwierająca bazę danych
// Operacja asynchroniczna - otwarcie bazy danych nie następuje natychmiast
// poczekaj aż baza zostanie otworzona a następnie przypisz
export const getDBConnection = async () => {
  return await SQLite.openDatabaseAsync('todo4sure.db');
};

// Funkcja tworząca tabelę przy pierwszym uruchomieniu
//zwraca obietnicę bazy danych Promise
export const initDatabase = async () => {
  const db = await getDBConnection();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      project TEXT,
      dueDate TEXT,
      isCompleted INTEGER DEFAULT 0,
      imageUri TEXT
    );
  `);
};