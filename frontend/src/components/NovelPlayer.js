import React, { useState, useEffect } from 'react';
import parse from 'html-react-parser';
import '../App.css';

//再生文字列表示カード
function DisplayCard ({
    novel,
    contentIndex,
    currentIndex,
}) {
    return (
        <div class="card">
            <p>{parse(novel?.mainText?.[contentIndex]?.[1]?.[currentIndex])}</p>
          </div>
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
        <div class="ui-container">
            <button class="ui-button" onClick={() => setIsPlaying(prevIsPlaying => !prevIsPlaying)}>
              {isPlaying ? '停止' : '再生'}
            </button>
            <div display='flex'>
            <label htmlFor="check">
            連続再生（章終わりで停止しない）：
            </label>
            <input
              type="checkbox"
              id="check"
              checked={isConPlay}
              onChange={() => setIsConPlay(prevState => !prevState)}
              disabled={isPlaying}
            />
            </div>
        </div>
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
        <div class="ui-container">
            再生位置：
            <input
              type="range"
              min={0}
              max={novel.mainText[contentIndex][1]?.length - 1}
              value={tmpIntCIValue}
              onChange={(event) => handleTmpCIChange(event)}
              class="seek-bar-slider"
              disabled={isPlaying}
            />
            <input
              type="number"
              class="seek-bar-textbox"
              value={tmpIntCIValue}
              onChange={(event) => handleTmpCIChange(event)}
              disabled={isPlaying}
            />
            （0 〜 {novel.mainText[contentIndex][1].length - 1}）
        </div>
    );
}

//再生速度調整のUI
function WpmHandler ({
    setWpm,
    isPlaying,
}) {
    //入力中の再生速度
    const [tmpWpm, setTmpWpm] = useState(150);

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
        <div class="ui-container">
            表示速度：
            <input
              type="number"
              class="seek-bar-textbox"
              value={tmpWpm}
              onChange={(event) => handleTmpWpmChange(event)}
              disabled={isPlaying}
            />
            単語/分（60〜600）
        </div>
    );
}

//保存機能のUI
function SaveHandler ({
  novel,
  novelUrl,
  contentIndex,
  currentIndex,
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
    <div>
      <button class="ui-button" onClick={() => updateSaveState()}>
        しおりを挟む
      </button>
      <ViewSaveState 
        saveState={saveState}
        novel={novel}
      />
    </div>
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
      <div>
        まだしおりは挟んでません。
      </div>
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

      const xPostUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(postText)}`;
    
      window.open(xPostUrl, '_blank');
    }

    return (
      <div>
        タイトル：{novel.title}<br></br>
        章：{novel.mainText[saveState.conIndex][0]}<br></br>
        位置：{saveState.curIndex}<br></br>
        次回アクセス：{shareUrl}<br></br>
        <button class="ui-button" onClick={() => handleCopyToClipboard()}>
          URLコピー
        </button>
        <button class="ui-button" onClick={() => handleXShare()}>
          共有
        </button>
      </div>
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
}) {
    //再生速度
    const [wpm, setWpm] = useState(150);
    //連続再生のフラグ
    const [isConPlay, setIsConPlay] = useState(false);

    //入力中の再生位置
    const [tmpIntCIValue, setTmpIntCIValue] = useState(0);

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
        <div class="contents_list">
            <h3>著者：{novel.author}</h3>
            <DisplayCard
                novel={novel}
                contentIndex={contentIndex}
                currentIndex={currentIndex}
            />
            <PlayHandler
                isPlaying={isPlaying}
                isConPlay={isConPlay}
                setIsPlaying={setIsPlaying}
                setIsConPlay={setIsConPlay}
            />
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
            <WpmHandler
                isPlaying={isPlaying}
                setWpm={setWpm}
            />
            <SaveHandler
                novel={novel}
                novelUrl={novelUrl}
                contentIndex={contentIndex}
                currentIndex={currentIndex}
            />
        </div>
    );
}