## イントロダクション
https://developers.notion.com/reference/intro

### NotionAPI全体の仕様
- すべてのAPIリクエストにHTTPSが必要。
- NotionAPIは可能な限りRESTfulに設計されている。

### Json形式のリソース
- トップレベルに"object"プロパティがある。データベースやユーザーを決定する。
- プロパティ名はsnake_caseである。
- **NotionAPIは空の文字列をサポートしないため、NULLを明示的に使用する必要がある**

## データベースから名前で検索して該当ページを削除する方法。
https://developers.notion.com/reference/patch-page

https://developers.notion.com/reference/update-a-database

上記リファレンスを見るとページの削除処理は不可能。
ただし、プロパティをpatchでUpdateすることが可能。
また、以下URLのリファレンスにページの検索ができるらしい。
https://developers.notion.com/reference/post-database-query-filter

これらを組み合わせて、以下のような処理を実装する。
1. データベースから名前で検索して該当ページのIDを取得する。
2. 取得したIDを使って、ページのプロパティをpatchでUpdateする。
3. 更新処理と新規作成処理を分岐して実装する。