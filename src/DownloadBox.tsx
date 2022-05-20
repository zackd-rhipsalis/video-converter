import './App.css';
import fileDownload from 'js-file-download';
import { useEffect, useRef, useState } from 'react';

type DownloadBoxProps = {
  blob: Blob;
  format: string;
  id: string;
};

type Infors = {
  title: string;
  time: string;
  thumbnail: string;
};

const DownloadBox = (props: DownloadBoxProps) => {
  const [infors, setInfors] = useState <Infors> ();
  const once = useRef(true);

  const handleDownload = (): void => fileDownload(props.blob, `${infors?.title}.${props.format}`);

  useEffect(() => {
    if(once.current) {
      (async () => {
        const infos = await videoInfo();
        setInfors(infos);
      })();
    };
    once.current = false;
  }, [])

  const videoInfo = async (): Promise <Infors> => {
    const res = await fetch("https://zackd-converter.herokuapp.com/info?id=" + props.id);
    const infors = await res.json();
    return infors;
  };

  return (
    <>
      <div className='download-box content'>
        <div className='description'>ダウンロードする準備が整いました</div>
        <div className='section'>
          <button className="downloadButton" onClick={() => handleDownload()}>Download</button>
          <button className="downloadButton" onClick={() => window.location.href = '/'}>TOPに戻る</button>
        </div>
      </div>
      <div className='infors'>
        <div className='cont'>動画タイトル: {navigator.userAgent.match(/iPhone|Android.+Mobile/) && infors?.title && infors.title.length > 25 ? infors?.title.substring(0, 25) + '...' : infors?.title}</div>
        <div className='cont'>動画時間: {infors?.time}</div>
        <a href={`https://www.youtube.com/watch?v=${props.id}`} target="_blank"><img src={infors?.thumbnail} alt="you're small fish" className='thumb'/></a>
      </div>
    </>
  );
};

export default DownloadBox;