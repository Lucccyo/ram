import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { marked } from "marked";
import {
  Menu,
  X,
  Save,
  Dices,
  Trash2,
  Plus,
  Columns2,
  Eye,
  Pencil,
  Sun,
  Moon,
} from "lucide-react";

import "./index.css";

export default function App() {
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopicInput, setNewTopicInput] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [htmlPreview, setHtmlPreview] = useState("");
  const [viewMode, setViewMode] = useState<"code" | "both" | "preview">("both");
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [savedNote, setSavedNote] = useState("");
  const isModified = note !== savedNote;
  const [warningUnsaved, setWarningUnsaved] = useState(false);
  const [nextTopicTmp, setNextTopicTmp] = useState<string | null>(null);
  const [deleteTopic, setDeleteTopic] = useState(false);
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    invoke("list_notes")
      .then((topics) => {
        const topicList = topics as string[];
        setTopics(topicList);
        if (topicList.length > 0) {
          const index = Math.floor(Math.random() * topicList.length);
          setCurrentTopic(topicList[index]);
        }
      })
      .catch((e) => console.error("Error loading topics list:", e));
  }, []);

  useEffect(() => {
    if (currentTopic) {
      invoke("load_note_from_file", { word: currentTopic })
        .then((content) => {
          const text = content as string;
          setNote(text);
          setSavedNote(text);
        })
        .catch(() => {
          setNote("");
          setSavedNote("");
        });
    }
  }, [currentTopic]);

  useEffect(() => {
    console.log("note =", note);
    const renderMarkdown = async () => {
      const html = await marked.parse(note);
      setHtmlPreview(html);
      console.log("htmlprev = ", htmlPreview);
    };
    renderMarkdown();
  }, [note]);

  const refreshTopics = () => {
    invoke("list_notes")
      .then((topics) => setTopics(topics as string[]))
      .catch((e) => console.error("Error loading topics list:", e));
  };

  const saveNote = () => {
    if (!currentTopic) return;
    invoke("save_note_to_file", { word: currentTopic, content: note })
      .then(() => setSavedNote(note))
      .catch((e) => alert("Error saving note: " + e));
  };

  const addNewTopic = () => {
    setNewTopicInput("");
    setShowNewTopicModal(true);
  };

  const confirmAddTopic = () => {
    const topic = newTopicInput.trim();
    if (!topic) return;

    invoke("create_note", { word: topic })
      .then(() => {
        setCurrentTopic(topic);
        setNote("");
        refreshTopics();
        setShowNewTopicModal(false);
      })
      .catch((e) => alert("Error creating topic: " + e));
  };

  const randomTopic = () => {
    if (topics.length === 0) return;
    const index = Math.floor(Math.random() * topics.length);
    setCurrentTopic(topics[index]);
  };

  const toggleDarkMode = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  };

  const isEditorVisible = viewMode === "code" || viewMode === "both";
  const isPreviewVisible = viewMode === "preview" || viewMode === "both";

  return (
    <div className="flex h-screen">
      <div
        className={`p-2 border-r text-xs border-r-zinc-200 dark:border-r-zinc-700 box-border ${
          menuCollapsed ? "" : "w-[20em]"
        }`}
      >
        <div className="flex gap-2 flex-col">
          <button
            onClick={() => setMenuCollapsed(!menuCollapsed)}
            className="hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-md transition-all duration-200 cursor-pointer flex items-center gap-2"
          >
            {menuCollapsed ? <Menu size={16} /> : <X size={16} />}
          </button>

          <button
            onClick={addNewTopic}
            className="hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-md transition-all duration-200 cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} />
            {!menuCollapsed && <span>Add</span>}
          </button>

          <button
            onClick={randomTopic}
            disabled={topics.length === 0}
            className="hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-md transition-all duration-200 cursor-pointer flex items-center gap-2"
          >
            <Dices size={16} />
            {!menuCollapsed && <span>Random</span>}
          </button>
          <button
            onClick={toggleDarkMode}
            className="hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-md transition-all duration-200 cursor-pointer flex items-center gap-2"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {!menuCollapsed && <span>{darkMode ? "Light" : "Dark"} mode</span>}
          </button>
        </div>

        {!menuCollapsed && (
          <div>
            <h3 className="text-base p-0 m-0 mt-6">Topics</h3>
            <ul className="list-none p-0 m-0 max-h-[780px] overflow-y-auto pr-1">
              {topics.map((topic) => (
                <li
                  key={topic}
                  onClick={() => {
                    if (isModified) {
                      setWarningUnsaved(true);
                      setNextTopicTmp(topic);
                    } else {
                      setCurrentTopic(topic);
                    }
                  }}
                  className={`text-xs cursor-pointer px-2 py-1 rounded-md transition-all duration-200 mb-1 ${
                    topic === currentTopic
                      ? "bg-zinc-200 dark:bg-zinc-700"
                      : "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  } truncate`}
                >
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex p-2 flex-col gap-4 w-screen">
        <h2 className="text-2xl m-0 p-0">{currentTopic || "No data."}</h2>

        <div className="flex gap-2 items-center">
          <div className="flex gap-[2px] rounded-md border border-zinc-200 dark:border-zinc-700 p-[2px] transition-all duration-200">
            <button
              onClick={() => setViewMode("code")}
              className={`flex items-center w-[30px] h-[30px] rounded-md justify-center cursor-pointer p-1 ${
                viewMode === "code"
                  ? "bg-zinc-200 dark:bg-zinc-700"
                  : "bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setViewMode("both")}
              className={`flex items-center w-[30px] h-[30px] rounded-md justify-center cursor-pointer p-1 ${
                viewMode === "both"
                  ? "bg-zinc-200 dark:bg-zinc-700"
                  : "bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Columns2 size={14} />
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center w-[30px] h-[30px] rounded-md justify-center cursor-pointer p-1 ${
                viewMode === "preview"
                  ? "bg-zinc-200 dark:bg-zinc-700"
                  : "bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Eye size={14} />
            </button>
          </div>

          <button
            onClick={() => setDeleteTopic(true)}
            className={`flex justify-center items-center rounded-md cursor-pointer w-[36px] h-[36px] transition-all duration-200
${
  currentTopic != null
    ? "bg-red-200 dark:bg-red-700 hover:bg-red-300 dark:hover:bg-red-600"
    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed"
}
            `}
            disabled={!currentTopic}
          >
            <Trash2 size={14} />
          </button>

          <button
            onClick={saveNote}
            className={`flex justify-center items-center rounded-md cursor-pointer w-[36px] h-[36px] transition-all duration-200
${
  currentTopic != null && isModified
    ? "bg-green-200 dark:bg-green-700 hover:bg-green-300 dark:hover:bg-green-600"
    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed"
}
            `}
            disabled={!currentTopic}
          >
            <Save size={14} />
          </button>
        </div>

        {isEditorVisible && (
          <>
            <h3 className="text-base p-0 m-0">Editor</h3>
            <textarea
              className={`mt-[-10px] p-2 rounded-md border resize-y outline-none text-xs flex font-mono bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-black dark:text-white ${
                isPreviewVisible ? "h-[50%]" : "h-[100%]"
              }`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={!currentTopic}
            />
          </>
        )}

        {isPreviewVisible && (
          <>
            <h3 className="text-base p-0 m-0">Preview</h3>
            <div
              className={`mt-[-10px] p-2 rounded-md border outline-none text-xs flex flex-col w-full
    bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-black dark:text-white preview-html
    overflow-y-auto overflow-x-hidden break-words whitespace-pre-wrap
    ${isEditorVisible ? "h-[50%]" : "h-[100%]"}`}
              dangerouslySetInnerHTML={{ __html: htmlPreview }}
            />
          </>
        )}
      </div>

      {showNewTopicModal && (
        <div className="fixed inset-0 bg-zinc-900 bg-opacity-50 flex justify-center items-center z-999">
          <div className="flex flex-col gap-2 bg-white dark:bg-zinc-800 p-4 rounded-md shadow-md">
            <h3 className="m-0 p-0">New Topic</h3>
            <input
              type="text"
              value={newTopicInput}
              onChange={(e) => setNewTopicInput(e.target.value)}
              className="p-2 text-xs border rounded-md bborder-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              placeholder="Enter topic name"
            />
            <div className="flex justify-end gap-2">
              <button
                className="flex cursor-pointer gap-2 items-center justify-center p-2 bg-zinc-200 dark:bg-zinc-700 rounded-md text-xs"
                onClick={() => setShowNewTopicModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex cursor-pointer gap-2 items-center justify-center p-2 bg-green-200 dark:bg-green-700 rounded-md text-xs"
                onClick={confirmAddTopic}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {warningUnsaved && (
        <div className="fixed inset-0 bg-zinc-900 bg-opacity-50 flex justify-center items-center z-999">
          <div className="flex flex-col gap-2 bg-white dark:bg-zinc-800 p-4 rounded-md shadow-md">
            <h3 className="m-0 p-0">Warning</h3>
            <div className="flex flex-col text-xs">
              <span>Your current note has been modified but not saved.</span>
              <span>If you switch topics, your changes will be lost.</span>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="flex cursor-pointer gap-2 items-center justify-center p-2 bg-zinc-200 dark:bg-zinc-700 rounded-md text-xs"
                onClick={() => setWarningUnsaved(false)}
              >
                Cancel
              </button>
              <button
                className="flex cursor-pointer gap-2 items-center justify-center p-2 bg-red-200 dark:bg-red-700 rounded-md text-xs"
                onClick={() => {
                  if (nextTopicTmp) setCurrentTopic(nextTopicTmp);
                  setWarningUnsaved(false);
                  setNextTopicTmp(null);
                }}
              >
                Switch Topic
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTopic && (
        <div className="fixed inset-0 bg-zinc-900 bg-opacity-50 flex justify-center items-center z-999">
          <div className="flex flex-col gap-2 bg-white dark:bg-zinc-800 p-4 rounded-md shadow-md">
            <h3 className="m-0 p-0">Delete Topic</h3>
            <div className="flex flex-col text-xs">
              <span>Are you sure you want to delete this topic?</span>
              <span>This action cannot be undone.</span>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="flex cursor-pointer gap-2 items-center justify-center p-2 bg-zinc-200 dark:bg-zinc-700 rounded-md text-xs"
                onClick={() => setDeleteTopic(false)}
              >
                Cancel
              </button>
              <button
                className="flex cursor-pointer gap-2 items-center justify-center p-2 bg-red-200 dark:bg-red-700 rounded-md text-xs"
                onClick={() => {
                  if (!currentTopic) return;
                  invoke("delete_note", { word: currentTopic })
                    .then(() => {
                      setDeleteTopic(false);
                      setNote("");
                      setCurrentTopic(null);
                      refreshTopics();
                    })
                    .catch(() => alert("Error deleting topic"));
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
