use crate::errores::error_paleta_imagen::ErrorGenerarPaleta;
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

#[tauri::command]
pub(crate) fn generar_paleta_imagen(imagen: Vec<u8>) -> Result<Vec<[u8; 3]>, ErrorGenerarPaleta> {
    use image::{GenericImageView, Rgba};
    use linfa::{traits::Fit, Dataset};
    use linfa_clustering::KMeans;
    use ndarray::Array2;
    use rand::thread_rng;

    let imagen = image::load_from_memory_with_format(&imagen, ImageFormat::Png)?;
    let pixel_vacio = Rgba::<u8>([0, 0, 0, 0]);

    //Se obtienen los pixeles de la imagen y lo convierte en un vector de tipo f32
    let valores: Vec<f32> = imagen
        .pixels()
        .filter(|d| d.2.ne(&pixel_vacio))
        .map(|d| {
            [
                f32::from(d.2 .0[0]),
                f32::from(d.2 .0[1]),
                f32::from(d.2 .0[2]),
            ]
        })
        .flat_map(|r| r)
        .collect();

    let dataset = Dataset::from(Array2::from_shape_vec((valores.len() / 3, 3), valores)?);
    let model = KMeans::params_with_rng(6, thread_rng())
        .max_n_iterations(20)
        .tolerance(1e-5)
        .fit(&dataset)?;

    // Obtiene los centros de los clusters (colores de la paleta) y los convierte en un vector con los
    let valor_retorno: Vec<[u8; 3]> = model
        .centroids()
        .outer_iter()
        .map(|d| [d[0].trunc() as u8, d[1].trunc() as u8, d[2].trunc() as u8])
        .collect();

    Ok(valor_retorno)
}