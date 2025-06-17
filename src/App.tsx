import { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { marked } from "marked";
import {
  Menu,
  X,
  Dices,
  Plus,
  Columns2,
  Eye,
  Pencil,
  Sun,
  Moon,
} from "lucide-react";

import "./index.css";
import { TagAdder } from "./components/TagAdder"
import { NoteTitle } from "./components/NoteTitle"
import { ButtonIcon } from "./components/ButtonIcon"
import { ButtonText } from "./components/ButtonText"

export default function App() {
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [search, setSearch] = useState("");
  const [newTopicInput, setNewTopicInput] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [htmlPreview, setHtmlPreview] = useState("");
  const [viewMode, setViewMode] = useState<"code" | "both" | "preview">("both");
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [theme, setTheme] = useState("light")
  const [tags, setTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<string[]>([]);

  function storeTheme(theme: "dark" | "light") {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    setTheme(theme);
  }

  const refreshFilteredTopics = () => {
    if (selectedTags.length === 0) {
      setFilteredTopics(topics);
      console.log("no tags");
    } else {
      filterTopicsByTags();
      console.log(selectedTags);
    }
  };

  const handleDeleteTopic = () => {
    if (!currentTopic) return;
    tags.forEach((tag) => {
      deleteTag(currentTopic, tag);
    });
    invoke("delete_note", { word: currentTopic })
      .then(() => {
        const updatedTopics = topics.filter(topic => topic !== currentTopic);
        setTopics(updatedTopics);
        refreshTags();
        if (updatedTopics.length === 0) {
          setCurrentTopic(null);
          setNote("");
        } else {
          const random = updatedTopics[Math.floor(Math.random() * updatedTopics.length)];
          setCurrentTopic(random);
        }
      })
      .catch(() => alert("Error deleting topic"));
  }

  useEffect(() => {
    refreshFilteredTopics();
  }, [selectedTags, topics]);

  const filterTopicsByTags = async () => {
    if (selectedTags.length === 0) {
      setFilteredTopics(topics);
      return;
    }
    const matches: string[] = [];
    for (const topic of topics) {
      try {
        const topicTags: string[] = await invoke("get_tags", { noteTitle: topic });
        if (selectedTags.every(tag => topicTags.includes(tag))) {
          matches.push(topic);
        }
      } catch (e) {
        console.error(`Failed to get tags for ${topic}:`, e);
      }
    }
    setFilteredTopics(matches);
  };

  useEffect(() => {
    filterTopicsByTags();
  }, [selectedTags, topics]);

  useEffect(() => {
    invoke("list_notes")
      .then((topics) => {
        const topicList = topics as string[];
        setTopics(topicList);
        setFilteredTopics(topicList); // initialisation
        if (topicList.length > 0) {
          const index = Math.floor(Math.random() * topicList.length);
          setCurrentTopic(topicList[index]);
        }
      })
      .catch((e) => console.error("Error loading topics list:", e));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored ?? (prefersDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    console.log(theme);
  }, []);

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

  const deleteTag = async (topic: string, tag: string) => {
    try {
      await invoke("delete_tag", { tagLabel: tag, noteTitle: topic });
      await loadTags(topic);
    } catch (e) {
      console.error("Error deleting tag:", e);
    }
  };

  const updtAllTags = async () => {
    try {
      const loadedTags = await invoke<string[]>("get_all_tags");
      setAllTags(loadedTags);
    } catch (e) {
      console.error("Error fetching tags:", e);
      setAllTags([]);
    }
  };

  const loadTags = async (topic: string) => {
    try {
      const loaded_tags: string[] = await invoke("get_tags", { noteTitle: topic });
      setTags(loaded_tags);
    } catch (e) {
      console.error("Error loading tags:", e);
      setTags([]);
    }
  };

  const addTag = async (topic: string, tag: string) => {
    try {
      await invoke("add_tag", { tagLabel: tag, noteTitle: topic });
      await loadTags(topic);
    } catch (e) {
      console.error("Error adding tag:", e);
    }
  };

  const saveTag = (tag: string) => {
    if (currentTopic != null) {
      addTag(currentTopic, tag).then(() => {
        loadTags(currentTopic);
        updtAllTags();
      });
    }
  };

  const loadNoteFromFile = async (topic: string) => {
    try {
      const loaded_note = await invoke<string>("load_note", { word: topic });
      setNote(loaded_note);
      setSearch("");
    } catch (e) {
      console.error("Error loading note:", e);
      setNote("");
    }
  };

  useEffect(() => {
    if (currentTopic) {
      loadNoteFromFile(currentTopic);
      loadTags(currentTopic);
    } else {
      setNote("");
      setTags([]);
    }
  }, [currentTopic]);

  useEffect(() => {
    updtAllTags();
  }, []);

  const saveNoteToFile = async () => {
    if (!currentTopic) return;
    try {
      await invoke("save_note", {
        word: currentTopic,
        body: note
      });
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  useEffect(() => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(() => {
      saveNoteToFile();
    }, 1000);

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [note, currentTopic]);

  useEffect(() => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(() => {
      saveNoteToFile();
    }, 1000);

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [note, currentTopic]);

  useEffect(() => {
    const renderMarkdown = async () => {
      const html = await marked.parse(note);
      setHtmlPreview(html);
    };
    renderMarkdown();
  }, [note]);

  const refreshTopics = () => {
    invoke("list_notes")
      .then((topics) => setTopics(topics as string[]))
      .catch((e) => console.error("Error loading topics list:", e));
  };

  const addNewTopic = () => {
    setNewTopicInput("");
    setShowNewTopicModal(true);
  };

  const refreshTags = async () => {
    try {
      const updatedTags: string[] = await invoke("get_all_tags");
      setAllTags(updatedTags);
    } catch (error) {
      console.error("Erreur lors de la récupération des tags :", error);
    }
  };

  const confirmRenameTopic = (new_name: string) => {
    if (!currentTopic) return;
    const old_name = currentTopic.trim();
    invoke("rename_note", { oldWord: old_name, newWord: new_name })
      .then(() => {
        setCurrentTopic(new_name.trim());
        refreshTopics();
      })
      .catch((e) => alert(e));
    invoke("rename_note_tag", {oldWord: old_name, newWord: new_name})
      .then(refreshTags)
      .catch((e) => alert(e));
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
    if (topics.length < 2) return;
    let index = 0;
    do {
      index = Math.floor(Math.random() * topics.length);
    } while (currentTopic == topics[index])
    setCurrentTopic(topics[index]);
  };

  const isEditorVisible = viewMode === "code" || viewMode === "both";
  const isPreviewVisible = viewMode === "preview" || viewMode === "both";

  return (
    <div className="flex h-screen bg-background">
      <div
        className={`p-2 text-xs bg-surface text-primary overflow-hidden ${menuCollapsed ? "" : "w-[25em]"
          }`}
      >
        <div className="flex gap-2 flex-col">
          <button
            onClick={() => setMenuCollapsed(!menuCollapsed)}
            className="text-action p-1 rounded-md cursor-pointer flex items-center gap-2"
          >
            {menuCollapsed ? <Menu size={16} /> : <X size={16} />}
          </button>

          <button
            onClick={addNewTopic}
            className="text-action p-1 rounded-md cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} />
            {!menuCollapsed && <span>Add</span>}
          </button>

          <button
            onClick={randomTopic}
            disabled={topics.length === 0}
            className="text-action p-1 rounded-md cursor-pointer flex items-center gap-2"
          >
            <Dices size={16} />
            {!menuCollapsed && <span>Random</span>}
          </button>
          <button
            onClick={() => {
              const newTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
              storeTheme(newTheme);
            }}
            className="text-action p-1 rounded-md cursor-pointer flex items-center gap-2"
          >
            {theme == "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {!menuCollapsed && <span>{theme == "dark" ? "Light" : "Dark"} mode</span>}
          </button>
        </div>

        {!menuCollapsed && (
          <>
            <div className="my-4">
              <h4 className="text-sm mb-1">Filter by tags</h4>
              <div className="flex flex-wrap gap-1">
                {allTags.length === 0 ? (
                  <span className="text-xs text-secondary">No tags.</span>
                ) : (
                  allTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          setSelectedTags((prev) =>
                            isSelected
                              ? prev.filter((t) => t !== tag)
                              : [...prev, tag]
                          );
                        }}
                        className={`px-2 py-1 rounded text-xs ${isSelected
                          ? "bg-constructive text-inverse"
                          : "bg-soft text-secondary"
                          }`}
                      >
                        {tag}
                      </button>
                    );
                  })
                )}
              </div>

            </div>
            <div>
              <h3 className="text-base p-0 m-0 mt-6">Topics</h3>
              <input
                type="text"
                placeholder="Search topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full mb-2 mt-1 px-2 py-1 rounded-md text-sm bg-background"
              />
              <ul className="list-none p-0 m-0 max-h-[70vh] overflow-y-auto pr-1 mt-2">
                {filteredTopics
                  .filter((t) => t.toLowerCase().includes(search.toLowerCase()))
                  .map((topic, index) => (
                    <li
                      key={index}
                      onClick={() => setCurrentTopic(topic)}
                      className={`text-xs cursor-pointer px-2 py-1 rounded-md mb-1 ${topic === currentTopic
                        ? "bg-action text-inverse"
                        : "bg-transparent"
                        } truncate`}
                    >
                      {topic}
                    </li>
                  ))}
              </ul>
            </div>
          </>
        )}
      </div>

      <div className="flex p-2 flex-col gap-4 w-screen">
        <NoteTitle
          title={currentTopic || ""}
          onRename={confirmRenameTopic}
          onDelete={handleDeleteTopic}
        />

        <div className="flex flex-row gap-1">
          {tags.map((tag, index) => (
            <span key={index} className="flex flex-row items-center justify-center gap-1 px-3 py-1 h-[30px] bg-soft text-secondary rounded mr-2">{tag}
              <button
                onClick={() => {
                  if (currentTopic != null) {
                    deleteTag(currentTopic, tag);
                    refreshTags();
                    refreshTopics();
                    setSelectedTags(prev => prev.filter(t => t !== tag));
                  }
                }}
              >
                <X size={14} />
              </button>
            </span>
          ))}
          <div className="h-[30px]">
            <TagAdder saveTag={saveTag} allTags={allTags} />
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex gap-[2px] rounded-md border border-soft p-[2px]">
            <ButtonIcon
              onClick={() => setViewMode("code")}
              icon={<Pencil size={14} />}
              className={`w-[30px] h-[30px]
              ${viewMode === "code"
                  ? "bg-constructive text-inverse"
                  : "bg-surface"
                }`}
            />
            <ButtonIcon
              onClick={() => setViewMode("both")}
              icon={<Columns2 size={14} />}
              className={`w-[30px] h-[30px]
              ${viewMode === "both"
                  ? "bg-constructive text-inverse"
                  : "bg-surface"
                }`}
            />
            <ButtonIcon
              onClick={() => setViewMode("preview")}
              icon={<Eye size={14} />}
              className={`w-[30px] h-[30px]
              ${viewMode === "preview"
                  ? "bg-constructive text-inverse"
                  : "bg-surface"
                }`}
            />
          </div>
          {/* <ButtonIcon
            onClick={() => setDeleteTopic(true)}
            icon={<Trash2 size={14} />}
            disabled={!currentTopic}
            className={`${currentTopic
              ? "bg-destructive text-inverse"
              : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
          /> */}
        </div>

        {isEditorVisible && (
          <>
            <h3 className="text-base p-0 m-0">Editor</h3>
            <textarea
              className={`mt-[-10px] p-2 rounded-md resize-y outline-none text-xs flex font-mono bg-surface
                ${isPreviewVisible
                  ? "h-[50%]"
                  : "h-[100%]"}`}
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
              className={`prose prose-sm markdown mt-[-10px] p-2 rounded-md outline-none text-xs flex flex-col w-full bg-surface preview-html overflow-y-auto overflow-x-hidden break-words whitespace-pre-wrap
                ${isEditorVisible
                  ? "h-[50%]"
                  : "h-[100%]"}`}
              dangerouslySetInnerHTML={{ __html: htmlPreview }}
            />
          </>
        )}
      </div>

      {showNewTopicModal && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-30 flex justify-center items-center z-999">
          <div className="flex flex-col gap-2 bg-background p-4 rounded-md shadow-md">
            <h3 className="m-0 p-0">New Topic</h3>
            <input
              type="text"
              value={newTopicInput}
              onChange={(e) => setNewTopicInput(e.target.value)}
              className="p-2 text-xs rounded-md bg-surface"
              placeholder="Enter topic name"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <ButtonText
                onClick={() => setShowNewTopicModal(false)}
                title="Cancel"
                className="bg-surface"
              />
              <ButtonText
                onClick={() => confirmAddTopic()}
                title="Add"
                className="bg-action text-inverse"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
