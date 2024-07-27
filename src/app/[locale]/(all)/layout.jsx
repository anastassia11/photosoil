'use client'

import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setDropdown } from '@/store/slices/generalSlice';
import { getAllClassifications } from '@/store/slices/dataSlice';

export default function AllLayout({ children }) {
  const dispatch = useDispatch();

  const handleClickOutside = (e) => {
    if (!e.target.closest(".user, .dropdown, .soils, .category, .language, .languageChanger, .filter_dropdown, .in_page, .rang, .heading, .linkModal, .tag-form, .modal")) {
      dispatch(setDropdown({ isActive: false, key: null }));
    }
  };

  useEffect(() => {
    dispatch(getAllClassifications());

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dispatch])

  return (
    <>{children}</>
  );
}