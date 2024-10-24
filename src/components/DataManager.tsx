import React, { useState, useEffect } from 'react';
import styles from './DataManager.module.css';

interface Data {
  id: number;
  name: string;
}

const DataManager: React.FC = () => {
  const [data, setData] = useState<Data[]>([]);
  const [newName, setNewName] = useState<string>('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>('');

  useEffect(() => {
    const savedData = localStorage.getItem('dataManagerItems');
    if (savedData) {
      setData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dataManagerItems', JSON.stringify(data));
  }, [data]);

  const handleAddItem = () => {
    if (newName.trim() !== '') {
      const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
      setData([...data, { id: newId, name: newName }]);
      setNewName('');
    }
  };

  const handleEditItem = (id: number, name: string) => {
    setEditId(id);
    setEditName(name);
  };

  const handleUpdateItem = () => {
    if (editId !== null && editName.trim() !== '') {
      setData(data.map(item => 
        item.id === editId ? { ...item, name: editName } : item
      ));
      setEditId(null);
      // setEditName(''); // この行を削除
    }
  };

  const handleDeleteItem = (id: number) => {
    setData(data.filter(item => item.id !== id));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>データマネージャー</h2>
      <ul className={styles.list}>
        {data.map((item) => (
          <li key={item.id} className={styles.listItem}>
            {editId === item.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={styles.input}
                />
                <button onClick={handleUpdateItem} className={styles.button}>更新</button>
              </>
            ) : (
              <>
                <span>{item.name}</span>
                <div>
                  <button onClick={() => handleEditItem(item.id, item.name)} className={`${styles.button} ${styles.editButton}`}>編集</button>
                  <button onClick={() => handleDeleteItem(item.id)} className={`${styles.button} ${styles.deleteButton}`}>削除</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="新しいアイテム名"
        className={styles.input}
      />
      <button onClick={handleAddItem} className={styles.button}>追加</button>
    </div>
  );
};

export default DataManager;
