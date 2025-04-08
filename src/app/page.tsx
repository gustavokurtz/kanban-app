'use client'

import * as React from "react"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { PlusCircle, Clock, X, RefreshCw } from "lucide-react"

// ===============================================
// Tipos e Interfaces
// ===============================================

interface Task {
  id: string;
  title: string;
  timeRange: string;
  column: ColumnType;
  createdAt: string; // Data de criação no formato ISO
}

type ColumnType = 'todo' | 'doing' | 'done';

interface ColumnData {
  title: string;
  column: ColumnType;
  color: string;
  tasks: Task[];
  input: string;
  setInput: (value: string) => void;
}

interface TaskCardProps {
  task: Task;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  onRemove: (id: string) => void;
  isDefaultTask: (id: string) => boolean;
}

interface KanbanColumnProps {
  title: string;
  column: ColumnType;
  color: string;
  tasks: Task[];
  onDrop: (taskId: string, newColumn: ColumnType) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  draggedId: string | null;
  onRemoveTask: (id: string) => void;
  onAddTask: (column: ColumnType, title: string) => void;
  newTaskTitle: string;
  setNewTaskTitle: (value: string) => void;
  isDefaultTask: (id: string) => boolean;
}

// ===============================================
// Constantes e Dados Iniciais
// ===============================================

// Tarefas iniciais que sempre serão mostradas na coluna "A Fazer"
const initialTasks: Omit<Task, 'createdAt'>[] = [
  {
    id: 'task-1',
    title: 'Coletar e-mails de conexões do LinkedIn via Apollo',
    timeRange: '9h - 10h',
    column: 'todo'
  },
  {
    id: 'task-2',
    title: 'Pesquisar domínios de empresas via Hunter.io e enviar e-mails para colaboradores',
    timeRange: '10h - 11h30',
    column: 'todo'
  },
  {
    id: 'task-3',
    title: 'Aplicar para 20 vagas Easy Apply no LinkedIn',
    timeRange: '11h30 - 12h',
    column: 'todo'
  }
];

// Chave para armazenamento no localStorage
const STORAGE_KEY = 'kanban-tasks-daily';

// ===============================================
// Funções Utilitárias
// ===============================================

// Função utilitária para combinar classes condicionalmente
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Formatação da data para exibição (sem dependência externa date-fns)
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// Verifica se é hora de resetar (6h da manhã)
const isResetTime = (lastResetDate: string | null): boolean => {
  if (!lastResetDate) return true;
  
  const now = new Date();
  const lastReset = new Date(lastResetDate);
  
  // Se for um novo dia e já passou das 6h da manhã
  return (
    now.getDate() !== lastReset.getDate() || 
    now.getMonth() !== lastReset.getMonth() || 
    now.getFullYear() !== lastReset.getFullYear()
  ) && now.getHours() >= 6;
};

// Função para verificar se é uma tarefa padrão pelo ID
const isDefaultTaskById = (taskId: string): boolean => {
  return initialTasks.some(task => task.id === taskId);
};

// ===============================================
// Componentes
// ===============================================

// Componente de cartão de tarefa
const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onDragStart, 
  onDragEnd, 
  isDragging, 
  onRemove,
  isDefaultTask 
}) => {
  // Verifica se é uma tarefa padrão
  const isDefaultTaskCard = isDefaultTask(task.id);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('taskId', task.id);
        onDragStart(task.id);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "bg-indigo-900/50 border-0 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] cursor-move relative",
        isDragging && "shadow-xl"
      )}
    >
      {/* Apenas mostrar o botão de remover se não for uma tarefa padrão ou se a tarefa padrão não estiver na coluna "todo" */}
      {(!isDefaultTaskCard || task.column !== 'todo') && (
        <button 
          onClick={() => onRemove(task.id)}
          className="absolute top-2 right-2 text-violet-300 hover:text-white transition-colors"
          title="Remover tarefa"
        >
          <X size={14} />
        </button>
      )}
      <div className="p-3 pb-1">
        <h3 className="text-sm font-semibold text-white pr-5">{task.title}</h3>
      </div>
      <div className="pt-0 pb-3 px-3">
        <div className="flex items-center text-xs text-violet-300 mt-2">
          <Clock className="h-3 w-3 mr-1 text-violet-400" />
          <span>{task.timeRange}</span>
        </div>
      </div>
    </div>
  );
};

// Componente de coluna do Kanban
const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
  title, 
  column, 
  color, 
  tasks, 
  onDrop, 
  onDragStart, 
  onDragEnd, 
  draggedId,
  onRemoveTask,
  onAddTask,
  newTaskTitle,
  setNewTaskTitle,
  isDefaultTask
}) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onDrop(taskId, column);
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(column, newTaskTitle);
      setNewTaskTitle('');
    } else {
      toast.error("O título da tarefa não pode estar vazio");
    }
  };

  return (
    <div className="flex flex-col rounded-xl overflow-hidden backdrop-blur-sm bg-indigo-900/30 shadow-xl border border-indigo-700/30 h-full">
      <div className={`p-4 bg-gradient-to-r ${color} font-medium flex items-center justify-between`}>
        <h2 className="font-bold">{title}</h2>
        <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">
          {tasks.length}
        </span>
      </div>
      <div 
        className="flex flex-col gap-4 p-5 flex-grow"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                isDragging={draggedId === task.id}
                onRemove={onRemoveTask}
                isDefaultTask={isDefaultTask}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-grow p-6">
            <div className="w-16 h-16 rounded-full bg-indigo-800/30 flex items-center justify-center mb-4">
              <PlusCircle className="h-8 w-8 text-violet-500/60" />
            </div>
            <p className="text-sm text-violet-300/70">Arraste cartões para esta coluna</p>
          </div>
        )}
        
        <div className="mt-auto pt-4">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Título da nova tarefa..."
              className="w-full px-3 py-2 bg-indigo-900/40 border border-indigo-700/50 rounded-lg text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddTask();
                }
              }}
            />
          </div>
          <Button 
            variant="ghost" 
            className="w-full group bg-indigo-900/20 hover:bg-indigo-900/40 border-0 text-white rounded-lg py-3 transition-all duration-300 flex items-center justify-center"
            onClick={handleAddTask}
          >
            <PlusCircle className="h-4 w-4 mr-2 text-violet-400 group-hover:text-violet-300" />
            <span>Adicionar cartão</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

// ===============================================
// Componente Principal
// ===============================================

export default function Home() {
  // Estados
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [lastResetDate, setLastResetDate] = useState<string | null>(null);
  
  // Estado para os inputs de novas tarefas
  const [todoInput, setTodoInput] = useState<string>('');
  const [doingInput, setDoingInput] = useState<string>('');
  const [doneInput, setDoneInput] = useState<string>('');

  // Referência para o intervalo de verificação de reset
  const resetCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Data formatada para exibição
  const today = formatDate(new Date());

  // ===============================================
  // Funções de gerenciamento de tarefas e localStorage
  // ===============================================

  // Filtrar tarefas por coluna
  const getTasksByColumn = (column: ColumnType): Task[] => {
    return tasks.filter(task => task.column === column);
  };
  
  // Filtrar tarefas que precisam ser salvas (excluindo tarefas padrão na coluna "todo")
  const getTasksToSave = (taskList: Task[]): Task[] => {
    return taskList.filter(task => {
      return !(isDefaultTaskById(task.id) && task.column === 'todo');
    });
  };
  
  // Salvar tarefas no localStorage
  const saveTasks = (taskList: Task[]) => {
    if (loading) return;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tasks: taskList,
      lastReset: new Date().toISOString()
    }));
  };

  // Função para verificar se é uma tarefa padrão
  const isDefaultTask = (taskId: string): boolean => {
    return isDefaultTaskById(taskId);
  };

  // Criar tarefas padrão para hoje
  const createDefaultTasks = (): Task[] => {
    return initialTasks.map(task => ({
      ...task,
      createdAt: new Date().toISOString()
    }));
  };
  
  // Função para resetar as tarefas (todas para a coluna "A Fazer")
  const resetTasks = () => {
    // Criar novas tarefas padrão
    const defaultTasks = createDefaultTasks();
    
    // Restaurar as tarefas para apenas as padrão na coluna "A Fazer"
    setTasks(defaultTasks);
    
    // Limpar os inputs
    setTodoInput('');
    setDoingInput('');
    setDoneInput('');
    
    // Atualizar a data do último reset
    const now = new Date().toISOString();
    setLastResetDate(now);
    
    // Salvar no localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tasks: defaultTasks,
      lastReset: now
    }));
    
    toast.success("Tarefas reiniciadas para o novo dia");
  };

  // Verificar se precisa resetar as tarefas (chamado periodicamente)
  const checkAndResetTasks = () => {
    if (isResetTime(lastResetDate)) {
      resetTasks();
    }
  };

  // ===============================================
  // Effects
  // ===============================================

  // Carregar dados do localStorage ou inicializar com os dados padrão
  useEffect(() => {
    setLoading(true);
    
    // Limpar os inputs inicialmente
    setTodoInput('');
    setDoingInput('');
    setDoneInput('');
    
    // Função para carregamento de dados
    const loadTasks = async () => {
      try {
        // Verificar se existem tarefas salvas
        const savedData = localStorage.getItem(STORAGE_KEY);
        
        if (savedData) {
          // Se existem tarefas salvas, carregá-las
          const { tasks: savedTasks, lastReset } = JSON.parse(savedData);
          setTasks(savedTasks);
          setLastResetDate(lastReset);
          
          // Verificar se precisa resetar as tarefas (novo dia após 6h)
          if (isResetTime(lastReset)) {
            resetTasks();
          }
        } else {
          // Caso não exista, criar novas tarefas padrão
          const defaultTasks = createDefaultTasks();
          setTasks(defaultTasks);
          
          // Definir a data de hoje como último reset
          const now = new Date().toISOString();
          setLastResetDate(now);
          
          // Salvar no localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            tasks: defaultTasks,
            lastReset: now
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
        
        // Em caso de erro, carregamos tarefas padrão
        const defaultTasks = createDefaultTasks();
        setTasks(defaultTasks);
        
        const now = new Date().toISOString();
        setLastResetDate(now);
      } finally {
        setLoading(false);
      }
    };
    
    // Pequeno atraso para mostrar o carregamento
    const timer = setTimeout(loadTasks, 300);
    
    // Limpar o timer se o componente for desmontado
    return () => clearTimeout(timer);
  }, []);

  // Configurar verificação periódica para o reset automático
  useEffect(() => {
    // Verificar a cada minuto se é hora de resetar
    resetCheckIntervalRef.current = setInterval(checkAndResetTasks, 60000);
    
    // Limpar o intervalo quando o componente for desmontado
    return () => {
      if (resetCheckIntervalRef.current) {
        clearInterval(resetCheckIntervalRef.current);
      }
    };
  }, [lastResetDate]);

  // Salvar tarefas quando elas forem alteradas
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks, loading]);

  // ===============================================
  // Manipuladores de eventos
  // ===============================================
  
  // Restaurar tarefas para o estado inicial
  const handleRestoreTasks = () => {
    resetTasks();
    toast.success("Tarefas restauradas com sucesso");
  };

  // Funções de arrastar e soltar
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const handleDrop = (taskId: string, newColumn: ColumnType) => {
    const task = tasks.find(t => t.id === taskId);
    
    // Se estamos arrastando uma tarefa padrão para a coluna "A Fazer",
    // não precisamos fazer nada
    if (isDefaultTask(taskId) && newColumn === 'todo') {
      return;
    }
    
    if (task && task.column !== newColumn) {
      // Criar um novo array de tarefas para garantir que o estado é realmente atualizado
      const updatedTasks: Task[] = tasks.map(t => 
        t.id === taskId ? { ...t, column: newColumn } : t
      );
      
      setTasks(updatedTasks);
      
      // Mostrar notificação
      toast.success(`Tarefa movida para ${
        newColumn === 'todo' ? 'A Fazer' : 
        newColumn === 'doing' ? 'Em Andamento' : 'Concluído'
      }`);
    }
  };

  // Adicionar nova tarefa
  const handleAddTask = (column: ColumnType, title: string) => {
    if (!title.trim()) {
      toast.error("O título da tarefa não pode estar vazio");
      return;
    }
    
    // Obter hora atual formatada
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      timeRange: `${hours}:${minutes} - ?`,
      column,
      createdAt: now.toISOString()
    };
    
    // Criar novo array para garantir mudança de estado
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    
    // Limpar o campo após adicionar
    if (column === 'todo') setTodoInput('');
    if (column === 'doing') setDoingInput('');
    if (column === 'done') setDoneInput('');
    
    toast.success("Tarefa adicionada com sucesso");
  };

  // Remover tarefa
  const handleRemoveTask = (taskId: string) => {
    // Se for uma tarefa padrão na coluna "A Fazer", não permitir remoção
    const task = tasks.find(t => t.id === taskId);
    
    if (task && isDefaultTask(taskId) && task.column === 'todo') {
      toast.error("As tarefas padrão na coluna 'A Fazer' não podem ser removidas");
      return;
    }
    
    // Para tarefas padrão em outras colunas, apenas move de volta para "A Fazer"
    if (isDefaultTask(taskId)) {
      const updatedTasks: Task[] = tasks.map(t => 
        t.id === taskId ? { ...t, column: 'todo' } : t
      );
      setTasks(updatedTasks);
      
      toast.success("Tarefa movida de volta para 'A Fazer'");
      return;
    }
    
    // Para tarefas não padrão, remover normalmente
    const updatedTasks: Task[] = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    
    toast.success("Tarefa removida com sucesso");
  };

  // ===============================================
  // Dados e configuração das colunas
  // ===============================================
  
  // Dados das colunas
  const columns: ColumnData[] = [
    {
      title: 'A Fazer',
      column: 'todo',
      color: 'from-pink-500 to-purple-500',
      tasks: getTasksByColumn('todo'),
      input: todoInput,
      setInput: setTodoInput
    },
    {
      title: 'Em Andamento',
      column: 'doing',
      color: 'from-violet-500 to-indigo-500',
      tasks: getTasksByColumn('doing'),
      input: doingInput,
      setInput: setDoingInput
    },
    {
      title: 'Concluído',
      column: 'done',
      color: 'from-fuchsia-500 to-pink-500',
      tasks: getTasksByColumn('done'),
      input: doneInput,
      setInput: setDoneInput
    }
  ];

  // ===============================================
  // Renderização do componente
  // ===============================================
  
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-purple-800 text-white p-4 md:p-6">
      {/* Toast Container */}
      <Toaster richColors closeButton position="top-right" />
      
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Cabeçalho do Kanban com efeito de vidro */}
        <div className="backdrop-blur-md bg-white/10 rounded-xl p-5 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-purple-100">
                Kanban Diário de Tarefas
              </h1>
              <p className="text-violet-300 mt-1">
                Hoje: {today} • Atualização automática às 6h
              </p>
            </div>
            <Button 
              className="w-full md:w-auto bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 text-white transition-all duration-300 border-0 rounded-lg shadow-lg hover:shadow-violet-500/20 flex items-center gap-2"
              onClick={handleRestoreTasks}
            >
              <RefreshCw className="h-4 w-4" />
              Restaurar Tarefas
            </Button>
          </div>
        </div>

        {/* Colunas do Kanban */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-300"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map(column => (
              <KanbanColumn
                key={column.column}
                title={column.title}
                column={column.column}
                color={column.color}
                tasks={column.tasks}
                onDrop={handleDrop}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                draggedId={draggedId}
                onRemoveTask={handleRemoveTask}
                onAddTask={handleAddTask}
                newTaskTitle={column.input}
                setNewTaskTitle={column.setInput}
                isDefaultTask={isDefaultTask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}