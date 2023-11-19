/* eslint-disable no-case-declarations */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const express = require('express');
const iconv = require('iconv-lite');
const { Writable, Transform, pipeline } = require('stream');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cron = require('node-cron');
const AdmZip = require('adm-zip');
const csvtojson = require('csvtojson');
const fs = require('fs');
const fetch = require('node-fetch');
const novelAnalyzer = require('./novelAnalyzer');

const app = express();

require('dotenv').config({ path: 'backend/.env' });

// DB更新用 -----------------------------------------
// MongoDBの接続情報→.envに移す
const mongoPass = process.env.MONGO_PASS;
const mongoUser = process.env.MONGO_USER;

const port = process.env.PORT || 3001;
const mongodbURL = `mongodb+srv://${mongoUser}:${mongoPass}@aozora.phcjtfp.mongodb.net/?retryWrites=true&w=majority`;
const dbName = 'Aozora';
const paging = 10;

// 青空文庫の書籍情報CSVのパス
const bookFilePath = 'https://www.aozora.gr.jp/index_pages/list_person_all_extended_utf8.zip';

// csvのheader情報
const csvHeader = [
  'book_id',
  'title',
  'title_yomi',
  'title_sort',
  'subtitle',
  'subtitle_yomi',
  'original_title',
  'first_appearance',
  'ndc_code',
  'font_kana_type',
  'copyright',
  'release_date',
  'last_modified',
  'card_url',
  'person_id',
  'lastname',
  'firstname',
  'lastname_yomi',
  'firstname_yomi',
  'lastname_sort',
  'firstname_sort',
  'lastname_spell',
  'firstname_spell',
  'role',
  'birthdate',
  'deathdate',
  'person_copyright',
  'base_book_1',
  'base_book_1_publisher',
  'base_book_1_1st_edition',
  'base_book_1_edition_input',
  'base_book_1_edition_proofing',
  'base_book_1_parent',
  'base_book_1_parent_publisher',
  'base_book_1_parent_1st_edition',
  'base_book_2',
  'base_book_2_publisher',
  'base_book_2_1st_edition',
  'base_book_2_edition_input',
  'base_book_2_edition_proofing',
  'base_book_2_parent',
  'base_book_2_parent_publisher',
  'base_book_2_parent_1st_edition',
  'input',
  'proofing',
  'text_url',
  'text_last_modified',
  'text_encoding',
  'text_charset',
  'text_updated',
  'html_url',
  'html_last_modified',
  'html_encoding',
  'html_charset',
  'html_updated',
];

// データベースに接続
async function connectToDatabase() {
  const client = new MongoClient(mongodbURL, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  await client.connect();
  return client;
}

// 書籍データをMongoDBに挿入（同じIDがあれば更新）
async function upsertBooks(db, data) {
  const collection = db.collection('books');

  let inBcnt = 0;
  let upBcnt = 0;

  for (const entry of data) {
    const existingData = await collection.findOne({ book_id: entry.book_id });

    if (existingData) {
      await collection.updateOne({ book_id: entry.book_id }, { $set: entry });
      upBcnt += 1;
      console.log(`Data updated for BookID: ${entry.book_id}`);
    } else {
      await collection.insertOne(entry);
      inBcnt += 1;
      console.log(`Data inserted for BookID: ${entry.book_id}`);
    }
  }

  console.log(`in:${inBcnt}, up:${upBcnt}`);
}

// 人物データをMongoDBに挿入（同じIDがあればスキップ）
async function upsertPersons(db, data) {
  const collection = db.collection('persons');

  let inPcnt = 0;
  let skPcnt = 0;

  for (const entry of data) {
    const existingData = await collection.findOne({ person_id: entry.person_id });

    if (existingData) {
      skPcnt += 1;
      // console.log(`Skip for PersonID: ${entry.person_id}`);
    } else {
      await collection.insertOne(entry);
      inPcnt += 1;
      console.log(`Data inserted for PersonID: ${entry.person_id}`);
    }
  }

  console.log(`in:${inPcnt}, sk:${skPcnt}`);
}

// ZIPファイルを解凍して中のCSVファイルを取得
function extractCSVFromZip(zipFilePath) {
  const zip = new AdmZip(zipFilePath);
  const zipEntries = zip.getEntries();

  const csvFiles = zipEntries.filter((entry) => entry.entryName.endsWith('.csv'));

  return csvFiles.map((entry) => ({
    name: entry.entryName,
    data: zip.readAsText(entry),
  }));
}

// データベース内の最新の更新日を取得する関数
async function getLatestUpdateDate(db) {
  const collection = db.collection('books');

  const result = await collection.find().sort({ html_last_modified: -1 }).limit(1).toArray();

  if (result.length > 0) {
    return result[0].html_last_modified;
  }

  return '1900-01-01';
}

// CSVから特定の列のみを抽出する関数
async function extractColumns(csvData, columns) {
  const jsonArray = await csvtojson({
    noheader: true, // 最初の行をヘッダーと見なさない
    headers: csvHeader, // カスタム列名を指定
  }).fromString(csvData);

  return jsonArray.map((entry) => {
    const extractedData = {};
    columns.forEach((column) => {
      extractedData[column] = entry[column];
    });
    return extractedData;
  });
}

// 重複したperson_idを持つデータを削除する関数
function removeDuplicatePersonIDs(data) {
  const uniqueData = [];
  const idSet = new Set();

  for (const entry of data) {
    if (!idSet.has(entry.person_id)) {
      idSet.add(entry.person_id);
      uniqueData.push(entry);
    }
  }

  return uniqueData;
}

// 特定の条件に基づいてデータを絞り込む関数
function filterByRole(data) {
  return data.filter((entry) => entry.role === '著者');
}

// カタカナ判定
const containKatakana = (str) => {
  const katakanaRegex = /^[\u30A1-\u30F6ァ-ヶー]+$/;
  return katakanaRegex.test(str);
};

// fullname列の追加
function addFullName(data) {
  return data.map((entry) => ({
    ...entry,
    fullname: (containKatakana(entry.lastname) && containKatakana(entry.firstname)) ? `${entry.firstname}${entry.lastname}` : `${entry.lastname}${entry.firstname}`,
  }));
}

// DBの更新
async function updateLib() {
  let client = null;
  try {
    // 青空文庫からファイルを取得してzip解凍
    const response = await fetch(bookFilePath);
    const buffer = await response.buffer();
    const bookFileName = 'book_list.zip';
    fs.writeFileSync(bookFileName, buffer);
    const csvFiles = extractCSVFromZip(bookFileName);

    client = await connectToDatabase();
    const db = client.db(dbName);

    // 書籍情報登録
    for (const csvFile of csvFiles) {
      const columns = ['book_id', 'title', 'lastname', 'firstname', 'role', 'card_url', 'html_url', 'html_last_modified'];
      const jsonData = await extractColumns(csvFile.data, columns);

      const latestUpdateDate = await getLatestUpdateDate(db);
      console.log(`最新更新：${latestUpdateDate}`);

      // 役割：著者、htmlURLあり、更新日新しいもののみ抽出
      console.log(`元データ:${jsonData.length}`);
      const tmpData = filterByRole(jsonData);
      console.log(`著者のみ:${tmpData.length}`);
      const tmpData2 = tmpData.filter((entry) => entry.html_url !== null);
      console.log(`URLあり:${tmpData2.length}`);
      const tmpData3 = tmpData2.filter((entry) => entry.html_last_modified > latestUpdateDate);
      const newData = addFullName(tmpData3);

      if (newData.length > 0) {
        await upsertBooks(db, newData);
        console.log('New data inserted into books');
      } else {
        console.log('No new data to insert into books');
      }
    }

    console.log('Book Data insertion process completed');

    // 人物情報登録
    for (const csvFile of csvFiles) {
      const columns = ['person_id', 'lastname', 'firstname', 'lastname_yomi', 'firstname_yomi', 'role'];
      const jsonData = await extractColumns(csvFile.data, columns);

      // 役割：著者のみ、person_idの重複削除、fullname追加
      const tmpData = filterByRole(jsonData);
      const tmpData2 = removeDuplicatePersonIDs(tmpData);
      const newData = addFullName(tmpData2);

      if (newData.length > 0) {
        await upsertPersons(db, newData);
        console.log('New data inserted into persons');
      } else {
        console.log('No new data to insert into persons');
      }
    }

    console.log('Person Data insertion process completed');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // データベース接続を閉じる
    if (client !== null) client.close();
  }
}

const task = cron.schedule('0 0 * * *', async () => {
  updateLib();
});

task.start();

const args = process.argv.slice(2);

// node index.js updateLib
if (args.length > 0 && args[0] === 'updateLib') {
  updateLib();
} else {
  console.log('Invalid command. Usage: node your-script.js maintenance');
}

// -------------------------------------------------------

// frontendのAPI -----------------------------------------

// 文字コード変換のクラス
class SJISToUTF8Transform extends Transform {
  constructor(options) {
    super({ ...options, readableObjectMode: true, writableObjectMode: true });
  }

  // eslint-disable-next-line no-underscore-dangle
  _transform(chunk, encoding, callback) {
    try {
      // console.log(chunk);
      const utf8Chunk = iconv.decode(chunk, 'Shift_JIS');
      // console.log(utf8Chunk);
      this.push(utf8Chunk);
      callback();
    } catch (error) {
      console.log(error);
    }
  }
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // 全てのオリジンからのリクエストを許可
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('/api', (req, res) => {
  res.json({ message: 'Hello World!' });
});

// 小説取得API
app.get('/novel', async (req, res) => {
  try {
    const novelURL = req.query.url;
    console.log(novelURL);

    const novelStream = await novelAnalyzer.fetchData(novelURL);
    const sjisToUtf8Stream = new SJISToUTF8Transform();
    let novelText = '';

    console.log('文字コード変換開始');

    // パイプライン処理でフェッチしてきた文字列を順次処理する
    pipeline(
      // ストリームで小説ページのhtmlを取得
      novelStream,
      // 取得した文字列はshift-jisのためutf8に変換
      sjisToUtf8Stream,
      // 変換した文字列を１つの文字列に連結していく
      new Writable({
        write(chunk, encoding, callback) {
          // console.log(chunk);
          novelText += chunk.toString();
          callback(null, chunk);
        },
      }),
      // パイプライン処理実行後、以下の処理が実行される
      async (error) => {
        if (error) {
          console.error('Error during stream processing:', error);
        } else {
          console.log('文字コード変換完了');
          // 変換後のhtmlから小説情報を抽出する
          const tagInd = novelText.indexOf('<body>');
          const novelBody = novelText.slice(tagInd + 6);
          const novelTitle = novelAnalyzer.getTitle(novelBody);
          const novelAuthor = novelAnalyzer.getAuthor(novelBody);
          const novelContents = novelAnalyzer.getContentsList(novelBody);
          const novelMainText = await novelAnalyzer.getMainText(novelBody, novelContents);

          console.log('<取得結果>');
          console.log(`題名：${novelTitle}`);
          console.log(`著者：${novelAuthor}`);
          console.log(`目次：${novelMainText[0][0]}`);
          console.log(`本文：${novelMainText[0][1].slice(0, 5)}`);

          // 抽出した情報をjsonに埋め込みリターン
          res.json({
            title: novelTitle,
            author: novelAuthor,
            mainText: novelMainText,
          });
        }
      },
    );
  } catch (error) {
    console.error('Error fetching and analyzing novel:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// 全てのキーワードを含むドキュメントを検索
async function searchByKeywords(db, collectionName, keywords, targetKey) {
  const collection = db.collection(collectionName);

  const keywordQueries = keywords.map((keyword) => ({ [targetKey]: { $regex: new RegExp(keyword, 'i') } }));

  const result = await collection.find({ $and: keywordQueries }).toArray();

  return result;
}

app.get('/search', async (req, res) => {
  const { keyword } = req.query;
  const keywords = keyword.split(/\s+/);
  // console.log(keywords);
  const { mode } = req.query;
  let { offset } = req.query;

  if (offset === null) offset = 0;

  const client = await connectToDatabase();
  const db = client.db(dbName);

  let result = [];

  switch (mode) {
    case '1':
      result = await searchByKeywords(db, 'books', keywords, 'title');
      break;
    case '2':
      result = await searchByKeywords(db, 'persons', keywords, 'fullname');
      break;
    case '3':
      result = await searchByKeywords(db, 'books', keywords, 'fullname');
      break;
    default:
      console.log(`不正なモード:${mode},${keywords},${offset}`);
      return;
  }

  client.close();
  res.json({
    result: result.slice(offset, offset + paging),
    isBook: !(mode === '2'),
    links: {
      prev: (offset - paging) >= 0 ? { keyword, mode, offset: offset - paging } : null,
      next: (offset + paging) < result.length ? { keyword, mode, offset: offset + paging } : null,
    },
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(port, () => {
  console.log(`listening on *:${port}`);
});
