import { readFileSync, readdirSync } from 'fs'        // ファイル読み込み・ディレクトリ読み込み
import path from 'path'                               // パス操作
import matter from 'gray-matter'                      // Markdownファイルからファイルの内容を構造データとして読み込む
import { markdownToBlocks } from '@tryfabric/martian' // MarkdownをNotionのブロックに変換するライブラリ

/**
 * notesディレクトリ内のMarkdownファイルの内容をNotionのブロックに変換し、オブジェクトの配列として返す
 * @param updatedFileName // 更新されたファイル名の配列
 * @returns 
 */
export function getAllNotes(updatedFileName) {
    // ファイルの内容を取得
    const content = readFileSync(path.join(updatedFileName))

    // Markdownファイルの内容を構造データとして読み込む
    const matterResult = matter(content)

    // ファイル名とファイルの内容を返す。
    return {
      name: updatedFileName.replace(/.md$/, ''),               // ファイル名をデータベースに登録するタイトル（Name）として使用する
      body: markdownToBlocks(matterResult.content), // MarkdownをNotionのブロックに変換する
    }
}