use std::{convert::Infallible, string::ParseError};

use image::ImageError;
use log::kv::{ToValue, Value};

pub(crate) struct TauriError(pub tauri::Error);

pub(crate) enum CustomError {
    TauriError(tauri::Error),
    ParseError(ParseError),
}

pub(crate) struct ErrorImagen(pub ImageError);

impl ToValue for TauriError {
    fn to_value(&self) -> log::kv::Value {
        Value::from(self)
    }
}

impl<'a> From<&'a TauriError> for Value<'a> {
    fn from(value: &'a TauriError) -> Self {
        Value::from_display(&value.0)
    }
}

impl From<tauri::Error> for CustomError {
    fn from(value: tauri::Error) -> Self {
        CustomError::TauriError(value)
    }
}

impl From<Infallible> for CustomError {
    fn from(value: Infallible) -> Self {
        CustomError::ParseError(value)
    }
}

impl serde::ser::Serialize for CustomError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        match self {
            CustomError::TauriError(error) => String::serialize(&error.to_string(), serializer),
            CustomError::ParseError(error) => String::serialize(&error.to_string(), serializer),
        }
    }
}

impl From<ImageError> for ErrorImagen {
    fn from(val: ImageError) -> Self {
        Self(val)
    }
}

impl serde::ser::Serialize for ErrorImagen {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serde::Serialize::serialize(&self.0.to_string(), serializer)
    }
}

#[cfg(feature = "paleta-imagen")]
pub(crate) mod error_paleta_imagen {
    use image::ImageError;
    use linfa_clustering::KMeansError;
    use ndarray::ShapeError;

    pub(crate) enum ErrorGenerarPaleta {
        ErrorImagen(ImageError),
        KMeansError(KMeansError),
        ShapeError(ShapeError),
    }

    impl From<ImageError> for ErrorGenerarPaleta {
        fn from(value: ImageError) -> Self {
            ErrorGenerarPaleta::ErrorImagen(value)
        }
    }

    impl From<KMeansError> for ErrorGenerarPaleta {
        fn from(value: KMeansError) -> Self {
            ErrorGenerarPaleta::KMeansError(value)
        }
    }

    impl From<ShapeError> for ErrorGenerarPaleta {
        fn from(value: ShapeError) -> Self {
            ErrorGenerarPaleta::ShapeError(value)
        }
    }

    impl serde::ser::Serialize for ErrorGenerarPaleta {
        fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: serde::Serializer,
        {
            match self {
                ErrorGenerarPaleta::ErrorImagen(error) => {
                    String::serialize(&error.to_string(), serializer)
                }
                ErrorGenerarPaleta::KMeansError(error) => {
                    String::serialize(&error.to_string(), serializer)
                }
                ErrorGenerarPaleta::ShapeError(error) => {
                    String::serialize(&error.to_string(), serializer)
                }
            }
        }
    }
}
