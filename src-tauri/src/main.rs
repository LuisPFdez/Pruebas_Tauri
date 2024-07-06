// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod errores;
mod propiedades;
use errores::{CustomError, ErrorImagen, TauriError};
use propiedades::PropiedadesVentana;

use image::ImageFormat;
use log::{error, info};
use std::{io::Cursor, path::PathBuf};
use tauri::{CustomMenuItem, Manager, Menu, Submenu, WindowMenuEvent};
use tauri_plugin_log::LogTarget;

static NOMBRE_VENTANA_SECUNDARIA: &'static str = "vent_sec";

/// Funcion que crear y devuelve un menu por defecto,
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
fn es_desa() -> bool {
    cfg!(debug_assertions)
}

#[tauri::command]
fn redimensionar_imagen(imagen: Vec<u8>, ancho: u32, alto: u32) -> Result<Vec<u8>, ErrorImagen> {
    let mut vector = Vec::<u8>::new();
    let imagen_original = image::load_from_memory_with_format(&imagen, ImageFormat::Png)?;
    let mut buff = Cursor::new(&mut vector);

    //TODO Buscar un algoritmo mejor. El algoritmo nearest neighbor mejora el resultado.
    //Pero no es el optimo para las imagenes en pixel art como los sprites de pokemon
    let imagen_redimensionada =
        imagen_original.resize(ancho, alto, image::imageops::FilterType::Nearest);

    imagen_redimensionada.write_to(&mut buff, ImageFormat::Png)?;

    Ok(vector)
}

#[tauri::command]
async fn abrir_nueva_ventana(
    handle: tauri::AppHandle,
    ruta: &str,
    titulo: Option<&str>,
) -> Result<&'static str, CustomError> {
    match handle.get_window(NOMBRE_VENTANA_SECUNDARIA) {
        None => {
            let mut ruta_buf: PathBuf;
            let ruta_vista = format!("{ruta}.html");
            let r = ruta_vista.parse::<PathBuf>()?;

            ruta_buf = PathBuf::from("../view");

            ruta_buf.push(r);

            if !ruta_buf.exists() {
                return Err(tauri::Error::InvalidWindowUrl("Ruta incorrecta").into());
            }

            let propiedades: PropiedadesVentana;
            match PropiedadesVentana::cargar_propiedades(
                format!("../view/{ruta}.properties").as_str(),
            ) {
                Ok(prop) => propiedades = prop,
                Err(err) => {
                    error!("Error al cargar el archivo de propiedades. Error: {}", err);
                    propiedades = PropiedadesVentana::new();
                }
            };

            let _ = tauri::WindowBuilder::new(
                &handle,
                NOMBRE_VENTANA_SECUNDARIA,
                tauri::WindowUrl::App(ruta_buf),
            )
            .title(propiedades.titulo.unwrap_or("Tauri".to_string()).as_str())
            .inner_size(
                propiedades.ancho.unwrap_or(800f64),
                propiedades.alto.unwrap_or(600f64),
            )
            .center()
            .build()?;

            Ok("Ventana creada")
        }
        Some(ventana) => {
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
        .invoke_handler(tauri::generate_handler![
            abrir_nueva_ventana,
            es_desa,
            redimensionar_imagen
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    app.run(|_, _| {});
}
