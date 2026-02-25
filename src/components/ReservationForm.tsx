import React, { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';

interface FormData {
  name: string;
  email: string;
  date: string;
  // 他の必要なフィールドを追加
}

const ReservationForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(() => {
    const savedData = localStorage.getItem('reservationFormData');
    return savedData ? JSON.parse(savedData) : {
      name: '',
      email: '',
      date: '',
      // 他のフィールドの初期値
    };
  });

  useEffect(() => {
    localStorage.setItem('reservationFormData', JSON.stringify(formData));
  }, [formData]);

  const updateServerData = async (name: string, value: string) => {
    try {
      await axios.post('/api/update-reservation', { [name]: value });
      console.log(`サーバーデータを更新しました: ${name} = ${value}`);
    } catch (error) {
      console.error('サーバーの更新中にエラーが発生しました:', error);
      // ここでユーザーにエラーを通知することもできます
    }
  };

  const debouncedUpdateServerData = useCallback(
    debounce(updateServerData, 300),
    []
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    debouncedUpdateServerData(name, value);
  }, [debouncedUpdateServerData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post('/api/submit-reservation', formData);
      console.log('予約が成功しました');
      // 成功時の処理（例：フォームのクリア、成功メッセージの表示など）
      localStorage.removeItem('reservationFormData'); // フォーム送信後にローカルストレージをクリア
      setFormData({ name: '', email: '', date: '' });
    } catch (error) {
      console.error('予約の送信中にエラーが発生しました:', error);
      // エラー時の処理
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">名前:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label htmlFor="email">メールアドレス:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label htmlFor="date">日付:</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
        />
      </div>
      <button type="submit">予約する</button>
    </form>
  );
};

export default ReservationForm;
