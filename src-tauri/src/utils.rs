//Convierte un vector en string, evita tener que implementar Display para un struct externo
pub(crate) fn vec_to_string(vector: &Vec<[u8; 3]>) -> String {
    let mut string_retornado: String = String::from("[");
    for iter in vector {
        string_retornado.push_str(&format!("(R: {}, G: {}, B: {})", iter[0], iter[1], iter[2]));
    }

    string_retornado.push_str("]");
    return string_retornado;
}
