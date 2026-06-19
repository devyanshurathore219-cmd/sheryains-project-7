
       
        let tasks = JSON.parse(localStorage.getItem('dom_tasks')) || [];
        let currentFilter = 'all';

        // --- DOM ELEMENTS SELECTION ---
        const taskForm = document.getElementById('task-form');
        const taskTitleInput = document.getElementById('task-title');
        const taskCategoryInput = document.getElementById('task-category');
        const taskList = document.getElementById('task-list');
        const emptyState = document.getElementById('empty-state');
        const searchInput = document.getElementById('search-input');
        const filterBtns = document.querySelectorAll('.filter-btn');

        // --- THEME TOGGLE LOGIC ---
        const themeToggleBtn = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        const htmlElement = document.documentElement;

        function initTheme() {
            // Requirement: Use dataset, classList, and setAttribute
            const savedTheme = localStorage.getItem('theme') || 'light';
            
            // 1. Using setAttribute to apply theme variable mapping
            htmlElement.setAttribute('data-theme', savedTheme);
            
            updateThemeIcon(savedTheme);
        }

        function updateThemeIcon(theme) {
            // 2. Using classList for UI updates
            if (theme === 'dark') {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        }

        themeToggleBtn.addEventListener('click', () => {
            // 3. Using dataset to read current attribute state
            const currentTheme = htmlElement.dataset.theme;
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });

        initTheme();

        // --- DEMONSTRATION: ATTRIBUTES VS PROPERTIES ---
        const demoInput = document.getElementById('demo-input');
        const btnCompare = document.getElementById('btn-compare');
        const demoResult = document.getElementById('demo-result');

        btnCompare.addEventListener('click', () => {
            // Property reflects current live state
            const propertyValue = demoInput.value; 
            
            // Requirement: Use getAttribute() - reflects initial HTML parsed state
            const attributeValue = demoInput.getAttribute('value');
            
            demoResult.classList.remove('hidden');
            demoResult.innerHTML = `
                <div class="mb-2"><strong class="text-purple-500">Property (demoInput.value):</strong> <span class="bg-gray-200 dark:bg-gray-700 px-1 rounded">"${propertyValue}"</span> <span class="text-xs text-[var(--text-muted)]"><- Live state updated by user</span></div>
                <div><strong class="text-blue-500">Attribute (demoInput.getAttribute('value')):</strong> <span class="bg-gray-200 dark:bg-gray-700 px-1 rounded">"${attributeValue}"</span> <span class="text-xs text-[var(--text-muted)]"><- Static state from HTML source</span></div>
            `;
            
            console.log("--- Attributes vs Properties Comparison ---");
            console.log("1. Property (Live):", propertyValue);
            console.log("2. Attribute (Static):", attributeValue);
        });

        // --- CORE APPLICATION LOGIC ---

        function saveTasks() {
            localStorage.setItem('dom_tasks', JSON.stringify(tasks));
            updateCounters();
        }

        function updateCounters() {
            document.getElementById('count-total').textContent = tasks.length;
            document.getElementById('count-done').textContent = tasks.filter(t => t.status === 'completed').length;
            document.getElementById('count-pending').textContent = tasks.filter(t => t.status === 'pending').length;
        }

        // Requirement: Dynamically create and remove DOM elements
        // Requirement: Use createElement(), createTextNode(), append()
        function createTaskElement(task) {
            // 1. createElement
            const li = document.createElement('li');
            li.className = `flex items-center justify-between p-3 surface rounded-lg border hover:shadow-md transition-shadow group ${task.status === 'completed' ? 'opacity-60 bg-gray-50 dark:bg-gray-800/50' : ''}`;
            
            // Requirement: Attributes vs Properties. Setting Custom Data Attributes.
            // We use setAttribute here, but dataset is also valid (e.g., li.dataset.id = task.id)
            li.setAttribute('data-id', task.id);
            li.setAttribute('data-status', task.status);
            li.setAttribute('data-category', task.category);

            // Structure: Checkbox container
            const leftDiv = document.createElement('div');
            leftDiv.className = 'flex items-center gap-3 overflow-hidden flex-1';

            const checkboxBtn = document.createElement('button');
            checkboxBtn.className = `complete-btn w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-400 hover:border-blue-500'}`;
            checkboxBtn.innerHTML = task.status === 'completed' ? '<i class="fa-solid fa-check text-xs"></i>' : '';

            // Title span
            const titleSpan = document.createElement('span');
            titleSpan.className = `task-title font-medium truncate ${task.status === 'completed' ? 'line-through text-[var(--text-muted)]' : ''}`;
            // 2. createTextNode
            const textNode = document.createTextNode(task.title);
            titleSpan.append(textNode); // 3. append

            // Category badge
            const badge = document.createElement('span');
            badge.className = 'text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 ml-2 whitespace-nowrap';
            badge.textContent = task.category;

            // Append children to left container
            leftDiv.append(checkboxBtn, titleSpan, badge);

            // Actions container
            const rightDiv = document.createElement('div');
            rightDiv.className = 'flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity';

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn text-[var(--text-muted)] hover:text-blue-500 p-1';
            editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
            if(task.status === 'completed') editBtn.style.display = 'none';

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn text-[var(--text-muted)] hover:text-red-500 p-1';
            deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';

            rightDiv.append(editBtn, deleteBtn);
            
            // Assemble final list item
            li.append(leftDiv, rightDiv);

            return li;
        }

        // Requirement: Use DocumentFragment
        function renderTasks(tasksToRender = tasks) {
            // Clear existing list except empty state
            Array.from(taskList.children).forEach(child => {
                if(child.id !== 'empty-state') child.remove();
            });

            if (tasksToRender.length === 0) {
                emptyState.style.display = 'block';
                return;
            }

            emptyState.style.display = 'none';
            
            // Performance optimization: DocumentFragment minimizes DOM reflows
            const fragment = document.createDocumentFragment();
            
            tasksToRender.forEach(task => {
                const element = createTaskElement(task);
                fragment.append(element);
            });

            taskList.append(fragment);
            updateCounters();
        }

        // --- ADD TASK HANDLING ---
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent page refresh
            
            const title = taskTitleInput.value.trim();
            if (!title) return;

            const newTask = {
                id: Date.now().toString(),
                title: title,
                category: taskCategoryInput.value,
                status: 'pending'
            };

            tasks.push(newTask);
            saveTasks();
            
            const taskElement = createTaskElement(newTask);
            
            // Requirement: Use hasAttribute, setAttribute, removeAttribute for visual flair
            // Add a temporary attribute to trigger CSS animation
            taskElement.setAttribute('data-new', 'true');
            
            // Requirement: Use prepend() to add to top of list
            emptyState.style.display = 'none';
            taskList.prepend(taskElement); 
            
            // Cleanup attribute after animation completes
            setTimeout(() => {
                if (taskElement.hasAttribute('data-new')) {
                    taskElement.removeAttribute('data-new');
                }
            }, 1500);

            taskForm.reset();
            taskTitleInput.focus();
        });

        // --- EVENT DELEGATION (Requirement) ---
        // Instead of attaching events to individual edit/delete/complete buttons,
        // we attach one listener to the parent 'ul' and use e.target to find the clicked element.
        taskList.addEventListener('click', (e) => {
            // Find the closest task card using the required data attribute
            const taskCard = e.target.closest('li[data-id]');
            if (!taskCard) return;

            // Requirement: Use dataset property
            const taskId = taskCard.dataset.id; 

            // 1. DELETE ACTION
            if (e.target.closest('.delete-btn')) {
                tasks = tasks.filter(t => t.id !== taskId);
                saveTasks();
                // Requirement: Use remove() method
                taskCard.remove(); 
                if(tasks.length === 0) emptyState.style.display = 'block';
            }
            
            // 2. COMPLETE ACTION
            else if (e.target.closest('.complete-btn')) {
                const task = tasks.find(t => t.id === taskId);
                task.status = task.status === 'pending' ? 'completed' : 'pending';
                saveTasks();
                
                // Re-render specifically this card or whole list. For simplicity of filtering, re-render list.
                // If we didn't have filters, modifying classes directly would be faster.
                applyFilters(); 
            }
            
            // 3. EDIT ACTION (Demonstrating replaceWith, before, after)
            else if (e.target.closest('.edit-btn')) {
                initiateEditMode(taskCard, taskId);
            }
        });

        function initiateEditMode(taskCard, taskId) {
            const task = tasks.find(t => t.id === taskId);
            const titleSpan = taskCard.querySelector('.task-title');
            const actionsDiv = taskCard.querySelector('.flex.gap-2'); // Right container
            
            // Hide normal actions
            actionsDiv.style.display = 'none';

            // Create Edit Input
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.value = task.title;
            editInput.className = 'input-base flex-1 px-2 py-1 text-sm rounded outline-none w-full max-w-[200px] ml-2';
            
            // Create Save Button
            const saveBtn = document.createElement('button');
            saveBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
            saveBtn.className = 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900 p-1 rounded ml-2 transition';
            
            // Create Cancel Button
            const cancelBtn = document.createElement('button');
            cancelBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            cancelBtn.className = 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900 p-1 rounded ml-1 transition';

            // Create an icon to show we are editing
            const editingIcon = document.createElement('i');
            editingIcon.className = 'fa-solid fa-pen-to-square text-blue-500 text-xs mr-2';

            // --- REQUIREMENT: Use specific DOM insertion methods ---
            
            // 1. replaceWith(): Replace standard text with input
            titleSpan.replaceWith(editInput);
            
            // 2. after(): Add save button immediately after input
            editInput.after(saveBtn);
            
            // 3. after(): Add cancel button after save button
            saveBtn.after(cancelBtn);
            
            // 4. before(): Add visual indicator before input
            editInput.before(editingIcon);

            editInput.focus();

            // Handle Save
            saveBtn.addEventListener('click', () => {
                const newTitle = editInput.value.trim();
                if (newTitle) {
                    task.title = newTitle;
                    saveTasks();
                    
                    // Revert DOM back to display state using manipulation
                    titleSpan.textContent = newTitle;
                    
                    // Requirement: Use remove()
                    editingIcon.remove();
                    saveBtn.remove();
                    cancelBtn.remove();
                    
                    // Requirement: Use replaceWith() again
                    editInput.replaceWith(titleSpan);
                    actionsDiv.style.display = 'flex';
                }
            });

            // Handle Cancel
            cancelBtn.addEventListener('click', () => {
                editingIcon.remove();
                saveBtn.remove();
                cancelBtn.remove();
                editInput.replaceWith(titleSpan);
                actionsDiv.style.display = 'flex';
            });
        }

        // --- FILTERS & SEARCH (Bonus) ---
        function applyFilters() {
            let filtered = tasks;
            
            // Apply text search
            const query = searchInput.value.toLowerCase();
            if(query) {
                filtered = filtered.filter(t => t.title.toLowerCase().includes(query));
            }

            // Apply category/status filter
            if (currentFilter === 'pending') {
                filtered = filtered.filter(t => t.status === 'pending');
            } else if (currentFilter === 'completed') {
                filtered = filtered.filter(t => t.status === 'completed');
            }
            
            renderTasks(filtered);
        }

        searchInput.addEventListener('input', applyFilters);

        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update UI classes
                filterBtns.forEach(b => {
                    b.classList.remove('bg-blue-100', 'text-blue-700', 'dark:bg-blue-900/30', 'dark:text-blue-300');
                    b.classList.add('bg-[var(--bg-page)]', 'text-[var(--text-muted)]');
                });
                e.target.classList.remove('bg-[var(--bg-page)]', 'text-[var(--text-muted)]');
                e.target.classList.add('bg-blue-100', 'text-blue-700', 'dark:bg-blue-900/30', 'dark:text-blue-300');

                currentFilter = e.target.dataset.filter;
                applyFilters();
            });
        });

        document.getElementById('clear-tasks-btn').addEventListener('click', () => {
            if(confirm("Are you sure you want to clear all tasks?")) {
                tasks = [];
                saveTasks();
                renderTasks();
            }
        });

        // --- EVENT PROPAGATION DEMONSTRATION ---
        /*
         * Explanation for requirement:
         * 1. Capturing Phase: The event travels DOWN from the Window -> Document -> HTML -> ... -> Target Element.
         * 2. Target Phase: The event reaches the actual element clicked.
         * 3. Bubbling Phase: The event travels UP from the Target Element -> ... -> HTML -> Document -> Window.
         * 
         * By default, addEventListener listens to the Bubbling phase. 
         * Passing { capture: true } as the 3rd argument makes it listen to the Capturing phase.
         */
        const gp = document.getElementById('prop-grandparent');
        const p = document.getElementById('prop-parent');
        const c = document.getElementById('prop-child');
        
        const logCapture = document.getElementById('log-capture');
        const logBubble = document.getElementById('log-bubble');

        function createLogEntry(phase, elementId) {
            const li = document.createElement('li');
            li.innerHTML = `<span class="opacity-50">${new Date().toLocaleTimeString().split(' ')[0]}</span> - <strong>${elementId}</strong> clicked`;
            if (phase === 'capture') {
                logCapture.append(li);
                logCapture.scrollTop = logCapture.scrollHeight;
            } else {
                logBubble.append(li);
                logBubble.scrollTop = logBubble.scrollHeight;
            }
        }

        // Bubbling Listeners (Default behavior - 3rd param is false or omitted)
        gp.addEventListener('click', () => createLogEntry('bubble', 'Grandparent'));
        p.addEventListener('click', () => createLogEntry('bubble', 'Parent'));
        c.addEventListener('click', () => createLogEntry('bubble', 'Child Target'));

        // Capturing Listeners ({ capture: true })
        gp.addEventListener('click', () => createLogEntry('capture', 'Grandparent'), { capture: true });
        p.addEventListener('click', () => createLogEntry('capture', 'Parent'), { capture: true });
        c.addEventListener('click', () => createLogEntry('capture', 'Child Target'), { capture: true });

        document.getElementById('btn-clear-logs').addEventListener('click', () => {
            logCapture.innerHTML = '';
            logBubble.innerHTML = '';
        });

        // Initial Render
        renderTasks();

