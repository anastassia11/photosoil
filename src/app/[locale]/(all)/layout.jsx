'use client'

import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { setDropdown } from '@/store/slices/generalSlice';
import { usePathname } from 'next/navigation';
import { resetAuthor, resetCategory, resetTags, resetTerm } from '@/store/slices/dataSlice';

export default function AllLayout({ children }) {
  const dispatch = useDispatch();
  const pathname = usePathname();

  const handleClickOutside = useCallback((e) => {
    if (!e.target.closest(".user, .dropdown, .soils, .category, .language, .languageChanger, .filter_dropdown, .in_page, .rang, .heading, .linkModal, .tag-form, .modal")) {
      dispatch(setDropdown({ isActive: false, key: null }));
    }
  }, [dispatch]);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [])

  useEffect(() => {
    dispatch(resetAuthor());
    dispatch(resetCategory());
    dispatch(resetTerm());
    dispatch(resetTags());
  }, [pathname, dispatch])

  return (
    <>{children}</>
  );
}
