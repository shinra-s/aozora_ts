import React from 'react';
import parse from 'html-react-parser';
import '../App.css';

//章のリスト
function ChapterList({
    isPlaying,
    novel,
    contentIndex,
    setCurrentIndex,
    setContentIndex,
}) {
    //次章へ行く際の処理
    const changeContentIndex = (index) => {
        if(!(isPlaying)) {
          setCurrentIndex(0);
          setContentIndex(index);
        }
    };

    return (
        <div class="contents_list_box">
            <ul>
              {novel.mainText.map((item, index) => (
                <li
                  onClick={() => changeContentIndex(index)}
                  key={index}
                  style={index === contentIndex
                  ? {color: '#404040', 'border-left': 'solid 6px #007bff'}
                  : {color: 'gray', 'border-left': 'solid 6px gray'}
                  }
                >
                  {item[0]}
                </li>
              ))}
            </ul>
        </div>
    );
}

//本文全文表示UI
function ChapterDetail({
    allString,
}) {
    // console.log(allString.slice(0,5));
    return (
        <div class="contents_list_box">
            <p class='all_text'>
              {parse(allString)}
            </p>
        </div>
    );
}

//目次リストと再生中の章の全文表示
export default function ChapterViewer({
    isPlaying,
    novel,
    contentIndex,
    setContentIndex,
    setCurrentIndex,
    allString,
}) {
    return (
        <div class="contents_list">
            <h3>＜目次＞</h3>
            <ChapterList
                isPlaying={isPlaying}
                novel={novel}
                contentIndex={contentIndex}
                setCurrentIndex={setCurrentIndex}
                setContentIndex={setContentIndex}
            />
            <h3>＜再生中の本文＞</h3>
            <ChapterDetail
                allString={allString}
            />
        </div>
    );
}