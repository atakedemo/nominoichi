# 実装中のメモ

## Webアプリ

コマンド類

```bash
npx create-next-app@latest nominoichi-web --typescript
cd nominoichi-web
npm install @chakra-ui/react lucide-react
npx @chakra-ui/cli snippet add toaster
npx @chakra-ui/cli snippet add number-input
```

次やること

* シーケンス図で処理を整理
* バックエンドを用意
* テストネットでコントラクト用意
* フロントエンドに組み込み
  * APIを叩く処理を組み込む
  * Viemを組み込む
