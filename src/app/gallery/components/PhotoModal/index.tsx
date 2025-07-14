'use client';

import { useEffect, useState } from 'react';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';

type Props = {
  photoUrl: string;
  originRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
};

export default function PhotoModal({ photoUrl, originRef, isOpen, onClose }: Props) {
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (isOpen && originRef.current) {
      setOriginRect(originRef.current.getBoundingClientRect());
    }
  }, [isOpen, originRef]);

  if (!originRect) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="photo-modal-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.7)',
            zIndex: 1000,
          }}
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
            animate={{
              width: window.innerWidth * 0.9,
              height: window.innerHeight * 0.9,
              top: window.innerHeight / 2,
              left: window.innerWidth / 2,
              x: -(window.innerWidth * 0.9) / 2,
              y: -(window.innerHeight * 0.9) / 2,
            }}
            exit={{
              width: originRect.width,
              height: originRect.height,
              top: originRect.top,
              left: originRect.left,
              x: 0,
              y: 0,
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{
              position: 'fixed',
              zIndex: 1001,
              cursor: 'zoom-out',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
            }}
            onClick={onClose}
          >
            <img
              src={photoUrl}
              alt="expanded"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 8,
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
