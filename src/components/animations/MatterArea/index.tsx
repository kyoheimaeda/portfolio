'use client';

import { useEffect, useRef } from 'react';
import {
  Engine,
  Render,
  Runner,
  Bodies,
  Composite,
  Mouse,
  MouseConstraint,
} from 'matter-js';
import styles from './index.module.scss';

export default function MatterArea() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Matter.js エンジンとレンダラー
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

    // 地面と左右の壁を追加
    const ground = Bodies.rectangle(width / 2, height + 50, width, 100, {
      isStatic: true,
    });

    const rightWall = Bodies.rectangle(width, height / 2, 10, height * 2, {
      isStatic: true,
    });

    const leftWall = Bodies.rectangle(0, height / 2, 10, height * 2, {
      isStatic: true,
    });

    Composite.add(engine.world, [ground, rightWall, leftWall]);

    // ✅ マウスドラッグ可能にする
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse; // これ重要！

    // 画像を追加する関数
    const imagePaths = [
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
      '/images/top/matter/github.svg',
      '/images/top/matter/gitlab.svg',
      '/images/top/matter/bitbucket.svg',
      '/images/top/matter/vscode.svg',
      '/images/top/matter/ps.svg',
      '/images/top/matter/figma.svg',
    ];

    const getResponsiveSize = (w: number) => {
      if (w <= 480) return 60;
      if (w <= 768) return 72;
      return 80;
    };

    imagePaths.forEach((src) => {
      const img = new Image();
      img.src = `${window.location.origin}${src}`;
      img.onload = () => {
        const size = getResponsiveSize(width);
        const paddingRight = 10;

        const minX = width * 0.7 + size / 2;
        const maxX = width - size / 2 - paddingRight;
        const randomX = Math.random() * (maxX - minX) + minX;

        const minY = -100;
        const maxY = height / 2;
        const randomY = Math.random() * (maxY - minY) + minY;

        const body = Bodies.rectangle(randomX, randomY, size, size, {
          restitution: 0.8,
          render: {
            sprite: {
              texture: img.src,
              xScale: size / img.width || 1,
              yScale: size / img.height || 1,
            },
          },
        });
        Composite.add(engine.world, body);
      };
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // クリーンアップ処理
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
