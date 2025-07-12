'use client';

import { useEffect, useRef } from 'react';
import { Engine, Render, Runner, Bodies, Composite } from 'matter-js';
import styles from './MatterArea.module.scss';

export default function MatterArea() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const engine = Engine.create();
    const width = scene.clientWidth;
    const height = scene.clientHeight;

    const render = Render.create({
      element: scene,
      engine,
      options: {
        width,
        height,
        wireframes: false,
        background: 'none',
      },
    });

    // 床の追加
    const ground = Bodies.rectangle(width / 2, height + 50, width, 100, {
      isStatic: true,
    });

    // 右壁の追加（右端にはみ出し防止）
    const rightWall = Bodies.rectangle(
      width - 5,       // x: 右端から5px内側
      height / 2,      // y: 高さの中央
      10,              // 幅: 10px
      height * 2,      // 高さ: 画面の2倍くらいの高さ（十分な高さを確保）
      {
        isStatic: true,
      }
    );

    Composite.add(engine.world, [ground, rightWall]);

    // 画像のパス配列
    const imagePaths = [
      // languages
      '/images/top/matter/css3.svg',
      '/images/top/matter/sass.svg',
      '/images/top/matter/html5.svg',
      '/images/top/matter/next.svg',
      '/images/top/matter/vue.svg',
      '/images/top/matter/react.svg',
      '/images/top/matter/php.svg',
      '/images/top/matter/nodejs.svg',
      '/images/top/matter/ts.svg',
      '/images/top/matter/js.svg',
      '/images/top/matter/webpack.svg',
      //tools
      '/images/top/matter/github.svg',
      '/images/top/matter/gitlab.svg',
      '/images/top/matter/bitbucket.svg',
      '/images/top/matter/vscode.svg',
      //design
      '/images/top/matter/ps.svg',
      '/images/top/matter/figma.svg',
    ];

    imagePaths.forEach((src) => {
      const img = new Image();
      img.src = `${window.location.origin}${src}`;
      img.onload = () => {
        const size = 72; // 画像のサイズ
        const paddingRight = 10; // 壁の幅に合わせて余白を10pxに

        // 右下付近に落とすX座標範囲を壁の内側に制限
        const minX = width * 0.7 + size / 2;
        const maxX = width - size / 2 - paddingRight;
        const randomX = Math.random() * (maxX - minX) + minX;

        // Y座標は上〜画面中央くらいにランダム
        const minY = -100;
        const maxY = height / 2;
        const randomY = Math.random() * (maxY - minY) + minY;

        const body = Bodies.rectangle(
          randomX,
          randomY,
          size,
          size,
          {
            restitution: 0.8,
            render: {
              sprite: {
                texture: img.src,
                xScale: size / img.width || 1,
                yScale: size / img.height || 1,
              },
            },
          }
        );
        Composite.add(engine.world, body);
      };
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // クリーンアップ
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      render.canvas.remove();
    };
  }, []);

  return <div ref={sceneRef} className={styles.matter} style={{ height: '100vh', position: 'relative' }} />;
}
