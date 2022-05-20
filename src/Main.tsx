import { useEffect, useRef, useState } from 'react';
import DownloadBox from './DownloadBox';
import './App.css';

const Main = () => {
  const param = new URL(window.location.href).searchParams;
  const [inputValue, setInputValue] = useState(param.get('value') || '');
  const [toggleBox, setToggleBox] = useState(false);
  const [id, setId] = useState('');
  const [formatToggle, setFormatToggle] = useState('mp3');
  const [disabled, setDisabled] = useState(false);
  const [Blob, setBlob] = useState <Blob> ();
  const once = useRef(true);
  const converting = useRef(false);

  const handleConvert = async (): Promise <void> => {
    if(!inputValue) {
      alert("URLを入力してください");
      return;
    } else if(!/^http[s]?:\/\/www.youtube.com\/watch\?v=/.test(inputValue) && !/^http[s]?:\/\/youtu.be\//.test(inputValue)) {
      alert("不正なURLです。")
      return
    };
    const old = inputValue.split('v=')[1];
    const youtube_id = old ? old.substring(0, 11) : inputValue.split('/', 4)[3];
    setDisabled(true);
    setId(youtube_id);
    converting.current = true;
    await callConverter(youtube_id);
    converting.current = false;
  };

  const callConverter = async (tube_id: string): Promise <void> => {
    try {
      const res = await fetch("https://zackd-converter.herokuapp.com/youtube", {
        method: 'POST',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id: tube_id, type: formatToggle})
      });
      if(!res.ok) {
        throw new Error('ytdlまたはexecのエラー');
      };

      const blob = await res.blob();
      setBlob(blob);
      setToggleBox(true);
    } catch (err) {
      alert('処理を正常に完了できませんでした。\n以下の項目を確認してから再度お試しください。\n\n・動画時間が長すぎる\n・動画が削除/非公開にされている\n・ライブ配信中、またはプレミア公開中\n・URLに誤りがある');
      console.log(err);
      window.location.href = '/';
    };
  };

  useEffect(() => {
    if(inputValue && once.current) handleConvert();
    once.current = false;
  }, []);

  const contentsToggle = toggleBox ? 'none' : 'block';

  return (
    <main className='main'>
      <div className='contents'>
        <div className='content' style={{display: contentsToggle}}>
          <div className='description'>YouTubeの動画をMP3 or 4に変換</div>
          <div className='section'>
            <input 
              type="url" 
              onChange={event => setInputValue(event.target.value)} 
              value={inputValue}
              className='textInput'
              placeholder='YouTube link'
            /> 
            <select className="format" onChange={event => setFormatToggle(event.target.value)}>
              <option value="mp3">MP3</option>
              <option value="mp4">MP4</option>
            </select>
            <br />
            <button 
            className='changeButton' 
            onClick={() => handleConvert()} 
            disabled={disabled}
            style={{opacity: disabled ? '0.7' : '1'}}>変換</button>
          </div>
        </div>
        <div className='content' style={{display: contentsToggle}}>
          <div className='description'>動画ファイルをMP3に変換(準備中)</div>
        </div>
      </div>
      {converting.current ? (
        <div className='converting'>動画を{formatToggle === 'mp3' ? 'MP3' : 'MP4'}に変換しています...</div>
      ) : null}
      {toggleBox ? (
       <DownloadBox blob={Blob!} format={formatToggle} id={id}/> 
      ) : null}
    </main>
  )
};

export default Main;