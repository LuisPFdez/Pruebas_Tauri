use std::{fs::File, io::Read, path::Path};

use log::info;
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub(crate) struct PropiedadesVentana {
    pub titulo: Option<String>,
    pub ancho: Option<f64>,
    pub alto: Option<f64>,
}

impl PropiedadesVentana {
    pub fn new() -> Self {
        PropiedadesVentana {
            titulo: None,
            ancho: None,
            alto: None,
        }
    }

    pub fn cargar_propiedades(ruta_archivo: &str) -> Result<Self, String> {
        let ruta = Path::new(ruta_archivo);
        if !ruta.exists() || !ruta.is_file() {
            return Err(String::from("La ruta no existe o no es un archivo"));
        }

        let mut archivo = File::open(ruta).map_err(|e| format!("Error al abrir el archivo {e}"))?;

        let mut buf = String::new();
        archivo
            .read_to_string(&mut buf)
            .map_err(|e| format!("Error al leer el archivo {e}"))?;

        let propiedades_ventana: Self = toml::from_str::<Self>(&buf)
            .map_err(|e| format!("Error al convertir los datos {e}"))?;

        Ok(propiedades_ventana)
    }
}
