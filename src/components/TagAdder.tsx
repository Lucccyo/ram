import { useEffect, useRef, useState } from "react";

import { ButtonIcon } from "./ButtonIcon"
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
    <div ref={wrapperRef} className="fixed inline-block text-secondary">
      {adding ? (
        <div className="fixed">
          <input
            ref={inputRef}
            className="h-[30px] w-[200px] px-2 bg-soft rounded-md mr-2"
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="absolute z-[99] bg-soft rounded-b-md"
            style={{ maxHeight: "200px", overflow: "scroll", }}>
            {allTags.map((tag, index) => (
              <div
                key={index}
                onClick={() => handleTagSelect(tag)}
                className="px-2 cursor-pointer w-[200px]"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ButtonIcon
          onClick={() => setAdding(true)}
          icon={<Plus size={14} />}
          className="h-[30px] w-[30px] bg-soft"
        />
      )}
    </div>
  );
}
