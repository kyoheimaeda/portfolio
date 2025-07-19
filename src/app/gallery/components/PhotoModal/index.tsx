// src/app/gallery/components/PhotoModal/index.tsx

'use client';

// ----------------------------------------
// Imports

import { useEffect, useState } from 'react';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import React from 'react';
import Image from 'next/image';
// import styles from "./index.module.scss";

// ----------------------------------------
// Types

type Props = {
  photoUrl: string;
  photoId: string | null; // photoId を追加
  originRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
};

// ----------------------------------------
// Styles (関数定義を維持しつつ、役割を明確化)

const boxStyle = () => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  cursor: 'zoom-out',
});

// ----------------------------------------
// Component

export default function PhotoModal({ photoUrl, photoId, originRef, isOpen, onClose }: Props) { // photoId を受け取る
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [visible, setVisible] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false); // New state for image loading

  useEffect(() => {
    if (isOpen && originRef.current) {
      setOriginRect(originRef.current.getBoundingClientRect());
      setVisible(true);
      setIsImageLoaded(false); // Reset image loaded state when modal opens
    }
  }, [isOpen, originRef]);

  const handleClose = () => {
    setVisible(false);
  };

  if (!originRect) return null;

  return (
    <AnimatePresence
      onExitComplete={() => {
        setOriginRect(null);
        onClose();
      }}
    >
      {visible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.9)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{
                width: originRect.width,
                height: originRect.height,
                top: originRect.top,
                left: originRect.left,
                position: 'fixed',
                x: 0,
                y: 0,
              }}
              animate={isImageLoaded ? { // Animate only when image is loaded
                width: window.innerWidth * 0.9,
                height: window.innerHeight * 0.9,
                top: window.innerHeight / 2,
                left: window.innerWidth / 2,
                x: -(window.innerWidth * 0.9) / 2,
                y: -(window.innerHeight * 0.9) / 2,
              } : {}} // Keep initial state if not loaded
              exit={{
                width: originRect.width,
                height: originRect.height,
                top: originRect.top,
                left: originRect.left,
                x: 0,
                y: 0,
              }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              style={boxStyle()}
            >
              <Image
                src={photoUrl}
                alt={photoId ? `Expanded photo: ${photoId}` : 'Expanded photo'}
                fill
                sizes="90vw"
                style={{
                  objectFit: 'contain',
                  borderRadius: 8,
                }}
                onLoad={() => setIsImageLoaded(true)} // Set state when image loads
              />
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}