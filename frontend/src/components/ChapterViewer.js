import React from 'react';
import parse from 'html-react-parser';
import { List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { DefaultBox, HalfBox, PaperBox } from './MyBox';

//章のリスト
function ChapterList({
    isPlaying,
    novel,
    contentIndex,
    setCurrentIndex,
    setContentIndex,
    setTmpIntCIValue,
}) {
    //次章へ行く際の処理
    const changeContentIndex = (index) => {
        if(!(isPlaying)) {
          setCurrentIndex(0);
          setTmpIntCIValue(0);
          setContentIndex(index);
        }
    };

    return (
        <PaperBox>
            <List>
            {novel.mainText.map((item, index) => (
                <ListItem disablePadding>
                    <ListItemButton
                        selected={index === contentIndex}
                        onClick={() => changeContentIndex(index)}
                    >
                        <ListItemText primary={item[0]} />
                    </ListItemButton>
                </ListItem>
            ))}
            </List>
        </PaperBox>
    );
}

//本文全文表示UI
function ChapterDetail({
    allString,
}) {
    // console.log(allString.slice(0,5));
    return (
        <PaperBox>
            <DefaultBox>
                <Typography variant='body1'>
                    {parse(allString)}
                </Typography>
            </DefaultBox>
        </PaperBox>
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
    setTmpIntCIValue,
}) {
    return (
        <HalfBox>
            <Typography variant='h6'>＜目次＞</Typography>
            <ChapterList
                isPlaying={isPlaying}
                novel={novel}
                contentIndex={contentIndex}
                setCurrentIndex={setCurrentIndex}
                setContentIndex={setContentIndex}
                setTmpIntCIValue={setTmpIntCIValue}
            />
            <DefaultBox>
                <Typography variant='h6'>＜再生中の本文＞</Typography>
            </DefaultBox>
            <ChapterDetail
                allString={allString}
            />
        </HalfBox>
    );
}