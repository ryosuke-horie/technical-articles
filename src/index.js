import { Client } from '@notionhq/client'   // Notionのクライアント
import { getAllNotes } from './markdown.js' // notesディレクトリからMarkdownをNotionの形式に変換する関数
import dotenv from 'dotenv'

// 環境変数からNotionのトークンとデータベースIDを取得
dotenv.config()
const token = process.env.NOTION_TOKEN
const databaseId = process.env.NOTION_DATABASE_ID

/**
 * notesディレクトリ内のMarkdownファイルをNotionのデータベースに追加する
 */
async function main() {
  // Notionのクライアント初期化
  const notion = new Client({ auth: token })

  // notesディレクトリからノートを取得
  const notes = getAllNotes('notes')

  // 失敗したノートの名前を格納する配列
  const failedNotes = []

  // ノートを再帰的にNotionデータベースに追加
  for (const note of notes) {
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
  }

  // 失敗したノートの名前をログに出力
  // 失敗しなかったら[]が出力される
  console.log('ページ作成に失敗したノート: ', failedNotes)
}

main()