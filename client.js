
(function (global) {
  var ChatWork = (function() {
    
    function ChatWork(config)
    {
      this.base_url = 'https://api.chatwork.com/v2';
      this.headers  = {'X-ChatWorkToken': config.token};  
    };
    
    /**
    * 自分のルーム一覧を取得
    */
    ChatWork.prototype.getRooms = function() {
      return this.get('/rooms');
    };
    
    /**
    * メッセージ送信
    */
    ChatWork.prototype.sendMessage = function(params) { 
      var post_data = {
        'body': params.body
      };
      if (params.self_unread !== undefined) {
        post_data.self_unread = params.self_unread;
      }
      return this.post('/rooms/'+ params.room_id +'/messages', post_data);
    };
    
    /**
    * マイチャットへのメッセージを送信
    */
    ChatWork.prototype.sendMessageToMyChat = function(message) {
      var mydata = this.get('/me');
      
      return this.sendMessage({
        'body': message,
        'room_id': mydata.room_id
      });
    };

    /**
     * 指定したチャットのメッセージを取得
     */
    ChatWork.prototype.getMessages = function(room_id) {
      return this.get('/rooms/' + room_id + '/messages');
    };
    
    /**
    * タスク追加
    */
    ChatWork.prototype.sendTask = function(params) {
      var to_ids = params.to_id_list.join(',');
      var post_data = {
        'body': params.body,
        'to_ids': to_ids,
        'limit': (new Number(params.limit)).toFixed() // 指数表記で来ることがあるので、intにする
      };
      
      return this.post('/rooms/'+ params.room_id +'/tasks', post_data);
    };
    
    /**
     * 指定したチャットのタスク一覧を取得
     */
    ChatWork.prototype.getRoomTasks = function(room_id, params) {
      return this.get('/rooms/' + room_id + '/tasks', params);
    };
    
    /**
    * 自分のタスク一覧を取得
    */
    ChatWork.prototype.getMyTasks = function(params) {
      return this.get('/my/tasks', params);
    };

    /*** 以下からカスタマイズ ***/

    /**
    * チャットの情報を取得する
    */
    ChatWork.prototype.getRoomInfo = function(params) {
      return this.get("/rooms/" + params.room_id);
    };
    
    /**
    * チャットの情報を変更する
    */
    ChatWork.prototype.changeRoomInfo = function(params) {
      return this.put("/rooms/" + params.room_id, params.body);
    };

    /**
    * チャットを退席/削除する
    */
    ChatWork.prototype.deleteRoom = function(params) {
      return this.delete("/rooms/" + params.room_id, params.body);
    };

    /**
    * チャットのファイル一覧を取得する
    */
    ChatWork.prototype.getFileList = function(params) {
      return this.get("/rooms/" + params.room_id + "/files", params.body);
    };

    /**
    * チャットにファイルをアップロードする
    */
    ChatWork.prototype.uploadFile = function(params) {
      return this.post('/rooms/'+ params.room_id + "/files", params.payload);
    };
    
    
    ChatWork.prototype._sendRequest = function(params)
    {
      var url = this.base_url + params.path;
      var options = {
        'method': params.method,
        'headers': this.headers,
        'payload': params.payload || {}
      };
      result = UrlFetchApp.fetch(url, options);
    
      // リクエストに成功していたら結果を解析して返す
      if (result.getResponseCode() == 200) {
        return JSON.parse(result.getContentText())
      }
    
      return false;
    };
                  
    ChatWork.prototype.post = function(endpoint, post_data) {
      return this._sendRequest({
        'method': 'post',
        'path': endpoint,
        'payload': post_data
      });
    };
  
    ChatWork.prototype.put = function (endpoint, put_data) {
      put_data = put_data || {};

      var path = endpoint;

      // put_dataがあればクエリーを生成する
      // かなり簡易的なので必要に応じて拡張する
      var query_string_list = [];
      for (var key in put_data) {
          query_string_list.push(
              encodeURIComponent(key) + "=" + encodeURIComponent(put_data[key])
          );
      }

      if (query_string_list.length > 0) {
          path += "?" + query_string_list.join("&");
      }
      
      return this._sendRequest({
        'method': "put",
        'path': path,
      });
    };
  
    ChatWork.prototype.get = function(endpoint, get_data) { 
      get_data = get_data || {};
      
      var path = endpoint;
    
      // get_dataがあればクエリーを生成する
      // かなり簡易的なので必要に応じて拡張する
      var query_string_list = [];
      for (var key in get_data) {
        query_string_list.push(encodeURIComponent(key) + '=' + encodeURIComponent(get_data[key]));
      }
      
      if (query_string_list.length > 0) {
        path += '?' + query_string_list.join('&'); 
      }
      
      return this._sendRequest({
        'method': 'get',
        'path': path
      });
    };

    ChatWork.prototype.delete = function(endpoint, delete_data) {
      delete_data = delete_data || {};

      var path = endpoint;

      // delete_dataがあればクエリーを生成する
      // かなり簡易的なので必要に応じて拡張する
      var query_string_list = [];
      for (var key in delete_data) {
        query_string_list.push(
            encodeURIComponent(key) + "=" + encodeURIComponent(delete_data[key])
        );
      }

      if (query_string_list.length > 0) {
          path += "?" + query_string_list.join("&");
      }

      return this._sendRequest({
        'method': 'delete',
        'path': path
      });
    };
  
    return ChatWork;
  })();

  global.ChatWork = ChatWork;

})(this);


/**
 * ChatWorkClientの作成
 *
 * <h3>利用例</h3>
 * <pre>
 * var cw = ChatWorkClient.factory({token: xxx});
 * cw.sendMessage({room_id: xx, body: xx});
 * </pre>
 * @param {assoc} config
 */
function factory(config) {
  return new ChatWork(config);
};
