# ToDo4Sure

Aplikajca ToDoList z kamerą
Mobilna aplikacja do zarządzania zadaniami stworzona w React Native + Expo.


## Funkcjonalności:

- Dodawanie zadań (Tytuł, opcjonalny opis, przypisanie kategorii oraz wybór daty realizacji)
- Edycja zawartości oraz usuwanie zadań
- Fltrowanie według kategorii zadania
- Planowanie terminów i modalowy podgląd w interaktywnym kalendarzu
- Praca w trybie offline (pełne wsparcie architektury Offline-First)
- Automatyczna synchronizacja danych z chmurą po odzyskaniu połączenia sieciowego
- Potwierdzanie wykonania zadania poprzez wykonanie zdjęcia wbudowanym aparatem


## Technologie

- React Native
- Expo
- TypeScript
- Expo Router
- Zustand
- SQLite
- Supabase
- NativeWind
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
- Supabase odpowiada za autoryzację i synchronizację danych, dzięki czemu logować się może wiele użytkowników z różnych kont, zachowując swoje dane.








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
3. **Konfiguracja zmiennych środowiskowych**
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://pssiqgrjgdkqhzkyhngv.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=twoj_anon_public_key_supabase
4. **Uruchamianie przez MetroBundler**
   ```bash 
   npx expo start -c
5. **Przełączenie na tryb ExpoGo**
   Jeśli Metro odpala się w trybie development build, przełącz na poprawny tryb Expo Go
   ```bash
   s
6. **Uruchomienie na urządzeniu**
    Otwórz aplikację aparatu i zeskanuj kod QR z aplikacją ExpoGo
7. **Alternatywne uruchomienie z AndroidStudio**
   ```bash
   a 

