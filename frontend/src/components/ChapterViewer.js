import React from 'react';
import parse from 'html-react-parser';
import { Box, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';

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
        <Box sx={{
            bgcolor: 'background.paper',
            boxShadow: 1,
            borderRadius: 2,
            p: 2,
            height: 200,
            overflow: 'hidden',
            overflowY: 'scroll',
        }}>
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
        </Box>
    );
}

//本文全文表示UI
function ChapterDetail({
    allString,
}) {
    // console.log(allString.slice(0,5));
    return (
        <Box sx={{
            bgcolor: 'background.paper',
            boxShadow: 1,
            borderRadius: 2,
            p: 2,
            height: 200,
            overflow: 'hidden',
            overflowY: 'scroll',
        }}>
            <Typography variant='body1'>
                {parse(allString)}
            </Typography>
        </Box>
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
        <Box>
            <Typography variant='h6'>＜目次＞</Typography>
            <ChapterList
                isPlaying={isPlaying}
                novel={novel}
                contentIndex={contentIndex}
                setCurrentIndex={setCurrentIndex}
                setContentIndex={setContentIndex}
                setTmpIntCIValue={setTmpIntCIValue}
            />
            <Typography variant='h6'>＜再生中の本文＞</Typography>
            <ChapterDetail
                allString={allString}
            />
        </Box>
    );
}