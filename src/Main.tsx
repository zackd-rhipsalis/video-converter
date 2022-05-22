import { ChangeEvent, useEffect, useRef, useState } from 'react';
import DownloadBox from './DownloadBox';
import getId from 'get-youtube-id';
import './App.css';

const Main = () => {
  const param = new URL(window.location.href).searchParams;
  const [inputValue, setInputValue] = useState(param.get('value') || '');
  const [selectedFile, setSelectedFile] = useState <any> ();
  const [isSelected, setIsSelected] = useState(false);
  const [fileName, setFileName] = useState('');
  const [toggleBox, setToggleBox] = useState(false);
  const [convertType, setConvertType] = useState('');
  const [id, setId] = useState('');
  const [formatToggle, setFormatToggle] = useState(param.get('format') === 'mp3' || param.get('format') === 'mp4' ? param.get('format') : 'mp3');
  const [disabled, setDisabled] = useState(false);
  const [newBlob, setNewBlob] = useState <Blob> ();
  const [msg, setMsg] = useState('');
  const once = useRef(true);
  const converting = useRef(false);

  const handleConvert = async (): Promise <void> => {
    const get_id = getId(inputValue) || '';
    if(!inputValue) {
      alert("URLを入力してください");
      return;
    } else if(!get_id) {
      alert("不正なURLです。")
      return
    };
    setMsg('動画を' + ((formatToggle === 'mp3') ? 'MP3' : 'MP4') + 'に変換しています...');
    setDisabled(true);
    setId(get_id);
    converting.current = true;
    await callConverter(get_id);
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
      setMsg('ダウンロードの準備をしています...');
      const blob = await res.blob();
      setNewBlob(blob);
      setConvertType('youtube');
      setToggleBox(true);
    } catch (err) {
      alert('処理を正常に完了できませんでした。\n以下の項目を確認してから再度お試しください。\n\n・動画時間が長すぎる\n・動画が削除/非公開にされている\n・ライブ配信中、またはプレミア公開中\n・URLに誤りがある');
      console.log(err);
      window.location.href = '/';
    };
  };
  
  const handleUpload = (file: ChangeEvent<HTMLInputElement>): void => {
    if(!file.target.files![0].type.match(/video/)) {
      alert("動画ファイルをアップロードしてください");
      return;
    };
    setSelectedFile(file.target.files![0]);
    setFileName(file.target.files![0].name.substring(0, file.target.files![0].name.length - 4));
    setIsSelected(true);
  };
  
  const handleConvertFile = async (): Promise <void> => {
    setDisabled(true);
    setMsg('動画ファイルをMP3に変換しています...');
    converting.current = true;
    await callVideoFileConverter();
    converting.current = false;
  };

  const callVideoFileConverter = async (): Promise <void> => {
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      const res = await fetch('https://zackd-converter.herokuapp.com/convert', {
        method: 'POST',
        mode: 'cors',
        body: fd
      });

      if(!res.ok) {
        throw new Error('知名度の低いビデオフォーマットまたはexecのエラー');
      };

      setMsg('ダウンロードの準備をしています...');
      const blob = await res.blob();
      setConvertType('videoFile');
      setNewBlob(blob);
      setToggleBox(true);
    } catch (e) {
      console.log(e);
      alert('処理を正常に完了できませんでした。\n以下の項目を確認してから再度お試しください。\n\n・動画時間が長すぎる\n対応していないビデオフォーマット\n※対応フォーマット: MP4, AVI, MOV, MPEG2')
    };
  };

  useEffect(() => {
    if(inputValue && once.current) handleConvert();
    once.current = false;
  }, []);

  const contentsToggle = toggleBox ? 'none' : 'block';
  const fileUploadToggle = isSelected ? 'none' : 'inilne-block';
  const mainHeight = toggleBox && convertType === 'videoFile' ? '21rem' : '37rem';

  return (
    <main className='main' style={{height: mainHeight}}>
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
            <select className="format" onChange={event => setFormatToggle(event.target.value)} value={formatToggle!}>
              <option value="mp3">MP3</option>
              <option value="mp4">MP4</option>
            </select>
            <br />
            <button 
            className='changeButton' 
            onClick={() => handleConvert()} 
            disabled={disabled}
            style={{opacity: disabled ? '0.5' : '1'}}>変換</button>
          </div>
        </div>
        <div className='content' style={{display: contentsToggle}}>
          <div className='description'>動画ファイルをMP3に変換</div>
          <div className='section'>
            <label className='label' style={{display: fileUploadToggle, opacity: disabled ? '0.5' : '1'}}>
              <input 
                type="file"
                disabled={disabled}
                onChange={ event => handleUpload(event)}
                className='file-upload'
              /> アップロード
            </label>
            {isSelected ? (
              <>
                <div className='selected'>{navigator.userAgent.match(/iPhone|Android.+Mobile/) && selectedFile.name.length > 10 ? selectedFile.name.substring(0, 10) : selectedFile.name.substring(0, 30)}</div>
                <div className='selected'>{selectedFile.type}</div>
                <button
                  onClick={() => handleConvertFile()}
                  disabled={disabled}
                  className='changeButton fileButton'
                  style={{opacity: disabled ? '0.5' : '1'}}>変換</button>
              </>
            ) : null}
          </div>
        </div>
      </div>
      {converting.current ? (
        <div className='converting'>{msg}</div>
      ) : null}
      {toggleBox ? (
       <DownloadBox type={convertType} blob={newBlob!} id={id} format={formatToggle!} fileName={fileName}/> 
      ) : null}
    </main>
  )
};

export default Main;