PourWiki - The Browser-side Wiki engine
=======================================

PourWikiとは描画処理をブラウザ側(JavaScript)で行うWikiエンジンです。表示時にサーバ上で(PHP等の)プログラムが動作する事なく、静的なファイルをユーザに送るだけなので、サーバ側の処理負荷が極端に低い事が特徴ですが、サーチエンジンのロボット等JavaScriptを理解しないクライアントはコンテンツを読むことができません。これは多くの場合、特に商用のサイト等では「欠点」となりますので注意が必要です。その上で、PourWikiには以下の特徴があります。

- テンプレートファイルが100%HTMLファイルである。
    - 既存のHTMLオーサリングソフトでwikiのテンプレートをデザインできます。
    - wikiによってデザインの押し付けは一切ありません
- ページ編集機能がPHP
    - データベース等の準備は必要ありません
- ページの表示機能はすべてJavaScriptで実装
    - 表示だけならPHPの使えないレンタルサーバ上でも可能
        - その場合編集はローカルで行い、コンテンツ部分だけサーバにアップロード
- JQueryやTwitter Bootstrapとの親和性
    - PourWikiのエンジンはJQueryとTwitterBootstrapを利用
    - ユーザのコンテンツやデザインもそれらの機能を利用可能


PourWikiの基本理念
-----------------
PourWikiはWikiエンジンなので、Webブラウザを使って、ページを書き換えたり、ページを新設・削除を行ったりという事を実現するソフトウェアです。ただ、他の多くのWikiエンジンのように、スキンを取り換えてデザインを変更する機能はありません。ただ、これは「***制約***」ではなく、むしろ逆で、PourWikiはあえてそのように設計されました。Wikiエンジンの仕様を満たしたスキンでページを飾るのではなく、ユーザがゼロから自由にデザインしたWebページにWikiの機能を付けるのがPourWikiの考え方です。

Twitter Bootstrap等を使えば簡単なHTMLコードで効果的なデザインのWebページを作る事ができます。そうやって自分でデザインしたWebページの一部分をWebブラウザを使って書き換えられたら便利だなぁ、という所から、このプロジェクトは始まっています。

使い方は非常に簡単です。HTMLの中に**contents**というidを持つdivタグを設置してください。またPourWikiが指定する数個のJavaScriptファイルとCSSファイルをHTMLのヘッダ内で読み込んでください。それだけで、そのdivタグの中身はWebブラウザからwikiスタイルで書きかえ可能になります。PourWikiではmediawikiに似た簡単なwiki記法もサポートしています。またTopページから自分のいるページへのナビゲーションに有用な「パンくずリスト」もサポートしています。

さらに、PourWikiをパワフルなものにする概念の１つに「**Pourable**」があります。Pourableは、プログラミングにおける変数(Variable)と、ページ内に任意に設置できる「ブログパーツ」両方の特徴を持った機能です。例えば、「俺のWiki」というWebサイトの名前をPourableに定義しておけば、各ページ内ではそのサイト名をハードコーディングする事なく表示可能です。後でサイト名を変える必要性が出た時も、Pourableを更新すれば、それを表示しているページは全て瞬時に新しいサイト名に変更されます。

Pourableはサイト全体に適用されるもの(Constant Pourable, Global Pourable)、ディレクトリをスコープとするもの(Directory Pourable)、単一のページをスコープとするもの(Page Pourable)があり、サイト全体だけでなく、ディレクトリ毎に表示するものを変えたり、あるいはページ毎に変えたりも可能です。

Pourableはdivタグ、あるいはspanタグの中に流し込まれる事を前提としており、ページ内のどこに何を表示するかについては、divタグやspanタグのid属性によって決定されます。詳しくはPourable　Container記法の章をご覧ください。


INSTALL
-------
###動作要件
- PHP
- パーミッションの変更が可能である事
- mod_rewiteが使用可能である事
- .htaccessファイルが設置可能である事
    - あるいはapahceの全体設定が編集可能である事

インストールコマンドまとめ(詳しくは次章以降の説明を読んでください)
```
git clone --depth 1 https://github.com/abarth500/PourWiki.git
mv PourWiki/pourconf.js.def PourWiki/pourconf.js
mv PourWiki/pourconf.php.def PourWiki/pourconf.php
mv PourWiki/.htaccess-root ./.htaccess
chmod 777 PourWiki/docs/local
chmod 777 PourWiki/progs/preview
cp PourWiki/tmpls/empty_page.html ./index.html

```

###ダウンロードと設置

Git導入済みの環境なら、Webサーバのルートディレクトリでcloneしてください。
```
git clone --depth 1 https://github.com/abarth500/PourWiki.git
```

Gitが無い環境ならGithubの画面上にある**Download ZIP**ボタンからダウンロードしてください。解凍すると**PourWiki-master**というディレクトリが現れますので、**PourWiki**という名前に変更して、Webページのルートディレクトリに置いてください。

次に**pourconf.js.def**を**pourconf.js**に、**pourconf.php.def**を**pourconf.php**に名前を変えてください。これで設置は完了です。

###mod_rewriteの設定
Webページのルートに対してmod_rewriteの設定を追加してください。この設定はユーザのアクセスしたURLにファイルが無かった場合、代わりにテンプレートディレクトリ(PourWiki/tmpls)のempty_page.htmlを表示せよという設定です。

もし貴方のWebサイトが全て同じデザインで良い場合は、このテンプレートファイルにデザインを施すだけで十分ですが、特定のページだけデザインを変える事も可能です。独自デザインのページ(例えばTOPページだけはデザインを変えよう等の利用法があります)を置きたい場合は、その場所(例えばルートのindex.html)にカスタムデザインのHTMLファイルを置くだけです。このデザインの柔軟さはPourWikiの特徴です。

mod_rewriteの設定例
```
Order allow,deny
Allow from all
Options FollowSymLinks
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.+)$ /PourWiki/tmpls/empty_page.html [L,QSA]
```

この設定はPourWikiディレクトリの.htaccess-rootにも記載されています。ご使用のWebサーバで.htaccess有効なら、これを以下のコマンドで１つ上のディレクトリ(=Webのルートディレクトリ)に移動させれば設定完了です。
```
mv PourWiki/.htaccess-root ./.htaccess
```

PourWikiディレクトリ自体にはmod_writedを適用しないので、PourWikiディレクトリでは次の.htaccessファイルを設置してください。(普通にインストールしていれば、この.htaccessはすでPourWikiディレクトリに配置されているはずです)
```
RewriteEngine Off
Options -Indexes　-FollowSymLinks
<Files ~ "\.password$">
    deny from all
</Files>
```

###パーミッションの設定
ディレクトリ構造は単純です。WebページのルートにPourWikiディレクトリを作成し、そこに全てのファイルをインストールしていると思いますが、その中のdocsディレクトリがWikiによって管理されるコンテンツのデータが格納されます。その内でlocalというディレクトリが各HTMLページに流し込まれるデータの格納場所です。なのでこのディレクトリをPHP(Webサーバ)から書きかえられるようにします。
```
chown apache:apache PourWiki/docs/local
#もしくは
chmod 777 PourWiki/docs/local
```

次に編集画面でのプレビュー機能ように一時データが書きだされるディレクトリのパーミッションも変更します。
```
chown apache:apache PourWiki/progs/preview
#もしくは
chmod 777 PourWiki/progs/preview
```

###index.htmlの設置
PourWikiでは全てのページにHTMLファイルを設置する必要はありませんが、１つだけ例外があってWebのルートにだけはindex.html(index.phpでも可)を置く必要があります。もし空のWebサイトにPourWikiをインストールした場合は、tmplsディレクトリにあるempty-page.htmlをコピーしましょう。
```
cp PourWiki/tmpls/empty_page.html ./index.html
```

###インストールの確認
これまでの設定が正しくできていれば、Webページのルートにアクセスすると、空のページが表示されるはずです。このページを編集するには右上の「ターゲット」アイコンを「Shift」を押しながらクリックしてください。

そうすると、認証画面が表示されますので、ユーザ名に**pouradmin**、パスワードに**hamamatsu**と入力します。これで編集画面に切り替わったら、インストール成功です。このままでは危険ですので、ユーザ名とパスワードを変更します。

###管理者パスワードの変更
管理者パスワードはテキストファイルで管理するか、PostgreSQLで管理するか選べます。またパスワードの保存形式も平文かMD5か選択可能です。MD5で保存する事をお勧めします。これらの設定はpourconf.php内にあります。初期設定ではテキストファイルに平文で保存しています。またパスワードファイルはprogs/.passwordです。.htaccessでこのパスワードファイルにはアクセスできないようにしていますが、これは大変危険な設定です。必ず安全なディレクトリにMD5形式でユーザ名とパスワードを管理してください。


ページのデザイン
-----------
###概要
最初のデザインをするにあたってtmplsディレクトリにあるempty_page.htmlというファイルが参考になるでしょう。このREADME通りにインストールしていれば、そのファイルがブラウザにも表示されているはずです。

###メインコンテンツ
contentsというid名のdivタグがメインコンテンツの表示エリアになります。
```html
<div class="contents"></div>
```

###パンくずリスト
ページ内にbreadcrumbというクラス名のolタグを設置するとパンくずリストが表示されます。
```html
<ol class="breadcrumb"></ol>
```

###Pourable Container
以下で説明するPourable Container記法に従ったdivタグやspanタグを配置すると、自動で指定されたPourableが表示されます。


Pourableの追加と削除
------------------
Global Pourableの追加は**docs/gobal/**にtxtあるいはphpファイルを置くだけです。txtファイルをGlobal Static Pourable、phpファイルをGlobal Dynamic Pourableと呼びます。PHPファイルを置いた時のみ、PourWikiとしては例外的にユーザの表示時にサーバ側でプログラムが実行されます。これらのファイルは置いた時点で有効になります。削除はファイルを消すだけですが、ファイルを消したとしても、HTMLページからの参照はそのままになっている事には注意してください。この場合、そのPourableを使っているページではエラーが発生します。

Directory Pourableの追加と削除は現時点では未実装です。

Page Pourableの追加は、当該ページのHTMLファイル内に**pour-p-識別子**というidを持つdivもしくはspanタグを記述し、編集画面へ行くと、それらのPourableに代入する文字列を入力する為のテキストフィールドが表示されます。削除はそのタグをページから消した後、編集画面へ移り**Pour**ボタンをクリックすると、HTMLからもwikiソースからも削除されます。


ページの追加と削除
--------------
ページの追加はmod_rewriteの設定ができていれば、存在しないページのURLにアクセスすると、「**There is currently no text in this page. You can edit this page.**」というメッセージが表示されます。そのページを編集する事によってページが新設されます。これはMediawikiのユーザにとってはお馴染みの方法だと思います。ページを追加するもっとも確実かつ簡単な方法は、あるページに存在しないページのリンクを加え、それをクリックして出てきたページで編集画面を出す事です。

ページの削除は編集画面の最下部にある***Deleteボタン***をクリックするだけです。Mediawikiのようにページの版管理や削除したページの復活機能等はありませんので気を付けてください。


ページの編集(基本編)
----------------
ページの編集は、(デフォルトでは)右上に表示されている「ターゲット」アイコンを[shift]を押しながらクリックします。認証の後、編集画面へ移ります。**Page Title**にそのページのタイトル、**Page Contents**にそのページの内容をPourWiki記法で入力します。PourWikiでは全てのHTMLタグの入力が許可されています。ただしユーザが入力したHTMLが正しいかどうかのチェックはしていませんので気を付けてください。

ページにPourables Containerが配置されている場合、そのページで特定のContainerを非表示にする事ができます。**Hidden Containers**欄に表示されたチェックボックスをチェックすると、そのContainerはそのページでは表示されません。

また、Local Pourables Containerが配置されていた場合、Container内に表示するコンテンツを入力するテキストフィールドも表示されます。Local PourablesはPage Contentsと同様にページ毎に異なる文章を記述できます。

またディレクトリにタイトルを割り当てる事ができます。これは、各ページの「パンくずリスト」に利用されます。PourWikiの「パンくずリスト」はディレクトリ階層に応じてコンテンツの階層が成り立っている事を前提としています。ルートディレクトリは「Top」や「Home」と名づけると良いでしょう。また、ルート直下にmemberというディレクトリを作り、その中にyamada.htmlという山田さんのプロファイルページを作った場合、memberディレクトリには「メンバープロファイル」、yamada.htmlには「山田」というタイトルを付けると、自動で「Top / メンバープロファイル / 山田」という「パンくずリスト」が生成されます。この時、「メンバープロファイル」をクリックすると、memberディレクトリのインデックスファイル(大抵index.htmlやindex.phpでしょう)が表示されます。

将来的にはディレクトリにはタイトル以外にpourableを設定する事を計画していますが、現時点では未実装です。


PourWiki記法
-----------
メインコンテンツは独自のWiki記法(Mediawikiに似せています)によって記述できます。

###見出し
```
==第一レベル見出し==
===第二レベル見出し===
====第三レベル見出し====
=====第四レベル見出し=====
======第五レベル見出し=====
```

###強調
```
'''太字で強調'''
''斜字で強調''
```

###リスト
```
リスト
*アメリカ
**ワシントンDC
*イギリス
**ロンドン
*ドイツ
**ベルリン

番号付きリスト
#朝ごはん
##パン
#昼ごはん
##牛丼
#夜ごはん
##カレーライス

見出し付きリスト
;神奈川県:横浜市が県庁所在地。シウマイの消費量日本一。
;静岡県:静岡市が県庁所在地。浜松市は宇都宮市と餃子の消費量日本一で毎年争っている。

異種入れ子のリスト
*関東式
*#背開き
*#串打ち
*#蒸す
*#焼く
*関西式
*#腹開き
*#串打ち
*#焼く
```

###テーブル
```
@-車名　　　　社名　　　　
@500      FIAT
@N-ONE    HONDA
```
見出し行を作りたい場合はその行は**@-**で始めます。また各列はタブあるいは4個以上のスペースを挟む事で列を区切る事が出来ます。この仕様はMediawiki記法とは異なりますが、タブ区切りでテーブルを標記できるのはExcel等からのコピペには便利でしょう。

###CONSTANT(定数)表示
```
{{定数名}}

{{プレフィクス:定数名}}
```
- プレフィクス付き定数
    - url:定数名
        - 値がURLである事を前提に、URLへのリンクタグが付与された定数名が表示されます
    - mail:定数名
        - 値がメールアドレスである事を前提に、メーラーが立ち上がるリンクタグが付与された定数名が表示されます

###リンク
```
[[path/file.html ココをクリックしてください]]
```


Pourable　Container記法
----------------------
Pourableをページに挿入する箇所は、divやspanタグに付与されたidで判断されます。idの記法は次の通りです。
- {プレフィックス}-{スコープ}-{識別子}
    - プレフィックス：(デフォルトで)pour
    - スコープ
        - c:Constant Pourable ※未実装※
        - G：Global Dynamic Pourable　(docs/gobal/*.php)
        - g：Global Static Pourable　(docs/global/*.txt)
        - d：Directory Pourable
        - p:Page Pourable

例えば以下のDIVタグには、画面表示時に自動的に**docs/global/getDate.php**の出力が埋め込まれます。
```html
<div id="pour-G-getDate"></div>
```
