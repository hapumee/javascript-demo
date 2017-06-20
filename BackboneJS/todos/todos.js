//$(document).ready(function() {
$(function() {
    // TODO MODEL
    var Todo = Backbone.Model.extend({
        defaults: function () {
            return {
                title: "empty todo...",
                order: Todos.nextOrder(),
                done: false
            }
        },

        toggle: function() {
            this.save({done: !this.get("done")});
        }
    });
    // end of TODO MODEL

    // TODO COLLECTION
    var TodoList = Backbone.Collection.extend({
        model: Todo,

        // save all of the todo items under the "todos-backbone" namespace.
        localStorage: new Backbone.LocalStorage("todos-backbone"),

        // finished tasks
        done: function() {
            return this.where({done: true});    // return [array]
        },

        // not finished tasks
        remaining: function() {
            return this.where({done: false});   // return [array]
        },

        // get the next order number
        nextOrder: function() {
            if(!this.length) return 1;
             return this.last().get('order') + 1;
        },

        // Collection.comparator (for sorted order)
        comparator: 'order'
    });
    // global collection
    var Todos = new TodoList;
    // end of TODO COLLECTION

    // TODO ITEM VIEW
    var TodoView = Backbone.View.extend({
        tagName: "li",

        template: _.template($('#item-template').html()),

        events: {
            "click .toggle"     : "toggleDone",
            "dbclick .view"     : "edit",
            "click a.destroy"   : "clear",
            "keypress .edit"    : "updateOnEnter",
            "blur .edit"        : "close"
        },

        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },

        // re-render the list
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));

            this.$el.toggleClass('done', this.model.get("done"));   // this.model.get("done") is true, 'done' class is added.
            this.input = this.$('.edit');
            return this;
        },

        // toggle the "done" state of the model
        toggleDone: function() {
            this.model.toggle();
        },

        // switch into "editing" mode
        edit: function() {
            this.$el.addClass("editing");
            this.input.focus();
        },

        // close the "editing" mode
        clear: function() {
            this.model.destroy();
        },

        // enter key press
        updateOnEnter: function(e) {
            if(e.keyCode == 13) {
                this.close();
            }
        },

        // close the "editing" mode
        close: function() {
            var value = this.input.val();
            if(!value) {
                this.clear();
            } else {
                this.model.save({title: value});
                this.$el.removeClass("editing");
            }
        }
    });
    // end of TODO ITEM VIEW

    // THE APPLICATION
    var AppView = Backbone.View.extend({
        el: $("#todoapp"),

        statsTemplate: _.template($('#stats-template').html()),

        events: {
            "keypress #new-todo"    : "createOnEnter",
            "click #clear-completed" : "clearCompleted",
            "click #toggle-all"     : "toggleAllComplete"
        },

        initialize: function() {
            this.input = this.$("#new-todo");
            this.allCheckbox = this.$("#toggle-all")[0];

            this.listenTo(Todos, "add", this.addOne);
            this.listenTo(Todos, "reset", this.addAll);
            this.listenTo(Todos, "all", this.render);

            this.footer = this.$("footer");
            this.main = $("#main");

            Todos.fetch();
        },

        // create new task and add to the <ul>
        addOne: function(todo) {
            var view = new TodoView({model: todo});
            this.$("#todo-list").append(view.render().el);
        },

        addAll: function() {
            Todos.each(this.addOne, this);
        },

        render: function() {
            var done = Todos.done().length;
            var remaining = Todos.remaining().length;

            if(Todos.length) {
                this.main.show();   // existing todo list
                this.footer.show(); // stats area
                this.footer.html(this.statsTemplate({done: done, remaining: remaining}));
            } else {
                this.main.hide();
                this.footer.hide();
            }

            this.allCheckbox.checked = !remaining;
        },

        createOnEnter: function(e) {
            if(e.keyCode != 13) return;
            if(!this.input.val()) return;

            Todos.create({title: this.input.val()});
            this.input.val("");
        },

        clearCompleted: function() {
            _.invoke(Todos.done(), "destroy");
            return false;
        },

        toggleAllComplete: function() {
            var done = this.allCheckbox.checked;
            Todos.each(function(todo) { todo.save({"done": done}); });
        }
    });

    var App = new AppView;
    // end of THE APPLICATION
});