import { Client } from '@notionhq/client'   // Notionのクライアント
import { getAllNotes } from './markdown.js' // notesディレクトリからMarkdownをNotionの形式に変換する関数

const token = process.env.NOTION_TOKEN
const databaseId = process.env.NOTION_DATABASE_ID

/**
 * notesディレクトリ内のMarkdownファイルをNotionのデータベースに追加する
 * 引数として更新されたファイル名を受け取る。
 * @param {string} updatedFileName 更新されたファイル名
 */
async function main(updatedFileName) {
  // 更新されたファイル名がない場合は処理を終了する
  if (!updatedFileName) {
    console.log('更新されたファイルがありません');
    return
  }
  console.log('更新されたファイル: ', updatedFileName)

  // Notionのクライアント初期化
  const notion = new Client({ auth: token })

  // notesディレクトリのノートを指定して取得
  const note = getAllNotes(updatedFileName)

  // 失敗したノートの名前を格納する配列
  const failedNotes = ''

  // ノートを再帰的にNotionデータベースに追加
    try {
      await notion.pages.create({
        parent: { database_id: databaseId },
        // データベースのプロパティNameにノートのタイトルを追加
        // つまりノートのタイトルがデータベースのNameプロパティに反映される
        properties: {
          Name: {
            type: 'title',
            title: [{ text: { content: note.name } }],
          },
        },
        // Markdownファイルの中身を追加する
        children: note.body,
      })
    } catch (e) {
      // エラーが発生した場合はfailedNotesにノートの名前を追加
      console.error(`${note.name}の追加に失敗: `, e)
      failedNotes.push(note.name)
    }
  

  // 失敗したノートの名前をログに出力
  console.log('ページ作成に失敗したノート: ', failedNotes)
}

// ファイルが更新された場合に呼び出される。引数に更新されたファイル名が渡される
main(process.argv[2])