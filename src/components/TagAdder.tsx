import { useEffect, useRef, useState } from "react";

import { Plus, } from "lucide-react";

export function TagAdder({ saveTag, allTags }: { saveTag: (tag: string) => void, allTags: string[] }) {
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

  const handleTagSelect = (tag: string) => {
    saveTag(tag);
    setInputValue("");
    setAdding(false);
  };

 return (
<div ref={wrapperRef} className="inline-block">
  {adding ? (
    <div className="fixed">
      <input
        ref={inputRef}
        className="h-[32px] w-[200px] px-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded mr-2"
        autoFocus
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="absolute z-[99] mt-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800"
        style={{ maxHeight: "200px", overflow: "scroll", }}>
        {allTags.map((tag, index) => (
          <div
            key={index}
            onClick={() => handleTagSelect(tag)}
            className="px-2 py-1 cursor-pointer hover:bg-zinc-100 hover:dark:bg-zinc-700 w-[200px]"
          >
            {tag}
          </div>
        ))}
      </div>
      </div>
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
