/* eslint-disable no-console */
const { JSDOM } = require('jsdom');
const kuromoji = require('kuromoji');

// htmlから指定のクラスの要素を抽出して配列で返す
function getDataInClass(str, className) {
  const dom = new JSDOM(str);
  const { document } = dom.window;
  const elements = document.querySelectorAll(`.${className}`);
  return Array.from(elements).map((element) => element.textContent);
}

// URLを元にhtmlをとってくる
exports.fetchData = async (url) => {
  console.log(url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  console.log(response.status);
  return response.body;
};

// htmlから目次要素を取得して配列で返す
exports.getContentsList = (str) => {
  try {
    const dom = new JSDOM(str);
    const { document } = dom.window;

    // 大見出し取得
    const oMidashis = document.querySelectorAll('.o-midashi');
    let oMiStrs = [];
    const oMiIds = [];
    if (oMidashis != null) {
      oMiStrs = Array.from(oMidashis).map((oMidashi) => oMidashi.textContent);
      oMidashis.forEach((oMidashi) => oMiIds.push(oMidashi.querySelector('a')?.getAttribute('id')));
    } else {
      return [['本文', '']];
    }

    // 中見出し取得
    const nakaMidashis = document.querySelectorAll('.naka-midashi');
    let nakaMiStrs = [];
    const nakaMiIds = [];
    if (nakaMidashis != null) {
      nakaMiStrs = Array.from(nakaMidashis).map((nakaMidashi) => nakaMidashi.textContent);
      nakaMidashis.forEach((nakaMidashi) => nakaMiIds.push(nakaMidashi.querySelector('a')?.getAttribute('id')));
    }

    const tmpContents = [];

    // 大見出しと中見出しを結合
    if (oMidashis != null) {
      if (nakaMidashis == null) {
        for (let i = 0; i < oMiStrs.length; i += 1) tmpContents.push([oMiStrs[i], oMiIds[i]]);
      } else {
        const nmLen = nakaMiIds.length;
        let j = 0;
        for (let i = 0; i < oMiIds.length; i += 1) {
          if (j < nmLen) {
            if (i !== oMiIds.length - 1) {
              for (; (oMiIds[i + 1].length > nakaMiIds[j].length || oMiIds[i + 1] > nakaMiIds[j])
              && j < nmLen; j += 1) {
                tmpContents.push([`${oMiStrs[i]} ${nakaMiStrs[j]}`, nakaMiIds[j]]);
              }
            } else {
              for (;j < nmLen; j += 1) {
                tmpContents.push([`${oMiStrs[i]} ${nakaMiStrs[j]}`, nakaMiIds[j]]);
              }
            }
          } else {
            tmpContents.push([oMiStrs[i], oMiIds[i]]);
          }
        }
      }
    }

    // 小見出し取得
    const koMidashis = document.querySelectorAll('.ko-midashi');
    let koMiStrs = [];
    const koMiIds = [];
    if (koMidashis != null) {
      koMiStrs = Array.from(koMidashis).map((koMidashi) => koMidashi.textContent);
      koMidashis.forEach((koMidashi) => koMiIds.push(koMidashi.querySelector('a')?.getAttribute('id')));
    }

    let contents = [];

    // 中見出しと小見出しを結合
    // eslint-disable-next-line eqeqeq
    if (tmpContents != []) {
      if (koMidashis == null) {
        contents = tmpContents;
      } else {
        const kmLen = koMiIds.length;
        let j = 0;
        for (let i = 0; i < tmpContents.length; i += 1) {
          if (j < kmLen) {
            if (i !== tmpContents.length - 1) {
              for (; (tmpContents[i + 1][1].length > koMiIds[j].length
                || tmpContents[i + 1][1] > koMiIds[j]) && j < kmLen; j += 1) {
                contents.push([`${tmpContents[i][0]} ${koMiStrs[j]}`, koMiIds[j]]);
              }
            } else {
              for (;j < kmLen; j += 1) {
                contents.push([`${tmpContents[i][0]} ${koMiStrs[j]}`, koMiIds[j]]);
              }
            }
          } else {
            contents.push(tmpContents[i]);
          }
        }
      }
    }

    // eslint-disable-next-line eqeqeq
    if (contents == []) return [['本文', '']];

    console.log('目次取得完了');

    return contents;
  } catch (error) {
    console.log(error);
    return [['本文', '']];
  }
};

// 与えられた文字列がから文字列や空白のみのか否かをチェック
// eslint-disable-next-line no-unused-vars
function checkEmpty(element) {
  const pattern = /^[\s\n]*$/;
  return !(element === null || element.trim() === '' || pattern.test(element));
}

// 本文の文字列(形態素解析済み)を文節で区切られた配列に変換する
function convertToBunsetsuArray(tokens) {
  const breakPos = ['名詞', '動詞', '接頭詞', '副詞', '感動詞', '形容詞', '形容動詞', '連体詞'];
  const resultArray = [''];
  let afterPrepos = false;
  let afterSahenNoun = false;
  let afterBracket = false;
  let afterPeriod = false;
  let htmlTagFlag = false;
  let afterHtmlTag = false;

  // 形態素単位に処理して、文節の切れ目を判断して文節に成形する
  tokens.forEach((token,i) => {
    //if (i > 80 && i < 120) console.log(token);
    const surface = token.surface_form;
    const { pos } = token;
    const posDetail = `${token.pos_detail_1}/${token.pos_detail_2}/${token.pos_detail_3}/${token.conjugated_type}`;

    // 区切らないところ
    let noBreak = !(breakPos.includes(pos)); // 区切る品詞ではない
    noBreak = noBreak || posDetail.includes('接尾'); // 接尾詞である
    noBreak = noBreak || ((pos === '動詞') && posDetail.includes('サ変接続')); // サ変接続活用動詞である
    noBreak = noBreak || posDetail.includes('非自立'); // 非自立詞である
    noBreak = noBreak || afterPrepos; // 接頭詞の後である
    noBreak = noBreak || (afterSahenNoun && (pos === '動詞') && posDetail.includes('サ変・スル')); // サ変接続の後のサ変スル動詞である
    noBreak = noBreak || afterBracket; // かっこ開きの直後である
    noBreak = noBreak || htmlTagFlag; // htmlタグの途中である
    noBreak = noBreak || afterHtmlTag; // htmlタグ終了直後である

    // 区切るところ
    let breakPoint = (afterPeriod && !(surface.includes('」') || surface.includes('』'))); // 文末直後でかっこ閉じを含まない
    breakPoint = breakPoint || surface.includes('『') || surface.includes('「'); // かっこ開きを含む
    breakPoint = breakPoint || (!htmlTagFlag && surface.includes('<')); // htmlタグの途中でなく、<を含む

    if (surface === '><' && resultArray[resultArray.length - 1].includes('/ruby')) {
      resultArray[resultArray.length - 1] += '>';
      resultArray.push('');
      resultArray[resultArray.length - 1] += '<';
      htmlTagFlag = false;
    } else {
      if (!noBreak || breakPoint) {
        resultArray.push('');
      }
      resultArray[resultArray.length - 1] += surface;
    }

    afterPrepos = pos === '接頭詞'; // 次は接頭詞の直後
    afterSahenNoun = posDetail.includes('サ変接続'); // 次はサ変接続の直後
    afterBracket = surface.includes('（') || surface.includes('『') || surface.includes('「'); //次はかっこ開きの直後
    afterHtmlTag = surface.includes('>'); // 次は>の直後
    afterPeriod = surface.includes('。'); // 次は文末直後

    if (htmlTagFlag) { // htmlタグの途中
      if (resultArray[resultArray.length - 1].includes('ruby')) { // rubyタグの途中
        htmlTagFlag = !(surface.includes('>') && resultArray[resultArray.length - 1].includes('/ruby'));
      } else { // 他のhtmlタグ
        htmlTagFlag = !surface.includes('>');
      }
    } else { // htmlタグの途中ではない
      htmlTagFlag = surface.includes('<'); // htmlタグ開始
    }

  });

  for (let i = 0; ;) {
    if (!checkEmpty(resultArray[i])) {
      resultArray[i] += resultArray[i + 1];
      resultArray.splice(i + 1, 1);
    }
    i += 1;
    if (i >= resultArray.length - 1) break;
  }

  return resultArray;
}

// 小説のタイトルを取得
exports.getTitle = (str) => {
  try {
    const titleArray = getDataInClass(str, 'title');
    console.log('タイトル取得完了');
    return titleArray[0];
  } catch (error) {
    console.error('error:', error);
    return 'タイトル取得失敗';
  }
};

// 小説の著者を取得
exports.getAuthor = (str) => {
  try {
    const authorArray = getDataInClass(str, 'author');
    console.log('著者取得完了');
    return authorArray[0];
  } catch (error) {
    console.error('error:', error);
    return '著者取得失敗';
  }
};

function removePreprocessMark(str) {
  // console.log(str);
  const reGaijiPattern = /<<<(.*?)>>>/g;
  const reGaijiStrTmp = str.replace(reGaijiPattern, '<img src="$1" class="gaiji">');
  const reGaijiStr = reGaijiStrTmp.replace(/\.\.\/\.\.\/\.\.\//g, 'https://www.aozora.gr.jp/');
  const reRubyPattern = /{{{(.*?)（(.*?)）}}}/g;
  return reGaijiStr.replace(reRubyPattern, '<ruby><rb>$1</rb><rp>（</rp><rt>$2</rt><rp>）</rp></ruby>');
}

// 章ごとに分割した文字列を返す
function getTextArray(str, contents) {
  // 外字とふりがな用の事前処理
  // console.log(str);
  const gaijiPattern = /<img gaiji="gaiji" src="(.*?)" alt="(.*?)" class="gaiji" \/>/g;
  const gaijiRmStr = str.replace(gaijiPattern, '<<<$1>>>');
  const rubyPattern = /<ruby><rb>(.*?)<\/rb><rp>（<\/rp><rt>(.*?)<\/rt><rp>）<\/rp><\/ruby>/g;
  const preProcessedStr = gaijiRmStr.replace(rubyPattern, '{{{$1（$2）}}}');
  
  const dom = new JSDOM(preProcessedStr);
  const { document } = dom.window;
  const elements = document.querySelectorAll('.main_text');

  if (elements === null) {
    return [['本文', ['本文取得失敗']]];
  }

  // 本文から見出しタグを抽出
  const aTags = elements[0].querySelectorAll('.midashi_anchor');

  const divStr = '[[[[[div]]]]]';

  if (contents === null || contents[0] === null || !Array.isArray(contents[0])) {
    return [['本文', Array.from(elements).map((element) => removePreprocessMark(element.textContent))[0]]];
  }

  if (aTags !== null && contents[0][0] !== '本文') {
    let i = 0;

    // 分割点になる文字列を区切り文字に、そうでないものは空白に置換
    aTags.forEach((aTag) => {
      if (aTag.getAttribute('id') === contents[i][1]) {
        if (i === 0) {
          // eslint-disable-next-line no-param-reassign
          aTag.textContent = '';
        } else {
          // eslint-disable-next-line no-param-reassign
          aTag.textContent = divStr;
        }
        i += 1;
      } else {
        // eslint-disable-next-line no-param-reassign
        aTag.textContent = '';
      }
    });

    // 区切り文字で分割し、目次配列と本文を結合
    const resText = Array.from(elements).map((element) => removePreprocessMark(element.textContent))[0];
    const resStrArray = resText.split(divStr);

    const resArray = [];

    for (i = 0; i < contents.length; i += 1) {
      if (i < resStrArray.length) {
        resArray.push([contents[i][0], resStrArray[i]]);
      } else {
        resArray.push([contents[i][0], '']);
      }
    }

    return resArray;
  }

  console.log(`aTag:${aTags[0].textContent}`);
  return [['本文', Array.from(elements).map((element) => element.textContent)[0]]];
}

// 小説の本文を文節で区切られた配列で取得
exports.getMainText = async (str, contents) => {
  try {
    // htmlから本文を抽出
    console.log('本文取得開始');
    const mainTexts = getTextArray(str, contents);

    mainTexts.forEach((mainText) => {
      if (typeof (mainText[1]) !== 'string') {
        // eslint-disable-next-line no-param-reassign
        mainText[1] = '';
      }

      // 本文中の改行タグ、注釈を除去
      // eslint-disable-next-line no-param-reassign
      mainText[1] = mainText[1].replace(/<br>/g, '');
      // eslint-disable-next-line no-param-reassign
      mainText[1] = mainText[1].replace(/［＃\S*］/g, '');
      // console.log('ノイズ除去完了');
    });

    // kuromojiを使い形態素解析を行いトークンに分解、トークンを文節単位に成形
    return new Promise((resolve) => {
      kuromoji.builder({ dicPath: 'node_modules/kuromoji/dict' })
        // eslint-disable-next-line consistent-return
        .build((err, tokenizer) => {
          if (err) {
            console.error('error:', err);
            return [['本文', ['本文取得失敗']]];
          }

          const res = [];

          mainTexts.forEach((mainText) => {
            const tokens = tokenizer.tokenize(mainText[1]);
            // console.log('形態素解析完了');
            const bunsetsuArray = convertToBunsetsuArray(tokens);
            res.push([mainText[0], bunsetsuArray]);
          });
          console.log('本文取得完了');
          resolve(res);
        });
    });
  } catch (error) {
    console.error('error:', error);
    return [['本文', ['本文取得失敗']]];
  }
};
