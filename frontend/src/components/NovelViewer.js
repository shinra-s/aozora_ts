import React, { useState, useEffect } from 'react';
import '../App.css';
import NovelPlayer from './NovelPlayer';
import ChapterViewer from './ChapterViewer';

export default function NovelViewer ({
    isPlaying,
    novel,
    novelUrl,
    contentIndex,
    currentIndex,
    setIsPlaying,
    setCurrentIndex,
    setContentIndex,
}) {

    //全文表示用の文字列
    const [allString, setAllString] = useState('');

    //全文表示文字列の更新処理
    useEffect(() =>{
      if (!isPlaying){
        setAllString(toAllString());
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[novel,contentIndex,isPlaying]);
    
    const checkEmpty = (element) => {
      const pattern = /^[\s\n]*$/;
      return !(element === null || element?.trim() === '' || pattern.test(element));
    };
    
    //全文表示文字列の作成処理
    const toAllString = (tmpIndex = null) => {
        // console.log('本文連結');
        let tmpString = '';
        let firstFlag = true;
        let target = 0;

        if (tmpIndex !== null) {
          target = tmpIndex;
        } else {
          target = currentIndex;
        }

        novel.mainText[contentIndex][1].forEach((str,index) => {
            //段落があった場合に１行開ける
            if (!checkEmpty(str[0])) {
              if(firstFlag){
                firstFlag = !firstFlag;
              } else {
                tmpString += '<br><br><font color="gray" size="-1">'+index+'</font><br>';
              }
            }

            //表示中の箇所を赤く強調
            if (index === target) {
              tmpString += '<font color="red">'+str+'</font>';
            } else {
              tmpString += str;
            }
        });
        // console.log(tmpString.slice(0,20));
        return tmpString;
    };    

    return (
        <div class="base">
            <NovelPlayer
                novel={novel}
                novelUrl={novelUrl}
                contentIndex={contentIndex}
                currentIndex={currentIndex}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                setCurrentIndex={setCurrentIndex}
                setContentIndex={setContentIndex}
                setAllString={setAllString}
                toAllString={toAllString}
            />
            <ChapterViewer
                allString={allString}
                isPlaying={isPlaying}
                novel={novel}
                contentIndex={contentIndex}
                setCurrentIndex={setCurrentIndex}
                setContentIndex={setContentIndex}
            />
        </div>
    );
}