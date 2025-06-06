import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { marked } from "marked";

import { Menu, X, Save, Dices, Trash2, Plus, Columns2, Eye, Pencil } from "lucide-react";

export default function App() {
const [showNewTopicModal, setShowNewTopicModal] = useState(false);
const [newTopicInput, setNewTopicInput] = useState("");
const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [htmlPreview, setHtmlPreview] = useState("");
  const [viewMode, setViewMode] = useState<"code" | "both" | "preview">("both");
  const [menuCollapsed, setMenuCollapsed] = useState(false);

  useEffect(() => {
    refreshTopics();
  }, []);

  useEffect(() => {
    if (currentTopic) {
      invoke("load_note_from_file", { word: currentTopic })
        .then((content) => setNote(content as string))
        .catch(() => setNote(""));
    }
  }, [currentTopic]);

  useEffect(() => {
    marked(note, { async: true }).then(setHtmlPreview);
  }, [note]);

  const refreshTopics = () => {
    invoke("list_notes")
      .then((topics) => setTopics(topics as string[]))
      .catch((e) => console.error("Error loading topics list:", e));
  };

  const saveNote = () => {
    if (!currentTopic) return;
    invoke("save_note_to_file", { word: currentTopic, content: note }).catch((e) =>
      alert("Error saving note: " + e)
    );
  };

  const deleteTopic = () => {
    if (!currentTopic) return;
    if (!confirm(`Delete topic "${currentTopic}"?`)) return;
    invoke("delete_note", { word: currentTopic })
      .then(() => {
        setCurrentTopic(null);
        setNote("");
        refreshTopics();
      })
      .catch((e) => alert("Error deleting topic: " + e));
  };

const addNewTopic = () => {
  setNewTopicInput("");
  setError(null);
  setShowNewTopicModal(true);
};

const confirmAddTopic = () => {
  const topic = newTopicInput.trim();
  if (!topic) return;

  if (topics.includes(topic)) {
    setError("This topic already exists.");
    return;
  }

  invoke("create_note", { word: topic })
    .then(() => {
      setCurrentTopic(topic);
      setNote("");
      refreshTopics();
      setShowNewTopicModal(false);
    })
    .catch((e) => setError("Error creating topic: " + e));
};


  const randomTopic = () => {
    if (topics.length === 0) return;
    const index = Math.floor(Math.random() * topics.length);
    setCurrentTopic(topics[index]);
  };

  const isEditorVisible = viewMode === "code" || viewMode === "both";
  const isPreviewVisible = viewMode === "preview" || viewMode === "both";

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div
        style={{
          width: menuCollapsed ? 60 : 200,
          transition: "width 0.3s",
          padding: 10,
          borderRight: "1px solid #ccc",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
          <button onClick={() => setMenuCollapsed(!menuCollapsed)}
            style={{ cursor: "pointer" }}
          >
            {menuCollapsed ? <Menu /> : <X />}
          </button>
          <button onClick={addNewTopic} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
            <Plus size={16}/>
            {!menuCollapsed && <span>Add</span>}
          </button>
          <button onClick={randomTopic} disabled={topics.length === 0} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
            <Dices size={16}/>
            {!menuCollapsed && <span>Random</span>}
          </button>
        </div>

        {!menuCollapsed && (
          <>
            <h3>Topics</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {topics.map((topic) => (
                <li
                  key={topic}
                  onClick={() => setCurrentTopic(topic)}
                  style={{
                    cursor: "pointer",
                    padding: "5px 10px",
                    backgroundColor: topic === currentTopic ? "#eee" : "transparent",
                    borderRadius: 4,
                  }}
                >
                  {topic}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div style={{ flex: 1, padding: 10, display: "flex", flexDirection: "column", gap: "10px"}}>
        <h2>Note for {currentTopic || "..."}</h2>

        <div style={{ display: "flex", gap: "10px", marginBottom: 10, alignItems: "center" }}>
          <div style={{
              display: "flex",
              gap: "2px",
              border: "1px solid #ccc",
              padding: "2px",
              borderRadius: "5px",
            }}>
            <button
              onClick={() => setViewMode("code")}
              style={{
                backgroundColor: viewMode === "code" ? "#eee" : "white",
                cursor: "pointer",
                borderRadius: "5px",
                padding: "5px",
                width: "35px",
                height: "35px",
                border: "none",
              }}
            >
              <Pencil size={20}/>
            </button>
            <button
              onClick={() => setViewMode("both")}
              style={{
                backgroundColor: viewMode === "both" ? "#eee" : "white",
                cursor: "pointer",
                borderRadius: "5px",
                padding: "5px",
                width: "35px",
                height: "35px",
                border: "none",
              }}
            >
              <Columns2 size={20}/>
            </button>
            <button
              onClick={() => setViewMode("preview")}
              style={{
                backgroundColor: viewMode === "preview" ? "#eee" : "white",
                cursor: "pointer",
                padding: "5px",
                width: "35px",
                height: "35px",
                borderRadius: "5px",
                border: "none",
              }}
            >
              <Eye size={20}/>
            </button>
          </div>

          <button
            onClick={deleteTopic}
            style={{
              display: "flex",
              cursor: "pointer",
              gap: "10px",
              alignItems: "center",
              justifyContent: "center",
              padding: "5px",
              border: "none",
              height: "41px",
              width: "41px",
              backgroundColor: "#eee",
              borderRadius: "5px",
            }}
            disabled={!currentTopic}
          >
            <Trash2 size={20}/>
          </button>
          <button
            onClick={saveNote}
            disabled={!currentTopic}
            style={{
              display: "flex",
              cursor: "pointer",
              gap: "10px",
              alignItems: "center",
              justifyContent: "center",
              padding: "5px",
              border: "none",
              height: "41px",
              width: "41px",
              backgroundColor: "#eee",
              borderRadius: "5px",
            }}
          >
            <Save size={20}/>
          </button>
        </div>

        {isEditorVisible && (
          <textarea
            style={{ outline: "0", flex: 1, width: "100%", fontFamily: "monospace", marginBottom: isPreviewVisible ? "10px" : "0" }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={!currentTopic}
          />
        )}

        {isPreviewVisible && (
          <>
            <h3>Markdown Preview</h3>
            <div
              style={{
                flex: 1,
                border: "1px solid #ccc",
                padding: 10,
                backgroundColor: "#f9f9f9",
                overflowY: "auto",
              }}
              dangerouslySetInnerHTML={{ __html: htmlPreview }}
            />
          </>
        )}
      </div>
{showNewTopicModal && (
  <div
    style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    }}
  >
    <div
      style={{
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        minWidth: 300,
      }}
    >
      <h3>New Topic</h3>
      <input
        type="text"
        value={newTopicInput}
        onChange={(e) => setNewTopicInput(e.target.value)}
        style={{
          width: "95%",
          padding: 8,
          marginBottom: 10,
          border: "1px solid #ccc",
          borderRadius: 4,
        }}
        placeholder="Enter topic name"
      />
      {error && (
        <div style={{ color: "red", marginBottom: 10 }}>{error}</div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button onClick={() => setShowNewTopicModal(false)}>Cancel</button>
        <button onClick={confirmAddTopic}>Add</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
