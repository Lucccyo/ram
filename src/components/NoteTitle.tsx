import { useState } from "react";

interface NoteTitleProps {
  title: string;
  onRename: (newTitle: string) => void;
}

export function NoteTitle({ title, onRename }: NoteTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(title);

  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (trimmed.length > 0 && trimmed !== title) {
      onRename(trimmed);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setInputValue("");
    setIsEditing(false);
  };

  return (
    <div className="flex flex-row justify-between items-center gap-2 mb-2">
      {isEditing ? (
        <>
          <input
            className="text-2xl m-0 p-0 bg-transparent border-b border-zinc-400 dark:border-zinc-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 px-1"
            value={title}
            onChange={e => setInputValue(e.target.value)}
            autoFocus
          />
          <div className="flex flex-row gap-2">
            <button
              onClick={handleSave}
              className="flex justify-center items-center rounded-md cursor-pointer transition-all duration-200 mr-2 py-2 px-4 bg-green-200 dark:bg-green-800"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex justify-center items-center rounded-md cursor-pointer transition-all duration-200 mr-2 py-2 px-4 bg-zinc-200 dark:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl m-0 p-0">{title || "No data."}</h2>
          <button
            onClick={() => setIsEditing(true)}
            className={`flex justify-center items-center rounded-md cursor-pointer transition-all duration-200 mr-2 py-2 px-4 ${title ? "bg-zinc-200 dark:bg-zinc-800" : "text-zinc-500 cursor-not-allowed"
              }`}
          >
            Edit
          </button>
        </>
      )}
    </div>
  );
}
