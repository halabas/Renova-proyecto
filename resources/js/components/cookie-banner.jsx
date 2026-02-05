import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const COOKIE_NAME = 'renova_cookies_aceptadas';
const MAX_AGE = 10000000 ;

const leerCookie = (nombre) => {
  if (typeof document === 'undefined') {
    return null;
  }
  const cookies = document.cookie.split(';').map((item) => item.trim());
  const cookie = cookies.find((item) => item.startsWith(`${nombre}=`));
  return cookie ? cookie.split('=')[1] : null;
};

const escribirCookie = (nombre, valor) => {
  document.cookie = `${nombre}=${valor}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
};

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const valor = leerCookie(COOKIE_NAME);
    if (valor) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, []);

  if (visible === false) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg sm:flex sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        Usamos cookies para mejorar tu experiencia. Al continuar aceptas su uso.
      </p>
      <div className="mt-3 flex justify-end gap-2 sm:mt-0">
        <Button
          size="sm"
          onClick={() => {
            escribirCookie(COOKIE_NAME, '1');
            setVisible(false);
          }}
        >
          Aceptar
        </Button>
      </div>
    </div>
  );
}
