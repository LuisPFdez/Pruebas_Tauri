use crate::errores::ErrorImagen;
use image::ImageFormat;
use std::io::Cursor;

#[tauri::command]
pub(crate) fn redimensionar_imagen(
    imagen: Vec<u8>,
    ancho: u32,
    alto: u32,
) -> Result<Vec<u8>, ErrorImagen> {
    let mut vector = Vec::<u8>::new();
    let imagen_original = image::load_from_memory_with_format(&imagen, ImageFormat::Png)?;
    let mut buff = Cursor::new(&mut vector);

    let imagen_redimensionada =
        imagen_original.resize(ancho, alto, image::imageops::FilterType::Nearest);

    imagen_redimensionada.write_to(&mut buff, ImageFormat::Png)?;

    Ok(vector)
}
