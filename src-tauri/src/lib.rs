// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn load_workspace_state() -> Result<String, String> {
    use std::fs;

    let mut app_dir = dirs::data_dir().ok_or("Cannot get data dir")?;
    app_dir.push("researchtoolkit");
    let file_path = app_dir.join("workspace_state.json");

    if file_path.exists() {
        fs::read_to_string(&file_path).map_err(|e| e.to_string())
    } else {
        Ok("{}".to_string())
    }
}

#[tauri::command]
async fn save_workspace_state(data: String) -> Result<(), String> {
    use std::fs;

    let mut app_dir = dirs::data_dir().ok_or("Cannot get data dir")?;
    app_dir.push("researchtoolkit");
    fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    let file_path = app_dir.join("workspace_state.json");

    fs::write(&file_path, data).map_err(|e| e.to_string())
}

fn safe_file_stem(title: &str) -> String {
    let filtered: String = title
        .chars()
        .map(|ch| match ch {
            '<' | '>' | ':' | '"' | '/' | '\\' | '|' | '?' | '*' => '_',
            _ => ch,
        })
        .collect();
    let trimmed = filtered.trim().trim_matches('.');
    if trimmed.is_empty() {
        "untitled".to_string()
    } else {
        trimmed.to_string()
    }
}

#[tauri::command]
async fn write_markdown_file(path: String, content: String) -> Result<(), String> {
    use std::fs;
    if let Some(parent) = std::path::Path::new(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
async fn read_markdown_file(path: String) -> Result<String, String> {
    use std::fs;
    match fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => Ok(String::new()),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
async fn create_project_markdown(root: String, title: String) -> Result<String, String> {
    use std::fs;
    use std::path::PathBuf;

    let dir = PathBuf::from(root);
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let stem = safe_file_stem(&title);
    let mut path = dir.join(format!("{}.md", stem));
    let mut index = 2;
    while path.exists() {
        path = dir.join(format!("{}-{}.md", stem, index));
        index += 1;
    }
    let content = format!("# {} - 项目推进日志\n", title);
    fs::write(&path, content).map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
async fn export_workspace_state_file(data: String) -> Result<String, String> {
    use std::fs;
    use std::time::{SystemTime, UNIX_EPOCH};

    let mut app_dir = dirs::data_dir().ok_or("Cannot get data dir")?;
    app_dir.push("researchtoolkit");
    app_dir.push("exports");
    fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    let stamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_secs();
    let file_path = app_dir.join(format!("researchtoolkit-data-{}.json", stamp));
    fs::write(&file_path, data).map_err(|e| e.to_string())?;
    Ok(file_path.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            load_workspace_state,
            save_workspace_state,
            write_markdown_file,
            read_markdown_file,
            create_project_markdown,
            export_workspace_state_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
