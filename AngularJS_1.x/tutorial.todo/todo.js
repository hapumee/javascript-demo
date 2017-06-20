angular.module('todoApp', [])
  .controller('TodoListController', function() {
    var todoList = this;

    todoList.todos = [
      {text: 'learn AngularJS', done: true},
      {text: 'build an AngularJS app', doen: false}
    ];
    // console.log(todoList.todos);

    // add Todo
    todoList.addTodo = function() {
      var newTodo = {text: todoList.todoText, done: false};

      todoList.todos.push(newTodo);
      todoList.todoText = '';
    };

    // calculate remaining tasks
    todoList.remaining = function() {
      var count = 0;

      angular.forEach(todoList.todos, function(todo) {
        count += todo.done ? 0 : 1;
      });

      return count;
    };

    // archiving
    todoList.archive = function() {
      var oldTodos = todoList.todos;
      todoList.todos = [];

      angular.forEach(oldTodos, function(todo) {
        if (!todo.done) todoList.todos.push(todo);
      });
    };
  });
