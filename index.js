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
}

class TodoList extends Component {
    constructor() {
        super();
        this.state = new State([
            {id: 1, text: "Сделать домашку", completed: false},
            {id: 2, text: "Сделать практику", completed: false},
            {id: 3, text: "Пойти домой", completed: false},
        ]);
    }

    render() {
        const todoItems = this.state.map((todo) => this._createTask(todo));

        return createElement("div", {class: "todo-list"}, [
            createElement("h1", {}, "TODO List"),
            createElement("div", {class: "add-todo"}, [
                createElement("input", {
                    id: "new-todo",
                    type: "text",
                    placeholder: "Задание",
                }),
                createElement("button", {id: "add-btn"}, "+", [() => TodoList.onAddTask(this)]),
            ]),
            createElement("ul", {id: "todos"}, todoItems),
        ]);
    }

    _createTask(element) {
      return createElement("li", {key: element.id}, [
        createElement("input", {type: "checkbox", checked: element.completed}),
        createElement("label", {}, element.text),
        createElement("button", {}, "🗑️"),
      ]);
    }

    static onAddTask(todoList) {
      const inputElement = document.getElementById('new-todo');
      const element = { id: todoList.state.length() + 1, text: inputElement.value, completed: false };
      todoList.state.push(element);
      const todos = document.getElementById('todos');
      todos.appendChild(todoList._createTask(element));
      inputElement.value = "";
    }

    static onAddInputChange() {
      
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(new TodoList().getDomNode());
});

class State {
    constructor(tasks) {
        this.tasks = tasks;
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

    length() {
      return this.tasks.length;
    }
}