pub use crate::AppState;
use std::fs::File;
use std::io::Write;
use std::{fs, path::PathBuf};

#[tauri::command]
pub fn rename_note(
    state: tauri::State<'_, AppState>,
    old_word: String,
    new_word: String,
) -> Result<(), String> {
    let dir_path: PathBuf = state.dir_path.lock().unwrap().clone();
    if old_word == new_word {
        return Ok(());
    }
    let old_path = dir_path.join(format!("{}.md", old_word));
    let new_path = dir_path.join(format!("{}.md", new_word));
    if !old_path.exists() {
        return Err("Original note does not exist".to_string());
    }
    if new_path.exists() {
        return Err("A note has already this name".to_string());
    }
    fs::rename(old_path, new_path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_note(
    state: tauri::State<'_, AppState>,
    topic: String,
    content: String,
) -> Result<(), String> {
    let dir_path: PathBuf = state.dir_path.lock().unwrap().clone();
    let file_path = dir_path.join(format!("{}.md", topic));
    let mut file = File::create(&file_path).map_err(|e| e.to_string())?;
    file.write_all(content.as_bytes())
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn save_note(
    state: tauri::State<'_, AppState>,
    word: String,
    body: String,
) -> Result<(), String> {
    let dir_path: PathBuf = state.dir_path.lock().unwrap().clone();
    let file_path = dir_path.join(format!("{}.md", word));
    fs::write(&file_path, body).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn load_note(state: tauri::State<'_, AppState>, word: String) -> Result<String, String> {
    let dir_path: PathBuf = state.dir_path.lock().unwrap().clone();
    let file_path = dir_path.join(format!("{}.md", word));
    let content = fs::read_to_string(&file_path).map_err(|e| e.to_string())?;
    Ok(content)
}

#[tauri::command]
pub fn list_notes(state: tauri::State<'_, AppState>) -> Result<Vec<String>, String> {
    let dir_path: PathBuf = state.dir_path.lock().unwrap().clone();
    let entries = fs::read_dir(dir_path).map_err(|e| e.to_string())?;
    let mut words = vec![];
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.extension().and_then(|ext| ext.to_str()) == Some("md") {
            if let Some(name) = path.file_stem().and_then(|s| s.to_str()) {
                words.push(name.to_string());
            }
        }
    }
    Ok(words)
}


#[tauri::command]
pub fn delete_note(state: tauri::State<'_, AppState>, word: String) -> Result<(), String> {
    let dir_path: PathBuf = state.dir_path.lock().unwrap().clone();
    let file_path = dir_path.join(format!("{}.md", word));
    if file_path.exists() {
        fs::remove_file(file_path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn create_note(state: tauri::State<'_, AppState>, word: String) -> Result<(), String> {
    let dir_path: PathBuf = state.dir_path.lock().unwrap().clone();
    let file_path = dir_path.join(format!("{}.md", word));
    if file_path.exists() {
        return Err("This topic already exists".to_string());
    }
    fs::write(file_path, "").map_err(|e| e.to_string())
}
