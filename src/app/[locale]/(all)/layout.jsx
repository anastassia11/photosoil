'use client'

import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setDropdown } from '@/store/slices/generalSlice';

export default function AllLayout({ params: { locale }, children }) {
  const dispatch = useDispatch();

  const handleClickOutside = (e) => {
    if (!e.target.closest(".user, .dropdown, .soils, .category, .language, .languageChanger, .filter_dropdown, .in_page, .rang, .heading, .linkModal, .tag-form, .modal")) {
      dispatch(setDropdown({ isActive: false, key: null }));
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dispatch])

  return (
    <>{children}</>
  );
}
