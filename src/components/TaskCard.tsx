"use client";

import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface TaskCardProps {
  taskId: string;
  content: string;
  description?: string;
  index: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  taskId,
  content,
  description = "",
  index,
  onEdit,
  onDelete,
}) => {
  return (
    <Draggable draggableId={taskId} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white p-4 rounded-md border ${
            snapshot.isDragging ? "shadow-lg" : ""
          } flex justify-between items-start`}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          <div className="flex-1">
            <div className="font-semibold text-lg">{content}</div>
            {description && (
              <div className="text-sm text-gray-500 mt-1">{description}</div>
            )}
          </div>
          <div className="flex ml-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-blue-500 hover:text-blue-700 p-2 rounded-full transition-all duration-300 hover:bg-blue-100"
              >
                <FiEdit />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-red-500 hover:text-red-700 p-2 rounded-full transition-all duration-300 hover:bg-red-100"
              >
                <FiTrash2 />
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
