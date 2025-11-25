import { useEffect } from 'react';
import { useOutletContext } from 'react-router';

export default function usePageTitle(title = '') {
  const ctx = useOutletContext();
  const setPageName = ctx?.setPageName;

  useEffect(() => {
    setPageName?.(title || '');
    return () => setPageName?.(''); 
  }, [setPageName, title]);
}
