'use client';

// --------------------------------------------------

import React, { useState, useEffect } from 'react';

// dnd-kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import SortablePhotoItem from '../SortablePhotoItem';

import styles from './index.module.scss';



// --------------------------------------------------
// Types

import { PhotoType } from '@/types/PhotoType';

type PhotoListProps = {
  photos: PhotoType[]; // 表示・並び替え対象の写真リスト
  onPhotosReordered: (reorderedPhotos: PhotoType[]) => void; // 並び替え後に親に通知するコールバック
  onPhotoDeleted: (deletedPhotoId: string) => void; // 削除成功時に親に通知するコールバック
};



// --------------------------------------------------
// PhotoList Component

export default function PhotoList({ photos, onPhotosReordered, onPhotoDeleted }: PhotoListProps) {
  // 内部で並び替え可能な写真リストの状態を管理
  const [currentPhotos, setCurrentPhotos] = useState<PhotoType[]>(photos);

  // 親から渡される photos prop が変更された場合に内部状態を同期
  useEffect(() => {
    setCurrentPhotos(photos);
  }, [photos]);

  // dnd-kit のセンサー設定
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ドラッグ終了時のハンドラー
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = currentPhotos.findIndex(photo => photo.id === active.id);
      const newIndex = currentPhotos.findIndex(photo => photo.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrderedPhotos = arrayMove(currentPhotos, oldIndex, newIndex);
        setCurrentPhotos(newOrderedPhotos); // 内部状態を更新
        onPhotosReordered(newOrderedPhotos); // 親に新しい順序を通知
      }
    }
  };

  if (currentPhotos.length === 0) {
    return <p className={styles.description}>表示する写真がありません。</p>;
  }

  return (
		<ul className={styles.photoList}>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={currentPhotos.map(photo => photo.id)} // SortableContext にはアイテムのIDの配列を渡す
					strategy={verticalListSortingStrategy}
				>
					{currentPhotos.map((photo) => (
						<SortablePhotoItem
							key={photo.id}
							photo={photo}
							onPhotoDeleted={onPhotoDeleted} // 削除ハンドラーを渡す
						/>
					))}
				</SortableContext>
			</DndContext>
		</ul>
  );
}
