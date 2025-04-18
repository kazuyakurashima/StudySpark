'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface NavbarProps {
  showOnAuth?: boolean;
}

export default function Navbar({ showOnAuth = true }: NavbarProps) {
  // ヘッダーを削除するため、常にnullを返す
  return null;
} 