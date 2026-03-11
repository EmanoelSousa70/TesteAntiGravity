document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskNameInput = document.getElementById('task-name');
    const taskDatetimeInput = document.getElementById('task-datetime');
    const taskList = document.getElementById('task-list');
    const taskEditIndexInput = document.getElementById('task-edit-index');
    const submitBtn = document.getElementById('submit-btn');

    // Carregar tarefas do localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Solicitar permissão para notificações
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }

    // Função para renderizar as tarefas na tela
    function renderTasks() {
        taskList.innerHTML = '';

        if (tasks.length === 0) {
            taskList.innerHTML = '<li class="empty-msg">Nenhuma tarefa agendada.</li>';
            return;
        }

        // Ordenar as tarefas por data/hora crescente
        tasks.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task-item';

            const infoDiv = document.createElement('div');
            infoDiv.className = 'task-info';

            const titleSpan = document.createElement('span');
            titleSpan.className = 'task-title';
            titleSpan.textContent = task.name;

            const timeSpan = document.createElement('span');
            timeSpan.className = 'task-time';
            
            // Formatando a data e hora
            const dateObj = new Date(task.datetime);
            const formattedDate = dateObj.toLocaleDateString('pt-BR');
            const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            timeSpan.textContent = `${formattedDate} às ${formattedTime}`;

            infoDiv.appendChild(titleSpan);
            infoDiv.appendChild(timeSpan);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'task-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.textContent = 'Editar';
            editBtn.onclick = () => editTask(index);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Remover';
            deleteBtn.onclick = () => removeTask(index);

            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);

            li.appendChild(infoDiv);
            li.appendChild(actionsDiv);

            taskList.appendChild(li);
        });
    }

    // Função para adicionar ou atualizar uma tarefa
    function handleTaskSubmit(e) {
        e.preventDefault();

        const name = taskNameInput.value.trim();
        const datetime = taskDatetimeInput.value;
        const editIndex = taskEditIndexInput.value;

        if (name && datetime) {
            if (editIndex !== "") {
                // Atualizar tarefa existente
                tasks[editIndex].name = name;
                tasks[editIndex].datetime = datetime;
                // Redefinir notificação se a data/hora mudar
                tasks[editIndex].notified = false; 
                
                // Limpar modo de edição
                taskEditIndexInput.value = "";
                submitBtn.textContent = 'Adicionar tarefa';
            } else {
                // Adicionar nova tarefa
                const newTask = {
                    name,
                    datetime,
                    notified: false
                };
                tasks.push(newTask);
            }

            saveTasks();
            renderTasks();

            // Limpar formulário
            taskForm.reset();
        }
    }

    // Função para preparar edição de tarefa
    function editTask(index) {
        // Preencher formulário
        taskNameInput.value = tasks[index].name;
        taskDatetimeInput.value = tasks[index].datetime;
        
        // Mudar para modo edição
        taskEditIndexInput.value = index;
        submitBtn.textContent = 'Atualizar tarefa';
        
        // Dar foco ao input
        taskNameInput.focus();
    }

    // Função para remover uma tarefa
    function removeTask(index) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }

    // Função para salvar tarefas no localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Função para checar tarefas e exibir notificação
    function checkNotifications() {
        const now = new Date();
        let changed = false;

        tasks.forEach(task => {
            if (!task.notified) {
                const taskTime = new Date(task.datetime);
                if (now >= taskTime) {
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('Lembrete de Tarefa', {
                            body: task.name
                        });
                    } else {
                        // Fallback em caso de falta de suporte/permissão
                        alert(`Lembrete de Tarefa: ${task.name}`);
                    }
                    
                    task.notified = true;
                    changed = true;
                }
            }
        });

        if (changed) {
            saveTasks();
        }
    }

    // Checar notificações a cada 10 segundos
    setInterval(checkNotifications, 10000);

    // Event Listeners
    taskForm.addEventListener('submit', handleTaskSubmit);

    // Renderização inicial
    renderTasks();
    checkNotifications(); // Checar imediatamente ao carregar
});
