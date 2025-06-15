import { useState } from "react";
import { ButtonText } from "./ButtonText"

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
    setInputValue(title);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-row justify-between items-center gap-2 mb-2">
      {isEditing ? (
        <>
          <input
            className="text-2xl m-0 p-0 bg-transparent border-b border-zinc-400 dark:border-zinc-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 px-1"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            autoFocus
          />
          <div className="flex flex-row gap-2">
            <ButtonText
              onClick={() => handleSave()}
              className="bg-green-200 dark:bg-green-800"
              title="Save"
            />
            <ButtonText
              onClick={() => handleCancel()}
              className="bg-zinc-200 dark:bg-zinc-800"
              title="Cancel"
            />
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl m-0 p-0">{title || "No data."}</h2>
            <ButtonText
              onClick={() => {
                setInputValue(title);
                setIsEditing(true) }}
              className={`${title ? "bg-zinc-200 dark:bg-zinc-800" : "text-zinc-500 cursor-not-allowed"}`}
              title="Edit"
            />
        </>
      )}
    </div>
  );
}
