// src/app/gallery/manage/components/SortablePhotoList/index.tsx

'use client';

// --------------------------------------------------

import React from 'react'; // useState と useEffect を削除

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
  rectSortingStrategy, // rectSortingStrategy をインポート
} from '@dnd-kit/sortable';

import SortablePhotoItem from '../SortablePhotoItem';

import styles from './index.module.scss';


// --------------------------------------------------
// Types

import { PhotoType } from '@/features/gallery/types/PhotoType';

type SortablePhotoListProps = {
  photos: PhotoType[]; // 表示・並び替え対象の写真リスト
  onReorder: (reorderedPhotos: PhotoType[]) => void; // 並び替え後に親に通知するコールバック
  onDelete: (photo: PhotoType) => Promise<void>; // 削除成功時に親に通知するコールバック
};



// --------------------------------------------------
// SortablePhotoList Component

export default function SortablePhotoList({ photos, onReorder, onDelete }: SortablePhotoListProps) {
  // 内部状態 currentPhotos は使用しないので、useState/useEffect は不要

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
      // 現在の photos 配列内でインデックスを探す
      const oldIndex = photos.findIndex(photo => photo.id === active.id);
      const newIndex = photos.findIndex(photo => photo.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // photos のコピーに対して arrayMove を適用し、新しい順序の配列を生成
        const newOrderedPhotos = arrayMove([...photos], oldIndex, newIndex);
        onReorder(newOrderedPhotos); // 親に新しい順序を通知
      }
    }
  };

  if (photos.length === 0) {
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
					items={photos.map(photo => photo.id)} // props の photos からIDの配列を渡す
					strategy={rectSortingStrategy}
				>
					{photos.map((photo) => (
						<SortablePhotoItem
							key={photo.id}
							photo={photo}
							onDelete={onDelete}
						/>
					))}
				</SortableContext>
			</DndContext>
		</ul>
  );
}