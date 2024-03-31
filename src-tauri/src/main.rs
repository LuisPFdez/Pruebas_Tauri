// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod errores;
use errores::{CustomError, TauriError};

use log::{error, info};
use std::path::PathBuf;
use tauri::{CustomMenuItem, Manager, Menu, Submenu, WindowMenuEvent};
use tauri_plugin_log::LogTarget;

fn crear_barra_de_menu() -> Menu {
    let abrir = CustomMenuItem::new("abrir", "Abrir");
    let cerrar = CustomMenuItem::new("cerrar", "Cerrar");
    let recargar = CustomMenuItem::new("recargar", "Recargar");
    let salir = CustomMenuItem::new("salir", "Salir");
    let archivo = Submenu::new(
        "Archivo",
        Menu::new()
            .add_item(abrir)
            .add_item(cerrar)
            .add_item(recargar),
    );
    return Menu::new().add_submenu(archivo).add_item(salir);
}

#[tauri::command]
fn es_desa() -> bool{
    cfg!(debug_assertions)
}

#[tauri::command]
async fn abrir_nueva_ventana(
    handle: tauri::AppHandle,
    ruta: &str,
    titulo: &str,
) -> Result<&'static str, CustomError> {
    match handle.get_window("secundaria") {
        None => {
            let mut ruta_buf: PathBuf;

            let r = ruta.parse::<PathBuf>()?;

            ruta_buf = PathBuf::from("../view");

            ruta_buf.push(r);

            if !ruta_buf.exists() {
                return Err(tauri::Error::InvalidWindowUrl("Ruta incorrecta").into());
            }

            let _ =
                tauri::WindowBuilder::new(&handle, "secundaria", tauri::WindowUrl::App(ruta_buf))
                    .menu(crear_barra_de_menu())
                    .title(titulo)
                    .center()
                    .build()?;

            Ok("Ventana creada")
        }
        Some(ventana) => {
            let ruta = format!("/view/{ruta}");
            if ventana.url().path() != ruta {
                ventana.eval(
                    "window.location.replace(new URL('/inditex.html', window.location.href))",
                )?;
            }

            ventana.set_focus()?;
            Ok("La ventana ya existe")
        }
    }
}

fn menu_handler(evento: WindowMenuEvent) {
    match evento.menu_item_id() {
        "salir" => {
            info!("se va a cerrar una ventana");
            let _ = evento
                .window()
                .app_handle()
                .emit_all("cerrar_ventanas", ())
                .unwrap_or_else(|e| {
                    let e = TauriError(e);
                    info!(e; "Error al emitir el evento");
                });
        }
        _ => {}
    }
}

fn main() {
    //En las build de desarrollo los logs se registran en Stdout y Webview(consola del navegador).
    //En las builds finales, sera en los en el direcotorio especifo para logs
    #[cfg(debug_assertions)]
    let target: [LogTarget; 2] = [LogTarget::Stdout, LogTarget::Webview];
    #[cfg(not(debug_assertions))]
    let target: [LogTarget; 1] = [LogTarget::LogDir];

    let app = tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().targets(target).build())
        .menu(crear_barra_de_menu())
        .on_menu_event(menu_handler)
        .invoke_handler(tauri::generate_handler![abrir_nueva_ventana, es_desa])
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    app.run(|_, _| {});
}
