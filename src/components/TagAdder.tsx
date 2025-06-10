import { useEffect, useRef, useState } from "react";

import { Plus, } from "lucide-react";

export function TagAdder({ saveTag }: { saveTag: (tag: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setAdding(false);
        setInputValue("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      saveTag(inputValue.trim());
      setInputValue("");
      setAdding(false);
    }
  };

  return (
    <div ref={wrapperRef} className="inline-block">
      {adding ? (
        <input
          ref={inputRef}
          className="h-[32px] px-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded mr-2"
          autoFocus
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="px-2 py-1 h-[32px] w-[32px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded mr-2"
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  );
}
