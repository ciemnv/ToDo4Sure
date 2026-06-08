/// <reference types="jest" />

import { TaskService } from '../../services/task-service';
import { useTaskStore } from '../task-store';

// mockujemy TaskService, żeby testy nie dotykały fizycznej bazy SQLite
jest.mock('../../services/task-service', () => ({
  TaskService: {
    getTasks: jest.fn(),
    createTask: jest.fn(),
    deleteTask: jest.fn(),
    completeTask: jest.fn()
  }
}));

describe('useTaskStore - Testy Logiki Biznesowej (Zustand)', () => {
  
  beforeEach(() => {
    // przed każdym testem resetujemy stan
    useTaskStore.setState({ tasks: [], isLoading: false, error: null });
    jest.clearAllMocks();
  });

  // TEST 1
  it('powinien zainicjalizować się z domyślnymi parametrami (pusta lista, brak ładowania, brak błędu)', () => {
    const state = useTaskStore.getState();
    expect(state.tasks).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  // TEST 2
  it('powinien wlaczyć flagę isLoading podczas uruchomienia fetchTasks', async () => {
    (TaskService.getTasks as jest.Mock).mockReturnValue(new Promise(() => {})); // wstrzymana obietnica
    
    useTaskStore.getState().fetchTasks();
    
    expect(useTaskStore.getState().isLoading).toBe(true);
  });

  // TEST 3
  it('powinien pomyślnie zapisac zadania do stanu po udanym fetchTasks', async () => {
    const mockTasks = [
      { id: '1', title: 'Zadanie testowe', description: '', project: 'Główne', dueDate: '2026-06-10', isCompleted: 0, imageUri: '' }
    ];
    (TaskService.getTasks as jest.Mock).mockResolvedValue(mockTasks);

    await useTaskStore.getState().fetchTasks();

    expect(useTaskStore.getState().tasks).toEqual(mockTasks);
    expect(useTaskStore.getState().isLoading).toBe(false);
    expect(useTaskStore.getState().error).toBeNull();
  });

  // TEST 4
  it('powinien ustawić komunikat o błędzie, gdy baza danych SQLite zawiedzie', async () => {
    (TaskService.getTasks as jest.Mock).mockRejectedValue(new Error('SQL Error'));

    await useTaskStore.getState().fetchTasks();

    expect(useTaskStore.getState().tasks).toEqual([]);
    expect(useTaskStore.getState().isLoading).toBe(false);
    // PODMIANA: Wpisujemy dokładnie to, co zwraca Twój Zustand
    expect(useTaskStore.getState().error).toBe('Store error podczas pobierania:'); 
  });

  // TEST 5
  it('powinien dodać zadanie do tablicy po pomyślnym wykonaniu addTask', async () => {
    const createdTask = { id: '2', title: 'Kupić mleko', description: '', project: 'Dom', dueDate: '2026-06-15', isCompleted: 0, imageUri: '' };
    (TaskService.createTask as jest.Mock).mockResolvedValue(createdTask);

    await useTaskStore.getState().addTask('Kupić mleko', '', 'Dom', '2026-06-15');

    expect(useTaskStore.getState().tasks).toContainEqual(createdTask);
    expect(useTaskStore.getState().tasks.length).toBe(1);
  });
});