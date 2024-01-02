import React, { useState, useEffect } from 'react';
import parse from 'html-react-parser';
import { Card, CardContent, Checkbox, Divider, FormControlLabel, Slider, Typography } from '@mui/material';
import { DefaultBox, DefaultHandlerBox, FlexBox, FlexHandlerBox, HalfBox } from './MyBox';
import { DefaultButton } from './MyButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { NumberField } from './MyTextField';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';

//再生文字列表示カード
function DisplayCard ({
    novel,
    contentIndex,
    currentIndex,
}) {
    const parseBunsetsu = (str) => {
      try {
        return parse(str);
      } catch (e) {
        return str;
      }
    }

    return (
        <DefaultBox>
          <Card sx={{
            display: 'flex',
            minHeight: 200,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
              <CardContent>
                <Typography variant='h6'>{parseBunsetsu(novel?.mainText?.[contentIndex]?.[1]?.[currentIndex] ?? '')}</Typography>
              </CardContent>
          </Card>
        </DefaultBox>
    );
}

//再生ボタン周辺のUI
function PlayHandler ({
    isPlaying,
    isConPlay,
    setIsPlaying,
    setIsConPlay,
}) {
    return (
        <FlexBox>
            <DefaultButton
              onClick={() => setIsPlaying(prevIsPlaying => !prevIsPlaying)}
              endIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            >
              <Typography variant='button'>{isPlaying ? '停止' : '再生'}</Typography>
            </DefaultButton>
            <FormControlLabel
              label='：章連続再生'
              sx={{
                mx: 2,
              }}
              control={
                <Checkbox
                  checked={isConPlay}
                  onChange={() => setIsConPlay(prevState => !prevState)}
                  disabled={isPlaying}
                  sx={{
                    p: 0,
                  }}
                />
              }
            />
        </FlexBox>
    );
}

//シークバー周辺のUI
function SeekHandler ({
    novel,
    contentIndex,
    tmpIntCIValue,
    setTmpIntCIValue,
    setCurrentIndex,
    setAllString,
    toAllString,
    isPlaying,
}) {
    
    //入力中の再生位置の更新処理
    useEffect(() => {
        // テキストの入力終了時の処理
        const intTimeout = setTimeout(() => {
          // ここに遅延後の処理を追加できます
          if(tmpIntCIValue > novel.mainText[contentIndex][1].length - 1) {
            setTmpIntCIValue(novel.mainText[contentIndex][1].length - 1);
          } else if (tmpIntCIValue < 0) {
            setTmpIntCIValue(0);
          } else {
            setCurrentIndex(tmpIntCIValue);
            setAllString(toAllString(tmpIntCIValue));
          }
        }, 500);
    
        return () => {
          clearTimeout(intTimeout);
        };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tmpIntCIValue]);
    
    const handleTmpCIChange = (e) => {
      if (!(e.target.value === null || e.target.value === '')) {
        setTmpIntCIValue(parseInt(e.target.value));
      } else {
        setTmpIntCIValue(0); 
      }
    };

    return (
        <FlexHandlerBox>
            <NumberField
              label='再生位置'
              value={tmpIntCIValue}
              onChange={handleTmpCIChange}
              disabled={isPlaying}
            />
            <Slider
              sx={{
                width: '50%',
                mx: 2,
              }}
              value={tmpIntCIValue}
              min={0}
              max={novel.mainText[contentIndex][1]?.length - 1}
              disabled={isPlaying}
              onChange={handleTmpCIChange}
              marks={[
                {
                  value: 0,
                  label: '0',
                },
                {
                  value: novel.mainText[contentIndex][1]?.length - 1,
                  label: `${novel.mainText[contentIndex][1]?.length - 1}`,
                },
              ]}
            />
        </FlexHandlerBox>
    );
}

//再生速度調整のUI
function WpmHandler ({
    setWpm,
    isPlaying,
}) {
    //入力中の再生速度
    const [tmpWpm, setTmpWpm] = useState(100);

    //入力中の再生速度の更新処理
    useEffect(() => {
        //遅延処理
        const wpmTimeout = setTimeout(() => {
          if (tmpWpm < 60) {
            setTmpWpm(60);
          } else if (tmpWpm > 600) {
            setTmpWpm(600);
          } else {
            setWpm(tmpWpm);
          }
        }, 500);
    
        return () => {
          clearTimeout(wpmTimeout);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tmpWpm]);

    const handleTmpWpmChange = (e) => {
      setTmpWpm(parseInt(e.target.value));
    };

    return (
      <NumberField
        label='表示速度'
        value={tmpWpm}
        onChange={handleTmpWpmChange}
        disabled={isPlaying}
        helperText='単語/分（60〜600）'
      />
    );
}

//保存機能のUI
function SaveHandler ({
  novel,
  novelUrl,
  contentIndex,
  currentIndex,
  isPlaying,
}) {

  const [saveState, setSaveState] = useState(null);

  const updateSaveState = () => {
    if (novelUrl === '') return;
    const urlSplit = novelUrl.split('/');
    const cardNum = urlSplit[4];
    const fileNum = urlSplit[6].split('.')[0];
    setSaveState({
      cardNum: cardNum,
      fileNum: fileNum,
      conIndex: contentIndex,
      curIndex: currentIndex,
    });
  };

  return (
    <DefaultHandlerBox>
      <DefaultButton
        disabled={isPlaying}
        onClick={() => updateSaveState()}
        endIcon={<BookmarkAddIcon />}
      >
        <Typography variant='button'>しおりを挟む</Typography>
      </DefaultButton>
      <ViewSaveState 
        saveState={saveState}
        novel={novel}
      />
    </DefaultHandlerBox>
  )
}

//保存した栞の表示
function ViewSaveState ({
  saveState,
  novel,
}) {

  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (saveState === null) return;
    setShareUrl(`https://aozora-split.com?cardNum=${saveState.cardNum}&fileNum=${saveState.fileNum}&conIndex=${saveState.conIndex}&curIndex=${saveState.curIndex}`);
  }, [saveState]);
  
  if (saveState === null) {
    return (
      <DefaultBox>
        <Typography variant='body1'>まだしおりは挟んでません。</Typography>
      </DefaultBox>
    );
  } else {
    
    const handleCopyToClipboard = () => {
      navigator.clipboard.writeText(shareUrl)
        .then(() => alert('URLをコピーしました'))
        .catch(() => alert('URLのコピーに失敗しました'));
    }

    const handleXShare = () => {
      const partName = novel.mainText[saveState.conIndex][0];
      const postText = `「${novel.title}」の${partName === '本文' ? '途中' : partName}まで読みました`;
      const hashtags = '青空文庫,青空文庫split';

      const xPostUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(postText)}&hashtags=${encodeURIComponent(hashtags)}`;
    
      window.open(xPostUrl, '_blank');
    }

    return (
      <DefaultBox>
        <Typography variant='body1' sx={{p: 2,}}>
          タイトル：{novel.title}<br></br>
          章：{novel.mainText[saveState.conIndex][0]}<br></br>
          位置：{saveState.curIndex}<br></br>
          次回アクセス：{shareUrl}<br></br>
        </Typography>
        <DefaultButton
          onClick={() => handleCopyToClipboard()}
          endIcon={<ContentCopyIcon />}
        >
          <Typography variant='button'>URLコピー</Typography>
        </DefaultButton>
        <DefaultButton
          onClick={() => handleXShare()}
          endIcon={<ShareIcon />}
        >
          <Typography variant='button'>共有</Typography>
        </DefaultButton>
      </DefaultBox>
    );
  }
}

//小説再生のプレーヤー
export default function NovelPlayer ({
    isPlaying,
    novel,
    novelUrl,
    contentIndex,
    currentIndex,
    setCurrentIndex,
    setContentIndex,
    setIsPlaying,
    setAllString,
    toAllString,
    tmpIntCIValue,
    setTmpIntCIValue,
}) {
    //再生速度
    const [wpm, setWpm] = useState(100);
    //連続再生のフラグ
    const [isConPlay, setIsConPlay] = useState(false);

    //入力中の再生位置
    // const [tmpIntCIValue, setTmpIntCIValue] = useState(0);

    const handleCurrentIndex = (int) => {
      setCurrentIndex(int);
      setTmpIntCIValue(int);
    };

    //再生停止の処理
    useEffect(() => {
        let intervalId;
        
        if (wpm < 60){
          setWpm(60);
        }
    
        if(isPlaying) {
          intervalId = setInterval(() => {
            handleCurrentIndex((prevIndex) => {
              if (prevIndex >= novel.mainText[contentIndex][1].length - 1) {
                if(isConPlay){
                  setContentIndex(contentIndex + 1);
                  return 0;
                } else {
                  setIsPlaying(false);
                  return prevIndex;
                }
              }
              return prevIndex + 1;
            });
          }, (60 * 1000) / wpm);
        } else {
          clearInterval(intervalId);
        }
    
        return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying]);

    return (
        <HalfBox>
            <Typography variant='h6'>著者：{novel.author}</Typography>
            <DisplayCard
                novel={novel}
                contentIndex={contentIndex}
                currentIndex={currentIndex}
            />
            <FlexHandlerBox>
              <PlayHandler
                  isPlaying={isPlaying}
                  isConPlay={isConPlay}
                  setIsPlaying={setIsPlaying}
                  setIsConPlay={setIsConPlay}
              />
              <WpmHandler
                  isPlaying={isPlaying}
                  setWpm={setWpm}
              />
            </FlexHandlerBox>
            <Divider variant='middle' />
            <SeekHandler
                novel={novel}
                contentIndex={contentIndex}
                isPlaying={isPlaying}
                tmpIntCIValue={tmpIntCIValue}
                setTmpIntCIValue={setTmpIntCIValue}
                setCurrentIndex={setCurrentIndex}
                setAllString={setAllString}
                toAllString={toAllString}
            />
            <Divider variant='middle' />
            <SaveHandler
                isPlaying={isPlaying}
                novel={novel}
                novelUrl={novelUrl}
                contentIndex={contentIndex}
                currentIndex={currentIndex}
            />
        </HalfBox>
    );
}