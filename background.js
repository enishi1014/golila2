function replaceAuxiliaryVerbsWithUho() {
  if (typeof kuromoji === 'undefined') {
    console.error('kuromoji.js が正しく読み込まれていません');
    return;
  }

  kuromoji.builder({ dicPath: chrome.runtime.getURL('dict/') }).build(function (err, tokenizer) {
    if (err) {
      console.error('形態素解析の初期化に失敗しました:', err);
      return;
    }

    function getTextNodesIn(elem) {
      let textNodes = [];
      const walker = document.createTreeWalker(elem, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while (node = walker.nextNode()) {
        textNodes.push(node);
      }
      return textNodes;
    }


    const textNodes = getTextNodesIn(document.body);

    // 辞書
    // 一人称→あっし
    function norn_first_asshi(surface_form){
      const norn_first = ['私', '俺', '僕', 'わたし',  'わたくし', 'おれ', 'ぼく', 'ワタシ', 'オレ', 'ボク', 'オラ'];
      if (norn_first.includes(surface_form)) {
        return 1;
      }
    }
    // 二人称→おめえ、おめえさん、てめえ
    function norn_second_omee(surface_form){
      const norn_second = ['君', 'あなた', 'きみ', 'おまえ', 'アナタ', 'キミ', 'オマエ'];
      if (norn_second.includes(surface_form)) {
        return 1;
      }
    }

    textNodes.forEach(textNode => {
      const originalText = textNode.nodeValue.trim();
      if (originalText.length > 0) {
        const tokens = tokenizer.tokenize(originalText);

        tokens.forEach(token => {
          // console.log(token);  
        });

        var newtokens = [];
        for (let i = 0; i < tokens.length; i++) {
          console.log(tokens[i]);
          if (tokens[i] === undefined || tokens[i+1] === undefined){
            newtokens.push(tokens[i].surface_form);
            continue;
          }else if (norn_first_asshi(tokens[i].surface_form)){
            // 一人称→あっし
            newtokens.push('あっし');
          }else if (norn_second_omee(tokens[i].surface_form)){
            // 二人称→おめえ、おめえさん、てめえ
            newtokens.push('おめえ');
          }else if (tokens[i].pos_detail_3 === "姓" && tokens[i+1].pos_detail_1 === "接尾"){
            // 三人称→◯◯の旦那
            newtokens.push(tokens[i].surface_form);
            newtokens.push('の');
            newtokens.push('旦那');
            i += 1;
          }else if (tokens[i].surface_form === 'て' && tokens[i].pos_detail_1 === '接続助詞'){
            // 〜ています→〜とります
            if (tokens[i+1].basic_form === 'ます' && tokens[i+1].pos === '助動詞'){
              newtokens.push('と');
              newtokens.push('り');
              if (tokens[i+1].surface_form === 'ます' && tokens[i+1].pos === '助動詞'){
                newtokens.push('やす');
              }else if (tokens[i+1].surface_form === 'まし' && tokens[i+1].pos === '助動詞'){
                // 〜ました→〜やした
                newtokens.push('やし');
              }else if (tokens[i+1].surface_form === 'ませ' && tokens[i+1].pos === '助動詞'){
                // 〜ません→〜やせん
                newtokens.push('やせ');
              } else {
                newtokens.push(tokens[i+1].surface_form);
              }
              i += 1;
            } else if (tokens[i+1].surface_form === 'い' && tokens[i+1].pos === '動詞'){
              if (tokens[i+2].basic_form === 'ます' && tokens[i+2].pos === '助動詞'){
                newtokens.push('と');
                newtokens.push('り');
                if (tokens[i+2].surface_form === 'ます' && tokens[i+2].pos === '助動詞'){
                  newtokens.push('やす');
                }else if (tokens[i+2].surface_form === 'まし' && tokens[i+2].pos === '助動詞'){
                  // 〜ました→〜やした
                  newtokens.push('やし');
                }else if (tokens[i+2].surface_form === 'ませ' && tokens[i+2].pos === '助動詞'){
                  // 〜ません→〜やせん
                  newtokens.push('やせ');
                } else {
                  newtokens.push(tokens[i+2].surface_form);
                }
                i += 2;
              }else {
                newtokens.push(tokens[i].surface_form);
                newtokens.push(tokens[i+1].surface_form);
                i += 1;
              }
            }else if (tokens[i+1].surface_form === 'しまう' && tokens[i+1].pos === '動詞'){
              // 〜てしまう、〜ちゃう→〜ちまう、〜やがる
              // // 動詞かつ　基本形が「ちゃう」→「ちゃ」を「ちま」に置き換え
              // // 助詞「て」＋（動詞かつ　基本形が「しまう」）→「しま」を「ちま」に置き換え
              newtokens.push('ちまう');
              i += 1;
            }else if (tokens[i+1].surface_form === 'しま' && tokens[i+1].pos === '動詞'){
              newtokens.push("ちま");
              i += 1;
            }else{
              newtokens.push(tokens[i].surface_form);
            }
          }else if (tokens[i].pos === '動詞' && tokens[i+1].surface_form === 'ちゃっ' && tokens[i+1].pos === '動詞'){
            newtokens.push(tokens[i].surface_form);
            newtokens.push("ちまっ");
            i += 1;
          }else if (tokens[i].pos === '動詞' && tokens[i+1].surface_form === 'ちゃ' && tokens[i+1].pos === '動詞'){
            newtokens.push(tokens[i].surface_form);
            newtokens.push("ちま");
            i += 1;
          }else if (tokens[i].pos === '動詞' && tokens[i+1].surface_form === 'ちゃい' && tokens[i+1].pos === '動詞'){
            newtokens.push(tokens[i].surface_form);
            newtokens.push("ちまい");
            i += 1;
          }else if (tokens[i].surface_form === 'で' && tokens[i].pos_detail_1 === '接続助詞'){
            // 〜でいます→〜どります
            if (tokens[i+1].basic_form === 'ます' && tokens[i+1].pos === '助動詞'){
              newtokens.push('ど');
              newtokens.push('り');
              if (tokens[i+1].surface_form === 'ます' && tokens[i+1].pos === '助動詞'){
                newtokens.push('やす');
              }else if (tokens[i+1].surface_form === 'まし' && tokens[i+1].pos === '助動詞'){
                // 〜ました→〜やした
                newtokens.push('やし');
              }else if (tokens[i+1].surface_form === 'ませ' && tokens[i+1].pos === '助動詞'){
                // 〜ません→〜やせん
                newtokens.push('やせ');
              } else {
                newtokens.push(tokens[i+1].surface_form);
              }
              i += 1;
            } else if (tokens[i+1].surface_form === 'い' && tokens[i+1].pos === '動詞'){
              if (tokens[i+2].basic_form === 'ます' && tokens[i+2].pos === '助動詞'){
                newtokens.push('ど');
                newtokens.push('り');
                if (tokens[i+2].surface_form === 'ます' && tokens[i+2].pos === '助動詞'){
                  newtokens.push('やす');
                }else if (tokens[i+2].surface_form === 'まし' && tokens[i+2].pos === '助動詞'){
                  // 〜ました→〜やした
                  newtokens.push('やし');
                }else if (tokens[i+2].surface_form === 'ませ' && tokens[i+2].pos === '助動詞'){
                  // 〜ません→〜やせん
                  newtokens.push('やせ');
                } else {
                  newtokens.push(tokens[i+2].surface_form);
                }
                i += 2;
              } else {
                newtokens.push(tokens[i].surface_form);
                newtokens.push(tokens[i+1].surface_form);
                i += 1;
              }
            }else{
              newtokens.push(tokens[i].surface_form);
            }
          }else if (tokens[i].surface_form === 'ます' && tokens[i].pos === '助動詞'){
            // 〜ます→〜やす
            newtokens.push('やす');
          }else if (tokens[i].surface_form === 'まし' && tokens[i].pos === '助動詞'){
            // 〜ました→〜やした
            newtokens.push('やし');
          }else if (tokens[i].surface_form === 'ませ' && tokens[i].pos === '助動詞'){
            // 〜ません→〜やせん
            newtokens.push('やせ');
          }else if ((tokens[i].surface_form === 'ない' || tokens[i].reading === 'ナイ') && (tokens[i].pos === '助動詞' || tokens[i].pos === '形容詞')){
            // 〜ない→〜ねぇ
            newtokens.push('ねぇ');
          }else if (tokens[i].surface_form === 'ください' || tokens[i].reading === 'クダサイ'){
            // 〜ください→〜くだせぇ
            // // 動詞かつ読み方が「クダサイ」→「くだせぇ」に置き換え
            newtokens.push('くだせぇ');
          }else if (tokens[i].surface_form === 'という' && tokens[i].pos === '助詞') {
            // 助詞「という」→「ってぇ」
            newtokens.push('ってぇ');
          } else if (tokens[i].surface_form === 'と' && tokens[i].pos === '助詞' && tokens[i + 1].surface_form === 'の' && tokens[i + 1].pos === '助詞') {
            // 引用の助詞「と」＋助詞「の」→「ってぇ」
            newtokens.push('っ');
            newtokens.push('てぇ');
            i += 1;
          } else if (tokens[i].surface_form === 'を' && tokens[i].pos === '助詞' && tokens[i + 1].surface_form === '、' && tokens[i + 1].pos === '記号') {
            // 助詞「を」＋記号「、」→「をだな、」
            newtokens.push('をだな');
            newtokens.push('、');
            i += 1;
          } else if (tokens[i].pos === '動詞' && tokens[i + 1].surface_form === 'たい' && tokens[i + 1].pos === '助動詞') {
            // 動詞＋助動詞「たい」→動詞＋「てぇ」
            newtokens.push(tokens[i].surface_form);
            newtokens.push('てぇ');
            i += 1;
          }else if (tokens[i].surface_form === 'ござい' && tokens[i].pos === '助動詞') {
            // 助動詞「ござい」→「ごぜぇ」
            newtokens.push('ごぜぇ');
          } else if (tokens[i].surface_form === 'たく' && tokens[i].pos === '助動詞' && tokens[i + 1].surface_form === 'ない' && tokens[i + 1].pos === '助動詞') {
            // 助動詞「たく」＋助動詞「ない」→「たかぁねぇ」
            newtokens.push('たかぁ');
            newtokens.push('ねぇ');
            i += 1;
          } else if (tokens[i].surface_form === 'ござい' && tokens[i].pos === '助動詞') {
            // 助動詞「ござい」→「ごぜぇ」
            newtokens.push('ごぜぇ');
          } else if (tokens[i].surface_form === 'たく' && tokens[i].pos === '助動詞' && tokens[i + 1].surface_form === 'ない' && tokens[i + 1].pos === '助動詞') {
            // 助動詞「たく」＋助動詞「ない」→「たかぁねぇ」
            newtokens.push('たかぁ');
            newtokens.push('ねぇ');
            i += 1;
          } else if (tokens[i].pos === '名詞' && 
                     (tokens[i + 1].surface_form === 'だ' || tokens[i + 1].surface_form === 'です') && 
                     tokens[i + 1].pos === '助動詞'
                    ) {
            // 名詞 + 助動詞「だ」「です」→ 名詞 + 「でい」
            if (tokens[i + 2] && (tokens[i + 2].surface_form === '！' || tokens[i + 2].surface_form === '。' || tokens[i + 2].surface_form === '\n')) {
              newtokens.push(tokens[i].surface_form); 
              newtokens.push('でい');
              i += 1; 
            } else if (tokens[i + 2] && tokens[i + 2].pos === '終助詞') {
              // 助動詞「だ」「です」＋終助詞の場合も「でい」に変換
              newtokens.push(tokens[i].surface_form);
              newtokens.push('でい');
              i += 2;  
            } else {
              newtokens.push(tokens[i].surface_form);
              newtokens.push(tokens[i + 1].surface_form);
              i += 1;
            }
          }else if (tokens[i].pos === "名詞" && (tokens[i + 1].surface_form === '！' || tokens[i + 1].surface_form === '。' || tokens[i + 1].surface_form === '\n')){
            // 文末かつ（名詞）→（名詞）でい
            newtokens.push(tokens[i].surface_form);
            newtokens.push('でい');
          }else{
            newtokens.push(tokens[i].surface_form);
          }
        }

        // const analyzedText = tokens.map(token => {
        //   if  (token.pos === '名詞'){
        //     console.log('名詞を発見しました');
        //     // return `<span style="border: 1px solid #000; margin: 2px; padding: 2px;">
        //     //           te
        //     //           <small>(${token.pos})</small>
        //     //         </span>`;
        //     if (omatsuri_dec(token.surface_form)){
        //       return `あっし`;
        //     }else{
        //       // return `${token.surface_form}`;
        //       return `te`;
        //     }
        //   } else {
        //     // return `<span style="border: 1px solid #000; margin: 2px; padding: 2px;">
        //     //           ${token.surface_form}
        //     //           <small>(${token.pos})</small>
        //     //         </span>`;
        //     return `${token.surface_form}`;
        //   }
        // }).join('');
        
        const spanWrapper = document.createElement('span');
        // spanWrapper.innerHTML = analyzedText;
        spanWrapper.innerHTML = newtokens.join('');
        textNode.parentNode.replaceChild(spanWrapper, textNode);
      }
    });
  });
}


function injectScript(tabId, file) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: [file]
    }, (results) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(results);
      }
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'matsuri',
    title: 'お祭り変換！',
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'matsuri') {
    // chrome.scripting.executeScript({
    //   target: { tabId: tab.id },
    //   func: replaceAuxiliaryVerbsWithUho,
    // });

    const tabId = tab.id;
    injectScript(tabId, 'kuromoji.js').then(() => {

      return chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: replaceAuxiliaryVerbsWithUho
      });
    }).catch(err => {
      console.error('スクリプトのインジェクト中にエラーが発生しました:', err);
    });
  }
});