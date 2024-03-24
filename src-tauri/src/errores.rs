use std::{convert::Infallible, string::ParseError};

use log::kv::{ToValue, Value};

pub(crate) struct TauriError(pub tauri::Error);
pub(crate) enum CustomError {
    TauriError(tauri::Error),
    ParseError(ParseError),
}

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
        println!("HOla {:?}", value);
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
