import React, { useState } from 'react';

// 小説選択、取得UI
import NovelSelector from './components/NovelSelector';
// 小説閲覧UI
import NovelViewer from './components/NovelViewer';
import { Box, Divider, Typography, Link, createTheme, responsiveFontSizes } from '@mui/material';
import { grey } from '@mui/material/colors';
import { ThemeProvider } from '@emotion/react';

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

  let theme = createTheme({
      palette: {
        background: grey,
      },
      typography: {
        h4: {
          fontWeight: 'bold',
        },
        h5: {
          fontWeight: 'bold',
        },
        h6: {
          fontWeight: 'bold',
        },
        subtitle1: {
          fontWeight: 'bold',
        },
      },
  });
  theme = responsiveFontSizes(theme);

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Typography variant='h4'>青空文庫.split</Typography>
        <Typography variant='body1'>
          青空文庫上の小説を短く区切って、順番に表示することで視線を動かさずに読書ができます。<br></br>
          青空文庫は<Link href="https://www.aozora.gr.jp/index.html">こちら</Link>。募金も<Link href="https://honnomirai.net/">どうぞ</Link>。<br></br>
          不具合などは<Link href="https://docs.google.com/forms/d/e/1FAIpQLSeSTa4bhIKoLixDe17bOyM_I6cj6uUzKasFalrb8-U72eWc8Q/viewform">こちらに</Link>。
        </Typography>
        <Divider variant='middle' />
        <NovelSelector
          setContentIndex={setContentIndex}
          setNovel={setNovel}
          setNovelUrl={setNovelUrl}
          novel={novel}
          novelUrl={novelUrl}
          setCurrentIndex={setCurrentIndex}
          isPlaying={isPlaying}
          setTmpIntCIValue={setTmpIntCIValue}
        />
        <Divider variant='middle' />
        <Typography variant='h5'>{novel.title}</Typography>
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
      </Box>
    </ThemeProvider>
 );
}

export default App;
