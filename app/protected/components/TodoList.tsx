"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/database.types";
import { PlusCircle, Trash2 } from "lucide-react";

// Import shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

type TodoItem = Database["public"]["Tables"]["todo"]["Row"];

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch todos on component mount
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("todo")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setTodos(data || []);
      } catch (err) {
        console.error("Error fetching todos:", err);
        setError("Failed to load todos. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, []);

  // Add new todo
  const addTodo = async () => {
    if (!newTodoTitle.trim()) return;

    try {
      const supabase = createClient();
      const newTodo = {
        title: newTodoTitle.trim(),
        done: false,
      };

      const { data, error } = await supabase
        .from("todo")
        .insert([newTodo])
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        setTodos([...data, ...todos]);
        setNewTodoTitle("");
        setIsAddDialogOpen(false);
      }
    } catch (err) {
      console.error("Error adding todo:", err);
      setError("Failed to add todo. Please try again.");
    }
  };

  // Toggle todo status
  const toggleTodoStatus = async (id: number, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("todo")
        .update({
          done: !currentStatus,
          done_time: !currentStatus ? new Date().toISOString() : null,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setTodos(
        todos.map((todo) =>
          todo.id === id
            ? {
                ...todo,
                done: !currentStatus,
                done_time: !currentStatus ? new Date().toISOString() : null,
              }
            : todo
        )
      );
    } catch (err) {
      console.error("Error updating todo:", err);
      setError("Failed to update todo status. Please try again.");
    }
  };

  // Delete todo
  const deleteTodo = async (id: number) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("todo").delete().eq("id", id);

      if (error) {
        throw error;
      }

      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error("Error deleting todo:", err);
      setError("Failed to delete todo. Please try again.");
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Todo List</CardTitle>
          <CardDescription>Manage your tasks efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end mb-6">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Todo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Todo</DialogTitle>
                  <DialogDescription>
                    Enter the details for your new task
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="todoTitle" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="todoTitle"
                      value={newTodoTitle}
                      onChange={(e) => setNewTodoTitle(e.target.value)}
                      className="col-span-3"
                      placeholder="Enter your task"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={addTodo}>Add Todo</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {todos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No todos yet. Add your first task!
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    todo.done ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={todo.done}
                      onCheckedChange={() =>
                        toggleTodoStatus(todo.id, todo.done)
                      }
                      id={`todo-${todo.id}`}
                    />
                    <div>
                      <label
                        htmlFor={`todo-${todo.id}`}
                        className={`font-medium ${
                          todo.done ? "line-through text-gray-500" : ""
                        }`}
                      >
                        {todo.title}
                      </label>
                      <div className="text-xs text-gray-500">
                        Created: {formatDate(todo.created_at)}
                        {todo.done && todo.done_time && (
                          <span>
                            {" "}
                            • Completed: {formatDate(todo.done_time)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="text-sm text-gray-500">
            {todos.filter((t) => t.done).length} of {todos.length} tasks
            completed
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
