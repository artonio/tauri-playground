#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};


// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {

    let mut open = CustomMenuItem::new("open".to_string(), "Open");
    open.keyboard_accelerator = Some("Ctrl+O".to_string());
    let mut save = CustomMenuItem::new("save".to_string(), "Save");
    save.keyboard_accelerator = Some("Ctrl+S".to_string());
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let submenu = Submenu::new("File", Menu::new()
        .add_item(open)
        .add_item(save)
        .add_item(quit)
    );
    let menu = Menu::new()
        .add_native_item(MenuItem::Copy)
        .add_submenu(submenu);

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .menu(menu)
        .on_menu_event(|event| {
            match event.menu_item_id() {
                "quit" => {
                    std::process::exit(0);
                },
                "save" => {
                    event.window().emit("save-click", "").unwrap();
                },
                "open" => {
                    event.window().emit("open-click", "").unwrap();
                },
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");


}
