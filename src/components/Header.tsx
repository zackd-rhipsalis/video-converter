import logo from '../assets/logo.png';
import '../css/App.css';

const Header = (): JSX.Element => (
    <header className='header'>
      <img src={logo} alt="logo" className='header-logo'/>
      <div className='header-text' onClick={() => window.location.href = '/'}>VIDEO CONVERTER</div>
      <a href="https://liff.line.me/1645278921-kWRPP32q/?accountId=922lmgql" className='line' target='_blank'><div>LINE</div></a>
    </header>
);

export default Header;