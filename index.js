const APIs = (() => {
    const url = "http://localhost:3000/todos";


    //Create todo items
    const createTodo = (newTodo) => {
        return fetch(url, {
            method: "POST",
            body: JSON.stringify(newTodo),
            headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());
    };


    //Delete todo items
    const deleteTodo = (id) => {
        return fetch(`${url}/${id}`, {
            method: "DELETE",
        }).then((res) => res.json());
    };


    //Read data to initialize
    const getTodos = () => {
        return fetch(url).then((res) => res.json());
    };


    //Edit items
    const editItems = (id, newInput) => {
        return fetch(`${url}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newInput),
        }).then((res) => res.json());
    };


    const editItems2 = (id, data) => {
        return fetch(`${url}/${data.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }).then((res) => res.json());
    };


    return { createTodo, deleteTodo, getTodos, editItems, editItems2};
})();


//-- Model --
//manage data
const Model = (() => {
    class State {
        #todos; //data array
        #onChange; //function, will be called when setter function is called
        //used to render DOM on change in data
        constructor() {
            this.#todos = [];
        }
        get todos() {
            //Read todo data
            return this.#todos;
        }
        set todos(newTodos) {
            //Update todo data
            this.#todos = newTodos;
            //Notify the view that the data has changed
            this.#onChange();
        }
        setOnChange(onChange) {
            this.#onChange = onChange;
        }
        async fetchTodos() {
            const todos = await APIs.getTodos();
            this.todos = todos;
        }
        async addTodo(newTodo) {
            const todo = await APIs.createTodo(newTodo);
            this.todos = [...this.todos, todo];
        }
        async deleteTodo(id) {
            await APIs.deleteTodo(id);
            const newTodos = this.todos.filter(todo => todo.id !== id);
            this.todos = newTodos;
        }
        async editItems(id, newInput) {
            const todo = await APIs.editItems(id, newInput);
            const newTodos = this.todos.map(t => t.id === id ? todo : t);
            this.todos = newTodos;
        }
    }

    return { State };
})();

//-- View --
//render UI
const View = (() => {
    const todoList = document.querySelector(".todo-list");
    const inputField = document.querySelector(".todo-input");
    const addBtn = document.querySelector(".add-btn");
    
    //render todo items to UI
    const renderTodos = (todos) => {
        todoList.innerHTML = "";
        todos.forEach((todo) => {
            const li = document.createElement("li");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = todo.completed;
            checkbox.addEventListener("change", () => {
                todo.completed = checkbox.checked;
                Controller.editItems(todo.id, todo);
            });
            const span = document.createElement("span");
            span.innerText = todo.title;
            const deleteBtn = document.createElement("button");
            deleteBtn.innerText = "Delete";
            deleteBtn.addEventListener("click", () => {
                Controller.deleteTodo(todo.id);
            });
            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);
            todoList.appendChild(li);
        });
    };

    //clear input field after adding a new todo
    const clearInputField = () => {
        inputField.value = "";
    };
    
    //add new todo item to UI
    const addNewTodo = (todo) => {
        const li = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = todo.completed;
        checkbox.addEventListener("change", () => {
            todo.completed = checkbox.checked;
            Controller.editItems(todo.id, todo);
        });
        const span = document.createElement("span");
        span.innerText = todo.title;
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Delete";
        deleteBtn.addEventListener("click", () => {
            Controller.deleteTodo(todo.id);
        });
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
    };
    
    //handle add button click event
    addBtn.addEventListener("click", () => {
        const title = inputField.value.trim();
        if (title) {
            const newTodo = {
                title: title,
                completed: false,
            };
            Controller.createTodo(newTodo);
            clearInputField();
        }
    });
    
    return { renderTodos, addNewTodo };
})();
//-- Controller --
//handle user input and updates view and model
const Controller = (() => {
   
    Model.getTodos().then((todos) => {
        View.renderTodos(todos);
    });

    
    const createTodo = (newTodo) => {
        APIs.createTodo(newTodo).then((todo) => {
            Model.addTodoToList(todo);
            View.addNewTodo(todo);
        });
    };

    
    const deleteTodo = (id) => {
        APIs.deleteTodo(id).then(() => {
            Model.removeTodoFromList(id);
            View.renderTodos(Model.todos);
        });
    };

    //handle edit todo event
    const editItems = (id, newInput) => {
        APIs.editItems2(id, newInput).then(() => {
            Model.updateTodoInList(id, newInput);
            View.renderTodos(Model.todos);
        });
    };

    return { createTodo, deleteTodo, editItems };
const bootstrap = () => {
    init();
    handleSubmit();
    handleDelete();
    state.subscribe(() => {
        view.renderTodos(state.todos);
    });
};
return {
    bootstrap,
};
})(View, Model); //ViewModel

Controller.bootstrap();
