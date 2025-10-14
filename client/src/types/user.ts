/**
 * Interface del objeto Usuario que recibiremos en peticiones POST/PUT/GET,
 * cuando traigamos el usuario ya logueado o lo creemos.
 */
export interface User {
  id?: number;
  role: string;
  username: string;

  first_name?: string;
  last_name?: string;
  isVisible?: boolean;
}

/**
 * Interface para los datos que se envían al backend durante el login.
 * Tu controlador espera { login_data: string, password: string }
 */
export interface LoginCredentials {
  login_data: string; // Este campo será el 'username'
  password: string;
}

/**
 * Interface para la respuesta que esperamos del endpoint de login.
 * Tu controlador devuelve ok, message y token.
 */
export interface LoginResponse {
  ok: boolean;
  message: string;
  token: string;
}