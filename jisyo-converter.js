/*
 * Author: 奈幾乃(uakms)
 * Created: 2024-11-28
 * Revised: 2024-11-28
 */

// テキストエリアのデータを内部辞書 dicarr を作成する
function dictCreator(jisyo) {
    var dicarr = [];
    var buf = jisyo;
    // バッファを一行ずつ処理していく
    var lines = buf.split("\n");
    for (var i = 0; i < lines.length; i++) {
        // コメント行は無視
        if (lines[i].match(/^;.*|^$|^[\t\n\f\r ]+$/)) {
            // コメント行だった場合はなにもしない
        } else {
            // 対象行への処理をする
            // mainbody から備考を削除して「ほげ", "ふが」の形にする mainelems
            var mainbody = gsub(lines[i], /\s+;.*/, "");
            var mainelems = gsub(mainbody, / \//, "\", \"")

            // 備考から [ほげ|ふが|ぴよ] 等を抽出する
            var suplbody = lines[i].match(/\[(.*)\]/);
            // 備考があるなら ["ほげ", "ふが"] の形にする suplelems
            if (suplbody != null) {
                suplelems = "[\"" + gsub(suplbody[1], "|", "\", \"") + "\"]";
            } else {
            // 備考がないなら [] の形にする suplelems
                suplelems = "[]";
            }
            // ["ほげ", "ふが", ["ぴよ"]] の形にして dicarr に追加していく
            var elems = "[\"" + mainelems + "\", " + suplelems + "]"
            dicarr.push(elems);
        }
    }
    return dicarr;
}

// 内部辞書とプレフィクスを引数に取って JSON 形式のデータを返す
function outputJsonDict(dictarr, pref) {
    var tmpbuf = "";
    tmpbuf +=  pref + " =\n[\n";
    for (var i = 0; i < dictarr.length - 1; i++) {
        tmpbuf += "  " + dictarr[i] + ",\n";
    }
    tmpbuf += "  " + dictarr[dictarr.length - 1] + "\n";
    tmpbuf += "]\n";
    return tmpbuf;
}

// replaceAll のない古い規格(ブラウザ)用の部品
function gsub(str, key, val) {
    return str.split(key).join(val);
}

// ローカルのファイルを読み込む部品
function readFileInLocal() {
    document.getElementById("ifile")
        .addEventListener(
            "change",
            function(evt) {
                var file = evt.target.files[0];
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = function(e) {
                    document.dictconv.bef.value = reader.result;
                }},
            false);
}

// html ファイルのテキストエリアからデータを読み込んで JSON 形式に変換
function convertToJson() {
    // 「ファイルから読み込む」でファイルが選択されていれば
    // "hoge-jisyo" の "hoge" の部分がプレフィクスに使われる
    var iFileName = document.getElementById("ifile").files[0].name;
    var pref = iFileName.match(/(.*)-jisyo/)[1];

    var str = document.dictconv.bef.value;
    var dict = dictCreator(str);
    var str = outputJsonDict(dict, "var " + pref + "Array");
    document.dictconv.aft.value = str;
}

// 変換した内容をファイルに保存する
function saveJsonDict() {
    document.getElementById("ofile")
        .addEventListener(
            "click",
            function () {
                var jsonDict = document.dictconv.aft.value;
                var blob = new Blob([jsonDict], { type: "application/json" });

                var dlAnchor = document.createElement("a");
                dlAnchor.href = URL.createObjectURL(blob);

                var iFileName = document.getElementById("ifile").files[0].name;
                var pref = iFileName.match(/(.*)-jisyo/)[1];
                dlAnchor.download = "dic-" + pref + ".js";

                dlAnchor.click();
                URL.revokeObjectURL(dlAnchor.href);
            },
            false);
}
