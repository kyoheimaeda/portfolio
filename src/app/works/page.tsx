// import React, { useState } from 'react';
import Link from "next/link";
import PageWrap from '@/components/layout/PageWrap';
import styles from "./page.module.scss";
import { LuLink } from "react-icons/lu";



export default function WorksPage() {
	// const [tasks, setTasks] = useState<Array<{ task: string; completed: boolean }>>([]);
  return (
    <PageWrap title="WORKS">
      <article className={styles.works}>
				<section className={styles.worksItem}>
					<div className={styles.worksHead}>
						<h2>
							PHOTO GALLERY
						</h2>
						<div className={`${styles.linkBox}`}>
							<Link className={`c-button`} href="/gallery/" target="_blank">表示ページ<LuLink /></Link>
							<Link className={`c-button`} href="/gallery/manage/" target="_blank">管理ページ<LuLink /></Link>
						</div>
					</div>
					<details className={styles.worksBody}>
						<summary>Detail</summary>
						<div className={styles.worksBodyContents}>
							<section>
								<h3>仕様</h3>
								<dl>
									<dt>目的</dt>
									<dd>画像ギャラリーを表示し、ユーザーが写真の閲覧や管理（管理者向け）を行えるようにする。</dd>
								</dl>
								<dl>
									<dt>表示機能</dt>
									<dd>
										<ul>
											<li>Supabase から取得した画像を一覧表示。</li>
											<li>画像は order フィールドでソートされ、次に created_at でソート</li>
											<li>各画像をクリックするとモーダルで拡大表示。</li>
											<li>画像は表示前にプリロードされ、スムーズな表示を実現。</li>
										</ul>
									</dd>
									<dt>管理機能 (Server Actions)</dt>
									<dd>
										<dl>
											<dt>画像アップロード</dt>
											<dd>新しい画像を Cloudflare R2 にアップロードし、その情報を Supabase データベースに保存。</dd>
											<dt>dnd-kitを使用し、ドラッグ&ドロップで画像順序更新</dt>
											<dd>ギャラリー内の画像の表示順序を更新。</dd>
											<dt>画像削除</dt>
											<dd>Cloudflare R2 から画像を削除し、Supabase データベースからもその情報を削除。</dd>
										</dl>
									</dd>
									<dt>データ取得とキャッシュ</dt>
									<dd>
										<ul>
											<li>Next.js のサーバーコンポーネントで Supabase からデータをフェッチ。</li>
											<li>Incremental Static Regeneration (ISR) を利用し、revalidate = false を設定。明示的な revalidatePath 呼び出し時のみキャッシュが再検証され、ページが再生成される。</li>
										</ul>
									</dd>
								</dl>
							</section>

							<section>
								<h3>使用技術</h3>
								<dl>
									<dt>Next.js (React)</dt>
									<dd>
										<ul>
											<li>サーバーコンポーネントとクライアントコンポーネントを適切に使い分け。</li>
											<li>Next.js Server Actions を利用して、サーバーサイドでのデータ操作（アップロード、更新、削除）を実現。</li>
											<li>next/cache の revalidatePath を使用して、ISR のキャッシュを管理。</li>
										</ul>
									</dd>
									<dt>Supabase</dt>
									<dd>
										<ul>
											<li>gallery_images テーブルに画像URL、パス、メタデータなどを保存。</li>
											<li>@/lib/supabaseClient.ts を通じて Supabase クライアントを初期化。</li>
										</ul>
									</dd>
									<dt>Cloudflare R2 (S3互換)</dt>
									<dd>
										<ul>
											<li>画像ファイルの実体を保存。</li>
											<li>@aws-sdk/client-s3 を使用して R2 との連携。</li>
										</ul>
									</dd>
									<dt>React</dt>
									<dd>useState, useRef, useEffect などの React Hooks を使用して、クライアントサイドのインタラクション（モーダル表示など）を管理。</dd>
									<dt>Prisma</dt>
									<dd>ORMとして選択。</dd>
									<dt>SCSS (CSS Modules)</dt>
									<dd>page.module.scss や index.module.scss を使用して、コンポーネントごとのスタイルをカプセル化。</dd>
									<dt>TypeScript</dt>
									<dd>プロジェクト全体で TypeScript を使用し、PhotoType などの型定義によりコードの堅牢性を向上。</dd>
									<dt>uuid</dt>
									<dd>アップロードされる画像ファイルに一意な名前を生成。</dd>
									<dt>dnd-kit</dt>
									<dd>アップロードした画像一覧画面で表示順をドラッグ&ドロップで並び替え</dd>
								</dl>
							</section>
						</div>
					</details>
				</section>
      </article>
    </PageWrap>
  );
}
