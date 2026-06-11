import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TasksScreen from '../(tabs)/index';
import { useTaskStore } from '../../src/store/task-store';
import { useProjectStore } from '../../src/store/project-store'; 
import { Alert } from 'react-native';
import { User } from '../../src/types/user';

// 1. MOCK EXPO NOTIFICATIONS
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-id'),
  cancelScheduledNotificationAsync: jest.fn(),
}));

// 2. Mockujemy globalny stan Zustand dla zadań
jest.mock('../../src/store/task-store', () => ({
  useTaskStore: jest.fn()
}));

// 3. NOWOŚĆ: Mockujemy globalny stan Zustand dla 3 dynamicznych projektów
jest.mock('../../src/store/project-store', () => ({
  useProjectStore: jest.fn()
}));

// 4. Śledzimy wywołania Alertów
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Makieta użytkownika do wstrzyknięcia w strukturę zadań
const mockUser: User = {
  id: 'user_dev_999',
  email: 'test@domain.com',
  isGuest: false
};

describe('TasksScreen - Testy Interfejsu i Formularza', () => {
  const mockFetchTasks = jest.fn();
  const mockAddTask = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Konfigurujemy domyślny zwracany stan dla projektów (3 stałe sloty)
    (useProjectStore as unknown as jest.Mock).mockReturnValue({
      projects: ['Główne', 'Studia', 'Dom'],
    });

    // Stan bazowy do testów renderu komponentu zadań
    (useTaskStore as unknown as jest.Mock).mockReturnValue({
      tasks: [],
      fetchTasks: mockFetchTasks,
      addTask: mockAddTask,
      deleteTask: jest.fn(),
      completeTask: jest.fn(),
      isLoading: false,
      error: null,
    });
  });

  // TEST 1 --- renderowanie formularza
  it('powinien poprawnie wyrenderować nagłówek formularza oraz puste pola tekstowe', async () => {
    const { getByPlaceholderText, getByText } = await render(<TasksScreen />);
    
    expect(getByText('Nowe zadanie')).toBeTruthy();
    expect(getByPlaceholderText('Tytuł zadania...')).toBeTruthy();
  });

  // TEST 2 --- walidacja pustego formularza
  it('powinien wywołać Alert błędu, gdy użytkownik zatwierdzi formularz z pustym tytułem', async () => {
    const { getByText } = await render(<TasksScreen />);
    
    const submitButton = getByText('Dodaj do listy');
    fireEvent.press(submitButton);

    expect(Alert.alert).toHaveBeenCalledWith('Błąd', 'Tytuł zadania nie może być pusty!');
  });

  // TEST 3 --- wyswietlanie ladowania
  it('powinien wyświetlić komunikat o ładowaniu, gdy stan isLoading wynosi true', async () => {
    (useTaskStore as unknown as jest.Mock).mockReturnValue({
      tasks: [],
      fetchTasks: mockFetchTasks,
      isLoading: true,
      error: null,
    });

    const { getByText } = await render(<TasksScreen />);
    // Szukamy tekstu ładowania (metoda elastyczna .toContain w razie drobnych zmian w stringu)
    expect(getByText(/Wczytywanie/i)).toBeTruthy();
  });

  // TEST 4 --- wyswietlanie listy zadan
  it('powinien poprawnie wyrenderować kafelki zadań wraz z ich terminami', async () => {
    // AKTUALIZACJA: Dopasowanie struktury danych do pełnego modelu z obiektem user oraz imageUri jako null
    const sampleTasks = [
      { 
        id: '10', 
        title: 'Zaliczyć projekt na 4', 
        description: 'Ważne', 
        project: 'Studia', 
        dueDate: '2026-06-12', 
        isCompleted: 0, 
        imageUri: null,
        user: mockUser
      }
    ];
    
    (useTaskStore as unknown as jest.Mock).mockReturnValue({
      tasks: sampleTasks,
      fetchTasks: mockFetchTasks,
      isLoading: false,
      error: null,
    });

    const { getByText } = await render(<TasksScreen />);
    
    expect(getByText('Zaliczyć projekt na 4')).toBeTruthy();
    expect(getByText('Do: 2026-06-12')).toBeTruthy();
  });
});