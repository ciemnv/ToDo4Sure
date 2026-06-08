import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TasksScreen from '../(tabs)/index';
import { useTaskStore } from '../../src/store/task-store';
import { Alert } from 'react-native';

// 1. MOCK EXPO NOTIFICATIONS: To naprawia błąd Invariant Violation w środowisku testowym!
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-id'),
  cancelScheduledNotificationAsync: jest.fn(),
}));

// 2. Mockujemy globalny stan Zustand
jest.mock('../../src/store/task-store', () => ({
  useTaskStore: jest.fn()
}));

// 3. Śledzimy wywołania Alertów
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('TasksScreen - Testy Interfejsu i Formularza', () => {
  const mockFetchTasks = jest.fn();
  const mockAddTask = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Stan bazowy do testów renderu komponentu
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

  // TEST 6
  it('powinien poprawnie wyrenderować nagłówek formularza oraz puste pola tekstowe', async () => {
    const { getByPlaceholderText, getByText } = await render(<TasksScreen />);
    
    expect(getByText('Nowe zadanie')).toBeTruthy();
    expect(getByPlaceholderText('Tytuł zadania...')).toBeTruthy();
  });

  // TEST 7
  it('powinien wywołać Alert błędu, gdy użytkownik zatwierdzi formularz z pustym tytułem', async () => {
    const { getByText } = await render(<TasksScreen />);
    
    const submitButton = getByText('Dodaj do listy');
    fireEvent.press(submitButton);

    expect(Alert.alert).toHaveBeenCalledWith('Błąd', 'Tytuł zadania nie może być pusty!');
  });

  // TEST 8
  it('powinien wyświetlić komunikat o ładowaniu (ActivityIndicator), gdy stan isLoading wynosi true', async () => {
    (useTaskStore as unknown as jest.Mock).mockReturnValue({
      tasks: [],
      fetchTasks: mockFetchTasks,
      isLoading: true,
      error: null,
    });

    const { getByText } = await render(<TasksScreen />);
    expect(getByText('Wczytywanie bazy danych SQLite...')).toBeTruthy();
  });

  // TEST 9
  it('powinien poprawnie wyrenderować kafelki zadań, gdy znajdują się w tablicy', async () => {
    const sampleTasks = [
      { id: '10', title: 'Zaliczyć projekt na 4', description: 'Ważne', project: 'Studia', dueDate: '2026-06-12', isCompleted: 0, imageUri: '' }
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