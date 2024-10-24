exports.handler = async (event) => {
    // リクエストボディからデータを取得
    const data = JSON.parse(event.body);
  
    // ここでデータを保存する処理を実装
    // 例: ファイルに書き込む、データベースに保存する、など
  
    console.log('Received data:', data);
  
    try {
      // 仮の保存処理（実際にはデータを永続化する処理を実装する必要があります）
      // この例では単にログに出力するだけです
      console.log('Data saved successfully:', data);
  
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Data saved successfully' })
      };
    } catch (error) {
      console.error('Error saving data:', error);
  
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to save data' })
      };
    }
  };
