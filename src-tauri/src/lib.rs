use std::env;

use std::{fs, path::PathBuf};
mod models;
mod service;

use service::file::{
    create_note, delete_note, list_notes, load_note, rename_note, save_note, write_note,
};
use service::json::{add_tag, get_tags, delete_tag, get_all_tags};
use std::sync::{Arc, Mutex};
use std::fs::{OpenOptions};

const NOTE_DIR: &str = "test";
const JSON_FILE: &str = "data.json";

#[derive(Clone)]
pub struct AppState {
    pub dir_path: Arc<Mutex<PathBuf>>,
    pub json_path: Arc<Mutex<PathBuf>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut path = dirs::document_dir().expect("Unable to find Documents directory.");
    path.push(NOTE_DIR);
    fs::create_dir_all(&path).expect(&format!("Error during the creation of {NOTE_DIR} directory."));

    let mut json_path = path.clone();
    json_path.push(JSON_FILE);

    if let Err(e) = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&json_path)
    {
        if e.kind() != std::io::ErrorKind::AlreadyExists {
            eprintln!("Error creating JSON file: {}", e);
        }
    }

    let app_state = AppState {
        dir_path: Arc::new(Mutex::new(path)),
        json_path: Arc::new(Mutex::new(json_path)),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(app_state.clone())
        .invoke_handler(tauri::generate_handler![
            save_note,
            load_note,
            list_notes,
            delete_note,
            create_note,
            write_note,
            rename_note,
            get_tags,
            add_tag,
            delete_tag,
            get_all_tags
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
