import { ChangeEvent, useEffect, useRef, useState } from 'react';
import DownloadBox from './DownloadBox';
import getId from 'get-youtube-id';
import '../css/App.css';

export default (): JSX.Element => {
  const param = new URL(window.location.href).searchParams;
  const [inputValue, setInputValue] = useState(param.get('value') || '');
  const [fileName, setFileName] = useState('');
  const [convertType, setConvertType] = useState('');
  const [msg, setMsg] = useState('');
  const [id, setId] = useState('');
  const [formatToggle, setFormatToggle] = useState(param.get('format') || 'mp3');
  const [quality, setQuality] = useState(param.get('qua') || 'best');
  const [isSelected, setIsSelected] = useState(false);
  const [toggleBox, setToggleBox] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [selectedFile, setSelectedFile] = useState <any> ();
  const [newBlob, setNewBlob] = useState <Blob> ();
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
        body: JSON.stringify({id: tube_id, type: formatToggle, quality})
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
      alert('処理を正常に完了できませんでした。\n以下の項目を確認してから再度お試しください。\n\n・長動画時間やMP4高画質指定が原因の変換タイムアウト => 10分ほど時間をおいてから再度同じ動画・クオリティ設定でお試しいただくと、事前に変換したファイルをダウンロードする準備から開始いたします。\n\n・動画が削除/非公開にされている\n・ライブ配信中、またはプレミア公開中\n・URLに誤りがある');
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
      alert('処理を正常に完了できませんでした。\n以下の項目を確認してから再度お試しください。\n\n・長時間の動画\n・無音声の動画\n・壊れたファイル\n・対応していないビデオフォーマット\n※対応フォーマット: MP4, AVI, MOV (quicktime)');
      window.location.href = '/';
    };
  };

  const handleFormat = (event: ChangeEvent<HTMLSelectElement>): void => {
    setFormatToggle(event.target.value.substring(0, 3));
    setQuality(event.target.value.substring(4));
  };

  const WakeyWakey = (): void => {
    fetch('https://zackd-converter.herokuapp.com');
  };

  useEffect(() => {
    if(inputValue && formatToggle && quality && once.current) {
      handleConvert();
    } else if(!inputValue && once.current) {
      WakeyWakey();
    };
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
            <select className="format" onChange={event => handleFormat(event)} value={`${formatToggle} ${quality}`}>
              <option value="mp3 normal">MP3 中音質</option>
              <option value="mp3 best">MP3 高音質</option>
              <option value="mp4 normal">MP4 中画質</option>
              <option value="mp4 best">MP4 高画質 (変換時間やファイルが膨大なサイズになることを予めご了承ください)</option>
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
       <DownloadBox type={convertType} blob={newBlob!} id={id} format={formatToggle} fileName={fileName}/> 
      ) : null}
    </main>
  )
};