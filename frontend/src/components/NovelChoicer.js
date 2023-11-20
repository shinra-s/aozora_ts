import React, { useState, useEffect } from 'react';
import '../App.css';
import { ImNewTab } from 'react-icons/im';

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
    const word = isNext ? '次へ' : '前へ';

    if (target === null) {
        return (
        <p style={{height:'50px', width:'50%'}}></p>
        );
    } else {
        return (
            <p style={{height:'50px', width:'50%'}}
                align={isNext ? 'right': 'left'}>
                <button class='ui-button'
                            disabled={isPlaying}
                            onClick={() => handlePage()}>
                            {word}
                </button>
            </p>
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
}) {
    if (searchResult === null) {
        return (
            <p>読みたい小説を検索しましょう。</p>
        );
    } else if (searchResult.length === 0 ) {
        return (
            <p>キーワードに当てはまるものが見つかりません。</p>
        );
    } else if(isBook) {
        const list = searchResult.map((book) => {
            const fullname = (containKatakana(book.firstname) && containKatakana(book.lastname)) ? `${book.firstname} ${book.lastname}` : `${book.lastname} ${book.firstname}`;
            // console.log(book.html_url);
            return (
                <li>
                    <p>
                        <h4>{book.title}</h4>
                        <h5>{fullname}</h5>
                        <a href={book.card_url} target="_blank" rel="noopener noreferrer">詳細<ImNewTab/></a> 
                        <button class='read-button'
                        disabled={isPlaying}
                        onClick={() => handleNovelUrl(book.html_url)}>
                        読む
                        </button>
                    </p>
                </li>
            );
        });

        return (<ol>{list}</ol>);
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
                <li>
                    <p>
                        <h4>{fullname}</h4>
                        <h5>{fullname_yomi}</h5>
                        <button class='read-button'
                        disabled={isPlaying}
                        onClick={() => handleSearch(index)}>
                        著作検索
                        </button>
                    </p>
                </li>
            );
        });

        return (<ol>{list}</ol>);
    }
}

export default function NovelChoicer ({
        novel,
        setContentIndex,
        setNovel,
        setCurrentIndex,
        isPlaying,
    }) {
    
    //小説取得先のURL
    //const [novelUrl, setNovelUrl] = useState('https://www.aozora.gr.jp/cards/000363/files/56656_74440.html');
    const [novelUrl, setNovelUrl] = useState('');
    
    //小説取得の状況
    const [statusNovelUrl, setStatusNovelUrl] = useState("");

    //小説情報の取得処理
    useEffect(() => {
        if (novelUrl === '') return;
        console.log("小説取得");
        setStatusNovelUrl('小説取得中')
        setContentIndex(0);
        fetch(`/novel?url=${novelUrl}`)
          .then((res) => res.json())
          .then((data) => setNovel({ ...novel,
                author: data.author,
                title: data.title,
                mainText: data.mainText,
          }))
          .then(() => setStatusNovelUrl(''));
        setCurrentIndex(0);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [novelUrl]);
    
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
        <div>
            <div class='novel_choicer'>
                <div display='flex'>
                    <input
                        type='text'
                        value={keyword}
                        onChange={(event) => handleKeyword(event)}
                        disabled={isPlaying}
                    />
                    <button class='ui-button'
                        disabled={isPlaying}
                        onClick={() => getSearchResult()}>
                        検索
                    </button>
                    <label>
                        <input
                            type="radio"
                            value="1"
                            checked={searchMode === 1}
                            onChange={(event) => handleSearchMode(event)}
                        />
                        書名検索
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="2"
                            checked={searchMode === 2}
                            onChange={(event) => handleSearchMode(event)}
                        />
                        著者検索
                    </label>
                    <p><b> {statusNovelUrl}</b></p>
                </div>
                <div class='contents_list_box'>
                    <ResultList 
                        searchResult={searchResult}
                        handleNovelUrl={handleNovelUrl}
                        isBook={isBook}
                        isPlaying={isPlaying}
                        setIsBook={setIsBook}
                        setSearchResult={setSearchResult}
                        setLinks={setLinks}
                    />
                </div>
                <div style={{display:'flex'}}>
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
                </div>
            </div>
        </div>
    );
}