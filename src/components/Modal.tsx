"use client";

import React from "react";

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose, onSave }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-96 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded transition-all duration-300 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-500 text-white rounded transition-all duration-300 hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
