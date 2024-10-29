"use client";

import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import {
  fetchTasks,
  createTask,
  updateTaskById,
  deleteTaskById,
} from "@/utils/apiClient";
import Modal from "@/components/Modal";
import TaskCard from "@/components/TaskCard";
import { FiPlusCircle } from "react-icons/fi";
import axios from "axios";
import { API_URL } from "@/utils/apiClient";
import { APITask, TaskList } from "@/types/interfaces";

const Home = () => {
  const [columns, setColumns] = useState<TaskList>({
    "To Do": { id: "To Do", title: "To Do", items: [] },
    "In Progress": { id: "In Progress", title: "In Progress", items: [] },
    Done: { id: "Done", title: "Done", items: [] },
  });
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<APITask | null>(null);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return; // Prevent running on SSR

    const loadTasks = async () => {
      try {
        const tasks: APITask[] = await fetchTasks();
        const updatedColumns: TaskList = {
          "To Do": { id: "To Do", title: "To Do", items: [] },
          "In Progress": { id: "In Progress", title: "In Progress", items: [] },
          Done: { id: "Done", title: "Done", items: [] },
        };

        // Sort tasks by their positions within each status/column
        tasks.forEach((task: APITask) => {
          if (updatedColumns[task.status]) {
            updatedColumns[task.status].items.push({
              id: task._id,
              content: task.title,
              description: task.description,
              position: task.position,
            });
          }
        });

        // Sort the tasks in each column by their position
        Object.keys(updatedColumns).forEach((columnId) => {
          updatedColumns[columnId].items.sort(
            (a, b) => a.position - b.position
          );
        });

        setColumns(updatedColumns);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    loadTasks();
  }, [isMounted]);

  const updateColumnOrder = async (
    columnId: string,
    items: { id: string; position: number }[]
  ) => {
    console.log("Home ~ items:", items);
    console.log("Home ~ columnId:", columnId);

    try {
      // Log the payload being sent to the server
      console.log("Sending payload to server:", {
        columnId,
        tasks: items.map((item) => ({ id: item.id, position: item.position })),
      });

      // Make an API call to update the order of tasks in the column
      const res = await axios.post(`${API_URL}/order`, {
        columnId,
        tasks: items.map((item) => ({ id: item.id, position: item.position })), // Send the updated tasks with positions
      });
      console.log("Home ~ res:", res);
    } catch (error) {
      console.error("Error updating column order:", error);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      // Moving to a different column
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = Array.from(sourceColumn.items);
      const destItems = Array.from(destColumn.items);

      const [removed] = sourceItems.splice(source.index, 1);
      removed.position = destination.index; // Update the position in the moved item
      destItems.splice(destination.index, 0, removed);

      // Update positions within the destination column
      destItems.forEach((item, index) => {
        item.position = index;
      });

      const updatedColumns = {
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems },
      };
      console.log("onDragEnd ~ updatedColumns:", updatedColumns);

      setColumns(updatedColumns);

      try {
        // Update task status and position in the backend
        await updateTaskById(removed.id, {
          title: removed.content,
          description: removed.description,
          status: destination.droppableId,
          position: destination.index, // Pass position to the backend
        });

        // Optionally, update the entire order of the column
        const updateColumnOrderIfres = await updateColumnOrder(
          destination.droppableId,
          destItems
        );
        console.log(
          "onDragEnd ~ updateColumnOrderIfres:",
          updateColumnOrderIfres
        );
      } catch (error) {
        console.error("Error updating task:", error);
      }
    } else {
      // Reordering within the same column
      const column = columns[source.droppableId];
      const copiedItems = Array.from(column.items);
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);

      // Update positions within the same column
      copiedItems.forEach((item, index) => {
        item.position = index;
      });

      setColumns((prevColumns) => ({
        ...prevColumns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      }));

      // Update task order in the backend
      try {
        const updateColumnOrderElseres = await updateColumnOrder(
          source.droppableId,
          copiedItems
        );
        console.log(
          "onDragEnd ~ updateColumnOrderElseres:",
          updateColumnOrderElseres
        );
      } catch (error) {
        console.error("Error updating task order:", error);
      }
    }
  };

  const handleTaskCreate = async () => {
    if (!newTask.title) return;
    try {
      // Determine the new position based on the current number of items in "To Do" column
      const newPosition = columns["To Do"].items.length;

      // Create a new task with title, description, and position
      const createdTask = await createTask({
        ...newTask,
        position: newPosition,
      });

      setColumns((prev) => ({
        ...prev,
        "To Do": {
          ...prev["To Do"],
          items: [
            ...prev["To Do"].items,
            {
              id: createdTask._id,
              content: createdTask.title,
              description: createdTask.description,
              position: newPosition, // Add the new position to the task
            },
          ],
        },
      }));
      setShowModal(false);
      setNewTask({ title: "", description: "" });
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleTaskEdit = (task: APITask) => {
    setEditingTask({
      _id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      position: task.position, // Ensure this is included
    });
    setNewTask({ title: task.title, description: task.description });
    setShowModal(true);
  };

  const handleTaskUpdate = async () => {
    if (editingTask && newTask.title) {
      try {
        await updateTaskById(editingTask._id, {
          ...newTask,
          status: editingTask.status,
        });
        setColumns((prev) => {
          const updatedColumn = prev[editingTask.status];
          const updatedItems = updatedColumn.items.map((item) =>
            item.id === editingTask._id
              ? {
                  ...item,
                  content: newTask.title,
                  description: newTask.description,
                }
              : item
          );

          return {
            ...prev,
            [editingTask.status]: { ...updatedColumn, items: updatedItems },
          };
        });
        setShowModal(false);
        setEditingTask(null);
        setNewTask({ title: "", description: "" });
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
  };

  const handleTaskDelete = async (taskId: string, status: string) => {
    try {
      await deleteTaskById(taskId);
      setColumns((prev) => {
        const updatedItems = prev[status].items.filter(
          (item) => item.id !== taskId
        );
        return {
          ...prev,
          [status]: { ...prev[status], items: updatedItems },
        };
      });
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // if (!window) return null;

  return (
    <>
      <div className="flex items-center justify-between p-8">
        <h1 className="text-3xl font-bold uppercase cursor-pointer">
          Task{" "}
          <span className="text-blue-500 hover:text-blue-700 transition-all duration-300">
            MGT
          </span>
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-700 transition-all duration-300 text-white rounded flex items-center gap-2"
        >
          Add Task <FiPlusCircle />
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col md:flex-row justify-center gap-6 px-8">
          {Object.entries(columns).map(([columnId, column]) => (
            <Droppable
              droppableId={columnId}
              key={columnId}
              direction="vertical"
              isDropDisabled={false}
              isCombineEnabled={false}
              ignoreContainerClipping={false}
            >
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-blue-50 rounded-lg w-full h-[75vh] overflow-y-scroll p-4 border flex flex-col space-y-4"
                >
                  <h2 className="text-xl font-semibold mb-4">{column.title}</h2>
                  {column.items.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      taskId={task.id}
                      content={task.content}
                      description={task.description}
                      index={index}
                      onEdit={() =>
                        handleTaskEdit({
                          _id: task.id,
                          title: task.content,
                          description: task.description,
                          status: columnId,
                          position: task.position,
                        })
                      }
                      onDelete={() => handleTaskDelete(task.id, columnId)}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {showModal && (
        <Modal
          title={editingTask ? "Edit Task" : "Create Task"}
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
            setNewTask({ title: "", description: "" });
          }}
          onSave={editingTask ? handleTaskUpdate : handleTaskCreate}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>
        </Modal>
      )}
    </>
  );
};

export default Home;
