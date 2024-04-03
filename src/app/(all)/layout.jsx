'use client'

import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { setDropdown } from '@/store/slices/generalSlice';
import { getAllClassifications, getAllSoils } from '@/store/slices/dataSlice';

export default function AllLayout({ children }) {
  const dispatch = useDispatch();

  const handleClickOutside = (e) => {
    if (!e.target.closest(".user, .dropdown, .soils, .category_dropdown, .filter_dropdown")) {
      dispatch(setDropdown({ isActive: false, key: null }));
    }
  };

  useEffect(() => {
    // dispatch(getAllSoils());
    dispatch(getAllClassifications());
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [])

  return (
    <>{children}</>
  );
}
