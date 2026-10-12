import 'server-only';

/** Без завершающего слэша: пути к API склеиваются как `${API_URL}/services`. */
export const API_URL = (process.env.API_URL ?? 'http://localhost:4000/api').replace(/\/+$/, '');
