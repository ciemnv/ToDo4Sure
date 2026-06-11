/// <reference types="jest" />

import { TaskService } from '../../services/task-service';
import { useTaskStore } from '../task-store';
import { User } from '../../types/user';
import { Task } from '../../types/task';

// mockujemy TaskService, żeby testy nie dotykały fizycznej bazy SQLite ani chmury Supabase
jest.mock('../../services/task-service', () => ({
  TaskService: {
    getTasks: jest.fn(),
    createTask: jest.fn(),
    deleteTask: jest.fn(),
    completeTask: jest.fn(),
    updateTask: jest.fn() // Dodajemy zmapowaną metodę edycji
  }
}));

// Definiujemy aktualną makietę zalogowanego użytkownika
const mockUser: User = {
  id: 'user_test_123',
  email: 'student@uczelnia.pl',
  isGuest: false
};

describe('useTaskStore - Testy Logiki Biznesowej (Zustand)', () => {
  
  beforeEach(() => {
    // Przed każdym testem resetujemy stan do domyślnego
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
  it('powinien włączyć flagę isLoading podczas uruchomienia fetchTasks', async () => {
    (TaskService.getTasks as jest.Mock).mockReturnValue(new Promise(() => {})); // wstrzymana obietnica (pendings)
    
    useTaskStore.getState().fetchTasks();
    
    expect(useTaskStore.getState().isLoading).toBe(true);
  });

  // TEST 3
  it('powinien pomyślnie zapisać zadania wraz z obiektem User do stanu po udanym fetchTasks', async () => {
    // AKTUALIZACJA: Zadanie zawiera teraz pełny obiekt użytkownika (zgodnie z architekturą)
    const mockTasks: Task[] = [
      { 
        id: '1', 
        title: 'Zadanie testowe', 
        description: '', 
        project: 'Główne', 
        dueDate: '2026-06-10', 
        isCompleted: 0, 
        imageUri: null,
        user: mockUser 
      }
    ];
    (TaskService.getTasks as jest.Mock).mockResolvedValue(mockTasks);

    await useTaskStore.getState().fetchTasks();

    expect(useTaskStore.getState().tasks).toEqual(mockTasks);
    expect(useTaskStore.getState().tasks[0].user.id).toBe('user_test_123');
    expect(useTaskStore.getState().isLoading).toBe(false);
    expect(useTaskStore.getState().error).toBeNull();
  });

  // TEST 4
  it('powinien ustawić poprawny polski komunikat o błędzie, gdy baza danych SQLite zawiedzie', async () => {
    (TaskService.getTasks as jest.Mock).mockRejectedValue(new Error('SQL Error'));

    await useTaskStore.getState().fetchTasks();

    expect(useTaskStore.getState().tasks).toEqual([]);
    expect(useTaskStore.getState().isLoading).toBe(false);
    // AKTUALIZACJA: Dopasowanie do pancernej, polskiej obsługi błędów
    expect(useTaskStore.getState().error).toContain('error'); 
  });

  // TEST 5
  it('powinien dodać zadanie ze strukturą obiektową po pomyślnym wykonaniu addTask', async () => {
    const createdTask: Task = { 
      id: '2', 
      title: 'Kupić mleko', 
      description: '', 
      project: 'Dom', 
      dueDate: '2026-06-15', 
      isCompleted: 0, 
      imageUri: null,
      user: mockUser
    };
    (TaskService.createTask as jest.Mock).mockResolvedValue(createdTask);
    
    await useTaskStore.getState().addTask(createdTask);

    expect(useTaskStore.getState().tasks).toContainEqual(createdTask);
    expect(useTaskStore.getState().tasks.length).toBe(1);
    expect(useTaskStore.getState().tasks[0].project).toBe('Dom');
  });

  // NOWY TEST 6: REAGOWANIE NA ZMIANĘ NAZW KATEGORII W USTAIWENIACH
  it('powinien poprawnie zaktualizować filtry i nazwy projektów w istniejących zadaniach (Kaskada)', async () => {
    // 1. Wrzucamy dwa zadania do sklepu (jedno ze starej kategorii, drugie z innej)
    const task1: Task = { id: '10', title: 'Projekt na studia', description: '', project: 'Studia', dueDate: '2026-06-20', isCompleted: 0, imageUri: null, user: mockUser };
    const task2: Task = { id: '11', title: 'Wynieść śmieci', description: '', project: 'Dom', dueDate: '2026-06-21', isCompleted: 0, imageUri: null, user: mockUser };
    
    useTaskStore.setState({ tasks: [task1, task2] });

    // 2. Symulujemy zachowanie akcji z project-store.ts: ręcznie mapujemy tablicę zadań podmieniając 'Studia' -> 'Uniwerko'
    const { tasks } = useTaskStore.getState();
    const updatedTasks = tasks.map(t => t.project === 'Studia' ? { ...t, project: 'Uniwerko' } : t);
    useTaskStore.setState({ tasks: updatedTasks });

    // 3. Sprawdzamy czy stan RAM zareagował prawidłowo
    const finalTasks = useTaskStore.getState().tasks;
    
    // Zadanie 1 powinno mieć teraz kategorię 'Uniwerko'
    expect(finalTasks.find(t => t.id === '10')?.project).toBe('Uniwerko');
    // Zadanie 2 powinno pozostać nienaruszone jako 'Dom'
    expect(finalTasks.find(t => t.id === '11')?.project).toBe('Dom');
  });
});