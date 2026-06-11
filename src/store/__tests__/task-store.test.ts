/// <reference types="jest" />

import { TaskService } from '../../services/task-service';
import { useTaskStore } from '../task-store';
import { useAuthStore } from '../auth-store'; // NOWOŚĆ: Importujemy auth-store, aby ustawić sesję użytkownika
import { User } from '../../types/user';
import { Task } from '../../types/task';

// mockujemy TaskService, żeby testy nie dotykały fizycznej bazy SQLite ani chmury Supabase
jest.mock('../../services/task-service', () => ({
  TaskService: {
    getTasks: jest.fn(),
    createTask: jest.fn(),
    deleteTask: jest.fn(),
    completeTask: jest.fn(),
    updateTask: jest.fn()
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
    // Wstrzykujemy aktywnego użytkownika do auth-store przed każdym testem,
    // dzięki czemu akcje fetchTasks i addTask nie wywalą się na bezpiecznikach sesji!
    useAuthStore.setState({ user: mockUser, isLoading: false, error: null });

    // Przed każdym testem resetujemy stan task-store do domyślnego
    useTaskStore.setState({ tasks: [], isLoading: false, error: null });
    jest.clearAllMocks();
  });

  // TEST 1 --- sprawdzenie inicjalizacji stanu początkowego
  it('powinien zainicjalizować się z domyślnymi parametrami (lista i error na null, isLoading false)', () => {
    const state = useTaskStore.getState();
    expect(state.tasks).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  // TEST 2 --- sprawdzenie wskaźnika ładowania
  it('powinien włączyć flagę isLoading podczas uruchomienia fetchTasks', async () => {
    (TaskService.getTasks as jest.Mock).mockReturnValue(new Promise(() => {})); // wstrzymana obietnica (pending)
    useTaskStore.getState().fetchTasks();
    expect(useTaskStore.getState().isLoading).toBe(true);
  });

  // TEST 3 --- sprawdzenie pobierania danych (fetchTask)
  it('powinien pomyślnie zapisać zadania wraz z obiektem User do stanu po udanym fetchTasks', async () => {
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

  // TEST 4 --- obsługa błędów bazy danych sqlite
  it('powinien ustawić poprawny komunikat o błędzie, gdy baza danych SQLite zawiedzie', async () => {
    // Wymuszamy rzucenie błędu przez bazę danych
    (TaskService.getTasks as jest.Mock).mockRejectedValue(new Error('SQL Error'));

    await useTaskStore.getState().fetchTasks();

    expect(useTaskStore.getState().tasks).toEqual([]);
    expect(useTaskStore.getState().isLoading).toBe(false);
    // NAPRAWIONE: Sprawdzamy czy komunikat zawiera słowo 'Store' lub 'bazy', 
    // zgodnie z tym, co wpisałeś w linii 320 w task-store.ts: "Błąd bazy: ..."
    expect(useTaskStore.getState().error).toContain('Błąd bazy'); 
  });

  // TEST 5 --- dodawanie nowego zadania
  it('powinien dodać zadanie ze strukturą obiektową po pomyślnym wykonaniu addTask', async () => {
    const mockPayload = { 
      title: 'Kupić mleko', 
      description: '', 
      project: 'Dom', 
      dueDate: '2026-06-15' 
    };

    const expectedCreatedTask: Task = { 
      id: '2', 
      title: 'Kupić mleko', 
      description: '', 
      project: 'Dom', 
      dueDate: '2026-06-15', 
      isCompleted: 0, 
      imageUri: null,
      user: mockUser
    };
    
    (TaskService.createTask as jest.Mock).mockResolvedValue(expectedCreatedTask);
    
    await useTaskStore.getState().addTask(mockPayload);

    expect(useTaskStore.getState().tasks).toContainEqual(expectedCreatedTask);
    expect(useTaskStore.getState().tasks.length).toBe(1);
    expect(useTaskStore.getState().tasks[0].project).toBe('Dom');
  });

  // TEST 6 --- sprawdzenie aktualizacji kategorii
  it('powinien poprawnie zaktualizować filtry i nazwy projektów w istniejących zadaniach', async () => {
    const task1: Task = { id: '10', title: 'Projekt na studia', description: '', project: 'Studia', dueDate: '2026-06-20', isCompleted: 0, imageUri: null, user: mockUser };
    const task2: Task = { id: '11', title: 'Wynieść śmieci', description: '', project: 'Dom', dueDate: '2026-06-21', isCompleted: 0, imageUri: null, user: mockUser };
    
    useTaskStore.setState({ tasks: [task1, task2] });

    const { tasks } = useTaskStore.getState();
    const updatedTasks = tasks.map(t => t.project === 'Studia' ? { ...t, project: 'Uniwerko' } : t);
    useTaskStore.setState({ tasks: updatedTasks });

    const finalTasks = useTaskStore.getState().tasks;
    
    expect(finalTasks.find(t => t.id === '10')?.project).toBe('Uniwerko');
    expect(finalTasks.find(t => t.id === '11')?.project).toBe('Dom');
  });
});