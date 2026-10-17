// Listas públicas de Amazon Japón con los imports que recomendamos. Los juegos se añaden y se quitan desde la propia
// Amazon (app o web): aquí solo está el código de cada lista, el que va tras /wishlist/ls/ en su enlace.
// Los enlaces llevan nuestro ID de asociado (la comisión se asigna por el clic) y ordenan la lista de más barato a más caro.
export const TAG_AMAZON = 'mundospixelados-22';   // ID de seguimiento de la web en Amazon Asociados (Japón)

export const LISTAS_AMAZON = [
  {
    id: '1PO89QDN6NYAL',
    plataforma: 'switch',   // switch o ps: el color de la tarjeta
    titulo: 'NINTENDO SWITCH y NS2',
  },
  {
    id: '9YPCNAETO9LO',
    plataforma: 'ps',
    titulo: 'PLAYSTATION 5 y PS4',
  },
];

export const enlaceLista = (id) => `https://www.amazon.co.jp/-/en/hz/wishlist/ls/${id}?sort=price-asc&tag=${TAG_AMAZON}`;
