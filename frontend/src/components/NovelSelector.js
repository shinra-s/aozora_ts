import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Loading } from './Loading';
import { Box, Button, FormControlLabel, List, ListItem, Radio, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DefaultBox, FlexBox, FlexHandlerBox, FlexMdBox, ListItemBox, PaperBox } from './MyBox';
import { DefaultButton, LinkButton } from './MyButton';
import { DefaultField } from './MyTextField';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ReplayIcon from '@mui/icons-material/Replay';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileDownloadOffIcon from '@mui/icons-material/FileDownloadOff';

// カタカナ判定
const containKatakana = (str) => {
    const katakanaRegex = /^[\u30A1-\u30F6ァ-ヶー]+$/;
    return katakanaRegex.test(str);
};

//検索用関数(キーワード、モード(作品名、著者、著作))
const searchZorapi = async (mode=0,word='',offset=0) => {
    return await fetch(`/search?keyword=${word}&mode=${mode}&offset=${offset}`)
            .then((res) => res.json());
};

// 検索結果ページング
function PagingButton ({
    isNext,
    target,
    isPlaying,
    setSearchResult,
    setIsBook,
    setLinks,
}) {
    const handlePage = async () => {
        const json = await searchZorapi(target.mode, target.keyword, target.offset);
        setSearchResult(json.result);
        setIsBook(json.isBook);
        setLinks(json.links);
    };
    
    if (target === null) {
        return (
        <Box sx={{height:'50px', width:'50%'}}></Box>
        );
    } else if (isNext) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    height:'50px',
                    width:'50%',
                    flexDirection: 'row-reverse',
                    alignItems: 'center',
                }}
            >
                <DefaultButton             
                    disabled={isPlaying}
                    onClick={() => handlePage()}
                    endIcon={<ArrowForwardIosIcon />}
                >
                        <Typography variant='button'>次へ</Typography>
                </DefaultButton>
            </Box>
            );
    } else {
        return (
            <Box
                sx={{
                    display: 'flex',
                    height:'50px',
                    width:'50%',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <DefaultButton             
                    disabled={isPlaying}
                    onClick={() => handlePage()}
                    startIcon={<ArrowBackIosIcon />}
                >
                        <Typography variant='button'>前へ</Typography>
                </DefaultButton>
            </Box>
            );
    }
}

// 検索結果リスト
function ResultList ({
    searchResult,
    handleNovelUrl,
    isBook,
    isPlaying,
    setSearchResult,
    setIsBook,
    setLinks,
    setInitFlag,
}) {
    const search = useLocation().search;
    const query = new URLSearchParams(search);
    const cardNum = query.has('cardNum') ? query.get('cardNum') : '';
    const fileNum = query.has('fileNum') ? query.get('fileNum') : '';

    const [saveUrl, setSaveUrl] = useState((cardNum === '' || fileNum === '') ? '' : `https://www.aozora.gr.jp/cards/${cardNum}/files/${fileNum}.html`);
    const [saveJson, setSaveJson] = useState({result: []});

    useEffect(() => {
        if(saveUrl === '') return;
        searchZorapi(4,saveUrl)
            .then((data) => setSaveJson({ ...saveJson,
                result: data.result,
            }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveUrl]);

    const restoreSaveNovel = () => {
        setInitFlag(true);
        handleNovelUrl(saveUrl);
        setSaveUrl('');
        setSaveJson({result: []});
    };

    // 正規表現パターン
    const regexPattern = /^https:\/\/www\.aozora\.gr\.jp\/cards\/\d+\/files\/\d+_\d+\.html$/;

    if (searchResult === null) {
        if (saveJson?.result?.length > 0) {
            const fullname = (containKatakana(saveJson.result[0].firstname) && containKatakana(saveJson.result[0].lastname)) ? `${saveJson.result[0].firstname} ${saveJson.result[0].lastname}` : `${saveJson.result[0].lastname} ${saveJson.result[0].firstname}`;
            return (
                <DefaultBox>
                    <Typography variant='body1'>
                        前回、読んだところから再開しますか？<br></br>
                        タイトル：{saveJson.result[0].title}<br></br>
                        著者：{fullname}<br></br>
                    </Typography>
                    <DefaultButton
                        endIcon={<ReplayIcon />}
                        disabled={isPlaying}
                        onClick={() => restoreSaveNovel()}
                    >
                        <Typography variant='button'>再開</Typography>
                    </DefaultButton>
                </DefaultBox>
            );
        }
        return (
            <DefaultBox>
                <Typography variant='subtitle1'>読みたい小説を検索しましょう。</Typography>
            </DefaultBox>
        );
    } else if (searchResult.length === 0 ) {
        return (
            <DefaultBox>
                <Typography variant='subtitle1'>キーワードに当てはまるものが見つかりません。</Typography>
            </DefaultBox>
        );
    } else if(isBook) {
        const list = searchResult.map((book) => {
            const fullname = (containKatakana(book.firstname) && containKatakana(book.lastname)) ? `${book.firstname} ${book.lastname}` : `${book.lastname} ${book.firstname}`;
            return (
                <ListItem
                    disablePadding
                    sx={{
                        flexBasis: {
                            xs: '100%',
                            md: '50%',
                        },
                        maxWidth: {
                            xs: '100%',
                            md: '50%',
                        },
                    }}
                >
                    <ListItemBox>
                        <Typography noWrap variant='h6'>{book.title}</Typography>
                        <Typography noWrap variant='subtitle1'>{fullname}</Typography>
                        <LinkButton
                            href={book.card_url}
                            endIcon={<OpenInNewIcon />}
                        >
                            <Typography variant='button'>詳細</Typography>
                        </LinkButton> 
                        <DefaultButton
                            disabled={isPlaying || !regexPattern.test(book.html_url)}
                            onClick={() => handleNovelUrl(book.html_url)}
                            endIcon={regexPattern.test(book.html_url) ? <FileDownloadIcon /> : <FileDownloadOffIcon />}
                        >
                            <Typography variant='button'>{regexPattern.test(book.html_url) ? '読む' : '非対応'}</Typography>
                        </DefaultButton>
                    </ListItemBox>
                </ListItem>
            );
        });

        return (<List sx={{display:'flex', flexWrap:'wrap'}}>{list}</List>);
    } else {
        const handleSearch = async (index) => {
            const json = await searchZorapi(3,`${searchResult[index].lastname} ${searchResult[index].firstname}`);
            setSearchResult(json.result);
            setIsBook(true);
            setLinks(json.links);
        };
        const list = searchResult.map((person, index) => {
            const kanaFlag = (containKatakana(person.firstname) && containKatakana(person.lastname));
            const fullname = kanaFlag ? `${person.firstname} ${person.lastname}` : `${person.lastname} ${person.firstname}`;
            const fullname_yomi = kanaFlag ? `${person.firstname_yomi} ${person.lastname_yomi}` : `${person.lastname_yomi} ${person.firstname_yomi}`;
            return (
                <ListItem
                    disablePadding
                    sx={{
                        flexBasis: {
                            xs: '100%',
                            md: '50%',
                        },
                        maxWidth: {
                            xs: '100%',
                            md: '50%',
                        },
                    }}
                >
                    <ListItemBox>
                        <Typography noWrap variant='h6'>{fullname}</Typography>
                        <Typography noWrap variant='subtitle1'>{fullname_yomi}</Typography>
                        <Button variant='contained'
                            disabled={isPlaying}
                            onClick={() => handleSearch(index)}>
                            著作検索
                        </Button>
                    </ListItemBox>
                </ListItem>
            );
        });

        return (<List disablePadding sx={{display:'flex', flexWrap:'wrap'}}>{list}</List>);
    }
}

export default function NovelSelector ({
        novel,
        novelUrl,
        setContentIndex,
        setNovel,
        setNovelUrl,
        setCurrentIndex,
        isPlaying,
        setTmpIntCIValue,
    }) {
    
    //小説取得の状況
    const [statusNovelUrl, setStatusNovelUrl] = useState("");

    const [initFlag, setInitFlag] = useState(false);
    const search = useLocation().search;
    const query = new URLSearchParams(search);
   
    //小説情報の取得処理
    useEffect(() => {
        if (initFlag) {
            const conIndex = query.has('conIndex') ? query.get('conIndex') : '';
            const curIndex = query.has('curIndex') ? query.get('curIndex') : '';
            if (conIndex === '' || curIndex === '') {
                fetchNovel();
            } else {
                console.log(curIndex);
                fetchNovel(parseInt(conIndex), parseInt(curIndex));
            }
            setInitFlag(false);
        } else {
            fetchNovel();
        }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [novelUrl]);

    // 正規表現パターン
    const regexPattern = /^https:\/\/www\.aozora\.gr\.jp\/cards\/\d+\/files\/\d+_\d+\.html$/;

    const fetchNovel = async (conIndex = 0, curIndex = 0) => {
        if (novelUrl === '') return;
        if (!regexPattern.test(novelUrl)) return;
        console.log("小説取得");
        setStatusNovelUrl('小説取得中')
        setCurrentIndex(0);
        setTmpIntCIValue(0);
        setContentIndex(0);
        await fetch(`/novel?url=${novelUrl}`)
            .then((res) => res.json())
            .then((data) => setNovel({ ...novel,
                author: data.author,
                title: data.title,
                mainText: data.mainText,
        }))
        .then(() => setStatusNovelUrl(''));
        if (conIndex > 0) setContentIndex(conIndex);
        if (curIndex > 0) {
            setCurrentIndex(curIndex);
            setTmpIntCIValue(curIndex);
        }
    };
    
    //----------
    //検索キーワード
    const [keyword, setKeyword] = useState('');
    //検索モード
    const [searchMode, setSearchMode] = useState(1);
    //検索結果
    const [searchResult, setSearchResult] = useState(null);
    //次ページ
    const [links, setLinks] = useState({prev:null,next:null});
    
    const [isBook, setIsBook] = useState(true);

    const handleKeyword = (event) => {
        setKeyword(event.target.value);
    }
    const handleSearchMode = (event) => {
        setSearchMode(parseInt(event.target.value));
    }
    const handleNovelUrl = (str) => {
        if (str === null) {
            setNovelUrl('');
        } else {
            setNovelUrl(str);
        }
    }

    const getSearchResult = async () => {
        const json = await searchZorapi(searchMode,keyword);
        setSearchResult(json.result);
        setIsBook(json.isBook);
        setLinks(json.links);
    };
    
    //-----------

    return (
        <Box>
            <FlexMdBox>
                <FlexHandlerBox>
                    <DefaultField
                        value={keyword}
                        onChange={(event) => handleKeyword(event)}
                        disabled={isPlaying}
                        label='キーワード'
                    />
                    <DefaultButton
                        disabled={isPlaying}
                        onClick={() => getSearchResult()}
                        endIcon={<SearchIcon />}
                    >
                        <Typography variant='button'>検索</Typography>
                    </DefaultButton>
                </FlexHandlerBox>
                <FlexBox>
                    <FormControlLabel
                        value='1'
                        control={
                            <Radio
                                checked={searchMode === 1}
                                onChange={handleSearchMode}
                            />
                        }
                        label='署名'
                    />
                    <FormControlLabel
                        value='2'
                        control={
                            <Radio
                                checked={searchMode === 2}
                                onChange={handleSearchMode}
                            />
                        }
                        label='著者'
                    />
                    <Typography variant='subtitle1'> {statusNovelUrl}</Typography>
                    <Loading statusNovelUrl={statusNovelUrl} />
                </FlexBox>
            </FlexMdBox>
            <PaperBox>
                <ResultList 
                    searchResult={searchResult}
                    handleNovelUrl={handleNovelUrl}
                    isBook={isBook}
                    isPlaying={isPlaying}
                    setIsBook={setIsBook}
                    setSearchResult={setSearchResult}
                    setLinks={setLinks}
                    setInitFlag={setInitFlag}
                />
            </PaperBox>
            <FlexBox>
                <PagingButton
                    isNext={false}
                    target={links.prev}
                    isPlaying={isPlaying}
                    setIsBook={setIsBook}
                    setSearchResult={setSearchResult}
                    setLinks={setLinks}
                />
                <PagingButton
                    isNext={true}
                    target={links.next}
                    isPlaying={isPlaying}
                    setIsBook={setIsBook}
                    setSearchResult={setSearchResult}
                    setLinks={setLinks}
                />
            </FlexBox>
        </Box>
    );
}