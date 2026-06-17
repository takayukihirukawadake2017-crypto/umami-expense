import React, { useEffect, useState } from 'react';
import liff from '@line/liff';

const LIFF_ID = __LIFF_ID__;
const API_BASE = __API_BASE_URL__;

export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    initLiff();
  }, []);

  async function initLiff() {
    try {
      await liff.init({ liffId: LIFF_ID });

      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }

      const profile = await liff.getProfile();
      setUser(profile);
      setInitialized(true);

      // URLパラメータからトークンを取得（LINEログイン後のリダイレクト）
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        localStorage.setItem('auth_token', token);
        window.history.replaceState({}, '', '/');
      }
    } catch (err) {
      console.error('LIFF init error:', err);
      setError(err.message);
    }
  }

  if (error) {
    return <div style={{ padding: 20, color: 'red' }}>エラー: {error}</div>;
  }

  if (!initialized) {
    return <div style={{ padding: 20 }}>読み込み中...</div>;
  }

  return (
    <div style={{ padding: 20, maxWidth: 480, margin: '0 auto' }}>
      <h1>UMAMI経費集計</h1>
      {user && (
        <p>こんにちは、{user.displayName}さん</p>
      )}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        <a href="/expense/new" style={btnStyle}>新規経費申請</a>
        <a href="/expenses" style={btnStyle}>経費履歴</a>
      </nav>
    </div>
  );
}

const btnStyle = {
  display: 'block',
  padding: '12px 20px',
  background: '#06c755',
  color: 'white',
  textDecoration: 'none',
  borderRadius: 8,
  textAlign: 'center',
  fontWeight: 'bold'
};
