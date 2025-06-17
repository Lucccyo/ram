use serde::{Serialize, Deserialize};
use std::fs::{File, OpenOptions};
use std::io::{Read, Write};
use std::path::PathBuf;
use tauri::State;
pub use crate::AppState;
use crate::models::note::Note;
use crate::models::tag::Tag;

#[derive(Serialize, Deserialize, Debug)]
pub struct Data {
    pub notes: Vec<Note>,
    pub tags: Vec<Tag>,
}

fn load_data(path: PathBuf) -> Result<Data, String> {
    let mut file = File::open(path).map_err(|e| e.to_string())?;
    let mut contents = String::new();
    file.read_to_string(&mut contents).map_err(|e| e.to_string())?;
    serde_json::from_str(&contents).map_err(|e| e.to_string())
}

fn save_data(path: PathBuf, data: &Data) -> Result<(), String> {
    let mut file = OpenOptions::new()
        .write(true)
        .truncate(true)
        .open(path)
        .map_err(|e| e.to_string())?;
    let json = serde_json::to_string_pretty(data).map_err(|e| e.to_string())?;
    file.write_all(json.as_bytes()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_tags(state: State<'_, AppState>, note_title: String) -> Vec<String> {
    let json_path = state.json_path.lock().unwrap().clone();
    let data = match load_data(json_path) {
        Ok(d) => d,
        Err(_) => return Vec::new(),
    };
    for note in data.notes {
        if note.title == note_title {
            return note.tags.into_iter().map(|tag| tag.label).collect();
        }
    }
    Vec::new()
}

#[tauri::command]
pub fn add_tag(state: State<'_, AppState>, tag_label: String, note_title: String) -> Result<(), String> {
    let json_path = state.json_path.lock().unwrap().clone();
    let mut data = load_data(json_path.clone()).unwrap_or(Data { notes: Vec::new(), tags: Vec::new() });
    let note_exists = data.notes.iter().any(|note| note.title == note_title);
    if !note_exists {
        let new_note = Note {
            id: data.notes.len() as u32 + 1,
            title: note_title.clone(),
            tags: Vec::new(),
            sub_notes: Vec::new(),
        };
        data.notes.push(new_note);
    }
    for note in &mut data.notes {
        if note.title == note_title {
            if let Some(existing_tag) = data.tags.iter_mut().find(|t| t.label == tag_label) {
                if !existing_tag.uses.contains(&note_title) {
                    existing_tag.uses.push(note_title.clone());
                }
                if !note.tags.iter().any(|t| t.label == tag_label) {
                    note.tags.push(existing_tag.clone());
                }
            } else {
                let new_tag = Tag {
                    id: data.tags.len() as u32 + 1,
                    label: tag_label.clone(),
                    uses: vec![note_title.clone()],
                };
                data.tags.push(new_tag.clone());
                note.tags.push(new_tag);
            }
            break;
        }
    }
    save_data(json_path, &data)
}

#[tauri::command]
pub fn delete_tag(state: State<'_, AppState>, tag_label: String, note_title: String) -> Result<(), String> {
    let json_path = state.json_path.lock().unwrap().clone();
    let mut data = load_data(json_path.clone()).unwrap_or(Data { notes: Vec::new(), tags: Vec::new() });
    for note in &mut data.notes {
        if note.title == note_title {
            note.tags.retain(|tag| tag.label != tag_label);
            if let Some(existing_tag) = data.tags.iter_mut().find(|t| t.label == tag_label) {
                existing_tag.uses.retain(|uses| uses != &note_title);
                if existing_tag.uses.is_empty() {
                    data.tags.retain(|t| t.label != tag_label);
                }
            }
            break;
        }
    }
    data.notes.retain(|note| !note.tags.is_empty());
    save_data(json_path, &data)
}

#[tauri::command]
pub fn get_all_tags(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    let json_path = state.json_path.lock().unwrap().clone();
    let data = load_data(json_path)?;
    let tags = data.tags.into_iter().map(|tag| tag.label).collect();
    Ok(tags)
}

#[tauri::command]
pub fn rename_note_tag(
    state: State<'_, AppState>,
    old_word: String,
    new_word: String,
) -> Result<(), String> {
    let json_path = state.json_path.lock().unwrap().clone();
    let mut data = load_data(json_path.clone()).unwrap_or(Data {
        notes: Vec::new(),
        tags: Vec::new(),
    });
    let note = data.notes.iter_mut().find(|n| n.title == old_word);
    if let Some(note) = note {
        note.title = new_word.clone();
        for tag in &mut data.tags {
            if tag.uses.contains(&old_word) {
                tag.uses.retain(|t| t != &old_word);
                tag.uses.push(new_word.clone());
            }
        }
        save_data(json_path, &data)?;
    }
    Ok(())
}
