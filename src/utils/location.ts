interface UserLocation {
  lat: number;
  lng: number;
}

export function calculateDistance(user: UserLocation): number | null {
  // Ejemplo: si tu usuario tiene lat/lng
  if (!user.lat || !user.lng) return null;

  // Coordenadas de referencia (ejemplo: ubicación actual)
  const myLat = -34.6037 ;
  const myLng = -58.3816 ;

  const R = 6371; // radio tierra en km
  const dLat = (user.lat - myLat) * Math.PI / 180 ;
  const dLng = (user.lng - myLng) * Math.PI / 180 ;

  const  a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2 ) +
    Math.cos(myLat * Math.PI / 180 ) *
      Math.cos(user.lat * Math.PI / 180 ) *
      Math.sin(dLng / 2 ) *
      Math.sin(dLng / 2 );

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return d;
}