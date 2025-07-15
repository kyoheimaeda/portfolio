'use client';

// ----------------------------------------
// Imports

import { useEffect, useState } from 'react';
import * as motion from 'motion/react-client'; // motion をインポート
import { AnimatePresence } from 'motion/react';
import React from 'react'; // React をインポートして React.CSSProperties を使用

// ----------------------------------------
// Types

type Props = {
  photoUrl: string;
  originRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
};

// ----------------------------------------
// Styles (関数定義を維持しつつ、役割を明確化)

// モーダルボックスのスタイル
const boxStyle = () => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  cursor: 'zoom-out',
});

// 画像のスタイル
const imageStyle = (): React.CSSProperties => ({
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
  borderRadius: 8,
});

// ----------------------------------------
// Component

export default function PhotoModal({ photoUrl, originRef, isOpen, onClose }: Props) {
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen && originRef.current) {
      setOriginRect(originRef.current.getBoundingClientRect());
      setVisible(true);
    }
  }, [isOpen, originRef]);

  const handleClose = () => {
    setVisible(false);
  };

  if (!originRect) return null;

  return (
    <AnimatePresence
      onExitComplete={() => {
        // exitアニメーションが完了したら完全に閉じる
        setOriginRect(null);
        onClose();
      }}
    >
      {visible && (
        // 外側の通常の div でオーバーレイの静的なレイアウトと背景色を管理
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.9)', // 背景色
            zIndex: 1000, // z-index
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={handleClose} // オーバーレイのクリックで閉じる
        >
          {/* opacityのアニメーションを担当する motion.div */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // onClick={(e) => e.stopPropagation()} // ★ ここから e.stopPropagation() を削除
          >
            {/* 実際の画像ボックスのアニメーションを担当する motion.div */}
            <motion.div
              initial={{
                width: originRect.width,
                height: originRect.height,
                top: originRect.top,
                left: originRect.left,
                position: 'fixed', // このpositionはアニメーションの一部なのでmotion.divに残す
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
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              style={boxStyle()} // アニメーション以外のスタイルを適用
              // onClick={(e) => e.stopPropagation()} // ★ ここから e.stopPropagation() を削除
            >
              <img
                src={photoUrl}
                alt="expanded"
                style={imageStyle()}
              />
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
