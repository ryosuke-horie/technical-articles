## 開発ログ
### ChatGPTにソースコードを共有
- src/index.js
- src/markdown.js
- package.json
上記コードをファイル名とともに共有。

### ソースコードの意図の共有と実現したいことの共有
以下の文章をDeepLで翻訳してChatGPTへ送信。
今回は箇条書きで解決策を書き出すように指示しています。
```
コードの共有を終えました。
共有したソースコードは同じリポジトリのルートディレクトリに存在する、notesディレクトリ内のMarkdownファイルを取得し、自分のNotionのデータベース内に投稿するものです。

コードの実行はGit Bashでnode src/index.jsで行います。
今notes/hoge.mdを実行したらNotionデータベースで該当のページが作成されたことを確認しました。

それではあなたに私が実現したいことを共有します。
mainブランチへのマージ時にGithub Actionsを利用して、「更新があったファイルのみ」Notionへ送信するようにしたいです。

現状のソースコードでは、notesディレクトリ内のファイルが毎回Notionへ送信され、実行するたびに重複したページが作成されてしまいます。

それでは解決に向けてまずは、ステップバイステップで解決策を箇条書きで書きだしましょう！
```

返答の翻訳：
もちろん、あなたの目標は理解していますし、それを達成するための手助けはできます。ここでは、あなたの問題を解決するためのステップバイステップを紹介します：

1. **変更されたファイルの取得:** Github Actions内でGitを使用して、与えられたプルリクエストでどのファイルが変更されたかを判断することができます。それを行うGithub Actionが用意されています： [jitterbit/get-changed-files](https://github.com/marketplace/actions/get-changed-files)です。このアクションは、追加されたファイル、変更されたファイル、削除されたファイルのリストを提供し、その後のステップで使用することができます。

1. **変更されたファイルのフィルタリング:** `notes`ディレクトリ内のファイルだけに興味があるので、`notes`ディレクトリにないファイルをフィルタリングする必要があります。これは、簡単なシェルスクリプトで実現できます。

3. **`*getAllNotes` 関数の更新:** `getAllNotes` 関数を更新して、引数としてファイル名の配列を受け取るようにする必要があります。そうすると、ディレクトリ内のすべてのファイルを読み込む代わりに、変更されたファイルのみを処理するようになります。

4. **Github Actionsのワークフローを作成する：**最後に、プルリクエストイベントでトリガーされるGithub Actionsワークフローをセットアップする必要があります。このワークフローでは、以下のことを行います：
    - jitterbit/get-changed-files` アクションを使用して、変更されたファイルのリストを取得します。
    - notes`ディレクトリにないファイルをフィルタリングする。
    - 変更されたファイルのリストを引数として、アプリケーションを実行する。

以下は、Github Actionsのワークフローがどのように見えるかのハイレベルな概要です：

```yaml
name: Update Notion Pages
on:
  pull_request:
    types: [closed]
    branches:
      - main
jobs:
  update-notion:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v2

      - name: Install Node.js
        uses: actions/setup-node@v2
        with:
          node-version: 14

      - name: Install Dependencies
        run: npm ci

      - name: Get Changed Files
        id: files
        uses: jitterbit/get-changed-files@v1

      - name: Filter Notes and Update Notion Pages
        run: |
          changed_notes_files=$(echo ${{ steps.files.outputs.all }} | tr ' ' '\n' | grep '^notes/')
          if [[ -n "$changed_notes_files" ]]; then
            node src/index.js $changed_notes_files
          fi
```

変更されたファイルのリストを引数として受け取り、それを `getAllNotes` 関数に渡すように `main` 関数を更新する必要があるでしょう。

このワークフローは、プルリクエストがメインブランチにマージされたときにのみ機能することに注意しましょう。Git のワークフローが異なる場合は、トリガーを調整する必要があるかもしれません。

### 解決策の実装
ChatGPTの回答をもとにGithub Actionsを実装します。
まずは、別のチャットを開いて、先ほどのGithub Actionsのワークフローを送信し検証します。
```
あなたはGithub Actionsが得意なエンジニアです。ファイルを検証してください。

yamlファイル：
name: Update Notion Pages
on:
  pull_request:
    types: [closed]
    branches:
      - main
jobs:
  update-notion:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v2

      - name: Install Node.js
        uses: actions/setup-node@v2
        with:
          node-version: 14

      - name: Install Dependencies
        run: npm ci

      - name: Get Changed Files
        id: files
        uses: jitterbit/get-changed-files@v1

      - name: Filter Notes and Update Notion Pages
        run: |
          changed_notes_files=$(echo ${{ steps.files.outputs.all }} | tr ' ' '\n' | grep '^notes/')
          if [[ -n "$changed_notes_files" ]]; then
            node src/index.js $changed_notes_files
          fi
```

ChatGPTからの返答は以下の通りです。
```
このYAMLファイルは、GitHub Actionsでのワークフローを定義しています。具体的には、メインブランチへのプルリクエストが閉じられた（つまりマージされた）ときに実行されます。

以下に、それぞれのジョブの機能を説明します：

1. **Checkout Repo**: GitHubリポジトリのコードをチェックアウトします。これにより、ワークフローは最新のコードに対して動作します。

2. **Install Node.js**: Node.jsをセットアップします。ここではバージョン14がインストールされます。

3. **Install Dependencies**: `npm ci`を実行します。これは、依存関係をインストールします。

4. **Get Changed Files**: `jitterbit/get-changed-files@v1`を使用して、変更されたファイルを取得します。

5. **Filter Notes and Update Notion Pages**: 変更があったファイルのリストから、`notes/`ディレクトリにあるファイルをフィルタリングし、それらを引数として`node src/index.js`を実行します。

全体として、このワークフローは、プルリクエストがマージされた後にNotionページを自動的に更新するためのものと推測されます。

しかし、`node src/index.js $changed_notes_files`の部分が正確に何をするのかは、このYAMLファイルだけからはわかりません。`src/index.js`が何をするのか（例えば、Notion APIを使ってページを更新するなど）は、そのJavaScriptファイルを見ないと判断できません。

このワークフローが期待通りの動作をするかどうかは、コードベース全体とその特定のJavaScriptファイルに依存しますが、与えられた情報に基づいては、このGitHub Actionsワークフローは整理されており、期待した動作をする可能性が高いと思われます。
```

ChatGPTが送ってきたyamlファイルはsrc/index.jsが更新するファイルを変数として受け取っていることがわかります。
ChatGPTに聞いてもいいですが、処理を理解しながら進めたいのでこの場合はGithub Copilotにコメントで指示を出し、補助してもらいながら実装していきます。
以下の手順を踏みます。
- src/index.jsとsrc/markdown.jsをウィンドウに開く
- src/index.jsで更新のあったファイル名を引数として受け取るようにコメントアウトで指示を出す。この引数はsrc/markdown.jsに渡される。
- src/markdown.js内で更新のあった引数の配列を受け取り、その配列で指定したファイルをもとにMarkdownファイルからデータを取得するように修正

変更後のファイルは以下になります
```javascript
// src/index.js
// 一部省略
async function main(updatedFileName) {
  // 更新されたファイル名がない場合は処理を終了する
  if (!updatedFileName) {
    return
  }

  // Notionのクライアント初期化
  const notion = new Client({ auth: token })

  // notesディレクトリのノートを指定して取得
  const notes = getAllNotes(updatedFileName)
// ...


// src/markdown.js
// 一部省略
/**
 * notesディレクトリ内のMarkdownファイルの内容をNotionのブロックに変換し、オブジェクトの配列として返す
 * @param updatedFileName // 更新されたファイル名の配列
 * @returns 
 */
export function getAllNotes(updatedFileName) {
  // Markdownファイルを格納するディレクトリ
  const notePath = 'notes'

  // ファイル名を元にファイルの内容を取得
  const notes = updatedFileName.map(name => {
// ...
```

### 動作確認
notesディレクトリに適当なMarkdownファイルを作成し、mainブランチにプッシュしてみます。

テストするといくつかの問題があり、エラーが発生しました。以下その問題点を列挙します。
- src/index.jsが最後にmain()を呼び出すが、この形では変数を取得できない。
- Githubに環境変数を設定していない。
- ymlファイルにGithubの環境変数を取得する処理がない。
- ymlファイルでNode.jsのバージョンが14をしていているのでnotionのライブラリが動作しない。

上記を解決するために以下のように修正しました。
src/index.js
```javascript
import { Client } from '@notionhq/client'   // Notionのクライアント
import { getAllNotes } from './markdown.js' // notesディレクトリからMarkdownをNotionの形式に変換する関数
import dotenv from 'dotenv'

// 環境変数からNotionのトークンとデータベースIDを取得
dotenv.config()
const token = process.env.NOTION_TOKEN
const databaseId = process.env.NOTION_DATABASE_ID

/**
 * notesディレクトリ内のMarkdownファイルをNotionのデータベースに追加する
 * 引数として更新されたファイル名を受け取る。
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
  const failedNotes = []

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
  // 失敗しなかったら[]が出力される
  console.log('ページ作成に失敗したノート: ', failedNotes)
}

// ファイルが更新された場合に呼び出される。引数に更新されたファイル名が渡される
main(process.argv[2])
```

src/markdown.js
```javascript
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

  // ファイル名を元にファイルの内容を取得
  // const notes = updatedFileName.map(name => {
    // ファイルの内容を取得
    const content = readFileSync(path.join(updatedFileName))

    // Markdownファイルの内容を構造データとして読み込む
    const matterResult = matter(content)

    // ファイル名とファイルの内容を返す。
    return {
      name: updatedFileName.replace(/.md$/, ''),               // ファイル名をデータベースに登録するタイトル（Name）として使用する
      body: markdownToBlocks(matterResult.content), // MarkdownをNotionのブロックに変換する
    }
  // })

  // return notes
}
```

.github/workflows/main.yml
```yml
name: Update Notion Pages
on:
  pull_request:
    types: [closed]
    branches:
      - main
jobs:
  update-notion:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v2

      - name: Install Node.js
        uses: actions/setup-node@v2
        with:
          node-version: 18

      - name: Install Dependencies
        run: npm ci

      - name: Get Changed Files
        id: files
        uses: jitterbit/get-changed-files@v1

      - name: Filter Notes and Update Notion Pages
        run: |
          changed_notes_files=$(echo ${{ steps.files.outputs.all }} | tr ' ' '\n' | grep '^notes/')
          if [[ -n "$changed_notes_files" ]]; then
            node src/index.js $changed_notes_files
          fi
        env:
            NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
            NOTION_DATABASE_ID: ${{ secrets.NOTION_DATABASE_ID }}
```