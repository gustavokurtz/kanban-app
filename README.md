# Kanban Diário de Tarefas

Um aplicativo Kanban moderno e intuitivo para gerenciar suas tarefas diárias, com reset automático todas as manhãs.

![Screenshot do aplicativo Kanban](/fotoapp.png)

## Visão Geral

O Kanban Diário de Tarefas é uma aplicação web desenvolvida com React e Next.js que permite organizar suas tarefas diárias em um formato visual de quadro Kanban. A aplicação foi projetada especificamente para o gerenciamento diário de tarefas, com uma funcionalidade de reset automático que coloca todas as tarefas de volta na coluna "A Fazer" às 6h da manhã a cada dia.

## Recursos

- **Interface moderna**: Design elegante com efeitos de vidro (glassmorphism) e gradientes
- **Três colunas Kanban**: "A Fazer", "Em Andamento" e "Concluído"
- **Drag and Drop**: Arraste tarefas facilmente entre as colunas
- **Tarefas padrão**: Conjunto inicial de tarefas para ajudar a estruturar seu dia
- **Persistência de dados**: Suas tarefas são salvas no localStorage do navegador
- **Reset automático diário**: Todas as tarefas voltam para "A Fazer" às 6h da manhã
- **Reset manual**: Botão para restaurar o quadro ao estado inicial quando desejar
- **Notificações toast**: Feedback visual para todas as ações
- **Design responsivo**: Funciona perfeitamente em dispositivos móveis e desktop

## Tecnologias

- React.js
- Next.js
- Tailwind CSS
- TypeScript
- Shadcn UI Components
- Lucide React (ícones)
- Sonner (notificações toast)

## Estrutura do Código

### Componentes Principais

- **Home**: Componente principal que gerencia o estado e a lógica da aplicação
- **KanbanColumn**: Componente para renderizar cada coluna do quadro Kanban
- **TaskCard**: Componente para renderizar cada cartão de tarefa

### Tipos e Interfaces

- **Task**: Define a estrutura de uma tarefa (id, título, intervalo de tempo, coluna, data de criação)
- **ColumnType**: Define os tipos de coluna ('todo', 'doing', 'done')
- **ColumnData**: Define a estrutura e propriedades de uma coluna

### Funções Principais

- **getTasksByColumn**: Filtra tarefas por coluna
- **resetTasks**: Restaura o quadro para o estado inicial
- **handleDrop**: Gerencia a movimentação de tarefas entre colunas
- **handleAddTask**: Adiciona novas tarefas
- **handleRemoveTask**: Remove tarefas ou move tarefas padrão de volta para "A Fazer"
- **checkAndResetTasks**: Verifica periodicamente se é hora de resetar as tarefas

## Lógica de Reset Diário

A aplicação verifica se é necessário resetar as tarefas nas seguintes situações:

1. Quando o aplicativo é carregado pela primeira vez
2. A cada minuto, por meio de um intervalo programado
3. Manualmente quando o botão "Restaurar Tarefas" é clicado

O reset automático ocorre quando:
- É um novo dia em relação ao último reset
- A hora atual é 6h da manhã ou posterior

## Comportamento Especial das Tarefas Padrão

As tarefas padrão (as 3 tarefas pré-definidas) têm um comportamento especial:

- Não podem ser removidas da coluna "A Fazer"
- Se movidas para outras colunas, podem ser "removidas", o que as move de volta para "A Fazer"
- São sempre restauradas durante o reset diário

## Como Usar

1. A aplicação carrega com três tarefas padrão na coluna "A Fazer"
2. Arraste as tarefas entre as colunas conforme você trabalha nelas
3. Adicione novas tarefas em qualquer coluna usando o campo de texto na parte inferior
4. Remova tarefas clicando no ícone "X" no canto superior direito do cartão
5. Use o botão "Restaurar Tarefas" para reiniciar o quadro manualmente
6. Todas as manhãs, às 6h, o quadro será reiniciado automaticamente

## Possíveis Melhorias Futuras

- Implementação de um calendário para navegar entre dias diferentes
- Configuração personalizada do horário de reset
- Categorias de tarefas com cores diferentes
- Estimativas de tempo para as tarefas
- Estatísticas e métricas de produtividade
- Sincronização com serviços de nuvem

Desenvolvido com ❤️ para aumentar a produtividade diária.
