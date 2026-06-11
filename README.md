# ToDo4Sure

Aplikajca ToDoList z kamerą
Mobilna aplikacja do zarządzania zadaniami stworzona w React Native + Expo.


## Funkcjonalności:

### Tworzenie zadań:

Dodajemy zadanie w głównym panelu, po zalogowaniu użytkowników. Do uzupełnienia mamy tytuł, opcjonalnie opis, kategorię oraz datę.

- edycję i usuwanie
- przypisywanie kategorii
- planowanie terminów
- podgląd w kalendarzu
- pracę offline
- synchronizację z chmurą
- logowanie użytkowników
- potwierdzanie wykonania zadania zdjęciem


## Technologie

- React Native
- Expo
- TypeScript
- Expo Router
- Zustand
- SQLite
- Supabase
- NativeWind (TailwindCSS)
- Expo Notifications
- Expo Image Picker
- Jest
- React Native Testing Library

## Architektura projektu

UI Layer -> Zustand Store -> Service Layer -> Repository Layer -> SQLite / Supabase


## Funkcjonalności

### Tworzenie zadań

miejsce na zdjecie

### Kalendarz

miejsce na zdjecie

### Edycja zadania

miejsce na zdjecie

### Logowanie

miejsce na zdjecie



## Testy

npm test

Testy obejmują: logikę Zustand Store, renderowanie ekranów, walidację formularzy


## Decyzje projektowe

- Aby użytkownik mógł korzystać z aplikacji bez internetu, wykorzystaliśmy SQLite jako lokany cache do przechowywania danych
- Zustand został wykorzystany jako globalny magazyn stanu aplikacji. Dzięki temu komponenty nie komunikują się ze sobą bezpośrednio i nie przekazują danych przez wiele poziomów.
- Supabase odpowiada za autoryzację i synchronizację danych, dzięki czemu użytkownik może korzystać z aplikacji na wielu urządzeniach.








## Instrukcja uruchomienia (Środowisko Expo Go)

Aplikacja została stworzona pod kątem uruchomienia w środowisku ExpoGo.

### Wymagania wstępne
1. Zainstalowane środowisko Node.js https://nodejs.org/
2. Zainstalowana aplikacja **Expo Go** na Twoim telefonie.
3. Telefon oraz komputer muszą być podłączone do tej samej sieci Wi-Fi.

### Krok po kroku

1. **Klonowanie repozytorium i wejście do projektu:**
   ```bash
   git clone <link_do_twojego_repozytorium>
   cd to-do-4-sure
2. **Instalacja zależności:**
   ```bash
   npm install
3. **Uruchamianie przez MetroBundler**
   ```bash 
   npx expo start -c
4. **Uruchomienie na urządzeniu**
    Otwórz aplikację aparatu i zeskanuj kod QR z aplikacją ExpoGo
5. **Alternatywne uruchomienie z AndroidStudio**
   ```bash
   a 

> *„Klucze konfiguracyjne Supabase (URL oraz Anon Key) są demonstracyjnie zaimplementowane bezpośrednio w warstwie sieciowej aplikacji, co pozwala na natychmiastowe testowanie chmury bez potrzeby ręcznego tworzenia pliku `.env`.”*
