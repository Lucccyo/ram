import { useState } from "react";
import { ButtonText } from "./ButtonText";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

interface NoteTitleProps {
  title: string;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
}

export function NoteTitle({ title, onRename, onDelete }: NoteTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(title);
  const [isModalOpen, setModalOpen] = useState(false);

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
    <div className="flex flex-row justify-between items-center gap-2 my-2">
      {isEditing ? (
        <>
          <input
            className="text-4xl rounded-md m-0 p-0 bg-transparent bg-surface px-1"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            autoFocus
          />
          <div className="flex flex-row gap-2">
            <ButtonText
              onClick={handleSave}
              className="bg-action text-inverse"
              title="Save"
            />
            <ButtonText
              onClick={() => setModalOpen(true)}
              className="bg-destructive"
              title="Delete"
            />
            <ButtonText
              onClick={handleCancel}
              className="bg-surface"
              title="Cancel"
            />
          </div>
        </>
      ) : (
        <>
          <h2 className="text-4xl m-0 p-0">{title || "No data."}</h2>
          <ButtonText
            onClick={() => {
              setInputValue(title);
              setIsEditing(true);
            }}
            className="bg-action text-inverse"
            title="Edit"
          />
        </>
      )}

      <ConfirmDeleteModal
        isOpen={isModalOpen}
        onCancel={() => setModalOpen(false)}
        onDelete={() => {
          setModalOpen(false);
          onDelete();
          handleCancel();
        }}
        title={title}
      />
    </div>
  );
}
