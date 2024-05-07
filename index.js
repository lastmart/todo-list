function createElement(tag, attributes, children, callbacks) {
    const element = document.createElement(tag);

    if (callbacks) {
        callbacks.forEach(callback => {
            element.addEventListener('click', callback);
        });
    }

    if (attributes) {
        Object.keys(attributes).forEach((key) => {
            element.setAttribute(key, attributes[key]);
        });
    }

    if (Array.isArray(children)) {
        children.forEach((child) => {
            if (typeof child === "string") {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
    } else if (typeof children === "string") {
        element.appendChild(document.createTextNode(children));
    } else if (children instanceof HTMLElement) {
        element.appendChild(children);
    }

    return element;
}

class Component {
    constructor() {
    }

    getDomNode() {
        this._domNode = this.render();
        return this._domNode;
    }

    update() {
        document.querySelector('.todo-list').remove();
        document.body.appendChild(this.render());
    }
}

class TodoList extends Component {
    constructor() {
        super();

        this.state = new State([
            new Task(1, "Сделать домашку"),
            new Task(2, "Сделать практику"),
            new Task(3, "Пойти домой")
        ]);
    }

    render() {
        const todoItems = this.state.map((todo) => this._createTaskElement(todo));
        this.todos = createElement("ul", {id: "todos"}, todoItems);
        this.inputLine = createElement("input", {
                id: "new-todo",
                type: "text",
                placeholder: "Задание",
            },
            [() => TodoList.onAddInputChange(this)]
        );

        return createElement("div", {class: "todo-list"}, [
            createElement("h1", {}, "TODO List"),
            createElement("div", {class: "add-todo"}, [
                this.inputLine,
                createElement("button", {id: "add-btn"}, "+", [() => TodoList.onAddTask(this)]),
            ]),
            this.todos,
        ]);
    }

    _createTaskElement(element) {
        const checkbox = createElement("input", {type: "checkbox"}, undefined, [() => TodoList.onCheckboxChange(element)]);
        const task = createElement("li", {key: element.id}, [
            checkbox,
            createElement("label", {}, element.text),
            createElement("button", {}, "🗑️", [() => TodoList.onDelete(element, this.state)]),
        ]);
        if (element.completed) {
            task.style.cssText = `background-color:red;`;
            checkbox.checked = true;
        }
        return task;
    }

    static onAddTask(todoList) {
        const inputElement = todoList.inputLine;
        const task = new Task(todoList.state.length() + 1, inputElement.value);
        todoList.state.current = task;
        todoList.state.push(task);
        inputElement.value = "";
        todoList.update();
    }

    static onAddInputChange(todoList) {
        const inputElement = todoList.inputLine;
        const currentTask = todoList.state.current;
        currentTask.text = inputElement.value;
    }

    static onCheckboxChange(element) {
        element.completed = !element.completed;
        const li = document.querySelector(`li[key="${element.id}"]`);
        if (element.completed) {
            li.style.cssText = `background-color:red;`;
        } else {
            li.style.cssText = '';
        }
    }

    static onDelete(element, todoList) {
        document.querySelector(`li[key="${element.id}"]`).remove();
        todoList.remove(element.id);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(new TodoList().getDomNode());
});

class State {
    constructor(tasks) {
        this.tasks = tasks;
        this.current = tasks.indexOf(-1);
    }

    [Symbol.iterator]() {
        let index = 0;
        let todos = this.tasks;

        return {
            next: () => {
                if (index < todos.length) {
                    return {value: todos[index++], done: false};
                } else {
                    return {done: true};
                }
            }
        };
    }

    map(lambda) {
        const result = [];
        for (const task of this.tasks) {
            result.push(lambda(task));
        }
        return result;
    }

    push(element) {
        this.tasks.push(element);
    }

    remove(id) {
        let curid = 0;
        for (let i = 0; i < this.tasks.length; i++) {
            if (this.tasks[i].id === id) {
                curid = i;
                break;
            }
        }
        this.tasks.splice(curid, 1);
    }

    length() {
        return this.tasks.length;
    }
}

class Task {
    constructor(id, text, completed = false) {
        this.id = id;
        this.text = text;
        this.completed = completed;
    }
}