import { ButtonText } from "./ButtonText";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onDelete: () => void;
  title: string;
}

export default function ConfirmDeleteModal({
  isOpen,
  onCancel,
  onDelete,
  title,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-30 flex justify-center items-center z-999">
          <div className="flex flex-col gap-2 bg-background p-4 rounded-md shadow-md">
            <h3 className="m-0 p-0">Delete Topic {title} ?</h3>
            <div className="flex flex-col text-xs">
              <span>Are you sure you want to delete this topic?</span>
              <span>This action cannot be undone.</span>
            </div>
            <div className="flex justify-end gap-2">
              <ButtonText
                onClick={() => onCancel()}
                title="Cancel"
                className="bg-surface"
              />
              <ButtonText
                onClick={() => onDelete() }
                title="Delete"
                className="bg-destructive"
              />
            </div>
          </div>
        </div>
  );
}
