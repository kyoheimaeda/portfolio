'use client';
import { atomWithStorage } from 'jotai/utils';

export const ThemeAtom = atomWithStorage<'light' | 'dark'>('theme', 'light');
