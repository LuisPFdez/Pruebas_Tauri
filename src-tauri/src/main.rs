// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod errores;
mod propiedades;
use errores::{CustomError, ErrorImagen, TauriError};
use propiedades::{PropiedadesPredeterminadas, PropiedadesVentana};

use image::ImageFormat;
use log::info;
use std::{io::Cursor, path::PathBuf, sync::OnceLock};
use tauri::{CustomMenuItem, Manager, Menu, Submenu, WindowMenuEvent};
use tauri_plugin_log::LogTarget;

static NOMBRE_VENTANA_SECUNDARIA: &'static str = "vent_sec_";
static PROPIEDADES_VENTANA: OnceLock<PropiedadesPredeterminadas> = OnceLock::new();

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
fn prefijo_ventana() -> &'static str {
    NOMBRE_VENTANA_SECUNDARIA
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
    ventana: &str,
    titulo: Option<&str>,
) -> Result<(&'static str, bool), CustomError> {
    let nombre_ventana = format!("{}{}", NOMBRE_VENTANA_SECUNDARIA, ventana);
    
    match handle.get_window(nombre_ventana.as_str()) {
        None => {
            let mut ruta_buf: PathBuf;
            let nombre_ventana = format!("{ventana}.html");
            let r = nombre_ventana.parse::<PathBuf>()?;

            ruta_buf = PathBuf::from("../view");

            ruta_buf.push(r);

            if !ruta_buf.exists() {
                return Err(tauri::Error::InvalidWindowUrl("Ruta incorrecta").into());
            }

            let propiedades = 'bloque: {
                let props = PROPIEDADES_VENTANA.get().unwrap();
                if let Some(prop) = &props.props_ventanas {
                    if let Some(prop) = prop.get(ventana) {
                        break 'bloque prop.convertir_a_predeterminada(props);
                    }
                }

                let prop = PropiedadesVentana::new();
                prop.convertir_a_predeterminada(props)
            };

            let _ =
                tauri::WindowBuilder::new(&handle, nombre_ventana, tauri::WindowUrl::App(ruta_buf))
                    .title(titulo.unwrap_or(propiedades.titulo.as_str()))
                    .inner_size(propiedades.ancho, propiedades.alto)
                    .resizable(propiedades.redimensionable)
                    .decorations(propiedades.decoraciones)
                    .center()
                    .build()?;

            Ok(("Ventana creada", true))
        }
        Some(ventana) => {
            ventana.set_focus()?;
            Ok(("La ventana ya existe", false))
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

    //Ejecuta la primera carga del OneLocK. Carga el archivo de configuracion, si no lo encuentra termina el programa
    PROPIEDADES_VENTANA.get_or_init(|| {
        PropiedadesPredeterminadas::cargar_propiedades("../view/config.toml")
            .expect("Fallo al cargar la configuración")
    });

    let app = tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().targets(target).build())
        .menu(crear_barra_de_menu())
        .on_menu_event(menu_handler)
        .invoke_handler(tauri::generate_handler![
            abrir_nueva_ventana,
            es_desa,
            prefijo_ventana,
            redimensionar_imagen
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    app.run(|_, _| {});
}
