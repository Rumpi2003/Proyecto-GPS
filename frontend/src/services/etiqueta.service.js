import api from './axios.config';

export async function getEtiquetas() {
    const res = await api.get('/etiquetas');
    return res.data.data;
}