use std::{fs, env, path::PathBuf};
use tauri::command;
use std::fs::File;
use std::io::Write;
use serde::Deserialize;
use serde::Serialize;

const NOTE_DIR: &str = "test";

fn notes_dir() -> PathBuf {
    let mut path = dirs::document_dir().expect("Unable to find Documents directory.");
    path.push(NOTE_DIR);
    fs::create_dir_all(&path).expect("Error during the creation of ram_notes directory.");
    path
}

#[derive(Debug, Deserialize)]
struct FrontMatter {
    tags: Option<Vec<String>>,
}

#[derive(Debug, Serialize)]
struct FrontMatterOut {
    tags: Vec<String>,
}

#[command]
fn rename_note(old_word: String, new_word: String) -> Result<(), String> {
    if old_word == new_word {
        return Ok(());
    }
    let mut old_path = notes_dir();
    old_path.push(format!("{}.md", old_word));

    let mut new_path = notes_dir();
    new_path.push(format!("{}.md", new_word));

    if !old_path.exists() {
        return Err("Original note does not exist".to_string());
    }
    if new_path.exists() {
        return Err("A note has already this name".to_string());
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

#[tauri::command]
fn save_note_with_tags(word: String, tags: Vec<String>, body: String) -> Result<(), String> {
    let mut path = notes_dir();
    path.push(format!("{}.md", word));

    let fm = FrontMatterOut { tags };
    let yaml = serde_yaml::to_string(&fm).map_err(|e| e.to_string())?;

    let full = format!("---\n{}---\n\n{}", yaml, body);

    fs::write(&path, full).map_err(|e| e.to_string())
}

// #[command]
// fn save_note_to_file(word: String, content: String) -> Result<(), String> {
//     let mut path = notes_dir();
//     path.push(format!("{}.md", word));
//     fs::write(path, content).map_err(|e| e.to_string())
// }

#[tauri::command]
fn load_note_with_tags(word: String) -> Result<(Vec<String>, String), String> {
    let mut path = notes_dir();
    path.push(format!("{}.md", word));
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;

    let parts: Vec<&str> = content.splitn(3, "---").collect();
    if parts.len() == 3 {
        let yaml = parts[1];
        let body = parts[2].trim_start().to_string();

        let fm: FrontMatter = serde_yaml::from_str(yaml).unwrap_or(FrontMatter { tags: None });
        let tags = fm.tags.unwrap_or_default();

        Ok((tags, body))
    } else {
        Ok((vec![], content))
    }
}
// #[command]
// fn load_note_from_file(word: String) -> Result<String, String> {
//     let mut path = notes_dir();
//     path.push(format!("{}.md", word));
//     match fs::read_to_string(path) {
//         Ok(content) => Ok(content),
//         Err(_) => Ok("".to_string()),
//     }
// }

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
            save_note_with_tags,
            load_note_with_tags,
            list_notes,
            delete_note,
            create_note,
            write_note,
            rename_note,
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
