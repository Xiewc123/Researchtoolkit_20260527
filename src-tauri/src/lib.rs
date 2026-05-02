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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, load_workspace_state, save_workspace_state])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
