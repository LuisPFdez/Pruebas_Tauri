use std::{collections::HashMap, fs::File, io::Read, path::Path};

use serde::{
    de::{self, Visitor},
    Deserialize,
};

#[derive(Deserialize, Debug)]
pub(crate) struct PropiedadesVentana {
    pub titulo: Option<String>,
    pub ancho: Option<f64>,
    pub alto: Option<f64>,
    pub redimensionable: Option<bool>,
    pub decoraciones: Option<bool>
}

pub(crate) struct PropiedadesPredeterminadas {
    pub titulo: String,
    pub ancho: f64,
    pub alto: f64,
    pub redimensionable: bool,
    pub decoraciones: bool,
    pub props_ventanas: Option<HashMap<String, PropiedadesVentana>>,
}

impl<'de> Deserialize<'de> for PropiedadesPredeterminadas {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        enum Propiedades {
            Titulo,
            Alto,
            Ancho,
            Redimensionable,
            Decoraciones,
            ID(String),
        }

        impl<'de> Deserialize<'de> for Propiedades {
            fn deserialize<D>(deserializer: D) -> Result<Propiedades, D::Error>
            where
                D: serde::Deserializer<'de>,
            {
                struct PropiedadesVisitor;

                impl<'de> Visitor<'de> for PropiedadesVisitor {
                    type Value = Propiedades;

                    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                        formatter.write_str(
                            "Titulo, Alto, Ancho, Redimensionable, Decoraciones, ID de ventana",
                        )
                    }

                    fn visit_str<E>(self, v: &str) -> Result<Self::Value, E>
                    where
                        E: serde::de::Error,
                    {
                        match v {
                            "titulo" => Ok(Propiedades::Titulo),
                            "alto" => Ok(Propiedades::Alto),
                            "ancho" => Ok(Propiedades::Ancho),
                            "redimensionable" => Ok(Propiedades::Redimensionable),
                            "decoraciones" => Ok(Propiedades::Decoraciones),
                            _ => Ok(Propiedades::ID(v.to_owned())),
                        }
                    }
                }
                deserializer.deserialize_identifier(PropiedadesVisitor)
            }
        }

        struct PropiedadesVisitor;

        impl<'de> Visitor<'de> for PropiedadesVisitor {
            type Value = PropiedadesPredeterminadas;

            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                formatter.write_str("struct PropiedadesPredeterminadas")
            }

            fn visit_map<A>(self, mut map: A) -> Result<Self::Value, A::Error>
            where
                A: serde::de::MapAccess<'de>,
            {
                let mut titulo: Option<String> = None;
                let mut alto: Option<f64> = None;
                let mut ancho: Option<f64> = None;
                let mut redimensionable: Option<bool> = None;
                let mut decoraciones: Option<bool> = None;
                let mut props_ventanas: Option<HashMap<String, PropiedadesVentana>> = None;

                while let Some(llave) = map.next_key()? {
                    match llave {
                        Propiedades::Titulo => titulo = Some(map.next_value()?),
                        Propiedades::Alto => alto = Some(map.next_value()?),
                        Propiedades::Ancho => ancho = Some(map.next_value()?),
                        Propiedades::Redimensionable => redimensionable = Some(map.next_value()?),
                        Propiedades::Decoraciones => decoraciones = Some(map.next_value()?),
                        Propiedades::ID(id) => {
                            let valor = map.next_value::<PropiedadesVentana>();
                            match valor {
                                Ok(props) => match props_ventanas {
                                    Some(ref mut map) => {
                                        map.insert(id, props);
                                    }
                                    None => {
                                        let map: HashMap<String, PropiedadesVentana> =
                                            HashMap::from([(id, props)]);
                                        props_ventanas = Some(map);
                                    }
                                },
                                Err(e) => {
                                    if !e.to_string().contains("invalid type") {
                                        return Err(e);
                                    }
                                }
                            }
                        }
                    }
                }

                Ok(PropiedadesPredeterminadas {
                    titulo: titulo.ok_or_else(|| de::Error::missing_field("titulo"))?,
                    alto: alto.ok_or_else(|| de::Error::missing_field("alto"))?,
                    ancho: ancho.ok_or_else(|| de::Error::missing_field("ancho"))?,
                    redimensionable: redimensionable
                        .ok_or_else(|| de::Error::missing_field("redimensionable"))?,
                    decoraciones: decoraciones
                        .ok_or_else(|| de::Error::missing_field("decoraciones"))?,
                    props_ventanas,
                })
            }
        }

        const FIELDS: &[&str; 5] = &["titulo", "alto", "ancho", "redimensionable", "dimensiones"];
        deserializer.deserialize_struct("PropiedadesPredeterminadas", FIELDS, PropiedadesVisitor)
    }
}

impl PropiedadesVentana {
    pub fn new() -> Self {
        PropiedadesVentana {
            titulo: None,
            ancho: None,
            alto: None,
            redimensionable: None,
            decoraciones: None
        }
    }

    pub fn convertir_a_predeterminada(
        &self,
        props: &PropiedadesPredeterminadas,
    ) -> PropiedadesPredeterminadas {
        PropiedadesPredeterminadas {
            titulo: match &self.titulo {
                Some(titulo) => titulo.clone(),
                None => props.titulo.clone(),
            },
            ancho: self.ancho.unwrap_or(props.ancho),
            alto: self.alto.unwrap_or(props.alto),
            redimensionable: self.redimensionable.unwrap_or(props.redimensionable),
            decoraciones: self.decoraciones.unwrap_or(props.decoraciones),
            props_ventanas: None,
        }
    }
}

impl PropiedadesPredeterminadas {
    pub fn cargar_propiedades(ruta_archivo: &str) -> Result<Self, String> {
        let ruta = Path::new(ruta_archivo);
        if !ruta.exists() || !ruta.is_file() {
            return Err(String::from("La ruta no existe o no es un archivo"));
        }

        let mut archivo = File::open(ruta).map_err(|e| format!("Error al abrir el archivo {e}"))?;

        let mut buf = String::new();
        archivo
            .read_to_string(&mut buf)
            .map_err(|e| format!("Error al leer el archivo: {e}"))?;

        let propiedades_ventana: Self = toml::from_str::<Self>(&buf)
            .map_err(|e| format!("Error al transformar los datos: {e}"))?;

        Ok(propiedades_ventana)
    }
}
