import React from 'react';

type PageWrapProps = {
  title?: string; // h1のテキストを動的に渡すためのプロパティ
  children: React.ReactNode;
};

export default function PageWrap({ title, children }: PageWrapProps) {
  return (
    <div className={`l-wrap`}>
      <div className={`l-inner`}>
        {title && (
          <h1 className={`l-title`}>
            {title}
          </h1>
        )}
        <div className={`l-contents`}>
          {children}
        </div>
      </div>
    </div>
  );
}