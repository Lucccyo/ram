use std::{fs, env, path::PathBuf};
use tauri::command;
use std::fs::File;
use std::io::Write;

const NOTE_DIR: &str = "test";

fn notes_dir() -> PathBuf {
    let mut path = dirs::document_dir().expect("Unable to find Documents directory.");
    path.push(NOTE_DIR);
    fs::create_dir_all(&path).expect("Error during the creation of ram_notes directory.");
    path
}

#[command]
fn rename_note(old_word: String, new_word: String) -> Result<(), String> {
    let mut old_path = notes_dir();
    old_path.push(format!("{}.md", old_word));

    let mut new_path = notes_dir();
    new_path.push(format!("{}.md", new_word));

    if !old_path.exists() {
        return Err("Original note does not exist".to_string());
    }
    if new_path.exists() {
        return Err("A note with the new name already exists".to_string());
    }

    fs::rename(old_path, new_path).map_err(|e| e.to_string())
}

#[command]
fn write_note(topic: String, content: String) -> Result<(), String> {
    let mut path = notes_dir();
    path.push(format!("{}.md", topic));

    let mut file = File::create(&path).map_err(|e| e.to_string())?;
    file.write_all(content.as_bytes()).map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
fn save_note_to_file(word: String, content: String) -> Result<(), String> {
    let mut path = notes_dir();
    path.push(format!("{}.md", word));
    fs::write(path, content).map_err(|e| e.to_string())
}

#[command]
fn load_note_from_file(word: String) -> Result<String, String> {
    let mut path = notes_dir();
    path.push(format!("{}.md", word));
    match fs::read_to_string(path) {
        Ok(content) => Ok(content),
        Err(_) => Ok("".to_string()),
    }
}

#[command]
fn list_notes() -> Result<Vec<String>, String> {
    let entries = fs::read_dir(notes_dir()).map_err(|e| e.to_string())?;
    let mut words = vec![];
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        if let Some(name) = entry.path().file_stem().and_then(|s| s.to_str()) {
            words.push(name.to_string());
        }
    }
    Ok(words)
}

#[command]
fn delete_note(word: String) -> Result<(), String> {
    let mut path = notes_dir();
    path.push(format!("{}.md", word));
    if path.exists() {
        fs::remove_file(path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn create_note(word: String) -> Result<(), String> {
    let mut path = notes_dir();
    path.push(format!("{}.md", word));
    if path.exists() {
        return Err("This topic already exists".to_string());
    }
    fs::write(path, "").map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
 save_note_to_file,
            load_note_from_file,
            list_notes,
            delete_note,
            create_note,
            write_note,
            rename_note,
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
