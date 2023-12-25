import React, { useState } from 'react';
import './App.css';

// 小説選択、取得UI
import NovelChoicer from './components/NovelChoicer';
// 小説閲覧UI
import NovelViewer from './components/NovelViewer';

function App() {
  //小説情報
  const [novel, setNovel] = useState({
    //著者
    author: '',
    //題名
    title: '読みたい小説を選んでください',
    //本文（章単位で章題と文節で区切った本文のペア）
    mainText: [['本文',['小説選択前']]],
  });
  //現在の再生位置
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tmpIntCIValue, setTmpIntCIValue] = useState(0);

  //再生中か否か
  const [isPlaying, setIsPlaying] = useState(false);
  //再生中の章
  const [contentIndex, setContentIndex] = useState(0);

  //小説取得先のURL
  const [novelUrl, setNovelUrl] = useState('');

  return (
    <div>
      <h1>青空文庫.split</h1>
      青空文庫は<a href="https://www.aozora.gr.jp/index.html">こちら</a>。募金も<a href="https://honnomirai.net/">どうぞ</a>。<br></br>
      不具合などは<a href="https://docs.google.com/forms/d/e/1FAIpQLSeSTa4bhIKoLixDe17bOyM_I6cj6uUzKasFalrb8-U72eWc8Q/viewform">こちらに</a>。
      <hr color='#007bff'></hr>
      <NovelChoicer
        setContentIndex={setContentIndex}
        setNovel={setNovel}
        setNovelUrl={setNovelUrl}
        novel={novel}
        novelUrl={novelUrl}
        setCurrentIndex={setCurrentIndex}
        isPlaying={isPlaying}
        setTmpIntCIValue={setTmpIntCIValue}
      />
      <hr color='#007bff'></hr>
      <h2>{novel.title}</h2>
      <NovelViewer
        novel={novel}
        novelUrl={novelUrl}
        contentIndex={contentIndex}
        currentIndex={currentIndex}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        setCurrentIndex={setCurrentIndex}
        setContentIndex={setContentIndex}
        tmpIntCIValue={tmpIntCIValue}
        setTmpIntCIValue={setTmpIntCIValue}
      />
    </div>
 );
}

export default App;
