import '../css/App.css';
import errImg from '../assets/notfound.png';
import fileDownload from 'js-file-download';
import { useEffect, useRef, useState } from 'react';

type YouTube = {
  readonly type: 'youtube';
  readonly blob: Blob;
  readonly format: 'mp3' | 'mp4';
  readonly id: string;
}

type VideoFile = {
  readonly type: 'videoFile';
  readonly blob: Blob;
  readonly fileName: string;
}

type DownloadBoxProps = YouTube | VideoFile;

type Infors = {
  readonly title: string;
  readonly time: string;
  readonly thumbnail: string;
}

const DownloadBox = (props: DownloadBoxProps): JSX.Element => {

  const [infors, setInfors] = useState({} as Infors);
  const once = useRef(true);

  const handleDownload = (): void => {
    (props.type === 'youtube') ? fileDownload(props.blob, `${infors?.title}.${props.format}`)
    : fileDownload(props.blob, `${props.fileName}.mp3`);
  }

  useEffect(() => {
    if(once.current && props.type === 'youtube') {
      (async () => {
        const infos = await videoInfo();
        setInfors(infos);
      })();
    }
    once.current = false;
  }, []);

  const videoInfo = async (): Promise <Infors> => {
    try {

      const isYoutube = (arg: YouTube | VideoFile): arg is YouTube => (arg as YouTube).id !== undefined;

      if (isYoutube(props)) {
        const res = await fetch("https://zackd-converter.herokuapp.com/info?id=" + props.id);
        if (!res.ok) throw new Error('失敗');

        const infors = await res.json();
        return infors;
      } else throw new SyntaxError('例外');

    } catch (err) {
      const title = (err as Error | SyntaxError).message === '失敗' ? 'エラー: リソースの読み込みに失敗しました'
      : 'エラー: 処理に例外が発生しました';

      return {title, time: 'null :(', thumbnail: errImg};
    }
  }

  return (
    <>
      <div className='download-box content'>
        <div className='description'>ダウンロードする準備が整いました</div>
        <div className='section'>
          <button className="downloadButton" onClick={() => handleDownload()}>Download</button>
          <button className="downloadButton" onClick={() => window.location.href = '/'}>TOPへ戻る</button>
        </div>
      </div>
      {props.type === 'youtube' ? (
        <div className='infors'>
          <div className='cont'>動画タイトル: {navigator.userAgent.match(/iPhone|Android.+Mobile/) && infors.title && infors.title.length > 25 ? infors.title.substring(0, 25) + '...' : infors.title}</div>
          <div className='cont'>動画時間: {infors.time}</div>
          <a href={`https://www.youtube.com/watch?v=${props.id}`} target="_blank"><img src={infors.thumbnail} alt="you're small fish" className='thumb'/></a>
        </div>
      ) : null}
    </>
  );
}

export default DownloadBox;