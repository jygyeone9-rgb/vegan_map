import { useEffect, useState } from 'react';
const KEY = 'vegan-seoul:favorites:v1';
export function parseFavorites(raw) {
  try { const value = JSON.parse(raw); return Array.isArray(value) ? [...new Set(value.filter(v => typeof v === 'string'))] : []; } catch { return []; }
}
export default function useFavorites() {
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState(() => { try { return parseFavorites(localStorage.getItem(KEY)); } catch { return []; } });
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(favorites)); setError(''); }
    catch { setError('브라우저 저장소를 사용할 수 없어 이 화면을 닫으면 즐겨찾기가 사라질 수 있어요.'); }
  }, [favorites]);
  useEffect(() => {
    const sync = event => { if (event.key === KEY || event.key === null) setFavorites(parseFavorites(event.newValue)); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const toggle = id => setFavorites(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  return { favorites, toggle, error };
}
